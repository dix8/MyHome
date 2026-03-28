import styles from "@/templates/glow-vision/styles.module.css";
import type { TemplateScriptContext } from "@/templates/types";

function numberConfig(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanConfig(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

type Particle = {
  color: string;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

export function mountTemplateScripts(context: TemplateScriptContext) {
  const { config, root } = context;
  const cleanups: Array<() => void> = [];

  const canvas = root.querySelector<HTMLCanvasElement>("[data-tpl-particles='true']");
  const enableParticles = booleanConfig(config.enableParticles, true);
  const particleDensity = numberConfig(config.particleDensity, 80);

  if (canvas && enableParticles) {
    const drawingContext = canvas.getContext("2d");

    if (drawingContext) {
      const drawingCanvas = canvas;
      const context2d = drawingContext;
      const mouse = { radius: 150, x: null as number | null, y: null as number | null };
      const colors = [
        "rgba(0, 240, 255, 0.5)",
        "rgba(124, 58, 237, 0.4)",
        "rgba(255, 255, 255, 0.3)",
      ];
      const maxDistance = 120;
      let particles: Particle[] = [];
      let frameId = 0;

      function resize() {
        drawingCanvas.width = window.innerWidth;
        drawingCanvas.height = window.innerHeight;
      }

      function buildParticles() {
        const count = window.innerWidth < 768 ? Math.max(40, Math.floor(particleDensity * 0.5)) : particleDensity;

        particles = Array.from({ length: count }, () => ({
          x: Math.random() * drawingCanvas.width,
          y: Math.random() * drawingCanvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
        }));
      }

      function animate() {
        context2d.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        particles.forEach((particle, index) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > drawingCanvas.width) {
            particle.vx *= -1;
          }

          if (particle.y < 0 || particle.y > drawingCanvas.height) {
            particle.vy *= -1;
          }

          if (mouse.x !== null && mouse.y !== null) {
            const deltaX = particle.x - mouse.x;
            const deltaY = particle.y - mouse.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < mouse.radius) {
              const force = (mouse.radius - distance) / mouse.radius;
              particle.x += deltaX * force * 0.02;
              particle.y += deltaY * force * 0.02;
            }
          }

          context2d.beginPath();
          context2d.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context2d.fillStyle = particle.color;
          context2d.fill();

          for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
            const target = particles[compareIndex];

            if (!target) {
              continue;
            }

            const deltaX = particle.x - target.x;
            const deltaY = particle.y - target.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance >= maxDistance) {
              continue;
            }

            const opacity = (1 - distance / maxDistance) * 0.15;
            context2d.beginPath();
            context2d.moveTo(particle.x, particle.y);
            context2d.lineTo(target.x, target.y);
            context2d.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            context2d.lineWidth = 0.5;
            context2d.stroke();
          }
        });

        frameId = window.requestAnimationFrame(animate);
      }

      function handleResize() {
        resize();
        buildParticles();
      }

      function handlePointerMove(event: MouseEvent) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      }

      function handlePointerLeave() {
        mouse.x = null;
        mouse.y = null;
      }

      resize();
      buildParticles();
      animate();

      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseout", handlePointerLeave);

      cleanups.push(() => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("mouseout", handlePointerLeave);
      });
    }
  }

  const typingElement = root.querySelector<HTMLElement>("[data-tpl-typing-text='true']");
  const rawTitles = typingElement?.dataset.titles;

  if (typingElement && rawTitles) {
    let titles: string[] = [];

    try {
      const parsed = JSON.parse(rawTitles);
      titles = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
    } catch (error) {
      console.error("Failed to parse typing titles:", error);
    }

    if (titles.length > 0) {
      if (titles.length === 1) {
        typingElement.textContent = titles[0];
      } else {
        let timeoutId = 0;
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        typingElement.textContent = "";

        const type = () => {
          const currentText = titles[textIndex] ?? "";

          if (isDeleting) {
            charIndex = Math.max(charIndex - 1, 0);
          } else {
            charIndex = Math.min(charIndex + 1, currentText.length);
          }

          typingElement.textContent = currentText.slice(0, charIndex);

          let delay = isDeleting ? 40 : 80;

          if (!isDeleting && charIndex === currentText.length) {
            delay = 2000;
            isDeleting = true;
          } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % titles.length;
            delay = 500;
          }

          timeoutId = window.setTimeout(type, delay);
        };

        type();

        cleanups.push(() => {
          window.clearTimeout(timeoutId);
        });
      }
    }
  }

  const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal='true']"));

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
            }, index * 100);

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        },
      );

      revealElements.forEach((element) => observer.observe(element));
      cleanups.push(() => observer.disconnect());
    }
  }

  const navToggle = root.querySelector<HTMLButtonElement>("[data-tpl-nav-toggle='true']");
  const navLinksContainer = root.querySelector<HTMLElement>("[data-tpl-nav-links='true']");
  const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-tpl-nav-link='true']"));

  if (navToggle && navLinksContainer) {
    const handleToggle = () => {
      navToggle.classList.toggle(styles.navToggleActive);
      navLinksContainer.classList.toggle(styles.navLinksOpen);
    };

    navToggle.addEventListener("click", handleToggle);

    cleanups.push(() => {
      navToggle.removeEventListener("click", handleToggle);
    });
  }

  if (navToggle && navLinksContainer && navLinks.length > 0) {
    const closeMenu = () => {
      navToggle.classList.remove(styles.navToggleActive);
      navLinksContainer.classList.remove(styles.navLinksOpen);
    };

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    cleanups.push(() => {
      navLinks.forEach((link) => link.removeEventListener("click", closeMenu));
    });
  }

  const navbar = root.querySelector<HTMLElement>("[data-tpl-navbar='true']");
  const sections = Array.from(root.querySelectorAll<HTMLElement>("section[id]"));

  if (navbar && navLinks.length > 0 && sections.length > 0) {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = "home";

      navbar.style.background = scrollY > 50 ? "rgba(10, 10, 26, 0.95)" : "rgba(10, 10, 26, 0.8)";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;

        if (scrollY >= sectionTop) {
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

    cleanups.push(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  }

  const scrollAnchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));

  if (scrollAnchors.length > 0) {
    const anchorCleanups = scrollAnchors.map((anchor) => {
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

        const navHeightValue = Number.parseInt(getComputedStyle(root).getPropertyValue("--tpl-nav-height"), 10);
        const navHeight = Number.isFinite(navHeightValue) ? navHeightValue : 70;

        window.scrollTo({
          top: Math.max(0, target.offsetTop - navHeight),
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

  const projectCards = Array.from(root.querySelectorAll<HTMLElement>("[data-tpl-project-card='true']"));

  if (projectCards.length > 0) {
    const cardCleanups = projectCards.map((card) => {
      const handlePointerMove = (event: MouseEvent) => {
        const rectangle = card.getBoundingClientRect();
        const x = ((event.clientX - rectangle.left) / rectangle.width) * 100;
        const y = ((event.clientY - rectangle.top) / rectangle.height) * 100;

        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      };

      card.addEventListener("mousemove", handlePointerMove);

      return () => {
        card.removeEventListener("mousemove", handlePointerMove);
      };
    });

    cleanups.push(() => {
      cardCleanups.forEach((cleanup) => cleanup());
    });
  }

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}
