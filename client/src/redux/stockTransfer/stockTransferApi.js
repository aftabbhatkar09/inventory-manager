import { api } from "../api/apiSlice";

export const stockTransferApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTransfer: builder.mutation({
      query: (data) => ({
        url: "/stock-transfers/createTransfer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StockTransfer", "Product", "Godown"],
    }),

    getAllTransfers: builder.query({
      query: () => "/stock-transfers/getAllTransfers",
      providesTags: ["StockTransfer"],
    }),

    deleteTransferById: builder.mutation({
      query: (id) => ({
        url: `/stock-transfers/deleteTransfer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockTransfer", "Product", "Godown"],
    }),
  }),
});

export const {
  useCreateTransferMutation,
  useGetAllTransfersQuery,
  useDeleteTransferByIdMutation,
} = stockTransferApi;
