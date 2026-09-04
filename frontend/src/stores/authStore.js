import { create } from 'zustand';

// Read localStorage synchronously at store creation, not in a useEffect
// ("hydrate" pattern) — otherwise every fresh page load/reload renders once
// with token=null before the effect runs, and ProtectedRoute redirects to
// /login before the real token is ever read, even though the user is
// already logged in.
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
