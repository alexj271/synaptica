from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date

from .models import UserProfile, HealthData, Recommendation


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user_id', 'username', 'name', 'email', 'age', 
            'timezone', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class HealthDataSerializer(serializers.ModelSerializer):
    """Serializer for HealthData model."""
    
    user_id = serializers.CharField(write_only=True, help_text="User ID as string")
    activity_score = serializers.ReadOnlyField()
    
    class Meta:
        model = HealthData
        fields = [
            'id', 'user_id', 'date', 'steps', 'sleep_hours', 
            'heart_rate_avg', 'activity_level', 'calories_burned', 
            'weight', 'activity_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'activity_score', 'created_at', 'updated_at']
    
    def validate_user_id(self, value):
        """Validate that user_id exists and get User instance."""
        try:
            user = User.objects.get(username=value)
            return user
        except User.DoesNotExist:
            # Try to get by ID if username doesn't work
            try:
                user = User.objects.get(id=int(value))
                return user
            except (User.DoesNotExist, ValueError):
                raise serializers.ValidationError(f"User with identifier '{value}' does not exist.")
    
    def validate_date(self, value):
        """Validate date is not in the future."""
        if value > date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value
    
    def validate_steps(self, value):
        """Validate steps count is reasonable."""
        if value < 0:
            raise serializers.ValidationError("Steps cannot be negative.")
        if value > 100000:
            raise serializers.ValidationError("Steps count seems unrealistic (max 100,000).")
        return value
    
    def validate_sleep_hours(self, value):
        """Validate sleep hours is reasonable."""
        if value < 0:
            raise serializers.ValidationError("Sleep hours cannot be negative.")
        if value > 24:
            raise serializers.ValidationError("Sleep hours cannot exceed 24 hours.")
        return value
    
    def validate_heart_rate_avg(self, value):
        """Validate heart rate is reasonable."""
        if value is not None:
            if value < 30 or value > 220:
                raise serializers.ValidationError("Heart rate must be between 30 and 220 BPM.")
        return value
    
    def create(self, validated_data):
        """Create or update HealthData instance."""
        user_id = validated_data.pop('user_id')
        user = self.validate_user_id(user_id)
        
        # Use update_or_create to handle duplicate dates
        health_data, created = HealthData.objects.update_or_create(
            user=user,
            date=validated_data['date'],
            defaults=validated_data
        )
        
        return health_data
    
    def to_representation(self, instance):
        """Customize output representation."""
        data = super().to_representation(instance)
        # Include user information in response
        data['user'] = {
            'id': instance.user.id,
            'username': instance.user.username,
            'name': getattr(instance.user.profile, 'name', instance.user.username)
        }
        return data


class RecommendationSerializer(serializers.ModelSerializer):
    """Serializer for Recommendation model."""
    
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Recommendation
        fields = [
            'id', 'user', 'user_name', 'date', 'title', 'content', 
            'type', 'priority', 'confidence_score', 'model_version',
            'is_read', 'is_completed', 'user_rating', 'is_expired',
            'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'user_name', 'is_expired', 'created_at', 'updated_at'
        ]
    
    def validate_confidence_score(self, value):
        """Validate confidence score is between 0 and 1."""
        if value is not None:
            if value < 0.0 or value > 1.0:
                raise serializers.ValidationError("Confidence score must be between 0.0 and 1.0.")
        return value
    
    def validate_user_rating(self, value):
        """Validate user rating is between 1 and 5."""
        if value is not None:
            if value < 1 or value > 5:
                raise serializers.ValidationError("User rating must be between 1 and 5.")
        return value
    
    def validate_expires_at(self, value):
        """Validate expiration date is not in the past."""
        if value is not None:
            if value < timezone.now():
                raise serializers.ValidationError("Expiration date cannot be in the past.")
        return value


class RecommendationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing recommendations."""
    
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Recommendation
        fields = [
            'id', 'title', 'type', 'priority', 'is_read', 
            'is_completed', 'is_expired', 'created_at', 'expires_at'
        ]


class RecommendationActionSerializer(serializers.Serializer):
    """Serializer for recommendation actions (mark as read/completed)."""
    
    action = serializers.ChoiceField(
        choices=['mark_read', 'mark_completed', 'rate'],
        help_text="Action to perform on the recommendation"
    )
    rating = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=5,
        help_text="Rating for the recommendation (1-5, required for 'rate' action)"
    )
    
    def validate(self, data):
        """Validate that rating is provided for rate action."""
        if data.get('action') == 'rate' and 'rating' not in data:
            raise serializers.ValidationError("Rating is required for 'rate' action.")
        return data


class HealthDataCreateUpdateSerializer(serializers.Serializer):
    """Specialized serializer for creating/updating health data from mobile app."""
    
    user_id = serializers.CharField(help_text="User identifier")
    date = serializers.DateField(help_text="Date of the health data (YYYY-MM-DD)")
    steps = serializers.IntegerField(min_value=0, max_value=100000)
    sleep_hours = serializers.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        min_value=0, 
        max_value=24
    )
    heart_rate_avg = serializers.IntegerField(
        required=False, 
        allow_null=True,
        min_value=30, 
        max_value=220
    )
    activity_level = serializers.ChoiceField(
        choices=HealthData.ACTIVITY_LEVELS,
        default='moderate'
    )
    
    def validate_user_id(self, value):
        """Find user by username or ID."""
        try:
            # Try username first
            return User.objects.get(username=value)
        except User.DoesNotExist:
            try:
                # Try ID
                return User.objects.get(id=int(value))
            except (User.DoesNotExist, ValueError):
                raise serializers.ValidationError(f"User '{value}' not found.")
    
    def validate_date(self, value):
        """Ensure date is not in future."""
        if value > date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value
    
    def save(self):
        """Create or update health data record."""
        validated_data = self.validated_data.copy()
        user = validated_data.pop('user_id')
        
        health_data, created = HealthData.objects.update_or_create(
            user=user,
            date=validated_data['date'],
            defaults=validated_data
        )
        
        return health_data, created
