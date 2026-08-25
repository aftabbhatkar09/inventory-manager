import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // In production the client and API are proxied under one Vercel
    // domain (see vercel.json), so a relative path is correct there.
    // Local dev has no such proxy, so client/.env points this at the
    // separately-running local server instead.
    baseUrl: import.meta.env.VITE_API_URL || "/api",
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
    "User",
  ],
  endpoints: () => ({}),
});
