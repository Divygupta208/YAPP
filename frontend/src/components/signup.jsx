import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    // Basic validation
    if (!username || !email || !password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      // Your API call to register user
      // Example: await axios.post('/api/signup', formData);
      toast.success("Signup successful!");
    } catch (error) {
      toast.error("Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-[#f6ba98]">
      <img
        src={"chat-chat-svgrepo-com.svg"}
        className="absolute top-0 left-50 w-[80vw] lg:w-auto opacity-25"
        alt="wave background"
      />

      <motion.div
        className="relative z-10 mb-0 lg:mb-0 bg-white  shadow-lg rounded-lg p-4 lg:p-8 w-80 h-[75vh] lg:h-full lg:w-full max-w-lg "
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src={"chat-chat-svgrepo-com.svg"}
          alt="Chat Illustration"
          className="w-20 h-20 mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        <h2 className="text-xl lg:text-2xl font-bold text-center text-gray-700 mb-6">
          Join the Chat!
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="">
            <label
              className="block text-sm font-medium text-gray-600 mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <motion.input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
              placeholder="Enter your username"
              required
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <div className="">
            <label
              className="block text-sm font-medium text-gray-600 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <motion.input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
              placeholder="Enter your email"
              required
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-600 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <motion.input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
              placeholder="Enter your password"
              required
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
