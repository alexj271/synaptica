from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone

from .models import UserProfile, HealthData, Recommendation


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model."""
    
    list_display = ['name', 'email', 'user_link', 'age', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'timezone']
    search_fields = ['name', 'email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'email')
        }),
        ('Additional Details', {
            'fields': ('age', 'timezone', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_link(self, obj):
        """Link to user admin page."""
        if obj.user:
            url = reverse('admin:auth_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return '-'
    user_link.short_description = 'User'


@admin.register(HealthData)
class HealthDataAdmin(admin.ModelAdmin):
    """Admin interface for HealthData model."""
    
    list_display = [
        'user_name', 'date', 'steps', 'sleep_hours', 
        'heart_rate_avg', 'activity_level', 'activity_score'
    ]
    list_filter = ['date', 'activity_level', 'created_at']
    search_fields = ['user__username', 'user__profile__name']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    
    fieldsets = (
        ('User & Date', {
            'fields': ('user', 'date')
        }),
        ('Health Metrics', {
            'fields': ('steps', 'sleep_hours', 'heart_rate_avg', 'activity_level')
        }),
        ('Additional Metrics', {
            'fields': ('calories_burned', 'weight'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def user_name(self, obj):
        """Display user's name."""
        return getattr(obj.user.profile, 'name', obj.user.username)
    user_name.short_description = 'User'
    user_name.admin_order_field = 'user__profile__name'


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    """Admin interface for Recommendation model."""
    
    list_display = [
        'title', 'user_name', 'type', 'priority', 
        'is_read', 'is_completed', 'status', 'created_at'
    ]
    list_filter = [
        'type', 'priority', 'is_read', 'is_completed', 
        'created_at', 'expires_at'
    ]
    search_fields = ['title', 'content', 'user__username', 'user__profile__name']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'content')
        }),
        ('Classification', {
            'fields': ('type', 'priority', 'date')
        }),
        ('AI/ML Details', {
            'fields': ('confidence_score', 'model_version'),
            'classes': ('collapse',)
        }),
        ('User Interaction', {
            'fields': ('is_read', 'is_completed', 'user_rating')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def user_name(self, obj):
        """Display user's name."""
        return getattr(obj.user.profile, 'name', obj.user.username)
    user_name.short_description = 'User'
    user_name.admin_order_field = 'user__profile__name'
    
    def status(self, obj):
        """Display recommendation status with color coding."""
        if obj.is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        elif obj.is_completed:
            return format_html('<span style="color: green;">Completed</span>')
        elif obj.is_read:
            return format_html('<span style="color: orange;">Read</span>')
        else:
            return format_html('<span style="color: blue;">New</span>')
    status.short_description = 'Status'
    
    actions = ['mark_as_read', 'mark_as_completed', 'extend_expiration']
    
    def mark_as_read(self, request, queryset):
        """Mark selected recommendations as read."""
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} recommendations marked as read.')
    mark_as_read.short_description = 'Mark selected recommendations as read'
    
    def mark_as_completed(self, request, queryset):
        """Mark selected recommendations as completed."""
        updated = queryset.update(is_completed=True)
        self.message_user(request, f'{updated} recommendations marked as completed.')
    mark_as_completed.short_description = 'Mark selected recommendations as completed'
    
    def extend_expiration(self, request, queryset):
        """Extend expiration date by 7 days."""
        from datetime import timedelta
        new_expiry = timezone.now() + timedelta(days=7)
        updated = queryset.update(expires_at=new_expiry)
        self.message_user(request, f'Extended expiration for {updated} recommendations by 7 days.')
    extend_expiration.short_description = 'Extend expiration by 7 days'


# Customize admin site headers
admin.site.site_header = 'Synaptica Health Admin'
admin.site.site_title = 'Synaptica Admin'
admin.site.index_title = 'Health & Cognitive Tracking Administration'
