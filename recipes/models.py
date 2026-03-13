from django.db import models
# Create the models here 
from django.contrib.auth.models import User
from django.conf import settings
 

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="profile_img/", null=True, blank=True)
    def __str__(self):
        return self.user.username

class Category(models.Model):
    category_name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, null=True) # store icon name/class
    def __str__(self):
        return self.category_name    
    class Meta: 
        verbose_name = "Category" 
        verbose_name_plural = "Categories"
 
class Recipe_details(models.Model): 
    recipe_name = models.CharField(max_length=200)
    category_name = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="recipes")
    ingredients = models.TextField()
    methods = models.TextField()
    extra_tips = models.TextField(blank=True, null=True)  #optionl can be null 
    image = models.ImageField(upload_to="recipe_img/")   # <-- new folder for recipes
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recipes")
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True) # new field
    def __str__(self):
        return self.recipe_name
    class Meta: 
        verbose_name = "Recipe_details" 
        verbose_name_plural = "Recipe_details"

class Like(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    recipe = models.ForeignKey("Recipe_details", on_delete=models.CASCADE, related_name="likes") 
    created_at = models.DateTimeField(auto_now_add=True) 
    class Meta:
        unique_together = ("user", "recipe") # prevents duplicate likes 
    def __str__(self): 
        return f"{self.user.username} likes {self.recipe.recipe_name}"


class Shared(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shared_recipes")
    recipe = models.ForeignKey("Recipe_details", on_delete=models.CASCADE, related_name="shared_by")
    shared_at = models.DateTimeField(auto_now_add=True)
    class Meta: 
        verbose_name = "Shared" 
        verbose_name_plural = "Shared"

    def __str__(self):
        return f"{self.user.username} shared {self.recipe.recipe_name}"

 

class Download(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="downloads")
    recipe = models.ForeignKey("Recipe_details", on_delete=models.CASCADE, related_name="downloads")
    downloaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} downloaded {self.recipe.recipe_name} at {self.downloaded_at}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    recipe = models.ForeignKey("Recipe_details", on_delete=models.CASCADE, related_name="comments")
    comment_txt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} commented on {self.recipe.recipe_name}"
