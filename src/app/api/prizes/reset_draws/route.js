import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
    const body = await request.formData();
    const id = body.get("id");

    if (!id) {
        return NextResponse.json({ status: false, message: "Prize id is required" });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    const { error } = await supabase
        .from("prize")
        .update({ draws: 0 })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ status: false, message: error.message });
    }

    return NextResponse.json({ status: true });
}
