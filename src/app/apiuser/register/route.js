import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore } from "next/cache";

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

    var userRes = await supabase.from("user").insert({
        id: data.user.id,
        username: body.get("username"),
        contact: body.get("contact"),
        country: body.get("country"),
        email: body.get("email")
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
