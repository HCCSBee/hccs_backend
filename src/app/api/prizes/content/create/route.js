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

    const { data, error } = await supabase.from("prize_content").insert({
        prize_id: body.get("prize_id"),
        name: body.get("name"),
        thumbnail: body.get("thumbnail"),
        background: body.get("background"),
        percentage: body.get("percentage"),
        unlock_after: body.get("unlock_after"),
        price: body.get("price"),
        prize_tier_id: body.get("prize_tier_id"),
    });
    if (!error) {
        // var gift = data[0];

        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



