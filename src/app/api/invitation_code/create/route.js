import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const randomCode = (length = 6) => {
    let s = '';
    for (let i = 0; i < length; i++) {
        s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return s;
};

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

    const qty = Number(body.get("quantity") || 0);
    if (Number.isNaN(qty) || qty < 1) {
        return NextResponse.json({ status: false, message: "Invalid quantity" });
    }

    const rows = Array.from({ length: qty }).map(() => ({
        code: randomCode(6),
        is_active: 1,
    }));

    const { error } = await supabase.from("invitation_code").insert(rows);

    if (!error) {
        return NextResponse.json({ status: true });
    } else {
        return NextResponse.json({ status: false, message: error.message });
    }
}
