import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('compliance_scan')
    .update({ qr: null })
    .not('qr', 'is', null)
    .select('id');

  if (error) {
    return NextResponse.json({ status: false, message: error.message });
  }

  return NextResponse.json({
    status: true,
    data: {
      updated_count: Array.isArray(data) ? data.length : 0,
    },
  });
}
