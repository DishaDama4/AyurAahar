import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const LikedPage = () => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLikedStates, setIsLikedStates] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ FIXED: Move up

  // JWT HELPER
  const getJwtToken = () => localStorage.getItem('access_token');

  // ✅ PERFECT TOGGLE HEART
  const toggleHeart = async (recipeId) => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/login');
        return;
      }

      console.log("❤️ Toggling recipe:", recipeId);
      
      const response = await fetch(`http://127.0.0.1:8000/recipe/${recipeId}/like/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Toggle result:", data);

        // ✅ OPTIMISTIC UPDATE - Visual change INSTANT
        setIsLikedStates(prev => ({ 
          ...prev, 
          [recipeId]: data.liked 
        }));
        
        // Remove if unliked (Liked page only shows liked)
        setLikedRecipes(prev => 
          prev.map(recipe =>
            recipe.id === recipeId 
              ? { ...recipe, liked: data.liked }
              : recipe
          ).filter(recipe => recipe.id !== recipeId || data.liked)
        );
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
    }
  };

  useEffect(() => {
  const fetchLikedRecipes = async () => {
    try {
      setLoading(true);
      const token = getJwtToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log("🔍 Fetching liked recipes...");
      const response = await fetch("http://127.0.0.1:8000/api/recipes/liked/", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("📡 Status:", response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("✅ FULL DATA:", data);  // ✅ You SEE this!
        
        // ✅ FIXED: Handle response structure
        const recipesList = data.recipes || data.results || data || [];
        console.log("📋 Recipes list:", recipesList);  // ✅ Check length
        
        // ✅ Initialize like states
        const likes = {};
        recipesList.forEach(recipe => {
          likes[recipe.id] = recipe.liked || true;
        });
        
        // ✅ CRITICAL: Update BOTH states
        setLikedRecipes(recipesList);  // ✅ This was missing!
        setIsLikedStates(likes);
        
        console.log("✅ States updated - recipes count:", recipesList.length);
      }
    } catch (error) {
      console.error("❌ Liked error:", error);
      setLikedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  fetchLikedRecipes();
}, [navigate]);


  const filteredRecipes = likedRecipes.filter(recipe =>
    recipe.recipe_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  if (loading) {
 
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">
          <i className="fa-solid fa-heart text-3xl mb-2 block"></i>
          Loading your liked recipes...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col justify-between">
      {/* Main Content Wrapper */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 flex-1 pb-20">
        {/* Logo/Header */}
        <div className="py-6 text-center md:text-left">
          <span className="brand text-[#964B00] text-2xl md:text-3xl font-bold">
            AyurAahar
          </span>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search your liked recipes..."
            className="w-full px-4 py-2 rounded-xl border border-[#FF9933] bg-white shadow focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Recipe cards */}
        <div className="mb-6">
          <h2 className="font-semibold text-[#964B00] mb-2 text-lg">
            Your Liked Recipes ({filteredRecipes.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow p-3 flex flex-col items-center relative hover:shadow-lg transition transform hover:scale-105"
                >
                                     {/* heart button  */}
                    <button
                      onClick={() => {
                        console.log("🔥 Heart clicked for recipe:", recipe.id);
                        toggleHeart(recipe.id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1"
                    >
                      {/*  ✅ FIXED - Use local state */}
                      <i className={`fa-heart text-xl ${isLikedStates[recipe.id] || recipe.liked  // ✅ Both sources
                        ? 'fa-solid text-red-500'
                        : 'fa-regular text-gray-400'
                        }`} />

                    </button>

                  <img
                    src={recipe.image || "https://via.placeholder.com/120x120/FFEBCD/964B00?text=🍲"}
                    alt={recipe.recipe_name}
                    className="w-full max-w-[12rem] h-48 border-4 border-[#FF9933] rounded-xl shadow-lg object-cover mb-2 mt-2"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/120x120/FFEBCD/964B00?text=🍲";
                    }}
                  />
                  <div className="font-bold text-center text-sm mb-1">
                    {recipe.recipe_name}
                  </div>
                  <div className="text-xs text-[#964B00] flex items-center gap-2 font-bold mb-2">
                    <i className={`fa-solid ${recipe.category_icon || 'fa-utensils'} text-[#FF9933]`}></i>
                    <span>{recipe.category_name}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/recipe_details/${recipe.id}`)}
                    className="mt-2 px-3 py-2 text-xs rounded bg-[#FF9933] text-white font-semibold hover:bg-[#964B00] transition"
                  >
                    See Recipe
                  </button>
                  
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-3 text-center py-20">
                <i className="fa-regular fa-heart text-6xl text-gray-300 mb-6"></i>
                <h2 className="text-xl font-semibold text-[#964B00] mb-4">
                  {searchTerm ? "No matching liked recipes" : "No liked recipes yet"}
                </h2>
                <p className="text-gray-600 mb-8">
                  {searchTerm
                    ? "Try a different search term"
                    : "Like some recipes on the home page to see them here"
                  }
                </p>
                <Link
                  to="/home"
                  className="inline-block px-8 py-3 bg-[#FF9933] text-white rounded-xl font-semibold hover:bg-[#964B00] transition shadow-lg"
                >
                  Discover Recipes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - SAME */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#FF9933] shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
          <Link to="/home" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 12L12 3l9 9M4 10v10h16V10" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="7" height="7" />
              <rect x="13" y="4" width="7" height="7" />
              <rect x="4" y="13" width="7" height="7" />
              <rect x="13" y="13" width="7" height="7" />
            </svg>
            <span className="text-xs">Categories</span>
          </Link>
          <Link to="/liked" className="flex flex-col items-center text-[#FF9933] font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z" />
            </svg>
            <span className="text-xs">Liked</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default LikedPage;
