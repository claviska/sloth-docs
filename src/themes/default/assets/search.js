window.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search__input');
  const searchResults = document.querySelector('.search__results');
  const searchPages = document.querySelector('.search__pages');
  const searchNoPages = document.querySelector('.search__no-pages');
  let pageIndex;
  let searchIndex;
  let searchTimeout;

  function clearSearch() {
    searchInput.value = '';
    searchResults.setAttribute('aria-hidden', true);
  }

  function doSearch(query) {
    if (searchIndex) {
      const results = searchIndex.search(query);
      searchResults.removeAttribute('aria-hidden');

      if (results.length > 0) {
        let html = '';

        results.map(result => {
          const page = pageIndex.filter(page => page.id === result.ref)[0];
          const link = document.createElement('a');
          const title = document.createElement('div');
          const description = document.createElement('small');
          title.textContent = page.title;
          description.textContent = page.description;
          link.href = page.filename;
          link.role = 'menuitem';
          link.appendChild(title);
          link.appendChild(description);
          html += link.outerHTML;
        });

        searchPages.innerHTML = html;
        searchPages.removeAttribute('aria-hidden');
        searchNoPages.setAttribute('aria-hidden', true);
      } else {
        // No results
        searchPages.setAttribute('aria-hidden', true);
        searchNoPages.removeAttribute('aria-hidden');
      }
    }
  }

  function scrollIntoView(element, container) {
    const offsetTop = element.offsetTop;
    const minY = container.scrollTop;
    const maxY = container.scrollTop + container.offsetHeight;

    if (offsetTop < minY) {
      container.scrollTo({ top: offsetTop, behavior: 'smooth' });
    } else if (offsetTop + element.clientHeight > maxY) {
      container.scrollTo({ top: offsetTop - container.offsetHeight + element.clientHeight, behavior: 'smooth' });
    }
  }

  fetch('/search/index.json')
    .then(res => res.json())
    .then(data => {
      pageIndex = data.pageIndex;
      searchIndex = lunr.Index.load(data.lunrIndex);
    });

  // Handle search
  searchInput.addEventListener('input', event => {
    if (event.target.value !== '') {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => doSearch(event.target.value), 300);
    } else {
      clearSearch();
    }
  });

  // Handle keyboard nav
  searchInput.addEventListener('keydown', event => {
    const items = searchPages.querySelectorAll('a');
    const activeItem = searchPages.querySelector('.active');

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!activeItem) {
        items[0].classList.add('active');
      } else {
        if (activeItem.previousElementSibling) {
          activeItem.classList.remove('active');
          activeItem.previousElementSibling.classList.add('active');
          scrollIntoView(activeItem.previousElementSibling, searchResults);
        }
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!activeItem) {
        items[0].classList.add('active');
      } else {
        if (activeItem.nextElementSibling) {
          activeItem.classList.remove('active');
          activeItem.nextElementSibling.classList.add('active');
          scrollIntoView(activeItem.nextElementSibling, searchResults);
        }
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      clearSearch();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeItem) {
        activeItem.click();
      }
    }
  });

  // Clear when clicking outside of the search area
  document.addEventListener('click', event => {
    if (!searchResults.hasAttribute('aria-hidden') && !event.target.closest('.search')) {
      clearSearch();
    }
  });

  // Focus on search when pressing CMD+F, but let the second attempt trigger the browser's search
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      if (document.activeElement && document.activeElement !== searchInput) {
        event.preventDefault();
        searchInput.focus();
      }
    }
  });
});
