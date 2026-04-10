import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function GET(request) {
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

    const { data, error } = await supabase
        .from("mystery_gift_content")
        .select("*, prize_tier(*)")
        .eq("deleted", 0)
        .order("id", { ascending: true });

    if (!error) {
        return NextResponse.json({ status: true, data: data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
