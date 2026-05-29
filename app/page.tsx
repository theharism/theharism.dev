"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CONTACT_EMAIL = "chharis9999@gmail.com";

const NAV_LINKS = [
  { id: "home", label: "HOME" },
  { id: "projects", label: "PROJECTS" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "achievements", label: "AWARDS" },
  { id: "education", label: "ACADEMICS" },
];

export default function Home() {
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);
  const hardwareSceneRef = useRef<HTMLDivElement>(null);
  const snapContainerRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  // Neural network background
  useEffect(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let points: { x: number; y: number; vx: number; vy: number; p: number }[] =
      [];
    let frameId = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      points = [];
      for (let i = 0; i < 120; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          p: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#060e20";
      ctx.fillRect(0, 0, w, h);

      points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(173, 198, 255, ${
          0.15 + Math.sin(Date.now() * 0.001 + p.p) * 0.1
        })`;
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(173, 198, 255, ${
              (1 - d / 150) * 0.08
            })`;
            ctx.stroke();
          }
        }
      });
      frameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Three.js hardware scene
  useEffect(() => {
    const container = hardwareSceneRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x5de6ff, 2, 20);
    mainLight.position.set(2, 3, 4);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0xff00ff, 1, 15);
    accentLight.position.set(-3, -2, -2);
    scene.add(accentLight);

    const starGeo = new THREE.BufferGeometry();
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
    });
    const starPos: number[] = [];
    for (let i = 0; i < 1500; i++) {
      starPos.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
      );
    }
    starGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPos, 3),
    );
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const board = new THREE.Group();

    const pcbGeo = new THREE.BoxGeometry(3, 0.08, 2);
    const pcbMat = new THREE.MeshPhongMaterial({
      color: 0x0a1a0a,
      shininess: 80,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    board.add(pcb);

    const socGeo = new THREE.BoxGeometry(0.6, 0.15, 0.6);
    const socMat = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 100,
    });
    const soc = new THREE.Mesh(socGeo, socMat);
    soc.position.set(0.1, 0.1, 0.1);
    board.add(soc);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x5de6ff,
      transparent: true,
      opacity: 0.2,
    });
    for (let i = 0; i < 8; i++) {
      const linePoints = [
        new THREE.Vector3(
          -1.5 + Math.random() * 3,
          0.05,
          -1 + Math.random() * 2,
        ),
        new THREE.Vector3(
          -1.5 + Math.random() * 3,
          0.05,
          -1 + Math.random() * 2,
        ),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      board.add(new THREE.Line(lineGeo, lineMat));
    }

    scene.add(board);
    camera.position.z = 4.5;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.offsetX, y: e.offsetY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.offsetX - prevMouse.x;
        const deltaY = e.offsetY - prevMouse.y;
        board.rotation.y += deltaX * 0.01;
        board.rotation.x += deltaY * 0.01;
      }
      prevMouse = { x: e.offsetX, y: e.offsetY };
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isDragging) {
        board.rotation.y += 0.005;
        board.position.y = Math.sin(Date.now() * 0.001) * 0.05;
      }
      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      pcbGeo.dispose();
      socGeo.dispose();
      starGeo.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Reveal animations, tilt, magnetic buttons, scroll logistics
  useEffect(() => {
    const snapContainer = snapContainerRef.current;
    const moveToTopBtn = backToTopRef.current;
    if (!snapContainer || !moveToTopBtn) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const staggerItems =
      document.querySelectorAll<HTMLElement>(".stagger-item");
    const tiltCards = document.querySelectorAll<HTMLElement>(".tilt-card");
    const magneticBtns =
      document.querySelectorAll<HTMLElement>(".magnetic-btn");
    const reveals = document.querySelectorAll<HTMLElement>(".reveal");
    const navLinks = document.querySelectorAll<HTMLElement>("[data-nav]");
    const navSections =
      document.querySelectorAll<HTMLElement>("section[id]");

    // Staggered hero reveal
    const timers: number[] = [];
    const startTimer = window.setTimeout(() => {
      staggerItems.forEach((item, index) => {
        timers.push(
          window.setTimeout(() => item.classList.add("visible"), index * 150),
        );
      });
    }, 100);

    // 3D tilt effect
    const onTilt = (e: MouseEvent) => {
      if (reduceMotion.matches) return;
      const xPos = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPos = (e.clientY / window.innerHeight - 0.5) * 2;
      tiltCards.forEach((card) => {
        const intensity = Number(card.dataset.tiltIntensity ?? 1);
        const rotateX = yPos * -10 * intensity;
        const rotateY = xPos * 10 * intensity;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };
    document.addEventListener("mousemove", onTilt);

    // Magnetic buttons
    const magneticHandlers: {
      el: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }[] = [];
    magneticBtns.forEach((btn) => {
      const move = (e: MouseEvent) => {
        if (reduceMotion.matches) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      };
      const leave = () => {
        btn.style.transform = "translate(0px, 0px)";
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      magneticHandlers.push({ el: btn, move, leave });
    });

    // Scroll reveal
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.15 },
    );
    reveals.forEach((reveal) => revealObserver.observe(reveal));

    // Back-to-top + nav active state
    const onScroll = () => {
      const st = snapContainer.scrollTop;
      moveToTopBtn.classList.toggle("visible", st > 500);

      let current = "";
      navSections.forEach((section) => {
        if (st >= section.offsetTop - 250) current = section.id;
      });
      navLinks.forEach((link) => {
        const active = link.dataset.nav === current;
        link.classList.toggle("text-primary", active);
        link.classList.toggle("text-on-surface-variant", !active);
      });
    };
    snapContainer.addEventListener("scroll", onScroll);

    return () => {
      window.clearTimeout(startTimer);
      timers.forEach((t) => window.clearTimeout(t));
      document.removeEventListener("mousemove", onTilt);
      magneticHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
      revealObserver.disconnect();
      snapContainer.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    snapContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <canvas id="neural-canvas" ref={neuralCanvasRef} />

      {/* Back to Top */}
      <button
        id="move-to-top"
        ref={backToTopRef}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-10 right-10 z-[70] w-14 h-14 glass-card rounded-full flex items-center justify-center text-primary group hover:border-primary/50 transition-all shadow-2xl"
      >
        <span className="material-symbols-outlined transition-transform group-hover:-translate-y-1">
          north
        </span>
      </button>

      <header className="fixed top-0 w-full z-50 glass-nav">
        <nav className="flex justify-between items-center gap-4 px-margin-mobile sm:px-gutter py-5 max-w-container-max mx-auto">
          <a
            className="font-display-lg text-[20px] font-extrabold text-primary tracking-[-0.05em] uppercase flex items-center shrink-0 whitespace-nowrap"
            href="#home"
          >
            M. HARIS
            <span className="hidden sm:inline text-on-surface-variant/40 font-light ml-2 tracking-normal text-[14px]">
              // PORTFOLIO
            </span>
          </a>
          <div className="hidden lg:flex gap-10 items-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                data-nav={link.id}
                className="text-on-surface-variant font-label-caps text-[12px] hover:text-primary transition-all relative group"
                href={`#${link.id}`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <a
            className="shrink-0 whitespace-nowrap bg-primary text-on-primary font-bold px-5 sm:px-8 py-2.5 rounded-full text-xs uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_25px_rgba(173,198,255,0.4)] active:scale-95 transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)]"
            href="#contact"
          >
            Let&apos;s Talk
          </a>
        </nav>
      </header>

      <div className="snap-container" ref={snapContainerRef}>
        {/* 1. Home */}
        <section className="snap-section" id="home">
          <div className="max-w-container-max mx-auto px-gutter grid lg:grid-cols-2 gap-stack-xl items-center w-full py-12">
            <div className="space-y-stack-md">
              <div className="flex items-center gap-3 mb-4 stagger-item">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_12px_#5de6ff]" />
                <span className="font-code-sm text-xs text-secondary uppercase tracking-[0.2em]">
                  Full Stack Developer &amp; Robotics Enthusiast
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-[1.05] stagger-item">
                Building the future of <br />
                <span className="text-gradient">software and hardware</span>
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-xl opacity-80 mt-6 leading-relaxed stagger-item">
                I&apos;m Muhammad Haris. I specialize in bridging the gap
                between high-performance cloud systems and physical
                intelligence through IoT and custom hardware.
              </p>
              <div className="flex flex-wrap gap-6 pt-10 stagger-item">
                <a
                  className="magnetic-btn tech-glow-btn bg-primary text-on-primary font-bold px-10 py-5 rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  href="#contact"
                >
                  Get in touch
                  <span className="material-symbols-outlined text-lg">
                    mail
                  </span>
                </a>
                <a
                  className="magnetic-btn glass-card text-on-surface hover:border-primary/40 px-10 py-5 rounded-xl transition-all inline-block group"
                  href="#projects"
                >
                  View Projects
                  <span className="material-symbols-outlined align-middle ml-2 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
            <div className="relative order-first lg:order-last h-[400px] lg:h-[600px] flex items-center justify-center stagger-item">
              <div
                className="w-full h-full rounded-[40px] overflow-hidden glass-card relative group transition-transform duration-700 hover:scale-[1.02] tilt-card floating"
                id="hardware-scene"
                ref={hardwareSceneRef}
              >
                <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                  <div className="px-3 py-1 bg-background/60 backdrop-blur rounded-full border border-outline-variant/30 text-[10px] font-code-sm text-secondary uppercase tracking-widest">
                    3D Hardware View
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 z-10 opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-code-sm text-secondary px-3 py-1.5 border border-secondary/20 rounded-lg">
                    DRAG TO ROTATE
                  </span>
                </div>
              </div>
              {/* Telemetry Dashboard */}
              <div
                className="absolute -bottom-6 -left-6 z-30 glass-card p-6 rounded-2xl border-secondary/20 hidden xl:block shadow-2xl tilt-card"
                data-tilt-intensity="0.5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-code-sm text-secondary uppercase tracking-[0.1em]">
                    System Status
                  </span>
                </div>
                <div className="flex gap-2 items-end h-12">
                  <div className="w-2 bg-secondary/20 h-[40%] animate-[pulse_1s_infinite]" />
                  <div className="w-2 bg-secondary/30 h-[70%] animate-[pulse_1.2s_infinite]" />
                  <div className="w-2 bg-secondary/50 h-[90%] animate-[pulse_0.8s_infinite]" />
                  <div className="w-2 bg-secondary/70 h-[55%] animate-[pulse_1.5s_infinite]" />
                  <div className="w-2 bg-secondary h-[100%] animate-[pulse_0.9s_infinite]" />
                </div>
                <div className="mt-4 flex justify-between text-[9px] font-code-sm text-on-surface-variant/40">
                  <span>LATENCY: 14MS</span>
                  <span>HEALTH: 100%</span>
                </div>
              </div>
            </div>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-scroll-pulse">
            <span className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-[0.4em]">
              Scroll
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-primary to-transparent" />
          </div>
        </section>

        {/* 2. Projects */}
        <section className="snap-section" id="projects">
          <div className="max-w-container-max mx-auto px-gutter grid lg:grid-cols-2 gap-section-gap items-center reveal py-24">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-10 bg-secondary/5 blur-[120px] rounded-full opacity-50" />
              <div className="aspect-video glass-card rounded-3xl flex items-center justify-center overflow-hidden border-secondary/20 shadow-2xl relative tilt-card">
                <span className="material-symbols-outlined text-[120px] text-secondary/10">
                  precision_manufacturing
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
                  <span className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm">
                    VIEW PROJECT
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-stack-md">
              <span className="font-code-sm text-secondary text-xs uppercase tracking-[0.4em]">
                IOT / ROBOTICS / SLAM
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
                Autonomous <br />
                <span className="text-gradient">Rover V1</span>
              </h2>
              <p className="font-body-lg text-on-surface-variant leading-relaxed opacity-80">
                Engineered a custom navigation system for a differential drive
                robot. Using ROS2 and LiDAR, the rover can navigate complex
                indoor environments with real-time obstacle avoidance and
                cloud-based mapping.
              </p>
              <div className="flex flex-wrap gap-3 pt-6">
                {["ROS2", "C++ / Python", "LiDAR"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 glass-card rounded-full font-code-sm text-secondary text-[10px] uppercase tracking-widest hover:border-secondary/50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="snap-section">
          <div className="max-w-container-max mx-auto px-gutter grid lg:grid-cols-12 gap-section-gap items-center reveal py-24">
            <div className="lg:col-span-5 space-y-stack-md">
              <span className="font-code-sm text-primary text-xs uppercase tracking-[0.4em]">
                FULL STACK SOLUTIONS
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
                Neural <br />
                <span className="text-gradient">Dashboard</span>
              </h2>
              <p className="font-body-lg text-on-surface-variant leading-relaxed opacity-80">
                A high-performance industrial platform designed to visualize
                data from over 50 IoT sensors. Built with React and Node.js, it
                offers sub-100ms latency and AI-driven data analysis.
              </p>
              <div className="flex flex-wrap gap-3 pt-6">
                {["Node.JS", "React", "Redis"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 glass-card rounded-full font-code-sm text-primary text-[10px] uppercase tracking-widest hover:border-primary/50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 relative">
              <div className="lg:ml-12 transform transition-transform duration-700">
                <div className="aspect-[16/10] glass-card rounded-3xl flex items-center justify-center overflow-hidden border-primary/20 shadow-[0_20px_80px_rgba(0,0,0,0.5)] tilt-card">
                  <span className="material-symbols-outlined text-[120px] text-primary/10">
                    cloud_sync
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Experience */}
        <section className="snap-section" id="experience">
          <div className="max-w-container-max mx-auto px-gutter w-full reveal py-24">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/20 pb-10">
              <div>
                <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tighter">
                  My <span className="text-primary">Journey</span>
                </h2>
                <p className="font-code-sm text-secondary text-xs uppercase tracking-[0.4em] mt-4">
                  Professional Experience
                </p>
              </div>
              <div className="mt-6 md:mt-0 font-code-sm text-on-surface-variant/40 text-xs">
                Total experience: 5+ Years
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="glass-card p-10 rounded-3xl border-l-[4px] border-primary group hover:bg-surface-container-high transition-all duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline-md text-on-surface text-[22px] mb-1">
                      Senior Systems Architect
                    </h3>
                    <p className="font-code-sm text-secondary text-sm">
                      Industrial Solutions Corp
                    </p>
                  </div>
                  <span className="font-code-sm text-on-surface-variant/50 text-[10px] border border-outline-variant/30 px-3 py-1 rounded-full whitespace-nowrap">
                    2023 - PRESENT
                  </span>
                </div>
                <ul className="text-on-surface-variant font-body-md space-y-4 opacity-80">
                  <li className="flex gap-4 group/li">
                    <span className="text-primary font-bold transition-transform group-hover/li:translate-x-1">
                      /
                    </span>
                    <span>
                      Architected automation pipelines processing 1M+ data
                      points daily using FastAPI.
                    </span>
                  </li>
                  <li className="flex gap-4 group/li">
                    <span className="text-primary font-bold transition-transform group-hover/li:translate-x-1">
                      /
                    </span>
                    <span>
                      Reduced system deployment time by 40% through
                      containerization.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="glass-card p-10 rounded-3xl border-l-[4px] border-outline-variant group hover:bg-surface-container-high transition-all duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline-md text-on-surface text-[22px] mb-1">
                      Full Stack Developer
                    </h3>
                    <p className="font-code-sm text-secondary text-sm">
                      TechVentures Startup
                    </p>
                  </div>
                  <span className="font-code-sm text-on-surface-variant/50 text-[10px] border border-outline-variant/30 px-3 py-1 rounded-full whitespace-nowrap">
                    2021 - 2023
                  </span>
                </div>
                <ul className="text-on-surface-variant font-body-md space-y-4 opacity-80">
                  <li className="flex gap-4 group/li">
                    <span className="text-primary font-bold transition-transform group-hover/li:translate-x-1">
                      /
                    </span>
                    <span>
                      Built responsive web apps for hardware management using
                      React.
                    </span>
                  </li>
                  <li className="flex gap-4 group/li">
                    <span className="text-primary font-bold transition-transform group-hover/li:translate-x-1">
                      /
                    </span>
                    <span>
                      Implemented secure authentication systems for hardware
                      fleets.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Achievements */}
        <section className="snap-section" id="achievements">
          <div className="max-w-container-max mx-auto px-gutter w-full reveal py-24">
            <div className="mb-16">
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tighter">
                Awards &amp; <span className="text-secondary">Certifications</span>
              </h2>
              <div className="h-1 w-24 bg-secondary mt-6 rounded-full" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                {[
                  { icon: "cloud_done", label: "AWS Architect" },
                  { icon: "memory", label: "NVIDIA Jetson" },
                  { icon: "engineering", label: "ROS Pro" },
                  { icon: "shield_lock", label: "SEC+ Certified" },
                ].map((cert) => (
                  <div
                    key={cert.label}
                    className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:-translate-y-2 transition-all group tilt-card"
                    data-tilt-intensity="0.3"
                  >
                    <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">
                      {cert.icon}
                    </span>
                    <h4 className="font-code-sm text-[10px] tracking-widest uppercase text-on-surface-variant">
                      {cert.label}
                    </h4>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2 glass-card p-10 rounded-3xl transition-colors hover:bg-surface-container-low duration-500">
                <h3 className="font-headline-md text-on-surface mb-8 flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary text-3xl animate-bounce">
                    emoji_events
                  </span>
                  Major Successes
                </h3>
                <div className="space-y-10">
                  {[
                    {
                      n: "01",
                      title: "Global Robotics Hackathon 2023",
                      text: "Won first prize for an efficient navigation algorithm used in dynamic indoor spaces.",
                    },
                    {
                      n: "02",
                      title: "Open Source Contributor",
                      text: "Top 5% contributor to the core ROS2 Navigation Stack architecture.",
                    },
                    {
                      n: "03",
                      title: "Keynote Speaker",
                      text: 'Presented "Edge Computing in Robotics" at the 2024 International IoT Summit.',
                    },
                  ].map((item) => (
                    <div key={item.n} className="flex gap-8 group">
                      <span className="font-display-lg text-3xl text-on-surface-variant/10 group-hover:text-secondary/40 transition-colors duration-500">
                        {item.n}
                      </span>
                      <div>
                        <h4 className="font-headline-md text-lg text-on-surface mb-1 group-hover:text-secondary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-on-surface-variant text-sm opacity-70">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Education */}
        <section className="snap-section" id="education">
          <div className="max-w-container-max mx-auto px-gutter w-full reveal py-24">
            <div className="mb-16 text-right">
              <p className="font-code-sm text-secondary text-xs uppercase tracking-[0.4em] mb-4">
                Academic Background
              </p>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tighter">
                Foundation of <span className="text-primary">Learning</span>
              </h2>
            </div>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gradient-to-b from-primary via-outline-variant/30 to-transparent hidden md:block" />
              <div className="grid md:grid-cols-2 gap-12 mb-16 relative">
                <div className="md:text-right md:pr-20 group">
                  <div className="glass-card p-10 rounded-3xl group-hover:border-primary/40 group-hover:-translate-x-2 transition-all duration-500">
                    <span className="font-code-sm text-secondary text-xs block mb-4">
                      2021 — 2023
                    </span>
                    <h3 className="font-headline-md text-on-surface text-xl mb-1 group-hover:text-primary transition-colors">
                      MS in Robotics &amp; AI
                    </h3>
                    <p className="text-primary font-bold text-sm mb-4">
                      Technical University of Innovation
                    </p>
                    <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
                      Thesis on real-time object tracking for autonomous fleet
                      coordination.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-10">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_#adc6ff] border-4 border-background" />
                </div>
                <div />
              </div>
              <div className="grid md:grid-cols-2 gap-12 relative">
                <div />
                <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-10">
                  <div className="w-3 h-3 rounded-full bg-outline-variant border-4 border-background" />
                </div>
                <div className="md:pl-20 group">
                  <div className="glass-card p-10 rounded-3xl group-hover:border-primary/40 group-hover:translate-x-2 transition-all duration-500">
                    <span className="font-code-sm text-secondary text-xs block mb-4">
                      2017 — 2021
                    </span>
                    <h3 className="font-headline-md text-on-surface text-xl mb-1 group-hover:text-primary transition-colors">
                      BS in Mechanical Engineering
                    </h3>
                    <p className="text-primary font-bold text-sm mb-4">
                      National Engineering Institute
                    </p>
                    <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
                      Focused on kinematics and control systems. Graduated with
                      honors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Contact */}
        <section className="snap-section" id="contact">
          <div className="max-w-container-max mx-auto px-gutter w-full reveal py-24">
            <div className="relative glass-card p-16 md:p-24 rounded-[40px] overflow-hidden text-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8 tracking-tighter stagger-item">
                Ready to <span className="text-gradient">Collaborate?</span>
              </h2>
              <p className="font-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed stagger-item">
                Looking for a Lead Developer or Robotics Engineer to build
                next-generation systems? <br /> I&apos;d love to hear about your
                project.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="tech-glow-btn magnetic-btn inline-block bg-white text-black font-extrabold px-16 py-5 rounded-2xl text-lg uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all shadow-2xl stagger-item"
              >
                Get in touch
              </a>
            </div>
            <footer className="mt-24 border-t border-outline-variant/10 pt-12 pb-20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="font-display-lg text-xl font-black text-primary tracking-tighter">
                  M. HARIS
                </div>
                <div className="text-center font-code-sm text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em]">
                  © {new Date().getFullYear()} MUHAMMAD HARIS // ENGINEERED FOR
                  IMPACT
                </div>
                <div className="flex gap-10">
                  {[
                    { label: "GITHUB", href: "#" },
                    { label: "LINKEDIN", href: "#" },
                    { label: "EMAIL", href: `mailto:${CONTACT_EMAIL}` },
                  ].map((link) => (
                    <a
                      key={link.label}
                      className="font-label-caps text-[10px] text-on-surface-variant hover:text-secondary transition-colors relative group"
                      href={link.href}
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all group-hover:w-full" />
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </>
  );
}
