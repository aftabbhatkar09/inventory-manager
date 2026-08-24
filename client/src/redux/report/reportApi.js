import { api } from "../api/apiSlice";

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOutStandingReport: builder.query({
      query: () => "/reports/outstanding-report",
    }),
  }),
});

export const { useGetOutStandingReportQuery } = reportApi;
