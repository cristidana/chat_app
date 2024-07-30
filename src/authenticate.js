document.addEventListener('DOMContentLoaded', function() {
  const authSubmit = document.getElementById('authSubmit');
  const errorMessage = document.getElementById('errorMessage');

  // Event listener for authentication form submission
  authSubmit.addEventListener('click', async function() {
    const email = document.getElementById('email').value.trim();

    try {
      const response = await fetch('/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        // Redirect to chat page on successful authentication
        window.location.href = '/chat'; // Redirect to /chat
      } else {
        // Display error message
        errorMessage.textContent = data.message;
      }
    } catch (error) {
      console.error('Error during authentication:', error.message);
    }
  });
});
