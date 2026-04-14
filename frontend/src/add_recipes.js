import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

const AddRecipePage = () => {
  const [formData, setFormData] = useState({
    recipe_name: "",
    category_name: "",
    ingredients: "",
    methods: "",
    extra_tips: "",
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem('access_token');

  // ✅ FIXED: Proper category loading + fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔍 Fetching categories...");
        
        // Try public API first (no token)
        let response = await fetch("https://ayuraahar.onrender.com//api/categories/");
        
        if (!response.ok) {
          console.log("🌐 Public API failed, trying with token...");
          const token = getJwtToken();
          if (token) {
            response = await fetch("https://ayuraahar.onrender.com//api/categories/", {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });
          }
        }

        console.log("📡 Status:", response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Data structure:", data);
          
          // Handle different response structures
          const cats = data.categories || data.results || data || [];
          console.log("✅ Final categories:", cats);
          
          setCategories(Array.isArray(cats) ? cats : []);
        } else {
          console.log("❌ API failed, using fallback");
          // ✅ FALLBACK CATEGORIES - Always works
          setCategories([
            {id: 1, category_name: "Breakfast"},
            {id: 2, category_name: "Lunch"},
            {id: 3, category_name: "Dinner"},
            {id: 4, category_name: "Snacks"},
            {id: 5, category_name: "Dessert"},
            {id: 6, category_name: "Beverages"}
          ]);
        }
      } catch (error) {
        console.error("💥 Error:", error);
        // ✅ EMERGENCY FALLBACK
        setCategories([
          {id: 1, category_name: "Breakfast"},
          {id: 2, category_name: "Lunch"},
          {id: 3, category_name: "Dinner"}
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.recipe_name.trim()) newErrors.recipe_name = "Recipe name is required";
    if (!formData.category_name) newErrors.category_name = "Please select a category";
    if (!formData.ingredients.trim()) newErrors.ingredients = "Ingredients are required";
    if (!formData.methods.trim()) newErrors.methods = "Methods are required";
    if (!formData.image) newErrors.image = "Recipe image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    alert('Please fill all required fields');
    return;
  }

  setLoading(true);

  const submitData = new FormData();
  submitData.append('recipe_name', formData.recipe_name.trim());
  
  // ✅ CRITICAL DEBUG: Log exact category value
  console.log("🔍 ALL CATEGORIES:", categories);
  console.log("🔍 SELECTED category_name:", formData.category_name);
  console.log("🔍 category_name type:", typeof formData.category_name);
  
  // ✅ FORCE STRING + VALIDATE
  const categoryId = formData.category_name?.toString().trim();
  if (!categoryId || !categories.find(cat => cat.id == categoryId)) {
    alert('Please select a valid category');
    setLoading(false);
    return;
  }
  
  submitData.append('category_name', categoryId);
  submitData.append('ingredients', formData.ingredients.trim());
  submitData.append('methods', formData.methods.trim());
  submitData.append('extra_tips', formData.extra_tips || '');
  if (formData.image) {
    submitData.append('image', formData.image);
  }

  // ✅ DEBUG FormData
  console.log("📤 SENDING FormData:");
  for (let [key, value] of submitData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const token = getJwtToken();
    const response = await fetch("https://ayuraahar.onrender.com//api/recipes/create/", {
      method: 'POST',
      body: submitData,
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log("📡 Response status:", response.status);
    
    if (response.ok) {
      alert('✅ Recipe created successfully!');
      navigate('/profile');
    } else {
      const errorText = await response.text();
      console.error("❌ FULL ERROR:", errorText);
      alert(`❌ Error: ${JSON.parse(errorText).detail || 'Check console'}`);
    }
  } catch (error) {
    console.error("💥 Error:", error);
    alert('❌ Network error');
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="bg-[#FFEBCD] min-h-screen flex justify-center">
      <div className="w-full max-w-md md:max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/home')}
            className="text-[#964B00]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl md:text-2xl text-[#964B00] font-[Lobster]">AyurAahar</span>
          <span className="text-xs text-[#964B00] font-semibold"></span>
        </div> 

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow px-5 py-6 md:px-7 md:py-7">
          {/* Recipe Name */}
          <div className="mb-4">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Recipe Name *</label>
            <input
              type="text"
              name="recipe_name"
              value={formData.recipe_name}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-xl bg-[#FFEBCD] border ${
                errors.recipe_name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#FF9933] focus:ring-[#964B00]'
              } focus:outline-none focus:ring-2`}
              required
            />
            {errors.recipe_name && <p className="mt-1 text-xs text-red-500">{errors.recipe_name}</p>}
          </div>

          {/* ✅ FIXED Category Dropdown */}
          <div className="mb-4">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Category *</label>
            <select
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-xl bg-[#FFEBCD] border-2 ${
                errors.category_name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#FF9933] focus:ring-[#964B00]'
              } focus:outline-none focus:ring-2 focus:ring-[#964B00]`}
            >
              <option value="">--- Select Category ---</option>
              {categories.map((category) => (
                <option 
                  key={category.id || Math.random()} 
                  value={category.id || category.category_name}
                >
                  {category.category_name || category}
                </option>
              ))}
            </select>
            {errors.category_name && <p className="mt-1 text-xs text-red-500">{errors.category_name}</p>}
            <p className="text-xs text-gray-500 mt-1">Loaded: {categories.length} categories</p>
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Ingredients *</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              rows="4"
              className={`w-full p-3 rounded-xl bg-[#FFEBCD] border ${
                errors.ingredients 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#FF9933] focus:ring-[#964B00]'
              } focus:outline-none focus:ring-2`}
              required
            />
            {errors.ingredients && <p className="mt-1 text-xs text-red-500">{errors.ingredients}</p>}
          </div>

          {/* Methods */}
          <div className="mb-4">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Methods *</label>
            <textarea
              name="methods"
              value={formData.methods}
              onChange={handleInputChange}
              rows="4"
              className={`w-full p-3 rounded-xl bg-[#FFEBCD] border ${
                errors.methods 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#FF9933] focus:ring-[#964B00]'
              } focus:outline-none focus:ring-2`}
              required
            />
            {errors.methods && <p className="mt-1 text-xs text-red-500">{errors.methods}</p>}
          </div>

          {/* Extra Tips - Optional */}
          <div className="mb-4">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Extra Tips (Optional)</label>
            <textarea
              name="extra_tips"
              value={formData.extra_tips}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
              placeholder="Optional tips for better results..."
            />
          </div>

          {/* Image */}
          <div className="mb-5">
            <label className="block text-m font-semibold text-[#964B00] mb-1">Recipe Image *</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full p-3 rounded-xl bg-[#FFEBCD] border ${
                errors.image ? 'border-red-500 focus:ring-red-500' : 'border-[#FF9933] focus:ring-[#964B00]'
              } focus:outline-none focus:ring-2`}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border-2 border-[#FF9933]" />
            )}
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
            <p className="mt-1 text-[11px] text-gray-500">Upload a clear photo of the final dish. Max 5MB.</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-4 py-2 rounded-xl border border-[#FF9933] text-[#964B00] text-sm font-semibold hover:bg-[#FFEBCD] transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#FF9933] text-white text-sm font-semibold hover:bg-[#964B00] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save recipe'}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation */}
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
              <rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" />
            </svg>
            <span className="text-xs">Categories</span>
          </Link>
          <Link to="/liked" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z" />
            </svg>
            <span className="text-xs">Liked</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
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

export default AddRecipePage;
