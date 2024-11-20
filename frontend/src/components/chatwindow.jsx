import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MessageList from "./messagelist";
import { useDispatch, useSelector } from "react-redux";
import { chatAction } from "../../store/chat-slice";
import GroupDetails from "./groupdetails";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import ChatInput from "./chatinput";

const ChatWindow = ({ selectedChat, onlineUsers, setOnlineUsers }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const [message, setMessage] = useState("");
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [socket, setSocket] = useState(null);
  // const [joinNotifications, setJoinNotifications] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).userId : null;

  useEffect(() => {
    // Create a socket connection when the component mounts
    const newSocket = io("https://yapp.zapto.org");
    setSocket(newSocket);

    if (currentUserId) {
      newSocket.emit("setUserId", currentUserId);
    }

    // Listen for online user updates
    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // const handleJoinMessage = (data) => {
    //   setJoinNotifications((prev) => [
    //     ...prev.filter((notification) => notification.userId !== data.userId),
    //     { message: data.message, userId: data.userId },
    //   ]);
    // };
    // newSocket.on("joinMessage", handleJoinMessage);

    newSocket.on("onlineRoomUsers", (usersInRoom) => {
      setRoomUsers(usersInRoom);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const username = userData ? userData.name : null;

    if (!selectedChat || !socket) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      const url = selectedChat.username
        ? `https://yapp.zapto.org/api/messages/user/${selectedChat.id}`
        : `https://yapp.zapto.org/api/messages/group/${selectedChat.id}`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        dispatch(chatAction.setMessages(data.messages));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    let roomId;
    if (selectedChat.username) {
      roomId = `room_${Math.min(currentUserId, selectedChat.id)}_${Math.max(
        currentUserId,
        selectedChat.id
      )}`;
    } else {
      roomId = `group_${selectedChat.id}`;
    }

    // Leave any previous room and join the new one
    socket.emit("leaveRoom");
    socket.emit("joinRoom", {
      roomId: roomId,
      userId: currentUserId,
      username: username,
    });
    fetchMessages();

    const handleReceiveMessage = (newMessage) => {
      console.log(newMessage);
      dispatch(chatAction.addMessage(newMessage.message));
    };
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("onlineRoomUsers", (usersInRoom) => setRoomUsers(usersInRoom));
    };
  }, [dispatch, selectedChat, socket]);

  // const handleSendMessage = async (attachment) => {
  //   const token = localStorage.getItem("token");
  //   const formData = new FormData();

  //   formData.append("content", message);
  //   formData.append(
  //     "receiverId",
  //     selectedChat.username ? selectedChat.id : null
  //   );
  //   formData.append("groupId", selectedChat.name ? selectedChat.id : null);

  //   if (attachment) {
  //     formData.append("attachment", attachment);
  //   }

  //   try {
  //     const response = await fetch("https://yapp.zapto.org/api/messages/send", {
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const data = await response.json();
  //     setMessage("");

  //     const currentUserId = token ? jwtDecode(token).userId : null;
  //     let roomId;

  //     if (selectedChat.username) {
  //       roomId = `room_${Math.min(currentUserId, selectedChat.id)}_${Math.max(
  //         currentUserId,
  //         selectedChat.id
  //       )}`;
  //     } else {
  //       roomId = `group_${selectedChat.id}`;
  //     }

  //     socket.emit("sendMessage", { roomId, message: data.message });
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   }
  // };

  const handleSendMessage = async (attachment) => {
    const token = localStorage.getItem("token");

    // Convert attachment to Base64 if it exists
    let attachmentData = null;
    if (attachment) {
      // Convert file to Base64 (you can use a FileReader API)
      const fileReader = new FileReader();
      fileReader.readAsDataURL(attachment);
      fileReader.onloadend = async () => {
        attachmentData = fileReader.result; // Base64 string of the attachment

        // Prepare message data including attachment as Base64
        const messageData = {
          content: message,
          receiverId: selectedChat.username ? selectedChat.id : null,
          groupId: selectedChat.name ? selectedChat.id : null,
          attachment: attachmentData, // Send Base64 encoded attachment
        };

        // Send message and attachment as JSON
        try {
          const response = await fetch(
            "https://yapp.zapto.org/api/messages/send",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(messageData), // Send data as JSON
            }
          );

          const data = await response.json();
          setMessage(""); // Reset the message input

          const currentUserId = token ? jwtDecode(token).userId : null;
          let roomId;

          if (selectedChat.username) {
            roomId = `room_${Math.min(
              currentUserId,
              selectedChat.id
            )}_${Math.max(currentUserId, selectedChat.id)}`;
          } else {
            roomId = `group_${selectedChat.id}`;
          }

          socket.emit("sendMessage", {
            roomId,
            message: data.message, // Ensure `data.message` is the message object returned from the backend
          });
        } catch (error) {
          console.error("Error sending message:", error);
        }
      };
    } else {
      // If there's no attachment, just send the message as usual
      const messageData = {
        content: message,
        receiverId: selectedChat.username ? selectedChat.id : null,
        groupId: selectedChat.name ? selectedChat.id : null,
      };

      try {
        const response = await fetch(
          "https://yapp.zapto.org/api/messages/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData), // Send data as JSON
          }
        );

        const data = await response.json();
        console.log("socket test", data.message);
        setMessage(""); // Reset the message input

        const currentUserId = token ? jwtDecode(token).userId : null;
        let roomId;

        if (selectedChat.username) {
          roomId = `room_${Math.min(currentUserId, selectedChat.id)}_${Math.max(
            currentUserId,
            selectedChat.id
          )}`;
        } else {
          roomId = `group_${selectedChat.id}`;
        }

        socket.emit("sendMessage", {
          roomId,
          message: data.message, // Ensure `data.message` is the message object returned from the backend
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="flex flex-col w-[70vw] mx-auto -mt-10 bg-stone-300 p-6 rounded-2xl shadow-2xl ml-3">
      <h2
        className="text-2xl text-center font-semibold mb-4 cursor-pointer text-black"
        onClick={() => setShowGroupDetails(true)}
      >
        {selectedChat?.name || selectedChat?.username}
        {selectedChat?.name && (
          <div className="room-users font-thin text-sm">
            <h3>Online Users</h3>
            <ul>
              {roomUsers.map((user) => (
                <li key={user.userId}>{user.username}</li>
              ))}
            </ul>
          </div>
        )}
      </h2>

      {!selectedChat && (
        <h1 className="text-center font-bold text-lg">Start A Conversation</h1>
      )}

      <MessageList messages={messages} />

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
      />

      {showGroupDetails && (
        <GroupDetails
          groupId={selectedChat.id}
          onClose={() => setShowGroupDetails(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
