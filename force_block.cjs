const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dospnbzzcjrmwpakldmy.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3BuYnp6Y2pybXdwYWtsZG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI5NzMsImV4cCI6MjA4OTQ0ODk3M30.3M1V3OCoMtKCj_TPEv3sgiQ7rG7ZTuHF6lxHrNUQG6U'
);

async function block() {
  console.log('Tentando bloquear sistema via DB...');
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'system_blocked', value: 'true' }, { onConflict: 'key' });

  if (error) {
    console.error('❌ ERRO:', error.message);
    console.log('\nO RLS bloqueou a gravação. Por favor, cole o código SQL no painel do Supabase para liberar.');
  } else {
    console.log('✅ SUCESSO! Sistema configurado para bloqueio no banco de dados.');
  }
}

block();
