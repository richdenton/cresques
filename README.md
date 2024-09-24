# Cresques

Cresques is a text-based multiplayer game running on Node.js on the backend and React on the frontend.

## Getting Started

The server establishes a RESTful API using Express to handle user authentication and character creation. Once logged in to the game world, communication shifts to WebSockets. While functionally similiar to other Multi-User Dungeon (MUD) projects, world actions in Cresques are comprised of JSON payloads allowing for far more flexibility than standard MUD protocols.

### Prerequisites

Cresques was designed to be quick and easy to deploy. It was built for the following stack:

- Node.js 16+
- MySQL

### Dependencies

The server portion of Cresques pulls from the following NPM libraries:

- bcryptjs
- cookie-parser
- dotenv
- express
- jsonwebtoken
- mysql2
- ws

The client was built using `create-react-app` and utilizes the following libraries:

- react
- react-dom
- react-router-dom
- react-scripts

## Deployment

Before starting the server, the following environment variables must be defined in the `/server/.env` file:

```
DB_HOST=mysql.domain.com
DB_USER=my_user
DB_PASSWORD=high_quality_password
DB_DATABASE=my_database
TOKEN_SECRET=some_random_characters
```

The first set of variables correspond to your database connection. `TOKEN_SECRET` is used to sign user authentication tokens and can be comprised of any random number of characters.

When ready, the server can be started using the following command:

```
npm run start-server
```

To start the client locally, run the following command:

```
npm run start-client
```

To build the client for production, run the following command:

```
npm run build-client
```