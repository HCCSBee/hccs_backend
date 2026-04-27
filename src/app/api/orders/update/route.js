import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    const body = await request.formData();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const id = body.get("id");
    const payload = {
        customer_name: body.get("customer_name") ?? "",
        order_intent: body.get("order_intent") ?? "",
        subtotal: parseFloat(body.get("subtotal") || 0),
        tax: parseFloat(body.get("tax") || 0),
        total: parseFloat(body.get("total") || 0),
        order_paid: parseInt(body.get("order_paid") || 0),
    };

    const { data, error } = await supabase
        .from("order")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
