import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function POST(request) {
    unstable_noStore();
    const body = await request.formData();
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

    const { data, error } = await supabase.from("draw").select(
        "*, prize_content(*), user(*)"
    ).order("id", {
        ascending: false
    }).eq("prize_id", body.get("id"))

    if (data) {


        return NextResponse.json({ status: true, data: data })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



