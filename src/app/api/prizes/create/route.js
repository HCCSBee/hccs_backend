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

    const { data, error } = await supabase.from("gift").insert({
        name: body.get("name"),
        price: body.get("price"),
        description: body.get('description'),
        lots: body.get("lots")
    }).select();

    if (data) {
        var gift = data[0];

        for (var i = 1; i <= body.get("lots"); i++) {
            await supabase.from("gift_lots").insert({
                gift_id: gift.id,
                lot_number: i
            });
        }


        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



