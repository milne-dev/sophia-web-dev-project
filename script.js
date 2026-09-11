const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.hidden = true;
    document.getElementById('form-confirmation').hidden = false;
  });
}
