from django.contrib import admin
from django.urls import path, include
from . import views

app_name = 'projects'

urlpatterns = [
    path('<slug>/', views.detail, name='detail'),
]
