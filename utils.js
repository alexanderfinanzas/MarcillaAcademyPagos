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

    // Helper seguro para mapear las columnas de cuotas (Full, 2, 3, 4 pagos)
    const mapPlans = (row, startIdx) => {
      if (!row || !Array.isArray(row)) return {};
      return {
        'FULL PAY': row[startIdx] || null,
        '2 PAGOS': row[startIdx + 1] || null,
        '3 PAGOS': row[startIdx + 2] || null,
        '4 PAGOS': row[startIdx + 3] || null
      };
    };

    const processPlatform = (platformName, dataObject) => {
      if (!dataObject || typeof dataObject !== 'object') return;

      // Convertimos a entradas legibles (Clave del programa -> Filas del programa)
      const entries = Object.entries(dataObject);

      for (const [programKey, rows] of entries) {
        if (!programKey) continue;
        
        // Limpiamos emojis y normalizamos para agrupar bajo las pestañas correctas
        const cleanProgramKey = programKey.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();

        // --- DEFENSA ULTRA-ROBUSTA ANTE EL FORMATO DE GOOGLE SHEETS ---
        let rowsArray = [];
        if (Array.isArray(rows)) {
          rowsArray = rows;
        } else if (rows && typeof rows === 'object') {
          // Si el Apps Script metió las filas dentro de una propiedad intermedia como .filas o .data
          if (Array.isArray(rows.filas)) rowsArray = rows.filas;
          else if (Array.isArray(rows.data)) rowsArray = rows.data;
          else rowsArray = Object.values(rows); // Si vino indexado por números "0", "1", "2"
        }

        // Si después de todas las validaciones no logramos tener una lista ejecutable, saltamos el programa
        if (!Array.isArray(rowsArray)) continue;

        // Procesamiento específico de Tickets Libres / Abonos
        if (cleanProgramKey.toLowerCase().includes('ticket') || cleanProgramKey.toLowerCase().includes('abono')) {
          if (!programs['Tickets Libres']) programs['Tickets Libres'] = [];
          
          rowsArray.forEach((row, i) => {
            if (i === 0 || !row || !Array.isArray(row) || !row[0]) return; // Saltarse cabeceras o filas inválidas
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

        // Programas regulares (Crías, Aspirantes, Líderes)
        if (!programs[cleanProgramKey]) programs[cleanProgramKey] = {};

        rowsArray.forEach((row, index) => {
          if (index === 0 || !row || !Array.isArray(row) || !row[0]) return; // Ignorar cabeceras o celdas vacías
          
          const currency = row[0]; // EUR, USD, México, etc.
          if (!currency || typeof currency !== 'string') return;

          if (!programs[cleanProgramKey][currency]) {
            programs[cleanProgramKey][currency] = { plans: {} };
          }
          
          // Mapeo adaptativo de columnas de pago (columna F/6 o D/4 según la versión)
          let links = mapPlans(row, 5);
          if (!links['FULL PAY'] && !links['2 PAGOS']) {
            links = mapPlans(row, 1);
          }
          
          for (const [planName, url] of Object.entries(links)) {
            if (url && (String(url).startsWith('http') || String(url).startsWith('https'))) {
              if (!programs[cleanProgramKey][currency].plans[planName]) {
                programs[cleanProgramKey][currency].plans[planName] = {};
              }
              programs[cleanProgramKey][currency].plans[planName][platformName] = url;
            }
          }
        });
      }
    };

    // Procesar de manera segura estructurando ambas plataformas
    if (plataformasData) {
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
