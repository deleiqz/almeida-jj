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
    const { gymName, amount } = req.body;

    const client = new MercadoPagoConfig({
      accessToken: 'APP_USR-941031687557097-040713-68cec6df2e1b1705c30cec5e71899475-402502578',
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: `Taxa de Adesão/Setup - ${gymName}`,
            quantity: 1,
            unit_price: Number(amount) || 3250.00,
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: 'https://almeida-jj.vercel.app/contrato-b2b',
          failure: 'https://almeida-jj.vercel.app/contrato-b2b',
          pending: 'https://almeida-jj.vercel.app/contrato-b2b',
        },
        auto_return: 'approved',
      },
    });

    return res.status(200).json({ init_point: result.init_point });
  } catch (error) {
    console.error('Erro Mercado Pago:', error);
    return res.status(500).json({ error: error.message });
  }
}
