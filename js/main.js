/* ============================================
   McAteer Pitch Site — Main JS
   Intersection Observer, Counters, Chart.js
   ============================================ */

(function () {
  'use strict';

  // --- Reduced Motion Check ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Counter Animation ---
  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    if (prefersReducedMotion) {
      el.textContent = prefix + target.toLocaleString() + suffix;
      return;
    }

    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // --- Chart.js: Enrollment Line Chart ---
  let enrollmentChartInstance = null;

  function initEnrollmentChart() {
    const ctx = document.getElementById('enrollmentChart');
    if (!ctx || enrollmentChartInstance) return;

    enrollmentChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025*'],
        datasets: [{
          label: 'Student Enrollment',
          data: [6600, 6866, 6800, 6700, 6500, 6300, 6200, 6120, 5859, 5661],
          borderColor: '#D97706',
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#D97706',
          pointBorderColor: '#D97706',
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1117',
            titleFont: { family: "'JetBrains Mono', monospace", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
            padding: 12,
            cornerRadius: 4,
            callbacks: {
              label: function (context) {
                return context.parsed.y.toLocaleString() + ' students';
              }
            }
          }
        },
        scales: {
          y: {
            min: 5000,
            max: 7200,
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#6B7280',
              callback: function (value) {
                return value.toLocaleString();
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#6B7280'
            }
          }
        }
      },
      plugins: [{
        id: 'annotationLabel',
        afterDraw: function (chart) {
          var meta = chart.getDatasetMeta(0);
          var lastPoint = meta.data[meta.data.length - 1];
          if (!lastPoint) return;
          var ctx2 = chart.ctx;
          ctx2.save();
          ctx2.font = "11px 'JetBrains Mono', monospace";
          ctx2.fillStyle = '#D97706';
          ctx2.textAlign = 'right';
          ctx2.fillText('↓ ~1,200 students lost', lastPoint.x - 8, lastPoint.y - 12);
          ctx2.restore();
        }
      }]
    });
  }

  // --- Chart.js: Budget Horizontal Bar ---
  let budgetChartInstance = null;

  function initBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx || budgetChartInstance) return;

    budgetChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['2023-24', '2024-25', '2025-26', '2026-27*'],
        datasets: [{
          label: 'Budget Reduction ($M)',
          data: [8.2, 3.0, 2.98, 4.0],
          backgroundColor: ['#94A3B8', '#B0956B', '#D97706', '#F59E0B'],
          borderRadius: 4,
          barThickness: 32
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        animation: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1117',
            titleFont: { family: "'JetBrains Mono', monospace", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
            padding: 12,
            cornerRadius: 4,
            callbacks: {
              label: function (context) {
                return '$' + context.parsed.x + 'M';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              callback: function (val) { return '$' + val + 'M'; },
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#6B7280'
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#6B7280'
            }
          }
        }
      }
    });
  }

  // --- Intersection Observer ---
  function initObserver() {
    const animElements = document.querySelectorAll('.animate-on-scroll');

    // If reduced motion, just make everything visible
    if (prefersReducedMotion) {
      animElements.forEach(function (el) {
        el.classList.add('visible');
      });
      // Still init charts and counters immediately
      document.querySelectorAll('[data-counter]').forEach(animateCounter);
      initEnrollmentChart();
      initBudgetChart();
      return;
    }

    // Stagger delay tracking per parent section
    var sectionDelays = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var section = el.closest('.section');
          var sectionId = section ? section.id : 'default';

          // Calculate stagger delay based on order within section
          if (!sectionDelays[sectionId]) {
            sectionDelays[sectionId] = 0;
          }

          var delay = sectionDelays[sectionId] * 0.1;
          sectionDelays[sectionId]++;

          el.style.transitionDelay = delay + 's';
          el.classList.add('visible');

          // Counter animation
          var counters = el.querySelectorAll('[data-counter]');
          if (counters.length) {
            counters.forEach(function (counter) {
              setTimeout(function () { animateCounter(counter); }, delay * 1000);
            });
          }

          // If this element itself has a counter
          if (el.dataset && el.dataset.counter) {
            setTimeout(function () { animateCounter(el); }, delay * 1000);
          }

          // Chart init
          if (el.dataset && el.dataset.chart === 'enrollment') {
            setTimeout(initEnrollmentChart, delay * 1000 + 200);
          }
          if (el.dataset && el.dataset.chart === 'budget') {
            setTimeout(initBudgetChart, delay * 1000 + 200);
          }

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    animElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Init on DOM ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }

})();
