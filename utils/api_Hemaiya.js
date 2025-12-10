import axios from "axios";
import CONFIG from "../config";

// ✅ Set default headers globally
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

const pendingRequests = new Map();

export const deduplicatedFetch = {
  get: async (endpoint) => {
    const url = `${CONFIG.API_Hemaiya}/${endpoint}`;

    if (pendingRequests.has(url)) {
      return pendingRequests.get(url);
    }

    const requestPromise = axios
      .get(url, {
        timeout: 30000, // 30 second timeout
      })
      .then((response) => {
        pendingRequests.delete(url);
        return response.data;
      })
      .catch((error) => {
        pendingRequests.delete(url);
        // Enhanced error logging
        if (error.response) {
          // Server responded with error status
          console.error(`API Error [${error.response.status}]:`, {
            url,
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        } else if (error.request) {
          // Request made but no response
          console.error("API Request Error (no response):", {
            url,
            message: error.message,
          });
        } else {
          // Error setting up request
          console.error("API Setup Error:", {
            url,
            message: error.message,
          });
        }
        throw error;
      });

    pendingRequests.set(url, requestPromise);
    return requestPromise;
  },

  delete: async (endpoint) => {
    const url = `${CONFIG.API_Hemaiya}/${endpoint}`;
    return axios.delete(url);
  },
};

const responseCache = new Map();

const getCacheTTL = (endpoint) => {
  // Default to 5 minutes (can be dynamic per endpoint)
  return 5 * 60 * 1000;
};

export const cachedFetch = {
  get: async (endpoint, forceRefresh = false) => {
    const url = `${CONFIG.API_Hemaiya}/${endpoint}`;
    const now = Date.now();
    const ttl = getCacheTTL(endpoint);

    const cached = responseCache.get(url);
    if (!forceRefresh && cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await deduplicatedFetch.get(endpoint);
    responseCache.set(url, {
      data,
      timestamp: now,
    });

    return data;
  },

  clearCache: (endpoint) => {
    const url = `${CONFIG.API_Hemaiya}/${endpoint}`;
    responseCache.delete(url);
  },

  clearAllCache: () => {
    responseCache.clear();
  },
};
