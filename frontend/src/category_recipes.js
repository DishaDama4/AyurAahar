import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import BottomNavbar from "./BottomNav";
const CategoryRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
   const [isLikedStates, setIsLikedStates] = useState({});
  const navigate = useNavigate();
  const { categoryId } = useParams(); // Get category ID from URL: /categories/1

  const getJwtToken = () => localStorage.getItem('access_token');
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

  useEffect(() => {
    const fetchCategoryRecipes = async () => {
      try {
        setLoading(true);
        const token = getJwtToken();
        
        const response = await fetch(
          `https://ayuraahar.onrender.com/api/categories/${categoryId}/recipes/`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        

        if (response.ok) {
          const data = await response.json();
          setRecipes(data.recipes || []);
          setCategoryName(data.category_name || `Category ${categoryId}`);
        } else {
          setRecipes([]);
          setCategoryName("Category Recipes");
        }
      } catch (error) {
        console.error("Category fetch error:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryRecipes();
    }
  }, [categoryId, navigate]);

  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">
          Loading recipes...
        </div>
      </div>
    );
  }
  


  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col">
      {/* Top bar - EXACT SAME */}
      <div className="flex items-center justify-between px-4 py-4">
        <button 
          onClick={() => navigate('/categories')} 
          className="text-[#964B00]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="brand text-2xl text-[#964B00]">AyurAahar</span>
        <span className="w-6 h-6"></span>
      </div>

      {/* Page heading - EXACT SAME */}
      <div className="px-4 mb-6">
        <h1 className="text-xl font-semibold text-[#964B00]">
          {categoryName} Recipes
        </h1>
        <p className="text-sm text-gray-600">Explore all recipes under this category</p>
      </div>

      {/* Recipe grid - EXACT SAME */}
      <div className="mb-6 px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-white rounded-xl shadow p-3 flex flex-col items-center relative hover:shadow-lg transition transform hover:scale-105"
              >

                 {/* ✅ HEART BUTTON */}
                                       
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
                  src={recipe.image?.url || recipe.image || "https://via.placeholder.com/120x120?text=🍲"}
                  alt={recipe.recipe_name}
                  className="w-full max-w-[12rem] h-48 border-4 border-[#FF9933] rounded-xl shadow-lg object-cover mb-2 mt-2"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120x120?text=🍲";
                  }}
                />
                <div className="font-bold text-center mb-1">
                  {recipe.recipe_name}
                </div>
                <div className="text-xs text-[#964B00] mb-2">
                  {recipe.category_name?.category_name || recipe.category_name}
                </div>
                <Link 
                  to={`/recipe_details/${recipe.id}`}
                  className="mt-2 px-3 py-2 text-sm rounded bg-[#FF9933] text-white font-semibold hover:bg-[#964B00] transition"
                >
                  See Recipe
                </Link>
              </div>
            ))
          ) : (
            <p className="col-span-2 md:col-span-3 text-center text-gray-500 py-20">
              No recipes available yet.
            </p>
          )}
        </div>
      </div>
 <BottomNavbar/>
    </div>
  );
};

export default CategoryRecipes;
