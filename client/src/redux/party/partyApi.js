import { api } from "../api/apiSlice";

export const partyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create Party
    createParty: builder.mutation({
      query: (data) => ({
        url: "/parties/createParty",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Party"],
    }),

    // Get all parties
    getParties: builder.query({
      query: () => "/parties/getAllParties",
      providesTags: ["Party"],
    }),

    // Get one page of parties (search + pagination)
    getPartiesPaged: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) =>
        `/parties/getPartiesPaged?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ["Party"],
    }),

    // Get party by id
    getPartyById: builder.query({
      query: (id) => `/parties/getPartyById/${id}`,
      providesTags: ["Party"],
    }),

    // Update party
    editPartyById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/parties/editParty/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Party"],
    }),

    // Delete party
    deletePartyById: builder.mutation({
      query: (id) => ({
        url: `/parties/deleteParty/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),

    // Get party ledger
    getPartyLedger: builder.query({
      query: (id) => `/parties/getPartyLedger/${id}`,
      providesTags: ["Party"],
    }),

    // Get party ledger entries
    getPartyLedgerEntries: builder.query({
      query: (id) => `/parties/getPartyLedgerEntries/${id}`,
      providesTags: ["Party"],
    }),
  }),
});

export const {
  useGetPartiesQuery,
  useGetPartiesPagedQuery,
  useGetPartyByIdQuery,
  useCreatePartyMutation,
  useEditPartyByIdMutation,
  useDeletePartyByIdMutation,
  useGetPartyLedgerQuery,
  useGetPartyLedgerEntriesQuery,
} = partyApi;
