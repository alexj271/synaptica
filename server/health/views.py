from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets

from .models import UserProfile, HealthData, Recommendation
from .serializers import (
    UserProfileSerializer, HealthDataSerializer, RecommendationSerializer,
    RecommendationListSerializer, RecommendationActionSerializer,
    HealthDataCreateUpdateSerializer
)
from .tasks import process_health_data_ai  # Will create this later


class HealthDataCreateView(APIView):
    """
    POST /data/health
    Accept JSON health data from companion app and create/update HealthData.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create or update health data for a user."""
        try:
            serializer = HealthDataCreateUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                with transaction.atomic():
                    health_data, created = serializer.save()
                    
                    # Trigger async AI processing
                    try:
                        process_health_data_ai.delay(health_data.id)
                    except Exception as e:
                        # Log error but don't fail the request
                        print(f"Failed to trigger AI processing: {e}")
                    
                    # Prepare response
                    response_serializer = HealthDataSerializer(health_data)
                    
                    return Response({
                        'success': True,
                        'message': 'Health data saved successfully' if created else 'Health data updated successfully',
                        'data': response_serializer.data,
                        'created': created
                    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Invalid data provided',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Server error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserRecommendationsView(generics.ListAPIView):
    """
    GET /user/<id>/recommendations
    Return list of recommendations for a specific user.
    """
    serializer_class = RecommendationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get recommendations for the specified user."""
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        
        # Filter recommendations based on query parameters
        queryset = Recommendation.objects.filter(user=user)
        
        # Filter by type if specified
        rec_type = self.request.query_params.get('type')
        if rec_type:
            queryset = queryset.filter(type=rec_type)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by completion status
        is_completed = self.request.query_params.get('is_completed')
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')
        
        # Exclude expired recommendations by default
        include_expired = self.request.query_params.get('include_expired', 'false')
        if include_expired.lower() != 'true':
            queryset = queryset.filter(expires_at__isnull=True) | queryset.filter(expires_at__gt=timezone.now())
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to add extra context."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add summary statistics
        total_count = queryset.count()
        unread_count = queryset.filter(is_read=False).count()
        pending_count = queryset.filter(is_completed=False).count()
        
        return Response({
            'success': True,
            'count': total_count,
            'unread_count': unread_count,
            'pending_count': pending_count,
            'results': serializer.data
        })


class RecommendationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /recommendations/<id>
    Retrieve or update a specific recommendation.
    """
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Ensure user can only access their own recommendations."""
        obj = super().get_object()
        if obj.user != self.request.user:
            self.permission_denied(self.request, message="You can only access your own recommendations.")
        return obj


class RecommendationActionView(APIView):
    """
    POST /recommendations/<id>/action
    Perform actions on recommendations (mark as read, completed, rate).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """Perform action on recommendation."""
        recommendation = get_object_or_404(Recommendation, id=pk, user=request.user)
        serializer = RecommendationActionSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            
            if action == 'mark_read':
                recommendation.mark_as_read()
                message = 'Recommendation marked as read'
                
            elif action == 'mark_completed':
                recommendation.mark_as_completed()
                message = 'Recommendation marked as completed'
                
            elif action == 'rate':
                recommendation.user_rating = serializer.validated_data['rating']
                recommendation.save(update_fields=['user_rating', 'updated_at'])
                message = f'Recommendation rated {recommendation.user_rating} stars'
            
            response_serializer = RecommendationSerializer(recommendation)
            return Response({
                'success': True,
                'message': message,
                'data': response_serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserHealthDataView(generics.ListAPIView):
    """
    GET /user/<id>/health-data
    Get health data history for a user.
    """
    serializer_class = HealthDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get health data for the specified user."""
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        
        queryset = HealthData.objects.filter(user=user)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.order_by('-date')


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /user/<id>/profile
    Retrieve or update user profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get user profile."""
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def health_summary(request, user_id):
    """
    GET /user/<id>/health-summary
    Get aggregated health data summary for a user.
    """
    user = get_object_or_404(User, id=user_id)
    
    # Get recent health data (last 30 days)
    from datetime import date, timedelta
    recent_data = HealthData.objects.filter(
        user=user,
        date__gte=date.today() - timedelta(days=30)
    ).order_by('-date')
    
    if not recent_data.exists():
        return Response({
            'success': True,
            'message': 'No recent health data found',
            'summary': {}
        })
    
    # Calculate summary statistics
    total_days = recent_data.count()
    avg_steps = recent_data.aggregate(avg=models.Avg('steps'))['avg'] or 0
    avg_sleep = recent_data.aggregate(avg=models.Avg('sleep_hours'))['avg'] or 0
    avg_heart_rate = recent_data.aggregate(avg=models.Avg('heart_rate_avg'))['avg'] or 0
    
    # Get latest data
    latest_data = recent_data.first()
    
    # Get activity level distribution
    from django.db import models
    activity_distribution = recent_data.values('activity_level').annotate(
        count=models.Count('activity_level')
    ).order_by('-count')
    
    summary = {
        'user_id': user_id,
        'period_days': total_days,
        'averages': {
            'steps': round(avg_steps, 0),
            'sleep_hours': round(avg_sleep, 2),
            'heart_rate_avg': round(avg_heart_rate, 0) if avg_heart_rate else None,
        },
        'latest': {
            'date': latest_data.date,
            'steps': latest_data.steps,
            'sleep_hours': float(latest_data.sleep_hours),
            'heart_rate_avg': latest_data.heart_rate_avg,
            'activity_level': latest_data.activity_level,
            'activity_score': latest_data.activity_score,
        },
        'activity_distribution': list(activity_distribution),
        'recommendations_count': Recommendation.objects.filter(
            user=user, 
            is_read=False
        ).count()
    }
    
    return Response({
        'success': True,
        'summary': summary
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_recommendation(request):
    """
    POST /recommendations/create
    Create a new recommendation (for AI system or admin use).
    """
    serializer = RecommendationSerializer(data=request.data)
    
    if serializer.is_valid():
        recommendation = serializer.save()
        return Response({
            'success': True,
            'message': 'Recommendation created successfully',
            'data': RecommendationSerializer(recommendation).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class HealthDataViewSet(viewsets.ModelViewSet):
    queryset = HealthData.objects.all()
    serializer_class = HealthDataSerializer
    # Можно добавить фильтрацию по пользователю, дате и т.д.


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    # Можно добавить фильтрацию по пользователю, типу и т.д.
