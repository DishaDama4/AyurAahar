import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import BottomNavbar from "./BottomNav";
const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLikedStates, setIsLikedStates] = useState({});
  const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const messages = [
    "Eat seasonal, eat local. Indian millet dishes fuel your roots and health.",
    "Ayurveda wisdom: Food is medicine. Reconnect with heritage grains for better nutrition.",
    "From festivals to daily meals, our culinary culture blends taste, tradition, and vitality. Discover & share!"
  ];

  // JWT token helper
  const getJwtToken = () => localStorage.getItem('access_token');

  // ✅ PERFECT loadData function
  const loadData = async () => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);

      // Fetch recipes
      const recipeRes = await fetch("https://ayuraahar.onrender.com/api/recipes/", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!recipeRes.ok) throw new Error('Recipes fetch failed');
      const recipeData = await recipeRes.json();

      // Initialize likes state ✅ FIXED
      const likes = {};
      if (recipeData.recipes) {
        recipeData.recipes.forEach(recipe => {
          likes[recipe.id] = recipe.is_liked || recipe.liked || false;
        });
        setRecipes(recipeData.recipes);
      } else {
        setRecipes([]);
      }
      setIsLikedStates(likes);

      // Fetch categories
      const catRes = await fetch("https://ayuraahar.onrender.com/api/categories/", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!catRes.ok) throw new Error('Categories fetch failed');
      const catData = await catRes.json();
      
      console.log("🔍 Categories response:", catData);

      // Handle different category response structures
      if (catData.categories) {
        setCategories(catData.categories);
      } else if (catData.results) {
        setCategories(catData.results);
      } else if (Array.isArray(catData)) {
        setCategories(catData);
      } else {
        setCategories([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Load data error:", error);
      setLoading(false);
    }
  };

  // ✅ PERFECT toggleHeart - CORRECT URL
  const toggleHeart = async (recipeId) => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/login');
        return;
      }

      console.log("❤️ Toggling recipe:", recipeId);
      
      const response = await fetch(`https://ayuraahar.onrender.com/recipe/${recipeId}/like/`, {
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

        // ✅ UPDATE STATES IMMEDIATELY - Visual feedback
        setIsLikedStates(prev => ({ 
          ...prev, 
          [recipeId]: data.liked 
        }));
        
        setRecipes(prev =>
          prev.map(recipe =>
            recipe.id === recipeId 
              ? { ...recipe, liked: data.liked, is_liked: data.liked }
              : recipe
          )
        );
      } else {
        console.error("❌ Toggle failed:", response.status);
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  

  const filteredRecipes = recipes.filter(recipe =>
    !searchTerm || 
    recipe.recipe_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .brand { font-family: 'Lobster', cursive; }
      `}</style>
      
      <div className="bg-[#FFEBCD] min-h-screen flex flex-col justify-between">
        {/* Main Content Wrapper - 100% SAME STYLING */}
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 flex-1 pb-20">
          {/* Logo/Header */}
          <div className="py-6 text-center md:text-left">
            <span className="brand text-[#964B00] text-2xl md:text-3xl font-bold">AyurAahar</span>
          </div>
           
           
        {/* Search */}
        <input 
          type="text" 
          placeholder="Search shared recipes..."
          className="w-full px-4 py-2 rounded-xl border border-[#FF9933] bg-white shadow mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
          
          {/* Slider */}
          <div className="mb-4">
            <div className="relative bg-[#FF9933] rounded-xl text-white overflow-hidden">
              <div className="p-4 min-h-[96px] transition-all duration-500">
                {messages[currentSlide]}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {messages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full bg-white ${idx === currentSlide ? 'opacity-100' : 'opacity-60'}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recipe cards - SAME HTML */}
   {/* Recipe cards - SEARCH WORKING */}
<div className="mb-6">
  <h2 className="font-semibold text-[#964B00] mb-2 text-lg">Today's Picks</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {filteredRecipes.length > 0 ? (  //✅ filteredRecipes
      filteredRecipes.map(recipe => (  //{/* ✅ filteredRecipes */}
        <div key={recipe.id} className="bg-white rounded-xl shadow p-3 flex flex-col items-center relative hover:shadow-lg transition transform hover:scale-105">
          {/* Heart button + rest SAME */}
          <button onClick={() => toggleHeart(recipe.id)} className="absolute top-2 right-2 z-10 p-1">
            <i className={`fa-heart text-xl ${isLikedStates[recipe.id] || recipe.liked
              ? 'fa-solid text-red-500'
              : 'fa-regular text-gray-400'
            }`} />
          </button>
          
          <img src={recipe.image || "https://via.placeholder.com/120x120/FFEBCD/964B00?text=🍲"} 
               alt={recipe.recipe_name} 
               className="w-full max-w-[12rem] h-48 border-4 border-[#FF9933] rounded-xl shadow-lg object-cover mb-2 mt-2" />
          <div className="font-bold text-center">{recipe.recipe_name}</div>
          <div className="text-xs text-[#964B00]">{recipe.category_name}</div>
          <Link to={`/recipe_details/${recipe.id}`} className="mt-2 px-3 py-2 text-s rounded bg-[#FF9933] text-white font-semibold hover:bg-[#964B00] transition">
            See Recipe
          </Link>
        </div>
      ))
    ) : searchTerm ? (
      <p className="col-span-2 md:col-span-3 text-center text-gray-500 py-8">
        No recipes found for "{searchTerm}"
      </p>
    ) : (
      <p className="col-span-2 md:col-span-3 text-center text-gray-500 py-8">
        No recipes available yet.
      </p>
    )}
  </div>
</div>


          {/* Categories section - SAME */}
          <section className="mt-10 mb-20 px-6 md:px-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#964B00] font-semibold text-lg md:text-xl">Categories</h3>
              <Link to="/categories" className="text-sm text-[#FF9933] hover:underline">Show all</Link>
            </div>

            <div className="flex flex-wrap justify-start gap-4">
              {categories.length > 0 ? (
                 categories.slice(0, 6).map(category =>  (
                  <Link
                               key={category.id}
                                to={`/categories/${category.id}`} 
                    className="category-card text-center p-5 pl-16 pr-16 rounded-lg bg-white shadow hover:shadow-lg transition transform hover:scale-105 w-[calc(50%-0.5rem)] flex flex-col items-center"
                  >
                    <i className={`fa-solid ${category.icon || 'fa-utensils'} fa-3x mx-auto mb-2 text-[#FF9933]`}></i>
                    <p className="text-sm font-medium text-[#964B00]">{category.category_name || category.name}</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 w-full text-center py-8">No categories available.</p>
              )}
            </div>
          </section>
        </div>

   <BottomNavbar/>
        {/* Bottom Navigation
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
        </nav> */}
      </div>
    </>
  );
};

export default HomePage;
  