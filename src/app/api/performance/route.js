import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data, error } = await supabase.from("prize").select("*,prize_content(*)");

    for (var i = 0; i < data.length; i++) {
        var { count } = await supabase
            .from('draw')
            .select('*', { count: 'exact', head: true })
            .eq("prize_id", data[i].id)


        var sumData = await supabase.rpc('get_total_prize_sum', {
            pid: data[i].id
        });

        data[i]['draws'] = count;
        data[i]['sum_won'] = sumData.data;

    }
    if (!error) {
        // var gift = data[0];

        return NextResponse.json({ status: true, data: data })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



