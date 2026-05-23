import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  // Configurando CORS para permitir chamadas do seu próprio domínio
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
    const { studentName, planName, amount, externalReference } = req.body;

    const token = process.env.MP_STUDENT_ACCESS_TOKEN || 'APP_USR-989386315722115-052310-7107168e08120f173cc36d78050a88dc-2531472158';

    const client = new MercadoPagoConfig({
      accessToken: token,
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: `Matrícula/Mensalidade - ${planName} (${studentName})`,
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
        external_reference: externalReference,
        notification_url: 'https://almeida-jj.vercel.app/api/webhook-mp-student'
      },
    });

    return res.status(200).json({ init_point: result.init_point });
  } catch (error) {
    console.error('Erro Mercado Pago Estudante:', error);
    return res.status(500).json({ error: error.message });
  }
}
