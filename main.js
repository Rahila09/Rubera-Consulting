/* ============================================================
   RUBERA CONSULTING LIMITED — MAIN JAVASCRIPT
   Handles: Navigation, Scroll Reveal, Counters, Forms, Toast
   ============================================================ */

'use strict';

/* ── NAVIGATION ───────────────────────────────────────────── */
(function initNav() {
  const nav        = document.getElementById('main-nav');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileNav  = document.getElementById('mobile-nav');
  const mobileLinks= document.querySelectorAll('.nav-mobile-links a');

  if (!nav) return;

  // Scroll behaviour
  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link
  function setActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href.includes(path) && path !== '');
    });
  }
  setActiveLink();
})();

/* ── SCROLL REVEAL ────────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── COUNTER ANIMATION ────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.counter);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2000;
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current  = target * ease;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── EXPERTISE BARS ───────────────────────────────────────── */
(function initExpertiseBars() {
  const bars = document.querySelectorAll('.expertise-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const pct  = fill.dataset.width || '0';
        setTimeout(() => { fill.style.width = pct + '%'; }, 200);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ── CONTACT FORM ─────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, message) {
    const group = field.closest('.form-group');
    if (!group) return;
    let err = group.querySelector('.form-error');
    if (!err) { err = document.createElement('span'); err.className = 'form-error'; group.appendChild(err); }
    err.textContent = message;
    field.style.borderColor = '#EF4444';
  }

  function clearError(field) {
    const group = field.closest('.form-group');
    if (!group) return;
    const err = group.querySelector('.form-error');
    if (err) err.textContent = '';
    field.style.borderColor = '';
  }

  // Live validation
  form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        showError(field, 'This field is required.');
      } else if (field.type === 'email' && field.value && !validateEmail(field.value)) {
        showError(field, 'Please enter a valid email address.');
      } else {
        clearError(field);
      }
    });
    field.addEventListener('input', () => { if (field.value) clearError(field); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('.form-input[required], .form-textarea[required]').forEach(field => {
      if (!field.value.trim()) { showError(field, 'This field is required.'); valid = false; }
      else if (field.type === 'email' && !validateEmail(field.value)) { showError(field, 'Invalid email.'); valid = false; }
    });

    if (!valid) return;

    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;

    // Simulate async submission
    await new Promise(r => setTimeout(r, 1500));

    btn.innerHTML = original;
    btn.disabled = false;
    form.reset();
    showToast('Message sent! We\'ll be in touch within 24 hours.', 'success');
  });
})();

/* ── TOAST ────────────────────────────────────────────────── */
function showToast(message, type = '') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => { toast.classList.remove('show'); }, 4500);
}
window.showToast = showToast;

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 90;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── PAGE ENTRANCE ANIMATION ──────────────────────────────── */
(function pageEntrance() {
  document.body.classList.add('page-fade');
})();

/* ── MARQUEE CLIENTS (pause on hover already via CSS) ─────── */
(function initMarquee() {
  const track = document.querySelector('.clients-track');
  if (!track) return;
  // Clone children for infinite effect
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);
})();

/* ── SERVICES FILTER (projects page) ─────────────────────── */
(function initFilter() {
  const btns  = document.querySelectorAll('[data-filter-btn]');
  const items = document.querySelectorAll('[data-filter-item]');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filterBtn;

      items.forEach(item => {
        const show = cat === 'all' || item.dataset.filterItem === cat;
        item.style.opacity = '0';
        item.style.transform = 'scale(0.96)';
        if (!show) { item.style.display = 'none'; return; }
        item.style.display = '';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 20);
        item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      });
    });
  });
})();

/* ── ACCORDION / FAQ ──────────────────────────────────────── */
(function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const header  = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const c = i.querySelector('.accordion-content');
        if (c) c.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    content.style.maxHeight = '0';
    content.style.overflow  = 'hidden';
    content.style.transition = 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)';
  });
})();

/* ── LAZY IMAGE PLACEHOLDER ───────────────────────────────── */
document.querySelectorAll('img[data-src]').forEach(img => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
});
