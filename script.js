/* ══════════════════════════════════════════════════════════════
   script.js — Vemula Sai Charan | RTL Design Portfolio
   Features:
     1. Navbar: solid background on scroll
     2. Scroll-reveal via IntersectionObserver
     3. Animated counters (hero stats)
     4. Typing effect (hero subtitle)
     5. Circuit canvas background (hero)
     6. Mobile nav toggle
     7. Active nav link highlight on scroll
     8. Project card subtle 3D tilt
     9. Skill chip pulse on click
    10. Contact form validation
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────────────────
     1. NAVBAR — becomes solid/elevated once user scrolls down
  ───────────────────────────────────────────────────────── */
  const mainNav = document.getElementById('mainNav');

  function handleNavScroll() {
    mainNav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  /* ─────────────────────────────────────────────────────────
     2. SCROLL-REVEAL — adds `.visible` class when element
        enters the viewport; fires only once per element
  ───────────────────────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────────────────────
     3. ANIMATED COUNTERS — smoothly count up hero stat numbers
        (only numeric values; skips strings like "2+")
  ───────────────────────────────────────────────────────── */
  function animateCounter(el, target, decimals, duration) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = Math.min((timestamp - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      el.textContent = (eased * target).toFixed(decimals);
      if (elapsed < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const heroStats = document.querySelector('.hero-stats');

  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-num').forEach(numEl => {
            const raw = numEl.textContent.trim();
            // Skip tokens like "2+" that contain non-numeric characters
            if (/^[\d.]+$/.test(raw)) {
              const target   = parseFloat(raw);
              const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
              animateCounter(numEl, target, decimals, 1600);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsObserver.observe(heroStats);
  }


  /* ─────────────────────────────────────────────────────────
     4. TYPING EFFECT — cycles through role phrases in the
        hero subtitle (.hero-subtitle)
  ───────────────────────────────────────────────────────── */
  const subtitleEl = document.querySelector('#hero .hero-subtitle');

  if (subtitleEl) {
    const phrases = [
      '// VLSI & Digital Design Engineer',
      '// RTL Design · Verilog · FPGA',
      '// Embedded Systems Developer',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;

    function typeLoop() {
      const current = phrases[phraseIdx];

      if (!deleting) {
        subtitleEl.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typeLoop, 2000); // pause before deleting
          return;
        }
      } else {
        subtitleEl.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting  = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }

      setTimeout(typeLoop, deleting ? 40 : 75);
    }

    // Delay start until initial reveal animation settles
    setTimeout(typeLoop, 1000);
  }


  /* ─────────────────────────────────────────────────────────
     5. CIRCUIT CANVAS — lightweight animated circuit-trace
        background drawn on <canvas id="circuitCanvas">
  ───────────────────────────────────────────────────────── */
  const canvas = document.getElementById('circuitCanvas');

  if (canvas) {
    const ctx   = canvas.getContext('2d');
    let nodes   = [];
    let animId  = null;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildNodes();
    }

    function buildNodes() {
      nodes = [];
      const count = Math.floor((canvas.width * canvas.height) / 22000);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          vx:    (Math.random() - 0.5) * 0.3,
          vy:    (Math.random() - 0.5) * 0.3,
          size:  Math.random() * 1.5 + 0.5,
        });
      }
    }

    function drawCircuit() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      const connectDist = 120;

      // Draw edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * 0.18;
            ctx.strokeStyle = `rgba(0, 229, 190, ${alpha})`;
            ctx.lineWidth   = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            // Orthogonal "trace" look: go horizontal then vertical
            ctx.lineTo(nodes[j].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      nodes.forEach(n => {
        ctx.fillStyle = 'rgba(0, 229, 190, 0.35)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(drawCircuit);
    }

    // Pause animation when hero section is not visible (performance)
    const heroSection = document.getElementById('hero');
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animId) animId = requestAnimationFrame(drawCircuit);
        } else {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0 });

    if (heroSection) canvasObserver.observe(heroSection);

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();
  }


  /* ─────────────────────────────────────────────────────────
     6. MOBILE NAV TOGGLE — hamburger open / close
  ───────────────────────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a nav link is tapped
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     7. ACTIVE NAV HIGHLIGHT — marks the current section's
        nav link as active while scrolling
  ───────────────────────────────────────────────────────── */
  const sections    = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let currentId = '';
    const scrollY = window.scrollY + 120; // offset for fixed nav height

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        currentId = section.id;
      }
    });

    allNavLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // run once on load


  /* ─────────────────────────────────────────────────────────
     8. SMOOTH SCROLL — for navbar anchor links
        (native CSS smooth-scroll fallback if needed)
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = mainNav ? mainNav.offsetHeight : 70;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* ─────────────────────────────────────────────────────────
     9. PROJECT CARD 3D TILT — subtle perspective tilt on
        mouse move; resets on mouse leave
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform  = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });


  /* ─────────────────────────────────────────────────────────
     10. SKILL CHIP PULSE — brief scale animation on click
         to give tactile feedback; professional and minimal
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.skill-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      chip.style.transform  = 'scale(0.92)';
      chip.style.boxShadow  = '0 0 14px rgba(0, 229, 190, 0.4)';
      setTimeout(() => {
        chip.style.transform = '';
        chip.style.boxShadow = '';
      }, 180);
    });
  });


  /* ─────────────────────────────────────────────────────────
     11. CONTACT FORM VALIDATION — inline error messages,
         real-time clearing, and success confirmation
  ───────────────────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const nameInput   = document.getElementById('fName');
  const emailInput  = document.getElementById('fEmail');
  const msgInput    = document.getElementById('fMsg');
  const errName     = document.getElementById('errName');
  const errEmail    = document.getElementById('errEmail');
  const errMsg      = document.getElementById('errMsg');
  const successEl   = document.getElementById('formSuccess');
  const sendBtn     = document.getElementById('sendBtn');

  if (contactForm) {
    function setError(el, msg)  { if (el) el.textContent = msg; }
    function clearError(el)     { if (el) el.textContent = ''; }
    function isValidEmail(val)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }

    // Clear errors in real-time as user types
    nameInput?.addEventListener('input',  () => clearError(errName));
    emailInput?.addEventListener('input', () => clearError(errEmail));
    msgInput?.addEventListener('input',   () => clearError(errMsg));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      const name  = nameInput?.value.trim()  ?? '';
      const email = emailInput?.value.trim() ?? '';
      const msg   = msgInput?.value.trim()   ?? '';

      if (!name) {
        setError(errName, '⚠ Please enter your name.');
        valid = false;
      }
      if (!email) {
        setError(errEmail, '⚠ Please enter your email.');
        valid = false;
      } else if (!isValidEmail(email)) {
        setError(errEmail, '⚠ Enter a valid email address.');
        valid = false;
      }
      if (!msg) {
        setError(errMsg, '⚠ Please enter a message.');
        valid = false;
      } else if (msg.length < 10) {
        setError(errMsg, '⚠ Message must be at least 10 characters.');
        valid = false;
      }

      if (!valid) return;

      // Simulate send (no backend)
      sendBtn.disabled     = true;
      sendBtn.textContent  = 'Sending…';

      setTimeout(() => {
        contactForm.reset();
        sendBtn.disabled  = false;
        sendBtn.innerHTML = 'Send Message <i class="bi bi-send-fill"></i>';

        if (successEl) {
          successEl.textContent   = '✓ Message sent! I\'ll get back to you soon.';
          successEl.style.display = 'block';
          setTimeout(() => { successEl.style.display = 'none'; }, 5000);
        }
      }, 1400);
    });
  }

});
