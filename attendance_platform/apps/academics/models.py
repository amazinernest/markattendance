from django.db import models
import uuid

class AcademicSession(models.Model):
    """e.g. 2024‑2025 Academic Session"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

class Semester(models.Model):
    """Semester within an academic session, e.g. Fall, Spring"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE, related_name='semesters')
    name = models.CharField(max_length=50)
    order = models.PositiveIntegerField(help_text='Order within the session')

    class Meta:
        unique_together = ('session', 'name')
        ordering = ['order']

    def __str__(self):
        return f"{self.session.name} – {self.name}"