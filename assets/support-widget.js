document.addEventListener('DOMContentLoaded', () => {
  const launcher = document.querySelector('.support-widget__launcher');
  const widget = document.querySelector('.support-widget');
  const overlay = document.querySelector('.support-widget__overlay');
  const closeBtn = document.querySelector('.widget-close');

  const panel = document.querySelector('.support-widget__panel');

  let focusableElements = [];
  let firstFocusableElement = null;
  let lastFocusableElement = null;

  const categoriesView = document.querySelector('.widget-view--categories');
  const questionsView = document.querySelector('.widget-view--questions');
  const answerView = document.querySelector('.widget-view--answer');

  const categoryCards = document.querySelectorAll('.faq-category-card');
  const questionCards = document.querySelectorAll('.faq-question-card');
  const featuredFaqLinks = document.querySelectorAll('.featured-faq-link');

  const backToCategories = document.querySelector('.back-to-categories');
  const backToQuestions = document.querySelector('.back-to-questions');

  const currentCategoryTitle = document.querySelector(
    '.current-category-title'
  );

  const tooltip = document.getElementById('global-tooltip');

  const tooltipLinks =
    document.querySelectorAll(
      '.support-contact-link'
    );

  const allAnswers = document.querySelectorAll('.faq-answer');

  let currentCategory = '';
  let currentFaqId = '';
  let openedFromFeatured = false;

  function openWidget() {
    widget.classList.add('is-open');
    widget.setAttribute('aria-hidden', 'false');

    setupFocusTrap();
  }

  function closeWidget() {
    widget.classList.remove('is-open');
    widget.setAttribute('aria-hidden', 'true');

    categoriesView.classList.add('active');
    questionsView.classList.remove('active');
    answerView.classList.remove('active');

    launcher.focus();
  }

  function switchView(fromView,toView,direction = 'forward') {
    if (!fromView || !toView) return;
    if (fromView === toView) return;

    toView.classList.add('active');

    if (direction === 'forward') {

      toView.classList.add('slide-in-right');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toView.classList.remove('slide-in-right');
        });
      });

      fromView.classList.add('slide-out-left');

    } else {

      toView.classList.add('active');

      toView.animate(
        [
          {
            transform: 'translateX(-30px)',
            opacity: 0
          },
          {
            transform: 'translateX(0)',
            opacity: 1
          }
        ],
        {
          duration: 300,
          easing: 'ease-out'
        }
      );

      fromView.animate(
        [
          {
            transform: 'translateX(0)',
            opacity: 1
          },
          {
            transform: 'translateX(30px)',
            opacity: 0
          }
        ],
        {
          duration: 300,
          easing: 'ease-out'
        }
      );

      setTimeout(() => {
        fromView.classList.remove('active');
      }, 300);
    }

    setTimeout(() => {

      fromView.classList.remove(
        'active',
        'slide-out-left',
        'slide-out-right'
      );

    }, 350);
  }

  function showCategoriesView() {
    const currentView =
      document.querySelector(
        '.widget-view.active'
      );

    if (currentView !== categoriesView) {
      switchView(
        currentView,
        categoriesView,
        'back'
      );
    }
  }

  function showQuestionsView(categoryId) {
    currentCategory = categoryId;

    switchView(
      categoriesView,
      questionsView,
      'forward'
    );

    let categoryTitle = '';

    categoryCards.forEach((card) => {
      if (card.dataset.category === categoryId) {
        const titleElement = card.querySelector('span');

        if (titleElement) {
          categoryTitle = titleElement.textContent.trim();
        }
      }
    });

    currentCategoryTitle.textContent = categoryTitle;

    questionCards.forEach((question) => {
      question.style.display =
        question.dataset.category === categoryId
          ? 'block'
          : 'none';
    });
  }

  function showAnswerView(faqId) {
    currentFaqId = faqId;

    switchView(
      questionsView,
      answerView,
      'forward'
    );

    const activeAnswer = document.querySelector(
      `.faq-answer[data-faq="${faqId}"]`
    );

    if (!activeAnswer) return;

    const currentActive =
    document.querySelector(
      '.faq-answer.active'
    );

    if (currentActive) {
      currentActive.classList.remove('active');

      setTimeout(() => {
        activeAnswer.classList.add('active');
      }, 150);
    } else {
      activeAnswer.classList.add('active');
    }

      document.querySelector(
        '.answer-question-title'
      ).textContent =
        activeAnswer.dataset.question;

      document.querySelector(
        '.answer-category-title'
      ).textContent =
        activeAnswer.dataset.categoryTitle;

      setupPrevNext(activeAnswer);
  }

  function setupPrevNext(activeAnswer) {
    const category =
      activeAnswer.dataset.category;

    const categoryFaqs =
      [...allAnswers].filter(
        faq => faq.dataset.category === category
      );

    const currentIndex =
      categoryFaqs.findIndex(
        faq =>
          faq.dataset.faq ===
          activeAnswer.dataset.faq
      );

    const prevButton =
      activeAnswer.querySelector(
        '.faq-prev-question'
      );

    const nextButton =
      activeAnswer.querySelector(
        '.faq-next-question'
      );

    if (currentIndex > 0) {
      const prevFaq =
        categoryFaqs[currentIndex - 1];

      prevButton.style.display = 'block';

      prevButton.innerHTML = `
        <span class="faq-nav-question">
          <span class="question-arrow question-arrow--prev">←</span>
          ${prevFaq.dataset.question}
        </span>
      `;

      prevButton.onclick = () => {
        showAnswerView(prevFaq.dataset.faq);
      };
    } else {
      prevButton.style.display = 'none';
    }

    if (currentIndex < categoryFaqs.length - 1) {
      const nextFaq =
        categoryFaqs[currentIndex + 1];

      nextButton.style.display = 'block';

      nextButton.innerHTML = `
        <span class="faq-nav-question">
          <span class="question-arrow question-arrow--next">→</span> ${nextFaq.dataset.question}
        </span>
      `;

      nextButton.onclick = () => {
        showAnswerView(nextFaq.dataset.faq);
      };
    } else {
      nextButton.style.display = 'none';
    }
  }

  function setupFocusTrap() {
    focusableElements = panel.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements.length) return;

    firstFocusableElement = focusableElements[0];
    lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    firstFocusableElement.focus();
  }

  launcher?.addEventListener('click', openWidget);

  closeBtn?.addEventListener('click', closeWidget);

  overlay?.addEventListener('click', closeWidget);

  document.addEventListener('keydown', (event) => {
    if (!widget.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeWidget();
      return;
    }

    if (event.key === 'Tab') {

      if (!focusableElements.length) {
        return;
      }

      if (event.shiftKey) {

        if (
          document.activeElement ===
          firstFocusableElement
        ) {
          event.preventDefault();
          lastFocusableElement.focus();
        }

      } else {

        if (
          document.activeElement ===
          lastFocusableElement
        ) {
          event.preventDefault();
          firstFocusableElement.focus();
        }

      }
    }
  });

  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      openedFromFeatured = false;

      const categoryId =
        card.dataset.category;

      showQuestionsView(categoryId);
    });
  });

  questionCards.forEach((question) => {
    question.addEventListener('click', () => {
      const faqId =
        question.dataset.faq;

      showAnswerView(faqId);
    });
  });

  featuredFaqLinks.forEach((faq) => {
    faq.addEventListener('click', () => {
      openedFromFeatured = true;

      const faqId =
        faq.dataset.faq;

      openWidget();

      showAnswerView(faqId);
    });
  });

  backToCategories?.addEventListener('click', () => {
    switchView(
      questionsView,
      categoriesView,
      'back'
    );
  });

  backToQuestions?.addEventListener('click', () => {
    if (openedFromFeatured) {
      openedFromFeatured = false;
      switchView(
        answerView,
        categoriesView,
        'back'
      );
    } else {
      switchView(
        answerView,
        questionsView,
        'back'
      );
    }
  });

  tooltipLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {

      const text =
        link.dataset.tooltip;

      tooltip.textContent = text;

      tooltip.classList.add('show');

      const rect =
        link.getBoundingClientRect();

      const tooltipRect =
        tooltip.getBoundingClientRect();

      tooltip.style.left =
        `${rect.left +
          rect.width / 2 -
          tooltipRect.width / 2}px`;

      tooltip.style.top =
        `${rect.top -
          tooltipRect.height -
          12}px`;
    });

    link.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });
  });

  [
    ...categoryCards,
    ...questionCards,
    ...featuredFaqLinks
  ].forEach((element) => {

    element.addEventListener('keydown', (event) => {

      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        element.click();
      }

    });

  });
});