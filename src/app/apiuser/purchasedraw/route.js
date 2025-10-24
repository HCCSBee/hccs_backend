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

    var { data, error } = await supabase.rpc('get_user_balance', { uid: body.get('user_id') });


    var prizeRes = await supabase.from("prize").select("*").eq("id", body.get("prize_id")).single();


    if (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    if (data < (prizeRes.data.price * body.get("quantity"))) {
        return new NextResponse(
            JSON.stringify({ status: false, message: "Insufficient Balance" }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );

    }

    const { count, error: drawError } = await supabase
        .from('draw')
        .select('*', { count: 'exact', head: true })
        .eq("prize_id", body.get("prize_id"));

    var _total_amount = prizeRes.price * count;
    // 1️⃣ Fetch available prizes
    const { data: prizes, error: pc_error } = await supabase
        .from("prize_content")
        .select("*, prize_tier(*)")
        .eq("prize_id", body.get("prize_id"))
        .lte("unlock_after", count)
        .order("id", { ascending: true });
    console.log(body.get("prize_id"));

    if (pc_error) throw pc_error;
    if (!prizes || prizes.length === 0) throw new Error("No prizes available");

    // 2️⃣ Weighted random function (always returns 1 prize)
    async function pickWeightedPrize(list) {
        const total = list.reduce((sum, item) => sum + (item.percentage || 0), 0);
        if (total <= 0) throw new Error("Invalid prize percentages");

        const random = Math.random() * total;
        let cumulative = 0;

        var _item = list[list.length - 1];
        for (const item of list) {
            cumulative += item.percentage || 0;
            if (random <= cumulative) {
                _item = item;
            }
        }

        var drawRes = await supabase.from("draw").insert({
            user_id: body.get("user_id"),
            prize_id: body.get("prize_id"),
            prize_content_id: _item.id,
        }).select();
        if (!drawRes.error) {
            console.log(drawRes.error);
            await supabase.from("user_wallet").insert({
                user_id: body.get("user_id"),
                credit: prizeRes.data.price,
                remarks: "Draw #" + drawRes.data[0].id,
                user_wallet_transaction_type_id: 5
            });

            await supabase.from("user_prize").insert({
                user_id: body.get("user_id"),
                prize_content_id: _item.id,
                price: _item.price,
                user_prize_status_id: 1
            });
        }

        return _item;
    }

    // 3️⃣ Pick the prize

    var _prizes = [];
    for (var i = 0; i < body.get("quantity"); i++) {
        _prizes.push(await pickWeightedPrize(prizes));
    }
    // const selectedPrize = pickWeightedPrize(prizes);





    return new NextResponse(
        JSON.stringify({ status: true, data: _prizes[0] }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
