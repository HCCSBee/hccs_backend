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
        order_id: parseInt(body.get("order_id")),
        item: body.get("item") ?? "",
        quantity: body.get("quantity") ?? "1",
        price: parseFloat(body.get("price") || 0),
    };

    const { data, error } = await supabase
        .from("order_item")
        .insert(payload)
        .select()
        .single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
