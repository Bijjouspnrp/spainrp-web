import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const StatsChart = ({ type = 'bar', data, title, className = '' }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#7289da',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#2c2f33',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(114, 137, 218, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#7289da',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: type === 'bar' ? {
      x: {
        grid: {
          color: 'rgba(114, 137, 218, 0.1)'
        },
        ticks: {
          color: '#7289da'
        }
      },
      y: {
        grid: {
          color: 'rgba(114, 137, 218, 0.1)'
        },
        ticks: {
          color: '#7289da'
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (type) {
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      case 'line':
        return <Line data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`chart-container ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(114, 137, 218, 0.15)',
        border: '1px solid rgba(114, 137, 218, 0.1)',
        height: '300px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ height: '250px', position: 'relative' }}>
        {renderChart()}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, rgba(114, 137, 218, 0.1), rgba(114, 137, 218, 0.05))',
          borderRadius: '50%',
          zIndex: 0
        }}
      />
    </motion.div>
  );
};

export default StatsChart;
