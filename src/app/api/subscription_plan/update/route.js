import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    const body = await request.formData();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const id = Number(body.get("id"));
    const payload = {
        name: body.get("name"),
        user_tier_id: Number(body.get("user_tier_id")),
        billing_cycle: body.get("billing_cycle"),
        price: parseFloat(body.get("price")),
        currency: body.get("currency") || "MYR",
        description: body.get("description"),
        is_active: Number(body.get("is_active")),
    };

    const { data, error } = await supabase
        .from("subscription_plan")
        .update(payload)
        .eq("id", id)
        .select("*, user_tier(id, name)")
        .single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
