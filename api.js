const Api = {
  // Reemplazar por la URL real de tu Google Apps Script
  API_URL: 'https://script.google.com/macros/s/AKfycbz1V6S3R_zS5DFm6LkDRHN66U23ABw43dM0jc44_Fq6Z7-4TsTd3TZoOLzSOUveL-7p/exec',

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
