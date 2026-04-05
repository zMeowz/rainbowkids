/* Rainbowkids — Main JS */

const cart = {
  items: JSON.parse(localStorage.getItem('rk_cart') || '[]'),
  add(product) {
    const key = `${product.id}_${product.size}`;
    const ex = this.items.find(i => i.key === key);
    if (ex) ex.qty++; else this.items.push({ ...product, key, qty: 1 });
    this.save(); this.updateUI();
    showToast('✅ ' + product.name + ' — розмір ' + product.size + ' додано!');
    openCart();
  },
  remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); this.updateUI(); },
  changeQty(key, delta) {
    const item = this.items.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(key); else { this.save(); this.updateUI(); }
  },
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  save() { localStorage.setItem('rk_cart', JSON.stringify(this.items)); },
  updateUI() {
    document.querySelectorAll('.cart-count').forEach(el => {
      const c = this.count(); el.textContent = c; el.style.display = c > 0 ? 'flex' : 'none';
    });
    const body = document.getElementById('cartBody');
    if (!body) return;
    if (this.items.length === 0) {
      body.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p style="font-weight:700;margin-bottom:8px">Кошик порожній</p><p style="font-size:.85rem">Додайте товари з каталогу</p></div>';
    } else {
      body.innerHTML = this.items.map(item =>
        '<div class="cart-item">' +
        '<div class="cart-item-img">' + (item.emoji || '👟') + '</div>' +
        '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-meta">Розмір: ' + item.size + ' · ' + (item.brand || 'Rainbowkids') + '</div>' +
        '<div class="cart-item-controls">' +
        '<button class="qty-btn" onclick="cart.changeQty(\'' + item.key + '\',-1)">−</button>' +
        '<span class="qty-value">' + item.qty + '</span>' +
        '<button class="qty-btn" onclick="cart.changeQty(\'' + item.key + '\',1)">+</button>' +
        '<button class="cart-remove" onclick="cart.remove(\'' + item.key + '\')">✕ видалити</button>' +
        '</div></div>' +
        '<div class="cart-item-price">' + (item.price * item.qty).toLocaleString('uk-UA') + ' ₴</div>' +
        '</div>'
      ).join('');
    }
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = this.total().toLocaleString('uk-UA') + ' ₴';
  }
};

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
function openMobileMenu() {
  document.getElementById('mobileMenu')?.classList.add('open');
  document.getElementById('mobileOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('mobileOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
function showToast(msg) {
  const t = document.getElementById('cartToast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
function openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; }
function openMobileFilters() { document.getElementById('mobileFilters')?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMobileFilters() { document.getElementById('mobileFilters')?.classList.remove('open'); document.body.style.overflow = ''; }

function addToCartFromPage() {
  const selectedSize = document.querySelector('.size-btn.selected');
  if (!selectedSize) {
    document.querySelectorAll('.size-btn:not(.out-stock)').forEach(b => { b.style.borderColor = 'var(--coral)'; setTimeout(() => b.style.borderColor = '', 1500); });
    showToast('⚠️ Оберіть розмір!'); return;
  }
  cart.add({
    id: document.querySelector('[data-product-id]')?.dataset.productId || 'prod1',
    name: document.querySelector('.product-page-title')?.textContent || 'Товар',
    brand: document.querySelector('.product-page-brand')?.textContent || '',
    price: parseInt(document.querySelector('.page-price-current')?.textContent?.replace(/\D/g, '') || '0'),
    size: selectedSize.textContent,
    emoji: document.querySelector('.gallery-main-bg')?.textContent?.trim() || '👟'
  });
}

function quickAddToCart(card) {
  const sel = card.querySelector('.size-chip.selected');
  if (!sel) { showToast('⚠️ Оберіть розмір!'); return; }
  cart.add({
    id: card.dataset.id || Math.random().toString(36).slice(2),
    name: card.querySelector('.product-name')?.textContent || 'Товар',
    brand: card.querySelector('.product-brand')?.textContent || '',
    price: parseInt(card.querySelector('.price-current')?.textContent?.replace(/\D/g, '') || '0'),
    size: sel.textContent,
    emoji: card.querySelector('.product-img-bg')?.textContent?.trim() || '👟'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cart.updateUI();

  // Header scroll
  const header = document.querySelector('.header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

  // Reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // FAQ
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tab;
      const c = btn.closest('.product-tabs');
      if (!c) return;
      c.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      c.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      c.querySelector('[data-content="' + t + '"]')?.classList.add('active');
    });
  });

  // Size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('out-stock')) return;
      btn.closest('.size-grid')?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Size chips
  document.querySelectorAll('.size-chip:not(.out)').forEach(chip => {
    chip.addEventListener('click', e => {
      e.stopPropagation();
      chip.closest('.size-chips')?.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  // Wishlist
  document.querySelectorAll('.product-wishlist, .wishlist-btn-lg').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active') ? '❤️' : '🤍';
    });
  });

  // Gallery thumbs
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainDisplay = document.getElementById('galleryMain');
  if (thumbs.length && mainDisplay) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainDisplay.textContent = thumb.dataset.emoji || thumb.textContent;
      });
    });
  }

  // Filters
  document.querySelectorAll('.filter-option').forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('active');
      const cb = opt.querySelector('.filter-checkbox');
      if (cb) cb.textContent = opt.classList.contains('active') ? '✓' : '';
    });
  });
  document.querySelectorAll('.size-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // Overlays
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('mobileOverlay')?.addEventListener('click', closeMobileMenu);
  document.querySelector('.mobile-filters-overlay')?.addEventListener('click', closeMobileFilters);

  // Search
  const si = document.querySelector('.header-search input');
  if (si) si.addEventListener('keypress', e => {
    if (e.key === 'Enter' && si.value.trim()) window.location.href = 'search.html?q=' + encodeURIComponent(si.value.trim());
  });
});
