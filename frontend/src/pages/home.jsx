import React, { useState } from "react";
import ChatWindow from "../components/chatwindow";
import MyChats from "../components/mychats";
import { IoIosCall } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken ? decodedToken.userId : null;
  const userData = JSON.parse(localStorage.getItem("userData"));

  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  const [changedName, setChangedName] = useState(userData.name || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreviewImage] = useState(userData.profilePicture || "");
  const [bio, setBio] = useState(userData.bio || "");

  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!userId) return console.error("User ID not found!");

    const formData = new FormData();
    formData.append("name", changedName);
    formData.append("bio", bio);
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      const response = await axios.patch(
        `http://my-api.zapto.org/yapp/api/user/update/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("User updated successfully!");
        const updatedUser = response.data;
        console.log(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser.user));
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error);
    }
  };
  const handleLogOut = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col bg-[#1b1242]">
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
          {/* Call Button */}
          <div className="relative">
            <button onClick={() => setShowCallDropdown((prev) => !prev)}>
              <IoIosCall className="w-6 h-6" />
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

          {/* Profile Button */}
          <div className="relative">
            <button onClick={() => setShowProfileDropdown((prev) => !prev)}>
              <FaUser className="w-5 h-5" />
            </button>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 -right-10 w-80 bg-white shadow-lg shadow-black rounded-md p-10 z-50"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={preview || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full mb-2"
                  />
                  {editing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  )}
                  {!editing ? (
                    <p className="text-md font-medium">{changedName}</p>
                  ) : (
                    <div className="flex gap-4">
                      <div>name: </div>
                      <input
                        type="text"
                        value={changedName}
                        onChange={(e) => setChangedName(e.target.value)}
                      />
                    </div>
                  )}
                  {!editing ? (
                    <p className="text-sm font-medium">{bio}</p>
                  ) : (
                    <div className="flex gap-4 mt-2">
                      <div>bio:</div>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500">{userData.email}</p>
                  {!editing ? (
                    <button
                      className="text-sm bg-indigo-300"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-10 mt-6">
                      <button
                        onClick={handleUpdateUser}
                        className="p-1 px-4 bg-black text-white rounded-2xl"
                      >
                        Save
                      </button>
                      <button
                        className="p-1 px-4 bg-black text-white rounded-2xl"
                        onClick={() => {
                          setEditing(false);
                          setPreviewImage(userData.profilePicture || "");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          {/* More Button */}
          <div className="relative">
            <button onClick={() => setShowMoreDropdown((prev) => !prev)}>
              <IoMdMore className="w-7 h-6" />
            </button>
            {showMoreDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 right-0 w-32 bg-white shadow-lg rounded-md p-2"
              >
                <button
                  onClick={handleLogOut}
                  className="text-sm p-2 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </button>
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
