window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.content').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && /^#/.test(link.getAttribute('href'))) {
      const hash = link.getAttribute('href').replace(/^#/, '');
      const el = document.querySelector(`#${hash}`);
      if (el) {
        event.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
