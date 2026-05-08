# AI Powered Fleet and Delivery Tracker

Lightweight prototype that visualizes drivers, zones, and live routes while providing a fleet-focused conversational assistant for questions about drivers, orders, deliveries, and fleet status.

Repository layout
- `client` — React + Vite dashboard with a Leaflet map and UI panels
- `server` — Express HTTP API and AI query controller
- `socket` — Socket.io service broadcasting live driver/order updates
- `ai` — MCP-style server tooling and agentic router (Model Context Protocol)
- `database` — in-memory state and MongoDB-ready schema/seed helpers

Getting started
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and update values if needed.
3. Run `npm install` from the repository root.
4. Start the prototype:

```bash
npm run dev
```

You can run parts individually:

```bash
npm run dev:server
npm run dev:socket
npm run dev:client
npm run dev:ai
```

What works now
- Live map with driver markers, delivery highlights, and route polylines
- Real-time updates via Socket.io
- Fleet-focused AI agent powered by an MCP tool server (no hardcoded app internals)
- In-memory seed data with optional MongoDB connection

Challenges faced
-Building a proper MCP tool server and defining a clear agentic routing strategy to ensure the assistant stays focused on fleet-related queries without leaking application architecture details.
-Working with the leaflet map and custom marker icons was tricky, especially ensuring proper sizing and preventing overflow.
- Working with the MCP SDK and agentic routing paradigm was new, leading to initial setup issues and response formatting challenges
- Early AI runtime instability due to missing/pruned dependencies and incorrect MCP SDK initialization.
- The assistant would sometimes respond with application-internal explanations (code/architecture) instead of fleet-focused answers.
- Map marker rendering was inconsistent: too many markers were replaced with vehicle artwork and a bike image displayed at an unexpectedly large size.

How i solved them
- Carefully restructured the MCP server setup to ensure all necessary dependencies are included and the server initializes correctly, allowing the AI agent to function reliably.
- Had to learn about leaflet's custom icon system and experiment with CSS to get the markers to render correctly without overflow or sizing issues.
-I have implemented a more robust agentic routing strategy that strictly scopes the assistant's responses to fleet-related topics, ensuring it provides relevant and focused answers without leaking internal application details.
- Restored and fixed dependency imports and corrected MCP server initialization so the tool server starts reliably.
- Reworked the agent logic to scope responses strictly to fleet, orders, deliveries, routes, and status; removed the application-knowledge branch.
- Replaced the large bike asset with a compact inline SVG marker, restricted which markers render as vehicles (drivers only), and tightened CSS to prevent overflow and sizing issues.

Future improvements
- Add accessibility labels and keyboard navigation for map popups and legend items.
- Persist live data into MongoDB and replace in-memory seed flows with real CRUD endpoints.
- Add user authentication and driver assignment workflows.
- Add automated visual regression tests for the map layout and marker rendering.

Explanation video recording (drive link)
- Replace the placeholder below with your Drive recording link:

https://drive.google.com/file/d/REPLACE_WITH_YOUR_VIDEO_ID/view

Notes on cleanup
- Removed local `.env` from the repository to avoid leaking local secrets; `.env.example` is provided as a template.


