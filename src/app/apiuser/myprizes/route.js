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
    const userId = body.get('user_id');
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
        .from("user_prize")
        .select("*, prize_content(*), mystery_gift_content(*)")
        .eq("user_id", userId)
        .eq("user_prize_status_id", 1)
        .order("id", { ascending: false });

    if (error) {
        return new NextResponse(
            JSON.stringify({ status: false, message: error.message }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }

    const groupedPrizeMap = new Map();
    const mysteryGiftItems = [];

    (data || []).forEach((row) => {
        if (row.is_mystery_gift) {
            mysteryGiftItems.push({
                id: row.id,
                prize_content_id: null,
                mystery_gift_content_id: row.mystery_gift_content_id,
                total: 1,
                name: row.mystery_gift_open
                    ? row.mystery_gift_content?.name
                    : "MYSTERY_GIFT",
                thumbnail: row.mystery_gift_open
                    ? row.mystery_gift_content?.thumbnail
                    : "gifts/images/treasure.webp",
                price: row.price,
                background: row.mystery_gift_content?.background,
                is_mystery_gift: 1,
                mystery_gift_open: row.mystery_gift_open,
                mystery_gift_unlock_price: row.mystery_gift_unlock_price,
                created_at: row.created_at,
            });
            return;
        }

        if (!row.prize_content_id || !row.prize_content) {
            return;
        }

        if (!groupedPrizeMap.has(row.prize_content_id)) {
            groupedPrizeMap.set(row.prize_content_id, {
                prize_content_id: row.prize_content_id,
                total: 0,
                name: row.prize_content.name,
                thumbnail: row.prize_content.thumbnail,
                price: row.prize_content.price,
                background: row.prize_content.background,
                is_mystery_gift: 0,
            });
        }

        const current = groupedPrizeMap.get(row.prize_content_id);
        current.total += 1;
    });

    const groupedPrizes = Array.from(groupedPrizeMap.values()).sort((a, b) => b.total - a.total);
    const response = [...mysteryGiftItems, ...groupedPrizes];


    return new NextResponse(
        JSON.stringify({ status: true, data: response }),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}
