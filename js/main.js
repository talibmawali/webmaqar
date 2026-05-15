/* ============================================================
   MAQAR Studio — Site interactions
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   EMAIL CONFIG  (EmailJS — https://emailjs.com)
   Fill these in after creating your free EmailJS account.
   See setup instructions below the MEDIA config.
   ════════════════════════════════════════════════════════════ */
const EMAILJS_CFG = {
  publicKey  : 'YOUR_PUBLIC_KEY',   // Account → General → Public Key
  serviceId  : 'YOUR_SERVICE_ID',   // Email Services → your Gmail service ID
  templateId : 'YOUR_TEMPLATE_ID',  // Email Templates → your template ID
  toEmail    : 'maqarstudio@gmail.com',
};
/* ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   MEDIA CONFIG
   Drop your image / video paths here — leave '' to keep the
   colour-gradient placeholder.

   Supported formats for images: jpg, jpeg, png, webp, avif
   Paths are relative to index.html (e.g. 'assets/photo.jpg')
   ════════════════════════════════════════════════════════════ */
const MEDIA = {

  /* ── Intro video ─────────────────────────────────────────── */
  intro: {
    video : 'assets/maqar-intro-scrub.mp4',
  },

  /* ── Work grid cards + project modal slides ──────────────────
     cover  → image shown on the card thumbnail
     slides → one image per modal slide (must match slide count)
     Leave any value as '' to show the colour gradient instead. */
  projects: {
    'Residence Al Khuwair': {
      cover : './assets/Interior-A.png',
      slides: ['./assets/Interior-A.png', '', ''],
    },
    'Brand Portal UI': {
      cover : '',
      slides: ['', '', ''],
    },
    'Identity System Vol.1': {
      cover : '',
      slides: ['', '', ''],
    },
    'The Courtyard House': {
      cover : '',
      slides: ['', '', ''],
    },
    '3D Visualization Suite': {
      cover : '',
      slides: ['', '', ''],
    },
    'Exhibition Catalog': {
      cover : '',
      slides: ['', '', ''],
    },
    'Pavilion 07': {
      cover : '',
      slides: ['', '', ''],
    },
    'Interactive Space': {
      cover : '',
      slides: ['', '', ''],
    },
    'Wayfinding System': {
      cover : '',
      slides: ['', '', ''],
    },
    'Salalah Apartment': {
      cover : '',
      slides: ['', '', ''],
    },
    'Atelier Workspace': {
      cover : '',
      slides: ['', '', ''],
    },
    'Hospitality Suite': {
      cover : '',
      slides: ['', '', ''],
    },
  },

  /* ── Achievement panel backgrounds (index 0 – 7) ────────────
     Order matches the star tips clockwise from top.           */
  achievements: [
    '',   // 0 · Best Architecture Practice
    '',   // 1 · Sustainable Build Excellence
    '',   // 2 · Young Practice of the Year
    '',   // 3 · Heritage Design Award
    '',   // 4 · Interior Project of the Year
    '',   // 5 · Brand Identity Excellence
    '',   // 6 · Urban Innovation Prize
    '',   // 7 · Client Satisfaction Award
  ],

  /* ── Team photos ─────────────────────────────────────────────
     Update the src= in index.html directly, OR set paths here
     and they will be applied on load (id must match).         */
  team: {
    'ceo-photo'  : 'assets/ceo-talib.png',
    'coo-photo'  : 'assets/coo-alaiham.png',
    'exec-photo' : 'assets/exec3.png',
    'cfo-photo'  : 'assets/CFO-Ayyan.png',
  },

};
/* ════════════════════════════════════════════════════════════ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------
     1) Intro video — autoplays once, replays on logo click,
        navy panel fades in when video ends
     ------------------------------------------------------------ */
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');

  const setupIntro = () => {
    if (!intro || !video) return;

    intro.classList.add('is-revealed');

    // Video ends → mark ended state
    const markEnded = () => {
      intro.classList.add('is-ended');
    };

    const playFromStart = () => {
      intro.classList.remove('is-ended');
      try { video.currentTime = 0; } catch (_) {}
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        // Autoplay blocked (common on iOS / low-power mode) → show the
        // ended state immediately so the door / title aren't gated on a
        // video that can't play.
        p.catch(() => markEnded());
      }
    };

    video.addEventListener('ended', markEnded);

    // Kick off playback explicitly so we can catch autoplay rejections
    // that the `autoplay` attribute swallows silently on iOS / low-power.
    const initial = video.play();
    if (initial && typeof initial.catch === 'function') {
      initial.catch(() => markEnded());
    }

    // Fallback: if the video is still stuck near 0 after a moment, treat
    // it as ended so the door / title overlay aren't gated on it.
    setTimeout(() => {
      if (intro.classList.contains('is-ended')) return;
      if (video.paused || video.currentTime < 0.1) markEnded();
    }, 2500);

    const navMark = document.querySelector('.nav-mark');
    if (navMark) {
      navMark.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        playFromStart();
      });
    }

    if (prefersReduced) {
      try { video.pause(); } catch (_) {}
      intro.classList.add('is-ended');
    }

    // Door overlay (mobile only): fades with scroll once the video has ended.
    const introDoor = document.getElementById('introDoor');
    if (introDoor) {
      let doorScrollActive = false;
      const updateDoor = () => {
        if (!intro.classList.contains('is-ended')) return;
        const fadeRange = (intro.offsetHeight || window.innerHeight) * 0.85;
        const opacity = Math.max(0, Math.min(1, 1 - window.scrollY / fadeRange));
        if (!doorScrollActive && window.scrollY > 0) {
          introDoor.style.transition = 'none';
          doorScrollActive = true;
        }
        introDoor.style.opacity = String(opacity);
      };
      window.addEventListener('scroll', updateDoor, { passive: true });
      window.addEventListener('resize', updateDoor);
    }
  };

  setupIntro();

  /* ------------------------------------------------------------
     2) Reveal-on-scroll for non-intro sections
     ------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = `${Math.min(i, 4) * 60}ms`;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------
     3) Nav: fade in + hamburger drawer
     ------------------------------------------------------------ */
  const nav         = document.getElementById('nav');
  const navHamburger = document.getElementById('navHamburger');
  const navDrawer    = document.getElementById('navDrawer');

  const onNavScroll = () => {
    if (!nav || !intro) return;
    const rect = intro.getBoundingClientRect();
    const past = rect.bottom < window.innerHeight * 0.85;
    nav.classList.toggle('is-visible', past);
    nav.classList.toggle('is-stuck', window.scrollY > 120 && past);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  if (navHamburger && navDrawer) {
    const openDrawer = () => {
      navHamburger.classList.add('is-open');
      navHamburger.setAttribute('aria-expanded', 'true');
      navDrawer.classList.add('is-open');
      navDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      navHamburger.classList.remove('is-open');
      navHamburger.setAttribute('aria-expanded', 'false');
      navDrawer.classList.remove('is-open');
      navDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    navHamburger.addEventListener('click', () => {
      navHamburger.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });
    const navDrawerClose = document.getElementById('navDrawerClose');
    if (navDrawerClose) {
      navDrawerClose.addEventListener('click', closeDrawer);
    }
    navDrawer.querySelectorAll('[data-drawer-link]').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ------------------------------------------------------------
     4) Custom cursor + hover hooks + magnetic pull
     ------------------------------------------------------------ */
  const cursor  = document.querySelector('.cursor');
  const diamond = document.querySelector('.cursor-diamond');

  if (cursor && diamond && isFinePointer && !prefersReduced) {
    let mx = -200, my = -200;
    let cx = mx, cy = my;
    let running = false;

    const loop = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      diamond.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      const settled = Math.abs(mx - cx) < 0.05 && Math.abs(my - cy) < 0.05;
      if (settled) { running = false; return; }
      requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });

    // 4-phase origami cursor animation on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .card, [data-magnetic], input, textarea');
    let phaseTimers = [];

    const clearPhases = () => { phaseTimers.forEach(clearTimeout); phaseTimers = []; };
    const setPhase = (n) => {
      cursor.classList.remove('phase-1', 'phase-2', 'phase-3');
      if (n > 0) cursor.classList.add(`phase-${n}`);
    };

    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        clearPhases();
        setPhase(1);
        phaseTimers.push(setTimeout(() => setPhase(2), 110));
        phaseTimers.push(setTimeout(() => setPhase(3), 220));
      });
      el.addEventListener('mouseleave', () => {
        clearPhases();
        setPhase(2);
        phaseTimers.push(setTimeout(() => setPhase(1), 110));
        phaseTimers.push(setTimeout(() => setPhase(0), 220));
      });
    });

    // Magnetic pull
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.22;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------
     5) Portfolio tabs — animated indicator + filtering
     ------------------------------------------------------------ */
  const tabs       = document.querySelectorAll('.work-tabs .tab');
  const indicator  = document.querySelector('.tab-indicator');
  const grid       = document.getElementById('workGrid');
  const cards      = grid ? Array.from(grid.querySelectorAll('.card')) : [];

  const moveIndicator = (tab) => {
    if (!indicator || !tab) return;
    // offsetLeft is relative to offsetParent — unaffected by scroll position
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
  };

  const filterCards = (cat) => {
    cards.forEach((card, i) => {
      const match = cat === 'all' || card.dataset.cat === cat;
      if (match) {
        card.classList.remove('is-hidden', 'is-out');
        // staggered re-entry
        card.style.transitionDelay = `${i * 40}ms`;
        requestAnimationFrame(() => card.classList.add('is-in'));
      } else {
        card.classList.add('is-out');
        // remove from layout after fade
        setTimeout(() => card.classList.add('is-hidden'), 380);
      }
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      moveIndicator(tab);
      filterCards(tab.dataset.filter);
      // Scroll active tab into view on mobile
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  const placeIndicator = () => {
    const active = document.querySelector('.work-tabs .tab.is-active');
    if (active) moveIndicator(active);
  };
  // Run after layout, after fonts, and on resize.
  requestAnimationFrame(placeIndicator);
  window.addEventListener('load', placeIndicator);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(placeIndicator);
  }
  window.addEventListener('resize', placeIndicator);

  /* ------------------------------------------------------------
     6) Card entrance + 3D tilt
     ------------------------------------------------------------ */
  if ('IntersectionObserver' in window && cards.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const idx = cards.indexOf(e.target);
          e.target.style.transitionDelay = `${idx * 70}ms`;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('is-in'));
  }

  if (isFinePointer && !prefersReduced) {
    cards.forEach(card => {
      const media = card.querySelector('[data-tilt]');
      if (!media) return;
      const max = 8; // max tilt in deg
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const ry = (x - 0.5) *  max * 2;
        const rx = (0.5 - y) *  max * 2;
        media.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        media.style.setProperty('--mx', `${x * 100}%`);
        media.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        media.style.transform = 'rotateX(0deg) rotateY(0deg)';
        media.style.setProperty('--mx', `50%`);
        media.style.setProperty('--my', `50%`);
      });
    });
  }

  /* ------------------------------------------------------------
     7) Forms — EmailJS sending
     ------------------------------------------------------------ */

  // Initialise EmailJS once
  if (typeof emailjs !== 'undefined' && EMAILJS_CFG.publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_CFG.publicKey);
  }

  // Shared send helper — returns a Promise
  const sendEmail = (subject, fromName, fromEmail, messageBody) => {
    if (typeof emailjs === 'undefined') return Promise.reject('EmailJS not loaded');
    return emailjs.send(EMAILJS_CFG.serviceId, EMAILJS_CFG.templateId, {
      to_email   : EMAILJS_CFG.toEmail,
      from_name  : fromName,
      from_email : fromEmail,
      reply_to   : fromEmail,
      subject    : subject,
      message    : messageBody,
    });
  };

  // ── Contact form ─────────────────────────────────────────────
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data    = new FormData(form);
      const name    = (data.get('name')    || '').toString().trim();
      const email   = (data.get('email')   || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        status.textContent = 'Please complete all fields.';
        status.style.color = 'var(--c-rust)';
        return;
      }

      const btn = form.querySelector('[type=submit]');
      if (btn) btn.disabled = true;
      status.textContent = 'Sending…';
      status.style.color = 'var(--c-ink-soft)';

      try {
        await sendEmail(`Website enquiry from ${name}`, name, email, message);
        status.textContent = 'Message sent — we\'ll be in touch shortly.';
        status.style.color = 'var(--c-sand)';
        form.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        status.textContent = 'Something went wrong. Please email us directly at maqarstudio@gmail.com';
        status.style.color = 'var(--c-rust)';
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------
     8) Project modal — click-to-expand with carousel
     ------------------------------------------------------------ */
  const PROJ = {
    'Residence Al Khuwair': {
      code:'A · 01', client:'Private Client', year:'2024', location:'Al Khuwair, Muscat', size:'480 m²', type:'Architecture · Residential',
      colors:[['#1E2B4B','#2A3D6B'],['#2A3D6B','#3D240B'],['#1A2540','#0E1A30']],
      slides:[
        {title:'Residence Al Khuwair', para:'A contemporary family residence rooted in Omani spatial tradition. The design balances privacy and openness through a series of interlocking courtyards that regulate light and air throughout the day.'},
        {title:'Interior Volumes', para:'Internal spaces flow seamlessly from formal reception to intimate living areas. Natural materials — limestone, carved timber, and woven textiles — ground the contemporary form in local craft.'},
        {title:'Landscape & Threshold', para:'The boundary between interior and exterior dissolves across shaded terraces and planted passages, creating a residence that breathes with the Muscat climate.'},
      ]
    },
    'Brand Portal UI': {
      code:'D · 01', client:'Corporate Client', year:'2025', location:'Muscat, Oman', size:'Digital Platform', type:'Digital · Web Platform',
      colors:[['#BF4A27','#A3242C'],['#A3242C','#1E2B4B'],['#1E2B4B','#BF4A27']],
      slides:[
        {title:'Brand Portal UI', para:'A centralized digital platform enabling brand teams to access, manage, and deploy identity assets with precision. Built on a design system that enforces consistency at every touchpoint.'},
        {title:'Design System', para:'The system establishes a rigorous typographic scale, color architecture, and component library — ensuring brand integrity across digital and physical applications.'},
        {title:'User Experience', para:'Every interaction was mapped through a lens of clarity and speed. The portal reduces asset retrieval time by 70%, giving creative teams more time for meaningful work.'},
      ]
    },
    'Identity System Vol.1': {
      code:'G · 01', client:'Local Brand', year:'2024', location:'Oman', size:'Brand Identity', type:'Graphic · Brand',
      colors:[['#D5CB71','#BF4A27'],['#BF4A27','#1E2B4B'],['#D5CB71','#1E2B4B']],
      slides:[
        {title:'Identity System Vol.1', para:'A comprehensive visual identity rooted in Omani geometric traditions. The mark derives from architectural motifs found in historic Omani forts, abstracted into a contemporary symbol.'},
        {title:'Typography & Colour', para:'A bilingual typographic system pairs a modern grotesque with a refined Arabic typeface, ensuring the identity speaks equally to local and international audiences.'},
        {title:'Applications', para:'Applied across print collateral, signage, packaging, and digital media — proving versatility while maintaining rigorous visual consistency at every scale.'},
      ]
    },
    'The Courtyard House': {
      code:'A · 02', client:'Private Client', year:'2023', location:'Muscat, Oman', size:'620 m²', type:'Architecture · Residential',
      colors:[['#3D240B','#1E2B4B'],['#1E2B4B','#3D240B'],['#3D240B','#5A3820']],
      slides:[
        {title:'The Courtyard House', para:'Inspired by the traditional Omani dar, this residence organises living spaces around a central courtyard that becomes the heart of family life — a shaded, planted sanctuary from the desert heat.'},
        {title:'Spatial Sequence', para:'Visitors move through a sequence of increasingly intimate spaces, each framed by the courtyard. The journey from public to private is choreographed with quiet precision.'},
        {title:'Material Honesty', para:'Load-bearing stone walls, exposed concrete soffits, and hand-crafted wooden screens — each material is used truthfully, celebrating its inherent properties.'},
      ]
    },
    '3D Visualization Suite': {
      code:'D · 02', client:'Internal Tool', year:'2025', location:'Muscat, Oman', size:'Digital', type:'Digital · Tooling',
      colors:[['#71CBD5','#1E2B4B'],['#1E2B4B','#71CBD5'],['#2A8A94','#1E2B4B']],
      slides:[
        {title:'3D Visualization Suite', para:'A bespoke visualization pipeline developed in-house to produce photorealistic renderings of architectural and interior projects, integrating seamlessly with the studio\'s design workflow.'},
        {title:'Rendering Quality', para:'Using physically-based rendering and real-world material libraries, the suite produces images that communicate texture, light, and materiality with exceptional fidelity.'},
        {title:'Workflow Integration', para:'The suite plugs directly into the studio\'s BIM environment, eliminating manual model preparation and reducing visualization turnaround from days to hours.'},
      ]
    },
    'Exhibition Catalog': {
      code:'G · 02', client:'Cultural Institution', year:'2024', location:'Muscat, Oman', size:'128 pages', type:'Graphic · Print',
      colors:[['#F7EDE9','#D5CB71'],['#D5CB71','#BF4A27'],['#BF4A27','#F7EDE9']],
      slides:[
        {title:'Exhibition Catalog', para:'A printed catalog documenting a major exhibition of contemporary Omani art and design. The publication balances rigorous editorial design with generous white space that lets the work breathe.'},
        {title:'Editorial Design', para:'A flexible grid system accommodates diverse artwork formats — from intimate drawings to large-scale installations — while maintaining a coherent visual rhythm across 128 pages.'},
        {title:'Production', para:'Printed on uncoated stock with spot varnish details, the catalog itself becomes an object of craft — a physical artifact worthy of the ideas it documents.'},
      ]
    },
    'Pavilion 07': {
      code:'A · 03', client:'Cultural Authority', year:'2025', location:'Muscat, Oman', size:'1 200 m²', type:'Architecture · Cultural',
      colors:[['#A3242C','#3D240B'],['#3D240B','#A3242C'],['#BF4A27','#A3242C']],
      slides:[
        {title:'Pavilion 07', para:'A temporary cultural pavilion designed as a bold architectural statement. Its origami-inspired form folds steel and glass into a structure that appears both grounded and in flight.'},
        {title:'Structure & Skin', para:'A lightweight steel diagrid carries a facade of folded metal panels, each angled to catch and reflect Muscat\'s intense desert light differently throughout the day.'},
        {title:'Interior Experience', para:'Inside, a single fluid space hosts exhibitions, performances, and public gatherings — a democratic space that invites all of Oman to participate in cultural life.'},
      ]
    },
    'Interactive Space': {
      code:'D · 03', client:'Cultural Client', year:'2024', location:'Muscat, Oman', size:'Installation', type:'Digital · Installation',
      colors:[['#1E2B4B','#71CBD5'],['#71CBD5','#1E2B4B'],['#2A3D6B','#71CBD5']],
      slides:[
        {title:'Interactive Space', para:'A sensor-driven digital installation that responds to visitor movement, translating bodily presence into patterns of light and sound inspired by Omani weaving traditions.'},
        {title:'Technology Layer', para:'Depth cameras and custom software track visitor trajectories in real time, mapping movement onto generative visuals projected across the walls, floor, and ceiling.'},
        {title:'Cultural Translation', para:'The underlying algorithms are seeded with patterns drawn from Omani textile archives — making the invisible heritage of craft visible in a language that speaks to all generations.'},
      ]
    },
    'Wayfinding System': {
      code:'G · 03', client:'Public Institution', year:'2024', location:'Oman', size:'Environmental', type:'Graphic · Environmental',
      colors:[['#BF4A27','#F6ED7F'],['#F6ED7F','#BF4A27'],['#BF4A27','#1E2B4B']],
      slides:[
        {title:'Wayfinding System', para:'A comprehensive wayfinding and signage system guiding visitors intuitively through complex spatial sequences while reinforcing the institution\'s visual identity at every turn.'},
        {title:'Sign Typology', para:'Seven sign types — from monumental totems to tactile floor guides — cover every orientation scenario, designed to be manufactured and installed efficiently at scale.'},
        {title:'Bilingual Navigation', para:'Arabic and English are treated with equal typographic weight, ensuring the system serves all users with equal clarity and dignity across the entire estate.'},
      ]
    },
    'Salalah Apartment': {
      code:'I · 01', client:'Private Client', year:'2024', location:'Salalah, Oman', size:'210 m²', type:'Interior · Residential',
      colors:[['#3D240B','#D5CB71'],['#D5CB71','#3D240B'],['#3D240B','#BF4A27']],
      slides:[
        {title:'Salalah Apartment', para:'A residential interior designed to capture the lush, green character of Salalah. Natural materials and a cool palette create a sanctuary that responds to its coastal, monsoon setting.'},
        {title:'Living Spaces', para:'Open-plan living and dining areas are connected by a central axis that frames views to the landscape beyond, with furniture selected to encourage conversation and rest in equal measure.'},
        {title:'Detail & Craft', para:'Local craftspeople produced the carved timber screens, handwoven textiles, and ceramic vessels that give the apartment its unmistakably Omani character.'},
      ]
    },
    'Atelier Workspace': {
      code:'I · 02', client:'Creative Studio', year:'2025', location:'Muscat, Oman', size:'340 m²', type:'Interior · Studio',
      colors:[['#F7EDE9','#3D240B'],['#3D240B','#F7EDE9'],['#BF4A27','#F7EDE9']],
      slides:[
        {title:'Atelier Workspace', para:'A creative studio workspace designed to inspire without distraction. The design creates zones for focused individual work, collaborative ideation, and client presentation within a single coherent language.'},
        {title:'Material Palette', para:'Warm concrete floors, whitewashed plaster walls, and exposed black steel frames create an honest material palette that lets the work of its inhabitants take center stage.'},
        {title:'Flexibility', para:'Movable partition walls and a modular furniture system allow the studio to transform from a 12-person open plan to three private project rooms in under an hour.'},
      ]
    },
    'Hospitality Suite': {
      code:'I · 03', client:'Hospitality Group', year:'2025', location:'Muscat, Oman', size:'580 m²', type:'Interior · Hospitality',
      colors:[['#1E2B4B','#BF4A27'],['#BF4A27','#1E2B4B'],['#1E2B4B','#A3242C']],
      slides:[
        {title:'Hospitality Suite', para:'A luxury hospitality suite that redefines the guest experience through the lens of Omani generosity. Spaces for arrival, repose, dining, and bathing are each given their full ceremonial weight.'},
        {title:'Arrival Sequence', para:'The guest journey begins at a dramatic entrance that reveals, through a sequence of threshold moments, the full spatial drama of the suite — nothing is given away at once.'},
        {title:'Luxury in Detail', para:'Bespoke furniture, hand-laid mosaic floors, and custom lighting — all produced by Omani artisans — make this suite a showcase of what Omani luxury means in the 21st century.'},
      ]
    },
  };

  // ── Modal elements ──
  const projModal   = document.getElementById('projModal');
  const projInner   = document.getElementById('projModalInner');
  const projTrack   = document.getElementById('projSlidesTrack');
  const projLeft    = document.getElementById('projInfoLeft');
  const projRight   = document.getElementById('projInfoRight');
  const projClose   = document.getElementById('projClose');
  const projBackdrop= document.getElementById('projBackdrop');
  const dirCursor   = document.getElementById('projDirCursor');

  let projSlide = 0, projTotal = 3, projData = null, openCardRect = null;
  let dirCx = -200, dirCy = -200, dirRunning = false;

  const projCounterCur = projModal.querySelector('.proj-counter-cur');
  const projCounterTot = projModal.querySelector('.proj-counter-tot');

  function setInnerRect({ left, top, width, height }) {
    projInner.style.left   = `${left}px`;
    projInner.style.top    = `${top}px`;
    projInner.style.width  = `${width}px`;
    projInner.style.height = `${height}px`;
  }

  function buildSlides(proj) {
    projTrack.innerHTML = '';
    projTrack.style.transform = 'translateX(0)';
    const mediaCfg = MEDIA.projects[proj.title] || {};
    proj.slides.forEach((s, i) => {
      const [c1, c2] = proj.colors[i] || proj.colors[0];
      const imgPath   = (mediaCfg.slides || [])[i] || '';
      const bgStyle   = imgPath
        ? `background-image:url('${imgPath}')`
        : `background:linear-gradient(135deg,${c1},${c2})`;
      const el = document.createElement('div');
      el.className = 'proj-slide';
      el.innerHTML = `<div class="proj-slide-media" style="${bgStyle}"><span class="proj-slide-label">${imgPath ? '' : proj.code + ' · 0' + (i+1)}</span></div>`;
      projTrack.appendChild(el);
    });
  }

  function buildLeft(proj) {
    projLeft.innerHTML = `
      <div class="proj-detail"><span class="proj-detail-label">Client</span><span class="proj-detail-value">${proj.client}</span></div>
      <div class="proj-detail"><span class="proj-detail-label">Type</span><span class="proj-detail-value">${proj.type}</span></div>
      <div class="proj-detail"><span class="proj-detail-label">Location</span><span class="proj-detail-value">${proj.location}</span></div>
      <div class="proj-detail"><span class="proj-detail-label">Size</span><span class="proj-detail-value">${proj.size}</span></div>
      <div class="proj-detail"><span class="proj-detail-label">Year</span><span class="proj-detail-value">${proj.year}</span></div>`;
  }

  function updateRight() {
    const s = projData.slides[projSlide];
    projRight.innerHTML = `<h3 class="proj-slide-title">${s.title}</h3><p class="proj-slide-para">${s.para}</p>`;
  }

  function updateCounter() {
    projCounterCur.textContent = String(projSlide + 1).padStart(2,'0');
    projCounterTot.textContent = String(projTotal).padStart(2,'0');
  }

  function goSlide(n) {
    if (!projData || n < 0 || n >= projTotal) return;
    projSlide = n;
    projTrack.style.transform = `translateX(-${n * 100}%)`;
    updateCounter();
    updateRight();
  }

  function openModal(card) {
    const h3   = card.querySelector('h3');
    const key  = h3 ? h3.textContent.trim() : '';
    projData   = PROJ[key];
    if (!projData) return;
    projData.title = key;   // store key so buildSlides can look up MEDIA

    projSlide = 0;
    projTotal = projData.slides.length;
    openCardRect = card.getBoundingClientRect();

    buildSlides(projData);
    buildLeft(projData);
    updateRight();
    updateCounter();

    // Start at card position, invisible so it doesn't flash from previous position
    projInner.style.opacity = '0';
    setInnerRect(openCardRect);
    projInner.style.borderRadius = '8px';
    projModal.setAttribute('aria-hidden','false');
    projModal.classList.add('is-open');
    document.body.classList.add('modal-open');

    // Animate to centre and fade in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const tw = Math.min(vw * 0.92, 1140);
      const th = Math.min(vh * 0.88, 860);
      setInnerRect({ left:(vw-tw)/2, top:(vh-th)/2, width:tw, height:th });
      projInner.style.borderRadius = '14px';
      projInner.style.opacity = '1';
    }));

    setTimeout(() => projModal.classList.add('info-visible'), 580);
  }

  function closeModal() {
    projModal.classList.remove('info-visible');
    setTimeout(() => {
      // Fade out and shrink back to card simultaneously
      projInner.style.opacity = '0';
      if (openCardRect) {
        setInnerRect(openCardRect);
        projInner.style.borderRadius = '8px';
      }
      setTimeout(() => {
        projModal.classList.remove('is-open');
        projModal.setAttribute('aria-hidden','true');
        document.body.classList.remove('modal-open');
      }, 400);
    }, 180);
  }

  // Apply cover images from MEDIA config + bind click
  document.querySelectorAll('.card').forEach(card => {
    card.style.cursor = 'none';
    // Apply cover image if configured
    const title   = card.querySelector('h3')?.textContent.trim() || '';
    const cover   = (MEDIA.projects[title] || {}).cover || '';
    if (cover) {
      const media = card.querySelector('.card-media');
      if (media) media.style.backgroundImage = `url('${cover}')`;
    }
    card.addEventListener('click', () => openModal(card));
  });

  // Apply team photos from MEDIA config
  Object.entries(MEDIA.team || {}).forEach(([id, src]) => {
    if (!src) return;
    const el = document.getElementById(id);
    if (el) el.src = src;
  });

  // Click slide area to advance/retreat
  projInner.addEventListener('click', e => {
    if (e.target.closest('.proj-close') || e.target.closest('.proj-info-panel')) return;
    const x = e.clientX - projInner.getBoundingClientRect().left;
    x > projInner.offsetWidth / 2 ? goSlide(projSlide + 1) : goSlide(projSlide - 1);
  });

  // Close triggers
  projClose.addEventListener('click', closeModal);
  projBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && projModal.classList.contains('is-open')) closeModal(); });

  // Touch swipe
  let touchX0 = 0;
  projInner.addEventListener('touchstart', e => { touchX0 = e.touches[0].clientX; }, { passive:true });
  projInner.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX0;
    if (Math.abs(dx) > 48) dx < 0 ? goSlide(projSlide + 1) : goSlide(projSlide - 1);
  });

  // Directional cursor tracking
  let dmx = -200, dmy = -200, dcx = -200, dcy = -200, dcRunning = false;
  const dcLoop = () => {
    dcx += (dmx - dcx) * 0.2;
    dcy += (dmy - dcy) * 0.2;
    dirCursor.style.transform = `translate3d(${dcx}px,${dcy}px,0)`;
    const settled = Math.abs(dmx-dcx)<0.05 && Math.abs(dmy-dcy)<0.05;
    if (settled) { dcRunning = false; return; }
    requestAnimationFrame(dcLoop);
  };
  projModal.addEventListener('mousemove', e => {
    dmx = e.clientX; dmy = e.clientY;
    if (!dcRunning) { dcRunning = true; requestAnimationFrame(dcLoop); }
    // direction based on slide area half
    const r = projInner.getBoundingClientRect();
    const inSlideArea = e.clientY < r.top + r.height * 0.62;
    if (inSlideArea) {
      const leftHalf = e.clientX < r.left + r.width / 2;
      dirCursor.classList.toggle('dir-left', leftHalf && projSlide > 0);
    }
  });

  /* ------------------------------------------------------------
     8b) Achievements — fixed origami star + interactive image spots
     ------------------------------------------------------------ */
  const ACH = [
    {
      title: 'Best Architecture Practice',
      award: 'Oman Design Awards — 2024',
      para: 'Recognised as the leading architecture practice in Oman for design excellence, spatial innovation, and commitment to embedding Omani cultural identity within contemporary built environments.',
      colors: ['#1E2B4B', '#BF4A27']
    },
    {
      title: 'Sustainable Build Excellence',
      award: 'Gulf Construction Summit — 2023',
      para: 'Awarded for exemplary integration of passive design strategies, local materials, and low-carbon construction methodologies across three major residential and commercial projects.',
      colors: ['#2A3D6B', '#8B6914']
    },
    {
      title: 'Young Practice of the Year',
      award: 'Arab Architecture Forum — 2023',
      para: 'Selected from over 200 nominees across the Arab world for exceptional growth, originality of approach, and the quality of work produced within the first five years of practice.',
      colors: ['#BF4A27', '#1E2B4B']
    },
    {
      title: 'Heritage Design Award',
      award: 'Muscat Municipality — 2022',
      para: 'Honoured for the sensitive restoration and adaptive reuse of a 19th-century falaj irrigation house in Old Muscat, blending heritage conservation with contemporary community use.',
      colors: ['#3D2010', '#BF4A27']
    },
    {
      title: 'Interior Project of the Year',
      award: 'Middle East Property Awards — 2024',
      para: 'The Masirah Bay Retreat interior was recognised for its masterful layering of natural textures, handcrafted furniture, and spatial sequences that honour the Omani concept of hospitality.',
      colors: ['#1A3A2A', '#2A6B4B']
    },
    {
      title: 'Brand Identity Excellence',
      award: 'Design Arabia — 2023',
      para: 'Our identity system for a Muscat-based heritage brand received the gold award for its bilingual typographic rigour, geometric mark rooted in Omani fort architecture, and cross-platform consistency.',
      colors: ['#4A1E3D', '#8B2A6B']
    },
    {
      title: 'Urban Innovation Prize',
      award: 'Oman Chamber of Commerce — 2022',
      para: 'Awarded for the Nizwa Mixed-Use Masterplan concept — a walkable, shaded urban district designed around the traditional Omani souk model, integrating contemporary retail and public space.',
      colors: ['#1E3A4B', '#2A7BA0']
    },
    {
      title: 'Client Satisfaction Award',
      award: 'ArcReview Middle East — 2024',
      para: 'Voted by clients as the most trusted architecture firm in Oman, recognising a 98% project satisfaction rate, on-time delivery record, and long-term partnership approach to every commission.',
      colors: ['#2B1E4B', '#5A4A8B']
    }
  ];

  const achSection    = document.getElementById('achievements');
  const achStarWrap   = document.getElementById('achStarWrap');
  const achPanel      = document.getElementById('achPanel');
  const achPanelImg   = document.getElementById('achPanelImg');
  const achPanelTitle = document.getElementById('achPanelTitle');
  const achPanelAward = document.getElementById('achPanelAward');
  const achPanelPara  = document.getElementById('achPanelPara');
  const achPanelClose = document.getElementById('achPanelClose');

  if (achSection && achStarWrap) {
    let achActive = -1;

    function openAch(idx) {
      achActive = idx;
      const a       = ACH[idx];
      const imgPath = (MEDIA.achievements || [])[idx] || '';
      if (imgPath) {
        achPanelImg.style.backgroundImage = `url('${imgPath}')`;
        achPanelImg.style.backgroundSize  = 'cover';
        achPanelImg.style.backgroundPosition = 'center';
      } else {
        achPanelImg.style.backgroundImage = `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`;
        achPanelImg.style.backgroundSize  = 'auto';
      }
      achPanelAward.textContent = a.award;
      achPanelTitle.textContent = a.title;
      achPanelPara.textContent  = a.para;
      achPanel.setAttribute('aria-hidden', 'false');
      achSection.classList.add('ach-expanded');
    }

    function closeAch() {
      achActive = -1;
      achSection.classList.remove('ach-expanded');
      achPanel.setAttribute('aria-hidden', 'true');
    }

    achStarWrap.querySelectorAll('.ach-anchor').forEach((anchor, i) => {
      const btn = anchor.querySelector('.ach-dot-btn');

      // Desktop: blur star + highlight this dot on hover
      anchor.addEventListener('mouseenter', () => {
        achStarWrap.classList.add('dot-hovered');
        anchor.classList.add('is-hovered');
      });
      anchor.addEventListener('mouseleave', () => {
        achStarWrap.classList.remove('dot-hovered');
        anchor.classList.remove('is-hovered');
      });

      // Click / tap: blur briefly → flip pip → open panel
      btn.addEventListener('click', () => {
        // Show blur on mobile (no hover) for same visual feedback
        achStarWrap.classList.add('dot-hovered');
        anchor.classList.add('is-hovered', 'is-flipping');
        // Star spins smoothly, then panel emerges like a memory.
        achSection.classList.add('is-zooming');
        setTimeout(() => openAch(i), 280);
        setTimeout(() => achSection.classList.remove('is-zooming'), 700);
        setTimeout(() => {
          anchor.classList.remove('is-flipping');
          achStarWrap.classList.remove('dot-hovered');
          anchor.classList.remove('is-hovered');
        }, 650);
      });
    });

    achPanelClose.addEventListener('click', closeAch);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && achActive >= 0) closeAch();
    });
  }

  /* ------------------------------------------------------------
     8.5) Career application modal — Resume / Internship / Collaboration
     ------------------------------------------------------------ */
  const CAREER_FORMS = {
    resume: {
      eyebrow: 'Careers — Resume Submission',
      title: 'Send us your resume',
      sub: 'We review every application personally. Add a portfolio link if you have one.',
      subject: 'Resume Submission',
      fields: [
        { name: 'name',       label: 'Full Name',                 type: 'text',     required: true },
        { name: 'email',      label: 'Email',                     type: 'email',    required: true },
        { name: 'phone',      label: 'Phone',                     type: 'tel' },
        { name: 'role',       label: 'Role you are applying for', type: 'text' },
        { name: 'experience', label: 'Years of experience',       type: 'text' },
        { name: 'portfolio',  label: 'Portfolio link',            type: 'url' },
        { name: 'message',    label: 'Cover note',                type: 'textarea', full: true },
        { name: 'file',       label: 'Attach CV (PDF/DOC)',       type: 'file', accept: '.pdf,.doc,.docx', full: true },
      ],
    },
    internship: {
      eyebrow: 'Careers — Internship',
      title: 'Apply for an internship',
      sub: 'Open to students and recent graduates. Tell us a little about yourself.',
      subject: 'Internship Application',
      fields: [
        { name: 'name',       label: 'Full Name',           type: 'text',     required: true },
        { name: 'email',      label: 'Email',               type: 'email',    required: true },
        { name: 'phone',      label: 'Phone',               type: 'tel' },
        { name: 'university', label: 'University',          type: 'text',     required: true },
        { name: 'year',       label: 'Year of study',       type: 'text' },
        { name: 'discipline', label: 'Discipline / Major',  type: 'text' },
        { name: 'message',    label: 'Why MAQAR?',          type: 'textarea', full: true },
        { name: 'file',       label: 'Attach CV / portfolio', type: 'file', accept: '.pdf,.doc,.docx', full: true },
      ],
    },
    collaboration: {
      eyebrow: 'Careers — Collaboration',
      title: 'Propose a collaboration',
      sub: 'Studios, brands, and institutions — pitch a project and we will get back to you.',
      subject: 'Collaboration Proposal',
      fields: [
        { name: 'name',        label: 'Your Name',            type: 'text',  required: true },
        { name: 'email',       label: 'Email',                type: 'email', required: true },
        { name: 'company',     label: 'Company / Studio',     type: 'text',  required: true },
        { name: 'project',     label: 'Project name',         type: 'text' },
        { name: 'projectType', label: 'Project type',         type: 'text' },
        { name: 'timeline',    label: 'Timeline',             type: 'text' },
        { name: 'budget',      label: 'Budget range',         type: 'text' },
        { name: 'details',     label: 'Project details',      type: 'textarea', required: true, full: true },
        { name: 'file',        label: 'Attach brief or RFP',  type: 'file', accept: '.pdf,.doc,.docx', full: true },
      ],
    },
  };

  const careerModal     = document.getElementById('careerModal');
  const careerForm      = document.getElementById('careerForm');
  const careerEyebrow   = document.getElementById('careerModalEyebrow');
  const careerTitle     = document.getElementById('careerModalTitle');
  const careerSub       = document.getElementById('careerModalSub');
  const careerStatus    = document.getElementById('careerModalStatus');
  const careerBackdrop  = document.getElementById('careerModalBackdrop');
  const careerCloseBtn  = document.getElementById('careerModalClose');

  if (careerModal && careerForm) {
    let currentType = null;

    const renderForm = (type) => {
      const cfg = CAREER_FORMS[type];
      careerEyebrow.textContent = cfg.eyebrow;
      careerTitle.textContent   = cfg.title;
      careerSub.textContent     = cfg.sub;
      careerStatus.textContent  = '';
      careerForm.innerHTML = cfg.fields.map(f => {
        const id = `cf_${type}_${f.name}`;
        const required = f.required ? 'required' : '';
        const cls = `career-field${f.full ? ' career-field--full' : ''}`;
        if (f.type === 'textarea') {
          return `<div class="${cls}"><label for="${id}">${f.label}${f.required ? ' *' : ''}</label>` +
                 `<textarea id="${id}" name="${f.name}" rows="4" ${required}></textarea></div>`;
        }
        if (f.type === 'file') {
          return `<div class="${cls}"><label for="${id}">${f.label}</label>` +
                 `<input id="${id}" name="${f.name}" type="file" accept="${f.accept || ''}"></div>`;
        }
        return `<div class="${cls}"><label for="${id}">${f.label}${f.required ? ' *' : ''}</label>` +
               `<input id="${id}" name="${f.name}" type="${f.type}" ${required}></div>`;
      }).join('') +
      `<button type="submit" class="career-submit">Submit application</button>`;
    };

    const openCareer = (type) => {
      if (!CAREER_FORMS[type]) return;
      currentType = type;
      renderForm(type);
      careerModal.classList.add('is-open');
      careerModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeCareer = () => {
      careerModal.classList.remove('is-open');
      careerModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      currentType = null;
    };

    document.querySelectorAll('[data-career-type]').forEach(btn => {
      btn.addEventListener('click', () => openCareer(btn.dataset.careerType));
    });
    careerCloseBtn.addEventListener('click', closeCareer);
    careerBackdrop.addEventListener('click', closeCareer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && careerModal.classList.contains('is-open')) closeCareer();
    });

    careerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentType) return;
      const cfg  = CAREER_FORMS[currentType];
      const data = new FormData(careerForm);

      // Required-field check
      for (const f of cfg.fields) {
        if (!f.required) continue;
        const v = (data.get(f.name) || '').toString().trim();
        if (!v) {
          careerStatus.textContent = `Please complete: ${f.label}`;
          careerStatus.style.color = 'var(--c-rust)';
          return;
        }
      }

      // Build message body + grab applicant email
      const lines = [];
      let applicantEmail = '';
      let applicantName  = '';
      let attachmentNote = '';
      for (const f of cfg.fields) {
        const val = data.get(f.name);
        if (f.type === 'file') {
          if (val && val.name) attachmentNote = val.name;
        } else {
          const s = (val || '').toString().trim();
          if (s) {
            lines.push(`${f.label}: ${s}`);
            if (f.name === 'email') applicantEmail = s;
            if (f.name === 'name')  applicantName  = s;
          }
        }
      }
      if (attachmentNote) {
        lines.push('', `CV / Portfolio filename: ${attachmentNote}`);
      }

      const submitBtn = careerForm.querySelector('[type=submit]');
      if (submitBtn) submitBtn.disabled = true;
      careerStatus.textContent = 'Sending…';
      careerStatus.style.color = 'var(--c-ink-soft)';

      try {
        await sendEmail(
          cfg.subject,
          applicantName  || 'MAQAR Website',
          applicantEmail || EMAILJS_CFG.toEmail,
          lines.join('\n')
        );
        careerStatus.style.color = 'green';
        careerStatus.textContent = attachmentNote
          ? `Submitted! Please also email your CV/Portfolio to ${EMAILJS_CFG.toEmail}`
          : 'Submitted successfully — we\'ll review your application and be in touch.';
        careerForm.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        careerStatus.style.color = 'var(--c-rust)';
        careerStatus.textContent = `Something went wrong. Please email us directly at ${EMAILJS_CFG.toEmail}`;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }


  /* ------------------------------------------------------------
     9) Smooth-scroll for in-page nav links
     ------------------------------------------------------------ */
  document.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ------------------------------------------------------------
     10) AI Agents — Maryam & Yarab
     ------------------------------------------------------------ */
  (() => {
    const AGENTS = {
      maryam: {
        name    : 'Maryam',
        role    : 'Finance Agent',
        roleAr  : 'وكيلة المالية',
        img     : 'assets/Maryam-Agent.svg',
        desc    : 'Maryam is MAQAR\'s intelligent finance agent — built to handle numbers, packages, and financial detail so our architects can stay focused on design.',
        descAr  : 'مريم هي وكيلة الذكاء الاصطناعي المالية لدى ماقار — مصمَّمة للتعامل مع الأرقام والحزم والتفاصيل المالية حتى يتفرغ مهندسونا للإبداع.',
        caps    : [
          'Creates detailed financial analysis and project cost breakdowns',
          'Prepares custom quotations and pricing proposals for clients',
          'Builds tiered service packages tailored to any budget',
          'Generates financial feasibility reports for architectural projects',
          'Tracks project budgets and flags cost variations in real time',
          'Prepares invoices, payment schedules, and financial summaries automatically',
        ],
        capsAr  : [
          'إنشاء تحليلات مالية تفصيلية وتقسيمات تكلفة المشاريع',
          'إعداد عروض أسعار وعروض تسعير مخصصة للعملاء',
          'بناء حزم خدمات متدرجة تتناسب مع كل ميزانية',
          'إنتاج تقارير الجدوى المالية للمشاريع المعمارية',
          'متابعة ميزانيات المشاريع ورصد تفاوتات التكلفة في الوقت الفعلي',
          'إعداد الفواتير وجداول الدفع والملخصات المالية تلقائياً',
        ],
      },
      yarab: {
        name    : 'Yarab',
        role    : 'Marketing Agent',
        roleAr  : 'وكيل التسويق',
        img     : 'assets/Yarab-Agent.svg',
        desc    : 'Yarab is MAQAR\'s client-facing marketing agent — always available to understand your vision, represent the studio, and keep every conversation moving forward.',
        descAr  : 'يراب هو وكيل التسويق المواجِه للعملاء في ماقار — متاح دائماً لفهم رؤيتك وتمثيل الاستوديو وإبقاء كل محادثة في مسارها الصحيح.',
        caps    : [
          'Engages directly with clients to understand their requirements and brief the design team',
          'Answers emails and enquiries on behalf of the studio, 24 hours a day',
          'Manages and responds to DMs across Instagram, LinkedIn, and other social platforms',
          'Qualifies leads and prepares structured client briefs ready for the architects',
          'Schedules meetings, follow-ups, and reminders with prospective clients',
          'Maintains a consistent MAQAR brand voice across every channel and conversation',
        ],
        capsAr  : [
          'التواصل المباشر مع العملاء لفهم متطلباتهم وإحاطة فريق التصميم',
          'الرد على الرسائل الإلكترونية والاستفسارات نيابةً عن الاستوديو، على مدار الساعة',
          'إدارة الرد على رسائل إنستغرام ولينكدإن ومنصات التواصل الأخرى',
          'تأهيل العملاء المحتملين وإعداد ملخصات منظمة جاهزة للمهندسين',
          'جدولة الاجتماعات والمتابعات والتذكيرات مع العملاء المحتملين',
          'الحفاظ على صوت ماقار المتسق عبر كل قناة ومحادثة',
        ],
      },
    };

    const modal      = document.getElementById('agentModal');
    const backdrop   = document.getElementById('agentModalBackdrop');
    const closeBtn   = document.getElementById('agentModalClose');
    const modalImg   = document.getElementById('agentModalImg');
    const modalName  = document.getElementById('agentModalName');
    const modalRole  = document.getElementById('agentModalRole');
    const modalDesc  = document.getElementById('agentModalDesc');
    const modalCaps  = document.getElementById('agentModalCaps');

    if (!modal) return;

    const openAgent = (key) => {
      const a = AGENTS[key];
      if (!a) return;
      const isAr = document.documentElement.getAttribute('dir') === 'rtl';
      modalImg.src            = a.img;
      modalImg.alt            = a.name;
      modalName.textContent   = a.name;
      modalRole.textContent   = isAr ? (a.roleAr || a.role) : a.role;
      modalDesc.textContent   = isAr ? (a.descAr || a.desc) : a.desc;
      const caps              = isAr ? (a.capsAr || a.caps) : a.caps;
      modalCaps.innerHTML     = caps.map(c => `<li>${c}</li>`).join('');
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      // Lock scroll WITHOUT adding body.modal-open — that class hides the
      // custom cursor diamond and leaves cursor:none with nothing visible.
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeAgent = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    // Bind each agent card
    document.querySelectorAll('.agent-card[data-agent]').forEach(card => {
      card.addEventListener('click', () => openAgent(card.dataset.agent));
    });

    closeBtn.addEventListener('click', closeAgent);
    backdrop.addEventListener('click', closeAgent);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeAgent();
    });
  })();

  /* ------------------------------------------------------------
     10) Floating chatbot widget
     ------------------------------------------------------------ */
  (() => {
    const fab      = document.getElementById('chatbotFab');
    const panel    = document.getElementById('chatbotPanel');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const form     = document.getElementById('chatbotForm');
    const input    = document.getElementById('chatbotInput');
    const quickBtns= document.getElementById('chatbotQuickBtns');

    if (!fab || !panel) return;

    // ── Knowledge base ────────────────────────────────────────
    const KB = [
      {
        keys: ['service', 'offer', 'do', 'work', 'what'],
        reply: `We offer three core disciplines:\n• <strong>Architecture</strong> — residential, commercial & cultural\n• <strong>Interior Design</strong> — space planning and finishes\n• <strong>Graphic & Digital Design</strong> — identity systems, UI, visualisation\n\nScroll to our <a href="#services" data-link>Services section</a> for the full list.`
      },
      {
        keys: ['contact', 'reach', 'email', 'phone', 'call', 'touch'],
        reply: `You can reach us at:<br>📧 <a href="mailto:Maqarstudio@gmail.com">Maqarstudio@gmail.com</a><br>📞 <a href="tel:+96876833386">+968 7683 3386</a><br>📍 Muscat, Oman<br><br>Or use the <a href="#contact" data-link>Contact form</a> below.`
      },
      {
        keys: ['portfolio', 'project', 'work', 'see', 'example', 'showcase'],
        reply: `Our portfolio spans architecture, interior, graphic, and digital projects. Browse them in the <a href="#work" data-link>Work section</a> — click any card to explore a full case study.`
      },
      {
        keys: ['hire', 'hiring', 'job', 'career', 'internship', 'join', 'vacancy', 'apply'],
        reply: `We're always looking for talented people! You can:<br>• Submit your <strong>resume &amp; portfolio</strong><br>• Apply for an <strong>internship</strong><br>• Propose a <strong>collaboration</strong><br><br>Visit our <a href="#careers" data-link>Careers section</a> to apply.`
      },
      {
        keys: ['about', 'studio', 'who', 'team', 'maqar'],
        reply: `MAQAR is a 100% Omani multidisciplinary design studio founded in Muscat. We blend Omani heritage with contemporary craft across architecture, interiors, and design. <a href="#about" data-link>Learn more about us ↓</a>`
      },
      {
        keys: ['location', 'based', 'where', 'muscat', 'oman'],
        reply: `We are based in <strong>Muscat, Oman</strong> and work with clients across the Gulf region and beyond.`
      },
      {
        keys: ['price', 'cost', 'fee', 'quote', 'rate', 'budget'],
        reply: `Every project is unique, so fees are tailored to scope and scale. <a href="#contact" data-link>Send us a message</a> with your brief and we'll get back to you promptly.`
      },
      {
        keys: ['achievement', 'award', 'recognition', 'prize'],
        reply: `We've received several industry awards including Best Architecture Practice (Oman Design Awards 2024), Young Practice of the Year (Arab Architecture Forum 2023), and more. <a href="#achievements" data-link>See all achievements ↓</a>`
      },
      {
        keys: ['hello', 'hi', 'hey', 'salam', 'السلام'],
        reply: `Hello! 👋 Welcome to MAQAR Studio. I can help you learn about our services, portfolio, team, or how to get in touch. What would you like to know?`
      },
      {
        keys: ['thanks', 'thank', 'شكرا', 'appreciated'],
        reply: `You're welcome! Is there anything else I can help you with?`
      },
    ];

    const FALLBACK = `I'm not sure I understand that yet! Try asking about our <strong>services</strong>, <strong>portfolio</strong>, <strong>careers</strong>, or <strong>contact details</strong> — or use the quick buttons below.`;

    const findReply = (text) => {
      const lower = text.toLowerCase();
      for (const entry of KB) {
        if (entry.keys.some(k => lower.includes(k))) return entry.reply;
      }
      return FALLBACK;
    };

    // ── Message rendering ────────────────────────────────────
    let isOpen = false;
    let greeted = false;

    const addMessage = (html, role /* 'bot' | 'user' */, animate = true) => {
      const wrap = document.createElement('div');
      wrap.className = `chatbot-msg chatbot-msg--${role}${animate ? ' chatbot-msg--in' : ''}`;

      // Said's avatar sits beside every bot bubble
      if (role === 'bot') {
        const av = document.createElement('img');
        av.src = 'assets/said.svg';
        av.className = 'chatbot-msg-avatar';
        av.alt = '';
        av.setAttribute('aria-hidden', 'true');
        wrap.appendChild(av);
      }

      const bubble = document.createElement('div');
      bubble.className = 'chatbot-bubble';
      bubble.innerHTML = html;
      wrap.appendChild(bubble);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;

      // Re-bind smooth-scroll on any injected links
      wrap.querySelectorAll('[data-link]').forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          const el = document.querySelector(href);
          if (!el) return;
          e.preventDefault();
          closePanel();
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        });
      });
    };

    const showTyping = () => {
      const wrap = document.createElement('div');
      wrap.className = 'chatbot-msg chatbot-msg--bot chatbot-msg--typing chatbot-msg--in';
      wrap.id = 'chatbotTyping';
      const av = document.createElement('img');
      av.src = 'assets/said.svg';
      av.className = 'chatbot-msg-avatar';
      av.alt = '';
      av.setAttribute('aria-hidden', 'true');
      wrap.appendChild(av);
      const bbl = document.createElement('div');
      bbl.className = 'chatbot-bubble';
      bbl.innerHTML = '<span class="chatbot-dot"></span><span class="chatbot-dot"></span><span class="chatbot-dot"></span>';
      wrap.appendChild(bbl);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    };

    const removeTyping = () => {
      const el = document.getElementById('chatbotTyping');
      if (el) el.remove();
    };

    const sendMessage = (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      addMessage(trimmed, 'user');
      input.value = '';

      showTyping();
      setTimeout(() => {
        removeTyping();
        addMessage(findReply(trimmed), 'bot');
      }, 700 + Math.random() * 400);
    };

    // ── Open / close ─────────────────────────────────────────
    const openPanel = () => {
      isOpen = true;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      fab.setAttribute('aria-expanded', 'true');
      fab.classList.add('is-open');
      // Ping badge off
      const ping = fab.querySelector('.chatbot-fab-ping');
      if (ping) ping.style.display = 'none';

      if (!greeted) {
        greeted = true;
        setTimeout(() => addMessage(`Hi there! 👋 I'm the MAQAR Assistant. How can I help you today?`, 'bot'), 350);
      }
      setTimeout(() => input.focus(), 400);
    };

    const closePanel = () => {
      isOpen = false;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
      fab.classList.remove('is-open');
    };

    fab.addEventListener('click', () => isOpen ? closePanel() : openPanel());
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Quick-reply buttons
    if (quickBtns) {
      quickBtns.querySelectorAll('.chatbot-quick').forEach(btn => {
        btn.addEventListener('click', () => sendMessage(btn.dataset.msg));
      });
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(input.value);
      });
    }

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closePanel();
    });

    // Show ping badge after 3 s to invite interaction
    setTimeout(() => {
      if (!greeted) {
        const ping = fab.querySelector('.chatbot-fab-ping');
        if (ping) ping.classList.add('is-visible');
      }
    }, 3000);

    // ── Mobile keyboard: keep chatbot panel above the keyboard ──
    // When the soft keyboard opens the visual viewport shrinks.
    // We raise the panel and shrink its height so it stays fully visible.
    if ('visualViewport' in window) {
      const onViewportResize = () => {
        if (!isOpen) return;
        const vv          = window.visualViewport;
        const keyboardH   = window.innerHeight - vv.height - vv.offsetTop;
        if (keyboardH > 80) {
          // Keyboard is open — lift panel above it
          panel.style.bottom    = `${keyboardH + 6}px`;
          panel.style.height    = `${vv.height - 72}px`;
          panel.style.maxHeight = 'none';
        } else {
          // Keyboard closed — reset to CSS defaults
          panel.style.bottom    = '';
          panel.style.height    = '';
          panel.style.maxHeight = '';
        }
      };
      window.visualViewport.addEventListener('resize', onViewportResize);
      window.visualViewport.addEventListener('scroll', onViewportResize);
    }
  })();

  /* ════════════════════════════════════════════════════════════
     LANGUAGE SWITCH — Full site (EN ↔ AR)
     Toggle with the EN | عر button in the nav.
     localStorage key: 'maqar-lang'  ('en' | 'ar')
     To undo: remove this block + CSS "LANGUAGE SWITCH" section
              + the <button.lang-switch> in index.html.
     ════════════════════════════════════════════════════════════ */
  (() => {
    const btn = document.getElementById('langSwitch');
    if (!btn) return;

    /* ── Single-element translations: selector → {text} or {html} ── */
    const T = {
      en: {
        /* ── Nav (desktop) ── */
        '.nav-links a[href="#about"]'       : { text: 'About' },
        '.nav-links a[href="#work"]'        : { text: 'Work' },
        '.nav-links a[href="#services"]'    : { text: 'Services' },
        '.nav-links a[href="#achievements"]': { text: 'Achievements' },
        '.nav-links a[href="#agents"]'      : { text: 'AI Agents' },
        '.nav-links a[href="#careers"]'     : { text: 'Careers' },
        '.nav-links a[href="#contact"]'     : { text: 'Contact' },
        /* ── Nav (drawer) ── */
        '.nav-drawer a[href="#about"]'       : { text: 'About' },
        '.nav-drawer a[href="#work"]'        : { text: 'Work' },
        '.nav-drawer a[href="#services"]'    : { text: 'Services' },
        '.nav-drawer a[href="#achievements"]': { text: 'Achievements' },
        '.nav-drawer a[href="#agents"]'      : { text: 'AI Agents' },
        '.nav-drawer a[href="#careers"]'     : { text: 'Careers' },
        '.nav-drawer a[href="#contact"]'     : { text: 'Contact' },
        /* ── Intro ── */
        '.intro-mark-line'        : { text: 'Architectural' },
        '.intro-tagline'          : { text: 'Space. Craft. Vision.' },
        '.intro-sub'              : { text: 'Building spaces that reflect our values.' },
        '.intro-scroll-hint small': { text: 'Scroll' },
        /* ── About ── */
        '.about .about-eyebrow span:last-child': { text: '01 — About the Studio' },
        '.about-heading': { html: 'A multidisciplinary studio rooted in <em>architecture</em>, expanded into the <em>digital</em> and <em>graphic</em> realm.' },
        '.about-body p:first-child': { text: 'MAQAR is a multidisciplinary design studio rooted in architecture and expanded into the digital and graphic realm. We design spaces, identities, and experiences that are precise, considered, and enduring.' },
        '.about-body p:last-child' : { text: 'Our practice blends Omani heritage with contemporary craft — folding tradition into form, the way an origami sheet becomes architecture. Every project is an exercise in balance: between past and present, material and meaning, rigour and warmth.' },
        '.about-pillars li:nth-child(1) strong': { text: 'Creative' },
        '.about-pillars li:nth-child(1) span'  : { text: '& Inspiring' },
        '.about-pillars li:nth-child(2) strong': { text: 'Collaborative' },
        '.about-pillars li:nth-child(2) span'  : { text: '& Supportive' },
        '.about-pillars li:nth-child(3) strong': { text: 'Expressive' },
        '.about-pillars li:nth-child(3) span'  : { text: '& Renewed' },
        /* ── Sultan Haitham quote ── */
        '#quote-sultan .about-eyebrow span:last-child': { text: 'Vision for Oman' },
        '#quote-sultan .quote-mark-en'   : { text: 'Oman Vision 2040' },
        '#quote-sultan .quote-tagline'   : { text: 'A future rooted in heritage, shaped by ambition.' },
        '#quote-sultan .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>We are building an Oman whose authenticity walks hand-in-hand with modernity &mdash; where every space, every façade, and every public realm tells the story of our people, our land, and the future we are shaping together.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-sultan .quote-attrib-name span': { text: 'Sultan of Oman — drawing from Oman Vision 2040' },
        '#quote-sultan .quote-attrib-loc': { text: 'Sultanate of Oman' },
        /* ── CEO quote ── */
        '#quote .about-eyebrow span:last-child': { text: '02 — A word from the CEO' },
        '#quote .quote-tagline'   : { text: '100% Omani Architecture Studio' },
        '#quote .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>Architecture is not just about building structures &mdash; it is about shaping identity. At Maqar Studio, every line we draw carries the soul of Oman: its heritage, its land, and the ambition of its people. We build with pride because this is our homeland.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote .quote-attrib-name span': { text: 'Chief Executive Officer, Maqar Studio' },
        '#quote .quote-attrib-loc': { text: 'Muscat, Oman' },
        /* ── COO quote ── */
        '#quote-coo .about-eyebrow span:last-child': { text: '02 — A word from the COO' },
        '#quote-coo .quote-tagline'   : { text: '100% Omani Architecture Studio' },
        '#quote-coo .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>True design is born from listening &mdash; to the land, to the community, and to the generations that came before us. At Maqar Studio, we do not simply design spaces; we craft experiences that honor Omani culture while embracing the future. Every project is a conversation between where we come from and where we are going.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-coo .quote-attrib-name span': { text: 'Chief Operating Officer, Maqar Studio' },
        '#quote-coo .quote-attrib-loc': { text: 'Muscat, Oman' },
        /* ── CMO quote ── */
        '#quote-exec3 .about-eyebrow span:last-child': { text: '02 — A word from our team' },
        '#quote-exec3 .quote-tagline'   : { text: '100% Omani Architecture Studio' },
        '#quote-exec3 .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>A brand is not what you say it is &mdash; it is what people feel when they walk through your door. At Maqar Studio, our story is written in every facade, every courtyard, and every detail that whispers Oman. Our mission is to make the world see what we have always known: that Omani design is world-class, timeless, and deeply human.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-exec3 .quote-attrib-name span': { text: 'Chief Marketing Officer, Maqar Studio' },
        '#quote-exec3 .quote-attrib-loc': { text: 'Muscat, Oman' },
        /* ── CFO quote ── */
        '#quote-cfo .about-eyebrow span:last-child': { text: '02 — A word from the CFO' },
        '#quote-cfo .quote-tagline'   : { text: '100% Omani Architecture Studio' },
        '#quote-cfo .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>Sustainable growth is not an accident &mdash; it is a discipline. At Maqar Studio, we believe that financial strength is the foundation upon which great architecture is built. When we invest wisely, we give our creators the freedom to dream boldly, and we give Oman buildings that will stand for generations to come.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-cfo .quote-attrib-name span': { text: 'Chief Financial Officer, Maqar Studio' },
        '#quote-cfo .quote-attrib-loc': { text: 'Muscat, Oman' },
        /* ── Work ── */
        '.work-head .about-eyebrow span:last-child': { text: '03 — Selected Work' },
        '.work-heading'                : { text: 'A practice across three disciplines.' },
        '.tab[data-filter="all"]'          : { text: 'All' },
        '.tab[data-filter="architecture"]' : { text: 'Architecture' },
        '.tab[data-filter="interior"]'     : { text: 'Interior' },
        '.tab[data-filter="digital"]'      : { text: 'Digital' },
        '.tab[data-filter="graphic"]'      : { text: 'Graphic' },
        /* ── Services ── */
        '.services-header .about-eyebrow span:last-child': { text: '04 — Services' },
        '.services-heading': { html: 'What we <em>build</em>.' },
        '.service-group:nth-child(1) .service-group-title': { text: 'Core Design Services' },
        '.service-group:nth-child(1) .service-item:nth-child(1) strong': { text: 'Architectural Design' },
        '.service-group:nth-child(1) .service-item:nth-child(1) .service-info span': { text: 'Residential, commercial, mixed-use' },
        '.service-group:nth-child(1) .service-item:nth-child(2) strong': { text: 'Interior Design & Space Planning' },
        '.service-group:nth-child(1) .service-item:nth-child(3) strong': { text: 'Urban Design & Master Planning' },
        '.service-group:nth-child(1) .service-item:nth-child(4) strong': { text: 'Landscape Architecture' },
        '.service-group:nth-child(2) .service-group-title': { text: 'Specialized Services' },
        '.service-group:nth-child(2) .service-item:nth-child(1) strong': { text: 'Heritage & Cultural Architecture' },
        '.service-group:nth-child(2) .service-item:nth-child(2) strong': { text: 'Facade Design & Detailing' },
        '.service-group:nth-child(2) .service-item:nth-child(3) strong': { text: '3D Visualization & Rendering' },
        /* ── Achievements ── */
        '.ach-header .section-eyebrow span:last-child': { text: '05 — ACHIEVEMENTS' },
        '.section-title': { html: 'Recognition &amp;<br>Milestones.' },
        /* ── AI Agents ── */
        '#agents .about-eyebrow span:last-child': { text: 'AI — Agents' },
        '.agents-heading': { html: 'The intelligent<br>side of <em>MAQAR</em>.' },
        '.agents-sub'    : { text: 'We are bringing AI into architecture — deploying intelligent agents to serve our clients faster, smarter, and around the clock. Meet the team that never sleeps.' },
        '.agent-card[data-agent="maryam"] .agent-role' : { text: 'Finance Agent' },
        '.agent-card[data-agent="maryam"] .agent-cta'  : { text: 'View capabilities →' },
        '.agent-card[data-agent="maryam"] .agent-badge': { html: '<span class="agent-badge-dot"></span>Online' },
        '.agent-card[data-agent="yarab"] .agent-role'  : { text: 'Marketing Agent' },
        '.agent-card[data-agent="yarab"] .agent-cta'   : { text: 'View capabilities →' },
        '.agent-card[data-agent="yarab"] .agent-badge' : { html: '<span class="agent-badge-dot"></span>Online' },
        '.agent-badge--lg': { html: '<span class="agent-badge-dot"></span>AI Agent · Online' },
        /* ── Careers ── */
        '.careers-head .about-eyebrow span:last-child': { text: '05 — Careers' },
        '.careers-heading': { html: 'Be part of something <em>meaningful</em>.' },
        '.careers-sub'    : { text: 'We are always looking for exceptional talent who share our passion for Omani heritage and contemporary design.' },
        '.career-panel--resume h3': { text: 'Send Resume' },
        '.career-panel--resume p' : { text: 'Share your portfolio and CV with our team. We review every application with care.' },
        '.career-panel--intern h3': { text: 'Apply for Internship' },
        '.career-panel--intern p' : { text: 'Start your journey in Omani architecture. Open to students and recent graduates.' },
        '.career-panel--collab h3': { text: 'Propose Collaboration' },
        '.career-panel--collab p' : { text: 'Studios, brands and institutions — pitch a project and let\'s build something together.' },
        /* ── Contact ── */
        '.contact .about-eyebrow span:last-child': { text: '06 — Contact' },
        '.contact-heading': { html: 'Let\'s build something <em>considered</em>.' },
        '.contact-meta li:nth-child(1) span': { text: 'Email' },
        '.contact-meta li:nth-child(2) span': { text: 'Phone' },
        '.contact-meta li:nth-child(3) span': { text: 'Studio' },
        'label[for="cName"]'   : { text: 'Name' },
        'label[for="cEmail"]'  : { text: 'Email' },
        'label[for="cMessage"]': { text: 'Message' },
        '.send-btn span'       : { text: 'Send' },
        /* ── Footer ── */
        '.footer-mark span'         : { text: 'Architectural' },
        '.footer-meta span:first-child': { text: '© 2026 MAQAR Studio' },
        '.footer-meta span:last-child' : { text: 'Muscat · Oman' },
        /* ── Chatbot ── */
        '.chatbot-header-info span': { text: 'MAQAR Studio Assistant' },
      },

      ar: {
        /* ── Nav (desktop) ── */
        '.nav-links a[href="#about"]'       : { text: 'عن الاستوديو' },
        '.nav-links a[href="#work"]'        : { text: 'أعمالنا' },
        '.nav-links a[href="#services"]'    : { text: 'خدماتنا' },
        '.nav-links a[href="#achievements"]': { text: 'إنجازاتنا' },
        '.nav-links a[href="#agents"]'      : { text: 'وكلاء الذكاء' },
        '.nav-links a[href="#careers"]'     : { text: 'الوظائف' },
        '.nav-links a[href="#contact"]'     : { text: 'تواصل' },
        /* ── Nav (drawer) ── */
        '.nav-drawer a[href="#about"]'       : { text: 'عن الاستوديو' },
        '.nav-drawer a[href="#work"]'        : { text: 'أعمالنا' },
        '.nav-drawer a[href="#services"]'    : { text: 'خدماتنا' },
        '.nav-drawer a[href="#achievements"]': { text: 'إنجازاتنا' },
        '.nav-drawer a[href="#agents"]'      : { text: 'وكلاء الذكاء' },
        '.nav-drawer a[href="#careers"]'     : { text: 'الوظائف' },
        '.nav-drawer a[href="#contact"]'     : { text: 'تواصل' },
        /* ── Intro ── */
        '.intro-mark-line'        : { text: 'معماري' },
        '.intro-tagline'          : { text: 'المكان. الحرفة. الرؤية.' },
        '.intro-sub'              : { text: 'نبني فضاءات تعكس قيمنا.' },
        '.intro-scroll-hint small': { text: 'تمرير' },
        /* ── About ── */
        '.about .about-eyebrow span:last-child': { text: '٠١ — عن الاستوديو' },
        '.about-heading': { html: 'استوديو متعدد التخصصات متجذر في <em>العمارة</em>، ممتداً إلى عالم <em>الرقميات</em> و<em>الجرافيكس</em>.' },
        '.about-body p:first-child': { text: 'ماقار هو استوديو تصميم متعدد التخصصات، متجذر في العمارة ومنفتح على عالم الرقميات والجرافيكس. نصمم فضاءات وهويات وتجارب تتسم بالدقة والعمق والديمومة.' },
        '.about-body p:last-child' : { text: 'يمزج عملنا بين التراث العُماني والحرفة المعاصرة — نطوي التقاليد في الأشكال، كما يتحوّل الورق إلى عمارة. كل مشروع تمرين في التوازن: بين الماضي والحاضر، المادة والمعنى، الصرامة والدفء.' },
        '.about-pillars li:nth-child(1) strong': { text: 'مبدع' },
        '.about-pillars li:nth-child(1) span'  : { text: 'وملهم' },
        '.about-pillars li:nth-child(2) strong': { text: 'تعاوني' },
        '.about-pillars li:nth-child(2) span'  : { text: 'وداعم' },
        '.about-pillars li:nth-child(3) strong': { text: 'معبّر' },
        '.about-pillars li:nth-child(3) span'  : { text: 'ومتجدد' },
        /* ── Sultan Haitham quote ── */
        '#quote-sultan .about-eyebrow span:last-child': { text: 'رؤية عُمان' },
        '#quote-sultan .quote-mark-en'   : { text: 'رؤية عُمان 2040' },
        '#quote-sultan .quote-tagline'   : { text: 'مستقبل متجذر في التراث، محدوده الطموح.' },
        '#quote-sultan .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>نحن نبني عُماناً تسير فيها الأصالة جنباً إلى جنب مع الحداثة — حيث تروي كل فضاء وكل واجهة وكل ميدان عام قصة شعبنا وأرضنا والمستقبل الذي نرسمه معاً.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-sultan .quote-attrib-name span': { text: 'سلطان عُمان — من رؤية عُمان 2040' },
        '#quote-sultan .quote-attrib-loc': { text: 'سلطنة عُمان' },
        /* ── CEO quote ── */
        '#quote .about-eyebrow span:last-child': { text: '٠٢ — كلمة الرئيس التنفيذي' },
        '#quote .quote-tagline'   : { text: 'استوديو معمار عُماني ١٠٠٪' },
        '#quote .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>العمارة ليست مجرد تشييد هياكل — بل هي تشكيل للهوية. في استوديو ماقار، كل خط نرسمه يحمل روح عُمان: تراثها وأرضها وطموح شعبها. نبني بفخر لأن هذا وطننا.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote .quote-attrib-name span': { text: 'الرئيس التنفيذي، استوديو ماقار' },
        '#quote .quote-attrib-loc': { text: 'مسقط، عُمان' },
        /* ── COO quote ── */
        '#quote-coo .about-eyebrow span:last-child': { text: '٠٢ — كلمة المدير التنفيذي' },
        '#quote-coo .quote-tagline'   : { text: 'استوديو معمار عُماني ١٠٠٪' },
        '#quote-coo .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>التصميم الحقيقي يولد من الإصغاء — للأرض والمجتمع والأجيال التي سبقتنا. في استوديو ماقار، لا نصمم الفضاءات فحسب؛ بل نصنع تجارب تُكرّم الثقافة العُمانية وتستقبل المستقبل. كل مشروع حوار بين ما أتينا منه وما نتطلع إليه.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-coo .quote-attrib-name span': { text: 'المدير التنفيذي للعمليات، استوديو ماقار' },
        '#quote-coo .quote-attrib-loc': { text: 'مسقط، عُمان' },
        /* ── CMO quote ── */
        '#quote-exec3 .about-eyebrow span:last-child': { text: '٠٢ — كلمة من فريقنا' },
        '#quote-exec3 .quote-tagline'   : { text: 'استوديو معمار عُماني ١٠٠٪' },
        '#quote-exec3 .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>العلامة التجارية ليست ما تقوله عن نفسك — بل ما يشعر به الناس حين يعبرون بابك. في استوديو ماقار، قصتنا مكتوبة في كل واجهة وكل فناء وكل تفصيلة تهمس بعُمان. مهمتنا أن نُريَ العالم ما عرفناه دائماً: أن التصميم العُماني عالمي المستوى، خالد وعميق الإنسانية.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-exec3 .quote-attrib-name span': { text: 'مدير التسويق، استوديو ماقار' },
        '#quote-exec3 .quote-attrib-loc': { text: 'مسقط، عُمان' },
        /* ── CFO quote ── */
        '#quote-cfo .about-eyebrow span:last-child': { text: '٠٢ — كلمة المدير المالي' },
        '#quote-cfo .quote-tagline'   : { text: 'استوديو معمار عُماني ١٠٠٪' },
        '#quote-cfo .quote-text'      : { html: '<span class="qm qm-open" aria-hidden="true">&ldquo;</span>النمو المستدام ليس مصادفة — بل انضباط. في استوديو ماقار، نؤمن أن الرسوخ المالي هو الأساس الذي تقوم عليه العمارة العظيمة. حين نستثمر بحكمة، نمنح مبدعينا حرية الحلم بجرأة، ونمنح عُمان مبانٍ ستصمد لأجيال قادمة.<span class="qm qm-close" aria-hidden="true">&rdquo;</span>' },
        '#quote-cfo .quote-attrib-name span': { text: 'المدير المالي، استوديو ماقار' },
        '#quote-cfo .quote-attrib-loc': { text: 'مسقط، عُمان' },
        /* ── Work ── */
        '.work-head .about-eyebrow span:last-child': { text: '٠٣ — أعمال مختارة' },
        '.work-heading'                : { text: 'ممارسة عبر ثلاثة تخصصات.' },
        '.tab[data-filter="all"]'          : { text: 'الكل' },
        '.tab[data-filter="architecture"]' : { text: 'عمارة' },
        '.tab[data-filter="interior"]'     : { text: 'داخلي' },
        '.tab[data-filter="digital"]'      : { text: 'رقمي' },
        '.tab[data-filter="graphic"]'      : { text: 'جرافيك' },
        /* ── Services ── */
        '.services-header .about-eyebrow span:last-child': { text: '٠٤ — الخدمات' },
        '.services-heading': { html: 'ما <em>نبنيه</em>.' },
        '.service-group:nth-child(1) .service-group-title': { text: 'خدمات التصميم الأساسية' },
        '.service-group:nth-child(1) .service-item:nth-child(1) strong': { text: 'التصميم المعماري' },
        '.service-group:nth-child(1) .service-item:nth-child(1) .service-info span': { text: 'سكني، تجاري، متعدد الاستخدامات' },
        '.service-group:nth-child(1) .service-item:nth-child(2) strong': { text: 'التصميم الداخلي وتخطيط الفراغات' },
        '.service-group:nth-child(1) .service-item:nth-child(3) strong': { text: 'التصميم الحضري والتخطيط الرئيسي' },
        '.service-group:nth-child(1) .service-item:nth-child(4) strong': { text: 'عمارة المناظر الطبيعية' },
        '.service-group:nth-child(2) .service-group-title': { text: 'خدمات متخصصة' },
        '.service-group:nth-child(2) .service-item:nth-child(1) strong': { text: 'العمارة التراثية والثقافية' },
        '.service-group:nth-child(2) .service-item:nth-child(2) strong': { text: 'تصميم الواجهات وتفاصيلها' },
        '.service-group:nth-child(2) .service-item:nth-child(3) strong': { text: 'التصور ثلاثي الأبعاد والإخراج البصري' },
        /* ── Achievements ── */
        '.ach-header .section-eyebrow span:last-child': { text: '٠٥ — الإنجازات' },
        '.section-title': { html: 'تقدير و<br>محطات.' },
        /* ── AI Agents ── */
        '#agents .about-eyebrow span:last-child': { text: 'الذكاء الاصطناعي — الوكلاء' },
        '.agents-heading': { html: 'الجانب <em>الذكي</em><br>من ماقار.' },
        '.agents-sub'    : { text: 'نجلب الذكاء الاصطناعي إلى عالم العمارة — نوظّف وكلاء أذكياء لخدمة عملائنا بشكل أسرع وأذكى وعلى مدار الساعة. تعرّف على الفريق الذي لا ينام.' },
        '.agent-card[data-agent="maryam"] .agent-role' : { text: 'وكيلة المالية' },
        '.agent-card[data-agent="maryam"] .agent-cta'  : { text: '← استعراض القدرات' },
        '.agent-card[data-agent="maryam"] .agent-badge': { html: '<span class="agent-badge-dot"></span>متصل' },
        '.agent-card[data-agent="yarab"] .agent-role'  : { text: 'وكيل التسويق' },
        '.agent-card[data-agent="yarab"] .agent-cta'   : { text: '← استعراض القدرات' },
        '.agent-card[data-agent="yarab"] .agent-badge' : { html: '<span class="agent-badge-dot"></span>متصل' },
        '.agent-badge--lg': { html: '<span class="agent-badge-dot"></span>وكيل ذكاء اصطناعي · متصل' },
        /* ── Careers ── */
        '.careers-head .about-eyebrow span:last-child': { text: '٠٥ — الوظائف' },
        '.careers-heading': { html: 'كن جزءاً من شيء <em>ذي معنى</em>.' },
        '.careers-sub'    : { text: 'نحن دائماً نبحث عن مواهب استثنائية تشاركنا الشغف بالتراث العُماني والتصميم المعاصر.' },
        '.career-panel--resume h3': { text: 'أرسل سيرتك الذاتية' },
        '.career-panel--resume p' : { text: 'شارك ملف أعمالك وسيرتك الذاتية مع فريقنا. نراجع كل طلب بعناية.' },
        '.career-panel--intern h3': { text: 'تقدّم للتدريب' },
        '.career-panel--intern p' : { text: 'ابدأ رحلتك في العمارة العُمانية. مفتوح للطلاب والخريجين الجدد.' },
        '.career-panel--collab h3': { text: 'اقترح تعاوناً' },
        '.career-panel--collab p' : { text: 'استوديوهات وعلامات تجارية ومؤسسات — قدّم مشروعك ولنبني شيئاً معاً.' },
        /* ── Contact ── */
        '.contact .about-eyebrow span:last-child': { text: '٠٦ — تواصل معنا' },
        '.contact-heading': { html: 'لنبني شيئاً <em>مدروساً</em>.' },
        '.contact-meta li:nth-child(1) span': { text: 'البريد الإلكتروني' },
        '.contact-meta li:nth-child(2) span': { text: 'الهاتف' },
        '.contact-meta li:nth-child(3) span': { text: 'الاستوديو' },
        'label[for="cName"]'   : { text: 'الاسم' },
        'label[for="cEmail"]'  : { text: 'البريد الإلكتروني' },
        'label[for="cMessage"]': { text: 'الرسالة' },
        '.send-btn span'       : { text: 'إرسال' },
        /* ── Footer ── */
        '.footer-mark span'            : { text: 'معماري' },
        '.footer-meta span:first-child': { text: '© 2026 استوديو ماقار' },
        '.footer-meta span:last-child' : { text: 'مسقط · عُمان' },
        /* ── Chatbot ── */
        '.chatbot-header-info span': { text: 'مساعد استوديو ماقار' },
      },
    };

    /* ── List translations: querySelectorAll + index array ─── */
    const TL = {
      en: {
        /* Work card titles (12 cards in DOM order) */
        '.work-grid .card-meta h3': [
          'Residence Al Khuwair', 'Brand Portal UI', 'Identity System Vol.1',
          'The Courtyard House', '3D Visualization Suite', 'Exhibition Catalog',
          'Pavilion 07', 'Interactive Space', 'Wayfinding System',
          'Salalah Apartment', 'Atelier Workspace', 'Hospitality Suite',
        ],
        /* Work card subtitles */
        '.work-grid .card-meta span': [
          'Architecture · Muscat', 'Digital · Web Platform', 'Graphic · Brand',
          'Architecture · Residential', 'Digital · Tooling', 'Graphic · Print',
          'Architecture · Cultural', 'Digital · Installation', 'Graphic · Environmental',
          'Interior · Residential', 'Interior · Studio', 'Interior · Hospitality',
        ],
        /* Achievement dot labels (8, clockwise from top) */
        '.ach-dot-name': [
          'Best Architecture Practice', 'Sustainable Build Excellence',
          'Young Practice of the Year', 'Heritage Design Award',
          'Interior Project of the Year', 'Brand Identity Excellence',
          'Urban Innovation Prize', 'Client Satisfaction Award',
        ],
        /* Chatbot quick-reply buttons */
        '.chatbot-quick': ['Services', 'Contact', 'Portfolio', 'Careers'],
      },
      ar: {
        /* Work card titles */
        '.work-grid .card-meta h3': [
          'مسكن الخوير', 'واجهة بوابة العلامة', 'نظام الهوية — المجلد الأول',
          'بيت الفناء', 'حزمة التصور ثلاثي الأبعاد', 'كتالوج المعرض',
          'الجناح ٠٧', 'فضاء تفاعلي', 'نظام التوجيه',
          'شقة صلالة', 'مساحة الأتيليه', 'جناح الضيافة',
        ],
        /* Work card subtitles */
        '.work-grid .card-meta span': [
          'عمارة · مسقط', 'رقمي · منصة إلكترونية', 'جرافيك · هوية',
          'عمارة · سكني', 'رقمي · أدوات', 'جرافيك · طباعة',
          'عمارة · ثقافي', 'رقمي · تركيب', 'جرافيك · بيئي',
          'داخلي · سكني', 'داخلي · استوديو', 'داخلي · ضيافة',
        ],
        /* Achievement dot labels */
        '.ach-dot-name': [
          'أفضل ممارسة معمارية', 'التميز في البناء المستدام',
          'أفضل ممارسة ناشئة لعام', 'جائزة التصميم التراثي',
          'مشروع التصميم الداخلي للعام', 'التميز في هوية العلامة',
          'جائزة الابتكار الحضري', 'جائزة رضا العملاء',
        ],
        /* Chatbot quick-reply buttons */
        '.chatbot-quick': ['خدمات', 'تواصل', 'أعمال', 'وظائف'],
      },
    };

    /* ── Attribute translations ──────────────────────────────── */
    const ATTRS = {
      en: { '#chatbotInput': { placeholder: 'Ask Said anything…' } },
      ar: { '#chatbotInput': { placeholder: 'اسأل سعيداً أي شيء...' } },
    };

    /* ── Apply a language ────────────────────────────────────── */
    const applyLang = (lang) => {
      if (!T[lang]) return;

      /* 1 — Single-element translations */
      Object.entries(T[lang]).forEach(([sel, val]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        if (val.html !== undefined) el.innerHTML = val.html;
        else el.textContent = val.text;
      });

      /* 2 — List translations (querySelectorAll + index) */
      Object.entries(TL[lang] || {}).forEach(([sel, texts]) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          if (texts[i] !== undefined) el.textContent = texts[i];
        });
      });

      /* 3 — Attribute translations */
      Object.entries(ATTRS[lang] || {}).forEach(([sel, attrs]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        Object.entries(attrs).forEach(([attr, val]) => el.setAttribute(attr, val));
      });

      /* 4 — RTL / LTR */
      const root = document.documentElement;
      if (lang === 'ar') {
        root.setAttribute('dir', 'rtl');
        root.setAttribute('lang', 'ar');
      } else {
        root.setAttribute('dir', 'ltr');
        root.setAttribute('lang', 'en');
      }

      /* 5 — Update button active indicator */
      btn.dataset.lang = lang;

      /* 6 — Persist */
      try { localStorage.setItem('maqar-lang', lang); } catch (_) {}
    };

    /* ── Toggle on click ─────────────────────────────────────── */
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.lang === 'en' ? 'ar' : 'en');
    });

    /* ── Restore saved preference on load ────────────────────── */
    try {
      const saved = localStorage.getItem('maqar-lang');
      if (saved && saved !== 'en') applyLang(saved);
    } catch (_) {}
  })();

})();
