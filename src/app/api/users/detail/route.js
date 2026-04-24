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

    // Auth user (email, created_at, etc.)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
    if (authError) return NextResponse.json({ status: false, message: authError.message });

    // Public user row joined with tier
    const { data: publicUser } = await supabase
        .from("user")
        .select("id, user_tier_id, user_tier(id, name)")
        .eq("id", id)
        .single();

    const merged = {
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: authUser.user.created_at,
        user_tier_id: publicUser?.user_tier_id ?? null,
        user_tier: publicUser?.user_tier ?? null,
    };

    return NextResponse.json({ status: true, data: merged });
}
