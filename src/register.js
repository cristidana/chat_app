document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirm_password = document.getElementById('confirm_password').value;

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, confirm_password }),
        });

        if (response.ok) {
          window.location.href = '/chat';
        } else {
          const errorData = await response.json();
          showError(errorData.message, 'registerError');
        }
      } catch (error) {
        console.error('Error during registration:', error.message);
      }
    });
  }
});
