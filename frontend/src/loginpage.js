import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";  // ✅ ADD useNavigate
 
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();  // ✅ FOR REDIRECT

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };// LoginPage.jsx - Store token in localStorage
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("https://ayuraahar.onrender.com/api/login/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    console.log("LOGIN:", data);
    
    if (res.ok) {
      // ✅ STORE JWT TOKEN
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      navigate("/home");
    }
  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="bg-gradient-to-br from-[#FFF4E1] to-[#FFEBCD] flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-2 my-6">
        {/* Header - UNCHANGED */}
        <div className="bg-[#FF9933] rounded-t-xl p-6 relative overflow-hidden">
          <span className="brand text-white font-bold text-2xl mb-1 block tracking-wide">
            AyurAahar
          </span>
          <h1 className="text-[#FFEBCD] font-bold text-lg md:text-xl mb-1 leading-snug">
            Wholesome Indian recipes, crafted for healthy living
          </h1>
          {/* Decorative Icons - UNCHANGED */}
          <svg className="absolute right-3 top-3 w-10 h-10 opacity-20" fill="none" stroke="#964B00" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2C8 6 6 10 6 14c0 4 2 8 6 8s6-4 6-8c0-4-2-8-6-12z" />
          </svg>
          <svg className="absolute left-6 bottom-6 w-12 h-12 opacity-10" fill="none" stroke="#FFEBCD" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="8" width="16" height="10" rx="2" />
            <path d="M4 8h16M8 4h8" />
          </svg>
        </div>

        {/* Form */}
        <div className="p-6">
          <form id="loginForm" onSubmit={handleSubmit}>
            {/* Messages - UNCHANGED */}
            {messages.length > 0 && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                {messages.map((msg, idx) => (
                  <span key={idx} className="font-medium block">{msg}</span>
                ))}
              </div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="usernameLogin" className="block mb-2 text-sm text-[#964B00] font-medium">
                Username
              </label>
              <input
                type="text"
                id="usernameLogin"  // ✅ FIXED ID
                name="usernameLogin"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="passwordLogin" className="block mb-2 text-sm text-[#964B00] font-medium">
                Password
              </label>
              <input
                type="password"
                id="passwordLogin"
                name="passwordLogin"  // ✅ FIXED NAME
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              />
            </div>

            {/* Forgot Password - UNCHANGED */}
            <div className="text-sm text-[#964B00] mb-6 text-right cursor-pointer hover:underline"
                 onClick={() => alert("Password recovery feature coming soon....")}>
              Forgotten password?
            </div>

            {/* ✅ FIXED BUTTON - NO <Link> INSIDE! */}
            <button
              type="submit"
              name="login"
              className="w-full py-3 mt-2 rounded-xl text-white font-semibold bg-[#964B00] hover:bg-[#FF9933] transition"
            >
              Log in
            </button>

            {/* ✅ FIXED Link - OUTSIDE button */}
            <div className="text-center mt-8 text-[#964B00] font-semibold">
              <Link to="/">Don't have an account? Create Account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
