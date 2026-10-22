// =========================
// МОБИЛЬНОЕ МЕНЮ
// =========================
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && mainNav.classList.contains("open")) {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
    menuToggle.focus();
  }
});

// =========================
// КНОПКА "НАВЕРХ"
// =========================
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  toTop.classList.toggle("visible", window.scrollY > 500);
}, { passive: true });

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// =========================
// ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ
// =========================
const animatedElements = document.querySelectorAll(".fade-in");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animatedElements.forEach(el => observer.observe(el));
} else {
  animatedElements.forEach(el => el.classList.add("is-visible"));
}

// =========================
// КОРЗИНА
// =========================
const CART_KEY = "marmeladlavka.cart.v1";

const cartOpenButton = document.getElementById("cartOpen");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartCloseButton = document.getElementById("cartClose");
const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const cartFooter = document.getElementById("cartFooter");
const cartTotal = document.getElementById("cartTotal");
const cartItemsLabel = document.getElementById("cartItemsLabel");
const cartCount = document.getElementById("cartCount");

// Реестр товаров из карточек каталога
const productCards = document.querySelectorAll(".product-card");
const productRegistry = new Map();

productCards.forEach(card => {
  const name = card.querySelector(".product-body h3")?.textContent.trim();
  const priceText = card.querySelector(".price")?.textContent || "";
  const image = card.querySelector("img")?.src || "";
  if (!name) return;
  productRegistry.set(name, {
    name,
    price: parseInt(priceText.replace(/\D/g, ""), 10) || 0,
    image
  });
});

// Состояние корзины
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter(item => item && item.name && item.qty > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function totalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function totalSum() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => {
    switch (char) {
      case "&": return "&" + "amp;";
      case "<": return "&" + "lt;";
      case ">": return "&" + "gt;";
      case '"': return "&" + "quot;";
      case "'": return "&#" + "39;";
      default: return char;
    }
  });
}

function addToCart(name) {
  const product = productRegistry.get(name);
  if (!product) return;

  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  bumpCartButton();
}

function changeQty(name, delta) {
  const item = cart.find(el => el.name === name);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(el => el.name !== name);
  }

  saveCart();
  renderCart();
}

function removeItem(name) {
  cart = cart.filter(el => el.name !== name);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  cartCount.textContent = totalItems();
  cartItemsLabel.textContent = cart.length ? `· ${totalItems()} шт.` : "";
  cartTotal.textContent = formatPrice(totalSum());

  const hasItems = cart.length > 0;
  cartEmpty.style.display = hasItems ? "none" : "";
  cartFooter.hidden = !hasItems;

  cartList.innerHTML = cart.map(item => `
    <li class="cart-item">
      <img class="cart-item-image" src="${item.image}" alt="" width="70" height="70" loading="lazy">
      <div class="cart-item-info">
        <span class="cart-item-name">${escapeHTML(item.name)}</span>
        <div class="cart-item-controls">
          <button class="qty-btn" type="button" data-action="minus" data-name="${escapeHTML(item.name)}" aria-label="Уменьшить количество: ${escapeHTML(item.name)}">−</button>
          <span class="qty-value" aria-live="polite">${item.qty}</span>
          <button class="qty-btn" type="button" data-action="plus" data-name="${escapeHTML(item.name)}" aria-label="Увеличить количество: ${escapeHTML(item.name)}">+</button>
        </div>
      </div>
      <div class="cart-item-side">
        <strong>${formatPrice(item.price * item.qty)}</strong>
        <button class="cart-item-remove" type="button" data-action="remove" data-name="${escapeHTML(item.name)}" aria-label="Удалить из корзины: ${escapeHTML(item.name)}">✕</button>
      </div>
    </li>
  `).join("");
}

// Кнопки «В корзину» в каталоге
const addButtons = document.querySelectorAll(".add-to-cart");

addButtons.forEach(button => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.product);

    const originalText = button.textContent;
    button.textContent = "✓ Добавлено";
    button.style.background = "#9bcf53";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = "";
    }, 1100);
  });
});

// Открытие / закрытие панели
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  cartCloseButton.focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  cartOpenButton.focus();
}

cartOpenButton.addEventListener("click", openCart);
cartCloseButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

// Клики внутри списка корзины (делегирование)
cartList.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, name } = button.dataset;
  if (action === "plus") changeQty(name, 1);
  if (action === "minus") changeQty(name, -1);
  if (action === "remove") removeItem(name);
});

// Оформление заказа и очистка
const cartClearButton = document.getElementById("cartClear");
const cartCheckoutButton = document.getElementById("cartCheckout");
const cartEmptyLink = document.getElementById("cartEmptyLink");

cartClearButton.addEventListener("click", clearCart);

cartCheckoutButton.addEventListener("click", () => {
  if (!cart.length) return;

  const total = totalSum();
  clearCart();
  closeCart();
  showToast(`Заказ на ${formatPrice(total)} оформлен! Мы свяжемся с вами ☺`);
});

// Закрытие корзины по ссылке «Перейти в каталог»
cartEmptyLink.addEventListener("click", closeCart);

// Анимация кнопки корзины при добавлении
function bumpCartButton() {
  cartOpenButton.classList.remove("bump");
  void cartOpenButton.offsetWidth;
  cartOpenButton.classList.add("bump");
}

// Всплывающее уведомление
let toastTimer;

function showToast(message) {
  let toast = document.getElementById("cartToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cartToast";
    toast.className = "cart-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// Первичная отрисовка
renderCart();

// =========================
// ФОРМА ОБРАТНОЙ СВЯЗИ
// =========================
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", event => {
  event.preventDefault();

  const submitButton = contactForm.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;

  submitButton.textContent = "✓ Спасибо! Мы свяжемся с вами";
  submitButton.disabled = true;

  setTimeout(() => {
    contactForm.reset();
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }, 2500);
});