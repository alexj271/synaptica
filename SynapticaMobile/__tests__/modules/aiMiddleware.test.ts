import {aiMiddleware} from '../../src/modules/middlwares/aiMiddleware';
import {AIResponseSchema} from '../../src/ai/schemas/aiResponse.schema';

describe('aiMiddleware', () => {
  const baseState = {
    health: {},
    plan: {},
    journal: {entries: []},
  } as any;

  it('dispatches requestStarted and requestSucceeded for chat messages', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'chat/messageSent', payload: {text: 'hi'}};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'ai/requestStarted',
      payload: {intent: 'chat_general'},
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'ai/requestSucceeded',
      payload: {
        intent: 'chat_general',
        summary: 'AI response placeholder',
        domainActions: [],
      },
    });
  });

  it('does nothing for unrelated actions', async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => baseState);
    const next = jest.fn();
    const action = {type: 'other/action'};

    await aiMiddleware({dispatch, getState} as any)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches requestFailed when AI response is invalid', async () => {
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

  it('dispatches domainActions from parsed AI response', async () => {
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

    expect(dispatch).toHaveBeenCalledWith({
      type: 'plan/strategyUpdated',
      payload: {
        goal: 'Improve sleep',
        priorities: ['sleep'],
        constraints: ['low energy'],
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    });

    parseSpy.mockRestore();
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
});
