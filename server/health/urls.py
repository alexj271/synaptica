from django.urls import path, include
from rest_framework import routers

from . import views
from .views import HealthDataViewSet, RecommendationViewSet

# Integrate router_v1 with HealthDataViewSet and RecommendationViewSet, keeping manual endpoints for action/summary
router_v1 = routers.DefaultRouter()
router_v1.register('health-data', HealthDataViewSet)
router_v1.register('recommendations', RecommendationViewSet)

# Define URL patterns for the health app
urlpatterns = [
    path('v1/', include(router_v1.urls)),

    # User-specific endpoints
    path('user/<int:user_id>/recommendations', views.UserRecommendationsView.as_view(), name='user-recommendations'),
    path('user/<int:user_id>/health-data', views.UserHealthDataView.as_view(), name='user-health-data'),
    path('user/<int:user_id>/profile', views.UserProfileView.as_view(), name='user-profile'),
    path('user/<int:user_id>/health-summary', views.health_summary, name='user-health-summary'),

    # Recommendation endpoints
    path('recommendations/<int:pk>', views.RecommendationDetailView.as_view(), name='recommendation-detail'),
    path('recommendations/<int:pk>/action', views.RecommendationActionView.as_view(), name='recommendation-action'),
    path('recommendations/create', views.create_recommendation, name='recommendation-create'),
]
