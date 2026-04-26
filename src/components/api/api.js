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
export const toggle_prize_active = async (data) => create_function("/api/prizes/toggle_active/", data, 1);
export const delete_prize_content = async (data) => create_function("/api/prizes/content/delete", data, 1);
export const get_background = async (data) => create_function("/api/backgrounds/");
export const create_background = async (data) => create_function("/api/backgrounds/add", data, 1);
export const delete_background = async (data) => create_function("/api/backgrounds/delete", data, 1);


export const get_banners = async (data) => create_function("/api/banners/");
export const create_banner = async (data) => create_function("/api/banners/create", data, 1);
export const update_banner = async (data) => create_function("/api/banners/update", data, 1);


export const get_users = async (data) => create_function("/api/users/");
export const get_user_draw = async (data) => create_function("/api/users/draw", data, 1);
export const get_user_detail = async (data) => create_function("/api/users/detail/", data, 1);
export const update_user = async (data) => create_function("/api/users/update", data, 1);

export const get_performance = async (data) => create_function("/api/performance/")
export const get_prize_draws = async (data) => create_function("/api/prizes/draw/", data, 1)
export const reset_prize_draws = async (data) => create_function("/api/prizes/reset_draws", data, 1)
export const get_transaction_types = async (data) => create_function("/api/transaction_type/");
export const create_user_transaction = async (data) => create_function("/api/wallet/create", data, 1);
export const create_user_mystery_gift = async (data) => create_function("/apiuser/purchasedraw", data, 1);
export const get_wallet_total = async () => create_function("/api/performance/wallet");

export const get_mystery_gift_contents = async () => create_function("/api/mystery_gift_content");
export const create_mystery_gift_content = async (data) => create_function("/api/mystery_gift_content/create", data, 1);
export const update_mystery_gift_content = async (data) => create_function("/api/mystery_gift_content/update", data, 1);
export const delete_mystery_gift_content = async (data) => create_function("/api/mystery_gift_content/delete", data, 1);

export const get_user_mystery_gifts = async (data) => create_function("/api/users/mystery_gift", data, 1);
export const create_mystery_gift = async (data) => create_function("/api/mystery_gift/create", data, 1);
export const update_mystery_gift = async (data) => create_function("/api/mystery_gift/update", data, 1);
export const delete_mystery_gift = async (data) => create_function("/api/mystery_gift/delete", data, 1);

export const get_invitation_codes = async () => create_function("/api/invitation_code");
export const create_invitation_code = async (data) => create_function("/api/invitation_code/create", data, 1);
export const update_invitation_code = async (data) => create_function("/api/invitation_code/update", data, 1);
export const delete_invitation_code = async (data) => create_function("/api/invitation_code/delete", data, 1);

export const unlock_user_mystery_gift = async (data) => create_function("/apiuser/unlockmysterygift", data, 1);

// --- News ---
export const get_news = async () => create_function("/api/news");
export const create_news = async (data) => create_function("/api/news/create", data, 1);
export const update_news = async (data) => create_function("/api/news/update", data, 1);
export const delete_news = async (data) => create_function("/api/news/delete", data, 1);

// --- News Category ---
export const get_news_categories = async () => create_function("/api/news_category");
export const create_news_category = async (data) => create_function("/api/news_category/create", data, 1);
export const update_news_category = async (data) => create_function("/api/news_category/update", data, 1);
export const delete_news_category = async (data) => create_function("/api/news_category/delete", data, 1);

// --- Media ---
export const get_media = async () => create_function("/api/media");
export const create_media = async (data) => create_function("/api/media/create", data, 1);
export const update_media = async (data) => create_function("/api/media/update", data, 1);
export const delete_media = async (data) => create_function("/api/media/delete", data, 1);

// --- Resources ---
export const get_resources = async () => create_function("/api/resources");
export const create_resource = async (data) => create_function("/api/resources/create", data, 1);
export const update_resource = async (data) => create_function("/api/resources/update", data, 1);
export const delete_resource = async (data) => create_function("/api/resources/delete", data, 1);

// --- Services ---
export const get_services = async () => create_function("/api/services");
export const create_service = async (data) => create_function("/api/services/create", data, 1);
export const update_service = async (data) => create_function("/api/services/update", data, 1);
export const delete_service = async (data) => create_function("/api/services/delete", data, 1);
export const create_service_feature = async (data) => create_function("/api/services/features/create", data, 1);
export const delete_service_feature = async (data) => create_function("/api/services/features/delete", data, 1);
export const create_service_help = async (data) => create_function("/api/services/help/create", data, 1);
export const delete_service_help = async (data) => create_function("/api/services/help/delete", data, 1);

// --- Compliance Scan ---
export const get_compliance_scans = async () => create_function("/api/compliance_scan");
export const get_compliance_scans_details = async (data) => create_function("/api/compliance_scan/detail", data, 1);

// --- Consultation ---
export const get_consultations = async () => create_function("/api/consultation");

// --- Subscription Plans ---
export const get_subscription_plans = async () => create_function("/api/subscription_plan");
export const create_subscription_plan = async (data) => create_function("/api/subscription_plan/create", data, 1);
export const update_subscription_plan = async (data) => create_function("/api/subscription_plan/update", data, 1);
export const delete_subscription_plan = async (data) => create_function("/api/subscription_plan/delete", data, 1);

// --- User Tier ---
export const get_user_tiers = async () => create_function("/api/user_tier");
export const create_user_tier = async (data) => create_function("/api/user_tier/create", data, 1);
export const update_user_tier = async (data) => create_function("/api/user_tier/update", data, 1);
export const delete_user_tier = async (data) => create_function("/api/user_tier/delete", data, 1);

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

export const uploadCommonImage = async (file, path) => {

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

    const { data, error } = await supabase.storage.from("common").upload(path + file.name, file, {

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