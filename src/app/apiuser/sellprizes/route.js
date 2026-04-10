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
    var _mysteryGiftIds = body.get("mystery_gift_ids") ? JSON.parse(body.get("mystery_gift_ids")) : [];
    const userId = body.get("user_id");

    // ✅ Sell regular prizes
    var res = await supabase.from("user_prize").update({
        user_prize_status_id: 3
    }).eq("user_id", userId)
        .in("prize_content_id", _prizes).select();

    for (var i = 0; i < res.data.length; i++) {
        await supabase.from("user_wallet").insert({
            user_id: userId,
            remarks: "Selling item " + res.data[i].id,
            debit: res.data[i].price,
            user_wallet_transaction_type_id: 3
        });
    }

    // ✅ Sell mystery gifts
    if (_mysteryGiftIds.length > 0) {
        var mysteryRes = await supabase.from("user_prize").update({
            user_prize_status_id: 3
        }).eq("user_id", userId)
            .in("id", _mysteryGiftIds)
            .eq("is_mystery_gift", 1)
            .select();

        for (var j = 0; j < mysteryRes.data.length; j++) {
            await supabase.from("user_wallet").insert({
                user_id: userId,
                remarks: "Selling mystery gift " + mysteryRes.data[j].id,
                debit: mysteryRes.data[j].mystery_gift_unlock_price,
                user_wallet_transaction_type_id: 3
            });
        }
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
