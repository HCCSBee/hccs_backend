import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    const body = await request.formData();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const id = Number(body.get("id"));
    const payload = {
        title: body.get("title"),
        date: body.get("date") || null,
        content: body.get("content"),
        short_description: body.get("short_description"),
        long_description: body.get("long_description"),
        news_category_id: body.get("news_category_id") ? Number(body.get("news_category_id")) : null,
    };

    const { data, error } = await supabase.from("news").update(payload).eq("id", id).select().single();

    if (!error) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
