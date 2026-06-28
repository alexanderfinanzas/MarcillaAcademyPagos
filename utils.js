const Utils = {
  // DOM Helpers
  el: (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs),
  get: (selector) => document.querySelector(selector),
  
  // Copiar y Abrir enlace (El Core de la UX)
  handleLinkClick: (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      window.open(url, '_blank');
      Utils.showToast('Enlace abierto');
    }).catch(err => {
      console.error('Error al copiar: ', err);
      window.open(url, '_blank');
      Utils.showToast('Enlace abierto (sin copiar)');
    });
  },

  copyText: (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Utils.showToast('Copiado al portapapeles');
    });
  },

  showToast: (message) => {
    const container = Utils.get('#toast-container');
    const toast = Utils.el('div', { className: 'toast', textContent: message });
    container.appendChild(toast);
    setTimeout(() => { if (container.contains(toast)) toast.remove(); }, 3000);
  },

  // Transforma el JSON original basado en Plataformas a la nueva arquitectura basada en Programas
  transformDataToNewArchitecture: (plataformasData) => {
    const programs = {};

    // Helper para mapear columnas (Full, 2, 3, 4 pagos)
    const mapPlans = (row, startIdx) => {
      return {
        'FULL PAY': row[startIdx],
        '2 PAGOS': row[startIdx + 1],
        '3 PAGOS': row[startIdx + 2],
        '4 PAGOS': row[startIdx + 3]
      };
    };

    const processPlatform = (platformName, dataObject) => {
      for (const [programKey, rows] of Object.entries(dataObject || {})) {
        // Limpiar emojis y espacios para estandarizar keys, o mantener los originales
        const cleanProgramKey = programKey.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
        
        if (!programs[cleanProgramKey]) programs[cleanProgramKey] = {};

        // Ignorar headers y tickets libres por ahora en esta lógica (se manejan diferente)
        if (cleanProgramKey.toLowerCase().includes('ticket')) {
          if(!programs['Tickets Libres']) programs['Tickets Libres'] = [];
          rows.forEach((row, i) => {
            if (i === 0 || !row[0]) return; // Skip header
            const amount = row[0];
            const link = row[2] || row[1]; // Ajustar según el CSV real
            
            let ticketObj = programs['Tickets Libres'].find(t => t.amount === amount);
            if (!ticketObj) {
              ticketObj = { amount };
              programs['Tickets Libres'].push(ticketObj);
            }
            ticketObj[platformName] = link;
          });
          continue;
        }

        // Iterar filas (omitimos el header, index 0)
        rows.forEach((row, index) => {
          if (index === 0) return; 
          const currency = row[0]; // EUR, USD, México, etc.
          if (!currency) return;

          if (!programs[cleanProgramKey][currency]) {
            programs[cleanProgramKey][currency] = { plans: {} };
          }
          
          // Suponiendo que las URL empiezan en el índice 5 en el Array de Apps Script
          const links = mapPlans(row, 5); 
          
          for (const [planName, url] of Object.entries(links)) {
            if (url) {
              if (!programs[cleanProgramKey][currency].plans[planName]) {
                programs[cleanProgramKey][currency].plans[planName] = {};
              }
              programs[cleanProgramKey][currency].plans[planName][platformName] = url;
            }
          }
        });
      }
    };

    processPlatform('whop', plataformasData.whop);
    processPlatform('stripe', plataformasData.stripe);

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
    const key = currencyString.toUpperCase().trim();
    return map[key] || { flag: '🌍', iso: key, name: currencyString, color: 'var(--text-muted)' };
  }
};