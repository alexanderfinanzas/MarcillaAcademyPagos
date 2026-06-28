const Builders = {
  buildCurrencyCard: (currencyName, plansData) => {
    const meta = Utils.getCurrencyMeta(currencyName);
    const card = Utils.el('div', { className: 'currency-card' });
    
    // Header
    const header = Utils.el('div', { className: 'card-header' });
    header.innerHTML = `
      <span class="flag">${meta.flag}</span>
      <span class="country">${meta.name}</span>
      <span class="iso" style="background-color: ${meta.color}">${meta.iso}</span>
    `;
    card.appendChild(header);

    // Planes
    for (const [planName, platforms] of Object.entries(plansData)) {
      if (Object.keys(platforms).length === 0) continue;
      
      const row = Utils.el('div', { className: 'plan-row' });
      row.innerHTML = `<span class="plan-label">${planName}</span>`;
      
      const actions = Utils.el('div', { className: 'actions-grid' });
      
      if (platforms.whop) {
        const btnW = Utils.el('button', { className: 'btn-link whop' });
        btnW.innerHTML = `🟣 Whop`;
        btnW.onclick = () => Utils.handleLinkClick(platforms.whop);
        actions.appendChild(btnW);
      }
      
      if (platforms.stripe) {
        const btnS = Utils.el('button', { className: 'btn-link stripe' });
        btnS.innerHTML = `🔵 Stripe`;
        btnS.onclick = () => Utils.handleLinkClick(platforms.stripe);
        actions.appendChild(btnS);
      }
      
      row.appendChild(actions);
      card.appendChild(row);
    }
    
    return card;
  },

  buildTicketList: (tickets) => {
    const container = Utils.el('div', { className: 'ticket-list' });
    
    tickets.forEach(t => {
      const item = Utils.el('div', { className: 'ticket-item' });
      const price = Utils.el('div', { className: 'ticket-price', textContent: `€${t.amount}` });
      const actions = Utils.el('div', { className: 'ticket-actions' });
      
      if (t.whop) {
        const btnW = Utils.el('button', { className: 'btn-link whop', innerHTML: `🟣 Whop` });
        btnW.onclick = () => Utils.handleLinkClick(t.whop);
        actions.appendChild(btnW);
      }
      if (t.stripe) {
        const btnS = Utils.el('button', { className: 'btn-link stripe', innerHTML: `🔵 Stripe` });
        btnS.onclick = () => Utils.handleLinkClick(t.stripe);
        actions.appendChild(btnS);
      }
      
      item.appendChild(price);
      item.appendChild(actions);
      container.appendChild(item);
    });
    
    return container;
  },

  buildTransferCard: (title, fieldsArray) => {
    const card = Utils.el('div', { className: 'currency-card transfer-card' });
    const h3 = Utils.el('h3', { textContent: title });
    card.appendChild(h3);

    fieldsArray.forEach(field => {
      const row = Utils.el('div', { className: 'data-row' });
      row.innerHTML = `
        <span class="data-label">${field[0]}</span>
        <span class="data-value">${field[1]}</span>
      `;
      
      if (field[1]) { // Si hay valor que copiar
        const btn = Utils.el('button', { className: 'btn-copy', textContent: 'Copiar' });
        btn.onclick = () => Utils.copyText(field[1]);
        row.appendChild(btn);
      }
      card.appendChild(row);
    });
    return card;
  }
};