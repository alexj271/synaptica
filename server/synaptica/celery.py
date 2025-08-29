import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'synaptica.settings')

app = Celery('synaptica')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Optional: Configure periodic tasks
app.conf.beat_schedule = {
    'cleanup-expired-recommendations': {
        'task': 'health.tasks.cleanup_expired_recommendations',
        'schedule': 86400.0,  # Run daily (86400 seconds)
    },
    'batch-process-health-data': {
        'task': 'health.tasks.batch_process_health_data',
        'schedule': 3600.0,  # Run hourly
    },
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
