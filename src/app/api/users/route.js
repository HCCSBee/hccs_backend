import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function GET(request) {
    unstable_noStore();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data, error } = await supabase.from("user").select();

    for (var i = 0; i < data.length; i++) {
        var _balance = await supabase.from("user_wallet").select("*").eq('deleted', 0).eq("user_id", data[i].id);
        var _total = 0;
        if (_balance.status) {
            _balance.data.forEach(r => {
                _total += (r.debit || 0) - (r.credit || 0)
            });
        }
        data[i]['balance'] = _total;

    }

    if (data) {

        return NextResponse.json({ status: true, data: data })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



