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
  }),
});

export const { useCreateTransactionMutation, useGetAllTransactionsQuery } =
  transactionApi;
