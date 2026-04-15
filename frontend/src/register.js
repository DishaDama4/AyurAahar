import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    // Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=])[A-Za-z\d@$!%*?&#^()\-_+=]{8,}$/;     if (!passwordRegex.test(password)) 
      { 
        setMessage("Password must be at least 8 characters long, include one uppercase letter, one number, and one special symbol."); 
        return;
       }
 
    try { const response = await fetch("https://ayuraahar.onrender.com/api/register/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, email, password }),
});


      if (response.ok) {
        setMessage("User registered successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        setMessage("Error: " + JSON.stringify(errorData));
      }
    } catch (err) {
      setMessage("Failed to connect to server");
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF4E1] to-[#FFEBCD] flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-2 my-6">
        <div className="bg-[#FF9933] rounded-t-xl p-6 relative overflow-hidden">
          <span className="brand text-white font-bold text-2xl mb-1 block tracking-wide">
            AyurAahar
          </span>
          <h1 className="text-[#FFEBCD] font-bold text-lg md:text-xl mb-1 leading-snug">
            Wholesome Indian recipes, crafted for healthy living
          </h1>
        </div>
   
   {message && (
  <div
    className={`p-4 ml-4 mr-4 mt-4 text-sm rounded-lg ${
      message.includes("successfully")
        ? "text-green-700 bg-green-100"
          : "text-red-700 bg-red-100"
      }`}
    >
      {message}
    </div>
  )}


        <div className="p-6">
          <form id="signupForm" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="usernameSignup"
                className="block mb-2 text-sm text-[#964B00] font-medium"
              >
                Username
              </label>
              <input
                type="text"
                id="usernameSignup"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="emailSignup"
                className="block mb-2 text-sm text-[#964B00] font-medium"
              >
                Email
              </label>
              <input type="email"
                id="emailSignup"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="passwordSignup"
                className="block mb-2 text-sm text-[#964B00] font-medium">
                Password
              </label>
              <input type="password" id="passwordSignup"  value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your password"
                required
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPasswordSignup"
                className="block mb-2 text-sm text-[#964B00] font-medium"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPasswordSignup"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-[#FF9933] hover:bg-[#964B00] transition"
            >
              Sign Up
            </button>
          </form>
 

          <div className="text-center mt-8 text-[#964B00] font-semibold cursor-pointer">
           <span onClick={() => navigate("/login")}>
            Already have an account? Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
