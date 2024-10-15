import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MessageList from "./messagelist";
import { useDispatch, useSelector } from "react-redux";
import { chatAction } from "../../store/chat-slice";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(chatAction.fetchMessages());
  }, [dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ content: message }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(data);

      dispatch(chatAction.addMessage(data.message));
    } catch (error) {}
  };

  return (
    <div className="flex flex-col w-[60vw] mx-auto mt-40 bg-white p-6 rounded-lg shadow-lg">
      <MessageList messages={messages} />

      <motion.form
        className="message-input flex space-x-2"
        onSubmit={handleSendMessage}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-lg p-2"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </motion.form>
    </div>
  );
};

export default ChatWindow;
