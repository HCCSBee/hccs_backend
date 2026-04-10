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
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function POST(request) {
    unstable_noStore();

    try {
        const body = await request.formData();
        const user_id = body.get("user_id");
        const id = body.get("id");

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

        const { data: balance, error: balanceError } = await supabase.rpc("get_user_balance", {
            uid: user_id,
        });
        if (balanceError) throw balanceError;

        const { data: prize, error: prizeError } = await supabase
            .from("user_prize")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .maybeSingle();
        if (prizeError) throw prizeError;

        if (!prize) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Prize not found" }),
                {
                    status: 404,
                    headers: corsHeaders,
                }
            );
        }

        if (!prize.is_mystery_gift) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "This item is not a mystery gift" }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        if (prize.mystery_gift_open) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Mystery gift already unlocked" }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const unlockPrice = Number(prize.mystery_gift_unlock_price || 0);
        if (balance < unlockPrice) {
            return new NextResponse(
                JSON.stringify({ status: false, message: "Insufficient Balance" }),
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        if (unlockPrice > 0) {
            const { error: walletError } = await supabase.from("user_wallet").insert({
                user_id,
                credit: unlockPrice,
                remarks: `Unlock mystery gift #${id}`,
                user_wallet_transaction_type_id: 5,
            });
            if (walletError) throw walletError;
        }

        const { error: updateError } = await supabase
            .from("user_prize")
            .update({ mystery_gift_open: 1 })
            .eq("id", id)
            .eq("user_id", user_id);
        if (updateError) throw updateError;

        return new NextResponse(
            JSON.stringify({ status: true }),
            {
                status: 200,
                headers: corsHeaders,
            }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}
