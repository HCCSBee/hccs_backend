import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function POST(request) {
    unstable_noStore();
    const body = await request.formData();
    const id = body.get("id");

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase
        .from("user_draw")
        .select(`
            *,
            user_prize_status(id, name),
            prize_content(
                id, price, thumbnail,
                prize(id, name)
            ),
            mystery_gift_content(id, name, thumbnail)
        `)
        .eq("user_id", id)
        .order("id", { ascending: false });

    if (data) {
        return NextResponse.json({ status: true, data });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
