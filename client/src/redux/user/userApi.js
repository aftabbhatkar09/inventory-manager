import { api } from "../api/apiSlice";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create user
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users/createUser",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Get all users
    getUsers: builder.query({
      query: () => "/users/getAllUsers",
      providesTags: ["User"],
    }),

    // Get user by id
    getUserById: builder.query({
      query: (id) => `/users/getUserById/${id}`,
      providesTags: ["User"],
    }),

    // Update user
    editUserById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/editUser/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user
    deleteUserById: builder.mutation({
      query: (id) => ({
        url: `/users/deleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useEditUserByIdMutation,
  useDeleteUserByIdMutation,
} = userApi;
