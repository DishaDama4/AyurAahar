import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SharedPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({});  // ✅ ADDED
  const [searchTerm, setSearchTerm] = useState('');
  const [isLikedStates, setIsLikedStates] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem('access_token');

 useEffect(() => {
  const fetchSharedRecipes = async () => {
    try {
      setLoading(true);
      const token = getJwtToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ NEW API - Gets ACTUAL recipe details
      const response = await fetch(`http://127.0.0.1:8000/api/user-shared-recipes/?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("📡 Shared API status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ SHARED RECIPES:", data);
        console.log("📋 Recipe count:", data.recipes?.length || 0);
        
        const recipesList = data.recipes || [];
        
        // Initialize likes
        const likes = {};
        recipesList.forEach(recipe => {
          likes[recipe.id] = recipe.liked || recipe.is_liked || false;
        });
        
        setRecipes(recipesList);
        setStats({ shared_count: data.count || recipesList.length });
        
      } else {
        console.log("❌ API failed:", response.status);
        setRecipes([]);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  fetchSharedRecipes();
}, [navigate]);

  const toggleHeart = async (recipeId) => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/recipe/${recipeId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLikedStates(prev => ({
          ...prev,
          [recipeId]: data.liked
        }));
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    !searchTerm || 
    recipe.recipe_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">
          <i className="fa-solid fa-share text-3xl mb-2 block"></i>
          Loading shared recipes...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col justify-between">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 flex-1 pb-20">
        {/* Header */}
        <div className="py-6 flex items-center justify-between md:justify-start">
          <Link to="/profile" className="text-[#964B00] hover:text-[#FF9933]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="brand text-[#964B00] text-2xl md:text-3xl font-bold">AyurAahar</span>
          <span className="w-6 h-6 md:hidden"></span>
        </div>

        {/* Title with count */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#964B00]">
            Shared Recipes ({stats.shared_count || 0})
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Recipes you've shared ({stats.shared_count || 0} total)
          </p>
        </div>

        {/* Search */}
        <input 
          type="text" 
          placeholder="Search shared recipes..."
          className="w-full px-4 py-2 rounded-xl border border-[#FF9933] bg-white shadow mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Content */}
     {/* Content - SAME GRID STRUCTURE */}
<div className="mb-6">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {recipes.length > 0 && filteredRecipes.length > 0 ? (
      filteredRecipes.map(recipe => (
        <div key={recipe.id} className="bg-white rounded-xl shadow p-3 hover:shadow-lg transition relative">
          {/* Heart - SAME as liked page */}
          <button 
            onClick={() => toggleHeart(recipe.id)} 
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80"
          >
            <i className={`fa-heart text-xl ${
              isLikedStates[recipe.id] || recipe.liked
                ? 'fa-solid text-red-500'
                : 'fa-regular text-gray-400'
            }`} />
          </button>
          
          {/* Image - EXACT SAME */}
          <img 
            src={recipe.image || recipe.recipe_image || "https://via.placeholder.com/120x120?text=🍲"}
            alt={recipe.recipe_name}
            className="w-full h-48 rounded-xl object-cover mb-2 border-4 border-[#FF9933]"
            onError={(e) => e.target.src = "https://via.placeholder.com/120x120?text=🍲"}
          />
          
          {/* Name - EXACT SAME */}
          <h3 className="font-bold text-sm mb-1">{recipe.recipe_name || recipe.name || 'Recipe'}</h3>
          
          {/* Category - EXACT SAME */}
          <p className="text-xs text-[#964B00] mb-2">{recipe.category_name || 'Category'}</p>
          
          {/* Button - EXACT SAME */}
          <Link 
            to={`/recipe/${recipe.id}`}
            className="px-3 py-2 text-xs bg-[#FF9933] text-white rounded font-semibold hover:bg-[#964B00]"
          >
            See Recipe
          </Link>
        </div>
      ))
    ) : (
      <div className="col-span-full text-center py-20">
        <i className="fa-regular fa-share-from-square text-6xl text-gray-300 mb-6"></i>
        <h2 className="text-xl font-bold text-[#964B00] mb-4">
          {stats.shared_count > 0 
            ? `${stats.shared_count} Shared Recipes!`
            : "No shared recipes yet"
          }
        </h2>
        <p className="text-gray-600 mb-8">
          {stats.shared_count > 0 
            ? "✅ Recipes shared successfully!" 
            : "Share recipes from detail pages"
          }
        </p>
        {stats.shared_count === 0 && (
          <Link to="/home" className="px-6 py-2 bg-[#FF9933] text-white rounded-xl font-bold">
            Find Recipes
          </Link>
        )}
      </div>
    )}
  </div>
</div>

 

      </div>

      {/* Bottom Navigation */}
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
              <rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>
            </svg>
            <span className="text-xs">Categories</span>
          </Link>
          <Link to="/liked" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z"/>
            </svg>
            <span className="text-xs">Liked</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-[#FF9933] font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default SharedPage;
