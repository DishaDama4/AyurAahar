import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BottomNavbar from './BottomNav';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [commentText, setCommentText] = useState('');
  // ✅ EDIT STATES
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const getJwtToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    const fetchRecipeAndComments = async () => {
      try {
        setLoading(true);
        const token = getJwtToken();

        if (!token) {
          navigate('/login');
          return;
        }

        // ✅ Get current user FIRST
        const userRes = await fetch('https://ayuraahar.onrender.com/api/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('✅ Current user:', userData);
          setCurrentUser(userData);
        }

        // Recipe
        const recipeRes = await fetch(`https://ayuraahar.onrender.com/api/recipes/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (recipeRes.ok) {
          const recipeData = await recipeRes.json();
          setRecipe(recipeData);
          setIsLiked(recipeData.liked || false);
        }

        // Comments
        console.log("🔍 Fetching comments for recipe:", id);
        const commentsRes = await fetch(`https://ayuraahar.onrender.com/api/comments/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log("📡 Comments status:", commentsRes.status);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          console.log("✅ FULL comments response:", commentsData);
          const commentsList = commentsData.comments || [];
          console.log("✅ Comments count:", commentsList.length);
          setComments(commentsList);
        } else {
          console.log("ℹ️ No comments found");
          setComments([]);
        }

      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndComments();
  }, [id, navigate]);

  // ✅ ADD COMMENT
  const addComment = async (commentText) => {
    if (!commentText.trim()) return;

    try {
      setLoading(true);
      const token = getJwtToken();

      const response = await fetch(`https://ayuraahar.onrender.com/api/comments/${id}/add/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_txt: commentText.trim()
        }),
      });

      if (response.ok) {
        window.location.reload();
        setCommentText('');
      } else {
        console.error('❌ Failed to add comment');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT FUNCTIONS
  const startEdit = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const updateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      setLoading(true);
      const token = getJwtToken();

      const response = await fetch(`https://ayuraahar.onrender.com/api/comments/${commentId}/edit/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_txt: editText.trim()
        }),
      });

      if (response.ok) {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, comment_txt: editText.trim() } : c
        ));
        cancelEdit();
      } else {
        console.error('❌ Edit failed');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE FUNCTION
  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      setLoading(true);
      const token = getJwtToken();

      const response = await fetch(`https://ayuraahar.onrender.com/api/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        console.error('❌ Delete failed');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Other functions (unchanged)
  const toggleLike = async () => {
    try {
      const token = getJwtToken();
      if (!token) navigate('/login');
      
      const res = await fetch(`https://ayuraahar.onrender.com/recipe/${id}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
      }
    } catch (err) {
      console.error("❌ Like error:", err);
    }
  };

  const shareRecipe = (recipeId) => {
    if (navigator.share) {
      navigator.share({ title: "AyurAahar Recipe", url: window.location.href });
    }
    
    const token = getJwtToken();
    fetch('https://ayuraahar.onrender.com/api/share/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipe_id: recipeId })
    })
    .then(() => {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    })
    .catch(console.error);
  };

  const downloadRecipe = async (recipeId, recipeName) => {
    try {
      const token = getJwtToken();
      const response = await fetch(`https://ayuraahar.onrender.com/api/recipe/${recipeId}/download/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recipeName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed.');
    }
  };

  if (loading || !recipe) {
    return (
      <div className="bg-[#FFEBCD] min-h-screen flex justify-center items-center">
        <div className="text-[#964B00] text-xl animate-pulse">Loading Recipe...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFEBCD] min-h-screen flex justify-center">
      <div className="w-full max-w-md md:max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/home" className="text-[#964B00] hover:text-[#FF9933] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="brand text-2xl font-bold text-[#964B00]">AyurAahar</span>
          <span className="w-6 h-6"></span>
        </div>

        {/* Recipe Card */}
        <div className="bg-white rounded-2xl shadow px-4 py-5 md:px-6 md:py-6 flex flex-col gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <img
              src={recipe.user_profile_image || "/static/images/default_user.png"}
              alt={recipe.user_username || recipe.user}
              className="w-10 h-10 rounded-full border-2 border-[#FF9933] object-cover"
            />
            <div>
              <p className="font-semibold text-[#964B00]">{recipe.user_username || recipe.user_name || recipe.username || 'User'}</p>
              <p className="text-xs text-gray-500">Shared this recipe</p>
            </div>
          </div>

          {/* Recipe Image */}
          <div className="w-full rounded-2xl overflow-hidden border border-[#FF9933] bg-gray-100">
            <img src={recipe.image || "https://via.placeholder.com/400x300?text=No+Image"} alt={recipe.recipe_name} className="w-full object-contain" />
          </div>

          {/* Recipe Info */}
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-[#964B00]">{recipe.recipe_name}</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Category: {recipe.category_name}</p>
          </div>

          {/* Ingredients */}
          <div>
            <h2 className="text-sm md:text-base font-semibold text-[#964B00] mb-1">Ingredients :</h2>
            <p className="whitespace-pre-line text-xs md:text-sm text-gray-800">{recipe.ingredients}</p>
          </div>

          {/* Methods */}
          <div>
            <h2 className="text-sm md:text-base font-semibold text-[#964B00] mb-1">Methods :</h2>
            <p className="whitespace-pre-line text-xs md:text-sm text-gray-800">{recipe.methods}</p>
          </div>

          {/* Extra Tips */}
          {recipe.extra_tips && (
            <div>
              <h2 className="text-sm md:text-base font-semibold text-[#964B00] mb-1">Extra Tips :</h2>
              <p className="whitespace-pre-line text-xs md:text-sm text-gray-800">{recipe.extra_tips}</p>
            </div>
          )}

          {/* ✅ COMPLETE COMMENTS MODAL WITH WORKING EDIT/DELETE */}
 {showComments && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative max-h-[80vh] flex flex-col">
      <button
        onClick={() => setShowComments(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold z-10"
      >
        ✖
      </button>
      
      <h2 className="text-lg font-semibold text-[#964B00] mb-3 mt-4">
        Comments ({comments.length})
      </h2>

      <div className="space-y-3 flex-1 overflow-y-auto mb-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <img
                src={comment.user_image || "/static/images/default_user.jpg"}
                alt={comment.user || 'User'}
                className="w-8 h-8 rounded-full border border-[#FF9933] flex-shrink-0 mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#964B00] truncate mb-1">{comment.user || 'Anonymous'}</p>
                
                {/* ✅ COMMENT TEXT - ALWAYS VISIBLE */}
                <div className="mb-2">
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#FF9933] focus:border-[#FF9933] min-h-[40px] max-h-24"
                        rows="2"
                        placeholder="Edit your comment..."
                      />
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateComment(comment.id)}
                          disabled={!editText.trim()}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap h-8"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all whitespace-nowrap h-8"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 break-words pr-2">{comment.comment_txt}</p>
                  )}
                </div>

                {/* ✅ EDIT/DELETE BUTTONS - UNDER COMMENT TEXT - SMALLER SIZE */}
                {currentUser && comment.user && (
                  currentUser.username === comment.user ||
                  currentUser.name === comment.user ||
                  currentUser.id === comment.user_id
                ) && (
                  <div className="flex gap-1 pl-1 pb-1">
                    <button
                      onClick={() => startEdit(comment.id, comment.comment_txt)}
                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all border border-blue-200 h-6 flex items-center justify-center"
                      title="Edit comment"
                    >
                     Edit 
                    </button>
                    <button 
                      onClick={() => deleteComment(comment.id)}
                      className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all border border-red-200 h-6 flex items-center justify-center"
                      title="Delete comment"
                    >
                    Delete 
                    </button>
                  </div>
                )}

                {/* ✅ TIMESTAMP - BOTTOM */}
                <p className="text-[10px] text-gray-400 pl-1">
                  {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                  }) : 'Just now'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No comments yet.</p>
            <p className="text-xs mt-1">💬 Add the first comment below!</p>
          </div>
        )}
      </div>

      {/* NEW COMMENT INPUT */}
      <div className="flex gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FF9933] min-h-[44px]"
          rows="2"
        />
        <button
          onClick={() => addComment(commentText)}
          disabled={!commentText.trim() || loading}
          className="px-6 py-2 bg-[#FF9933] text-white rounded-lg hover:bg-[#e6892a] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all whitespace-nowrap flex-shrink-0"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  </div>
)}


          {/* Action Buttons */}
          <div className="pt-3 flex justify-around border-t border-[#FF9933] mt-2 mb-10">
            <button onClick={toggleLike} className="flex flex-col items-center text-[#964B00]">
              <i className={`fa-heart text-xl transition-all duration-200 ${isLiked
                ? 'fa-solid text-red-500 scale-110 shadow-lg'
                : 'fa-regular text-[#964B00] hover:text-red-400 hover:scale-110'
              }`} />
              <span className="text-xs md:text-sm">Like</span>
            </button>

            <button onClick={() => setShowComments(true)} className="flex flex-col items-center text-[#964B00]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h5m-9 5l2-2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12z" />
              </svg>
              <span className="text-xs md:text-sm">Comments {comments.length}</span>
            </button>

            <button onClick={() => shareRecipe(id)} className="flex flex-col items-center text-[#964B00]" title="Share Recipe">
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 mb-1 transition-all duration-200 hover:scale-110 ${isShared ? 'animate-pulse' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v14" />
              </svg>
              <span className="text-xs md:text-sm">Share</span>
            </button>

            <button onClick={() => downloadRecipe(recipe.id, recipe.recipe_name)} className="flex flex-col items-center text-[#964B00]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span className="text-xs md:text-sm">Download</span>
            </button>
          </div>
        </div>
      </div>
       
       <BottomNavbar/>
 </div>
  );
};
export default RecipeDetailPage;