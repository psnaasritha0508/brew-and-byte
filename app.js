

'use strict';

/* ── Cached DOM references ─────────────────────────────────── */
const menuGrid    = document.getElementById('menu-grid');
const orderCount  = document.getElementById('order-count');
const orderBadge  = document.getElementById('order-counter');
const contactForm = document.querySelector('form[aria-label="Contact form"]');

/* ── Order state ───────────────────────────────────────────── */
let totalItems = 0;

/**
 * Updates the live counter in the header.
 * @param {string} itemName - The display name of the item just added.
 */
function updateCounter(itemName) {
  totalItems += 1;

  // Write the new count into the <strong> inside <output>
  orderCount.textContent = totalItems;

  // Announce the addition to screen readers via the aria-live <output>
  // (aria-atomic="true" means the full output text is read, not just the diff)
  orderBadge.setAttribute(
    'aria-label',
    `${itemName} added. Items in order: ${totalItems}`
  );

  // Briefly apply a CSS class that triggers the scale-up animation,
  // then remove it so the animation can re-trigger on the next click.
  orderBadge.classList.add('bump');
  orderBadge.addEventListener(
    'animationend',
    () => orderBadge.classList.remove('bump'),
    { once: true }
  );

  // Fallback: remove class via timeout (covers CSS transition, not animation)
  setTimeout(() => orderBadge.classList.remove('bump'), 300);
}


/* ── ① SINGLE delegated click listener on #menu-grid ──────── */

if (menuGrid) {
  menuGrid.addEventListener('click', (event) => {

    // Walk up the DOM from event.target to find the closest matching
    // button. Returns null if the click happened somewhere else
    // in the grid (e.g. on the card image or text).
    const btn = event.target.closest('button[data-item]');

    // Guard: ignore clicks that didn't land on (or inside) an order button
    if (!btn) return;

    // Extract the item name stored in the data-item attribute
    const itemName = btn.dataset.item;

    // Update the header counter display
    updateCounter(itemName);

    // Brief visual feedback on the button itself
    btn.textContent = '✓ Added!';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Add to order';
      btn.disabled = false;
    }, 1200);
  });
}


/* ── ② Contact form — prevent default, validate, alert ────── */
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    // Always prevent the default browser form submission / page reload
    event.preventDefault();

    const name    = contactForm.querySelector('#name').value.trim();
    const email   = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    // Simple presence + basic email-format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      alert('⚠️ Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    if (!emailPattern.test(email)) {
      alert('⚠️ Please enter a valid email address (e.g. jane@example.com).');
      return;
    }

    // All fields valid — show confirmation
    alert(
      `☕ Thanks, ${name}!\n\nYour message has been sent. We'll reply to ${email} within 24 hours.`
    );

    // Reset the form back to its empty state
    contactForm.reset();
  });
}


/* ── ③ Scroll-spy: highlight active nav link ───────────────── */
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const spySections = document.querySelectorAll('main section[id]');

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.toggleAttribute('aria-current', isActive);
      });
    });
  },
  // Trigger when a section occupies roughly the middle third of the viewport
  { rootMargin: '-35% 0px -55% 0px' }
);

spySections.forEach((section) => spyObserver.observe(section));
