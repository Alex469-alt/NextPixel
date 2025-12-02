(function () {
  'use strict';

  const qs = (selector, ctx = document) => ctx.querySelector(selector);
  const qsa = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

  function initCurrentYear() {
    const yearEl = qs('#current-year');
    if (!yearEl) return;
    const year = new Date().getFullYear();
    yearEl.textContent = String(year);
  }

  function initNav() {
    const toggle = qs('.nav-toggle');
    const nav = qs('.nav');
    if (!toggle || !nav) return;

    const setState = (isOpen) => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      nav.classList.toggle('nav--open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    };

    toggle.addEventListener('click', () => {
      const current = toggle.getAttribute('aria-expanded') === 'true';
      setState(!current);
    });

    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      setState(false);
    });
  }

  function initCallbackModal() {
    const modal = qs('.callback');
    if (!modal) return;

    const dialog = qs('.callback__dialog', modal);
    const overlay = qs('.callback__overlay', modal);
    const openers = qsa('[data-open-modal="callback"]');
    const closers = qsa('[data-modal-close]', modal);
    const phoneInput = qs('#callback-phone', modal);

    if (!openers.length || !dialog) return;

    const open = () => {
      modal.classList.add('callback--open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (phoneInput) {
        window.setTimeout(() => {
          phoneInput.focus();
        }, 10);
      }
    };

    const close = () => {
      modal.classList.remove('callback--open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    openers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        open();
      });
    });

    if (overlay) {
      overlay.addEventListener('click', close);
    }

    closers.forEach((btn) => {
      btn.addEventListener('click', close);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (modal.classList.contains('callback--open')) {
          close();
        }
      }
    });
  }

  function initSmoothScroll() {
    const handleClick = (event) => {
      const link = event.target.closest('a, button[data-scroll-target]');
      if (!link) return;

      let targetId = null;

      if (link.tagName === 'A') {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#') || href === '#') return;
        targetId = href;
      } else if (link.hasAttribute('data-scroll-target')) {
        targetId = link.getAttribute('data-scroll-target');
      }

      if (!targetId) return;

      const targetEl = qs(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if ('scrollIntoView' in targetEl) {
        targetEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      } else {
        const top = targetEl.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    };

    document.addEventListener('click', handleClick);
  }

  function initFaqAccordion() {
    const items = qsa('[data-faq-item]');
    if (!items.length) return;

    const closeItem = (item) => {
      const question = qs('.faq__question', item);
      const answer = qs('.faq__answer', item);
      if (!question || !answer) return;

      item.classList.remove('faq__item--open');
      question.setAttribute('aria-expanded', 'false');
      answer.hidden = true;
    };

    const openItem = (item) => {
      const question = qs('.faq__question', item);
      const answer = qs('.faq__answer', item);
      if (!question || !answer) return;

      item.classList.add('faq__item--open');
      question.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    };

    items.forEach((item) => {
      const question = qs('.faq__question', item);
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq__item--open');

        items.forEach((other) => {
          if (other !== item) {
            closeItem(other);
          }
        });

        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });
  }

  function initPricingToggle() {
    const container = qs('.pricing');
    if (!container) return;

    const buttons = qsa('[data-pricing-target]', container);
    const panels = qsa('[data-pricing-panel]', container);
    if (!buttons.length || !panels.length) return;

    const setActive = (target) => {
      buttons.forEach((btn) => {
        const isActive = btn.getAttribute('data-pricing-target') === target;
        btn.classList.toggle('pricing-toggle__btn--active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        const isMatch = panel.getAttribute('data-pricing-panel') === target;
        panel.classList.toggle('pricing-card--hidden', !isMatch);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-pricing-target');
        if (!target) return;
        setActive(target);
      });
    });
  }

  function initReviewsSlider() {
    const container = qs('.reviews');
    if (!container) return;

    const cards = qsa('.review-card', container);
    const dots = qsa('[data-review-dot]', container);
    const prevBtn = qs('[data-reviews-prev]', container);
    const nextBtn = qs('[data-reviews-next]', container);

    if (!cards.length || !dots.length) return;

    let index = 0;

    const update = () => {
      cards.forEach((card, i) => {
        card.classList.toggle('review-card--active', i === index);
      });

      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('reviews__dot--active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    };

    const next = () => {
      index = (index + 1) % cards.length;
      update();
    };

    const prev = () => {
      index = (index - 1 + cards.length) % cards.length;
      update();
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', next);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', prev);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        index = i;
        update();
      });
    });

    let autoId = null;
    const startAuto = () => {
      if (autoId) return;
      autoId = window.setInterval(next, 12000);
    };
    const stopAuto = () => {
      if (!autoId) return;
      window.clearInterval(autoId);
      autoId = null;
    };

    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    update();
    startAuto();
  }

  function initFormsValidation() {
    const forms = qsa('form[data-validate]');
    if (!forms.length) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setError = (form, name, message) => {
      const errorEl = qs(`.form__error[data-error-for="${CSS.escape(name)}"]`, form);
      const input = qs(`[name="${CSS.escape(name)}"]`, form);
      if (errorEl) {
        errorEl.textContent = message || '';
      }
      if (input) {
        input.classList.toggle('form__input--invalid', Boolean(message));
      }
    };

    const clearFormMessages = (form) => {
      qsa('.form__error', form).forEach((el) => {
        el.textContent = '';
      });
      qsa('.form__input', form).forEach((input) => {
        input.classList.remove('form__input--invalid');
      });
      const success = qs('.form__success', form);
      if (success) success.textContent = '';
    };

    const validate = (form) => {
      clearFormMessages(form);

      let valid = true;

      const fields = qsa('[name]', form);
      fields.forEach((field) => {
        const { name, value, type } = field;
        const trimmed = value.trim();

        if (field.hasAttribute('required')) {
          if (type === 'checkbox') {
            if (!field.checked) {
              setError(form, name, 'Пожалуйста, подтвердите согласие.');
              valid = false;
              return;
            }
          } else if (!trimmed) {
            setError(form, name, 'Заполните это поле.');
            valid = false;
            return;
          }
        }

        if (type === 'email' && trimmed) {
          if (!EMAIL_RE.test(trimmed)) {
            setError(form, name, 'Введите корректный email.');
            valid = false;
          }
        }
      });

      return valid;
    };

    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const isValid = validate(form);

        if (!isValid) return;

        const success = qs('.form__success', form);
        if (success) {
          success.textContent = 'Форма успешно заполнена. Мы свяжемся с вами в ближайшее время.';
        }

        window.setTimeout(() => {
          form.reset();
        }, 600);
      });

      qsa('.form__input', form).forEach((input) => {
        input.addEventListener('input', () => {
          const name = input.name;
          if (!name) return;
          setError(form, name, '');
        });
      });

      const checkboxInputs = qsa('input[type="checkbox"]', form);
      checkboxInputs.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          const name = checkbox.name;
          if (!name) return;
          setError(form, name, '');
        });
      });
    });
  }

  function initScrollReveal() {
    const candidates = [
      '.hero__content',
      '.hero-offer',
      '.offer-card',
      '.feature-card',
      '.program-card',
      '.pricing-card',
      '.format-item',
      '.level-test__content',
      '.result-card',
      '.exams-text',
      '.exams-cta',
      '.review-card',
      '.faq__item',
      '.contacts__info',
      '.contacts__form-wrapper',
      '.callback__dialog'
    ];

    const elements = candidates
      .map((selector) => qsa(selector))
      .flat()
      .filter(Boolean);

    if (!elements.length || !('IntersectionObserver' in window)) {
      return;
    }

    elements.forEach((el, index) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function onReady() {
    initCurrentYear();
    initNav();
    initSmoothScroll();
    initFaqAccordion();
    initPricingToggle();
    initReviewsSlider();
    initFormsValidation();
    initCallbackModal();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


