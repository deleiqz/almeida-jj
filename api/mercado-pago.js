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
      accessToken: 'APP_USR-710461877685608-040715-3864117b4ab4430e69eb7f6104443912-1662999464',
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: `Taxa de Adesão/Setup - ${gymName}`,
            quantity: 1,
            unit_price: amount || 3250.00,
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
