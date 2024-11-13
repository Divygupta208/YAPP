import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const GroupCreationModal = ({ isOpen, onClose, onCreateGroup, users = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const groupDesc = useRef();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleCreateGroup = () => {
    onCreateGroup(groupName, groupDesc.current.value, selectedUsers);
    setGroupName("");
    setSelectedUsers([]);
    setSearchUser("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 w-96"
      >
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>

        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Search users"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Description"
          ref={groupDesc}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="max-h-32 overflow-y-auto mb-4 border border-gray-200 rounded">
          {users
            .filter((user) =>
              user.username.toLowerCase().includes(searchUser.toLowerCase())
            )
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleUserSelection(user.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  readOnly
                  className="mr-2"
                />
                <span>{user.username}</span>
              </div>
            ))}
        </div>

        <button
          onClick={handleCreateGroup}
          className="w-full py-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Create Group
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default GroupCreationModal;
