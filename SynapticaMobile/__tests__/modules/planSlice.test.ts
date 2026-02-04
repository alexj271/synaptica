import reducer, {
  strategyUpdated,
  actionsReplaced,
  actionStatusChanged,
  PlanState,
} from '../../src/modules/features/plan/planSlice';

jest.mock('uuid', () => ({
  v4: () => 'generated-id',
}));

describe('planSlice', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('updates strategy and sets updatedAt', () => {
    const state = reducer(undefined, strategyUpdated({
      goal: 'Improve sleep',
      priorities: ['sleep', 'stress'],
      constraints: ['low energy'],
    }));

    expect(state.strategy).toEqual({
      goal: 'Improve sleep',
      priorities: ['sleep', 'stress'],
      constraints: ['low energy'],
      updatedAt: '2025-01-01T12:00:00.000Z',
    });
  });

  it('replaces actions and fills missing ids', () => {
    const state = reducer(undefined, actionsReplaced([
      {
        title: 'Morning walk',
        type: 'habit',
        status: 'pending',
        impact: ['energy'],
      } as any,
    ]));

    expect(state.actions).toEqual([
      {
        id: 'generated-id',
        title: 'Morning walk',
        type: 'habit',
        status: 'pending',
        impact: ['energy'],
      },
    ]);
  });

  it('changes action status', () => {
    const initial: PlanState = {
      strategy: {
        goal: 'Goal',
        priorities: [],
        constraints: [],
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      actions: [
        {
          id: 'a-1',
          title: 'Test',
          type: 'measurement',
          status: 'pending',
          impact: ['insights'],
        },
      ],
    };

    const state = reducer(initial, actionStatusChanged({
      id: 'a-1',
      status: 'done',
    }));

    expect(state.actions[0].status).toBe('done');
  });
});
