"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ElecChart = ({ graphData, chartType }) => {
  const { labels, data: values } = graphData;
  const canvasEl = useRef(null);

  useEffect(() => {
    if (canvasEl.current !== null) {
      const ctx = canvasEl.current;

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Global active power",
            data: values,
            fill: false,
            borderColor: "#60a5fa",
            tension: 0.1,
            backgroundColor: "rgba(26, 83, 214, 0.7)",
          },
        ],
      };

      const myElecChart = new Chart(ctx, {
        type: chartType,
        data: data,
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
            },
          },
          plugins: {
            legend: {
              display: false, // 라벨 숨기기
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              // 값만 표시 (라벨 없이)
              return context.parsed.y !== undefined
                ? context.parsed.y
                : context.parsed;
            },
          },
        },
      });

      return function cleanup() {
        myElecChart.destroy();
      };
    }
  });
  return (
    <>
      <canvas ref={canvasEl} />
    </>
  );
};

export default ElecChart;
