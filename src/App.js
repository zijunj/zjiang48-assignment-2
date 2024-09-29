import React, { useEffect, useState } from 'react';
import './App.css';
import Controls from './Controls';
import KMeans from './kmeans';
import PlotComponent from './PlotComponent';

const generateRandomDataset = (numPoints = 300) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push({
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10
    });
  }
  return data;
};

function App() {
  const [data, setData] = useState([]);
  const [kmeans, setKMeans] = useState(null);
  const [initMethod, setInitMethod] = useState('random');
  const [currentStep, setCurrentStep] = useState(0);
  const [centroids, setCentroids] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCentroids, setManualCentroids] = useState([]);
  const [numClusters, setNumClusters] = useState(3); // Number of clusters

  // Initialization useEffect
  useEffect(() => {
    const initialData = generateRandomDataset();
    setData(initialData);
    const km = new KMeans(initialData, numClusters, initMethod);
    if (initMethod !== 'manual') {
      km.initializeCentroids();
    }
    setKMeans(km);
    setCentroids(km.centroids);
    setClusters(km.clusters);
    setCurrentStep(0);
    setIsManualMode(initMethod === 'manual');
    setManualCentroids([]);
  }, [initMethod, numClusters]);

  // Generate new dataset
  const generateDataset = () => {
    const newData = generateRandomDataset();
    setData(newData);
    if (kmeans) {
      const km = new KMeans(newData, numClusters, initMethod);
      if (initMethod !== 'manual') {
        km.initializeCentroids();
      }
      setKMeans(km);
      setCentroids(km.centroids);
      setClusters(km.clusters);
      setCurrentStep(0);
      setManualCentroids([]);
    }
  };

  // Step through the KMeans algorithm
  const stepKMeans = () => {
    if (initMethod === 'manual' && manualCentroids.length < numClusters) {
      alert(`Please select all ${numClusters} centroids.`);
      return;
    }

    if (kmeans) {
      const continueRunning = kmeans.step();
      setCentroids([...kmeans.centroids]);
      setClusters([...kmeans.clusters]);
      setCurrentStep(kmeans.history.length);
      if (!continueRunning) {
        alert('KMeans has converged.');
      }
    }
  };

  // Run KMeans until convergence
  const runKMeans = () => {
    if (initMethod === 'manual' && manualCentroids.length < numClusters) {
      alert(`Please select all ${numClusters} centroids.`);
      return;
    }

    if (kmeans) {
      kmeans.runFull();
      setCentroids([...kmeans.centroids]);
      setClusters([...kmeans.clusters]);
      setCurrentStep(kmeans.history.length);
      alert('KMeans has converged.');
    }
  };

  // Reset the KMeans algorithm
  const resetKMeans = () => {
    if (kmeans) {
      kmeans.reset();
      if (initMethod === 'manual') {
        setIsManualMode(true);
        setManualCentroids([]);
      } else {
        kmeans.initializeCentroids();
        setCentroids([...kmeans.centroids]);
        setClusters([...kmeans.clusters]);
        setCurrentStep(kmeans.history.length);
        setIsManualMode(false);
      }
    }
  };

  // Handle manual centroid selection
  const handlePointClick = (point) => {
    if (initMethod === 'manual') {
      if (manualCentroids.length < numClusters) {
        const updatedCentroids = [...manualCentroids, point];
        setManualCentroids(updatedCentroids);

        if (updatedCentroids.length === numClusters) {
          const km = new KMeans(data, numClusters, 'manual');
          km.setManualCentroids(updatedCentroids);
          setKMeans(km);
          setCentroids([...km.centroids]);
          setClusters([...km.clusters]);
          setCurrentStep(km.history.length);
          setIsManualMode(false);
        }
      }
    }
  };

  return (
    <div className="App">
      <h1>KMeans Clustering Visualization</h1>

      {/* Number of Clusters Input */}
      <div className = "numClusters">
        <label htmlFor="numClusters">Number of Clusters (k):</label>
        <br></br>
        <input
          id="numClusters"
          type="number"
          value={numClusters}
          min="1"
          onChange={(e) => setNumClusters(Number(e.target.value))}
        />
      </div>

      <Controls
        initMethod={initMethod}
        setInitMethod={setInitMethod}
        generateDataset={generateDataset}
        stepKMeans={stepKMeans}
        runKMeans={runKMeans}
        resetKMeans={resetKMeans}
        isManualMode={isManualMode}
      />

      <PlotComponent
        data={data}
        centroids={centroids}
        clusters={clusters}
        onPointClick={handlePointClick}
        mode={initMethod === 'manual' ? 'manual' : 'normal'}
      />

      {initMethod === 'manual' && isManualMode && (
        <p>Select {numClusters - manualCentroids.length} more centroid(s) by clicking on the plot.</p>
      )}
    </div>
  );
}

export default App;
