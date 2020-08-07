from django.contrib import admin
from django.urls import path, include
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.page, name='all_articles'),
    path('<slug>/', views.detail, name='article'),
]
