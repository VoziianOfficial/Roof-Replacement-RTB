document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
        duration: 900,
        once: true,
        offset: 80
    });

    initMobileMenu();
    initSearchPanel();
    initFaq();
    initCounters();
    initCookieBanner();
    initScrollProgress();
    initForms();
});

function initMobileMenu() {
    const toggle = document.querySelector(".mobile-toggle");
    const menu = document.querySelector(".mobile-menu");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

function initSearchPanel() {
    const panel = document.querySelector(".search-panel");
    const openBtn = document.querySelector(".search-toggle");
    const closeBtn = document.querySelector(".search-close");
    const overlay = document.querySelector(".search-panel__overlay");
    const input = document.getElementById("siteSearchInput");
    const button = document.getElementById("siteSearchButton");
    const results = document.getElementById("siteSearchResults");

    if (!panel || !openBtn || !closeBtn || !overlay || !input || !button || !results) return;

    const pages = [
        { title: "Home", url: "index.html", keywords: ["home", "main", "roof", "hero"] },
        { title: "About", url: "about.html", keywords: ["about", "company", "team"] },
        { title: "Services", url: "services.html", keywords: ["services", "all services", "roofing solutions"] },
        { title: "Roof Replacement", url: "roof-replacement.html", keywords: ["replacement", "roof replacement", "new roof"] },
        { title: "Roof Repair", url: "roof-repair.html", keywords: ["repair", "roof repair", "leak"] },
        { title: "Roof Installation", url: "roof-installation.html", keywords: ["installation", "roof installation"] },
        { title: "Roof Inspection", url: "roof-inspection.html", keywords: ["inspection", "roof inspection"] },
        { title: "Storm Damage Roofing", url: "storm-damage-roofing.html", keywords: ["storm", "damage", "hail", "wind"] },
        { title: "Contact", url: "contact.html", keywords: ["contact", "estimate", "phone", "email"] },
        { title: "Privacy Policy", url: "privacy-policy.html", keywords: ["privacy", "policy"] },
        { title: "Cookie Policy", url: "cookie-policy.html", keywords: ["cookie", "cookies"] },
        { title: "Terms Of Service", url: "terms-of-service.html", keywords: ["terms", "service", "legal"] }
    ];

    const openPanel = () => {
        panel.classList.add("active");
        document.body.style.overflow = "hidden";
        setTimeout(() => input.focus(), 100);
    };

    const closePanel = () => {
        panel.classList.remove("active");
        document.body.style.overflow = "";
    };

    const renderResults = (query) => {
        const q = query.trim().toLowerCase();

        if (!q) {
            results.innerHTML = "";
            return;
        }

        const found = pages.filter((page) =>
            page.title.toLowerCase().includes(q) ||
            page.keywords.some((keyword) => keyword.includes(q))
        );

        if (!found.length) {
            results.innerHTML = `<div class="search-result-item">No results found for "<strong>${query}</strong>".</div>`;
            return;
        }

        results.innerHTML = found
            .map(
                (page) => `
          <a class="search-result-item" href="${page.url}">
            <strong>${page.title}</strong><br>
            <span>Open page</span>
          </a>
        `
            )
            .join("");
    };

    openBtn.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    button.addEventListener("click", () => renderResults(input.value));
    input.addEventListener("input", () => renderResults(input.value));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePanel();
    });
}

function initFaq() {
    const faqItems = document.querySelectorAll(".faq-item");

    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            if (item.classList.contains("active")) {
                item.classList.remove("active");
                return;
            }

            faqItems.forEach((faq) => faq.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

function initCounters() {
    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    const animateCounter = (counter) => {
        const target = +counter.dataset.target;
        const increment = Math.max(1, Math.ceil(target / 100));
        let current = 0;

        const update = () => {
            current += increment;

            if (current >= target) {
                counter.textContent = target + (target === 98 ? "%" : target === 24 ? "/7" : "+");
                return;
            }

            counter.textContent = current;
            requestAnimationFrame(update);
        };

        update();
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
}

function initCookieBanner() {
    const banner = document.getElementById("cookieBanner");
    const acceptBtn = document.getElementById("acceptCookies");
    const declineBtn = document.getElementById("declineCookies");

    if (!banner || !acceptBtn || !declineBtn) return;

    const consent = localStorage.getItem("rtb_cookie_choice");

    if (!consent) {
        setTimeout(() => {
            banner.classList.add("show");
        }, 500);
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("rtb_cookie_choice", "accepted");
        banner.classList.remove("show");
    });

    declineBtn.addEventListener("click", () => {
        localStorage.setItem("rtb_cookie_choice", "declined");
        banner.classList.remove("show");
    });
}

function initScrollProgress() {
    const progress = document.querySelector(".site-progress");
    if (!progress) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = `${value}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress);
}

function initForms() {
    const forms = document.querySelectorAll(".contact-form");

    forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thank you! Your request has been received.");
            form.reset();
        });
    });
}