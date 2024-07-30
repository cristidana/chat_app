

document.addEventListener('DOMContentLoaded', function() {
    // Chat page functionality
    if (document.getElementById('messageForm')) {
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('message');
        const messagesContainer = document.getElementById('messagesContainer');
        const sendMessageBtn = document.getElementById('sendMessageBtn');

        // Function to fetch messages from the server
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

        // Function to display messages in the container and scroll to bottom
        function displayMessages(userId, messages) {
            // Clear previous messages
            messagesContainer.innerHTML = '';

            messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('border', 'border-gray-300', 'p-3', 'my-2', 'rounded-lg', 'flex', 'flex-col', 'items-start', 'w-1/3');
                
                // Determine sender (assuming 'message.sender' holds the sender information)
                const senderName = document.createElement('div');
                senderName.classList.add('text-xs', 'text-black-800', 'mb-1', 'font-bold');
                senderName.textContent = message.sender === 'admin' ? 'Admin' : message.username;
                messageDiv.appendChild(senderName);
                
                const textDiv = document.createElement('div');
                textDiv.classList.add('text-base', 'text-gray-800', 'mb-2', 'w-full', 'break-words');
                textDiv.textContent = message.message;
                
                if (message.sender === 'admin') {
                    messageDiv.classList.add('bg-gray-400'); // Example: Background color change for admin messages
                }
                
                const timestampDiv = document.createElement('div');
                timestampDiv.classList.add('text-xs', 'text-gray-600');
                const createdAt = new Date(message.created_at);
                timestampDiv.textContent = `Sent at ${createdAt.toLocaleString()}`;
                
                messageDiv.appendChild(textDiv);
                messageDiv.appendChild(timestampDiv);
                
                messagesContainer.appendChild(messageDiv);
            });

            // Scroll to bottom of messages container
            messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        // Fetch messages on page load
        fetchMessages();

        // Function to handle message submission
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

    // Login functionality
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

    // Registration functionality
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

    // Function to display error messages
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

    //ADMIN
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

    // Function to fetch and display messages for admin panel
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

    // Display messages in the container based on sender (admin or user)
    function displayMessagesAdmin(messages) {
        messagesContainer.innerHTML = '';

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('border', 'border-gray-300', 'p-3', 'my-2', 'rounded-lg', 'flex', 'flex-col', 'items-start', 'w-1/3');
            
            // Determine sender (assuming 'message.sender' holds the sender information)
            const senderName = document.createElement('div');
            senderName.classList.add('text-xs', 'text-black-800', 'mb-1', 'font-bold');
            senderName.textContent = message.sender === 'admin' ? 'Admin' : message.username;
            messageDiv.appendChild(senderName);
            
            const textDiv = document.createElement('div');
            textDiv.classList.add('text-base', 'text-gray-800', 'mb-2', 'w-full', 'break-words');
            textDiv.textContent = message.message;
            
            if (message.sender === 'admin') {
                messageDiv.classList.add('bg-gray-200'); // Example: Background color change for admin messages
            }
            
            const timestampDiv = document.createElement('div');
            timestampDiv.classList.add('text-xs', 'text-gray-600');
            const createdAt = new Date(message.created_at);
            timestampDiv.textContent = `Sent at ${createdAt.toLocaleString()}`;
            
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(timestampDiv);
            
            messagesContainer.appendChild(messageDiv);
            
        });

        // Scroll to bottom of messages container
        messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // Handle admin message submission
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

    // Event listener for selecting a user from the sidebar
    document.getElementById('usersList').addEventListener('click', function(event) {
        const userId = event.target.dataset.userId;
        if (userId) {
            selectedUserId = userId;
            fetchMessages(userId);
        }
    });

    // Event listener for admin message form submission
    adminMessageForm.addEventListener('submit', sendAdminMessage);
}

setInterval(() => {
    if (selectedUserId) {
        fetchMessages(selectedUserId);
    }
}, pollInterval);

setInterval(() => {
    if (selectedUserId) {
        fetchMessages();
    }
}, pollInterval);


});
