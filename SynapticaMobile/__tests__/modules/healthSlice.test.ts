import reducer, {
  metricUpdated,
  subjectiveUpdated,
  metricsBatchUpdated,
  HealthState,
} from '../../src/modules/features/health/healthSlice';

describe('healthSlice', () => {
  it('updates a single metric by type', () => {
    const state = reducer(undefined, metricUpdated({
      type: 'sleep',
      value: {
        duration: 420,
        quality: 78,
        trend: 'up',
        lastUpdated: '2025-01-01T10:00:00.000Z',
      },
    }));

    expect(state.metrics.sleep).toEqual({
      duration: 420,
      quality: 78,
      trend: 'up',
      lastUpdated: '2025-01-01T10:00:00.000Z',
    });
  });

  it('merges subjective updates', () => {
    const initial: HealthState = {
      metrics: {},
      subjective: {energy: 4},
    };

    const state = reducer(initial, subjectiveUpdated({stress: 7, mood: 'ok'}));

    expect(state.subjective).toEqual({
      energy: 4,
      stress: 7,
      mood: 'ok',
    });
  });

  it('merges batch metrics', () => {
    const initial: HealthState = {
      metrics: {
        pressure: {
          systolic: 120,
          diastolic: 80,
          measuredAt: '2025-01-01T10:00:00.000Z',
        },
      },
      subjective: {},
    };

    const state = reducer(initial, metricsBatchUpdated({
      weight: {value: 70, measuredAt: '2025-01-02T10:00:00.000Z'},
    }));

    expect(state.metrics.pressure).toEqual({
      systolic: 120,
      diastolic: 80,
      measuredAt: '2025-01-01T10:00:00.000Z',
    });
    expect(state.metrics.weight).toEqual({
      value: 70,
      measuredAt: '2025-01-02T10:00:00.000Z',
    });
  });
});
