const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dospnbzzcjrmwpakldmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3BuYnp6Y2pybXdwYWtsZG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI5NzMsImV4cCI6MjA4OTQ0ODk3M30.3M1V3OCoMtKCj_TPEv3sgiQ7rG7ZTuHF6lxHrNUQG6U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { data, error } = await supabase
            .from('saas_agreements')
            .select('*');

        if (error) throw error;
        // Find the one with the highest index or just look at last items
        console.log("Total records:", data.length);
        const last = data[data.length - 1];
        console.log("LAST RECORD in array:", JSON.stringify(last, null, 2));
    } catch (err) {
        console.error("Error checking data:", err.message);
    }
}
checkData();
