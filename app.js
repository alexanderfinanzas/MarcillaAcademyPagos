const App = {
  data: null,
  processedPrograms: null,
  activeTab: null,

  init: async () => {
    App.setState('loading');
    try {
      // Intentamos cargar la API
      const rawData = await Api.fetchData();
      App.data = rawData;
      
      // Transformar datos a la nueva arquitectura
      App.processedPrograms = Utils.transformDataToNewArchitecture(rawData.plataformas);
      
      App.renderHeader(rawData.tasa);
      App.renderTabs();
      App.setState('content');
      
    } catch (err) {
      App.setState('error', err.message);
    }
  },

  setState: (state, message = '') => {
    Utils.get('#loading-state').classList.remove('active');
    Utils.get('#error-state').classList.remove('active');
    Utils.get('#view-container').style.display = 'none';

    if (state === 'loading') {
      Utils.get('#loading-state').classList.add('active');
    } else if (state === 'error') {
      Utils.get('#error-state').classList.add('active');
      Utils.get('#error-message').textContent = message || 'Error de conexión con Sheets.';
    } else if (state === 'content') {
      Utils.get('#view-container').style.display = 'block';
    }
  },

  renderHeader: (tasaData) => {
    if (!tasaData) return;
    const container = Utils.get('#tasa-container');
    container.innerHTML = `
      <strong>1 EUR = ${tasaData.valor || '1.15'} USD</strong><br>
      Actualizado: ${tasaData.fecha || 'N/A'}
    `;
  },

  renderTabs: () => {
    const nav = Utils.get('#main-nav');
    nav.innerHTML = '';
    
    // Generar tabs basados en los programas extraídos
    const programs = Object.keys(App.processedPrograms);
    
    // Forzamos un orden lógico: Crías, Aspirantes, Líderes, Tickets Libres, y al final Transferencias
    const customOrder = ['Crias', 'Aspirantes', 'Lideres', 'Tickets Libres'];
    programs.sort((a, b) => {
      const idxA = customOrder.findIndex(i => a.toLowerCase().includes(i.toLowerCase()));
      const idxB = customOrder.findIndex(i => b.toLowerCase().includes(i.toLowerCase()));
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    programs.forEach((prog, index) => {
      const btn = Utils.el('button', { className: 'tab-btn', textContent: prog });
      btn.onclick = () => App.switchTab(prog, btn);
      nav.appendChild(btn);
      
      // Auto-seleccionar el primer tab
      if (index === 0) App.switchTab(prog, btn);
    });

    // Agregar tab estático de Transferencias
    const transferBtn = Utils.el('button', { className: 'tab-btn', textContent: 'Transferencias' });
    transferBtn.onclick = () => App.renderTransferencias(transferBtn);
    nav.appendChild(transferBtn);
  },

  switchTab: (programName, btnElement) => {
    App.updateActiveTabStyle(btnElement);
    const container = Utils.get('#view-container');
    container.innerHTML = '';

    if (programName === 'Tickets Libres') {
      const tickets = App.processedPrograms[programName];
      container.appendChild(Builders.buildTicketList(tickets));
      return;
    }

    // Grid de monedas
    const grid = Utils.el('div', { className: 'grid-container' });
    const programData = App.processedPrograms[programName];

    // Ordenar monedas: EUR, USD, MXN, COP, CLP, PEN
    const currencyOrder = ['EUR', 'USD', 'MÉXICO', 'COLOMBIA', 'CHILE', 'PERÚ'];
    const currencies = Object.keys(programData).sort((a, b) => {
      return currencyOrder.indexOf(a.toUpperCase()) - currencyOrder.indexOf(b.toUpperCase());
    });

    currencies.forEach(currency => {
      const card = Builders.buildCurrencyCard(currency, programData[currency].plans);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  },

  renderTransferencias: (btnElement) => {
    App.updateActiveTabStyle(btnElement);
    const container = Utils.get('#view-container');
    container.innerHTML = '';

    const grid = Utils.el('div', { className: 'grid-container' });
    
    // Obtener transferencias de App.data
    const transf = App.data.transferencias;
    if (transf && transf.eur) {
      grid.appendChild(Builders.buildTransferCard('Euros (SEPA)', transf.eur.campos));
    }
    if (transf && transf.usd) {
      grid.appendChild(Builders.buildTransferCard('Dólares (CHASE)', transf.usd.campos));
    }

    container.appendChild(grid);
  },

  updateActiveTabStyle: (btnElement) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
  }
};

// Iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', App.init);