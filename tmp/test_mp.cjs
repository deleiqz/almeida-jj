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
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(body);
        if (json.init_point) {
          console.log('✅ SUCESSO! O Mercado Pago respondeu com o link:', json.init_point);
        } else {
          console.log('❌ ERRO: A resposta não contém o link (init_point).', body);
        }
      } catch (e) {
        console.log('❌ ERRO ao processar JSON:', body);
      }
    } else {
      console.log('❌ FALHOU: Status', res.statusCode, body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na conexão:', error.message);
  console.log('⚠️  DICA: Verifique se a ponte está realmente rodando no terminal.');
});

req.write(data);
req.end();
