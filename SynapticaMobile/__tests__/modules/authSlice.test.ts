import reducer, {setToken, logout} from '../../src/modules/features/auth/authSlice';

describe('authSlice', () => {
  it('sets token', () => {
    const state = reducer(undefined, setToken('abc'));
    expect(state.token).toBe('abc');
  });

  it('clears token on logout', () => {
    const state = reducer({token: 'abc'}, logout());
    expect(state.token).toBeNull();
  });
});
