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

    let data;
    let error;

    if (body.get("id")) {
        ({ data, error } = await supabase
            .from("prize")
            .update({
                name: body.get("name"),
                price: body.get("price"),
                slots: body.get("slots")
            })
            .eq("id", body.get("id"))
            .select());
    } else {
        ({ data, error } = await supabase.from("prize").insert({
            name: body.get("name"),
            price: body.get("price"),
            slots: body.get("slots")
        }).select());
    }

    if (data) {



        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



