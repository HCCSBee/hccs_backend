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

    const { data, error } = await supabase
        .from("mystery_gift_content")
        .update({
            name: body.get("name"),
            thumbnail: body.get("thumbnail"),
            background: body.get("background"),
            prize_tier_id: body.get("prize_tier_id"),
        })
        .eq("id", body.get("id"));

    if (!error) {
        return NextResponse.json({ status: true });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
