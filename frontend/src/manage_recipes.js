import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    recipe_name: "",
    category_name: "",
    ingredients: "",
    methods: "",
    extra_tips: "",
    image_url: ""
  });
  // ✅ ADD these states
const [editImageFile, setEditImageFile] = useState(null);
const [editImagePreview, setEditImagePreview] = useState(null);

// ✅ NEW Image handler
const handleRecipeImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  }
};
  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem('access_token');

  // ✅ FIXED: Fetch data on mount
  useEffect(() => {
    fetchUserRecipes();
    fetchCategories();
  }, []);

  // ✅ FIXED: Use PROFILE endpoint (same as count works)
  const fetchUserRecipes = async () => {
  try {
    const token = getJwtToken();
    if (!token) {
      console.error("❌ No token found");
      return;
    }
    
    console.log("🔍 Fetching user recipes...");
    
    // ✅ CORRECT ENDPOINT
    const response = await fetch("https://ayuraahar.onrender.com/api/my-recipes/", {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("📡 Status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Recipes:", data);
      setRecipes(Array.isArray(data) ? data : []);
    } else {
      console.error("❌ Failed:", response.status);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    setLoading(false);
  }
};


//  Fetching the categories 
const fetchCategories = async () => {
  try {
    setLoading(true);
    const token = getJwtToken();
    
    const response = await fetch("https://ayuraahar.onrender.com/api/categories/", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log("📡 Categories status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Categories:", data);
      // ✅ Matches your Django Response format: {"categories": [...]}
      setCategories(data.categories || []);
    } else {
      console.error("❌ Categories failed:", response.status);
      setCategories([]); // Fallback empty array
    }
  } catch (error) {
    console.error("Categories fetch error:", error);
    setCategories([]);
  } finally {
    setLoading(false);
  }
};

  // Search filter
  const filteredRecipes = recipes.filter(recipe =>
    recipe.recipe_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
  );

// ✅ Update editFormData to include current image


// ✅ FIXED 2: openEditModal - Add methods field
const openEditModal = (recipe) => {
  setEditFormData({
    id: recipe.id,
    recipe_name: recipe.recipe_name,
    ingredients: recipe.ingredients,
    methods: recipe.methods,          // ✅ ADD THIS
    extra_tips: recipe.extra_tips,
    category_name: recipe.category_name?.id || ''
  });
  setEditImagePreview(recipe.image || recipe.image_url);
  setEditImageFile(null);
  setEditModal(true);
};

  const closeEditModal = () => {
    setEditModal(false);
    setEditFormData({
      id: null, recipe_name: "", category_name: "", ingredients: "",
      methods: "", extra_tips: "", image_url: ""
    });
  };
 
 
 // ✅ FIXED 1: handleEditSubmit - Use fetchUserRecipes()
const handleEditSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  
  formData.append('recipe_name', editFormData.recipe_name);
  formData.append('ingredients', editFormData.ingredients);
  formData.append('methods', editFormData.methods);      // ✅ ADD this
  formData.append('extra_tips', editFormData.extra_tips);
  formData.append('category_name', editFormData.category_name);
  
  if (editImageFile) {
    formData.append('image', editImageFile);
  }

  try {
    const token = getJwtToken();
    const response = await fetch(`https://ayuraahar.onrender.com/api/recipes/${editFormData.id}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (response.ok) {
      closeEditModal();
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchUserRecipes();          // ✅ CORRECT FUNCTION
      alert('Recipe updated successfully!');
    } else {
      const error = await response.text();
      alert('Update failed: ' + error);
    }
  } catch (error) {
    console.error('Update error:', error);
    alert('Update failed');
  }
};
  // Delete Modal Functions
  const openDeleteModal = (recipe) => {
    setEditFormData({ 
      id: recipe.id, 
      recipe_name: recipe.recipe_name 
    });
    setDeleteModal(true);
  };

  const closeDeleteModal = () => setDeleteModal(false);

  // Handling the delete button 
  
const handleDeleteSubmit = async () => {
  try {
    const token = getJwtToken();
    const response = await fetch(`https://ayuraahar.onrender.com/api/recipes/${editFormData.id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('✅ Recipe deleted successfully!');
      closeDeleteModal();
      fetchUserRecipes();
    } else {
      alert('❌ Delete failed');
    }
  } catch (error) {
    alert('❌ Network error');
  }
};


  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex flex-col items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">Loading recipes...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        body { font-family: 'Nunito', sans-serif; }
        .brand { font-family: 'Lobster', cursive; }
      `}</style>
      
      <div className="bg-[#FFEBCD] min-h-screen flex flex-col">
        {/* Top bar - EXACT COPY */}
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate('/profile')}
            className="text-[#964B00]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="brand text-2xl font-bold text-[#964B00]">AyurAahar</span>
          <span className="w-6 h-6"></span>
        </div>

        {/* Page heading - EXACT COPY */}
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-bold text-[#964B00]">Manage Your Recipes</h1>
          <p className="text-sm text-gray-600 mt-1">
            You have <strong>{recipes.length}</strong> recipe{recipes.length !== 1 ? 's' : ''} | Edit or delete below
          </p>
        </div>

        {/* Search Bar - EXACT COPY */}
        <div className="mb-4 px-4">
          <input 
            type="text" 
            placeholder="Search recipes, ingredients..."
            className="w-full px-6 py-2 rounded-xl border border-[#FF9933] bg-white shadow focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Recipe list - EXACT COPY */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
                {/* Recipe image - EXACT COPY */}
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#FF9933] flex-shrink-0">
                  <img 
                    src={recipe.image?.url || recipe.image_url || recipe.image || "/api/static/default_recipe.jpg"} 
                    alt={recipe.recipe_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Recipe info - EXACT COPY */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#964B00] text-lg truncate">{recipe.recipe_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {recipe.category_name?.category_name || recipe.category_name || 'Uncategorized'}
                  </p>
                </div>
                
                {/* Actions - EXACT COPY */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(recipe)}
                    className="px-4 py-2 rounded-lg bg-[#FF9933] text-white text-sm font-semibold hover:bg-[#964B00] transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(recipe)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No matching recipes found.' : "You haven't added any recipes yet."}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Total recipes: <strong>{recipes.length}</strong>
              </p>
            </div>
          )}
        </div>
        {/* Edit model  */}

 {editModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-[#FFEBCD]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#FFEBCD]">
        <h2 className="text-2xl font-bold text-[#964B00]">Edit Recipe</h2>
        <button 
          onClick={closeEditModal}
          className="p-2 hover:bg-[#FFEBCD] rounded-xl transition-all hover:scale-105"
        >
          <svg className="w-5 h-5 text-[#964B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleEditSubmit} className="space-y-5">
        <input type="hidden" name="id" value={editFormData.id} />
        
        {/* 1. Recipe Name */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Recipe Name</label>
          <input
            type="text"
            name="recipe_name"
            required
            value={editFormData.recipe_name}
            onChange={(e) => setEditFormData({...editFormData, recipe_name: e.target.value})}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-[#FF9933]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all text-[#964B00] font-medium shadow-md hover:shadow-lg"
            placeholder="Enter recipe name"
          />
        </div>

        {/* 2. Category */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Category</label>
          <select
            name="category_name"
            required
            value={editFormData.category_name}
            onChange={(e) => setEditFormData({...editFormData, category_name: e.target.value})}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-[#FF9933]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all text-[#964B00] font-medium shadow-md hover:shadow-lg"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        {/* 3. Ingredients */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Ingredients</label>
          <textarea
            name="ingredients"
            required
            rows="3"
            value={editFormData.ingredients}
            onChange={(e) => setEditFormData({...editFormData, ingredients: e.target.value})}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-[#FF9933]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all text-[#964B00] font-medium shadow-md hover:shadow-lg resize-vertical"
            placeholder="List all ingredients..."
          />
        </div>

        {/* 4. IMAGE FIELD - 4th Position */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Recipe Image</label>
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleRecipeImageChange}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-dashed border-[#FF9933]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF9933] file:text-white file:font-medium hover:file:bg-[#964B00] shadow-md hover:shadow-lg"
          />
          {editImagePreview && (
            <div className="mt-3 p-2 bg-[#FFEBCD]/50 rounded-xl border border-[#FF9933]/30">
              <img 
                src={editImagePreview} 
                alt="Preview" 
                className="w-20 h-20 rounded-lg object-cover shadow-sm mx-auto block"
              />
            </div>
          )}
        </div>

        {/* 5. Methods */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Cooking Methods</label>
          <textarea
            name="methods"
            required
            rows="3"
            value={editFormData.methods}
            onChange={(e) => setEditFormData({...editFormData, methods: e.target.value})}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-[#FF9933]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all text-[#964B00] font-medium shadow-md hover:shadow-lg resize-vertical"
            placeholder="Step by step cooking instructions..."
          />
        </div>

        {/* 6. Extra Tips */}
        <div>
          <label className="block text-sm font-semibold text-[#964B00] mb-2">Extra Tips</label>
          <textarea
            name="extra_tips"
            rows="2"
            value={editFormData.extra_tips}
            onChange={(e) => setEditFormData({...editFormData, extra_tips: e.target.value})}
            className="w-full px-4 py-3 bg-[#FFEBCD] border-2 border-[#FF9933]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-[#FF9933] transition-all text-[#964B00] font-medium shadow-md hover:shadow-lg resize-vertical"
            placeholder="Pro tips, variations..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#FFEBCD]/50">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-[#FF9933] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#964B00] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
          >
            Update Recipe
          </button>
          <button
            type="button"
            onClick={closeEditModal}
            className="flex-1 px-6 py-3 bg-gray-100 text-[#964B00] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] border border-[#FFEBCD]/50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


{/* COMPLETE Delete Modal */}
{deleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m7-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 4h4a1 1 0 001-1V3a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-[#964B00] mb-2">
        Delete "{editFormData.recipe_name}"?
      </h3>
      
      <p className="text-gray-600 mb-6">This action cannot be undone.</p>
      
      <div className="flex gap-3">
        <button
          onClick={handleDeleteSubmit}
          className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
        >
          Delete
        </button>
        <button
          onClick={closeDeleteModal}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


        {/* Bottom Navigation - EXACT COPY */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#FF9933] z-50">
          <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
            <Link to="/home" className="flex flex-col items-center text-[#964B00]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 12L12 3l9 9M4 10v10h16V10"/>
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
            <Link to="/profile" className="flex flex-col items-center text-[#964B00]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
              </svg>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default ManageRecipes;
