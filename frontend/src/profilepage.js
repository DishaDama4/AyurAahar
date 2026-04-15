import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem('access_token');

 

  // ✅ FIXED useEffect - Matches YOUR backend response
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("🔍 Profile: Fetching data...");
        setLoading(true);

        const token = getJwtToken();
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        const response = await fetch(`https://ayuraahar.onrender.com/api/profile/data/?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log("📡 Profile status:", response.status);

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login', { replace: true });
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Profile data:", data);

          // ✅ MATCH YOUR BACKEND STRUCTURE
          setUser(data.user);
          setProfile(data.profile);
          setStats(data.stats);

          // Set profileData for existing display
          setProfileData({
            user: {
              username: data.user?.username || '',
              email: data.user?.email || ''
            },
            profile: data.profile || {}
          });

          // Pre-fill edit form
          setEditForm({
            username: data.user?.username || '',
            email: data.user?.email || '',
            image: null
          });
        }
      } catch (error) {
        console.error("💥 Profile error:", error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  // ✅ FIXED - Load form with CURRENT data
  const handleEditClick = () => {
    setEditForm({
      username: user?.username || profileData?.user?.username || '',
      email: user?.email || profileData?.user?.email || '',
      image: null
    });
    setImagePreview(profile?.image_url || profile?.image || null);
    setShowEditModal(true);
  };

  // ✅ Image handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ FIXED handleEditProfile - Refresh data after update
  const handleEditProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', editForm.username);
    formData.append('email', editForm.email);
    if (editForm.image) formData.append('image', editForm.image);

    try {
      const token = getJwtToken();
      const response = await fetch("https://ayuraahar.onrender.com/api/profile/update/", {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log("✅ Updated:", updatedData);

        // Update all states
        setUser(updatedData.user);
        setProfile(updatedData.profile);
        setStats(updatedData.stats);

        // Update profileData for display
        setProfileData({
          user: {
            username: updatedData.user?.username || editForm.username,
            email: updatedData.user?.email || editForm.email
          },
          profile: updatedData.profile
        });

        setEditForm({
          username: updatedData.user?.username || editForm.username,
          email: updatedData.user?.email || editForm.email,
          image: null
        });

        setShowEditModal(false);
        setImagePreview(updatedData.profile?.image_url || null);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Update failed: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      alert('Update failed. Please check your connection.');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex items-center justify-center">
        <div className="text-[#964B00] text-xl animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex flex-col items-center">
      {/* EDIT MODAL - UNCHANGED */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-[#964B00] font-bold text-xl">×</button>
            <h2 className="text-[#964B00] text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditProfile}>
              <div className="mb-4">
                <label className="block text-sm text-[#964B00] font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-[#964B00] font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933] focus:outline-none focus:ring-2 focus:ring-[#964B00]"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-[#964B00] font-medium mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 rounded-xl bg-[#FFEBCD] border border-[#FF9933]"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                )}
              </div>
              
              <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold bg-[#FF9933] hover:bg-[#964B00] transition">
                Save Changes
              </button>
               
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - STYLING UNCHANGED */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/home')} className="text-[#964B00] hover:text-[#FF9933]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
<span className="brand text-2xl font-bold text-[#964B00]">AyurAahar</span>          <button onClick={handleEditClick} className="text-[#964B00] hover:text-[#FF9933]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 20h4.5L19 9.5 14.5 5 4 15.5V20z" />
            </svg>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-6 py-8 mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-300 overflow-hidden border-4 border-[#FF9933]">
              <img
                src={profile?.image_url || profile?.image || "/static/images/default_user.jpg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/static/images/default_user.jpg";
                }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-[#FFEBCD] rounded-xl p-3 border border-[#FF9933]">
              <p className="text-xs text-gray-500 mb-1">Username</p>
              <p className="font-semibold text-[#964B00] text-lg">
                {user?.username || profileData?.user?.username || editForm.username || 'No username'}
              </p>
            </div>
            <div className="bg-[#FFEBCD] rounded-xl p-3 border border-[#FF9933]">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-[#964B00] break-all">
                {user?.email || profileData?.user?.email || editForm.email || 'No email'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/manage_recipes" className="bg-[#FFEBCD] rounded-xl border-2 border-[#FF9933] py-4 text-center">
              <p className="text-xl font-bold text-[#964B00]">{stats.recipe_count || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Recipes Added</p>
            </Link>
            <Link to="/liked" className="bg-[#FFEBCD] rounded-xl border-2 border-[#FF9933] py-4 text-center">
              <p className="text-xl font-bold text-[#964B00]">{stats.liked_count || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Liked</p>
            </Link>
            <Link to="/shared" className="bg-[#FFEBCD] rounded-xl border-2 border-[#FF9933] py-4 text-center">
              <p className="text-xl font-bold text-[#964B00]">{stats.shared_count || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Shared</p>
            </Link>
            <Link to="/download" className="bg-[#FFEBCD] rounded-xl border-2 border-[#FF9933] py-4 text-center">
              <p className="text-xl font-bold text-[#964B00]">{stats.downloaded_count || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Downloads</p>
            </Link>
          </div>

          <div className="space-y-3">
            <Link to="/add_recipe" className="block w-full text-center py-3 rounded-xl bg-[#FF9933] text-white font-semibold shadow-md hover:bg-[#964B00] transition">
              + Add Recipe
            </Link>
            <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-white border-2 border-[#964B00] text-[#964B00] font-semibold shadow-md hover:bg-[#964B00] hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - UNCHANGED */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#FF9933] shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
          <Link to="/home" className="flex flex-col items-center text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12L12 3l9 9M4 10v10h16V10" />
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
          <Link to="/profile" className="flex flex-col items-center text-[#FF9933] font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default ProfilePage;
