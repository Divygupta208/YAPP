import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GroupCreationModal from "./groupmodal";
import ChatWindow from "./chatwindow";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";

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

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://my-api.zapto.org/yapp/api/user/allusers",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      const filteredUsers = data.data
        .filter((user) => user.id !== Number(currentUserId))
        .map((user) => ({
          ...user,
          lastMessage: user.lastMessage || "No messages yet",
        }));
      setUsers(filteredUsers);
      setFilteredChats(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(
        "http://my-api.zapto.org/yapp/api/groups/usergroups",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      const formattedGroups = data?.map((group) => ({
        ...group,
        lastMessage: group.lastMessage || "No messages yet",
      }));
      setGroups(formattedGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  useEffect(() => {
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
    try {
      const response = await fetch(
        "http://my-api.zapto.org/yapp/api/groups/create",
        {
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
        }
      );
      const newGroup = await response.json();
      setGroups((prevGroups) => [...prevGroups, newGroup]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleChatClick = (chat) => setSelectedChat(chat);

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
          {/* Users */}
          {filteredChats.map((user) => (
            <motion.div
              key={user.id}
              onClick={() => handleChatClick(user)}
              className="p-4 border-b cursor-pointer hover:bg-indigo-100 rounded-lg flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: user.id * 0.1 }}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="rounded-full w-10 h-10"
                />
              ) : (
                <img src="/default-avatar.svg" width={12} />
              )}
              <div className="flex flex-col">
                <div className="font-semibold">{user.username}</div>
                <div className="text-gray-500 text-sm truncate">
                  {user.lastMessage}
                </div>
              </div>
              {onlineUsers.includes(user.id) && (
                <img
                  className="ml-auto"
                  src="/dot-small-svgrepo-com.svg"
                  width={30}
                />
              )}
            </motion.div>
          ))}

          {/* Groups */}
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
                <img src={group.profile} className="w-10 h-10 rounded-full" />
              ) : (
                <img src="/group-svgrepo-com.svg" width={18} />
              )}
              <div className="flex flex-col">
                <div className="font-semibold">{group.name}</div>
                <div className="text-gray-500 text-sm truncate">
                  {group.lastMessage}
                </div>
              </div>
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
