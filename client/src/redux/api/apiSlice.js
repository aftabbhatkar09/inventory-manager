import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include",
  }),
  tagTypes: [
    "Product",
    "Party",
    "Transaction",
    "Payment",
    "Godown",
    "StockTransfer",
    "Auth",
  ],
  endpoints: () => ({}),
});
