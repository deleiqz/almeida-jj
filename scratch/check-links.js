import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('students').select('id, name, payment_link, payment_value, plan');
  if (error) {
    console.error(error);
    return;
  }
  let badLinks = 0;
  let missingValue = 0;
  for (let s of data) {
    if (!s.payment_link || s.payment_link.includes('402502578') || s.payment_link.includes('almeidajjcamps')) {
      badLinks++;
      if (!s.payment_value) missingValue++;
    }
  }
  console.log(`Total students: ${data.length}`);
  console.log(`Needs fix: ${badLinks}`);
  console.log(`Needs fix but missing payment_value: ${missingValue}`);
}
check();
