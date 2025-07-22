export const supabase = {
  from: () => ({
    select: () => ({
      in: () => ({
        order: () => ({
          data: [],
          error: null,
        }),
      }),
    }),
  }),
  functions: {
    invoke: () => ({
      data: {
        data: [],
      },
      error: null,
    }),
  },
  auth: {
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    getSession: () => ({
      data: { session: null },
    }),
    getUser: () => ({
        data: { user: null },
    }),
  },
};
