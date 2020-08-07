from django.shortcuts import render
from home.models import Link
from projects.models import Project


def page(request):
    social_links = Link.objects.all()
    projects = Project.objects.all()
    context = {'projects': projects, 'social_links': social_links}
    return render(request, 'home/home.html', context)
