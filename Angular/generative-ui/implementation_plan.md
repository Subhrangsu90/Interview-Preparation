# AG-UI E-commerce / Order Support Architecture Plan

This plan establishes the architecture and implementation for an **Agentic User Interface (AG-UI)** in our full-stack Angular + Express application, using **E-commerce / Order Support** as the core domain.

It adheres to the [AG-UI standard](https://www.angulararchitects.io/en/blog/understanding-ag-ui-the-standard-for-agentic-user-interfaces/) and the patterns outlined by Manfred Steyer: decoupled message-based agent communication, Server-Sent Events (SSE) streaming, server-side tools, client-side tools (with Zod schemas), and dynamic generative UI components rendered within an AI Sidecar and the main view.

---

## User Review Required

> [!IMPORTANT]
> **LLM Provider vs Local Intelligent Agent Simulation**:
> We can support both:
> 1. **Local Domain Agent**: Runs completely offline without requiring an external paid API key, parsing natural language user queries for order tracking, lookups, cancellations, and return requests, and producing real AG-UI event streams (`RUN_STARTED`, `TOOL_CALL_*`, `TEXT_MESSAGE_*`, `RUN_FINISHED`).
> 2. **External LLM Integration**: Can optionally connect to OpenAI, Google Gemini, or Claude if an API key is provided in `.env`.
> Both will produce identical AG-UI protocol events.

> [!NOTE]
> We will install `@ag-ui/core` and `@ag-ui/client` (or leverage clean typed implementations following the official protocol specs) to ensure 100% standards compliance.

---

## Proposed Domain Features & Workflow

### 1. Domain Entities & Database (Drizzle ORM + PostgreSQL)
- **`orders` table**: `orderNumber`, `customerName`, `customerEmail`, `status` (`processing`, `shipped`, `delivered`, `cancelled`), `totalAmount`, `trackingNumber`, `carrier`, `estimatedDelivery`, `shippingAddress`.
- **`order_items` table**: `orderId`, `productName`, `quantity`, `unitPrice`, `sku`, `imageUrl`.
- **`return_requests` table**: `orderId`, `reason`, `status` (`pending`, `approved`, `rejected`), `refundAmount`.
- Seed data with realistic customer orders (e.g., `ORD-7821`, `ORD-9104`, `ORD-3312`) to demo tracking, returns, and order lookup immediately.

### 2. Server-Side AG-UI Architecture (Express)
- **AG-UI Protocol Stream Handler (`/api/agent/stream` via SSE)**:
  - Dispatches standard AG-UI events:
    - `RUN_STARTED` / `RUN_FINISHED` / `RUN_ERROR`
    - `TEXT_MESSAGE_START` / `TEXT_MESSAGE_CONTENT` / `TEXT_MESSAGE_END`
    - `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` / `TOOL_CALL_RESULT`
- **Server-Side Tools**:
  - `getOrderDetails`: Fetches complete order with line items from database.
  - `listCustomerOrders`: Searches orders by customer email or name.
  - `trackShipment`: Retrieves shipping checkpoints and real-time status.
  - `cancelOrder`: Cancels eligible orders (if still processing).
  - `createReturnRequest`: Initiates a return and refund workflow.

### 3. Client-Side Tools & Generative UI (Angular)
- **Client Tools Registered with Agent**:
  - `showOrderCard`: Renders an interactive order card widget in the sidecar.
  - `showTrackingTimeline`: Renders a visual shipment progress timeline with stages (Order Placed -> Shipped -> Out for Delivery -> Delivered).
  - `fillReturnForm`: Automates filling the return/refund form with selected order details, prompting user for confirmation (Human-in-the-Loop).
  - `navigateToOrder`: Programmatically routes the Angular router to `/orders/:orderNumber`.
- **Zod Schema Definitions**: Formatted as JSON Schemas so the agent knows exact parameter contracts.

### 4. Agentic UI Sidecar Component (`AppSidecar`)
- A floating or collapsible right-hand AI Sidecar drawer (inspired by Manfred Steyer's demo in the blog).
- Features:
  - Real-time token streaming with typing animation.
  - **Tool execution badges**: Transparently shows what the agent is doing (e.g., *"🔍 Fetching order details for ORD-7821..."*, *"📦 Querying FedEx tracking..."*).
  - **Generative UI slots**: Dynamic rendering of rich cards directly inside the conversation stream (Order Summary Card, Tracking Timeline Widget, Action Approval Buttons).
  - Quick prompt chips (e.g., *"Where is my order ORD-7821?"*, *"I want to return ORD-9104"*, *"Show my recent orders"*).

### 5. Order Support Views in Angular
- **Orders Dashboard (`/orders`)**:
  - List of recent customer orders with status indicators and search.
  - Detail view for viewing items, address, and live status.
  - Return / Refund request interface.

---

## Proposed Changes

### Server (`server/`)

#### [MODIFY] `package.json`
- Add `@ag-ui/core` (or typed definitions) and ensure dependencies are synced.

#### [MODIFY] [schema.ts](file:///c:/Users/USER/OneDrive/Desktop/ChaiCode/Interview%20Preparation/Angular/generative-ui/server/src/db/schema.ts)
- Define `orders`, `orderItems`, and `returnRequests` tables with Drizzle ORM.

#### [NEW] `server/src/db/seed.ts`
- Seed realistic e-commerce orders, items, and tracking info.

#### [NEW] `server/src/services/order.service.ts`
- Query and mutation services for orders, tracking, and returns.

#### [NEW] `server/src/agent/ecommerce-agent.ts`
- AG-UI compliant Agent implementation managing runs, tool calls, and event streams.

#### [NEW] `server/src/routes/agent.routes.ts`
- SSE streaming endpoint `/api/agent/run` and tools registry endpoint.

#### [MODIFY] [routes/index.ts](file:///c:/Users/USER/OneDrive/Desktop/ChaiCode/Interview%20Preparation/Angular/generative-ui/server/src/routes/index.ts)
- Mount `/agent` and `/orders` route modules.

---

### Client (`src/app/`)

#### [MODIFY] `package.json`
- Add `@ag-ui/client` (or typed client service) for handling SSE AG-UI protocol events.

#### [NEW] `src/app/core/services/ag-ui-agent.service.ts`
- Angular Signal-based service managing agent connection, runs, streaming messages, and client-tool execution.

#### [NEW] `src/app/core/models/ag-ui.models.ts` & `src/app/core/models/ecommerce.models.ts`
- Strongly-typed models for AG-UI events and E-commerce domain data.

#### [NEW] `src/app/features/sidecar/`
- **`sidecar.ts`, `sidecar.html`, `sidecar.scss`**: Modern AI assistant sidecar with chat stream, tool call status indicators, and embedded component renderer.

#### [NEW] `src/app/features/ecommerce/components/`
- **`order-card/`**: Rich card displaying order summary, items, and quick actions.
- **`tracking-timeline/`**: Visual stepper showing transit checkpoints, carrier, and ETA.
- **`return-dialog/`**: Return & refund form with Human-in-the-Loop review.

#### [NEW] `src/app/features/orders/`
- Orders list view and detail view with integration to trigger the sidecar assistant.

#### [MODIFY] [app.html](file:///c:/Users/USER/OneDrive/Desktop/ChaiCode/Interview%20Preparation/Angular/generative-ui/src/app/app.html) & [app.ts](file:///c:/Users/USER/OneDrive/Desktop/ChaiCode/Interview%20Preparation/Angular/generative-ui/src/app/app.ts)
- Integrate the AI Sidecar drawer alongside the main content layout.

---

## Verification Plan

### Automated & Build Verification
1. `npm run db:generate && npm run db:migrate`: Verify database migrations succeed.
2. `npm run server:build`: Verify TypeScript server builds cleanly.
3. `ng build`: Verify Angular application builds with zero compilation/template errors.
4. `npm run lint`: Verify no linting issues.

### Functional Verification
1. Open web application at `http://localhost:4200`.
2. Test queries in AI Sidecar:
   - *"Show my recent orders"* -> Agent calls `listCustomerOrders` -> renders order list and suggests actions.
   - *"Where is my order ORD-7821?"* -> Agent calls `trackShipment` -> renders `TrackingTimeline` component inside chat.
   - *"I want to return an item from ORD-9104"* -> Agent calls `fillReturnForm` client tool -> opens and populates the return form with user confirmation.
3. Verify SSE stream delivers AG-UI lifecycle, text deltas, and tool events in real time.
