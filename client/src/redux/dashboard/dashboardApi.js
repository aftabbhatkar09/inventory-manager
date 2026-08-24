import { api } from "../api/apiSlice";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      providesTags: ["Transaction", "Product", "Party"],
    }),
    getMonthlyTrend: builder.query({
      query: () => "/dashboard/monthly-trend",
      providesTags: ["Transaction"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useGetMonthlyTrendQuery } =
  dashboardApi;
