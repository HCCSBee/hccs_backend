import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from "next/cache";

export async function GET() {
    unstable_noStore();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) return NextResponse.json({ status: false, message: authError.message });

    // Fetch all public.user rows joined with user_tier
    const { data: publicUsers } = await supabase
        .from("user")
        .select("id, user_tier_id, user_tier(id, name)");

    const publicMap = {};
    (publicUsers ?? []).forEach((u) => { publicMap[u.id] = u; });

    const users = authData.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        user_tier_id: publicMap[u.id]?.user_tier_id ?? null,
        user_tier: publicMap[u.id]?.user_tier ?? null,
    }));

    return NextResponse.json({ status: true, data: users });
}
