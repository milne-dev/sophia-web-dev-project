(function () {
  const STORAGE_KEY = 'northstar-cart';

  const TOGGLE_HTML = `
    <button id="cart-toggle" type="button" class="cart-icon-btn" aria-haspopup="dialog" aria-controls="cart-panel" aria-label="Order list" title="Order list">
      🛒<span id="cart-count" class="cart-count">0</span>
    </button>
  `;

  const PANEL_HTML = `
    <div id="cart-panel" class="cart-panel" hidden>
      <div class="cart-panel-inner" role="dialog" aria-modal="true" aria-labelledby="cart-panel-title">
        <div class="cart-panel-header">
          <h2 id="cart-panel-title">Your Order List</h2>
          <button id="cart-close" type="button" class="cart-close" aria-label="Close order list">&times;</button>
        </div>
        <ul id="cart-items" class="cart-items"></ul>
        <p id="cart-total" class="cart-total" hidden></p>
        <p id="cart-empty" class="cart-empty">Your list is empty. Add items from the Products page to get started.</p>
        <button id="cart-clear" type="button" class="cart-clear-btn">Clear list</button>
        <p class="cart-note">For reference only. Bring it up in store or mention it on Contact.</p>
      </div>
    </div>
  `;

  function injectCartUI() {
    const nav = document.querySelector('header nav');
    if (nav && !document.getElementById('cart-toggle')) {
      nav.insertAdjacentHTML('beforeend', TOGGLE_HTML);
      document.getElementById('cart-toggle').addEventListener('click', openPanel);
    }

    if (!document.getElementById('cart-panel')) {
      document.body.insertAdjacentHTML('beforeend', PANEL_HTML);
      const panel = document.getElementById('cart-panel');
      panel.addEventListener('click', (e) => {
        if (e.target === panel) closePanel();
      });
      document.getElementById('cart-close').addEventListener('click', closePanel);
      document.getElementById('cart-clear').addEventListener('click', () => {
        cart = {};
        refresh();
      });
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  function totalCount() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  }

  function updateBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = totalCount();
  }

  function updateStepperDisplays() {
    document.querySelectorAll('[data-qty-for]').forEach((el) => {
      const id = el.dataset.qtyFor;
      const qty = cart[id] ? cart[id].qty : 0;
      el.textContent = qty;

      const control = el.closest('.order-control');
      if (control) control.classList.toggle('has-qty', qty > 0);
    });
  }

  const cartItemHTML = (id, item) => `
    <span class="cart-item-name">${item.name}</span>
    <span class="cart-item-price">${item.price}</span>
    <span class="cart-item-controls">
      <button type="button" class="qty-btn" data-action="decrement" data-id="${id}" data-name="${item.name}" data-price="${item.price}" data-price-min="${item.priceMin}" data-price-max="${item.priceMax}" aria-label="Remove one ${item.name}">&minus;</button>
      <span class="cart-item-qty">${item.qty}</span>
      <button type="button" class="qty-btn" data-action="increment" data-id="${id}" data-name="${item.name}" data-price="${item.price}" data-price-min="${item.priceMin}" data-price-max="${item.priceMax}" aria-label="Add one ${item.name}">+</button>
    </span>
  `;

  function renderCartPanel() {
    const list = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty');
    const clearBtn = document.getElementById('cart-clear');
    const totalEl = document.getElementById('cart-total');
    if (!list) return;

    list.innerHTML = '';
    const entries = Object.entries(cart).filter(([, item]) => item.qty > 0);

    if (emptyMsg) emptyMsg.hidden = entries.length > 0;
    if (clearBtn) clearBtn.hidden = entries.length === 0;

    entries.forEach(([id, item]) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = cartItemHTML(id, item);
      list.appendChild(li);
    });

    if (totalEl) {
      totalEl.hidden = entries.length === 0;
      if (entries.length > 0) {
        const totals = entries.reduce((sum, [, item]) => {
          sum.min += item.priceMin * item.qty;
          sum.max += item.priceMax * item.qty;
          return sum;
        }, { min: 0, max: 0 });

        totalEl.textContent = totals.min === totals.max
          ? `Estimated total: $${totals.min}`
          : `Estimated total: $${totals.min} – $${totals.max}`;
      }
    }
  }

  function refresh() {
    saveCart();
    updateBadge();
    updateStepperDisplays();
    renderCartPanel();
  }

  function setQty(id, name, price, priceMin, priceMax, qty) {
    qty = Math.max(0, qty);
    if (qty === 0) {
      delete cart[id];
    } else {
      cart[id] = { name, price, priceMin, priceMax, qty };
    }
    refresh();
  }

  function openPanel() {
    const panel = document.getElementById('cart-panel');
    if (panel) panel.hidden = false;
    const closeBtn = document.getElementById('cart-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel() {
    const panel = document.getElementById('cart-panel');
    if (panel) panel.hidden = true;
    if (document.activeElement) document.activeElement.blur();
  }

  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-action]');
    if (!qtyBtn) return;

    const stepper = qtyBtn.closest('[data-id]');
    const source = qtyBtn.dataset.id ? qtyBtn.dataset : (stepper && stepper.dataset);
    if (!source) return;

    const { id, name, price, priceMin, priceMax } = source;
    const delta = qtyBtn.dataset.action === 'increment' ? 1 : -1;
    const current = cart[id] ? cart[id].qty : 0;
    setQty(id, name, price, Number(priceMin), Number(priceMax), current + delta);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  document.addEventListener('DOMContentLoaded', () => {
    injectCartUI();
    refresh();
  });
})();
