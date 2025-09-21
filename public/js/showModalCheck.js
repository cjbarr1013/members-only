document.addEventListener(
  'DOMContentLoaded',
  () => {
    setTimeout(() => {
      document.querySelector('#new-post-btn').click();
    }, 500);
  },
  { once: true }
);
