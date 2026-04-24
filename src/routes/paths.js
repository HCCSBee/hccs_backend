// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  USER: '/users',
  PRIZE: '/prizes',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  MYSTERY_GIFT_CONTENT: '/mystery_gift_content',
  INVITATION_CODE: '/invitation_code',
  NEWS: '/news',
  NEWS_CATEGORY: '/news_category',
  MEDIA: '/media',
  RESOURCES: '/resources',
  SERVICES: '/services',
  COMPLIANCE_SCAN: '/compliance_scan',
  USER_TIER: '/user_tier',
  CONSULTATION: '/consultation',
  SUBSCRIPTION_PLAN: '/subscription_plan',
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
    details: (id) => `${ROOTS.USER}/details/${id}`,
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
    banners: ROOTS.SETTINGS + "/banners"
  },
  mystery_gift_content: {
    root: ROOTS.MYSTERY_GIFT_CONTENT
  },
  invitation_code: {
    root: ROOTS.INVITATION_CODE
  },
  news: {
    root: ROOTS.NEWS,
  },
  news_category: {
    root: ROOTS.NEWS_CATEGORY,
  },
  media: {
    root: ROOTS.MEDIA,
  },
  resources: {
    root: ROOTS.RESOURCES,
  },
  services: {
    root: ROOTS.SERVICES,
  },
  compliance_scan: {
    root: ROOTS.COMPLIANCE_SCAN,
  },
  user_tier: {
    root: ROOTS.USER_TIER,
  },
  consultation: {
    root: ROOTS.CONSULTATION,
  },
  subscription_plan: {
    root: ROOTS.SUBSCRIPTION_PLAN,
  },
};
