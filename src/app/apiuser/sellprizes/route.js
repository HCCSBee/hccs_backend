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

    var _prizes = JSON.parse(body.get("prizes"));
    var res = await supabase.from("user_prize").update({
        user_prize_status_id: 3
    }).eq("user_id", body.get("user_id"))
        .in("prize_content_id", _prizes).select();

    for (var i = 0; i < res.data.length; i++) {
        await supabase.from("user_wallet").insert({
            user_id: body.get("user_id"),
            remarks: "Selling item " + res.data[i].id,
            debit: res.data[i].price,
            user_wallet_transaction_type_id: 3
        });
    }



    return new NextResponse(
        JSON.stringify({
            status: true,
        }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
