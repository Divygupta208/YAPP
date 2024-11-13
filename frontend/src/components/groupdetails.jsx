import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GroupDetails = ({ groupId, onClose }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupInfo, setGroupInfo] = useState({});
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]); // List of all users
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editGroupName, setEditGroupName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://localhost:3000/api/groups/${groupId}/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch group details");

        const data = await response.json();
        console.log(data);
        setIsAdmin(data.isAdmin);
        setGroupInfo(data.group);
        setEditGroupName(data.group.name);
        setEditDescription(data.group.description);
        setMembers(data.members);
      } catch (error) {
        console.error("Error fetching group details:", error);
        setError("Unable to load group details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailableUsers = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:3000/api/user/allusers");
        const users = await response.json();
        console.log("users", users);
        setAvailableUsers(users.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAvailableUsers();
    fetchGroupDetails();
  }, [groupId]);

  const handleAddUsers = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/add-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: selectedUsers }),
        }
      );
      if (!response.ok) throw new Error("Failed to add users");
      const data = await response.json();
      console.log(data);
      setMembers(data.members);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error adding users:", error);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/remove-member`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId }),
        }
      );
      if (!response.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/update-member-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId: memberId, role: newRole }),
        }
      );
      if (!response.ok) throw new Error("Failed to update member role");
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error("Error updating member role:", error);
    }
  };

  // Update group info
  const handleUpdateGroupInfo = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editGroupName,
            description: editDescription,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update group information");
      setGroupInfo((prev) => ({
        ...prev,
        name: editGroupName,
        description: editDescription,
      }));
    } catch (error) {
      console.error("Error updating group information:", error);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const modalVariants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: { opacity: 1, y: "0" },
    exit: { opacity: 0, y: "-100%" },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="group-details bg-white p-6 rounded shadow-lg w-[60vw] relative"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="text-red-500 font-bold absolute top-2 right-2 text-2xl"
          >
            X
          </button>

          <h2 className="text-xl font-bold mb-3">Group Info</h2>
          <p className="text-center bg-rose-200">
            <strong>{groupInfo.name}</strong>
          </p>
          <p className="text-center font-extralight text-gray-500 text-sm">
            <strong>{groupInfo.description}</strong>
          </p>

          {isAdmin && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Edit Group Info</h3>
              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="border rounded p-2 w-full mt-2"
                placeholder="Group Name"
              />
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="border rounded p-2 w-full mt-2"
                placeholder="Group Description"
              />
              <button
                onClick={handleUpdateGroupInfo}
                className="bg-blue-500 text-white p-2 rounded mt-2"
              >
                Update Info
              </button>
            </div>
          )}

          <h3 className="text-lg font-semibold mt-4">Members</h3>
          <ul className="mb-4">
            {members.map((member) => (
              <li key={member.id} className="flex items-center mb-2">
                <img
                  src={member.profilePicture || "/default-avatar.svg"}
                  alt={member.name}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className="font-medium">{member.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({member.role})
                </span>
                {isAdmin && (
                  <div className="ml-auto flex gap-2">
                    {member.role !== "admin" && (
                      <button
                        onClick={() => handleUpdateRole(member.id, "admin")}
                        className="text-blue-500 text-sm"
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {isAdmin && (
            <div className="admin-actions mt-4">
              <h3 className="text-lg font-semibold">Add New Members</h3>
              <ul className="border rounded p-2 h-24 overflow-scroll">
                {availableUsers.map((user) => (
                  <li
                    key={user.id}
                    className={`p-2 cursor-pointer ${
                      selectedUsers.includes(user.id) ? "bg-blue-200" : ""
                    }`}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    {user.username} ({user.email})
                  </li>
                ))}
              </ul>
              <button
                onClick={handleAddUsers}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                Add Selected Users
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupDetails;
