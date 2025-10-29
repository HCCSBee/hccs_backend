import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore } from "next/cache";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
    unstable_noStore();

    try {
        const body = await request.formData();
        const user_id = body.get("user_id");
        const prize_id = body.get("prize_id");
        const quantity = Number(body.get("quantity") || 1);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 🟢 1. Get user balance
        const { data: balance, error: balanceError } = await supabase.rpc(
            "get_user_balance",
            { uid: user_id }
        );
        if (balanceError) throw balanceError;

        // 🟢 2. Get prize info
        const { data: prize, error: prizeError } = await supabase
            .from("prize")
            .select("*")
            .eq("id", prize_id)
            .single();
        if (prizeError) throw prizeError;

        // 🟢 3. Check balance
        const totalCost = prize.price * quantity;
        if (balance < totalCost) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Insufficient Balance" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // 🟢 4. Count draws so far
        const { count, error: drawCountError } = await supabase
            .from("draw")
            .select("*", { count: "exact", head: true })
            .eq("prize_id", prize_id);
        if (drawCountError) throw drawCountError;

        // 🟢 5. Get eligible prize contents
        const { data: prizeContents, error: pcError } = await supabase
            .from("prize_content")
            .select("*, prize_tier(*)")
            .eq("prize_id", prize_id)
            .eq("deleted", 0)
            .lte("unlock_after", count || 0)
            .order("id", { ascending: true });
        if (pcError) throw pcError;
        if (!prizeContents?.length) throw new Error("No prizes available");

        // 🟢 6. Weighted random picker
        const pickWeightedPrize = (list) => {
            const total = list.reduce((sum, item) => sum + (item.percentage || 0), 0);
            if (total <= 0) throw new Error("Invalid prize percentages");

            const random = Math.random() * total;
            let cumulative = 0;
            for (const item of list) {
                cumulative += item.percentage || 0;
                if (random <= cumulative) return item;
            }
            return list[list.length - 1]; // fallback
        };

        // 🟢 7. Select prizes for all draws
        const selectedPrizes = Array.from({ length: quantity }, () =>
            pickWeightedPrize(prizeContents)
        );

        // 🟢 8. Deduct once from wallet
        const { error: walletError } = await supabase.from("user_wallet").insert({
            user_id,
            credit: totalCost,
            remarks: `Draw x${quantity} for prize #${prize_id}`,
            user_wallet_transaction_type_id: 5,
        });
        if (walletError) throw walletError;

        // 🟢 9. Prepare bulk insert for draws
        const drawRows = selectedPrizes.map((item) => ({
            user_id,
            prize_id,
            prize_content_id: item.id,
        }));

        const { data: drawData, error: drawError } = await supabase
            .from("draw")
            .insert(drawRows)
            .select();
        if (drawError) throw drawError;

        // 🟢 10. Prepare bulk insert for user_prizes
        const prizeRows = selectedPrizes.map((item) => ({
            user_id,
            prize_content_id: item.id,
            price: item.price,
            user_prize_status_id: 1,
        }));

        const { error: userPrizeError } = await supabase
            .from("user_prize")
            .insert(prizeRows);
        if (userPrizeError) throw userPrizeError;

        // ✅ Return all selected prizes
        return new NextResponse(
            JSON.stringify({ status: true, data: selectedPrizes }),
            { status: 200, headers: corsHeaders }
        );
    } catch (err) {
        console.error("❌ Error in draw API:", err);
        return new NextResponse(
            JSON.stringify({ status: false, message: err.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}
