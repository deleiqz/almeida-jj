const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dospnbzzcjrmwpakldmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3BuYnp6Y2pybXdwYWtsZG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI5NzMsImV4cCI6MjA4OTQ0ODk3M30.3M1V3OCoMtKCj_TPEv3sgiQ7rG7ZTuHF6lxHrNUQG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("=== TESTE DE LOGIN BRENO ===\n");

    // 1. Login
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'breno@almeidajj.com',
        password: 'brenO6094@'
    });
    if (error) {
        console.error("LOGIN FALHOU:", error.message);
        return;
    }
    console.log("User ID:", data.user.id);
    console.log("Email:", data.user.email);

    // 2. Tentar buscar perfil
    console.log("\n--- Buscando perfil ---");
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error("ERRO NO PERFIL:", profileError.message);
        console.error("Codigo:", profileError.code);
        console.error("Detalhes:", profileError.details);
        console.error("Hint:", profileError.hint);
    } else {
        console.log("PERFIL ENCONTRADO:");
        console.log(JSON.stringify(profile, null, 2));
    }

    // 3. Listar TODAS as policies na tabela profiles
    console.log("\n--- Listando policies do profiles (via RPC se existir) ---");
    const { data: policies, error: polErr } = await supabase.rpc('get_policies_info').catch(() => ({ data: null, error: { message: 'RPC not available' } }));
    if (polErr) {
        console.log("RPC nao disponivel, verificando via query direta...");
    } else if (policies) {
        console.log(JSON.stringify(policies, null, 2));
    }

    // 4. Verificar se existe registro no profiles para esse user
    console.log("\n--- Tentando buscar SEM filtro de ID ---");
    const { data: allProfiles, error: allErr } = await supabase
        .from('profiles')
        .select('id, role, full_name');

    if (allErr) {
        console.error("ERRO ao listar profiles:", allErr.message);
    } else {
        console.log("Total de profiles visiveis:", allProfiles?.length);
        allProfiles?.forEach(p => {
            console.log(`  - ${p.id} | ${p.full_name} | role: ${p.role}`);
        });
    }

    await supabase.auth.signOut();
}
test();
