import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore } from "next/cache";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
};

const MYSTERY_GIFT_THUMBNAIL = "gifts/images/treasure.webp";

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
        const debugTag = `[purchasedraw][${Date.now()}]`;

        console.log(debugTag, "request", { user_id, prize_id, quantity });

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
        console.log(debugTag, "balance", { balance, balanceError: balanceError?.message });
        if (balanceError) throw balanceError;

        // 🟢 2. Get prize info
        const { data: prize, error: prizeError } = await supabase
            .from("prize")
            .select("*")
            .eq("id", prize_id)
            .single();
        console.log(debugTag, "prize", { prize, prizeError: prizeError?.message });
        if (prizeError) throw prizeError;

        // 🟢 3. Check balance
        const totalCost = prize.price * quantity;
        console.log(debugTag, "cost_check", { totalCost, balance, pass: balance >= totalCost });
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
        console.log(debugTag, "prize_draw_count", { count, drawCountError: drawCountError?.message });
        if (drawCountError) throw drawCountError;

        // 🟢 4.1 Count user draws for mystery gift threshold checks
        const { count: userDrawCount, error: userDrawCountError } = await supabase
            .from("draw")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user_id);
        console.log(debugTag, "user_draw_count", { userDrawCount, userDrawCountError: userDrawCountError?.message });
        if (userDrawCountError) throw userDrawCountError;

        // 🟢 4.2 Get active mystery gift assignment for this user
        const { data: mysteryGiftData, error: mysteryGiftError } = await supabase
            .from("mystery_gift")
            .select("*, mystery_gift_content(*)")
            .eq("user_id", user_id)
            .eq("is_active", 1)
            .order("obtain_at", { ascending: true })
            .order("id", { ascending: true })
            .limit(1);
        console.log(debugTag, "active_mystery_gift", {
            mysteryGiftData,
            mysteryGiftError: mysteryGiftError?.message,
        });
        if (mysteryGiftError) throw mysteryGiftError;

        const activeMysteryGift = mysteryGiftData?.length ? mysteryGiftData[0] : null;
        console.log(debugTag, "active_mystery_gift_selected", { activeMysteryGift });

        // 🟢 5. Get eligible prize contents
        const { data: prizeContents, error: pcError } = await supabase
            .from("prize_content")
            .select("*, prize_tier(*)")
            .eq("prize_id", prize_id)
            .eq("deleted", 0)
            .lte("unlock_after", count || 0)
            .order("id", { ascending: true });
        console.log(debugTag, "eligible_prize_contents", {
            total: prizeContents?.length || 0,
            ids: (prizeContents || []).map((r) => r.id),
            tiers: (prizeContents || []).map((r) => r.prize_tier_id),
            pcError: pcError?.message,
        });
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
        console.log(debugTag, "selected_prizes_initial", selectedPrizes.map((r) => ({ id: r.id, tier: r.prize_tier_id, price: r.price })));

        // 🟢 7.1 Force first draw as mystery gift when threshold is reached
        let appliedMysteryGift = false;
        let forcedMysteryGift = null;
        if (activeMysteryGift && quantity > 0) {
            const nextUserDrawNumber = (userDrawCount || 0) + 1;
            const obtainAt = Number(activeMysteryGift.obtain_at || 0);
            console.log(debugTag, "mystery_check", {
                nextUserDrawNumber,
                obtainAt,
                shouldApply: nextUserDrawNumber > obtainAt,
                mysteryGiftContentId: activeMysteryGift.mystery_gift_content_id,
            });

            if (nextUserDrawNumber > obtainAt) {
                forcedMysteryGift = activeMysteryGift.mystery_gift_content
                    ? {
                        ...activeMysteryGift.mystery_gift_content,
                        id: activeMysteryGift.mystery_gift_content_id,
                        price: activeMysteryGift.gift_price ?? activeMysteryGift.unlock_price ?? 0,
                    }
                    : null;

                console.log(debugTag, "forced_prize_lookup", {
                    mysteryGiftContentId: activeMysteryGift.mystery_gift_content_id,
                    forcedPrize: forcedMysteryGift
                        ? {
                            id: forcedMysteryGift.id,
                            tier: forcedMysteryGift.prize_tier_id,
                            name: forcedMysteryGift.name,
                        }
                        : null,
                });

                if (forcedMysteryGift) {
                    appliedMysteryGift = true;
                }
            }
        }
        console.log(debugTag, "selected_prizes_final", {
            appliedMysteryGift,
            selected: selectedPrizes.map((r) => ({ id: r.id, tier: r.prize_tier_id, price: r.price })),
        });

        // 🟢 8. Deduct once from wallet
        const { error: walletError } = await supabase.from("user_wallet").insert({
            user_id,
            credit: totalCost,
            remarks: `Draw x${quantity} for prize #${prize_id}`,
            user_wallet_transaction_type_id: 5,
        });
        console.log(debugTag, "wallet_insert", { walletError: walletError?.message });
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
        console.log(debugTag, "draw_insert", {
            drawRows,
            drawDataCount: drawData?.length || 0,
            drawError: drawError?.message,
        });
        if (drawError) throw drawError;

        const nextDrawTotal = Number(prize.draws || 0) + drawRows.length;
        const { error: prizeDrawsError } = await supabase
            .from("prize")
            .update({ draws: nextDrawTotal })
            .eq("id", prize_id);
        console.log(debugTag, "prize_draws_update", {
            prize_id,
            previousDraws: prize.draws,
            incrementBy: drawRows.length,
            nextDrawTotal,
            prizeDrawsError: prizeDrawsError?.message,
        });
        if (prizeDrawsError) throw prizeDrawsError;

        // 🟢 10. Prepare bulk insert for user_prizes
        const prizeRows = selectedPrizes.map((item) => ({
            user_id,
            prize_content_id: item.id,
            price: item.price,
            user_prize_status_id: 1,
            is_mystery_gift: 0,
            mystery_gift_open: 0,
            mystery_gift_unlock_price: null,
            mystery_gift_content_id: null,
        }));

        if (appliedMysteryGift && prizeRows.length > 0) {
            prizeRows[0] = {
                ...prizeRows[0],
                prize_content_id: null,
                price: activeMysteryGift?.gift_price ?? prizeRows[0].price,
                is_mystery_gift: 1,
                mystery_gift_open: 0,
                mystery_gift_unlock_price: activeMysteryGift?.unlock_price ?? null,
                mystery_gift_content_id: activeMysteryGift?.mystery_gift_content_id ?? null,
            };
        }

        const { error: userPrizeError } = await supabase
            .from("user_prize")
            .insert(prizeRows);
        console.log(debugTag, "user_prize_insert", {
            prizeRows,
            userPrizeError: userPrizeError?.message,
        });
        if (userPrizeError) throw userPrizeError;

        // 🟢 11. Mark mystery gift as consumed after first forced placement
        if (appliedMysteryGift) {
            const { error: mysteryGiftConsumeError } = await supabase
                .from("mystery_gift")
                .update({ is_active: 0 })
                .eq("id", activeMysteryGift.id);

            console.log(debugTag, "mystery_gift_consume", {
                id: activeMysteryGift.id,
                mysteryGiftConsumeError: mysteryGiftConsumeError?.message,
            });

            if (mysteryGiftConsumeError) throw mysteryGiftConsumeError;
        }

        // ✅ Return all selected prizes
        let responsePrizes = selectedPrizes.map((item) => ({
            ...item,
            is_mystery_gift: 0,
        }));
        if (appliedMysteryGift && forcedMysteryGift) {
            responsePrizes = [{
                ...forcedMysteryGift,
                thumbnail: MYSTERY_GIFT_THUMBNAIL,
                is_mystery_gift: 1,
                mystery_gift_open: 0,
                mystery_gift_unlock_price: activeMysteryGift?.unlock_price ?? null,
                mystery_gift_content_id: activeMysteryGift?.mystery_gift_content_id ?? forcedMysteryGift.id,
            }, ...responsePrizes.slice(1)];
        }

        console.log(debugTag, "success_response", {
            selected: responsePrizes.map((r) => ({ id: r.id, tier: r.prize_tier_id })),
            appliedMysteryGift,
        });
        return new NextResponse(
            JSON.stringify({ status: true, data: responsePrizes }),
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
