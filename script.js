document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.card-container');

  containers.forEach(container => {
    const selector = container.querySelector('.selector-container');
    const mainImg  = container.querySelector('.card img');
    const mainTitle = container.querySelector('.card-title');

    if (!selector || !mainImg) return; // skip if container incomplete

    const thumbs = selector.querySelectorAll('.small-card');

    thumbs.forEach((thumb, idx) => {
      // accessibility
      thumb.setAttribute('role', 'button');
      if (!thumb.hasAttribute('tabindex')) thumb.tabIndex = 0;

      const activate = () => {
        const img = thumb.querySelector('img');
        if (!img) return;
        // update only this container's main image/title
        mainImg.src = img.src;
        if (mainTitle) mainTitle.textContent = img.alt || thumb.dataset.title || `Beat ${idx+1}`;
        // active styling limited to this container
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      };

      thumb.addEventListener('click', activate);
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });

    // optional: activate the first thumb by default for this container
    if (thumbs[0]) thumbs[0].click();
  });
});