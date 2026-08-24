import { api } from "../api/apiSlice";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create payment
    createPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/createPayment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment", "Party"],
    }),

    // Get all payments
    getPayments: builder.query({
      query: () => "/payments/getAllPayments",
      providesTags: ["Payment"],
    }),

    // Get one page of payments (search + pagination)
    getPaymentsPaged: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) =>
        `/payments/getPaymentsPaged?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ["Payment"],
    }),

    // Get payment by id
    getPaymentById: builder.query({
      query: (id) => `/payments/getPaymentById/${id}`,
      providesTags: ["Payment"],
    }),

    // Update payment
    editPaymentById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/payments/editPayment/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payment", "Party"],
    }),

    // Delete payment
    deletePaymentById: builder.mutation({
      query: (id) => ({
        url: `/payments/deletePayment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment", "Party"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentsPagedQuery,
  useGetPaymentByIdQuery,
  useEditPaymentByIdMutation,
  useDeletePaymentByIdMutation,
} = paymentApi;
