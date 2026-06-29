const api = {
  // A simple lightweight wrapper over fetch/axios that automatically attaches authorization
  async request(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`/api${url}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error on ${url}:`, error);
      throw error;
    }
  },

  get(url, headers = {}) {
    return this.request(url, { method: 'GET', headers });
  },

  post(url, body, headers = {}) {
    return this.request(url, { method: 'POST', body, headers });
  },

  put(url, body, headers = {}) {
    return this.request(url, { method: 'PUT', body, headers });
  },

  delete(url, headers = {}) {
    return this.request(url, { method: 'DELETE', headers });
  }
};

export default api;
