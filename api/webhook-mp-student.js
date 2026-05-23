import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Mercado Pago envia a notificação no body ou na query
    const { action, data, type } = req.body || {};
    
    // Identificar ID e Type do evento
    const notificationType = type || req.query.type || req.query.topic;
    const paymentId = data?.id || req.query['data.id'] || (notificationType === 'payment' ? req.query.id : null);

    console.log(`[Webhook MP Student] Evento recebido - Tipo: ${notificationType}, ID: ${paymentId}, Ação: ${action}`);

    if (paymentId && (notificationType === 'payment' || action === 'payment.created' || action === 'payment.updated')) {
      const token = process.env.MP_STUDENT_ACCESS_TOKEN || 'APP_USR-989386315722115-052310-7107168e08120f173cc36d78050a88dc-2531472158';

      const client = new MercadoPagoConfig({
        accessToken: token,
      });

      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const cpfReference = paymentData.external_reference;
        console.log(`[Webhook MP Student] Pagamento aprovado para CPF: ${cpfReference}, Valor: ${paymentData.transaction_amount}`);

        if (cpfReference) {
          // Inicializa Supabase
          const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dospnbzzcjrmwpakldmy.supabase.co';
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3BuYnp6Y2pybXdwYWtsZG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI5NzMsImV4cCI6MjA4OTQ0ODk3M30.3M1V3OCoMtKCj_TPEv3sgiQ7rG7ZTuHF6lxHrNUQG6U';
          
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Buscar o aluno no Supabase.
          // Primeiro busca direta com o valor exato
          let { data: students, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .or(`cpf.eq.${cpfReference},cpf.eq.${cpfReference.replace(/\D/g, '')}`);

          // Se não encontrou por igualdade direta, busca todos e filtra no JS
          if ((!students || students.length === 0) && !fetchError) {
            const { data: allStudents } = await supabase
              .from('students')
              .select('*');
              
            if (allStudents) {
              const cleanRef = cpfReference.replace(/\D/g, '');
              students = allStudents.filter(s => s.cpf && s.cpf.replace(/\D/g, '') === cleanRef);
            }
          }

          if (students && students.length > 0) {
            const student = students[0];
            
            // Calcular a nova data de vencimento (next_due)
            const plan = (student.plan || 'Mensal').toLowerCase();
            let monthsToAdd = 1;
            if (plan.includes('semestral')) {
              monthsToAdd = 6;
            } else if (plan.includes('anual')) {
              monthsToAdd = 12;
            }

            const today = new Date();
            const nextDueDate = new Date(today.getFullYear(), today.getMonth() + monthsToAdd, today.getDate());
            const formattedNextDue = nextDueDate.toISOString().split('T')[0];
            const formattedLastPayment = today.toISOString().split('T')[0];

            console.log(`[Webhook MP Student] Atualizando aluno: ${student.name} (ID: ${student.id}) para pago. Próximo vencimento: ${formattedNextDue}`);

            const { error: updateError } = await supabase
              .from('students')
              .update({
                status: 'pago',
                last_payment: formattedLastPayment,
                next_due: formattedNextDue
              })
              .eq('id', student.id);

            if (updateError) {
              console.error('[Webhook MP Student] Erro ao atualizar aluno no Supabase:', updateError);
              return res.status(500).json({ error: updateError.message });
            }

            // Opcional: Enviar mensagem pelo WhatsApp Bridge local se configurado em settings
            try {
              const { data: settingData } = await supabase
                .from('settings')
                .select('*')
                .eq('key', 'local_bridge_url')
                .single();

              const bridgeUrl = settingData?.value || 'http://127.0.0.1:3005';
              const securityKey = process.env.VITE_BRIDGE_SECURITY_KEY || 'almeidajj_secure_k3y_77#2026';

              const phone = student.phone.replace(/\D/g, '');
              const message = `🥋 *Matrícula/Mensalidade Aprovada!*\n\nOlá, *${student.name}*!\nConfirmamos o recebimento do seu pagamento para o plano *${student.plan}*.\n\nSeu acesso está ativo e seu próximo vencimento é *${nextDueDate.toLocaleDateString('pt-BR')}*.\n\nNos vemos no tatame! Oss! 👊`;

              await fetch(`${bridgeUrl}/send-message`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': securityKey
                },
                body: JSON.stringify({
                  phone: `55${phone}`,
                  message: message
                })
              });
              console.log(`[Webhook MP Student] WhatsApp de confirmação de pagamento enviado com sucesso!`);
            } catch (err) {
              console.warn('[Webhook MP Student] Não foi possível enviar a notificação do WhatsApp:', err.message);
            }

            return res.status(200).json({ message: 'Success', student: student.name });
          } else {
            console.warn(`[Webhook MP Student] Aluno não encontrado para o CPF: ${cpfReference}`);
            return res.status(404).json({ error: 'Student not found' });
          }
        }
      }
    }

    return res.status(200).json({ message: 'Notification received' });
  } catch (error) {
    console.error('[Webhook MP Student] Erro no processamento do webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
