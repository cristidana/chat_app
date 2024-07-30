document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('messageForm')) {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('message');
    const messagesContainer = document.getElementById('messagesContainer');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    async function fetchMessages() {
      try {
        const response = await fetch('/messages');
        if (response.ok) {
          const data = await response.json();
          const { userId, messages } = data;
          displayMessages(userId, messages);
        } else {
          console.error('Failed to fetch messages:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      }
    }

    function displayMessages(userId, messages) {
      messagesContainer.innerHTML = '';

      messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('border', 'border-gray-300', 'p-3', 'my-2', 'rounded-lg', 'flex', 'flex-col', 'items-start', 'w-1/3');

        const senderName = document.createElement('div');
        senderName.classList.add('text-xs', 'text-black-800', 'mb-1', 'font-bold');
        senderName.textContent = message.sender === 'admin' ? 'Admin' : message.username;
        messageDiv.appendChild(senderName);

        const textDiv = document.createElement('div');
        textDiv.classList.add('text-base', 'text-gray-800', 'mb-2', 'w-full', 'break-words');
        textDiv.textContent = message.message;

        if (message.sender === 'admin') {
          messageDiv.classList.add('bg-gray-400');
        }

        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('text-xs', 'text-gray-600');
        const createdAt = new Date(message.created_at);
        timestampDiv.textContent = `Sent at ${createdAt.toLocaleString()}`;

        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timestampDiv);

        messagesContainer.appendChild(messageDiv);
      });

      messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    fetchMessages();

    async function sendMessage(event) {
      event.preventDefault();
      const message = messageInput.value.trim();
      if (!message) return;

      try {
        const response = await fetch('/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (response.ok) {
          const result = await response.json();
          displayMessages(result.userId, result.messages);
          messageInput.value = '';
        } else {
          console.error('Failed to send message:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }

    messageForm.addEventListener('submit', sendMessage);
    sendMessageBtn.addEventListener('click', sendMessage);
  }
});
