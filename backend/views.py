from home.models import Link
from django.shortcuts import render


def about_page(request):
    social_links = Link.objects.all()
    context = {'social_links': social_links}
    return render(request, 'home/about.html', context)