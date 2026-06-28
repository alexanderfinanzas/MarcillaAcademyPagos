const Utils = {
  // DOM Helpers
  el: (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs),
  get: (selector) => document.querySelector(selector),
  
  // Copiar y Abrir enlace de forma simultánea (Core de UX)
  handleLinkClick: (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      window.open(url, '_blank');
      Utils.showToast('Enlace abierto y copiado');
    }).catch(err => {
      console.error('Error al copiar automáticamente: ', err);
      window.open(url, '_blank');
      Utils.showToast('Enlace abierto');
    });
  },

  copyText: (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Utils.showToast('Copiado al portapapeles');
    });
  },

  showToast: (message) => {
    const container = Utils.get('#toast-container');
    if (!container) return;
    const toast = Utils.el('div', { className: 'toast', textContent: message });
    container.appendChild(toast);
    setTimeout(() => { if (container.contains(toast)) toast.remove(); }, 3000);
  },

  // Transforma el JSON original basado en Plataformas a la nueva arquitectura basada en Programas
  transformDataToNewArchitecture: (plataformasData) => {
    const programs = {};

    // Helper adaptativo para extraer los enlaces de las columnas del Sheets
    const mapPlans = (row) => {
      if (!row || !Array.isArray(row)) return {};
      // Buscamos si las URLs están al final (índices 5,6,7,8) o al inicio (1,2,3,4)
      let idx = 1;
      if (row[5] && String(row[5]).startsWith('http')) idx = 5;
      else if (row[4] && String(row[4]).startsWith('http')) idx = 4;
      else if (row[2] && String(row[2]).startsWith('http')) idx = 2;

      return {
        'FULL PAY': row[idx] || null,
        '2 PAGOS': row[idx + 1] || null,
        '3 PAGOS': row[idx + 2] || null,
        '4 PAGOS': row[idx + 3] || null
      };
    };

    const processPlatform = (platformName, dataObject) => {
      if (!dataObject || typeof dataObject !== 'object') return;

      const entries = Object.entries(dataObject);

      for (const [programKey, rows] of entries) {
        if (!programKey) continue;
        
        const cleanProgramKey = programKey.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();

        let rowsArray = [];
        if (Array.isArray(rows)) {
          rowsArray = rows;
        } else if (rows && typeof rows === 'object') {
          if (Array.isArray(rows.filas)) rowsArray = rows.filas;
          else if (Array.isArray(rows.data)) rowsArray = rows.data;
          else rowsArray = Object.values(rows);
        }

        if (!Array.isArray(rowsArray)) continue;

        // Tickets Libres
        if (cleanProgramKey.toLowerCase().includes('ticket') || cleanProgramKey.toLowerCase().includes('abono')) {
          if (!programs['Tickets Libres']) programs['Tickets Libres'] = [];
          
          rowsArray.forEach((row, i) => {
            if (i === 0 || !row || !Array.isArray(row) || !row[0]) return;
            const amount = row[0];
            const link = row[2] || row[1] || row[4] || row[5];
            
            if (!link || typeof link !== 'string' || !link.startsWith('http')) return;

            let ticketObj = programs['Tickets Libres'].find(t => t.amount === amount);
            if (!ticketObj) {
              ticketObj = { amount };
              programs['Tickets Libres'].push(ticketObj);
            }
            ticketObj[platformName] = link;
          });
          continue;
        }

        // Programas Regulares
        if (!programs[cleanProgramKey]) programs[cleanProgramKey] = {};

        rowsArray.forEach((row, index) => {
          if (index === 0 || !row || !Array.isArray(row) || !row[0]) return;
          
          const currency = String(row[0]).toUpperCase().trim();
          if (!currency || currency.includes('MONEDA')) return;

          // Estandarizar nombres clave de los países
          let finalCurrencyKey = row[0];
          if (currency.includes('EUR')) finalCurrencyKey = 'EUR';
          if (currency.includes('USD')) finalCurrencyKey = 'USD';

          if (!programs[cleanProgramKey][finalCurrencyKey]) {
            programs[cleanProgramKey][finalCurrencyKey] = { plans: {} };
          }
          
          const links = mapPlans(row);
          
          for (const [planName, url] of Object.entries(links)) {
            if (url && (String(url).startsWith('http') || String(url).startsWith('https'))) {
              if (!programs[cleanProgramKey][finalCurrencyKey].plans[planName]) {
                programs[cleanProgramKey][finalCurrencyKey].plans[planName] = {};
              }
              programs[cleanProgramKey][finalCurrencyKey].plans[planName][platformName] = url;
            }
          }
        });
      }
    };

    if (plataformasData) {
      // Intenta mapear independientemente de si viene en mayúsculas o minúsculas del Apps Script
      processPlatform('whop', plataformasData.whop || plataformasData.Whop || plataformasData.WHOP);
      processPlatform('stripe', plataformasData.stripe || plataformasData.Stripe || plataformasData.STRIPE);
    }

    return programs;
  },

  getCurrencyMeta: (currencyString) => {
    const map = {
      'EUR': { flag: '🇪🇺', iso: 'EUR', name: 'Euro', color: 'var(--color-eur)' },
      'USD': { flag: '🇺🇸', iso: 'USD', name: 'Dólares', color: 'var(--color-usd)' },
      'MÉXICO': { flag: '🇲🇽', iso: 'MXN', name: 'México', color: 'var(--color-mxn)' },
      'COLOMBIA': { flag: '🇨🇴', iso: 'COP', name: 'Colombia', color: 'var(--color-cop)' },
      'CHILE': { flag: '🇨🇱', iso: 'CLP', name: 'Chile', color: 'var(--color-clp)' },
      'PERÚ': { flag: '🇵🇪', iso: 'PEN', name: 'Perú', color: 'var(--color-pen)' }
    };
    const key = String(currencyString).toUpperCase().trim();
    return map[key] || { flag: '🌍', iso: key, name: currencyString, color: 'var(--text-muted)' };
  }
};
