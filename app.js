/*
 * PharmaConnect landing page powered by Anime.js.
 *
 * This script drives the morphing hero illustration, scrollâ€‘driven
 * timeline progression and staggered section reveals. It also
 * handles tab switching and simple form submission alerts. By
 * basing the animation on Anime.js timelines and scroll position,
 * we achieve smooth, frame perfect transitions without relying on
 * heavyweight 3D libraries. Feel free to tweak the shapes array or
 * timeline durations to customise the hero animation.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------
   * HERO ANIMATION SETUP
   *
   * The hero illustration consists of a central path that morphs
   * between several definitions, a dotted sine wave and four coloured
   * arcs. Anime.js timelines control these properties and are synced
   * with the user's scroll progress.
   */
  const centerShape = document.getElementById('center-shape');
  const wavePath = document.getElementById('wave-path');

  // Path definitions for the morphing central shape. Each entry in the
  // array should be a valid SVG path string describing a closed shape.
  const shapes = [
    'M250,150 Q400,250 250,350 Q100,250 250,150 Z',
    'M250,100 Q400,250 250,400 Q100,250 250,100 Z',
    'M200,200 Q300,150 300,300 Q200,350 200,200 Z',
    'M150,250 Q250,150 350,250 Q250,350 150,250 Z'
  ];

  // Create a timeline that morphs the central shape through the
  // definitions above. The timeline is paused and will be driven
  // manually based on scroll progress.
  const morphTimeline = anime.timeline({
    targets: centerShape,
    easing: 'easeInOutQuad',
    duration: 1200,
    autoplay: false
  });
  shapes.forEach((shape, idx) => {
    if (idx === 0) return;
    morphTimeline.add({
      d: [{ value: shape }],
      duration: 1200
    });
  });

  // Animate the sine wave's dashed offset continuously so that it
  // appears to move along its path. The animation loops infinitely.
  anime({
    targets: wavePath,
    strokeDashoffset: [0, -200],
    duration: 3000,
    easing: 'linear',
    loop: true
  });

  // Rotate the coloured arcs around the centre. Each arc rotates
  // independently to add subtle variation. The transform origin is
  // configured via CSS on the SVG element.
  anime({
    targets: ['#arc-red', '#arc-orange', '#arc-green', '#arc-teal'],
    rotate: 360,
    duration: 20000,
    easing: 'linear',
    loop: true
  });

  /**
   * Update the hero animation based on the current scroll position.
   * The scroll ratio determines which part of the morph timeline
   * should be displayed. It also moves the scroll progress indicator.
   */
  const progressDot = document.querySelector('.scroll-progress .progress-dot');
  const progressContainer = document.querySelector('.scroll-progress');
  function updateScrollAnimations() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    // Seek the morph timeline to the appropriate time. The
    // morphTimeline.duration property is the total duration of all
    // added animations.
    const total = morphTimeline.duration;
    morphTimeline.seek(total * progress);
    // Move the scroll indicator dot along its container
    if (progressDot && progressContainer) {
      const barHeight = progressContainer.clientHeight;
      const dotHeight = progressDot.clientHeight;
      const yPos = progress * (barHeight - dotHeight) + dotHeight / 2;
      progressDot.style.top = `${yPos}px`;
    }
  }
  updateScrollAnimations();
  window.addEventListener('scroll', updateScrollAnimations);
  window.addEventListener('resize', updateScrollAnimations);

  /* ------------------------------------------------------------------
   * SECTION REVEALS
   *
   * Fade in each section's content as it enters the viewport. A single
   * IntersectionObserver triggers a staggered animation on the child
   * elements of every .container inside a .section. This provides
   * subtle motion as the user scrolls.
   */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targets = entry.target.querySelectorAll('h2, p, ul, li, .step, .icon-heading, .signup-tabs, form, .signup-footer');
        anime({
          targets,
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 800,
          delay: anime.stagger(100),
          easing: 'easeOutQuart'
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.section .container').forEach(container => {
    observer.observe(container);
  });

  /* ------------------------------------------------------------------
   * TAB SWITCHING
   *
   * Toggle between investor and pharmacist signâ€‘up forms when the
   * corresponding tab button is clicked. Active states are applied
   * using CSS classes defined in the stylesheet.
   */
  const tabButtons = document.querySelectorAll('.tab-button');
  const forms = document.querySelectorAll('.signup-form');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset active classes
      tabButtons.forEach(b => b.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      // Activate clicked button and corresponding form
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetForm = document.getElementById(targetId);
      if (targetForm) targetForm.classList.add('active');
    });
  });

  /* ------------------------------------------------------------------
   * FORM SUBMISSION
   *
   * Provide a simple acknowledgement when a user submits either form.
   */
  document.querySelectorAll('.signup-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for signing up! Our team will reach out to you shortly.');
      form.reset();
    });
  });
});
