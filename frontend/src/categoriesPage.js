import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ JWT HELPER (same as HomePage)
  const getJwtToken = () => localStorage.getItem('access_token');

  // ✅ FIXED useEffect - JWT auth + loading
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = getJwtToken();
        
        if (!token) {
          navigate('/login');
          return;
        }

        console.log("🔍 Fetching categories with JWT...");
        const response = await fetch("https://ayuraahar.onrender.com//api/categories/", {
          headers: {
            'Authorization': `Bearer ${token}`,        // ✅ JWT
            'Content-Type': 'application/json',
          }
        });

        console.log("📡 Categories status:", response.status);
        
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        const data = await response.json();
        console.log("✅ Categories data:", data);
        
        // Handle different response structures (same as HomePage)
        setCategories(data.categories || data.results || data || []);
      } catch (error) {
        console.error("❌ Categories error:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  // ✅ Loading state (minimal change)
  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header - YOUR ORIGINAL - UNCHANGED */}
      <header className="mb-8 w-full max-w-md text-center">
        <span className="brand text-[#964B00] text-3xl font-bold">AyurAahar</span>
        <h1 className="mt-2 text-[#964B00] font-semibold text-xl">Explore Categories</h1>
      </header>

      {/* FIXED: 2 PER ROW - YOUR STYLING - UNCHANGED */}
      <section className="mt-10 mb-20 px-6 md:px-16 w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-6 justify-items-start">
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <Link
                key={category.id}
                 to={`/categories/${category.id}`} 
                className="category-card text-center p-4 rounded-lg bg-white shadow hover:shadow-lg transition transform hover:scale-105 w-full"
              >
                <i className={`fa-solid ${category.icon} fa-3x mx-auto mb-2 text-[#FF9933]`}></i>
                <p className="text-sm font-medium text-[#964B00]">
                  {category.category_name}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-2">No categories available.</p>
          )}
        </div>
      </section>

      {/* YOUR ORIGINAL Bottom Nav - UNCHANGED */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#FF9933] z-50">
        <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
          <Link to="/home" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 12L12 3l9 9M4 10v10h16V10" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" />
            </svg>
            <span className="text-xs">Categories</span>
          </Link>
          <Link to="/liked" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z" />
            </svg>
            <span className="text-xs">Liked</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CategoriesPage;
