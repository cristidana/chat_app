document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('messagesContainerAdmin')) {
    const messagesContainer = document.getElementById('messagesContainerAdmin');
    const adminMessageForm = document.getElementById('adminMessageForm');
    const adminMessageInput = document.getElementById('adminMessage');
    let selectedUserId = null;

    fetch('/admin/users-with-messages')
      .then(response => response.json())
      .then(data => {
        data.users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.className = 'p-4 bg-gray-200 rounded-md cursor-pointer';
          userElement.textContent = user.username;
          userElement.dataset.userId = user.id;

          userElement.addEventListener('click', () => {
            selectedUserId = user.id;
            fetchMessages(selectedUserId);
          });

          usersList.appendChild(userElement);
        });
      });

    async function fetchMessages(userId) {
      try {
        const response = await fetch(`/admin/messages/${userId}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          displayMessagesAdmin(data.messages);
        } else {
          console.error('Failed to fetch messages:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      }
    }

    function displayMessagesAdmin(messages) {
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
          messageDiv.classList.add('bg-gray-200');
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

    async function sendAdminMessage(event) {
      event.preventDefault();
      const message = adminMessageInput.value.trim();
      if (!message) return;

      try {
        const response = await fetch(`/admin/message/${selectedUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (response.ok) {
          const result = await response.json();
          displayMessagesAdmin(result.messages);
          adminMessageInput.value = '';
        } else {
          console.error('Failed to send message:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }

    document.getElementById('usersList').addEventListener('click', function(event) {
      const userId = event.target.dataset.userId;
      if (userId) {
        selectedUserId = userId;
        fetchMessages(userId);
      }
    });

    adminMessageForm.addEventListener('submit', sendAdminMessage);
  }
});
