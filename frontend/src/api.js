// Tiny fetch wrapper. All calls use a relative "/api" path, which is proxied to the
// backend by Vite (development) or nginx (Docker), so no URLs to configure.

const TOKEN_KEY = 'hustlehub_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),

  set: (token) => localStorage.setItem(TOKEN_KEY, token),

  clear: () => localStorage.removeItem(TOKEN_KEY)
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const token = tokenStore.get();

  if (token) {
    headers.Authorization = 'Bearer ' + token;
  }

  let response;

  try {
    response = await fetch('/api' + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }

  let data = {};

  try {
    data = await response.json();
  } catch (err) {
    // non-JSON response
  }

  if (!response.ok) {
    const error = new Error(
      data.message || 'Something went wrong. Please try again.'
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: payload
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: payload
    }),

  me: () =>
    request('/auth/me'),

  // Gigs
  createGig: (payload) =>
    request('/gigs', {
      method: 'POST',
      body: payload
    }),

  getMyGigs: () =>
    request('/gigs/my'),

  getGig: (id) =>
    request('/gigs/' + id),

  updateGig: (id, payload) =>
    request('/gigs/' + id, {
      method: 'PUT',
      body: payload
    }),

  deleteGig: (id) =>
    request('/gigs/' + id, {
      method: 'DELETE'
    }),

  getClientGigs: () =>
        request('/client/gigs'),

    createBooking: (payload) =>
        request('/bookings', {
            method: 'POST',
            body: payload
        }),

    getMyBookings: () =>
        request('/bookings/mine')
};