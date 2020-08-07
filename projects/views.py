from django.shortcuts import render
from django.http import HttpResponse
from projects.models import Project
from home.models import Link


def get_num_projects_with_related_tech(project):
    projects_tech_wise = {}
    for tech in project.get_all_tech:
        projects_tech_wise[tech.name] = Project.objects.filter(
            tech=tech).count() - 1
    return projects_tech_wise


def detail(request, slug):
    social_links = Link.objects.all()
    project_query_set = Project.objects.filter(slug=slug)
    if project_query_set.exists():
        project = project_query_set.first()
    else:
        return HttpResponse(status=404)

    context = {
        'project': project,
        'social_links': social_links,
    }
    
    previous_project_qs = Project.objects.filter(pk=project.pk - 1)
    if previous_project_qs.exists():
        previous_project = previous_project_qs.first()
        context['previous'] = previous_project

    next_project_qs = Project.objects.filter(pk=project.pk + 1)
    if next_project_qs.exists():
        next_project = next_project_qs.first()
        context['next'] = next_project

    return render(request, 'projects/detail.html', context)
