import { api } from "../api/apiSlice";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query({
      query: () => "/products/getAllProducts",
      providesTags: ["Product"],
    }),

    // Get product by ID
    getProductById: builder.query({
      query: (id) => `/products/getProductById/${id}`,
      providesTags: ["Product"],
    }),

    // Create Product
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/products/createProduct",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    // Edit Product
    editProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/editProduct/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    // Delete Product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/deleteProduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Get Stock of products
    getProductStock: builder.query({
      query: (id) => `/products/getProductStock/${id}`,
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
  useGetProductStockQuery,
} = productApi;
