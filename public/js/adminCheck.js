const toggle = document.getElementById('adminChecked');
const secret = document.getElementById('adminValue');
const hint = document.getElementById('adminValueHint');

function toggleInputDisabled() {
  const on = toggle.checked;
  secret.disabled = !on;
  secret.value = '';
  hint.classList.toggle('hidden', !on);
}

document.addEventListener('DOMContentLoaded', toggleInputDisabled);
toggle.addEventListener('change', toggleInputDisabled);
