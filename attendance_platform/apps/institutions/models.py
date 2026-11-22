from django.db import models
import uuid

class Institution(models.Model):
    """Top‑level tenant representing a university / college."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    domain = models.CharField(max_length=255, help_text='Email domain e.g. example.edu', blank=True)

    def __str__(self):
        return self.name
