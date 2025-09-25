document.addEventListener('animationend', (e) => {
  if (e.animationName === 'drop-in-out') {
    e.target.className += ' hidden';
  }
});
