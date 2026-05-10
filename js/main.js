/* ============================================================
   MAQAR Studio — Site interactions
   - Scroll-scrubbed intro video
   - Section reveal observer
   - Custom cursor + magnetic targets
   - Portfolio tabs (animated indicator) + filter
   - 3D tilt on cards
   - Smooth nav fade
   ============================================================ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------
     1) Scroll-scrubbed intro video
     ------------------------------------------------------------ */
  const intro      = document.getElementById('intro');
  const video      = document.getElementById('introVideo');

  const setupVideoScrub = () => {
    if (!intro || !video) return;

    let duration = 0;
    let srcAttached = false;
    let isSeeking = false;
    let pendingTime = null;
    let isInView = true;
    let cachedRange = 1;          // intro scrollable range, cached
    let lastTargetTime = -1;       // last time we asked the video to seek to
    let lastScrollY = -1;
    let pendingScrollFrame = null;

    const attachSrc = () => {
      if (srcAttached) return;
      const src = video.dataset.src;
      if (!src) { srcAttached = true; return; }
      // If the src was already attached externally (or by a hot-reload), leave the
      // video alone — calling load() again would reset currentTime and re-fetch.
      if (video.src && video.src.length > 0) { srcAttached = true; return; }
      video.src = src;
      video.load();
      srcAttached = true;
    };

    // Defer video load until first user scroll so initial paint isn't blocked.
    window.addEventListener('scroll', attachSrc, { once: true, passive: true });
    intro.addEventListener('pointerdown', attachSrc, { once: true });

    const recomputeRange = () => {
      cachedRange = Math.max(1, intro.offsetHeight - window.innerHeight);
    };
    recomputeRange();
    window.addEventListener('resize', recomputeRange);

    const onMeta = () => {
      duration = video.duration || 0;
      try { video.currentTime = 0.001; } catch (_) {}
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener('loadedmetadata', onMeta);

    // Browser-side flag: track when seek is in flight so we don't queue a backlog.
    video.addEventListener('seeking', () => { isSeeking = true; });
    video.addEventListener('seeked',  () => {
      isSeeking = false;
      // If the user kept scrolling while we were seeking, jump straight to the latest target.
      if (pendingTime != null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    });

    // Prefer fastSeek when available — seeks to the nearest keyframe instantly,
    // which is what we want for high-bitrate / sparse-keyframe MP4s.
    const useFastSeek = typeof video.fastSeek === 'function';

    const requestSeek = (t) => {
      if (!duration) return;
      // The video's own time is close enough — skip.
      if (Math.abs(video.currentTime - t) < 0.04) return;
      if (Math.abs(t - lastTargetTime) < 0.04) return;
      lastTargetTime = t;

      if (isSeeking) {
        // Don't stack seeks. Remember the latest desired time and apply it on `seeked`.
        pendingTime = t;
        return;
      }
      try {
        if (useFastSeek) video.fastSeek(t);
        else video.currentTime = t;
      } catch (_) { /* swallow — happens during teardown */ }
    };

    // The single scroll handler. Runs in a coalesced rAF so we do at most
    // one layout read & one seek per frame, regardless of scroll-event firing rate.
    const onScroll = () => {
      if (!isInView || pendingScrollFrame) return;
      pendingScrollFrame = requestAnimationFrame(() => {
        pendingScrollFrame = null;
        // Use scrollY arithmetic instead of getBoundingClientRect — no forced layout.
        const introTop = intro.offsetTop;
        const scrolled = window.scrollY - introTop;
        const p = Math.min(1, Math.max(0, scrolled / cachedRange));

        if (p > 0.7) intro.classList.add('is-revealed');
        else intro.classList.remove('is-revealed');

        if (duration) requestSeek(p * duration);
      });
    };

    // Skip all scrub work while the intro is fully offscreen.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        isInView = entries[0].isIntersecting;
        if (isInView) onScroll();
      }, { rootMargin: '0px' });
      io.observe(intro);
    }

    if (prefersReduced) intro.classList.add('is-revealed');

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { recomputeRange(); onScroll(); });
    onScroll();
  };

  setupVideoScrub();

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
     7) Contact form — local-only handler
     ------------------------------------------------------------ */
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      if (!name || !email || !message) {
        status.textContent = 'Please complete all fields.';
        status.style.color = 'var(--c-rust)';
        return;
      }
      status.textContent = 'Thank you — we will be in touch shortly.';
      status.style.color = 'var(--c-sand)';
      form.reset();
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
    proj.slides.forEach((s, i) => {
      const [c1, c2] = proj.colors[i] || proj.colors[0];
      const el = document.createElement('div');
      el.className = 'proj-slide';
      el.innerHTML = `<div class="proj-slide-media" style="background:linear-gradient(135deg,${c1},${c2})"><span class="proj-slide-label">${proj.code} · 0${i+1}</span></div>`;
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

  // Click card to open
  document.querySelectorAll('.card').forEach(card => {
    card.style.cursor = 'none';
    card.addEventListener('click', () => openModal(card));
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
      const a = ACH[idx];
      achPanelImg.style.background = `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`;
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
      anchor.querySelector('.ach-dot-btn').addEventListener('click', () => {
        anchor.classList.add('is-flipping');
        setTimeout(() => openAch(i), 230);          // open at blur peak
        setTimeout(() => anchor.classList.remove('is-flipping'), 650);
      });
    });

    achPanelClose.addEventListener('click', closeAch);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && achActive >= 0) closeAch();
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
})();
