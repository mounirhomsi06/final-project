// Shared across every page: the auth gate (blocks the whole site until you
// sign in or create an account) and the header (basket count, user name,
// logout). Each HTML page includes the same gate + header markup and calls
// initSite() on load.

import * as auth from "./auth.js";
import { basketCount, getItems } from "./basket.js";

function show(el) {
  el.hidden = false;
}
function hide(el) {
  el.hidden = true;
}

function wireAuthGate() {
  const gate = document.getElementById("auth-gate");
  const loginTab = document.getElementById("tab-login");
  const signupTab = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const errorBox = document.getElementById("auth-error");

  function switchTab(name) {
    errorBox.hidden = true;
    errorBox.textContent = "";
    const isLogin = name === "login";
    loginTab.setAttribute("aria-pressed", String(isLogin));
    signupTab.setAttribute("aria-pressed", String(!isLogin));
    loginTab.classList.toggle("bg-primary", isLogin);
    loginTab.classList.toggle("text-primary-foreground", isLogin);
    loginTab.classList.toggle("text-muted-foreground", !isLogin);
    signupTab.classList.toggle("bg-primary", !isLogin);
    signupTab.classList.toggle("text-primary-foreground", !isLogin);
    signupTab.classList.toggle("text-muted-foreground", isLogin);
    if (isLogin) {
      show(loginForm);
      hide(signupForm);
    } else {
      hide(loginForm);
      show(signupForm);
    }
  }

  loginTab.addEventListener("click", () => switchTab("login"));
  signupTab.addEventListener("click", () => switchTab("signup"));
  gate.querySelectorAll("[data-switch-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.switchTab));
  });

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const result = auth.login(email, password);
    if (!result.ok) return showError(result.error);
    location.reload();
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    if (name.trim().length < 2) return showError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return showError("Enter a valid email address.");
    if (password.length < 6) return showError("Use at least 6 characters for your password.");
    if (password !== confirm) return showError("Passwords do not match.");

    const result = auth.signup(name, email, password);
    if (!result.ok) return showError(result.error);
    location.reload();
  });
}

function wireHeader(session) {
  const nameEl = document.getElementById("header-user-name");
  if (nameEl) nameEl.textContent = session.name.split(" ")[0];

  const logoutBtn = document.getElementById("header-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();
      location.reload();
    });
  }

  const countEl = document.getElementById("header-basket-count");
  if (countEl) countEl.textContent = String(basketCount(getItems()));

  const path = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.dataset.navLink === path || (path === "/" && link.dataset.navLink === "/index")) {
      link.classList.add("text-primary");
    }
  });
}

export function refreshBasketCount() {
  const countEl = document.getElementById("header-basket-count");
  if (countEl) countEl.textContent = String(basketCount(getItems()));
}

export function initSite() {
  const gate = document.getElementById("auth-gate");
  const site = document.getElementById("site-content");
  const session = auth.getSession();

  if (!session) {
    show(gate);
    hide(site);
    wireAuthGate();
    return null;
  }

  hide(gate);
  show(site);
  wireHeader(session);
  return session;
}
