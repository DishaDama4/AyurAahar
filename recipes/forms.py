from django import forms
from django.contrib.auth.models import User
from .models import Recipe_details  , Category

# User signup form
class SignUpForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ["username", "email"]

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("password1")
        p2 = cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])  # hashes the password
        if commit:
            user.save()
        return user

# Recipe form 
class RecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe_details
        fields = ["recipe_name", "category_name", "ingredients", "methods", "extra_tips", "image"]
        labels = { "recipe_name": "Dish name", 
                  "category_name": "Category", 
                  "ingredients": "Ingredients", 
                  "methods": "Methods", 
                  "extra_tips": "Extra tips (optional)", 
                  "image": "Dish image", 
                  }
        widgets = {
            "recipe_name": forms.TextInput(attrs={
                "id": "dish_name",
                "class": "w-full px-3 py-2 rounded-xl border border-[#FF9933] bg-[#FFEBCD] focus:outline-none focus:ring-2 focus:ring-[#FF9933]",
                "placeholder": "e.g. Thalipeeth"
            }),
            "category_name": forms.Select(attrs={
                "id": "category",
                "class": "w-full px-3 py-2 rounded-xl border border-[#FF9933] bg-[#FFEBCD] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            }),
            "ingredients": forms.Textarea(attrs={
                "id": "ingredients",
                "rows": 4,
                "class": "w-full px-3 py-2 rounded-xl border border-[#FF9933] bg-[#FFEBCD] focus:outline-none focus:ring-2 focus:ring-[#FF9933]",
                "placeholder": "Write ingredients with quantity, each on a new line..."
            }),
            "methods": forms.Textarea(attrs={
                "id": "methods",
                "rows": 5,
                "class": "w-full px-3 py-2 rounded-xl border border-[#FF9933] bg-[#FFEBCD] focus:outline-none focus:ring-2 focus:ring-[#FF9933]",
                "placeholder": "Step 1: ...\nStep 2: ...\nStep 3: ..."
            }),
            "extra_tips": forms.Textarea(attrs={
                "id": "extra_tips",
                "rows": 3,
                "class": "w-full px-3 py-2 rounded-xl border border-[#FF9933] bg-[#FFEBCD] focus:outline-none focus:ring-2 focus:ring-[#FF9933]",
                "placeholder": "Ayurvedic tips, serving ideas, variations..."
            }),
            "image": forms.ClearableFileInput(attrs={
                "id": "image",
                "class": "block w-full text-sm text-[#964B00] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF9933] file:text-white hover:file:bg-[#964B00]"
            }),
        }
