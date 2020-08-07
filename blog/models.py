from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Post(models.Model):
    slug = models.SlugField(max_length=80)
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=120, blank=True)
    date = models.DateField(auto_now_add=True)
    description = models.TextField()
    image = models.ImageField(blank=True)
    show = models.BooleanField()
    lock = models.BooleanField()
    love_reacts = models.IntegerField(default=0)
    categories = models.ManyToManyField('Category', related_name='posts')

    class Meta:
        ordering = ['-pk']

    def __str__(self):
        return self.title

    @property
    def get_all_categories(self):
        category_qs = self.categories.all()
        if category_qs.exists():
            return category_qs
        return None


class Comment(models.Model):
    name = models.CharField(max_length=80)
    comment = models.TextField()
    date = models.DateField(auto_now_add=True)
    post = models.ForeignKey('Post', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
