from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Use Django's create_user to hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
 
class ProfileSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'image', 'image_url']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name', 'icon']
 
class RecipeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category_name.category_name", read_only=True)
    category_icon = serializers.CharField(source="category_name.icon", read_only=True)
    liked = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    # ✅ FIXED: Add user profile image
    user_profile_image = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Recipe_details
        fields = [
            "id", "recipe_name", "ingredients", "methods", "extra_tips",
            "image", "category_name", "category_icon", "user",
            "created_at", "is_public", "liked", "user_username",
            "user_profile_image",  # ✅ NEW FIELD
        ]

    def get_liked(self, obj):
        user = self.context.get("request").user
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    # ✅ REPLACE your RecipeSerializer method:
    def get_user_profile_image(self, obj):
        request = self.context.get('request')
        user = obj.user
    
    # Direct user profile image
        if hasattr(user, 'profile_image') and getattr(user, 'profile_image'):
            return request.build_absolute_uri(user.profile_image.url)
    
    # Profile model (check common field names)
        if hasattr(user, 'profile') and user.profile:
            profile = user.profile
            image_field = (getattr(profile, 'profile_picture', None) or 
                      getattr(profile, 'image', None) or 
                      getattr(profile, 'avatar', None))
            if image_field:
                return request.build_absolute_uri(image_field.url)
    
        return request.build_absolute_uri('/static/images/default_user.png')

    def validate_category_name(self, value):
        if not Category.objects.filter(id=value).exists():
            raise serializers.ValidationError("Category does not exist")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "recipe", "created_at"]


class SharedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shared
        fields = ["id", "user", "recipe", "shared_at"]


class DownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Download
        fields = ["id", "user", "recipe", "downloaded_at"]
 

# ✅ REPLACE your CommentSerializer get_user_image method:
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    user_image = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_image', 'comment_txt', 'created_at']

    def get_user_image(self, obj):
        request = self.context.get('request')
        user = obj.user
        
        # ✅ FIXED: Check your ACTUAL Profile model field name
        if hasattr(user, 'profile_image') and user.profile_image:
            return request.build_absolute_uri(user.profile_image.url)
        elif hasattr(user, 'profile') and user.profile:  # Profile exists
            # ✅ CHANGE THIS to your Profile model's ACTUAL image field name
            profile_image_field = getattr(user.profile, 'profile_picture', None) or \
                                 getattr(user.profile, 'image', None) or \
                                 getattr(user.profile, 'avatar', None) or \
                                 getattr(user.profile, 'photo', None)
            
            if profile_image_field:
                return request.build_absolute_uri(profile_image_field.url)
        return "https://ayuraahar.onrender.com/static/images/default_user.jpg"

