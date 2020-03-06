window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.sidebar-toggle').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
});
