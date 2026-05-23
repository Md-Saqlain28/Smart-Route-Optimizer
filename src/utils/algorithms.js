// LogiRoute Algorithm Modules
// Pure JS implementation of Dijkstra, Prim's, All-Pairs shortest paths, TSP Brute Force, and TSP Held-Karp DP.

// Helper: Compute Euclidean distance between two nodes (for default edge weights)
export function getEuclideanDistance(nodeA, nodeB) {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 0.1 * 10) / 10; // scaled and rounded to 1 decimal place
}

// Helper: Convert graph edges to an adjacency list
export function buildAdjacencyList(nodes, edges) {
  const adj = {};
  nodes.forEach(n => {
    adj[n.id] = [];
  });
  edges.forEach(e => {
    const from = parseInt(e.from);
    const to = parseInt(e.to);
    const weight = parseFloat(e.weight);
    
    if (adj[from]) adj[from].push({ node: to, weight });
    if (adj[to]) adj[to].push({ node: from, weight }); // undirected graph
  });
  return adj;
}

// ==========================================
// 1. DIJKSTRA'S ALGORITHM (Greedy shortest path)
// ==========================================
export function dijkstra(nodes, edges, startId, endId = null) {
  const adj = buildAdjacencyList(nodes, edges);
  const distances = {};
  const parents = {};
  const visited = new Set();
  const steps = [];

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    parents[n.id] = null;
  });
  distances[startId] = 0;

  // Add initial state
  steps.push({
    type: 'init',
    currentNode: startId,
    visited: Array.from(visited),
    distances: { ...distances },
    parents: { ...parents },
    highlightEdges: [],
    description: `Initialize distances: Set start Hub node [${nodes.find(n => n.id === startId)?.label}] distance to 0, and all other customer nodes to Infinity.`
  });

  const unvisitedNodes = new Set(nodes.map(n => n.id));

  while (unvisitedNodes.size > 0) {
    // Find unvisited node with minimum distance
    let currentNodeId = null;
    let minDistance = Infinity;

    unvisitedNodes.forEach(id => {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        currentNodeId = id;
      }
    });

    // If remaining nodes are unreachable
    if (currentNodeId === null || minDistance === Infinity) {
      break;
    }

    const currNodeLabel = nodes.find(n => n.id === currentNodeId)?.label;

    // Mark current node as visiting
    steps.push({
      type: 'visit_node',
      currentNode: currentNodeId,
      visited: Array.from(visited),
      distances: { ...distances },
      parents: { ...parents },
      highlightEdges: [],
      description: `Select unvisited node [${currNodeLabel}] with the absolute shortest current distance (${minDistance} km) and mark it as active.`
    });

    unvisitedNodes.delete(currentNodeId);
    visited.add(currentNodeId);

    // If we reached the target node, we can stop early
    if (endId !== null && currentNodeId === endId) {
      steps.push({
        type: 'reach_target',
        currentNode: currentNodeId,
        visited: Array.from(visited),
        distances: { ...distances },
        parents: { ...parents },
        highlightEdges: [],
        description: `Target customer node [${currNodeLabel}] reached! Path search completes successfully.`
      });
      break;
    }

    // Relax neighbors
    const neighbors = adj[currentNodeId] || [];
    for (const neighbor of neighbors) {
      const neighborId = neighbor.node;
      const weight = neighbor.weight;
      const neighborLabel = nodes.find(n => n.id === neighborId)?.label;

      if (visited.has(neighborId)) continue;

      const altDistance = distances[currentNodeId] + weight;
      const isRelaxed = altDistance < distances[neighborId];
      const oldDistance = distances[neighborId];

      const edgeKey = [Math.min(currentNodeId, neighborId), Math.max(currentNodeId, neighborId)].join('-');
      
      const desc = `Checking connection to [${neighborLabel}] (distance: ${weight} km). Path cost via [${currNodeLabel}] would be ${distances[currentNodeId]} + ${weight} = ${altDistance} km. ` +
        (isRelaxed 
          ? `New path is shorter! Updating [${neighborLabel}]'s distance from ${oldDistance === Infinity ? 'Infinity' : oldDistance + ' km'} to ${altDistance} km.`
          : `Existing distance (${oldDistance} km) is shorter. No update needed.`);

      if (isRelaxed) {
        distances[neighborId] = altDistance;
        parents[neighborId] = currentNodeId;
      }

      steps.push({
        type: 'relax_edge',
        currentNode: currentNodeId,
        neighborNode: neighborId,
        visited: Array.from(visited),
        distances: { ...distances },
        parents: { ...parents },
        highlightEdges: [{ from: currentNodeId, to: neighborId, key: edgeKey }],
        description: desc
      });
    }

    steps.push({
      type: 'post_visit',
      currentNode: currentNodeId,
      visited: Array.from(visited),
      distances: { ...distances },
      parents: { ...parents },
      highlightEdges: [],
      description: `All outgoing connections from [${currNodeLabel}] evaluated. Mark [${currNodeLabel}] as fully processed (Visited).`
    });
  }

  // Reconstruct path
  const path = [];
  let current = endId;
  const pathCost = endId !== null ? distances[endId] : null;

  if (endId !== null && distances[endId] !== Infinity) {
    while (current !== null) {
      path.unshift(current);
      current = parents[current];
    }
  }

  steps.push({
    type: 'done',
    currentNode: null,
    visited: Array.from(visited),
    distances: { ...distances },
    parents: { ...parents },
    highlightEdges: [],
    path: path,
    description: endId !== null 
      ? (path.length > 0 
          ? `Algorithm complete. Shortest path found: ${path.map(id => nodes.find(n => n.id === id)?.label).join(' ➔ ')} (Total: ${pathCost} km).`
          : `Algorithm complete. No path exists from start to target node.`)
      : `Algorithm complete. Shortest paths computed from Hub to all customers.`
  });

  return {
    path,
    distance: pathCost,
    distances,
    parents,
    steps
  };
}

// ==========================================
// 2. PRIM'S ALGORITHM (Greedy MST)
// ==========================================
export function primMST(nodes, edges, startId = 0) {
  const adj = buildAdjacencyList(nodes, edges);
  const visited = new Set();
  const mstEdges = [];
  const steps = [];
  
  if (nodes.length === 0) return { mstEdges: [], steps: [] };

  visited.add(startId);
  const startLabel = nodes.find(n => n.id === startId)?.label;

  steps.push({
    type: 'init',
    visited: Array.from(visited),
    mstEdges: [],
    highlightEdges: [],
    description: `Initialize MST starting at Hub node [${startLabel}]. Mark [${startLabel}] as visited.`
  });

  while (visited.size < nodes.length) {
    let minEdge = null;
    let minWeight = Infinity;

    // Scan all edges connecting visited nodes to unvisited nodes
    visited.forEach(u => {
      const neighbors = adj[u] || [];
      neighbors.forEach(({ node: v, weight }) => {
        if (!visited.has(v)) {
          if (weight < minWeight) {
            minWeight = weight;
            minEdge = { from: u, to: v, weight };
          }
        }
      });
    });

    if (minEdge === null) {
      // Graph is disconnected
      steps.push({
        type: 'done',
        visited: Array.from(visited),
        mstEdges: [...mstEdges],
        highlightEdges: [],
        description: `No more connecting edges found. The graph is disconnected! MST covers ${visited.size} out of ${nodes.length} nodes.`
      });
      return { mstEdges, steps, complete: false };
    }

    const fromLabel = nodes.find(n => n.id === minEdge.from)?.label;
    const toLabel = nodes.find(n => n.id === minEdge.to)?.label;

    // Highlight the edge we are considering
    steps.push({
      type: 'consider_edge',
      visited: Array.from(visited),
      mstEdges: [...mstEdges],
      highlightEdges: [minEdge],
      description: `Scanning boundary edges. Found candidate edge linking Visited [${fromLabel}] to Unvisited [${toLabel}] with minimum weight of ${minEdge.weight} km.`
    });

    // Add node and edge to MST
    visited.add(minEdge.to);
    mstEdges.push(minEdge);

    steps.push({
      type: 'add_to_mst',
      visited: Array.from(visited),
      mstEdges: [...mstEdges],
      highlightEdges: [],
      description: `Adding edge [${fromLabel} ➔ ${toLabel}] (${minEdge.weight} km) to MST. Mark [${toLabel}] as visited.`
    });
  }

  const totalCost = mstEdges.reduce((sum, e) => sum + e.weight, 0);

  steps.push({
    type: 'done',
    visited: Array.from(visited),
    mstEdges: [...mstEdges],
    highlightEdges: [],
    description: `Minimum Spanning Tree (MST) completed successfully! All ${nodes.length} nodes connected using ${mstEdges.length} edges (Total Cost: ${totalCost.toFixed(1)} km).`
  });

  return {
    mstEdges,
    steps,
    totalCost,
    complete: true
  };
}

// ==========================================
// 3. ALL-PAIRS SHORTEST PATHS (Metric Closure)
// ==========================================
// Precomputes shortest paths between all pairs of nodes to build a complete distance matrix for TSP.
export function computeDistanceMatrix(nodes, edges) {
  const n = nodes.length;
  const dist = Array(n).fill(0).map(() => Array(n).fill(Infinity));
  const next = Array(n).fill(0).map(() => Array(n).fill(null));

  // Initialize with direct edges
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  edges.forEach(e => {
    const u = nodes.findIndex(node => node.id === e.from);
    const v = nodes.findIndex(node => node.id === e.to);
    const weight = parseFloat(e.weight);
    if (u !== -1 && v !== -1) {
      dist[u][v] = weight;
      dist[v][u] = weight;
      next[u][v] = v;
      next[v][u] = u;
    }
  });

  // Floyd-Warshall Algorithm to compute all-pairs shortest paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  // Helper to reconstruct path from index i to index j
  const getPath = (i, j) => {
    if (dist[i][j] === Infinity) return [];
    const path = [i];
    let curr = i;
    while (curr !== j) {
      curr = next[curr][j];
      if (curr === null) return [];
      path.push(curr);
    }
    return path.map(idx => nodes[idx].id); // return actual node IDs
  };

  return { dist, getPath };
}

// ==========================================
// 4. TSP BRUTE FORCE / EXHAUSTIVE SEARCH
// ==========================================
export function solveTSPBruteForce(nodes, edges, startId = 0, onStepCallback = null) {
  const startTime = performance.now();
  
  // Find start node index
  const startIndex = nodes.findIndex(n => n.id === startId);
  if (startIndex === -1) return null;

  // Compute metric closure
  const { dist, getPath } = computeDistanceMatrix(nodes, edges);
  
  const n = nodes.length;
  if (n <= 1) {
    const duration = performance.now() - startTime;
    return {
      tour: [startId],
      expandedTour: [startId],
      cost: 0,
      steps: [],
      duration: parseFloat(duration.toFixed(3)),
      permutationsChecked: 1
    };
  }

  const unvisitedIndices = [];
  for (let i = 0; i < n; i++) {
    if (i !== startIndex) unvisitedIndices.push(i);
  }

  let bestCost = Infinity;
  let bestTourIndices = [];
  let evaluatedCount = 0;
  const steps = [];

  // Helper to generate permutations recursively
  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      evaluatedCount++;
      const currentTourIndices = [startIndex, ...m, startIndex];
      let currentCost = 0;
      let valid = true;

      for (let i = 0; i < currentTourIndices.length - 1; i++) {
        const u = currentTourIndices[i];
        const v = currentTourIndices[i + 1];
        if (dist[u][v] === Infinity) {
          valid = false;
          break;
        }
        currentCost += dist[u][v];
      }

      if (valid) {
        const isBetter = currentCost < bestCost;
        if (isBetter) {
          bestCost = currentCost;
          bestTourIndices = [...currentTourIndices];
        }

        // Limit step animation history to prevent memory overflows (cap at 500 steps)
        if (steps.length < 500 && onStepCallback === null) {
          steps.push({
            tour: currentTourIndices.map(idx => nodes[idx].id),
            cost: currentCost,
            bestCost: isBetter ? currentCost : bestCost,
            evaluatedCount,
            isBetter
          });
        }
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const nextNode = curr.splice(i, 1);
        permute(curr, m.concat(nextNode));
      }
    }
  };

  permute(unvisitedIndices);

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Reconstruct physical path by expanding multi-hop shortest paths if necessary
  const finalTourIds = bestTourIndices.map(idx => nodes[idx].id);
  const expandedTourIds = [];
  for (let i = 0; i < bestTourIndices.length - 1; i++) {
    const u = bestTourIndices[i];
    const v = bestTourIndices[i + 1];
    const pathSegment = getPath(u, v);
    if (i === 0) {
      expandedTourIds.push(...pathSegment);
    } else {
      expandedTourIds.push(...pathSegment.slice(1)); // avoid double adding the meeting node
    }
  }

  return {
    tour: finalTourIds,
    expandedTour: expandedTourIds,
    cost: bestCost === Infinity ? null : parseFloat(bestCost.toFixed(1)),
    steps,
    duration: parseFloat(duration.toFixed(3)),
    permutationsChecked: evaluatedCount
  };
}

// ==========================================
// 5. TSP HELD-KARP (Dynamic Programming)
// ==========================================
export function solveTSPDynamicProgramming(nodes, edges, startId = 0) {
  const startTime = performance.now();

  const startIndex = nodes.findIndex(n => n.id === startId);
  if (startIndex === -1) return null;

  // Compute metric closure
  const { dist, getPath } = computeDistanceMatrix(nodes, edges);
  
  const n = nodes.length;
  if (n <= 1) {
    const duration = performance.now() - startTime;
    return { tour: [startId], expandedTour: [startId], cost: 0, duration: parseFloat(duration.toFixed(3)) };
  }

  // memo[mask][u] = min cost to visit subset of nodes in mask, ending at node u
  const numStates = 1 << n;
  const memo = Array(numStates).fill(0).map(() => Array(n).fill(Infinity));
  const parent = Array(numStates).fill(0).map(() => Array(n).fill(-1));

  // Base case: Start at Hub, visited subset is just Hub
  memo[1 << startIndex][startIndex] = 0;

  // Iterate through all bit subsets
  for (let mask = 1; mask < numStates; mask++) {
    // Hub must be in the visited subset
    if ((mask & (1 << startIndex)) === 0) continue;

    for (let u = 0; u < n; u++) {
      if ((mask & (1 << u)) === 0 || memo[mask][u] === Infinity) continue;

      // Try transition to an unvisited neighbor v
      for (let v = 0; v < n; v++) {
        if ((mask & (1 << v)) !== 0) continue; // v is already visited

        const nextMask = mask | (1 << v);
        const costToV = memo[mask][u] + dist[u][v];

        if (costToV < memo[nextMask][v]) {
          memo[nextMask][v] = costToV;
          parent[nextMask][v] = u;
        }
      }
    }
  }

  // Find min cost to return to start Hub node
  const fullVisitedMask = numStates - 1;
  let bestCost = Infinity;
  let endNodeIndex = -1;

  for (let u = 0; u < n; u++) {
    if (u === startIndex) continue;
    const finalCost = memo[fullVisitedMask][u] + dist[u][startIndex];
    if (finalCost < bestCost) {
      bestCost = finalCost;
      endNodeIndex = u;
    }
  }

  // Backtrack to reconstruct the tour indices
  const tourIndices = [];
  if (endNodeIndex !== -1 && bestCost !== Infinity) {
    let currMask = fullVisitedMask;
    let currNode = endNodeIndex;
    tourIndices.push(startIndex); // return point

    while (currNode !== -1) {
      tourIndices.unshift(currNode);
      const prevNode = parent[currMask][currNode];
      currMask = currMask ^ (1 << currNode); // unset the node bit
      currNode = prevNode;
    }
  } else {
    // No valid tour possible
    const duration = performance.now() - startTime;
    return {
      tour: [],
      expandedTour: [],
      cost: null,
      duration: parseFloat(duration.toFixed(3))
    };
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Convert indices back to node IDs
  const finalTourIds = tourIndices.map(idx => nodes[idx].id);

  // Expand multi-hop shortest paths
  const expandedTourIds = [];
  for (let i = 0; i < tourIndices.length - 1; i++) {
    const u = tourIndices[i];
    const v = tourIndices[i + 1];
    const pathSegment = getPath(u, v);
    if (i === 0) {
      expandedTourIds.push(...pathSegment);
    } else {
      expandedTourIds.push(...pathSegment.slice(1));
    }
  }

  return {
    tour: finalTourIds,
    expandedTour: expandedTourIds,
    cost: parseFloat(bestCost.toFixed(1)),
    duration: parseFloat(duration.toFixed(3))
  };
}
