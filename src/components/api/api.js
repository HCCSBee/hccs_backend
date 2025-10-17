import { createClient } from "@supabase/supabase-js";
import { create_function } from "./api_util";

export const create_prize = async (data) => create_function("/api/prizes/create", data, 1)
export const get_prizes = async (data) => create_function("/api/prizes")
export const get_prize = async (id) => create_function("/api/prizes/detail", { id: id }, 1)
export const insert_prize_image = async (data) => create_function("/api/prizes/uploadimage", data, 1);

// needs to be changed 
export const uploadImage = async (file) => {

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

    const { data, error } = await supabase.storage.from("gift").upload("images/" + file.name, file, {

    });

    if (!error) {
        return { status: true, data: data };
    } else {
        return { status: false, message: error.message };
    }

}