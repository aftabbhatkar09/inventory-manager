import { api } from "../api/apiSlice";

export const transactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation({
      query: (data) => ({
        url: "/transactions/createTransaction",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Product", "Party"],
    }),
    getAllTransactions: builder.query({
      query: () => ({
        url: "/transactions/getAllTransactions",
      }),
      providesTags: ["Transaction", "Product", "Party"],
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/getTransactionById/${id}`,
      providesTags: ["Transaction"],
    }),
    editTransaction: builder.mutation({
      query: ({ id, data }) => ({
        url: `/transactions/editTransaction/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Product", "Party"],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/deleteTransaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transaction", "Product", "Party"],
    }),
  }),
});

export const {
  useCreateTransactionMutation,
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useEditTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
