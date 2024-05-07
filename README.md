# Cresques

Cresques is a text-based multiplayer game engine for Node.js.

## Getting Started

The server establishes a REST API using Express to handle user authentication and character creation. Once logged in to the game world, communication shifts to WebSockets. While functionally similiar to other Multi-User Dungeon (MUD) projects, world actions in Cresques are comprised of JSON payloads allowing for far more flexibility than standard MUD protocals.

### Prerequisites

Cresques was designed to be quick and easy to deploy. It was built for the following stack:

- Node.js 16+
- MySQL

### Dependencies

Cresques pulls from the following NPM libraries:

- bcryptjs
- cookie-parser
- dotenv
- express
- jsonwebtoken
- mysql2
- ws

## Deployment

Before running Cresques, the following environment variables must be defined in the `.env` file:

```
DB_HOST=mysql.domain.com
DB_USER=my_user
DB_PASSWORD=high_quality_password
DB_DATABASE=my_database
TOKEN_SECRET=some_random_characters
```

The first set of variables correspond to your database connection. `TOKEN_SECRET` is used to sign user authentication tokens and can be comprised of any random number of characters.

When ready, Cresques can be started using the following command:

```
npm run start 
```