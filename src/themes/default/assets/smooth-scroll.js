document.addEventListener('click', event => {
  if (event.target.tagName.toLowerCase() === 'a' && /^#/.test(event.target.getAttribute('href'))) {
    const el = document.querySelector(event.target.getAttribute('href'));
    if (el) {
      event.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
});
