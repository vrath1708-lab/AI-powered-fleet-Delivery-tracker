# AI Powered Fleet and Delivery Tracker

This project follows the internship brief with the requested structure:

- `client` - React dashboard with Leaflet map and analytics widgets
- `server` - Node + Express API for dashboard data and AI query endpoints
- `socket` - WebSocket layer that simulates live driver and order updates
- `ai` - MCP tool logic for fleet questions and route guidance
- `database` - MongoDB connection, models, and seed data

## Run It

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run `npm install` from the repository root.
4. Start the full prototype:

```bash
npm run dev
```

You can also run parts individually:

```bash
npm run dev:server
npm run dev:socket
npm run dev:client
npm run dev:ai
```

## What Works Now

- Live map with drivers, delivery zones, routes, and order markers
- Real-time updates through socket.io
- AI-style query support for closest driver, delayed orders, and route suggestions
- MongoDB-ready schema layer with a local fallback for prototyping

## Deliverables To Finish

- Add deployment URL
- Add screenshot images
- Add explanation video drive link
- Replace the simulated data flow with full MongoDB CRUD when you are ready

## Notes

- The project avoids the npm workspace shell issue caused by the ampersand in the folder name by launching each part directly with Node.
- If MongoDB is not configured, the app still runs with seed data so you can demo the prototype.
I  used Llama 3.1 via Hugging Face as the AI model. Since it does not support native tool calling, i implemented a custom intent-classification and routing layer that mimics MCP behavior, allowing natural language queries to trigger backend functions.
