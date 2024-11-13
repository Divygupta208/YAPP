import React from "react";
import { motion } from "framer-motion";

const MessageList = ({ messages }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <motion.div
      className="message-list h-full w-full overflow-y-auto mb-4 bg-white/90 p-4 rounded-lg shadow-inner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {messages.map((message, index) => (
        <motion.div
          key={index}
          className={`message mb-2 p-3 rounded-lg max-w-[60%] ${
            message.username === userData.name
              ? "bg-black/10 self-end text-right ml-auto"
              : "bg-emerald-200 self-start text-left mr-auto"
          }`}
          initial={{
            x: message.username === userData.name ? 100 : -100,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <strong className="block mb-1 text-sm text-gray-900">
            {message.username === userData.name ? "Me" : message.username}
          </strong>
          <p className="text-gray-800">{message.content}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MessageList;
