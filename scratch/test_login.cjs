const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dospnbzzcjrmwpakldmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3BuYnp6Y2pybXdwYWtsZG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI5NzMsImV4cCI6MjA4OTQ0ODk3M30.3M1V3OCoMtKCj_TPEv3sgiQ7rG7ZTuHF6lxHrNUQG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'breno@almeidajj.com',
        password: 'brenO6094@'
    });
    if (error) {
        console.error("Login failed:", error.message);
        return;
    }
    console.log("User ID:", data.user.id);
    console.log("Email:", data.user.email);
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
    
    if (profileError) {
        console.error("Profile fetch error:", profileError.message);
    } else {
        console.log("Profile:", profile);
    }
}
test();
