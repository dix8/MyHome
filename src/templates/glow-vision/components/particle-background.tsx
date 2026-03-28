"use client";

import { useEffect, useRef } from "react";

import styles from "@/templates/glow-vision/styles.module.css";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
};

export function ParticleBackground({
  density,
  enabled,
}: {
  density: number;
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const drawingContext = context;

    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };
    const colors = [
      "rgba(0, 240, 255, 0.5)",
      "rgba(124, 58, 237, 0.4)",
      "rgba(255, 255, 255, 0.3)",
    ];
    const maxDistance = 120;
    let particles: Particle[] = [];
    let frameId = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function buildParticles() {
      const count = window.innerWidth < 768 ? Math.max(24, Math.floor(density * 0.5)) : density;

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
      }));
    }

    function draw() {
      drawingContext.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
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

          const opacity = (1 - distance / maxDistance) * 0.15;
          drawingContext.beginPath();
          drawingContext.moveTo(particle.x, particle.y);
          drawingContext.lineTo(target.x, target.y);
          drawingContext.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
          drawingContext.lineWidth = 0.5;
          drawingContext.stroke();
        }
      });

      frameId = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event: MouseEvent) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    function handlePointerLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    function handleResize() {
      resize();
      buildParticles();
    }

    resize();
    buildParticles();
    draw();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseout", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseout", handlePointerLeave);
    };
  }, [density, enabled]);

  if (!enabled) {
    return null;
  }

  return <canvas aria-hidden className={styles.particles} ref={canvasRef} />;
}
