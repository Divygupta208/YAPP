import { createSlice } from "@reduxjs/toolkit";

const fetchMessages = () => {
  return async (dispatch) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3000/api/messages/received",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();

      console.log("Fetched data:", data);

      dispatch(chatSlice.actions.setMessages(data));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };
};

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [
      { user: "vaibhav", text: "Hi" },
      { user: "me", text: "Hello" },
    ],
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(
        (message) => message.id !== action.payload
      );
    },
    resetMessages: (state) => {
      state.messages = [];
    },
  },
});

export const chatAction = {
  ...chatSlice.actions,
  fetchMessages,
};

export default chatSlice;
