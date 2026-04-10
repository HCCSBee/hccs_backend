import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
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

    const { data, error } = await supabase.from("mystery_gift").insert({
        user_id: body.get("user_id"),
        mystery_gift_content_id: body.get("mystery_gift_content_id"),
        gift_price: body.get("gift_price"),
        unlock_price: body.get("unlock_price"),
        obtain_at: body.get("obtain_at"),
        is_active: 1,
    });

    if (!error) {
        return NextResponse.json({ status: true });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
