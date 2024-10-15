import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MessageList from "./messagelist";

const ChatWindow = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initialMessages = [
      { user: "vaibhav", text: "Hi" },
      { user: "me", text: "Hello" },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = { user: currentUser, text: message };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col w-[60vw] mx-auto mt-40 bg-white p-6 rounded-lg shadow-lg">
      <MessageList messages={messages} currentUser={currentUser} />

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
