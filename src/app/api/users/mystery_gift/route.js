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

    const { data, error } = await supabase
        .from("mystery_gift")
        .select("*, mystery_gift_content(name, thumbnail, background)")
        .eq("user_id", body.get("user_id"))
        .order("id", { ascending: false });

    if (!error) {
        return NextResponse.json({ status: true, data: data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
