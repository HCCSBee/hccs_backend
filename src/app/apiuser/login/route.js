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
    const email = body.get("email");
    const password = body.get("password");
    const invitationCode = body.get("invitation_code");

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

    const userRes = await supabase.from("user").select().eq("email", email);

    if (userRes.error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: userRes.error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    if (userRes.data.length > 0) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data?.session) {
            return new NextResponse(
                JSON.stringify({ status: false, message: error?.message || "Login failed" }),
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

    } else {
        if (!invitationCode) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Invitation code is required" }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const invitationRes = await supabase
            .from("invitation_code")
            .select()
            .eq("code", invitationCode)
            .is("user_id", null)
            .eq("is_active", 1)
            .limit(1);

        if (invitationRes.error) {
            return new NextResponse(
                JSON.stringify({ status: false, message: invitationRes.error.message }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        if (!invitationRes.data || invitationRes.data.length === 0) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Invalid invitation code" }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
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

        var res2 = await supabase.from("user").insert({
            id: data.user.id,
            email
        });

        if (res2.error) {
            await supabase.auth.admin.deleteUser(data.user.id);
            return new NextResponse(
                JSON.stringify({ status: false, message: data.user.id + res2.error.message }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const invitationId = invitationRes.data[0].id;
        const consumeRes = await supabase
            .from("invitation_code")
            .update({
                user_id: data.user.id,
                is_active: 0,
            })
            .eq("id", invitationId)
            .is("user_id", null)
            .eq("is_active", 1);

        if (consumeRes.error) {
            await supabase.from("user").delete().eq("id", data.user.id);
            await supabase.auth.admin.deleteUser(data.user.id);
            return new NextResponse(
                JSON.stringify({ status: false, message: consumeRes.error.message }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        if (!data?.session) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Registration succeeded but no session was returned" }),
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
}
