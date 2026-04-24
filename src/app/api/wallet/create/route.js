import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    const body = await request.formData();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const payload = {
        user_id: body.get("id"),
        user_wallet_transaction_type_id: body.get("user_wallet_transaction_type_id")
            ? Number(body.get("user_wallet_transaction_type_id"))
            : null,
        remarks: body.get("remarks") ?? "",
        debit: parseFloat(body.get("debit") || 0),
        credit: parseFloat(body.get("credit") || 0),
    };

    const { data, error } = await supabase
        .from("user_wallet")
        .insert(payload)
        .select()
        .single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
