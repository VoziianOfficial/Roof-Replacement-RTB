document.addEventListener("DOMContentLoaded", () => {
    initAOS();
    initHeaderScroll();
    initScrollProgress();
    initMobileMenu();
    initSearchPanel();
    initFaq();
    initCookieBanner();
    initFormModal();
    initForms();
    initParallaxSections();
    initMagneticButtons();
    initLoopingSwipers();
});

let formModalApi = null;

function initAOS() {
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 900,
            once: true,
            offset: 70,
            easing: "ease-out-cubic"
        });
    }
}

function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 14) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }, { passive: true });
}

function initScrollProgress() {
    const progress = document.querySelector(".site-progress");
    if (!progress) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressValue = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = `${Math.min(Math.max(progressValue, 0), 100)}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
}

function initMobileMenu() {
    const toggleBtn = document.querySelector(".mobile-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-menu a");

    if (!toggleBtn || !mobileMenu) return;

    const openMenu = () => {
        mobileMenu.classList.add("active");
        toggleBtn.classList.add("active");
        toggleBtn.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    };

    const closeMenu = () => {
        mobileMenu.classList.remove("active");
        toggleBtn.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    };

    toggleBtn.setAttribute("aria-expanded", "false");

    toggleBtn.addEventListener("click", () => {
        mobileMenu.classList.contains("active") ? closeMenu() : openMenu();
    });

    mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 991) closeMenu();
    });

    document.addEventListener("click", (event) => {
        if (!mobileMenu.classList.contains("active")) return;
        if (mobileMenu.contains(event.target) || toggleBtn.contains(event.target)) return;
        closeMenu();
    });
}

function initSearchPanel() {
    const panel = document.querySelector(".search-panel");
    const openBtn = document.querySelector(".search-toggle");
    const closeBtn = document.querySelector(".search-close");
    const overlay = document.querySelector(".search-panel__overlay");
    const input = document.getElementById("siteSearchInput");
    const searchBtn = document.getElementById("siteSearchButton");
    const results = document.getElementById("siteSearchResults");

    if (!panel || !openBtn || !closeBtn || !overlay || !input || !searchBtn || !results) return;

    const pages = [
        { title: "Home", url: "index.html", desc: "NobleRoof homepage with request paths, platform notes and planning guidance.", keywords: ["home", "nobleroof", "roof", "request", "planning"] },
        { title: "About", url: "about.html", desc: "Learn what NobleRoof is and how the platform works.", keywords: ["about", "platform", "nobleroof", "how it works"] },
        { title: "All Categories", url: "services.html", desc: "Browse all request categories and planning routes.", keywords: ["categories", "all categories", "services", "roofing requests"] },
        { title: "Request", url: "contact.html", desc: "Submit a request and share property details.", keywords: ["request", "contact", "form", "map"] },
        { title: "Roof Replacement", url: "roof-replacement.html", desc: "Explore the roof replacement request category.", keywords: ["replacement", "roof replacement"] },
        { title: "Roof Repair", url: "roof-repair.html", desc: "Explore the roof repair request category.", keywords: ["repair", "roof repair", "leak"] },
        { title: "Roof Installation", url: "roof-installation.html", desc: "Explore the roof installation request category.", keywords: ["installation", "roof installation"] },
        { title: "Roof Inspection", url: "roof-inspection.html", desc: "Explore the roof inspection request category.", keywords: ["inspection", "roof inspection"] },
        { title: "Storm Damage Roofing", url: "storm-damage-roofing.html", desc: "Explore storm-related roof request options.", keywords: ["storm", "hail", "wind", "damage"] },
        { title: "Privacy Policy", url: "privacy-policy.html", desc: "Read privacy information.", keywords: ["privacy", "policy"] },
        { title: "Cookie Policy", url: "cookie-policy.html", desc: "Read cookie information.", keywords: ["cookie", "cookies"] },
        { title: "Terms Of Service", url: "terms-of-service.html", desc: "Read website terms.", keywords: ["terms", "service", "legal"] }
    ];

    const normalize = (value) => value.toLowerCase().trim().replace(/\s+/g, " ");

    const renderResults = (query) => {
        const q = normalize(query);
        if (!q) {
            results.innerHTML = "";
            return;
        }

        const found = pages.filter((page) =>
            normalize(page.title).includes(q) ||
            normalize(page.desc).includes(q) ||
            page.keywords.some((keyword) => normalize(keyword).includes(q))
        );

        if (!found.length) {
            results.innerHTML = `
        <div class="search-result-item">
          <strong>No results found</strong><br>
          <span>Try: replacement, repair, inspection, request, privacy</span>
        </div>
      `;
            return;
        }

        results.innerHTML = found
            .slice(0, 6)
            .map(
                (page) => `
          <a class="search-result-item" href="${page.url}">
            <strong>${page.title}</strong><br>
            <span>${page.desc}</span>
          </a>
        `
            )
            .join("");
    };

    const openPanel = () => {
        panel.classList.add("active");
        document.body.classList.add("search-open");
        setTimeout(() => input.focus(), 120);
    };

    const closePanel = () => {
        panel.classList.remove("active");
        document.body.classList.remove("search-open");
    };

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            renderResults(input.value);
        }
    });

    openBtn.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);
    searchBtn.addEventListener("click", () => renderResults(input.value));
    input.addEventListener("input", () => renderResults(input.value));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePanel();
    });

    results.addEventListener("click", (e) => {
        if (e.target.closest("a")) closePanel();
    });
}

function initFaq() {
    const faqItems = document.querySelectorAll(".faq-item");
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (!question) return;

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");
            faqItems.forEach((faq) => faq.classList.remove("active"));
            if (!isActive) item.classList.add("active");
        });
    });
}

function initCookieBanner() {
    const banner = document.getElementById("cookieBanner");
    const acceptBtn = document.getElementById("acceptCookies");
    const declineBtn = document.getElementById("declineCookies");

    if (!banner || !acceptBtn || !declineBtn) return;

    const STORAGE_KEY = "nobleroof_cookie_choice";
    const currentChoice = localStorage.getItem(STORAGE_KEY);

    if (!currentChoice) {
        setTimeout(() => banner.classList.add("show"), 450);
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, "accepted");
        banner.classList.remove("show");
    });

    declineBtn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, "declined");
        banner.classList.remove("show");
    });
}

function initForms() {
    const forms = document.querySelectorAll(".contact-form");
    if (!forms.length) return;

    forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const fields = form.querySelectorAll("input, textarea, select");
            let isValid = true;

            fields.forEach((field) => {
                field.classList.remove("is-error");

                if (field.tagName === "SELECT") {
                    if (!field.value || field.selectedIndex === 0) {
                        field.classList.add("is-error");
                        isValid = false;
                    }
                    return;
                }

                if (field.type === "email") {
                    const value = field.value.trim();
                    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    if (!value || !valid) {
                        field.classList.add("is-error");
                        isValid = false;
                    }
                    return;
                }

                if (field.value.trim() === "") {
                    field.classList.add("is-error");
                    isValid = false;
                }
            });

            if (!isValid) {
                const firstInvalidField = form.querySelector(".is-error");
                if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            form.reset();
            if (formModalApi) {
                formModalApi.open();
            }
        });
    });
}

function initFormModal() {
    const modal = document.createElement("div");
    modal.className = "form-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <div class="form-modal__backdrop" data-form-modal-close></div>
        <div class="form-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="formModalTitle">
            <button class="form-modal__close" type="button" aria-label="Close message" data-form-modal-close>
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="form-modal__icon">
                <i class="fa-solid fa-check"></i>
            </div>
            <h3 id="formModalTitle">Спасибо, мы с вами свяжемся</h3>
            <p>Your request has been received. We will review the details and get back to you shortly.</p>
            <div class="form-modal__actions">
                <button class="btn btn-primary" type="button" data-form-modal-close>Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closers = modal.querySelectorAll("[data-form-modal-close]");

    const open = () => {
        modal.classList.add("is-active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("form-modal-open");
    };

    const close = () => {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("form-modal-open");
    };

    closers.forEach((button) => {
        button.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
    });

    formModalApi = { open, close };
}

function initParallaxSections() {
    const sections = document.querySelectorAll(".parallax-section");
    if (!sections.length) return;

    const updateParallax = () => {
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const speed = 0.08;
            const offset = rect.top * speed;
            section.style.backgroundPosition = `center calc(50% + ${offset}px)`;
        });
    };

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
}

function initMagneticButtons() {
    if (window.innerWidth < 992) return;

    const buttons = document.querySelectorAll(".magnetic-btn");

    buttons.forEach((button) => {
        button.addEventListener("mousemove", (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const isCallButton = button.classList.contains("floating-call-btn");

            if (isCallButton) {
                button.style.transform = `translateY(-50%) translate(${x * 0.08}px, ${y * 0.08}px)`;
            } else {
                button.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
            }
        });

        button.addEventListener("mouseleave", () => {
            button.style.transform = "";
        });
    });
}

/**
 * Initialize Swiper sliders with looping functionality
 * Uses .js-loop-swiper selector for automatic initialization
 */
function initLoopingSwipers() {
    if (typeof Swiper === "undefined") return;

    const sliders = document.querySelectorAll(".js-loop-swiper");
    if (!sliders.length) return;

    sliders.forEach((slider) => {
        const pagination = slider.querySelector(".swiper-pagination");
        const nextBtn = slider.querySelector(".swiper-button-next");
        const prevBtn = slider.querySelector(".swiper-button-prev");
        const progressBar = slider.querySelector("[data-swiper-progress]");

        const updateProgress = (swiper) => {
            if (!progressBar) return;

            const totalSlides = swiper.slides.length - swiper.loopedSlides * 2;
            const currentIndex = swiper.realIndex + 1;
            const progress = totalSlides > 1 ? (currentIndex / totalSlides) * 100 : 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        };

        const swiper = new Swiper(slider, {
            loop: true,
            speed: 850,
            grabCursor: true,
            spaceBetween: 22,
            slidesPerView: 1,
            centeredSlides: false,
            autoplay: {
                delay: 4200,
                disableOnInteraction: false
            },
            pagination: pagination ? {
                el: pagination,
                clickable: true,
                dynamicBullets: true
            } : undefined,
            navigation: nextBtn && prevBtn ? {
                nextEl: nextBtn,
                prevEl: prevBtn
            } : undefined,
            breakpoints: {
                768: {
                    slidesPerView: 2
                },
                1100: {
                    slidesPerView: 3
                }
            },
            on: {
                init(instance) {
                    updateProgress(instance);
                },
                slideChange(instance) {
                    updateProgress(instance);
                }
            }
        });

        updateProgress(swiper);
    });
}
