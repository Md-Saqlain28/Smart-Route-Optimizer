# LogiRoute: Dynamic Delivery Route Optimizer

LogiRoute is a premium, interactive web application that models, solves, and animates complex network routing and logistics problems in real time. Built with **React, Vite, and TailwindCSS**, it serves as an educational sandbox and benchmarking platform for graph theory algorithms applied to courier delivery networks.

---

## 🚀 Key Features

* **Interactive CAD-Style Canvas:**
  * Click to place delivery locations (customer pins) and hubs.
  * Drag and drop pins to dynamically rearrange network topologies with real-time road weight re-calculations.
  * Connect locations using a smooth, rubber-band connecting line in connection mode.
  * Inspect locations and manually adjust road weights (in kilometers) or assign hub/destination roles.
* **Collapsible Algorithmic Stepper Drawer:**
  * A retro-terminal styled console drawer that provides detailed, step-by-step logs of algorithm executions.
  * Play, pause, step forward, step backward, or reset the visualizer with adjustable playback speeds (from $200\text{ms}$ to $2000\text{ms}$).
  * Highlights active edges, visited nodes, and optimal paths on the canvas in motion.
* **Performance Analytics Dashboard:**
  * Compare execution speeds of brute-force vs. dynamic programming solvers side-by-side.
  * Real-time metrics tracking total route distance, computational complexities, and network link counts.
  * Draws a separate mini-map displaying the completed Minimum Spanning Tree (MST) sub-graph.
* **Pre-Built Network Maps:**
  * Load pre-configured maps with single-click presets: *5-Node Hub & Spoke*, *8-Node Suburb Grid*, and *12-Node Regional State Network*.

---

## 🧠 Algorithms & Logistics Use Cases

LogiRoute implements three core routing algorithms inside [`src/utils/algorithms.js`](file:///C:/Users/mobas/OneDrive/Desktop/Smart-Route-Optimizer/src/utils/algorithms.js):

### 1. Dijkstra's Shortest Path Algorithm
* **Logistics Use Case:** Finding the fastest, most direct route from a dispatch Hub to a single customer location.
* **Complexity:** Greedy exploration ($O(E \log V)$).
* **Visualization:** Highlights checked connections and traces the finalized shortest path in glowing cyan.

### 2. Prim's Minimum Spanning Tree (MST)
* **Logistics Use Case:** Designing infrastructure or grid layouts. Finds the cheapest way to construct roads connecting all locations together without loops.
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

## 🛠️ Tech Stack & Architecture

* **Framework:** React 19 (Vite)
* **Styling:** TailwindCSS 3, Lucide Icons, and Vanilla CSS keyframes (pulsing glows, dashed flow animations)
* **Canvas Rendering:** Vector SVG viewports with reactive coordinate listeners
* **Performance:** Inline JavaScript computational engines (no external servers needed for calculations)

```
Smart-Route-Optimizer/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── AlgorithmSelector.jsx  # Stepper play controls & speed configs
│   │   ├── AnalyticsPanel.jsx     # Side-by-side solver metrics & MST sub-graph
│   │   ├── GraphCanvas.jsx        # SVG canvas with drag-and-drop & link drawing
│   │   ├── PresetSelector.jsx     # Dropdown preset maps loader
│   │   └── SidebarControls.jsx    # Inspector tools & custom coordinate inputs
│   ├── pages/
│   │   ├── LandingPage.jsx        # Welcome landing view
│   │   └── Workspace.jsx          # Workbench orchestrator
│   ├── utils/
│   │   ├── algorithms.js          # Core Dijkstra, Prim, and TSP solvers
│   │   └── presets.js             # Initial coordinate setups (automatically scaled)
│   ├── App.jsx                    # Root App component (state machine)
│   ├── index.css                  # Tailwind styles and custom cyber glows
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
To compile the production-ready bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
