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

    const { data, error } = await supabase.from("prize_content").update({
        deleted: 1
    }).eq("id", body.get("id"));
    if (!error) {
        // var gift = data[0];

        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



