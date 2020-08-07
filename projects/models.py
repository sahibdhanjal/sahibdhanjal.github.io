from django.db import models


class Tech(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Project(models.Model):
    slug = models.SlugField(max_length=80)
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField()
    show = models.BooleanField()
    lock = models.BooleanField()
    tech = models.ManyToManyField('Tech', related_name='techs')

    def __str__(self):
        return self.title

    @property
    def get_all_tech(self):
        tech_qs = self.tech.all()
        if tech_qs.exists():
            return tech_qs
        return None

    class Meta:
        ordering = ['-pk']
