from django.contrib import admin
from .models import Profile
from .models import Category
from .models import Recipe_details
from .models import Like 
from .models import  Shared
from .models import Download
from .models import Comment
admin.site.register(Profile)
admin.site.register(Category)
admin.site.register(Recipe_details)
admin.site.register(Like)
admin.site.register(Shared)
admin.site.register(Download)
admin.site.register(Comment)