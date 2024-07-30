function showError(message, errorContainerId) {
  let errorContainer = document.getElementById(errorContainerId);
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = errorContainerId;
    errorContainer.classList.add('text-red-500', 'mt-2', 'mb-2');
    const form = errorContainerId === 'loginError' ? document.getElementById('loginForm') : document.getElementById('registerForm');
    form.insertBefore(errorContainer, form.querySelector('.btn'));
  }
  errorContainer.textContent = message;
}
