export interface HealthMetric {
  id: string;
  type: 'heart_rate' | 'steps' | 'sleep' | 'calories';
  value: number;
  unit: string;
  timestamp: Date;
}

export interface HealthData {
  metrics: HealthMetric[];
  lastSync: Date;
}
