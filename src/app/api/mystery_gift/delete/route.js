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

    const { error } = await supabase
        .from("mystery_gift")
        .delete()
        .eq("id", body.get("id"));

    if (!error) {
        return NextResponse.json({ status: true });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
