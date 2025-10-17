// import { createClient } from '@supabase/supabase-js';
import { createPagesBrowserClient as createClient } from '@supabase/auth-helpers-nextjs'


import { SUPABASE_API } from 'src/config-global';

// ----------------------------------------------------------------------

export const supabase = createClient(`${SUPABASE_API.url}`, `${SUPABASE_API.key}`);
