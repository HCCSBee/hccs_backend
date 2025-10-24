import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function POST(request) {
    unstable_noStore();
    var body = await request.formData();
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

    const { data, error } = await supabase.from("user_wallet").insert({
        user_id: body.get('id'),
        user_wallet_transaction_type_id: body.get('user_wallet_transaction_type_id'),
        debit: body.get('debit'),
        credit: body.get('credit'),
        remarks: body.get('remarks')
    });

    if (!error) {

        return NextResponse.json({ status: true });
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



