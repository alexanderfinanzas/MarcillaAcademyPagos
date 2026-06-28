const Api = {
  // Reemplazar por la URL real de tu Google Apps Script
  API_URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',

  fetchData: async () => {
    try {
      const response = await fetch(Api.API_URL);
      if (!response.ok) throw new Error('Error en la red');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }
};