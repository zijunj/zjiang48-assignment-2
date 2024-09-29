
import React from 'react';
import Plot from 'react-plotly.js';

const PlotComponent = ({ data, centroids, clusters, onPointClick, mode }) => {
  const traces = [];

  const colors = ['red', 'pink', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow'];

  for (let i = 0; i < data.length; i++) {
    const cluster = clusters[i];
    if (cluster !== undefined) {
      if (!traces[cluster]) {
        traces[cluster] = {
          x: [],
          y: [],
          mode: 'markers',
          type: 'scatter',
          name: `Cluster ${cluster + 1}`,
          marker: { color: colors[cluster % colors.length] }
        };
      }
      traces[cluster].x.push(data[i].x);
      traces[cluster].y.push(data[i].y);
    } else {
      if (!traces['unassigned']) {
        traces['unassigned'] = {
          x: [],
          y: [],
          mode: 'markers',
          type: 'scatter',
          name: `Unassigned`,
          marker: { color: 'blue', symbol: 'x' }
        };
      }
      traces['unassigned'].x.push(data[i].x);
      traces['unassigned'].y.push(data[i].y);
    }
  }

  const dataTraces = Object.values(traces).filter(trace => trace !== undefined);

  if (centroids.length > 0) {
    dataTraces.push({
      x: centroids.map(c => c.x),
      y: centroids.map(c => c.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Centroids',
      marker: { color: 'red', size: 12, symbol: 'x' }
    });
  }

  const handleClick = (event) => {
    if (mode === 'manual') {
      const point = {
        x: event.points[0].x,
        y: event.points[0].y
      };
      onPointClick(point);
    }
  };

  return (
    <Plot
      data={dataTraces}
      layout={{
        width: 700,
        height: 700,
        title: 'KMeans Clustering Visualization',
        clickmode: 'event+select'
      }}
      onClick={handleClick}
    />
  );
};

export default PlotComponent;
