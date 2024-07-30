document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role === 'ADMIN_ROLE') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/chat';
          }
        } else {
          const errorData = await response.json();
          showError(errorData.message, 'loginError');
        }
      } catch (error) {
        console.error('Error during login:', error.message);
      }
    });
  }
});
