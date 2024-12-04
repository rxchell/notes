import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Typography } from '@mui/material';

// Register necessary components
ChartJS.register(
  LineElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

interface AbsorptionSpectrumProps {
  data: number[];
  labels: string[];
}

const AbsorptionSpectrum: React.FC<AbsorptionSpectrumProps> = ({
  data,
  labels,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartData = {
    labels: labels.length > 0 ? labels : ['No Data'], // Handle empty labels
    datasets: [
      {
        label: 'Absorption Spectrum',
        data: data.length > 0 ? data : [0], // Handle empty data
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // This is for fill if enabled
        borderWidth: 2,
        pointRadius: 0, // Hide points
        fill: false, // Disable fill under the line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return `Wavelength (nm): ${tooltipItems[0].label}`;
          },
          label: (tooltipItem) => {
            return `Intensity: ${tooltipItem.raw}`;
          },
          footer: () => {
            return ['Hover for more details'];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Wavelength (nm)',
          font: {
            size: 10,
          },
        },
        ticks: {
          display: false, // Hide x-axis tick values
        },
      },
      y: {
        title: {
          display: true,
          text: 'Intensity',
          font: {
            size: 10,
          },
        },
        ticks: {
          font: {
            size:8,
          },
        },
      },
    },
    animation: {
      duration: 500,
    },
    elements: { // Set default element styles
      line: {
        tension: 0.4, // Smoothness of the line
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: chartData,
        options: options,
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, labels]); // Re-render when data or labels change

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: '#fff', // Set outer box background to white
        borderRadius: 2,
        boxShadow: 1,
        width: '100%', // Ensure it takes full width
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Absorption Spectrum
      </Typography>
      <Box sx={{ width: '100%', height:'400px', backgroundColor:'#fff' }}> {/* Set canvas container background to white */}
        <canvas ref={chartRef} style={{ backgroundColor:'#fff' }} /> {/* Set canvas background to white */}
      </Box>
    </Box>
  );
};

export default AbsorptionSpectrum;
