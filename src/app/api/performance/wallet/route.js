import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
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
    const { data, error } = await supabase.rpc('get_all_user_wallet_balances');

    if (error) console.error(error);
    else console.log(data);


    if (!error) {
        return NextResponse.json({ status: true, data: data.reduce((val, row) => val + row.total_balance, 0) })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



