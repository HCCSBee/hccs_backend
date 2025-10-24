import { createClient } from "@supabase/supabase-js";
import { create_function } from "./api_util";

export const create_prize = async (data) => create_function("/api/prizes/create", data, 1)
export const get_prizes = async (data) => create_function("/api/prizes")
export const get_prize = async (id) => create_function("/api/prizes/detail", { id: id }, 1)
export const insert_prize_image = async (data) => create_function("/api/prizes/uploadimage", data, 1);
export const get_prize_tiers = async (data) => create_function("/api/prizes/tiers");

export const get_prize_content = async (data) => create_function("/api/prizes/content", data, 1);
export const create_prize_content = async (data) => create_function("/api/prizes/content/create", data, 1);
export const update_prize_content = async (data) => create_function("/api/prizes/content/update", data, 1);
export const delete_prize_content = async (data) => create_function("/api/prizes/content/delete", data, 1);
export const get_background = async (data) => create_function("/api/backgrounds/");
export const create_background = async (data) => create_function("/api/backgrounds/add", data, 1);
export const delete_background = async (data) => create_function("/api/backgrounds/delete", data, 1);

export const get_users = async (data) => create_function("/api/users/");
export const get_user_draw = async (data) => create_function("/api/users/draw", data, 1);
export const get_user_detail = async (data) => create_function("/api/users/detail/", data, 1);

export const get_performance = async (data) => create_function("/api/performance/")
export const get_prize_draws = async (data) => create_function("/api/prizes/draw/", data, 1)
export const get_transaction_types = async (data) => create_function("/api/transaction_type/");
export const create_user_transaction = async (data) => create_function("/api/wallet/create", data, 1);
export const get_wallet_total = async () => create_function("/api/performance/wallet");

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

    const { data, error } = await supabase.storage.from("gifts").upload("images/" + file.name, file, {

    });

    if (!error) {
        return { status: true, data: data };
    } else {
        return { status: false, message: error.message };
    }

}



export const uploadImageBackground = async (file) => {

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

    const { data, error } = await supabase.storage.from("background").upload("images/" + file.name, file, {

    });

    if (!error) {
        return { status: true, data: data };
    } else {
        return { status: false, message: error.message };
    }

}