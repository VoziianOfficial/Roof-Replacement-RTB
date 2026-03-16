const menuToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const pageKey = document.body.dataset.page;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("is-menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (pageKey) {
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === pageKey) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}
const floatingCta = document.createElement("a");
floatingCta.className = "floating-cta";
floatingCta.href = "contact.html#lead-form";
floatingCta.setAttribute("aria-label", "Request quotes from RoofMatch Advisory");

floatingCta.innerHTML = `
<span class="floating-cta-icon" aria-hidden="true">
<i data-lucide="mail"></i>
</span>
<span>Request Quotes</span>
`;

document.body.appendChild(floatingCta);

const toggleFloatingCta = () => {
  const shouldShow = window.scrollY > 200;
  floatingCta.classList.toggle("is-visible", shouldShow);
};

window.addEventListener("scroll", toggleFloatingCta);
toggleFloatingCta();

floatingCta.addEventListener("click", (event) => {
  const form = document.getElementById("lead-form");

  if (form && document.body.classList.contains("page-contact")) {
    event.preventDefault();

    form.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    const focusable = form.querySelector("input, textarea, select, button");

    if (focusable) {
      focusable.focus();
    }
  }
});

const applyAosAttributes = () => {
  const elements = document.querySelectorAll(
    ".section, .page-hero-inner, .card, .header-cta, .button-link, .form-card"
  );

  elements.forEach((el, index) => {
    if (!el.dataset.aos) {
      el.dataset.aos = "fade-up";
      el.dataset.aosDelay = String((index % 4) * 70);
    }
  });
};

const initGsapAnimations = () => {
  if (prefersReducedMotion) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".page-hero-inner", {
    opacity: 0,
    y: 16,
    duration: 1,
    ease: "power3.out"
  });

  gsap.utils.toArray(".card, .content-card, .content-panel").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 18,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 90%"
      }
    });
  });

  gsap.from(".hero-meta span", {
    opacity: 0,
    y: 8,
    stagger: 0.16,
    duration: 0.8,
    ease: "power3.out"
  });
};

const initAos = () => {
  if (!window.AOS) return;

  applyAosAttributes();

  window.AOS.init({
    duration: 820,
    easing: "power3.out",
    once: true,
    disableMutationObserver: true,
    disable: prefersReducedMotion
  });
};

const initLucideIcons = () => {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
};

window.addEventListener("load", () => {
  initLucideIcons();
  initAos();
  initGsapAnimations();
});