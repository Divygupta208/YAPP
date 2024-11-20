import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GroupCreationModal from "./groupmodal";
import ChatWindow from "./chatwindow";
import { jwtDecode } from "jwt-decode";

const MyChats = () => {
  const [search, setSearch] = useState("");
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).userId : null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://yapp.zapto.org/api/user/allusers"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        const filteredUsers = data.data.filter(
          (user) => user.id !== Number(currentUserId)
        );
        setUsers(filteredUsers);
        setFilteredChats(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchUserGroups = async () => {
      try {
        const response = await fetch(
          "https://yapp.zapto.org/api/groups/usergroups",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user groups");
        }
        const data = await response.json();
        console.log(data);
        setGroups(data);
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    fetchUsers();
    fetchUserGroups();
  }, [currentUserId]);

  useEffect(() => {
    setFilteredChats(
      users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const handleCreateGroup = async (groupName, groupDesc, selectedUsers) => {
    const response = await fetch("https://yapp.zapto.org/api/groups/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: groupName,
        description: groupDesc,
        users: selectedUsers,
      }),
    });

    const newGroup = await response.json();
    setGroups((prevGroups) => [...prevGroups, newGroup]);
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex h-[90vh] p-14">
      {/* Sidebar */}
      <div className="w-1/3 bg-[#ffffff] border-r p-4 rounded-3xl -mt-10 shadow-2xl">
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => setGroupModalOpen(true)}
          className="w-full mt-4 py-2 bg-violet-500 rounded-2xl text-white hover:bg-violet-600 transition duration-200"
        >
          Create Group
        </button>

        <div className="overflow-y-auto">
          {/* Display filtered users */}
          {filteredChats.map((user) => (
            <motion.div
              key={user.id}
              onClick={() => handleChatClick(user)}
              className="p-4 border-b cursor-pointer hover:bg-indigo-100 rounded-lg flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: user.id * 0.1 }}
            >
              {user.profile ? (
                <img src={user.profile} />
              ) : (
                <img src="/default-avatar.svg" width={12} />
              )}
              {user.username}
              {onlineUsers.includes(user.id) && (
                <img
                  className="ml-auto"
                  src="public\dot-small-svgrepo-com.svg"
                  width={30}
                />
              )}
            </motion.div>
          ))}

          {/* Display created groups */}
          {groups.map((group) => (
            <motion.div
              key={group.id}
              onClick={() => handleChatClick(group)}
              className="p-4 border-b cursor-pointer hover:bg-indigo-100 rounded-lg flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: group.id * 0.1 }}
            >
              {group.profile ? (
                <img src={group.profile} />
              ) : (
                <img src="/group-svgrepo-com.svg" width={18} />
              )}
              {group.name}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow
        selectedChat={selectedChat}
        onlineUsers={onlineUsers}
        setOnlineUsers={setOnlineUsers}
      />

      <GroupCreationModal
        isOpen={isGroupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        users={users}
      />
    </div>
  );
};

export default MyChats;
