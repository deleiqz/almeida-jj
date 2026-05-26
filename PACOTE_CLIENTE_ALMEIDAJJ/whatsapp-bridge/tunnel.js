const { spawn } = require('child_process');

console.log("Starting Ngrok Tunnel...");
const ngrok = spawn('ngrok', ['http', '--url=conspicuously-semiconventional-daw.ngrok-free.dev', '3000'], { stdio: 'inherit', windowsHide: true });

ngrok.on('close', (code) => {
  console.log(`Ngrok exited with code ${code}`);
  process.exit(code);
});
