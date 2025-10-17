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

    var { data, error } = await supabase.from("gift_lots")
        .select("*, gift(*, gift_image(*))").eq("user_id", body.get("id"));


    if (!error) {

        var _gifts = [];
        for (var i = 0; i < data.length; i++) {
            var _index = _gifts.findIndex(r => r.id == data[i].gift.id);
            if (_index > -1) {
                _gifts[_index].lots.push({
                    id: data[i].id,
                    lot_number: data[i].lot_number
                });
            } else {
                _gifts.push({
                    ...data[i].gift,
                    image: data[i].gift.gift_image[0].image,
                    total: data[i].gift.lots,
                    lots: [{
                        id: data[i].id,
                        lot_number: data[i].lot_number
                    }]
                })
            }

        }

        for (var i = 0; i < _gifts.length; i++) {
            var lotsRes = await supabase.from("gift_lots")
                .select("*", { count: "exact", head: true })
                .eq("gift_id", _gifts[i].id).is("user_id", null);


            _gifts[i]['available'] = lotsRes.count;
        }


        return new NextResponse(
            JSON.stringify({
                status: true,
                data: _gifts
            }),
            {
                status: 200,
                headers: corsHeaders,
            }
        );
    } else {
        return new NextResponse(
            JSON.stringify({
                status: false,
                message: error.message
            }),
            {
                status: 200,
                headers: corsHeaders,
            }
        );
    }


}
