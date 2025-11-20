export class Pathfinding {
    constructor(mapSystem) {
        this.map = mapSystem;
    }

    findPath(startX, startY, endX, endY) {
        const startNode = this.map.getTile(startX, startY);
        const endNode = this.map.getTile(endX, endY);

        if (!startNode || !endNode || !startNode.isWalkable || !endNode.isWalkable) {
            return [];
        }

        const openSet = [];
        const closedSet = new Set();

        openSet.push(startNode);

        // Reset node properties for pathfinding
        for (let y = 0; y < this.map.rows; y++) {
            for (let x = 0; x < this.map.cols; x++) {
                const node = this.map.grid[y][x];
                node.g = 0;
                node.h = 0;
                node.f = 0;
                node.parent = null;
            }
        }

        while (openSet.length > 0) {
            // Get node with lowest f score
            let winner = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[winner].f) {
                    winner = i;
                }
            }

            const current = openSet[winner];

            if (current === endNode) {
                // Path found
                const path = [];
                let temp = current;
                while (temp.parent) {
                    path.push(temp);
                    temp = temp.parent;
                }
                path.push(startNode); // Add start node
                return path.reverse();
            }

            // Remove current from openSet
            openSet.splice(winner, 1);
            closedSet.add(current);

            const neighbors = this.getNeighbors(current);

            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor) || !neighbor.isWalkable) {
                    continue;
                }

                const tempG = current.g + 1;

                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }

                if (newPath) {
                    neighbor.h = this.heuristic(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                }
            }
        }

        // No path found
        return [];
    }

    getNeighbors(node) {
        const neighbors = [];
        const { x, y } = node;

        // Up, Down, Left, Right (No diagonals for now)
        const dirs = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        for (const dir of dirs) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            const neighbor = this.map.getTile(nx, ny);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
}
