import { useEffect, useRef } from "react";

export default function CursorTail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (isReducedMotion || isCoarsePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let animationFrameId = 0;
    let devicePixelRatioCurrent = 1;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      devicePixelRatioCurrent = dpr;
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const trailLength = 18;
    const points = Array.from({ length: trailLength }, () => ({ x: -100, y: -100 }));
    let mouseX = -100;
    let mouseY = -100;
    let lastMoveTs = performance.now();

    function handleMove(e) {
      const x = e.clientX;
      const y = e.clientY;
      mouseX = x;
      mouseY = y;
      lastMoveTs = performance.now();
    }

    window.addEventListener("mousemove", handleMove, { passive: true });

    function draw() {
      const now = performance.now();
      // Follow smoothing
      const head = points[0];
      head.x += (mouseX - head.x) * 0.35;
      head.y += (mouseY - head.y) * 0.35;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const p = points[i];
        p.x += (prev.x - p.x) * 0.28;
        p.y += (prev.y - p.y) * 0.28;
      }

      // Clear
      ctx.clearRect(0, 0, canvas.width / devicePixelRatioCurrent, canvas.height / devicePixelRatioCurrent);

      // Draw fading circles
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        const t = i / (points.length - 1);
        const radius = 2 + 7 * (1 - t);
        const alpha = 0.08 + 0.28 * (1 - t);
        ctx.beginPath();
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`; // indigo-500
        ctx.shadowBlur = 12 * (1 - t);
        ctx.shadowColor = "rgba(99, 102, 241, 0.55)";
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // If idle for long, slowly retract towards off-screen
      if (now - lastMoveTs > 4000) {
        mouseX += (-100 - mouseX) * 0.02;
        mouseY += (-100 - mouseY) * 0.02;
      }

      animationFrameId = window.requestAnimationFrame(draw);
    }

    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="cursorCanvas" aria-hidden="true" />
  );
} 