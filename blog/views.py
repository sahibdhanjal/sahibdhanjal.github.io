from django.shortcuts import render
from blog.models import Post, Comment
from home.models import Link
from django.http import HttpResponse
from blog.forms import CommentForm
from django.core.paginator import Paginator
from django.core.paginator import EmptyPage
from django.core.paginator import PageNotAnInteger


def page(request):
    social_links = Link.objects.all()
    blog_posts = Post.objects.all()
    paginator = Paginator(blog_posts, 24)
    page = request.GET.get('page')

    try:
        blog_posts = paginator.page(page)
    except PageNotAnInteger:
        blog_posts = paginator.page(1)
    except EmptyPage:
        blog_posts = paginator.page(paginator.num_pages)

    context = {'social_links': social_links, 'blog_posts': blog_posts}
    return render(request, 'blog/base.html', context)


def detail(request, slug):
    post_query_set = Post.objects.filter(slug=slug)
    if post_query_set.exists():
        post = post_query_set.first()
    else:
        return HttpResponse(status=404)
    comments = Comment.objects.filter(post=post)
    social_links = Link.objects.all()

    form = CommentForm()

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = Comment(
                name=form.cleaned_data['name'],
                comment=form.cleaned_data['comment'],
                post=post,
            )
            comment.save()
    context = {
        'blog': post,
        'social_links': social_links,
        'comments': comments,
        'form': form
    }
    return render(request, 'blog/detail.html', context)
