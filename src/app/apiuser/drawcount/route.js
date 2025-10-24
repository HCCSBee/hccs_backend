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

    const { count, error: drawError } = await supabase
        .from('draw')
        .select('*', { count: 'exact', head: true })
        .eq("prize_id", body.get("prize_id"));

    if (drawError) {
        return new NextResponse(
            JSON.stringify({ status: false, message: drawError.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    return new NextResponse(
        JSON.stringify({ status: true, data: count }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
