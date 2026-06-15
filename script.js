const header = document.querySelector(".site-header");
const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const hashLinks = Array.from(document.querySelectorAll("a[href^='#']"));
const sectionTargets = navLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let ticking = false;

function headerOffset() {
  return Math.ceil((header?.getBoundingClientRect().height || 0) + 16);
}

function syncHeaderOffset() {
  document.documentElement.style.setProperty("--header-offset", `${headerOffset()}px`);
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.hash === `#${id}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function currentSectionId() {
  if (!sectionTargets.length) {
    return "";
  }

  const pageBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

  if (pageBottom) {
    return sectionTargets[sectionTargets.length - 1].id;
  }

  const marker = window.scrollY + headerOffset() + window.innerHeight * 0.35;
  let currentId = "";

  sectionTargets.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;

    if (sectionTop <= marker) {
      currentId = section.id;
    }
  });

  return currentId;
}

function updateActiveLink() {
  ticking = false;
  syncHeaderOffset();
  setActiveLink(currentSectionId());
}

function requestActiveUpdate() {
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(updateActiveLink);
  }
}

hashLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.hash.slice(1);
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - headerOffset()
    );

    window.history.pushState(null, "", `#${targetId}`);
    setActiveLink(targetId);
    window.scrollTo({
      top,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });

    window.setTimeout(requestActiveUpdate, reducedMotion.matches ? 0 : 450);
  });
});

window.addEventListener("scroll", requestActiveUpdate, { passive: true });
window.addEventListener("resize", requestActiveUpdate);
window.addEventListener("load", () => {
  syncHeaderOffset();

  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));

    if (target) {
      window.scrollTo({
        top: Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - headerOffset()
        )
      });
    }
  }

  requestActiveUpdate();
});

if ("ResizeObserver" in window && header) {
  new ResizeObserver(requestActiveUpdate).observe(header);
}
