import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore } from "next/cache";

const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const randomReferralCode = (length = 8) => {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += REFERRAL_CHARS.charAt(Math.floor(Math.random() * REFERRAL_CHARS.length));
    }
    return code;
};

const createUniqueReferralCode = async (supabase, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
        const candidate = randomReferralCode(8);
        const { data, error } = await supabase
            .from("user")
            .select("id")
            .eq("referral_code", candidate)
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data) return candidate;
    }

    throw new Error("Unable to generate unique referral code");
};

// ✅ Define reusable CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // You can restrict to http://localhost:3000 if needed
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
};

// ✅ Handle preflight request (CORS check)
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// ✅ Handle GET request
export async function POST(request) {
    unstable_noStore();
    const body = await request.formData();
    const referralCodeInput = String(body.get("referral_code") || "").trim();

    if (!referralCodeInput) {
        return new NextResponse(
            JSON.stringify({ status: false, message: "Referral code is required" }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
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

    const { data: parentUser, error: parentError } = await supabase
        .from("user")
        .select("id")
        .ilike("referral_code", referralCodeInput)
        .limit(1)
        .maybeSingle();

    if (parentError) {
        return new NextResponse(
            JSON.stringify({ status: false, message: parentError.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    if (!parentUser) {
        return new NextResponse(
            JSON.stringify({ status: false, message: "Invalid referral code" }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    const { data, error } = await supabase.auth.signUp({
        email: body.get("email"),
        password: body.get("password")
    });

    if (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    const newReferralCode = await createUniqueReferralCode(supabase);

    var userRes = await supabase.from("user").insert({
        id: data.user.id,
        username: body.get("username"),
        contact: body.get("contact"),
        country: body.get("country"),
        email: body.get("email"),
        referral_code: newReferralCode,
        parent_id: parentUser.id,
    });

    if (userRes.error) {
        await supabase.auth.admin.deleteUser(data.user.id)
        return new NextResponse(
            JSON.stringify({ status: false, message: data.user.id + userRes.error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }


    return new NextResponse(
        JSON.stringify({
            status: true, data: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            }
        }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
