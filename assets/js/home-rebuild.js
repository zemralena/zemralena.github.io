(() => {
  const photographySlides = [...document.querySelectorAll('.photography-rotation img')];
  if (photographySlides.length > 1 && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    let photographyIndex = 0;
    window.setInterval(() => {
      photographySlides[photographyIndex].classList.remove('is-active');
      photographyIndex = (photographyIndex + 1) % photographySlides.length;
      photographySlides[photographyIndex].classList.add('is-active');
    }, 4200);
  }

  const stage = document.querySelector('.featured-stage');
  if (stage) {
    const links = [...stage.querySelectorAll('.featured-links a')];
    const images = [...stage.querySelectorAll('.featured-media')];
    const activate = (index) => {
      stage.dataset.activeProject = String(index);
      links.forEach((link, itemIndex) => link.classList.toggle('is-active', itemIndex === index));
      images.forEach((image, itemIndex) => {
        const active = itemIndex === index;
        image.classList.toggle('is-active', active);
        const video = image.querySelector('video');
        if (!video) return;
        if (active) video.play().catch(() => {});
        else video.pause();
      });
    };
    links.forEach((link, index) => {
      link.addEventListener('pointerenter', () => activate(index));
      link.addEventListener('focus', () => activate(index));
    });
    if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      stage.addEventListener('pointermove', (event) => {
        const bounds = stage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        stage.style.setProperty('--stage-x', `${x * 18}px`);
        stage.style.setProperty('--stage-y', `${y * 14}px`);
      });
      stage.addEventListener('pointerleave', () => {
        stage.style.setProperty('--stage-x', '0px');
        stage.style.setProperty('--stage-y', '0px');
      });
    }
    activate(0);
  }

  const motionAllowed = !matchMedia('(prefers-reduced-motion:reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  const hero = document.querySelector('.hero');
  const heroTitle = hero?.querySelector('h1');
  if (hero && heroTitle && motionAllowed) {
    let heroFrame;
    const positionHeroTitle = () => {
      cancelAnimationFrame(heroFrame);
      heroFrame = requestAnimationFrame(() => {
        const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .78)));
        const openingShift = window.innerWidth <= 760 ? 42 : 39;
        hero.style.setProperty('--hero-shift', `${(1 - progress) * openingShift}vh`);
      });
    };
    positionHeroTitle();
    window.addEventListener('scroll', positionHeroTitle, { passive: true });
    window.addEventListener('resize', positionHeroTitle);
  }
  if (motionAllowed && finePointer) {
    const cursor = document.querySelector('.cursor-dot');
    let cursorFrame;
    window.addEventListener('pointermove', (event) => {
      if (!cursor) return;
      cancelAnimationFrame(cursorFrame);
      cursorFrame = requestAnimationFrame(() => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.classList.add('is-visible');
      });
    }, { passive: true });
    document.querySelectorAll('a, button, .ribbon-track figure').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor?.classList.add('is-active'));
      element.addEventListener('pointerleave', () => cursor?.classList.remove('is-active'));
    });

    document.querySelectorAll('.ribbon-track figure').forEach((card) => {
      const image = card.querySelector('img');
      card.addEventListener('pointermove', (event) => {
        if (!image) return;
        const bounds = card.getBoundingClientRect();
        image.style.setProperty('--card-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 12}px`);
        image.style.setProperty('--card-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 12}px`);
      });
      card.addEventListener('pointerleave', () => {
        image?.style.setProperty('--card-x', '0px');
        image?.style.setProperty('--card-y', '0px');
      });
    });
  }

  const contactFloat = document.querySelector('.contact-float');
  const contactToggle = document.querySelector('#contact-toggle');
  const contactDock = document.querySelector('.contact-dock');
  const setContactOpen = (open) => {
    contactFloat?.classList.toggle('is-open', open);
    contactToggle?.setAttribute('aria-expanded', String(open));
    contactDock?.setAttribute('aria-hidden', String(!open));
    contactDock?.querySelectorAll('a').forEach((link) => { link.tabIndex = open ? 0 : -1; });
  };
  setContactOpen(false);
  contactToggle?.addEventListener('click', () => setContactOpen(!contactFloat?.classList.contains('is-open')));
  document.addEventListener('pointerdown', (event) => {
    if (contactFloat && !contactFloat.contains(event.target)) setContactOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setContactOpen(false);
  });

  const floatingContact = document.querySelector('.floating-contact');
  if (floatingContact) {
    let hasAppeared = false;
    const revealFloatingContact = () => {
      const pageBottom = window.scrollY + window.innerHeight;
      const revealPoint = document.documentElement.scrollHeight - 80;
      if (hasAppeared || pageBottom < revealPoint) return;
      hasAppeared = true;
      floatingContact.classList.add('is-visible');
      window.removeEventListener('scroll', revealFloatingContact);
    };
    revealFloatingContact();
    window.addEventListener('scroll', revealFloatingContact, { passive: true });
  }

  const time = document.querySelector('#local-time');
  const updateTime = () => {
    if (!time) return;
    time.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  };
  updateTime();
  setInterval(updateTime, 60000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  const aboutStory = document.querySelector('.about-scroll');
  const aboutPin = aboutStory?.querySelector('.about-pin');
  const factTrack = aboutStory?.querySelector('.fact-track');
  if (aboutStory && factTrack && motionAllowed) {
    let aboutFrame;
    const positionFacts = () => {
      cancelAnimationFrame(aboutFrame);
      aboutFrame = requestAnimationFrame(() => {
        const bounds = aboutStory.getBoundingClientRect();
        const stickyTop = aboutPin ? parseFloat(getComputedStyle(aboutPin).top) || 0 : 0;
        const scrollDistance = Math.max(1, aboutStory.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, (stickyTop - bounds.top) / scrollDistance));
        const pinStyles = aboutPin ? getComputedStyle(aboutPin) : null;
        const pinPadding = pinStyles
          ? (parseFloat(pinStyles.paddingLeft) || 0) + (parseFloat(pinStyles.paddingRight) || 0)
          : 0;
        const visibleWidth = aboutPin ? aboutPin.clientWidth - pinPadding : aboutStory.clientWidth;
        const travel = Math.max(0, factTrack.scrollWidth - visibleWidth);
        factTrack.style.transform = `translate3d(${-progress * travel}px,0,0)`;
      });
    };
    positionFacts();
    window.addEventListener('scroll', positionFacts, { passive: true });
    window.addEventListener('resize', positionFacts);
  }

  const aboutReleaseSection = document.querySelector('.about');
  const capabilitiesReleaseSection = document.querySelector('.capabilities');
  if (aboutReleaseSection && capabilitiesReleaseSection) {
    let introFrame;
    const releaseAboutIntro = () => {
      cancelAnimationFrame(introFrame);
      introFrame = requestAnimationFrame(() => {
        const capabilitiesTop = capabilitiesReleaseSection.getBoundingClientRect().top;
        const releasePoint = window.innerHeight - 80;
        aboutReleaseSection.classList.toggle('about-is-complete', capabilitiesTop <= releasePoint);
      });
    };
    releaseAboutIntro();
    window.addEventListener('scroll', releaseAboutIntro, { passive: true });
    window.addEventListener('resize', releaseAboutIntro);
  }

  const counters = [...document.querySelectorAll('[data-count]')];
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.count || 0);
      if (!motionAllowed) {
        counter.textContent = String(target);
      } else {
        const started = performance.now();
        const duration = 900;
        const tick = (now) => {
          const progress = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(counter);
    });
  }, { threshold: .6 });
  counters.forEach((counter) => counterObserver.observe(counter));

  const aboutSection = document.querySelector('.about');
  const aboutTitle = document.querySelector('#about-title');
  if (aboutSection && aboutTitle) {
    let lastAboutScrollY = window.scrollY;
    let aboutFrame = 0;
    const updateAboutUnderline = () => {
      aboutFrame = 0;
      const currentScrollY = window.scrollY;
      const aboutBounds = aboutSection.getBoundingClientRect();
      const titleBounds = aboutTitle.getBoundingClientRect();
      const titleIsVisible = titleBounds.bottom > 0 && titleBounds.top < window.innerHeight;
      if (titleIsVisible && currentScrollY > lastAboutScrollY + 1) aboutSection.classList.add('is-emphasized');
      if ((titleIsVisible && currentScrollY < lastAboutScrollY - 1) || aboutBounds.top > window.innerHeight * .35) aboutSection.classList.remove('is-emphasized');
      lastAboutScrollY = currentScrollY;
    };
    window.addEventListener('scroll', () => {
      if (!aboutFrame) aboutFrame = requestAnimationFrame(updateAboutUnderline);
    }, { passive: true });
  }

  const brandBook = document.querySelector('.brand-book-flip');
  if (brandBook) {
    const pageImage = brandBook.querySelector('img');
    const pageCounter = brandBook.querySelector('span');
    let currentPage = 1;
    let pageTimer;
    const turnPage = () => {
      currentPage = currentPage % 18 + 1;
      const page = String(currentPage).padStart(2, '0');
      pageImage.classList.add('is-turning');
      window.setTimeout(() => {
        pageImage.src = `assets/work/pipeline/brand-book/${page}.webp`;
        pageImage.alt = `PIPELINE brand guideline page ${currentPage}`;
        pageCounter.textContent = `${page} / 18`;
        pageImage.classList.remove('is-turning');
        const next = new Image();
        next.src = `assets/work/pipeline/brand-book/${String(currentPage % 18 + 1).padStart(2, '0')}.webp`;
      }, 220);
    };
    const bookObserver = new IntersectionObserver(([entry]) => {
      window.clearInterval(pageTimer);
      if (entry.isIntersecting) pageTimer = window.setInterval(turnPage, 1800);
    }, { threshold: .3 });
    bookObserver.observe(brandBook);
  }

  const contactSection = document.querySelector('.contact');
  if (contactSection) {
    const contactObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      contactSection.classList.add('is-visible');
      contactObserver.disconnect();
    }, { threshold: .22 });
    contactObserver.observe(contactSection);
  }

})();
