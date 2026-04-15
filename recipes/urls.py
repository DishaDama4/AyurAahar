from django.contrib import admin
from django.urls import path
from recipes import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',views.index,name="index"), # signup page 
    path('home',views.home,name="home"),
    path('login_page',views.login_page,name="login_page"),
    path('categories',views.categories,name="categories"),
    # path('liked',views.liked,name="liked"), 
    path('profile_view',views.profile_view,name="profile_view"),
    path("recipe/<int:recipe_id>/", views.recipe_page, name="recipe_page"),
    path('add_recipe',views.add_recipe,name="add_recipe"),
    path("logout/", views.logout_view, name="logout"),
    path("manage_recipes/", views.manage_recipes, name="manage_recipes"),
    path("edit_recipe/<int:recipe_id>/", views.edit_recipe, name="edit_recipe"),
    path("delete_recipe/<int:recipe_id>/", views.delete_recipe, name="delete_recipe"),
    path("category/<int:category_id>/", views.category_recipes, name="category_recipes"),
    path("recipe/<int:recipe_id>/like/", views.toggle_like, name="toggle_like"),
    path("liked/", views.liked_recipes, name="liked_recipes"),
    path("recipe/<int:recipe_id>/share/", views.share_recipe, name="share_recipe"), #To share the recipes
    path("recipe/<int:recipe_id>/download/", views.download_recipe, name="download_recipe"), # To download the recipe 
    path("recipe/<int:recipe_id>/comment/",views.add_comment, name="add_comment"),
    path("recipe/shared_recipe",views.shared_recipes,name="shared_recipes") , # To see the all shared recipes by u 
    path("recipe/downloaded_recipes", views.downloaded_recipes, name="downloaded_recipes"), # To see downloaded recipes by u 
    path("comment/<int:comment_id>/edit/", views.edit_comment, name="edit_comment"),
    path("comment/<int:comment_id>/delete/", views.delete_comment, name="delete_comment"),




    # Django to react    
    # Auth
    path('api/csrf/', views.get_csrf, name='get_csrf'),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.user_login, name='user_login'),
    path('api/logout/', views.user_logout, name='user_logout'),
    
    # Profile
    path('api/profile/data/', views.profile_data, name='profile_data'),
#     Update user profile 
    path('api/profile/update/', views.profile_update, name='profile_update'),
    path('api/categories/', views.categories_list, name='categories_list'),
    path('api/recipes/create/', views.recipe_create, name='recipe_create'),
    # edit recipes:- 
    path('api/recipes/<int:recipe_id>/update/', views.recipe_update, name='recipe_update'),
    # delete recipes :- 
    path('api/recipes/<int:recipe_id>/delete/', views.recipe_delete, name='recipe_delete'),
    # Recipes
    path('api/recipes/', views.recipe_list, name='recipe_list'),
    path('api/recipes/create/', views.recipe_create, name='recipe_create'),  
    path('api/recipes/<int:id>/', views.recipe_detail, name='recipe_detail'),
    path('api/my-recipes/', views.user_recipes, name='user_recipes'),
    path('api/add_recipe/', views.add_recipe, name='add_recipe'),
    path('api/me/', views.current_user, name='current_user'),

    # Categories
    path('api/categories/', views.categories_list, name='category_list'),
#     Categories recipes filtering 
    path('api/categories/<int:category_id>/recipes/', views.category_recipes, name='category_recipes'),

    
    # Actions
    path('api/recipes/liked/', views.liked_recipes, name='liked_recipes'),
    path('api/share/', csrf_exempt(views.share_recipe), name='share_recipe'), 
    path('api/downloads/', views.downloaded_recipes, name='downloaded_recipes'),
    path('api/recipe/<int:recipe_id>/download/', views.download_recipe, name='download_recipe'),
    
    # # Curd operations of comments 
    path('api/comments/<int:recipe_id>/', views.recipe_comments, name='recipe_comments'),
    path('api/comments/<int:recipe_id>/add/', views.add_recipe_comment, name='add_recipe_comment'),
    path('api/comments/<int:comment_id>/edit/', views.edit_comment, name='edit_comment'),
    path('api/comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),

     path('api/user-shared-recipes/', views.user_shared_recipes, name='user_shared_recipes'),
 
    
    # Search
    path('api/search/', views.search_recipes, name='search_recipes'),
    path('api/recommended/', views.recommended_recipes, name='recommended_recipes'),

    #Debugging Session cookies
    path('api/debug-session/', views.debug_session , name='debug_session'),
    path('api/token/refresh/', TokenRefreshView.as_view()),  # JWT refresh


    # New url for see the data from live link 
    path('api/debug/', views.debug_data,name="debug_data"),
    path('api/debug/categories/', views.debug_categories, name="debug_recipes"),  # ← Categories
    path('api/debug/recipes/', views.debug_recipes ,name="debug_categories"),         # ← Recipes
    path('api/recipe/<int:recipe_id>/like/', views.toggle_like, name='toggle_like'),
    path('api/recipe/<int:recipe_id>/share/', views.share_recipe, name='share_recipe'),
    path('api/recipe/<int:recipe_id>/comment/', views.add_comment, name='add_comment'),
    path('api/recipe/<int:recipe_id>/download/', views.download_recipe, name='download_recipe'),
    path('api/profile/', views.user_profile, name='user_profile'),
]
if settings.DEBUG:
     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)