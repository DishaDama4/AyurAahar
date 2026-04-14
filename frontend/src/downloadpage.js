import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DownloadsPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLikedStates, setIsLikedStates] = useState({});

  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem('access_token');


  const toggleHeart = async (recipeId) => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://ayuraahar.onrender.com//recipe/${recipeId}/like/`, {
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



  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const token = getJwtToken();

        if (!token) {
          navigate('/login');
          return;
        }

        // TODO: Replace with your downloads API
        const response = await fetch(`https://ayuraahar.onrender.com//api/downloads/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecipes(data.recipes || []);
        }
      } catch (error) {
        console.error("Downloads error:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [navigate]);

  const filteredRecipes = recipes.filter(recipe =>
    !searchTerm ||
    recipe.recipe_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">Loading downloads...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col justify-between">
      {/* Main Content Wrapper */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 flex-1 pb-20">

        {/* Logo/Header with Back Button */}
        <div className="py-6 flex items-center justify-between md:justify-start">
          <Link to="/profile" className="text-[#964B00] hover:text-[#FF9933] transition-colors md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="brand text-[#964B00] text-2xl md:text-3xl font-bold">AyurAahar</span>
          <span className="w-6 h-6 md:hidden"></span>
        </div>

        {/* Page heading */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#964B00]">Recipes Downloaded By You</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search recipes, ingredients..."
            className="w-full px-4 py-2 rounded-xl border border-[#FF9933] bg-white shadow focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Recipe Cards */}
        <div className="mb-6">
          <h2 className="font-semibold text-[#964B00] mb-2 text-lg">Your Downloaded Recipes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-xl shadow p-3 flex flex-col items-center relative hover:shadow-lg transition transform hover:scale-105">
                  {/* Heart - SAME as liked page */}
                  <button
                    onClick={() => toggleHeart(recipe.id)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80"
                  >
                    <i className={`fa-heart text-xl ${isLikedStates[recipe.id] || recipe.liked
                        ? 'fa-solid text-red-500'
                        : 'fa-regular text-gray-400'
                      }`} />
                  </button>

                  {/* Recipe Image */}
                  <img
                    src={recipe.image?.url || recipe.image || "https://via.placeholder.com/120x120?text=📥"}
                    alt={recipe.recipe_name}
                    className="w-full max-w-[12rem] h-48 border-4 border-[#FF9933] rounded-xl shadow-lg object-cover mb-2 mt-2"
                  />

                  {/* Recipe Name */}
                  <div className="font-bold text-center mb-1">
                    {recipe.recipe_name}
                  </div>

                  <div className="text-xs text-[#964B00] mb-2">
                    {recipe.category_name}
                  </div>

                  {/* See Recipe Button */}
                  <Link
                    to={`/recipe/${recipe.id}`}
                    className="mt-2 px-3 py-2 text-xs rounded bg-[#FF9933] text-white font-semibold hover:bg-[#964B00] transition"
                  >
                    See Recipe
                  </Link>
                </div>
              ))
            ) : (
              <p className="col-span-2 md:col-span-3 text-center text-gray-500 py-20">
                No downloaded recipes yet.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar (sticky) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#FF9933] z-50">
        <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
          {/* Home Icon */}
          <Link to="/home" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 12L12 3l9 9M4 10v10h16V10" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>

          {/* Categories Icon */}
          <Link to="/categories" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" />
            </svg>
            <span className="text-xs">Categories</span>
          </Link>

          {/* Liked Icon */}
          <Link to="/liked" className="flex flex-col items-center text-[#964B00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z" />
            </svg>
            <span className="text-xs">Liked</span>
          </Link>

          {/* Profile Icon */}
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

export default DownloadsPage;
