import { createSlice } from "@reduxjs/toolkit";

// const MAX_MESSAGES_STORAGE = 10;

// export const fetchMessages = (lastMessageId = null, firstMessageId = null) => {
//   return async (dispatch) => {
//     const token = localStorage.getItem("token");
//     const url = lastMessageId
//       ? `http://localhost:3000/api/messages/received?lastMessageId=${lastMessageId}`
//       : firstMessageId
//       ? `http://localhost:3000/api/messages/received?firstMessageId=${firstMessageId}`
//       : "http://localhost:3000/api/messages/received";

//     console.log("calling api");

//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch messages");
//       }

//       const data = await response.json();

//       if (lastMessageId && !firstMessageId) {
//         console.log(lastMessageId);
//         const newMessages = data;

//         console.log("new message", newMessages);

//         if (newMessages.length > 0) {
//           const localMessages =
//             JSON.parse(localStorage.getItem("messages")) || [];

//           console.log("local messages", localMessages);

//           const combinedMessages = [
//             ...localMessages,
//             ...newMessages.filter(
//               (newMsg) =>
//                 !localMessages.some((localMsg) => localMsg.id === newMsg.id)
//             ),
//           ];
//           console.log("combined messages", combinedMessages);

//           const latestMessages = combinedMessages.slice(-MAX_MESSAGES_STORAGE);
//           localStorage.setItem("messages", JSON.stringify(latestMessages));

//           dispatch(chatSlice.actions.setMessages(latestMessages));
//         }
//       } else if (firstMessageId && !lastMessageId) {
//         const localMessages =
//           JSON.parse(localStorage.getItem("messages")) || [];
//         const combinedMessages = [...data.reverse(), ...localMessages];
//         const latestMessages = combinedMessages.slice(0, MAX_MESSAGES_STORAGE);
//         localStorage.setItem("messages", JSON.stringify(latestMessages));
//         dispatch(chatSlice.actions.setMessages(latestMessages));
//       } else {
//         const latestMessages = data.slice(-MAX_MESSAGES_STORAGE);
//         localStorage.setItem("messages", JSON.stringify(latestMessages));

//         dispatch(chatSlice.actions.setMessages(latestMessages));
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };
// };

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
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
  // fetchMessages,
};

export default chatSlice;
