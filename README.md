# LogiRoute: Dynamic Delivery Route Optimizer

LogiRoute is a premium, interactive web application designed to model, solve, and animate complex network routing and logistics problems in real time. Built with **React, Vite, TailwindCSS, and Lucide Icons**, it serves as an educational sandbox and visual benchmarking platform for graph theory algorithms applied to delivery courier networks.

---

## 🌟 The UX Redesign Philosophy

In our latest major release, we transitioned LogiRoute from a rigid, complex 3-column workspace to a **distraction-free, fullscreen canvas layout** with floating glassmorphic panels. This dramatically simplifies the User Experience (UX), making network building and route visualization highly intuitive.

### 🎨 The New Layout Architecture
* **Top Control Bar:** A unified, glassmorphic header containing preset selectors, algorithm options, stepper playback controls (Play, Pause, Step Forward/Backward, Speed slider), and active alerts.
* **Left Floating Tool Tray:** A sleek, vertical overlay containing drawing modes (Move/Select, Add Location, Connect Roads, Quick Erase).
* **Sliding Inspector Panel:** Select any customer location to slide out a context inspector, allowing you to edit labels, check precise coordinates, assign a starting **Hub** or **Destination**, or delete nodes.
* **Collapsible Analytics Sidebar:** Toggled via a floating button in the Top Control Bar, this sidebar reveals computational metrics, execution times, O-notation complexities, and a live rendering of the Minimum Spanning Tree (MST) sub-graph.
* **Terminal Stepper Drawer:** A retro-styled terminal drawer at the bottom showing step-by-step logs of algorithm executions, perfect for debugging or educational walks.

---

## 🧠 Algorithms & Logistics Use Cases

LogiRoute implements three core routing algorithms inside [`src/utils/algorithms.js`](file:///C:/Users/mobas/OneDrive/Desktop/Smart-Route-Optimizer/src/utils/algorithms.js):

### 1. Dijkstra's Shortest Path Algorithm
* **Logistics Use Case:** Finding the fastest, most direct route from a dispatch Hub to a single customer location.
* **Complexity:** Greedy exploration ($O(E \log V)$).
* **Visualization:** Highlights checked connections and traces the finalized shortest path in glowing cyan.

### 2. Prim's Minimum Spanning Tree (MST)
* **Logistics Use Case:** Designing infrastructure or delivery network layouts. Finds the cheapest way to construct roads connecting all locations together without loops.
* **Complexity:** Greedy growth ($O(E \log V)$).
* **Visualization:** Highlights boundary scans and renders the final spanning tree in glowing emerald.

### 3. The Traveling Salesman Problem (TSP)
* **Logistics Use Case:** Last-mile circular delivery loops where a courier starts at the central Hub, visits every customer location exactly once, and returns back to the Hub.
* **Metric Closure:** Utilizes the **Floyd-Warshall Algorithm** ($O(N^3)$) to calculate all-pairs shortest paths so that a complete distance matrix is available (handling missing direct links).
* **Dual-Solver Implementation:**
  * **Brute Force Permutation:** Exhaustively checks all $(N-1)!$ circular routes ($O(N!)$). Capped at $N \le 10$ and animated for $N \le 6$ to prevent browser crashes.
  * **Held-Karp Dynamic Programming:** Uses bitmasks and memoization to solve the problem in $O(N^2 \cdot 2^N)$ time.
  * **Scale Safety Guard:** Bypasses calculation dynamically if $N > 20$ nodes to protect browser thread memory.
* **Visualization:** Traces optimal courier loops in glowing amber.

---

## 🛠️ Folder & Code Structure

The repository is structured to maintain modularity and ease of extension:

```
Smart-Route-Optimizer/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── AnalyticsPanel.jsx     # Side-by-side solver metrics & MST sub-graph
│   │   └── GraphCanvas.jsx        # SVG canvas with Left Tool Tray, Node Inspector, and clear button
│   ├── utils/
│   │   ├── algorithms.js          # Core Dijkstra, Prim, and TSP solvers
│   │   └── presets.js             # Initial coordinate setups (automatically scaled)
│   ├── App.jsx                    # Root App component, layout, Top Control Bar, Stepper play controls
│   ├── index.css                  # Custom cyber glows, theme scrollbars, animations
│   └── main.jsx                   # React mounting entrypoint
├── index.html              # HTML shell
├── package.json            # npm dependencies
└── vite.config.js          # Vite config
```

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have Node.js (version 18 or above) installed on your machine.

### Installation
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Md-Saqlain28/Smart-Route-Optimizer.git
   cd Smart-Route-Optimizer
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
   Open the displayed local link (usually `http://localhost:5173`) in your browser.

### Build and Deployment
To compile the production-ready bundle and verify that there are no compilation errors:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

### Code Formatting and Linting
To check and enforce code standards, run the ESLint checker:
```bash
npm run lint
```
