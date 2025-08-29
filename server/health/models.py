from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class UserProfile(models.Model):
    """Extended user profile for storing additional user information."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=255, help_text="User's full name")
    email = models.EmailField(unique=True, help_text="User's email address")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional profile fields
    age = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(150)])
    timezone = models.CharField(max_length=50, default='UTC', help_text="User's timezone")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class HealthData(models.Model):
    """Daily health metrics for users."""
    
    ACTIVITY_LEVELS = [
        ('sedentary', 'Sedentary'),
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('vigorous', 'Vigorous'),
        ('very_active', 'Very Active'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_data')
    date = models.DateField(help_text="Date of the health data")
    
    # Health metrics
    steps = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100000)],
        help_text="Daily step count"
    )
    sleep_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(24)],
        help_text="Hours of sleep"
    )
    heart_rate_avg = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(220)],
        help_text="Average heart rate in BPM"
    )
    activity_level = models.CharField(
        max_length=20,
        choices=ACTIVITY_LEVELS,
        default='moderate',
        help_text="Overall activity level for the day"
    )
    
    # Additional health metrics
    calories_burned = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(10000)],
        help_text="Calories burned"
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1000)],
        help_text="Weight in kg"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_data'
        verbose_name = 'Health Data'
        verbose_name_plural = 'Health Data'
        unique_together = ['user', 'date']
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
    @property
    def activity_score(self):
        """Calculate a simple activity score based on steps and activity level."""
        activity_multiplier = {
            'sedentary': 0.5,
            'light': 0.7,
            'moderate': 1.0,
            'vigorous': 1.3,
            'very_active': 1.5,
        }
        
        base_score = min(self.steps / 100, 100)  # 100 steps = 1 point, max 100
        multiplier = activity_multiplier.get(self.activity_level, 1.0)
        
        return round(base_score * multiplier, 2)


class Recommendation(models.Model):
    """AI-generated recommendations and exercises for users."""
    
    RECOMMENDATION_TYPES = [
        ('exercise', 'Exercise'),
        ('nutrition', 'Nutrition'),
        ('sleep', 'Sleep'),
        ('mindfulness', 'Mindfulness'),
        ('general', 'General Health'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    date = models.DateField(default=timezone.now, help_text="Date when recommendation was generated")
    
    # Recommendation details
    title = models.CharField(max_length=255, help_text="Short title for the recommendation")
    content = models.TextField(help_text="Detailed recommendation content")
    type = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_TYPES,
        default='general',
        help_text="Type of recommendation"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='medium',
        help_text="Priority level of the recommendation"
    )
    
    # AI/ML related fields
    confidence_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="AI confidence score (0.0 to 1.0)"
    )
    model_version = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Version of the AI model used"
    )
    
    # User interaction
    is_read = models.BooleanField(default=False, help_text="Has user read this recommendation")
    is_completed = models.BooleanField(default=False, help_text="Has user completed this recommendation")
    user_rating = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="User rating (1-5 stars)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this recommendation expires"
    )
    
    class Meta:
        db_table = 'recommendations'
        verbose_name = 'Recommendation'
        verbose_name_plural = 'Recommendations'
        ordering = ['-created_at', '-priority']
    
    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.date})"
    
    @property
    def is_expired(self):
        """Check if the recommendation has expired."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def mark_as_read(self):
        """Mark recommendation as read."""
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])
    
    def mark_as_completed(self):
        """Mark recommendation as completed."""
        self.is_completed = True
        self.save(update_fields=['is_completed', 'updated_at'])


# Signal handlers for automatic profile creation
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create UserProfile when User is created."""
    if created:
        UserProfile.objects.create(
            user=instance,
            name=f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            email=instance.email or f"{instance.username}@example.com"
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
