import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const mpToken = process.env.MP_STUDENT_ACCESS_TOKEN || 'APP_USR-989386315722115-052310-7107168e08120f173cc36d78050a88dc-2531472158';
const client = new MercadoPagoConfig({ accessToken: mpToken });
const preference = new Preference(client);

const getPlanDefault = (plan) => {
  if (plan === 'Mensal') return 200;
  if (plan === 'Trimestral') return 510;
  if (plan === 'Semestral') return 960;
  if (plan === 'Anual') return 1919;
  return 200; // default fallback
};

async function fixLinks() {
  const { data, error } = await supabase.from('students').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (let student of data) {
    const isBad = !student.payment_link || student.payment_link.includes('402502578') || student.payment_link.includes('almeidajjcamps');
    if (isBad) {
      const amount = student.payment_value || getPlanDefault(student.plan);
      const cpf = student.cpf ? student.cpf.replace(/\D/g, '') : `REF-${student.id}`;
      
      try {
        const result = await preference.create({
          body: {
            items: [
              {
                title: `Mensalidade - ${student.plan || 'Plano'} (${student.name})`,
                quantity: 1,
                unit_price: Number(amount),
                currency_id: 'BRL',
              },
            ],
            back_urls: {
              success: 'https://almeida-jj.vercel.app/',
              failure: 'https://almeida-jj.vercel.app/',
              pending: 'https://almeida-jj.vercel.app/',
            },
            auto_return: 'approved',
            external_reference: cpf,
            notification_url: 'https://almeida-jj.vercel.app/api/webhook-mp-student'
          }
        });
        
        const newLink = result.init_point;
        
        const { error: updErr } = await supabase
          .from('students')
          .update({ payment_link: newLink })
          .eq('id', student.id);
          
        if (updErr) {
          console.error(`Error updating ${student.name}:`, updErr);
        } else {
          console.log(`Updated ${student.name} -> ${newLink}`);
          count++;
        }
        
      } catch (e) {
        console.error(`Error creating preference for ${student.name}:`, e.message);
      }
      
      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`Successfully updated ${count} students.`);
}

fixLinks();
