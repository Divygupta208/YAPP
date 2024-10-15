import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth-slice";
import chatSlice from "./chat-slice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    chat: chatSlice.reducer,
  },
});

export const authAction = authSlice.actions;

export default store;
