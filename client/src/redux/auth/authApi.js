import { api } from "../api/apiSlice";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      // No invalidatesTags here -- invalidating "Auth" would make any
      // still-mounted subscriber (MainLayout, RequireAuth) immediately
      // refetch getMe before the redirect to /login unmounts them, which
      // always fails with 401 since the cookie's already cleared. We
      // already know the outcome; no need to ask the server again.
    }),

    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
