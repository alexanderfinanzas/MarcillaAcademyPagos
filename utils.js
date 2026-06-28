// Transforma el JSON original basado en Plataformas a la nueva arquitectura basada en Programas
  transformDataToNewArchitecture: (plataformasData) => {
    const programs = {};

    // Helper seguro para mapear columnas (Full, 2, 3, 4 pagos)
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
      if (!dataObject) return;

      // Convertimos a entradas legibles tanto si es un Array como si es un Objeto estándar
      const entries = Object.entries(dataObject);

      for (const [programKey, rows] of entries) {
        if (!programKey) continue;
        
        // Limpiar emojis y espacios para estandarizar las pestañas superiores
        const cleanProgramKey = programKey.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();

        // Si es la sección de tickets
        if (cleanProgramKey.toLowerCase().includes('ticket') || cleanProgramKey.toLowerCase().includes('abono')) {
          if (!programs['Tickets Libres']) programs['Tickets Libres'] = [];
          
          // Validamos de forma segura que las filas se puedan iterar
          const rowsArray = Array.isArray(rows) ? rows : Object.values(rows || {});
          
          rowsArray.forEach((row, i) => {
            if (i === 0 || !row || !row[0]) return; // Saltarse la cabecera o filas vacías
            const amount = row[0];
            // Buscamos si la columna de enlaces está en el índice 2 o 1 del backend
            const link = row[2] || row[1] || row[4] || row[5]; 
            
            if (!link) return;

            let ticketObj = programs['Tickets Libres'].find(t => t.amount === amount);
            if (!ticketObj) {
              ticketObj = { amount };
              programs['Tickets Libres'].push(ticketObj);
            }
            ticketObj[platformName] = link;
          });
          continue;
        }

        // Para programas normales (Crías, Aspirantes, Líderes)
        if (!programs[cleanProgramKey]) programs[cleanProgramKey] = {};

        // Validamos de forma segura que las filas de este programa sean iterables
        const rowsArray = Array.isArray(rows) ? rows : Object.values(rows || {});

        rowsArray.forEach((row, index) => {
          if (index === 0 || !row || !row[0]) return; // Saltarse cabeceras
          
          const currency = row[0]; // EUR, USD, México, etc.
          if (!currency) return;

          if (!programs[cleanProgramKey][currency]) {
            programs[cleanProgramKey][currency] = { plans: {} };
          }
          
          // Tu script original suele mapear los enlaces a partir de la columna D/E (índices 3, 4 o 5)
          // Probamos primero el índice 5, si está vacío probamos el índice 1 (donde caen los links financiados)
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

    // Procesamos de forma segura ambas plataformas
    if (plataformasData) {
      processPlatform('whop', plataformasData.whop || plataformasData.Whop);
      processPlatform('stripe', plataformasData.stripe || plataformasData.Stripe);
    }

    return programs;
  },
