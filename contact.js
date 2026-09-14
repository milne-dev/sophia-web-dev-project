(function () {
  const ALLERGY_KEY = 'ASDF1234';

  document.addEventListener('DOMContentLoaded', () => {
    const pickupDate = document.getElementById('pickup-date');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    pickupDate.min = `${yyyy}-${mm}-${dd}`;

    const form = document.getElementById('contact-form');
    const allergyField = document.getElementById('allergy-notes');
    const allergyError = document.getElementById('allergy-error');

    form.addEventListener('submit', (e) => {
      const isValid = allergyField.value.trim() === ALLERGY_KEY;
      allergyError.hidden = isValid;
      allergyField.setAttribute('aria-invalid', String(!isValid));

      if (!isValid) {
        e.preventDefault();
        allergyField.focus();
      }
    });

    allergyField.addEventListener('input', () => {
      if (allergyField.value.trim() === ALLERGY_KEY) {
        allergyError.hidden = true;
        allergyField.setAttribute('aria-invalid', 'false');
      }
    });
  });
})();
