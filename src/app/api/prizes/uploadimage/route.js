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

    const { data, error } = await supabase.from("gift_image").insert({
        gift_id: body.get("id"),
        image: body.get("image")
    });
    if (!error) {
        // var gift = data[0];

        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



