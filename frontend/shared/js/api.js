// Shared Api Client
// Future Integrations
window.aniMoApi = async function (url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Cannot reach the AniMo server. Start it with node backend/server.js and open http://127.0.0.1:8000.');
  }

  let text;
  try {
    text = await response.text();
  } catch {
    throw new Error('The AniMo server closed the response unexpectedly. Please try again.');
  }

  let result = {};
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error('AniMo received a non-JSON response. Start it with node backend/server.js and open http://127.0.0.1:8000 (do not open the HTML file directly).');
    }
  } else if (response.status !== 204) {
    throw new Error('AniMo received an empty response. Restart the server with node backend/server.js and try again.');
  }

  if (!response.ok) {
    const error = new Error(result.error || `The request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
};
