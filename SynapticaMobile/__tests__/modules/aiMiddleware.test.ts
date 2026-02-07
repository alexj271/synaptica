import {aiMiddleware} from '../../src/modules/middlwares/aiMiddleware';
import {AIResponseSchema} from '../../src/ai/schemas/aiResponse.schema';
import * as intentModule from '../../src/ai/intent/detectIntent';
import * as routerModule from '../../src/ai/router/modelRouter';
import * as contextModule from '../../src/ai/context/buildContext';
import * as policyModule from '../../src/ai/policy/policyEngine';
import {MODELS} from '../../src/ai/router/modelProfiles';

describe('aiMiddleware', () => {
  const baseState = {
    health: {
      metrics: {
        sleep: {
          value: 7,
          date: '2025-01-01',
          trend: 'stable',
        },
      },
      subjective: {},
    },
    plan: {
      strategy: {
        goal: 'Improve sleep',
        priorities: [],
        constraints: [],
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
      actions: [],
    },
    journal: {
      entries: [],
    },
  } as any;

  it('passes action through next() first (Redux Event)', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('does nothing for non-trigger actions', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'other/action'};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not react to internal AI actions', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'ai/requestStarted', payload: {intent: 'chat_general'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('executes pipeline: Intent → Router → Context → LLM → Zod → Policy → Reducers', async () => {
    const callOrder: string[] = [];

    const intentSpy = jest.spyOn(intentModule, 'detectIntent').mockImplementation(async () => {
      callOrder.push('intent');
      return 'chat_general';
    });

    const routerSpy = jest.spyOn(routerModule, 'routeModel').mockImplementation(async () => {
      callOrder.push('router');
      return {model: MODELS.FAST, complexity: 'trivial'};
    });

    const contextSpy = jest.spyOn(contextModule, 'buildContext').mockImplementation(() => {
      callOrder.push('context');
      return {} as any;
    });

    const parseSpy = jest.spyOn(AIResponseSchema, 'parse').mockImplementation((data) => {
      callOrder.push('zod');
      return data as any;
    });

    const policySpy = jest.spyOn(policyModule, 'evaluateActions').mockImplementation(() => {
      callOrder.push('policy');
      return {approved: [], requiresConfirmation: [], rejected: []};
    });

    const dispatch = jest.fn((a) => {
      if (a.type === 'ai/requestSucceeded') callOrder.push('reducers');
    });
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(callOrder).toEqual([
      'intent',
      'router',
      'context',
      'zod',
      'policy',
      'reducers',
    ]);

    intentSpy.mockRestore();
    routerSpy.mockRestore();
    contextSpy.mockRestore();
    parseSpy.mockRestore();
    policySpy.mockRestore();
  });

  it('dispatches requestStarted right after intent detection', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    // requestStarted should be the first dispatch call
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: 'ai/requestStarted',
      payload: {intent: 'chat_general'},
    });
  });

  it('dispatches requestSucceeded with parsed response', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    const allCalls = dispatch.mock.calls.map(c => c[0]);
    const succeeded = allCalls.find((c: any) => c.type === 'ai/requestSucceeded');
    expect(succeeded).toBeDefined();
    expect(succeeded.payload).toHaveProperty('summary');
    expect(succeeded.payload).toHaveProperty('domainActions');
  });

  it('dispatches requestFailed when Zod validation fails', async () => {
    const parseSpy = jest
      .spyOn(AIResponseSchema, 'parse')
      .mockImplementationOnce(() => {
        throw new Error('Invalid AI response');
      });

    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'journal/entryAdded', payload: {rawText: 'test'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ai/requestStarted',
      payload: {intent: 'journal_parse'},
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'ai/requestFailed',
      payload: {error: 'Error: Invalid AI response'},
    });

    parseSpy.mockRestore();
  });

  it('routes high-risk actions through Policy Engine to requiresConfirmation', async () => {
    const parseSpy = jest
      .spyOn(AIResponseSchema, 'parse')
      .mockReturnValueOnce({
        intent: 'chat_general',
        summary: 'ok',
        domainActions: [
          {
            type: 'plan/strategyUpdated',
            payload: {
              goal: 'Improve sleep',
              priorities: ['sleep'],
              constraints: ['low energy'],
              updatedAt: '2025-01-01T10:00:00.000Z',
            },
          },
        ],
      } as any);

    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'plan'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    const allCalls = dispatch.mock.calls.map(call => call[0]);
    const confirmation = allCalls.find((call: any) =>
      call.type === 'ai/actionsRequireConfirmation' &&
      call.payload?.[0]?.type === 'plan/strategyUpdated'
    );
    expect(confirmation).toBeDefined();

    parseSpy.mockRestore();
  });

  it('auto-approves low-risk actions through Policy Engine → Reducers', async () => {
    const parseSpy = jest
      .spyOn(AIResponseSchema, 'parse')
      .mockReturnValueOnce({
        intent: 'journal_parse',
        summary: 'parsed entry',
        domainActions: [
          {
            type: 'journal/entryParsed',
            payload: {
              id: 'entry-1',
              parsed: {
                energy: 5,
                stress: 3,
              },
            },
          },
        ],
      } as any);

    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'journal/entryAdded', payload: {rawText: 'tired'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    // Low-risk journal/entryParsed should be auto-approved → dispatched directly
    const allCalls = dispatch.mock.calls.map(call => call[0]);
    const directDispatch = allCalls.find((call: any) =>
      call.type === 'journal/entryParsed'
    );
    expect(directDispatch).toBeDefined();
    expect(directDispatch.payload.parsed.energy).toBe(5);

    parseSpy.mockRestore();
  });

  it('calls routeModel with intent only (no context)', async () => {
    const routerSpy = jest.spyOn(routerModule, 'routeModel');

    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(routerSpy).toHaveBeenCalledWith({intent: 'chat_general'});

    routerSpy.mockRestore();
  });
});
