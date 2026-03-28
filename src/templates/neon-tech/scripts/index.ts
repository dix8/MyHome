import styles from "@/templates/neon-tech/styles.module.css";
import type { TemplateScriptContext } from "@/templates/types";

type Particle = {
  color: string;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

function numberConfig(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanConfig(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function mountTemplateScripts(context: TemplateScriptContext) {
  const { config, root } = context;
  const cleanups: Array<() => void> = [];

  const canvas = root.querySelector<HTMLCanvasElement>("[data-neon-particles='true']");
  const enableParticles = booleanConfig(config.enableParticles, true);
  const particleDensity = numberConfig(config.particleDensity, 72);

  if (canvas && enableParticles) {
    const context2d = canvas.getContext("2d");

    if (context2d) {
      const drawingCanvas = canvas;
      const drawingContext = context2d;
      const mouse = { radius: 160, x: null as number | null, y: null as number | null };
      const colors = [
        "rgba(34, 211, 238, 0.48)",
        "rgba(139, 92, 246, 0.34)",
        "rgba(255, 255, 255, 0.24)",
      ];
      const maxDistance = 128;
      let particles: Particle[] = [];
      let frameId = 0;

      function resize() {
        drawingCanvas.width = window.innerWidth;
        drawingCanvas.height = window.innerHeight;
      }

      function buildParticles() {
        const count = window.innerWidth < 768 ? Math.max(30, Math.floor(particleDensity * 0.55)) : particleDensity;

        particles = Array.from({ length: count }, () => ({
          x: Math.random() * drawingCanvas.width,
          y: Math.random() * drawingCanvas.height,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          size: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
        }));
      }

      function draw() {
        drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

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
              particle.x += deltaX * force * 0.018;
              particle.y += deltaY * force * 0.018;
            }
          }

          drawingContext.beginPath();
          drawingContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          drawingContext.fillStyle = particle.color;
          drawingContext.fill();

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

            const opacity = (1 - distance / maxDistance) * 0.12;
            drawingContext.beginPath();
            drawingContext.moveTo(particle.x, particle.y);
            drawingContext.lineTo(target.x, target.y);
            drawingContext.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
            drawingContext.lineWidth = 0.5;
            drawingContext.stroke();
          }
        });

        frameId = window.requestAnimationFrame(draw);
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
      draw();

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

  const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-neon-reveal='true']"));

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
            }, index * 90);

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -60px 0px",
        },
      );

      revealElements.forEach((element) => observer.observe(element));
      cleanups.push(() => observer.disconnect());
    }
  }

  const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-neon-nav-link='true']"));
  const navbar = root.querySelector<HTMLElement>("[data-neon-navbar='true']");
  const sections = Array.from(root.querySelectorAll<HTMLElement>("section[id]"));

  if (navLinks.length > 0 && navbar && sections.length > 0) {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = "home";

      navbar.style.background = scrollY > 40 ? "rgba(7, 14, 27, 0.86)" : "rgba(7, 14, 27, 0.74)";

      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - 120) {
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
          top: Math.max(0, target.offsetTop - 88),
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

  const projectCards = Array.from(root.querySelectorAll<HTMLElement>("[data-neon-project-card='true']"));

  if (projectCards.length > 0) {
    const cardCleanups = projectCards.map((card) => {
      const handleMove = (event: MouseEvent) => {
        const rectangle = card.getBoundingClientRect();
        const x = ((event.clientX - rectangle.left) / rectangle.width) * 100;
        const y = ((event.clientY - rectangle.top) / rectangle.height) * 100;

        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      };

      card.addEventListener("mousemove", handleMove);

      return () => {
        card.removeEventListener("mousemove", handleMove);
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
