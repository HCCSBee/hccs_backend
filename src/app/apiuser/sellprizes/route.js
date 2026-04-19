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

    try {
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
        let totalSoldAmount = 0;

        // Sell regular prizes
        var res = await supabase.from("user_prize").update({
            user_prize_status_id: 3
        }).eq("user_id", userId)
            .in("prize_content_id", _prizes).select();

        if (res.error) throw res.error;

        for (var i = 0; i < (res.data || []).length; i++) {
            const regularSellPrice = Number(res.data[i].price || 0);
            totalSoldAmount += regularSellPrice;

            const walletRes = await supabase.from("user_wallet").insert({
                user_id: userId,
                remarks: "Selling item " + res.data[i].id,
                debit: regularSellPrice,
                user_wallet_transaction_type_id: 3
            });

            if (walletRes.error) throw walletRes.error;
        }

        // Sell mystery gifts
        if (_mysteryGiftIds.length > 0) {
            var mysteryRes = await supabase.from("user_prize").update({
                user_prize_status_id: 3
            }).eq("user_id", userId)
                .in("id", _mysteryGiftIds)
                .eq("is_mystery_gift", 1)
                .select();

            if (mysteryRes.error) throw mysteryRes.error;

            for (var j = 0; j < (mysteryRes.data || []).length; j++) {
                const mysterySellPrice = Number(mysteryRes.data[j].mystery_gift_unlock_price || 0);
                totalSoldAmount += mysterySellPrice;

                const mysteryWalletRes = await supabase.from("user_wallet").insert({
                    user_id: userId,
                    remarks: "Selling mystery gift " + mysteryRes.data[j].id,
                    debit: mysterySellPrice,
                    user_wallet_transaction_type_id: 3
                });

                if (mysteryWalletRes.error) throw mysteryWalletRes.error;
            }
        }

        const { data: seller, error: sellerError } = await supabase
            .from("user")
            .select("parent_id")
            .eq("id", userId)
            .maybeSingle();

        if (sellerError) throw sellerError;

        if (seller?.parent_id && totalSoldAmount > 0) {
            const referralBonus = Number((totalSoldAmount * 0.02).toFixed(2));

            if (referralBonus > 0) {
                const { error: referralBonusError } = await supabase
                    .from("user_wallet")
                    .insert({
                        user_id: seller.parent_id,
                        remarks: "Referral bonus 2% from child sale " + userId,
                        debit: referralBonus,
                        user_wallet_transaction_type_id: 6,
                    });

                if (referralBonusError) throw referralBonusError;
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
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }
}
