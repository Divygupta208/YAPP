import React, { useState } from "react";
import ChatWindow from "../components/chatwindow";
import MyChats from "../components/mychats";
import { IoIosCall } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { motion } from "framer-motion";

const Home = () => {
  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <div className="flex flex-col bg-[#1b1242] ">
      {/* Header */}
      <div className="bg-white p-3 w-[100vw] flex shadow-lg">
        <div>
          <img
            src="/chat-chat-svgrepo-com.svg"
            width={50}
            className="ml-5"
            alt="Chat Logo"
          />
        </div>
        <div className="flex justify-end ml-auto gap-10 p-2 relative">
          {/* Call Button and Dropdown */}
          <div className="relative">
            <button onClick={() => setShowCallDropdown((prev) => !prev)}>
              <IoIosCall className="w-6 h-6" /> {/* Calling */}
            </button>
            {showCallDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 right-0 w-32 bg-white shadow-lg rounded-md p-2"
              >
                <p className="text-sm p-2 hover:bg-gray-100 cursor-pointer">
                  Start Voice Call
                </p>
                <p className="text-sm p-2 hover:bg-gray-100 cursor-pointer">
                  Start Video Call
                </p>
              </motion.div>
            )}
          </div>

          {/* Profile Button and Dropdown */}
          <div className="relative">
            <button onClick={() => setShowProfileDropdown((prev) => !prev)}>
              <FaUser className="w-5 h-5" /> {/* User Profile */}
            </button>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 right-0 w-48 bg-white shadow-lg rounded-md p-4"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={userData.profilePic || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full mb-2"
                  />
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                  <label className="text-blue-500 text-xs mt-2 cursor-pointer">
                    <input type="file" className="hidden" />
                    Upload Profile Picture
                  </label>
                </div>
              </motion.div>
            )}
          </div>

          {/* More Options Button and Dropdown */}
          <div className="relative">
            <button onClick={() => setShowMoreDropdown((prev) => !prev)}>
              <IoMdMore className="w-7 h-6" /> {/* More Options */}
            </button>
            {showMoreDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 right-0 w-32 bg-white shadow-lg rounded-md p-2"
              >
                <p className="text-sm p-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </p>
                <p className="text-sm p-2 hover:bg-gray-100 cursor-pointer">
                  Logout
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <MyChats />
    </div>
  );
};

export default Home;
