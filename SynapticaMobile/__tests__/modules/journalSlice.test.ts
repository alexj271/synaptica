import reducer, {
  entryAdded,
  entryParsed,
  entryUpdated,
  JournalState,
} from '../../src/modules/features/journal/journalSlice';

jest.mock('uuid', () => ({
  v4: () => 'test-id',
}));

describe('journalSlice', () => {
  it('adds entry with generated id', () => {
    const state = reducer(undefined, entryAdded({
      date: '2025-01-01T10:00:00.000Z',
      rawText: 'Feeling tired',
      source: 'manual',
    }));

    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]).toEqual({
      id: 'test-id',
      date: '2025-01-01T10:00:00.000Z',
      rawText: 'Feeling tired',
      source: 'manual',
    });
  });

  it('attaches parsed data to existing entry', () => {
    const initial: JournalState = {
      entries: [
        {
          id: 'e-1',
          date: '2025-01-01T10:00:00.000Z',
          rawText: 'Bad sleep',
          source: 'manual',
        },
      ],
    };

    const state = reducer(initial, entryParsed({
      id: 'e-1',
      parsed: {sleepComplaint: true, energy: 3},
    }));

    expect(state.entries[0].parsed).toEqual({
      sleepComplaint: true,
      energy: 3,
    });
  });

  it('updates entry fields except rawText', () => {
    const initial: JournalState = {
      entries: [
        {
          id: 'e-2',
          date: '2025-01-01T10:00:00.000Z',
          rawText: 'Original',
          source: 'manual',
        },
      ],
    };

    const state = reducer(initial, entryUpdated({
      id: 'e-2',
      rawText: 'Changed',
      source: 'voice',
    }));

    expect(state.entries[0].rawText).toBe('Original');
    expect(state.entries[0].source).toBe('voice');
  });
});
