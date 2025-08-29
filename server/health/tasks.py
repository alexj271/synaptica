from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

from .models import HealthData, Recommendation

logger = logging.getLogger(__name__)


@shared_task
def process_health_data_ai(health_data_id):
    """
    Process health data and generate AI recommendations.
    This is a placeholder for AI integration.
    """
    try:
        health_data = HealthData.objects.get(id=health_data_id)
        logger.info(f"Processing health data for user {health_data.user.username}, date {health_data.date}")
        
        # Placeholder AI logic - replace with actual AI service calls
        recommendations = []
        
        # Example: Step count recommendations
        if health_data.steps < 5000:
            recommendations.append({
                'title': 'Increase Daily Steps',
                'content': f'You walked {health_data.steps} steps today. Try to reach 10,000 steps daily for better health.',
                'type': 'exercise',
                'priority': 'medium',
                'confidence_score': 0.85
            })
        
        # Example: Sleep recommendations
        if health_data.sleep_hours < 6:
            recommendations.append({
                'title': 'Improve Sleep Quality',
                'content': f'You slept only {health_data.sleep_hours} hours. Aim for 7-9 hours of quality sleep.',
                'type': 'sleep',
                'priority': 'high',
                'confidence_score': 0.90
            })
        elif health_data.sleep_hours > 9:
            recommendations.append({
                'title': 'Sleep Schedule Optimization',
                'content': f'You slept {health_data.sleep_hours} hours. Consider a consistent sleep schedule.',
                'type': 'sleep',
                'priority': 'low',
                'confidence_score': 0.75
            })
        
        # Example: Heart rate recommendations
        if health_data.heart_rate_avg and health_data.heart_rate_avg > 100:
            recommendations.append({
                'title': 'Monitor Heart Rate',
                'content': f'Your average heart rate was {health_data.heart_rate_avg} BPM. Consider stress management techniques.',
                'type': 'mindfulness',
                'priority': 'medium',
                'confidence_score': 0.80
            })
        
        # Create recommendation objects
        for rec_data in recommendations:
            Recommendation.objects.create(
                user=health_data.user,
                date=health_data.date,
                title=rec_data['title'],
                content=rec_data['content'],
                type=rec_data['type'],
                priority=rec_data['priority'],
                confidence_score=rec_data['confidence_score'],
                model_version='v1.0.0',
                expires_at=timezone.now() + timedelta(days=7)  # Expire in 7 days
            )
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {health_data.user.username}")
        return f"Processed health data and generated {len(recommendations)} recommendations"
        
    except HealthData.DoesNotExist:
        logger.error(f"HealthData with ID {health_data_id} not found")
        return f"HealthData with ID {health_data_id} not found"
    
    except Exception as e:
        logger.error(f"Error processing health data {health_data_id}: {str(e)}")
        return f"Error processing health data: {str(e)}"


@shared_task
def cleanup_expired_recommendations():
    """
    Clean up expired recommendations.
    Run this task daily.
    """
    try:
        expired_count = Recommendation.objects.filter(
            expires_at__lt=timezone.now(),
            is_completed=False
        ).delete()[0]
        
        logger.info(f"Cleaned up {expired_count} expired recommendations")
        return f"Cleaned up {expired_count} expired recommendations"
        
    except Exception as e:
        logger.error(f"Error cleaning up expired recommendations: {str(e)}")
        return f"Error cleaning up expired recommendations: {str(e)}"


@shared_task
def generate_weekly_summary(user_id):
    """
    Generate weekly health summary for a user.
    """
    try:
        from django.contrib.auth.models import User
        from django.db.models import Avg, Sum
        
        user = User.objects.get(id=user_id)
        
        # Get last 7 days of data
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        weekly_data = HealthData.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        )
        
        if not weekly_data.exists():
            return f"No data available for user {user.username} in the last 7 days"
        
        # Calculate averages
        stats = weekly_data.aggregate(
            avg_steps=Avg('steps'),
            total_steps=Sum('steps'),
            avg_sleep=Avg('sleep_hours'),
            avg_heart_rate=Avg('heart_rate_avg')
        )
        
        # Generate summary recommendation
        summary_content = f"""Weekly Health Summary:
        
        📊 Steps: {stats['total_steps']:,} total ({stats['avg_steps']:.0f} daily average)
        😴 Sleep: {stats['avg_sleep']:.1f} hours average
        ❤️ Heart Rate: {stats['avg_heart_rate']:.0f} BPM average
        
        Keep up the great work! Review your detailed metrics in the app.
        """
        
        # Create weekly summary recommendation
        Recommendation.objects.create(
            user=user,
            date=end_date,
            title=f'Weekly Health Summary - {start_date.strftime("%b %d")} to {end_date.strftime("%b %d")}',
            content=summary_content,
            type='general',
            priority='low',
            confidence_score=1.0,
            model_version='summary_v1.0',
            expires_at=timezone.now() + timedelta(days=30)
        )
        
        logger.info(f"Generated weekly summary for user {user.username}")
        return f"Generated weekly summary for user {user.username}"
        
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found")
        return f"User with ID {user_id} not found"
        
    except Exception as e:
        logger.error(f"Error generating weekly summary for user {user_id}: {str(e)}")
        return f"Error generating weekly summary: {str(e)}"


@shared_task
def batch_process_health_data():
    """
    Batch process all unprocessed health data.
    This can be run periodically to ensure no data is missed.
    """
    try:
        # Find health data from today that might not have generated recommendations
        today = timezone.now().date()
        
        health_data_today = HealthData.objects.filter(date=today)
        processed_count = 0
        
        for health_data in health_data_today:
            # Check if recommendations already exist for this data
            existing_recs = Recommendation.objects.filter(
                user=health_data.user,
                date=health_data.date
            ).count()
            
            # If no recommendations exist, process the health data
            if existing_recs == 0:
                process_health_data_ai.delay(health_data.id)
                processed_count += 1
        
        logger.info(f"Queued {processed_count} health data records for AI processing")
        return f"Queued {processed_count} health data records for processing"
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        return f"Error in batch processing: {str(e)}"
