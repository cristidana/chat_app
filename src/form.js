document.addEventListener('DOMContentLoaded', function() {
  const supportForm = document.getElementById('supportForm');

  if (supportForm) {
    supportForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const agency = document.getElementById('agency').value;
      const problemDescription = document.getElementById('problemDescription').value;

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, agency, problemDescription }),
        });

        if (response.ok) {
          // Handle successful registration
          window.location.href = '/chat';
        } else {
          const errorData = await response.json();
          alert(errorData.message); // Display the error message
        }
      } catch (error) {
        console.error('Error during registration:', error.message);
      }
    });
  }
});
