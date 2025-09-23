document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-confirm]');
  const form = document.querySelector('#confirm-form');
  const formMsg = form.querySelector('#confirm-msg');
  const submitBtn = form.querySelector('#submit-btn');
  const cancelBtn = form.querySelector('#cancel-btn');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-confirm-path');
      formMsg.textContent = btn.getAttribute('data-confirm-message');
      submitBtn.textContent = btn.getAttribute('data-confirm-confirm-btn-msg');
      cancelBtn.textContent = btn.getAttribute('data-confirm-cancel-btn-msg');
    });
  });
});
