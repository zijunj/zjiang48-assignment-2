
class KMeans {
  constructor(data, k, initMethod = 'random') {
    this.data = data; 
    this.k = k;
    this.initMethod = initMethod;
    this.centroids = [];
    this.clusters = [];
    this.history = [];
  }

  initializeCentroids() {
    if (this.initMethod === 'random') {
      this.centroids = this.randomInitialization();
    } else if (this.initMethod === 'farthest') {
      this.centroids = this.farthestFirstInitialization();
    } else if (this.initMethod === 'kmeans++') {
      this.centroids = this.kMeansPlusPlusInitialization();
    } else if (this.initMethod === 'manual') {
      // Centroids will be set manually via user interaction
    }
    this.history.push({
      centroids: [...this.centroids],
      clusters: []
    });
  }

  randomInitialization() {
    const shuffled = [...this.data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, this.k);
  }

  farthestFirstInitialization() {
    const centroids = [];
    centroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
    while (centroids.length < this.k) {
      let farthestPoint = null;
      let maxDistance = -1;
      this.data.forEach(point => {
        const minDist = Math.min(...centroids.map(c => this.distance(point, c)));
        if (minDist > maxDistance) {
          maxDistance = minDist;
          farthestPoint = point;
        }
      });
      centroids.push(farthestPoint);
    }
    return centroids;
  }

  kMeansPlusPlusInitialization() {
    const centroids = [];
    centroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
    while (centroids.length < this.k) {
      const distances = this.data.map(point =>
        Math.min(...centroids.map(c => this.distance(point, c))) ** 2
      );
      const total = distances.reduce((a, b) => a + b, 0);
      const probs = distances.map(d => d / total);
      let cumulative = 0;
      const r = Math.random();
      for (let i = 0; i < probs.length; i++) {
        cumulative += probs[i];
        if (r < cumulative) {
          centroids.push(this.data[i]);
          break;
        }
      }
    }
    return centroids;
  }

  assignClusters() {
    this.clusters = this.data.map(point => {
      let minDist = Infinity;
      let cluster = -1;
      this.centroids.forEach((centroid, idx) => {
        const dist = this.distance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          cluster = idx;
        }
      });
      return cluster;
    });
  }

  updateCentroids() {
    const newCentroids = [];
    for (let i = 0; i < this.k; i++) {
      const pointsInCluster = this.data.filter((_, idx) => this.clusters[idx] === i);
      if (pointsInCluster.length === 0) {
        newCentroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
      } else {
        const meanX = pointsInCluster.reduce((sum, p) => sum + p.x, 0) / pointsInCluster.length;
        const meanY = pointsInCluster.reduce((sum, p) => sum + p.y, 0) / pointsInCluster.length;
        newCentroids.push({ x: meanX, y: meanY });
      }
    }
    return newCentroids;
  }

  hasConverged(newCentroids) {
    for (let i = 0; i < this.k; i++) {
      if (this.distance(this.centroids[i], newCentroids[i]) > 1e-4) {
        return false;
      }
    }
    return true;
  }

  step() {
    this.assignClusters();
    const newCentroids = this.updateCentroids();
    this.history.push({
      centroids: [...newCentroids],
      clusters: [...this.clusters]
    });
    if (this.hasConverged(newCentroids)) {
      return false; // Converged
    } else {
      this.centroids = newCentroids;
      return true; // Continue
    }
  }

  runFull() {
    let continueRunning = true;
    while (continueRunning) {
      continueRunning = this.step();
    }
  }

  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  setManualCentroids(selectedCentroids) {
    this.centroids = selectedCentroids;
    this.history.push({
      centroids: [...this.centroids],
      clusters: []
    });
  }

  reset() {
    this.centroids = [];
    this.clusters = [];
    this.history = [];
  }
}

export default KMeans;
