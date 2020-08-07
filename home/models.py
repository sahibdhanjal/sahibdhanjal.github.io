from django.db import models


class Link(models.Model):
    link = models.URLField()
    show = models.BooleanField()
    alt_text = models.CharField(max_length=15, blank=True)
    img_class = models.CharField(max_length=40)

    def __str__(self):
        return self.alt_text
