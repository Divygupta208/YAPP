import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { authAction } from "../../store/store";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const nameRef = useRef();
  const emailPhoneRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    usererror: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({ name: "", email: "", password: "", usererror: "" });

    const emailOrPhone = emailPhoneRef.current.value;
    const password = passwordRef.current.value;
    const username = isSignup ? nameRef.current.value : null;
    const phoneno = isSignup ? phoneRef.current.value : null;

    let isValid = true;
    const newErrors = {};

    if (isSignup && !username) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const phonePattern = /^\d{10}$/;

    if (!emailOrPhone) {
      newErrors.emailOrPhone = "Email or phone is required";
      isValid = false;
    } else if (
      !emailPattern.test(emailOrPhone) &&
      !phonePattern.test(emailOrPhone)
    ) {
      newErrors.emailOrPhone = "Invalid email or phone number";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    const authData = isSignup
      ? {
          username,
          email: emailOrPhone,
          phoneno,
          password,
        }
      : {
          emailOrPhone,
          password,
        };

    const url = isSignup
      ? "https://yapp.zapto.org/api/user/signup"
      : "https://yapp.zapto.org/api/user/login";

    try {
      setLoading(true);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        const userData = {
          name: data.username,
          email: data.usermail,
          phoneno: data.phoneno,
        };

        if (isSignup) {
          toast.success("Signup successful!");
        } else {
          toast.success("Login successful!");
          dispatch(authAction.setToken(data.token));
          dispatch(authAction.setUserData(userData));
          navigate("/chat");
        }
      } else {
        if (response.status === 404) {
          toast.error("User not found");
        } else if (response.status === 401) {
          toast.error("Incorrect password or email");
        } else if (response.status === 409) {
          toast.error("User already exists with this email");
        } else {
          toast.error(data.message);
        }
        setErrors(newErrors);
      }
    } catch (error) {
      toast.error(`${isSignup ? "Signup" : "Login"} failed!`);
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
        className="relative z-10 mb-0 lg:mb-0 bg-white shadow-lg rounded-lg p-4 lg:p-8 w-80 h-[75vh] lg:h-full lg:w-full max-w-lg"
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
          {isSignup ? "Join the Chat!" : "Login to Chat"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {isSignup && (
            <div>
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
                ref={nameRef}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
                placeholder="Enter your username"
                required={isSignup}
                whileFocus={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-gray-600 mb-2"
              htmlFor="emailPhone"
            >
              {isSignup ? "Email" : "Email/Phone"}
            </label>
            <motion.input
              type="text"
              name="emailPhone"
              id="emailPhone"
              ref={emailPhoneRef}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
              placeholder={
                isSignup ? "Enter your email" : "Enter your email or phone"
              }
              required
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            {errors.emailOrPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>
            )}
          </div>

          {isSignup && (
            <div>
              <label
                className="block text-sm font-medium text-gray-600 mb-2"
                htmlFor="phoneno"
              >
                Phone Number
              </label>
              <motion.input
                type="text"
                name="phoneno"
                id="phoneno"
                ref={phoneRef}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
                placeholder="Enter your phone number"
                required={isSignup}
                whileFocus={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

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
              ref={passwordRef}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition duration-300"
              placeholder="Enter your password"
              required
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {!isSignup && (
            <motion.button
              type="button"
              className="text-sm text-blue-600 mb-4 hover:underline"
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info("Forgot password feature coming soon!")}
            >
              Forgot Password?
            </motion.button>
          )}

          <motion.button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading
              ? isSignup
                ? "Signing Up..."
                : "Logging In..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </motion.button>

          <motion.p
            className="text-sm text-gray-600 mt-4 text-center cursor-pointer hover:underline"
            onClick={() => setIsSignup((prevState) => !prevState)}
            whileTap={{ scale: 0.95 }}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don’t have an account? Sign Up"}
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
