import { configureStore } from "@reduxjs/toolkit";
import { api } from "../redux/api/apiSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
