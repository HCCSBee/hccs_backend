// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  USER: '/users',
  PRIZE: '/prizes',
  SETTINGS: '/settings',
  ADMIN: '/admin'
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    supabase: {
      login: `${ROOTS.AUTH}/supabase/login`,
      register: `${ROOTS.AUTH}/supabase/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    one: `${ROOTS.DASHBOARD}/one`,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  users: {
    root: ROOTS.USER,
    details: (id) => `${ROOTS.USER}/users/details/${id}`,
  },
  admins: {
    root: ROOTS.ADMIN
  },
  prizes: {
    root: ROOTS.PRIZE,
    create: `${ROOTS.PRIZE}/create`,
    details: (id) => `${ROOTS.PRIZE}/${id}/details`,
    edit: `${ROOTS.PRIZE}/create`
  },
  settings: {
    root: ROOTS.SETTINGS + "/background",
    backgrounds: ROOTS.SETTINGS + "/background",

  }
};
