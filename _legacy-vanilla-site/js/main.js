// ==========================================================================
// AURUM & CO. — shared front-end behaviour
// Auth here is a client-side demo only (localStorage), not a real backend.
// ==========================================================================

const USERS_KEY = 'aurum_users';
const SESSION_KEY = 'aurum_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// ---------------------------------------------------------------------
// Auth gate: the whole site is hidden behind this until the visitor
// signs in or creates an account. See the inline script in <head> that
// stamps .is-authed on <html> before first paint to avoid a flash.
// ---------------------------------------------------------------------

function unlockSite() {
  const gate = document.getElementById('authGate');
  document.documentElement.classList.add('is-authed');
  if (gate) {
    gate.classList.add('fade-out');
    setTimeout(() => gate.classList.remove('fade-out'), 500);
  }
  window.scrollTo(0, 0);
  initHeader();
}

function lockSite() {
  document.documentElement.classList.remove('is-authed');
  switchAuthTab('login');
  window.scrollTo(0, 0);
}

function switchAuthTab(name) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  if (loginPanel) loginPanel.hidden = name !== 'login';
  if (signupPanel) signupPanel.hidden = name !== 'signup';
}

function initAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.addEventListener('click', () => switchAuthTab(t.dataset.tab));
  });
  document.querySelectorAll('[data-switch]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab(a.dataset.switch);
    });
  });
}

// ---------------------------------------------------------------------
// Header: scroll state, mobile nav, auth-aware nav actions
// ---------------------------------------------------------------------

function initHeader() {
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.cssText = open
        ? ''
        : 'display:flex;position:absolute;top:100%;left:0;right:0;flex-direction:column;background:#131316;padding:24px 32px;gap:20px;border-bottom:1px solid rgba(255,255,255,0.09);';
    });
  }

  const authArea = document.getElementById('authArea');
  if (authArea) {
    const session = getSession();
    authArea.innerHTML = session ? `
        <div class="user-chip">
          <span class="icon-btn" style="width:34px;height:34px;font-size:11px;color:#e7cd8d;border-color:rgba(201,162,77,0.4);">${initials(session.name)}</span>
          <strong>${session.name.split(' ')[0]}</strong>
          <button class="icon-btn" id="logoutBtn" aria-label="Log out" style="width:34px;height:34px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>` : '';
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      clearSession();
      lockSite();
    });
  }

  document.getElementById('footerLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearSession();
    lockSite();
  });
}

// ---------------------------------------------------------------------
// Carousel: drag + swipe + arrow buttons + dot indicators
// ---------------------------------------------------------------------

function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const cards = Array.from(track.children);
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to watch ${i + 1}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function cardStep() {
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '26');
    return cards[0].getBoundingClientRect().width + gap;
  }

  function scrollToCard(i) {
    track.scrollTo({ left: i * cardStep(), behavior: 'smooth' });
  }

  function currentIndex() {
    return Math.round(track.scrollLeft / cardStep());
  }

  function updateUI() {
    const idx = Math.min(currentIndex(), cards.length - 1);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }

  prevBtn.addEventListener('click', () => scrollToCard(Math.max(0, currentIndex() - 1)));
  nextBtn.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)));

  let raf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateUI);
  }, { passive: true });

  // Pointer-drag swipe for mouse / trackpad (touch already scrolls natively)
  let isDown = false, startX = 0, startScroll = 0, moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });

  const endDrag = () => { isDown = false; };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // Prevent the trailing card-open click from firing right after a drag
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Keyboard support
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
    if (e.key === 'ArrowLeft') scrollToCard(Math.max(0, currentIndex() - 1));
  });

  window.addEventListener('resize', updateUI);
  updateUI();
}

// ---------------------------------------------------------------------
// Hero 3D viewer: fade the "drag to rotate" hint once the visitor
// has plausibly interacted with the (cross-origin) Sketchfab iframe.
// ---------------------------------------------------------------------

function initHero3D() {
  const stage = document.getElementById('hero3d');
  const hint = document.getElementById('hero3dHint');
  if (!stage || !hint) return;

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    hint.style.transition = 'opacity 0.6s ease';
    hint.style.opacity = '0';
  };

  stage.addEventListener('pointerdown', dismiss, { once: true });
  window.addEventListener('blur', () => {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') dismiss();
  });
  setTimeout(dismiss, 7000);
}

// ---------------------------------------------------------------------
// Marquee: duplicate content so the CSS -50% loop is seamless
// ---------------------------------------------------------------------

function initMarquee() {
  const track = document.getElementById('marquee');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

// ---------------------------------------------------------------------
// Shared field helpers
// ---------------------------------------------------------------------

function showError(inputEl, errorEl, message) {
  inputEl.classList.toggle('invalid', !!message);
  errorEl.textContent = message || '';
}

function showFormMsg(el, type, text) {
  el.className = `form-msg show ${type}`;
  el.textContent = text;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
}

function initSocialStubs() {
  ['loginGoogleBtn', 'loginAppleBtn', 'signupGoogleBtn', 'signupAppleBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      alert('This is a demo project — social sign-in is not connected to a real provider.');
    });
  });
}

// ---------------------------------------------------------------------
// Sign-in panel
// ---------------------------------------------------------------------

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passwordError = document.getElementById('loginPasswordError');
  const formMsg = document.getElementById('loginFormMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!isValidEmail(emailInput.value.trim())) {
      showError(emailInput, emailError, 'Enter a valid email address.');
      valid = false;
    } else {
      showError(emailInput, emailError, '');
    }

    if (!passwordInput.value) {
      showError(passwordInput, passwordError, 'Enter your password.');
      valid = false;
    } else {
      showError(passwordInput, passwordError, '');
    }

    if (!valid) return;

    const users = getUsers();
    const email = emailInput.value.trim().toLowerCase();
    const user = users.find(u => u.email === email);

    if (!user || user.password !== passwordInput.value) {
      showFormMsg(formMsg, 'error', 'That email and password don’t match any account.');
      return;
    }

    setSession(user);
    showFormMsg(formMsg, 'success', `Welcome back, ${user.name.split(' ')[0]}.`);
    setTimeout(unlockSite, 500);
  });
}

// ---------------------------------------------------------------------
// Create Account panel
// ---------------------------------------------------------------------

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function initPasswordMeter() {
  const input = document.getElementById('signupPassword');
  const meter = document.getElementById('signupPwMeter');
  if (!input || !meter) return;
  const bars = Array.from(meter.children);
  const colors = ['#d16565', '#d1a065', '#c9c465', '#6fae7f'];

  input.addEventListener('input', () => {
    const score = scorePassword(input.value);
    bars.forEach((bar, i) => {
      bar.style.background = i < score ? colors[score - 1] : 'rgba(255,255,255,0.09)';
    });
  });
}

function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const nameInput = document.getElementById('signupFullname');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const confirmInput = document.getElementById('signupConfirm');
  const termsInput = document.getElementById('signupTerms');

  const nameError = document.getElementById('signupFullnameError');
  const emailError = document.getElementById('signupEmailError');
  const passwordError = document.getElementById('signupPasswordError');
  const confirmError = document.getElementById('signupConfirmError');
  const formMsg = document.getElementById('signupFormMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (nameInput.value.trim().length < 2) {
      showError(nameInput, nameError, 'Enter your full name.');
      valid = false;
    } else showError(nameInput, nameError, '');

    const email = emailInput.value.trim().toLowerCase();
    if (!isValidEmail(email)) {
      showError(emailInput, emailError, 'Enter a valid email address.');
      valid = false;
    } else showError(emailInput, emailError, '');

    if (passwordInput.value.length < 8) {
      showError(passwordInput, passwordError, 'Use at least 8 characters.');
      valid = false;
    } else showError(passwordInput, passwordError, '');

    if (confirmInput.value !== passwordInput.value || !confirmInput.value) {
      showError(confirmInput, confirmError, 'Passwords do not match.');
      valid = false;
    } else showError(confirmInput, confirmError, '');

    if (!termsInput.checked) {
      showFormMsg(formMsg, 'error', 'Please accept the Terms & Privacy Policy to continue.');
      valid = false;
    }

    if (!valid) return;

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      showFormMsg(formMsg, 'error', 'An account with that email already exists.');
      return;
    }

    const user = { name: nameInput.value.trim(), email, password: passwordInput.value };
    users.push(user);
    saveUsers(users);
    setSession(user);

    showFormMsg(formMsg, 'success', `Account created. Welcome, ${user.name.split(' ')[0]}.`);
    setTimeout(unlockSite, 600);
  });
}

// ---------------------------------------------------------------------
// Newsletter stub (home page)
// ---------------------------------------------------------------------

function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    input.value = '';
    input.placeholder = 'Thank you — you’re on the list.';
  });
}

// ==========================================================================
// Workshop — build-your-own configurator
// ==========================================================================

const BASE_PRICE = 8900;
const CASE_PRICE = { steel: 0, twotone: 3200, gold: 7500 };
const SIZE_PRICE = { '36': -400, '40': 0, '44': 300 };
const STRAP_PRICE = { bracelet: 0, leather: 150, rubber: 100 };
const CLASP_PRICE = { pin: 0, deployant: 260, diverext: 180 };
const ENGRAVING_FEE = 120;

const CASE_LABEL = { steel: 'Steel', twotone: 'Two-Tone', gold: 'Gold' };
const DIAL_LABEL = { black: 'Black', blue: 'Blue', green: 'Green', white: 'White' };
const STRAP_LABEL = { bracelet: 'Bracelet', leather: 'Leather', rubber: 'Rubber' };
const CLASP_LABEL = { pin: 'Pin Buckle', deployant: 'Deployant Clasp', diverext: 'Diver Extension Clasp' };

const STRAP_COLORS = {
  leather: [{ v: 'black', l: 'Black' }, { v: 'brown', l: 'Cognac' }, { v: 'navy', l: 'Navy' }, { v: 'green', l: 'Green' }],
  rubber: [{ v: 'black', l: 'Black' }, { v: 'blue', l: 'Blue' }, { v: 'khaki', l: 'Khaki' }]
};

const CASE_SWATCH_GRADIENT = {
  steel: 'linear-gradient(135deg,#f1f1f3,#9a9ca3 45%,#7d7f86 55%,#d3d4d8)',
  twotone: 'linear-gradient(135deg,#f1f1f3,#9a9ca3 40%,#c9a24d 60%,#eeda9e)',
  gold: 'linear-gradient(135deg,#f8e6ae,#c9a24d 45%,#9c7a32 55%,#eeda9e)'
};
const DIAL_COLOR_HEX = { black: '#141416', blue: '#16335e', green: '#0f3d2e', white: '#e9e7e0' };

function computePrice(cfg) {
  return BASE_PRICE + CASE_PRICE[cfg.case] + SIZE_PRICE[cfg.size] + STRAP_PRICE[cfg.strap]
    + CLASP_PRICE[cfg.clasp] + (cfg.engraving && cfg.engraving.trim() ? ENGRAVING_FEE : 0);
}

function formatPrice(n) {
  return '$' + n.toLocaleString('en-US');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function describeItem(item) {
  const strapBit = item.strap === 'bracelet' ? 'Bracelet' : `${STRAP_LABEL[item.strap]} (${capitalize(item.strapColor)})`;
  const claspBit = item.clasp ? ` · ${CLASP_LABEL[item.clasp]}` : '';
  const engravingBit = item.engraving ? ` · Engraved "${item.engraving}"` : '';
  return `${CASE_LABEL[item.case]} case · ${DIAL_LABEL[item.dial]} dial · ${item.size}mm · ${strapBit}${claspBit}${engravingBit}`;
}

function initWorkshop() {
  const svg = document.getElementById('watchSvg');
  if (!svg) return;

  const config = { case: 'steel', dial: 'black', size: '40', strap: 'bracelet', strapColor: 'black', clasp: 'pin', engraving: '' };

  const caseLabelEl = document.getElementById('caseLabel');
  const dialLabelEl = document.getElementById('dialLabel');
  const sizeLabelEl = document.getElementById('sizeLabel');
  const strapLabelEl = document.getElementById('strapLabel');
  const strapColorLabelEl = document.getElementById('strapColorLabel');
  const strapColorGroup = document.getElementById('strapColorGroup');
  const strapColorSwatches = document.getElementById('strapColorSwatches');
  const claspLabelEl = document.getElementById('claspLabel');
  const engravingInput = document.getElementById('engravingInput');
  const engravingCount = document.getElementById('engravingCount');
  const engravingFee = document.getElementById('engravingFee');
  const summaryName = document.getElementById('summaryName');
  const summarySpec = document.getElementById('summarySpec');
  const summaryPrice = document.getElementById('summaryPrice');
  const addToCartPrice = document.getElementById('addToCartPrice');

  function renderStrapColors() {
    const colors = STRAP_COLORS[config.strap];
    if (!colors) {
      strapColorGroup.hidden = true;
      return;
    }
    strapColorGroup.hidden = false;
    if (!colors.some(c => c.v === config.strapColor)) config.strapColor = colors[0].v;

    strapColorSwatches.innerHTML = colors.map(c =>
      `<button type="button" class="swatch swatch-strap swatch-strap-${c.v}${c.v === config.strapColor ? ' active' : ''}" data-value="${c.v}" aria-label="${c.l} strap"></button>`
    ).join('');

    strapColorLabelEl.textContent = colors.find(c => c.v === config.strapColor).l;

    strapColorSwatches.querySelectorAll('.swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        config.strapColor = btn.dataset.value;
        strapColorSwatches.querySelectorAll('.swatch').forEach(b => b.classList.toggle('active', b === btn));
        strapColorLabelEl.textContent = colors.find(c => c.v === config.strapColor).l;
        update();
      });
    });
  }

  function update() {
    svg.dataset.case = config.case;
    svg.dataset.dial = config.dial;
    svg.dataset.size = config.size;
    svg.dataset.strap = config.strap;
    svg.dataset.strapcolor = config.strapColor;

    caseLabelEl.textContent = CASE_LABEL[config.case];
    dialLabelEl.textContent = DIAL_LABEL[config.dial];
    sizeLabelEl.textContent = config.size + 'mm';
    strapLabelEl.textContent = STRAP_LABEL[config.strap];
    claspLabelEl.textContent = CLASP_LABEL[config.clasp];
    engravingFee.textContent = config.engraving.trim() ? `+${formatPrice(ENGRAVING_FEE)}` : '';

    const price = computePrice(config);
    const strapBit = config.strap === 'bracelet' ? 'Bracelet' : `${STRAP_LABEL[config.strap]}`;
    summaryName.textContent = `${CASE_LABEL[config.case]} Submariner · ${DIAL_LABEL[config.dial]} Dial`;
    summarySpec.textContent = `${CASE_LABEL[config.case]} case · ${DIAL_LABEL[config.dial]} dial · ${config.size}mm · ${strapBit} · ${CLASP_LABEL[config.clasp]}`
      + (config.engraving.trim() ? ` · Engraved "${config.engraving.trim()}"` : '');
    summaryPrice.textContent = formatPrice(price);
    addToCartPrice.textContent = formatPrice(price);
  }

  function wireGroup(containerId, key) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('.swatch, .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        config[key] = btn.dataset.value;
        container.querySelectorAll('.swatch, .pill-btn').forEach(b => b.classList.toggle('active', b === btn));
        if (key === 'strap') renderStrapColors();
        update();
      });
    });
  }

  wireGroup('caseSwatches', 'case');
  wireGroup('dialSwatches', 'dial');
  wireGroup('sizeButtons', 'size');
  wireGroup('strapButtons', 'strap');
  wireGroup('claspButtons', 'clasp');

  engravingInput.addEventListener('input', () => {
    config.engraving = engravingInput.value;
    engravingCount.textContent = `${engravingInput.value.length}/18`;
    update();
  });

  document.getElementById('resetConfigBtn').addEventListener('click', () => {
    Object.assign(config, { case: 'steel', dial: 'black', size: '40', strap: 'bracelet', strapColor: 'black', clasp: 'pin', engraving: '' });
    document.querySelectorAll('#caseSwatches .swatch').forEach(b => b.classList.toggle('active', b.dataset.value === config.case));
    document.querySelectorAll('#dialSwatches .swatch').forEach(b => b.classList.toggle('active', b.dataset.value === config.dial));
    document.querySelectorAll('#sizeButtons .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.value === config.size));
    document.querySelectorAll('#strapButtons .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.value === config.strap));
    document.querySelectorAll('#claspButtons .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.value === config.clasp));
    engravingInput.value = '';
    engravingCount.textContent = '0/18';
    renderStrapColors();
    update();
  });

  document.getElementById('addToCartBtn').addEventListener('click', () => {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      case: config.case,
      dial: config.dial,
      size: config.size,
      strap: config.strap,
      strapColor: config.strapColor,
      clasp: config.clasp,
      engraving: config.engraving.trim(),
      price: computePrice(config)
    };
    const cart = getCart();
    cart.push(item);
    saveCart(cart);
    renderCart();
    showCartPanel('bag');
    openCart();
  });

  renderStrapColors();
  update();
}

// ==========================================================================
// Cart: storage, rendering, drawer, checkout
// ==========================================================================

const CART_KEY = 'aurum_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  const count = getCart().length;
  countEl.textContent = count;
  countEl.hidden = count === 0;
}

function itemSwatchHTML(item) {
  return `<span class="case-fill" style="position:absolute;inset:0;background:${CASE_SWATCH_GRADIENT[item.case]}"></span>
    <span style="position:absolute;inset:14px;border-radius:50%;background:${DIAL_COLOR_HEX[item.dial]}"></span>`;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footEl = document.getElementById('cartFoot');
  if (!itemsEl) return;

  const cart = getCart();

  if (!cart.length) {
    itemsEl.innerHTML = '';
    emptyEl.hidden = false;
    footEl.hidden = true;
    updateCartBadge();
    return;
  }

  emptyEl.hidden = true;
  footEl.hidden = false;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-swatch">${itemSwatchHTML(item)}</div>
      <div class="cart-item-body">
        <h4>Custom Submariner</h4>
        <p>${describeItem(item)}</p>
        <div class="cart-item-foot">
          <strong>${formatPrice(item.price)}</strong>
          <button type="button" class="cart-item-remove" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  itemsEl.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      saveCart(getCart().filter(i => i.id !== btn.dataset.remove));
      renderCart();
    });
  });

  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  updateCartBadge();
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('show');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('show');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
}

function showCartPanel(name) {
  document.getElementById('cartPanelBag').hidden = name !== 'bag';
  document.getElementById('cartPanelCheckout').hidden = name !== 'checkout';
  document.getElementById('cartPanelSuccess').hidden = name !== 'success';
}

function initCart() {
  if (!document.getElementById('cartDrawer')) return;
  renderCart();

  document.getElementById('cartToggle')?.addEventListener('click', () => { showCartPanel('bag'); openCart(); });
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartCloseCheckout')?.addEventListener('click', closeCart);
  document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);
  document.getElementById('cartEmptyLink')?.addEventListener('click', closeCart);

  document.getElementById('cartCheckoutBtn')?.addEventListener('click', () => {
    const cart = getCart();
    document.getElementById('checkoutSummary').innerHTML = cart.map(i =>
      `<div class="co-line"><span>${describeItem(i)}</span><strong>${formatPrice(i.price)}</strong></div>`
    ).join('');
    const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
    document.getElementById('checkoutTotal').textContent = formatPrice(subtotal);
    showCartPanel('checkout');
  });

  document.getElementById('checkoutBack')?.addEventListener('click', () => showCartPanel('bag'));

  document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('checkoutName');
    const addressInput = document.getElementById('checkoutAddress');
    let valid = true;
    if (!nameInput.value.trim()) { nameInput.classList.add('invalid'); valid = false; } else nameInput.classList.remove('invalid');
    if (!addressInput.value.trim()) { addressInput.classList.add('invalid'); valid = false; } else addressInput.classList.remove('invalid');
    if (!valid) return;

    const orderNum = 'AUR-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').textContent = '#' + orderNum;
    saveCart([]);
    renderCart();
    showCartPanel('success');
  });

  document.getElementById('cartContinue')?.addEventListener('click', () => {
    closeCart();
    setTimeout(() => showCartPanel('bag'), 400);
  });
}

// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initAuthTabs();
  initHeader();
  initHero3D();
  initMarquee();
  initCarousel();
  initNewsletter();
  initPasswordToggle('loginTogglePassword', 'loginPassword');
  initPasswordToggle('signupTogglePassword', 'signupPassword');
  initPasswordMeter();
  initSocialStubs();
  initLoginForm();
  initSignupForm();
  initWorkshop();
  initCart();
});
