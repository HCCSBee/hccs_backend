import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function POST(request) {
    unstable_noStore();
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

    const { data, error } = await supabase.from("gift").select('*, gift_lots(*), gift_image(*)').eq("id", body.get('id'))

    if (data) {
        var gift = data[0];

        return NextResponse.json({ status: true, data: data[0] })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



