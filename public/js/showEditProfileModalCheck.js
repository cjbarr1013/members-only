document.addEventListener(
  'DOMContentLoaded',
  () => {
    setTimeout(() => {
      document.querySelector('#edit-profile-btn').click();
    }, 500);
  },
  { once: true }
);
