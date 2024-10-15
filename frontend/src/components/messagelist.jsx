import React from "react";
import { motion } from "framer-motion";

const MessageList = ({ messages }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <motion.div
      className="message-list h-64 overflow-y-auto mb-4 bg-gray-100 p-4 rounded-lg shadow-inner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {messages.map((message, index) => (
        <motion.div
          key={index}
          className={`message mb-2 p-2 rounded-lg ${
            message.username === userData.name
              ? "bg-blue-200 self-end"
              : "bg-green-200 self-start"
          }`}
          initial={{
            x: message.username === userData.name ? 100 : -100,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <strong>
            {message.username === userData.name ? "me" : message.username}:{" "}
          </strong>{" "}
          {message.content}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MessageList;
