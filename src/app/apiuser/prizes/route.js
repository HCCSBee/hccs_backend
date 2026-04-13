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
export async function GET(request) {
    unstable_noStore();

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

    const { data, error } = await supabase
        .from("prize")
        .select(`
    *,
    prize_content!inner(*)
  `)
        .eq("active", 1)
        .eq("prize_content.deleted", 0)
        .order("id", { ascending: true, referencedTable: "prize_content" });
    if (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }


    return new NextResponse(
        JSON.stringify({ status: true, data: data }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
