import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    var body = await request.formData();
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

    let data;
    let error;

    if (body.get("id")) {
        ({ data, error } = await supabase
            .from("prize")
            .update({
                name: body.get("name"),
                price: body.get("price"),
                slots: body.get("slots")
            })
            .eq("id", body.get("id"))
            .select());
    } else {
        const prizeNames = [
            "HP Omen 16",
            "Sony HT-A9 Home Theater",
            "Sonos Arc Soundbar",
            "Segway Ninebot Max G2",
            "Tesla Powerwall",
            "Sony A7 IV",
            "Samsonite Proxis Luggage",
            "Forme Smart Mirror",
            "Sony Bravia XR OLED A80L",
            "Samsung Odyssey OLED G9",
            "LG UltraGear 27GR95QE",
            "Dyson Airwrap Complete",
            "Dyson V15 Detect",
            "Dyson Purifier Cool Formaldehyde",
            "DJI Mini 4 Pro",
            "Samsung Neo QLED 8K TV",
            "Dyson Gen5detect",
            "Roborock S8 Pro Ultra",
            "Panasonic 4 Door Fridge",
            "Apple Watch Ultra 2",
            "Miele Built-in Oven Series 7000",
            "LG Signature Washer Dryer Set",
            "Sony Bravia XR Master Series Z9K 8K TV",
            "Samsung MicroLED TV",
            "Peloton Tread+",
            "Tonal Smart Gym System",
            "Segway GT2 Super Scooter",
            "NIU RQi Electric Motorcycle",
            "Apple Mac Pro M2 Ultra",
            "HP Z8 Fury G5 Workstation",
            "Sony FX6 Cinema Camera",
            "RED Komodo 6K",
            "Sleep Number 360 Smart Bed",
            "Kohler Numi 2.0 Smart Toilet",
            "TOTO Neorest NX2",
            "Sub-Zero Wine Storage Refrigerator",
            "Gaggenau Built-in Coffee Machine",
            "Devialet Phantom I 108dB Speaker Set",
            "Autonomous AI Smart Desk Pro",
            "Specialized Turbo Levo eBike",
            "Renu Therapy Cold Plunge Tub Pro",
            "Varjo XR-4 Mixed Reality Headset",
            "Control4 Smart Home System",
            "Rimowa Original Trunk Plus",
            "LG Signature Smart Fridge"
        ];

        const fixedPrice = 1.5;
        const fixedSlots = 1000;

        const { data: existingPrizes, error: existingPrizeError } = await supabase
            .from("prize")
            .select("name")
            .in("name", prizeNames);

        if (existingPrizeError) {
            return NextResponse.json({ status: false, message: existingPrizeError.message });
        }

        const existingNameSet = new Set((existingPrizes || []).map((row) => row.name));
        const missingNames = prizeNames.filter((name) => !existingNameSet.has(name));

        if (!missingNames.length) {
            return NextResponse.json({ status: true, message: "All predefined prizes already exist." });
        }

        const prizeRows = missingNames.map((name) => ({
            name,
            price: fixedPrice,
            slots: fixedSlots,
        }));

        ({ data, error } = await supabase.from("prize").insert(prizeRows).select());

        if (!error && data?.length) {
            const defaultPrizeContents = data.flatMap((createdPrize) => [
                {
                    prize_id: createdPrize.id,
                    name: createdPrize.name,
                    price: fixedPrice,
                    percentage: 0,
                    prize_tier_id: 1,
                    unlock_after: 0,
                },
                {
                    prize_id: createdPrize.id,
                    name: "Voucher 1SGD",
                    price: 1,
                    percentage: 100,
                    prize_tier_id: 4,
                    thumbnail: "gifts/images/v2.png",
                    background: "background/images/guarantee_bg2.webp",
                    unlock_after: 0,
                },
                {
                    prize_id: createdPrize.id,
                    name: "Voucher 2SGD",
                    price: 2,
                    percentage: 100,
                    prize_tier_id: 3,
                    thumbnail: "gifts/images/v2.png",
                    background: "background/images/guarantee_bg2.webp",
                    unlock_after: 0,
                },
                {
                    prize_id: createdPrize.id,
                    name: "Voucher 5SGD",
                    price: 5,
                    percentage: 100,
                    prize_tier_id: 2,
                    thumbnail: "gifts/images/v2.png",
                    background: "background/images/guarantee_bg2.webp",
                    unlock_after: 0,
                }
            ]);

            const { error: contentError } = await supabase
                .from("prize_content")
                .insert(defaultPrizeContents);

            if (contentError) {
                const createdPrizeIds = data.map((row) => row.id);
                await supabase.from("prize").delete().in("id", createdPrizeIds);
                return NextResponse.json({ status: false, message: contentError.message });
            }
        }
    }

    if (data) {



        return NextResponse.json({ status: true, })
    } else {
        return NextResponse.json({ status: false, message: error.message })
    }

}



