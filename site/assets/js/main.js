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
// ДЕМО-КОРЗИНА
// =========================
const cartCount = document.getElementById("cartCount");
const addButtons = document.querySelectorAll(".add-to-cart");
let cartItems = 0;

addButtons.forEach(button => {
  button.addEventListener("click", () => {
    cartItems += 1;
    cartCount.textContent = cartItems;

    const originalText = button.textContent;
    button.textContent = "✓ Добавлено";
    button.style.background = "#9bcf53";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = "";
    }, 1100);
  });
});

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