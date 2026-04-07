const http = require('http');

const data = JSON.stringify({
  gymName: 'Academia Teste Antigravity',
  amount: 1.00
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/create-saas-payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
    if (res.statusCode === 200 && body.includes('init_point')) {
      console.log('✅ TESTE SUCESSO! Link Mercado Pago gerado com o seu Token real.');
    } else {
      console.log('❌ TESTE FALHOU. Veja o erro acima.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na conexão:', error.message);
});

req.write(data);
req.end();
