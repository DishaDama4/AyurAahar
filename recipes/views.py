from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login , logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required 
from recipes.models import Profile , Category  , Recipe_details , Like ,  Shared , Download , Comment
from .forms import RecipeForm 
from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer , ProfileSerializer , CategorySerializer , RecipeSerializer
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse , JsonResponse
from django.middleware.csrf import get_token
from django.db.models import Count
from datetime import datetime
import json

# Signup 
def index(request):
    if request.method == "POST":
        username = request.POST.get("usernameSignup")
        email = request.POST.get("emailSignup")                            
        password = request.POST.get("passwordSignup")
        confirm_password = request.POST.get("confirmPasswordSignup")

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect("index")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already taken.")
            return redirect("index")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect("index")

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        login(request, user)
        messages.success(request, "Signup successful! You are now logged in.")
        return redirect("index")

    return render(request, "index.html")

# Login page 
def login_page(request):
    if request.method == "POST":
        username = request.POST.get("emailLogin")
        password = request.POST.get("passLogin")

        # Try username first
        user = authenticate(request, username=username, password=password)
 
        # If not found, try email
        if user is None:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is not None:
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect("home")
        else:
            messages.error(request, "Invalid username or password.")
            return redirect("login_page")

    return render(request, "login.html")
 
@login_required
def profile_view(request):
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        # Update User fields
        request.user.username = request.POST.get("username")
        request.user.email = request.POST.get("email")
        request.user.save()

        # Update Profile fields
        if "image" in request.FILES:
            profile.image = request.FILES["image"]
        profile.save()
        messages.success(request, "Profile updated successfully!")
        return redirect("profile_view")  # reload page with updated info

    # 👉 Add recipe count here 
    recipe_count = Recipe_details.objects.filter(user=request.user).count()

# Count recipes liked by the user
    liked_count = Recipe_details.objects.filter(likes__user=request.user).distinct().count()

# Count recipes shared by the user (assuming you have a Shared model with related_name="shared_by")
    shared_count = Recipe_details.objects.filter(shared_by__user=request.user).distinct().count()

# Count recipes downloaded by the user (assuming you have a Download model with related_name="downloads")
    downloaded_count = Recipe_details.objects.filter(downloads__user=request.user).distinct().count()


    return render(
        request,
        "profile.html",
        {
            "user": request.user,
            "profile": profile,
            "recipe_count": recipe_count,  # pass to template
            "liked_count":liked_count,
            "shared_count":shared_count,
            "downloaded_count":downloaded_count,
        },
    )

@login_required
def home(request): 
    recipes = Recipe_details.objects.all().order_by("-created_at")
    for recipe in recipes:
        recipe.is_liked = recipe.likes.filter(user=request.user).exists()
    categories = Category.objects.all()[:6] 
    return render(request, "home.html", {
        "categories": categories,
        "recipes": recipes
    })


 
def categories(request): 
    # Fetch all categories from the database
    categories = Category.objects.all()
    
    # Pass them to the template
    return render(request, "categories.html", {"categories": categories})

def liked(request):
    return render(request,"liked.html") 

@login_required
def recipe_page(request, recipe_id): 
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    profile = Profile.objects.filter(user=recipe.user).first()
    recipe.is_liked = recipe.likes.filter(user=request.user).exists()

    # Fetch all comments for this recipe
    comments = Comment.objects.filter(recipe=recipe).order_by("-created_at")

    return render(request, "recipe_page.html", {
        "recipe": recipe,
        "profile": profile,
        "comments": comments
    })


def add_recipe(request):
    if request.method == "POST":
        form = RecipeForm(request.POST, request.FILES)
        if form.is_valid():
            recipe = form.save(commit=False)
            recipe.user = request.user
            recipe.save()
            return redirect("home")
    else:
        form = RecipeForm()
    return render(request, "add_recipe.html", {"form": form})

def logout_view(request): 
    logout(request) 
    return redirect("login_page") # or wherever you want to send users after logout
  

@login_required
def manage_recipes(request):
    recipes = Recipe_details.objects.filter(user=request.user)
    categories = Category.objects.all()
    return render(request, "manage_recipe.html", {"recipes": recipes , "categories": categories })
 

@login_required
def edit_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id, user=request.user)

    if request.method == "POST":
        recipe.recipe_name = request.POST.get("recipe_name")

        # Get the Category instance by its category_name field
        category_value = request.POST.get("category_name")
        if category_value:
            recipe.category_name = Category.objects.get(category_name=category_value)

        recipe.ingredients = request.POST.get("ingredients")
        recipe.methods = request.POST.get("methods")
        recipe.extra_tips = request.POST.get("extra_tips")

        if "image" in request.FILES:
            recipe.image = request.FILES["image"]

        recipe.save()
        messages.success(request, "Recipe updated successfully!")
        return redirect("manage_recipes")

    categories = Category.objects.all()
    return render(
        request,
        "manage_recipes.html",
        {"recipe": recipe, "categories": categories}
    )

@login_required
def delete_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id, user=request.user)
    if request.method == "POST":
        recipe.delete()
        messages.success(request, "Recipe deleted successfully!")
        return redirect("manage_recipes")

    return render(request, "manage_recipe.html", {"recipe": recipe})
 

@login_required
def category_recipes(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    # Show all recipes in this category, regardless of who created them
    recipes = Recipe_details.objects.filter(category_name=category , is_public=True)
    return render(request, "category_recipes.html", {"category": category, "recipes": recipes})
 
@login_required
def toggle_like(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    like = Like.objects.filter(user=request.user, recipe=recipe).first()
    if like:
        like.delete()   # unlike
        liked = False
    else:
        Like.objects.create(user=request.user, recipe=recipe)  # like
        liked = True
    return JsonResponse({"liked": liked})


@login_required
def liked_recipes(request):
    recipes = Recipe_details.objects.filter(likes__user=request.user).distinct()
    for recipe in recipes:
        recipe.is_liked = True  # all recipes here are liked
    return render(request, "liked.html", {"recipes": recipes})


@login_required
def share_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    Shared.objects.create(user=request.user, recipe=recipe)
    return JsonResponse({"status": "success", "message": "Recipe shared!"})
 
@login_required
def download_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id)

    # Save download record
    Download.objects.create(user=request.user, recipe=recipe)

    # Build the text content
    content = f"""
Recipe: {recipe.recipe_name}
Category: {recipe.category_name}
Ingredients:
{recipe.ingredients}

Methods:
{recipe.methods}

Extra Tips:
{recipe.extra_tips or "None"}
"""

    # Create response with text file
    response = HttpResponse(content, content_type="text/plain")
    response["Content-Disposition"] = f'attachment; filename="{recipe.recipe_name}.txt"'
    return response

@login_required
def add_comment(request, recipe_id):
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    if request.method == "POST":
        comment_txt = request.POST.get("comment_txt")   # updated key
        if comment_txt.strip():
            Comment.objects.create(user=request.user, recipe=recipe, comment_txt=comment_txt)
    return redirect("recipe_page", recipe_id=recipe.id)


@login_required
def shared_recipes(request):
    recipes = Recipe_details.objects.filter(shared_by__user=request.user).distinct()
    return render(request, "shared_page.html", {"recipes": recipes})

@login_required
def  downloaded_recipes(request):
    recipes = Recipe_details.objects.filter(downloads__user=request.user).distinct()
    return render(request, "downloaded_page.html", {"recipes": recipes})

 
@login_required
def edit_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id, user=request.user)
    if request.method == "POST":
        new_text = request.POST.get("comment_txt")
        if new_text:
            comment.comment_txt = new_text
            comment.save()
            messages.success(request, "Comment updated successfully!")
    return redirect("recipe_page", recipe_id=comment.recipe.id)

@login_required
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id, user=request.user)
    recipe_id = comment.recipe.id
    comment.delete()
    messages.success(request, "Comment deleted successfully!")
    return redirect("recipe_page", recipe_id=recipe_id)
 






# Django to ReactJS 
# Assuming your models  
from .models import Recipe_details, Category, Like, Shared
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie , csrf_exempt
from rest_framework.permissions import AllowAny  # ✅ ADD THIS
from django.http import JsonResponse
from rest_framework.decorators import api_view , authentication_classes
from rest_framework.response import Response
from django.middleware.csrf import get_token
from .models import *
from .serializers import (  # YOUR SERIALIZERS
    UserSerializer, ProfileSerializer, CategorySerializer, 
    RecipeSerializer, LikeSerializer, SharedSerializer, 
    DownloadSerializer, CommentSerializer
)
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.parsers import MultiPartParser, FormParser
# ===============================
# AUTHENTICATION
# ===============================

@ensure_csrf_cookie
def get_csrf(request):
    """React CSRF endpoint"""
    return JsonResponse({'csrftoken': get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register using YOUR UserSerializer"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=400)

from django.contrib.auth import authenticate, login
from django.contrib.sessions.models import Session
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])  # ✅ PUBLIC - No auth required
def  user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    print(f"🔍 LOGIN: {username}")
    
    user = authenticate(request, username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        print(f"✅ JWT GENERATED for {user.username}")
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {'username': user.username, 'email': user.email or ''}
        })
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Return current logged-in user"""
    serializer = UserSerializer(request.user)
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    })

@login_required
@api_view(['POST'])
def user_logout(request):
    """Logout"""
    logout(request)
    return Response({'success': True, 'message': 'Logged out'})

# ===============================
# PROFILE - YOUR ProfileSerializer
# ===============================

@api_view(['GET'])  # ✅ REMOVED IsAuthenticated & login_required
@ensure_csrf_cookie
def profile_data(request):
    """Public profile data - shows current user if logged in"""
    if request.user.is_authenticated:
        user = request.user
        stats = {
            "recipe_count": Recipe_details.objects.filter(user=user).count(),  # ✅ Fixed model name
            "liked_count": Like.objects.filter(user=user).count(),
            "shared_count": Shared.objects.filter(user=user).count(),
            "downloaded_count": Download.objects.filter(user=user).count(),
        }
        try:
            profile = Profile.objects.get(user=user)
            profile_serializer = ProfileSerializer(profile, context={'request': request})
        except Profile.DoesNotExist:
            profile_serializer = None
        
        return Response({
            "user": UserSerializer(user).data,
            "profile": profile_serializer.data if profile_serializer else {"image": None, "bio": ""},
            "stats": stats,
            "authenticated": True
        })
    else:
        # Public - no user logged in
        return Response({
            "authenticated": False,
            "message": "Please login to see profile data",
            "users": UserSerializer(User.objects.all(), many=True).data  # Show some users
        })

#  Edit the profile 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    """Update logged-in user's profile (username, email, image)"""
    
    # ✅ CRITICAL: Handle file upload
    image_file = request.FILES.get('image')  # ✅ From FormData
    
    # Update User model (username, email)
    user = request.user
    user.username = request.data.get('username', user.username)
    user.email = request.data.get('email', user.email)
    user.save()
    
    # Update Profile model (image)
    profile, created = Profile.objects.get_or_create(user=user)
    
    if request.data.get('remove_image') == 'true':
        if profile.image:
            profile.image.delete()
            profile.image = None
            profile.save()
    elif image_file:  # ✅ HANDLE UPLOADED FILE
        profile.image = image_file
        profile.save()
    
    # Return updated data
    profile_serializer = ProfileSerializer(profile, context={'request': request})
    stats = {
        "recipe_count": Recipe_details.objects.filter(user=user).count(),
        "liked_count": Like.objects.filter(user=user).count(),
        "shared_count": Shared.objects.filter(user=user).count(),
        "downloaded_count": Download.objects.filter(user=user).count(),
    }
    
    return Response({
        "user": UserSerializer(user).data,
        "profile": profile_serializer.data,
        "stats": stats,
        "message": "Profile updated successfully!"
    })


# ===============================
# RECIPES - YOUR RecipeSerializer (6 RECIPES WILL SHOW!)
# ===============================

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def recipe_list(request):
    """✅ YOUR 6 RECIPES with RecipeSerializer"""
    recipes = Recipe_details.objects.all()
    print(f"🔥 DB COUNT: {recipes.count()} recipes found")  # Should show 6
    
    # YOUR RecipeSerializer with context
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    print(f"✅ SENT: {len(serializer.data)} recipes to React")
    
    return Response({
        "recipes": serializer.data,  # recipe_name, category_name, etc.
        "total": len(serializer.data),
        "debug": f"Found {recipes.count()} recipes in DB"
    })

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def recipe_detail(request, id):
    """Single recipe with YOUR RecipeSerializer"""
    try:
        recipe = Recipe_details.objects.get(id=id)
        serializer = RecipeSerializer(recipe, context={'request': request})
        return Response(serializer.data)
    except Recipe_details.DoesNotExist:
        return Response({'error': 'Recipe not found'}, status=404)
 
# ===============================
# CATEGORIES - YOUR CategorySerializer (12+ CATEGORIES!)
# ===============================

# @permission_classes([IsAuthenticated]) 
# @permission_classes([AllowAny]) 
@api_view(["GET"])
def categories_list(request):
    """✅ YOUR 12+ CATEGORIES with CategorySerializer"""
    categories = Category.objects.all()
    print(f"🔥 DB COUNT: {categories.count()} categories found")  # Should show 12+
    
    serializer = CategorySerializer(categories, many=True , context={'request':request})
    print(f"✅ SENT: {len(serializer.data)} categories to React")
    
    return Response({
        "categories": serializer.data,  # category_name, icon
        "total": len(serializer.data)
    })


    #  To filter the recipes as per the category
@api_view(['GET'])
def category_recipes(request, category_id):
    """Get recipes for specific category"""
    category = get_object_or_404(Category, id=category_id)
    recipes = Recipe_details.objects.filter(category_name=category).select_related('category_name')
    
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response({
        'recipes': serializer.data,
        'category_name': category.category_name,
        'category_id': category.id
    })


# ===============================
# USER RECIPES
# ===============================

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def user_recipes(request):
    """Current user's recipes"""
    recipes = Recipe_details.objects.filter(user=request.user)
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)

# Adding the recipe   

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recipe_create(request):
    print("📥 RAW DATA:", request.data)
    print("📥 FILES:", request.FILES)
    
    category_id = request.data.get('category_name')
    print("🔍 Looking for category_id:", category_id, type(category_id))
    
    # ✅ DEBUG: List all category IDs
    all_categories = Category.objects.values_list('id', flat=True)
    print("📋 ALL CATEGORY IDs IN DB:", list(all_categories))
    
    if not category_id:
        return Response({"detail": "No category_name provided"}, status=400)
    
    try:
        # ✅ SAFE LOOKUP
        category = Category.objects.get(id=category_id)
        print("✅ FOUND CATEGORY:", category.id, category.category_name)
    except Category.DoesNotExist:
        return Response({
            "detail": f"No Category with ID '{category_id}'. Available: {list(all_categories)}"
        }, status=400)
    
    # ✅ CREATE RECIPE
    recipe = Recipe_details.objects.create(
        user=request.user,
        recipe_name=request.data['recipe_name'],
        category_name=category,
        ingredients=request.data['ingredients'],
        methods=request.data['methods'],
        extra_tips=request.data.get('extra_tips', ''),
        image=request.FILES.get('image'),
        is_public=True  # Add if field exists
    )
    
    return Response({
        "message": "Recipe created successfully!",
        "recipe_id": recipe.id
    }, status=201)

# ===============================
# ACTIONS - Like/Share/Download
# ===============================

# @permission_classes([IsAuthenticated]) 
# @api_view(["POST"])
# def like_recipe(request):
#     """Toggle like using YOUR LikeSerializer"""
#     recipe_id = request.data.get('recipe_id')
#     recipe = Recipe_details.objects.get(id=recipe_id)
    
#     like, created = Like.objects.get_or_create(user=request.user, recipe=recipe)
#     if not created:
#         like.delete()
    
#     serializer = LikeSerializer(like) if created else None
#     return Response({
#         'success': True, 
#         'liked': created,
#         'like': serializer.data if created else None
#     })
# ✅ PRIVATE - Login required  
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def liked_recipes(request):  # ✅ Exact name
    liked_recipes = Recipe_details.objects.filter(
        likes__user=request.user
    ).select_related('category_name').distinct()
    
    serializer = RecipeSerializer(liked_recipes, many=True, context={'request': request})
    return Response({'recipes': serializer.data})


# YOUR URL - Keep same as HTML
# path('api/recipe/<int:recipe_id>/like/', views.toggle_like),

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def toggle_like(request, recipe_id):
    """Toggle like/unlike - EXACT MATCH frontend"""
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    
    # Toggle logic
    like_exists = Like.objects.filter(user=request.user, recipe=recipe).exists()
    
    if like_exists:
        Like.objects.filter(user=request.user, recipe=recipe).delete()
        liked = False
    else:
        Like.objects.create(user=request.user, recipe=recipe)
        liked = True
    
    return Response({"liked": liked})  # ✅ EXACT frontend expects


 
@api_view(['POST'])
def share_recipe(request):
    print("🔥 SHARE VIEW HIT!!!")
    print("DATA:", request.data)
    
    recipe_id = request.data.get('recipe_id')
    recipe = Recipe_details.objects.get(id=recipe_id)
    
    Shared.objects.get_or_create(user=request.user, recipe=recipe)
    print("✅ DB SAVED!")
    
    return Response({'success': True, 'message': 'Shared!'})


#  For user's shared recipes :-  

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_shared_recipes(request):
    shared_items = Shared.objects.filter(user=request.user).select_related('recipe')
    recipes = [item.recipe for item in shared_items]
    
    # ✅ FORCE FULL SERIALIZER FIELDS
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    data = serializer.data
    
    # ✅ DEBUG: Print recipe data
    for i, recipe in enumerate(data):
        print(f"RECIPE {i+1}: {recipe.get('recipe_name', 'NO NAME')} | Image: {recipe.get('image', 'NO IMAGE')}")
    
    return Response({
        'recipes': data, 
        'count': len(data)
    })


# To download the recipe :-
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_recipe(request, recipe_id):
    """Download recipe as TXT file"""
    recipe = get_object_or_404(Recipe_details, id=recipe_id)
    
    # Save download record
    Download.objects.get_or_create(user=request.user, recipe=recipe)
    
    # Build text content - EXACT SAME
    content = f"""
Recipe: {recipe.recipe_name}
Category: {recipe.category_name}
Ingredients:
{recipe.ingredients}

Methods:
{recipe.methods}

Extra Tips:
{recipe.extra_tips or "None"}
"""
    
    # TXT file response
    response = HttpResponse(content, content_type="text/plain; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{recipe.recipe_name.replace(" ", "_")}.txt"'
    return response

#  To see the downloaded recipes on dounloaded page 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def downloaded_recipes(request):
    """Get user's downloaded recipes"""
    recipes = Recipe_details.objects.filter(downloads__user=request.user).distinct()
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response({'recipes': serializer.data})
# ===============================
# ADD RECIPE - YOUR RecipeSerializer
# ===============================

@permission_classes([IsAuthenticated]) 
@api_view(["POST"])
def add_recipe(request):
    """Create recipe using YOUR RecipeSerializer"""
    serializer = RecipeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({
            'success': True,
            'recipe': serializer.data
        })
    return Response(serializer.errors, status=400)

# ===============================
# COMMENTS
# ===============================
 
 # ✅ GET all comments for recipe
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recipe_comments(request, recipe_id):
    """Get all comments for recipe"""
    comments = Comment.objects.filter(recipe_id=recipe_id).select_related('user').order_by('-created_at')
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response({"comments": serializer.data})

# ✅ POST new comment
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):
    """Add new comment to recipe"""
    serializer = CommentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_recipe_comment(request, recipe_id):
    try:
        recipe = get_object_or_404(Recipe_details, id=recipe_id)
        comment_text = request.data.get('comment_txt', '').strip()
        
        if not comment_text:
            return Response({'error': 'Comment cannot be empty'}, status=400)
        
        comment = Comment.objects.create(
            recipe=recipe,
            user=request.user,
            comment_txt=comment_text
        )
        
        serializer = CommentSerializer(comment, context={'request': request})
        return Response({
            'message': 'Comment added successfully',
            'comment': serializer.data
        }, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
 # ✅ FIXED Edit Comment View - REPLACE yours:
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_comment(request, comment_id):
    """Edit user's OWN comment only"""
    try:
        # ✅ FIX 1: Get comment AND check user ownership
        comment = Comment.objects.get(id=comment_id, user=request.user)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found or not yours"}, status=404)
    
    # ✅ FIX 2: Correct 'request.data' (was 'req uest.data')
    serializer = CommentSerializer(comment, data=request.data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Comment updated successfully',
            'comment': serializer.data
        }, status=200)
    
    return Response(serializer.errors, status=400)

# ✅ DELETE comment (user's own comment only)
@api_view(['DELETE'])  # ✅ MUST be DELETE
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id, user=request.user)
        comment.delete()
        return Response({"message": "Comment deleted"}, status=204)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found"}, status=404)


# ===============================
# SEARCH & RECOMMENDED
# ===============================

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def search_recipes(request):
    """Search with YOUR RecipeSerializer"""
    query = request.query_params.get('q', '')
    recipes = Recipe_details.objects.filter(recipe_name__icontains=query)
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def recommended_recipes(request):
    """Recommended with YOUR RecipeSerializer"""
    recipes = Recipe_details.objects.order_by('-id')[:8]
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)


# for degugging 
@api_view(['GET'])
def debug_session(request):
    return Response({
        'authenticated': request.user.is_authenticated,
        'username': str(request.user),
        'session_key': request.session.session_key,
        'cookies': list(request.COOKIES.keys())
    })


#  Edit recipes:-
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def recipe_update(request, recipe_id):
    """✅ FIXED: Proper field handling + Category lookup"""
    
    parser_classes = [MultiPartParser, FormParser]
    
    # Rest of your view SAME
    recipe = get_object_or_404(Recipe_details, id=recipe_id, user=request.user)
    
    # ✅ Your image handling is ALREADY PERFECT:
    if request.FILES.get('image'):
        recipe.image = request.FILES['image']
    try:
        # ✅ Get recipe owned by user
        recipe = get_object_or_404(Recipe_details, id=recipe_id, user=request.user)
    except:
        return Response({"detail": "Recipe not found"}, status=404)
    
    # ✅ Handle image upload
    if request.FILES.get('image'):
        recipe.image = request.FILES['image']
    
    # ✅ Safely update text fields
    recipe.recipe_name = request.data.get('recipe_name', recipe.recipe_name)
    recipe.ingredients = request.data.get('ingredients', recipe.ingredients)
    recipe.methods = request.data.get('methods', recipe.methods)
    recipe.extra_tips = request.data.get('extra_tips', recipe.extra_tips)
    
    # ✅ Handle category_name (ID → Category object)
    category_id = request.data.get('category_name')
    if category_id:
        try:
            category = Category.objects.get(id=category_id)
            recipe.category_name = category
        except Category.DoesNotExist:
            return Response({"detail": "Invalid category"}, status=400)
    
    recipe.save()
    
    serializer = RecipeSerializer(recipe, context={'request': request})
    return Response({
        "message": "✅ Recipe updated successfully!",
        "recipe": serializer.data
    }, status=200)

# Delete recipes :- 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def recipe_delete(request, recipe_id):
    """Delete user's recipe"""
    try:
        recipe = Recipe_details.objects.get(id=recipe_id, user=request.user)
        recipe.delete()
        return Response({"message": "Recipe deleted successfully!"}, status=204)
    except Recipe_details.DoesNotExist:
        return Response({"detail": "Recipe not found or not yours"}, status=404)



# Password of the user  Darshana_11 is djd11
# Password for the user Alice_0 is alice098
# Password of the user Ishwar_Dama is ishw@rD02