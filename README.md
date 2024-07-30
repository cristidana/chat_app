# Chat Application

A simple chat application built with Node.js, Express.js, MySQL, and bcrypt. This app allows users to register, log in, and chat with admins. Admins can also manage users and send messages.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)

## Features

- User registration and login
- User-to-admin chat
- Admin management panel
- Admin-to-user messaging
- Role-based access control

## Technologies Used

- Node.js
- Express.js
- MySQL
- bcryptjs
- Nodemon (for development)

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- Git

### Clone the Repository

```bash
git clone https://github.com/cristidana/chat_app.git
cd chat_app
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
```bash
cp .env.example .env
```

### Set Up the Database:
```bash
npm run setup-db
```

### Start the Application:
```bash
#For development:
npm run dev

#For production:
npm start
```