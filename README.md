# Cresques
## A modern MUD-like game server

Cresques is simple multiplayer game engine for Node.js. The server relies on Express for user authentication and WebSockets for gameplay. While functionally similiar to a multi-user dungeon, actions are handled via much smaller JSON payloads.

Currently, Cresques is quite limited. Over time, I hope to expand it to include all the basic elements of a MUD server. Goals include:

- [x] User authentication
- [x] Multiple players per user
- [x] Player movement within the world
- [x] Local and region chat
- [x] Player vs environment combat
- [x] Item handling
- [x] Dialog
- [x] Merchants
- [ ] Questing
- [ ] Dynamic environments