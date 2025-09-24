// apiClient.js

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Generic fetch helper
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {any} data - request body (optional)
 * @param {string} token - auth token (optional)
 */
async function request(url, method, data, token) {
  const options = {
    method,
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(url, options);
  let result;
  try {
    result = await response.json();
  } catch (err) {
    throw new HttpError(response.status, "Failed to parse JSON");
  }

  if (!response.ok) {
    throw new HttpError(response.status, result.message || "Request failed");
  }
  return result;
}

// Shorthand wrappers
const api = {
  get: (url, token) => request(url, "GET", undefined, token),
  post: (url, data, token) => request(url, "POST", data, token),
  put: (url, data, token) => request(url, "PUT", data, token),
  del: (url, data, token) => request(url, "DELETE", data, token),
};

// Export for use in frontend
export { api, HttpError };
