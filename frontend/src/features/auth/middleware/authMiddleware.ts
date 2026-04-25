export const authMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === '@@INIT') {
    const token = localStorage.getItem('token');
    console.log('authMiddleware: Checking for token in localStorage:', token ? 'Found' : 'Not found');

    if (token) {
      console.log('authMiddleware: Token found, fetching user profile');
      const user = store.getState().auth.user;
      if (!user) {
        store.dispatch(authApi.getProfile());
      }
    }
  }

  return next(action);
};