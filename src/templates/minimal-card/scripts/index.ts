import styles from "@/templates/minimal-card/styles.module.css";
import type { TemplateScriptContext } from "@/templates/types";

export function mountTemplateScripts(context: TemplateScriptContext) {
  const { root } = context;
  const cleanups: Array<() => void> = [];

  const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-minimal-reveal='true']"));

  if (revealElements.length > 0) {
    if (typeof IntersectionObserver === "undefined") {
      revealElements.forEach((element) => element.classList.add(styles.visible));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (!entry.isIntersecting) {
              return;
            }

            window.setTimeout(() => {
              entry.target.classList.add(styles.visible);
            }, index * 70);

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -48px 0px",
        },
      );

      revealElements.forEach((element) => observer.observe(element));
      cleanups.push(() => observer.disconnect());
    }
  }

  const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-minimal-nav-link='true']"));
  const navbar = root.querySelector<HTMLElement>("[data-minimal-nav='true']");
  const sections = Array.from(root.querySelectorAll<HTMLElement>("section[id]"));

  if (navLinks.length > 0 && navbar && sections.length > 0) {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = "home";

      navbar.style.background = scrollY > 24 ? "rgba(255, 255, 255, 0.58)" : "rgba(255, 255, 255, 0.42)";

      if (root.classList.contains(styles.graphite)) {
        navbar.style.background = scrollY > 24 ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)";
      }

      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - 110) {
          currentId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle(styles.navLinkActive, isActive);
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", handleScroll));
  }

  const anchorLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));

  if (anchorLinks.length > 0) {
    const anchorCleanups = anchorLinks.map((anchor) => {
      const handleClick = (event: MouseEvent) => {
        const href = anchor.getAttribute("href");

        if (!href || href === "#") {
          event.preventDefault();
          return;
        }

        const target = root.querySelector<HTMLElement>(href) ?? document.getElementById(href.slice(1));

        if (!target) {
          return;
        }

        event.preventDefault();
        window.scrollTo({
          top: Math.max(0, target.offsetTop - 92),
          behavior: "smooth",
        });
      };

      anchor.addEventListener("click", handleClick);

      return () => {
        anchor.removeEventListener("click", handleClick);
      };
    });

    cleanups.push(() => {
      anchorCleanups.forEach((cleanup) => cleanup());
    });
  }

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}
