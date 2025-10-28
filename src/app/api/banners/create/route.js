import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function POST(request) {
    const body = await request.formData();
    unstable_noStore();
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

    const _data = {};

    body.forEach((value, key) => {
        _data[key] = value;
    });

    console.log(_data);

    const { data, error } = await supabase.from("banner").insert({
        ..._data
    });


    if (!error) {

        return NextResponse.json({ status: true, data: data })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



