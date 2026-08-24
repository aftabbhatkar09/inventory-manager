import { api } from "../api/apiSlice";

export const godownApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create Godown
    createGodown: builder.mutation({
      query: (data) => ({
        url: "/godowns/createGodown",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Godown"],
    }),

    // Get all godowns
    getGodowns: builder.query({
      query: () => "/godowns/getAllGodowns",
      providesTags: ["Godown"],
    }),

    // Get godown by id
    getGodownById: builder.query({
      query: (id) => `/godowns/getGodownById/${id}`,
      providesTags: ["Godown"],
    }),

    // Update godown
    editGodownById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/godowns/editGodown/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Godown"],
    }),

    // Delete godown
    deleteGodownById: builder.mutation({
      query: (id) => ({
        url: `/godowns/deleteGodown/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Godown"],
    }),

    // Stock breakdown for one godown
    getGodownStock: builder.query({
      query: (id) => `/godowns/getGodownStock/${id}`,
      providesTags: ["Godown", "Transaction", "StockTransfer"],
    }),
  }),
});

export const {
  useCreateGodownMutation,
  useGetGodownsQuery,
  useGetGodownByIdQuery,
  useEditGodownByIdMutation,
  useDeleteGodownByIdMutation,
  useGetGodownStockQuery,
} = godownApi;
