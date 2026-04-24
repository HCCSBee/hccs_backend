import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    const body = await request.formData();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const payload = {
        title: body.get("title"),
        short_description: body.get("short_description"),
        link: body.get("link"),
        public: Number(body.get("public") ?? 0),
        free: Number(body.get("free") ?? 0),
        essential: Number(body.get("essential") ?? 0),
        professional: Number(body.get("professional") ?? 0),
        strategic: Number(body.get("strategic") ?? 0),
    };

    const { data, error } = await supabase.from("resources").insert(payload).select().single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
