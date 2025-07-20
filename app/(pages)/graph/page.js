"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./graph.module.css";
import ElecChart from "./ElecChart";
import Loading from "@/app/components/common/Loading";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const GraphPage = () => {
  const [isPending, setIsPending] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [graphData, setGraphData] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2008-01-01");
  const date = useRef(null);

  const fetchData = async (dateStr) => {
    setIsPending(true);
    let nextDate = new Date(dateStr);
    nextDate.setDate(nextDate.getDate() + 1);

    nextDate = `${nextDate.getFullYear()}${String(
      nextDate.getMonth() + 1
    ).padStart(2, "0")}${String(nextDate.getDate()).padStart(2, "0")}0000`;

    const start = dateStr.replaceAll("-", "") + "0000";
    const end = nextDate;

    const res = await fetch(`${API_BASE_URL}/elecgraph/${start}/${end}`);
    const data = await res.json();
    console.log("[data]: ", data);

    setIsPending(false);
    setGraphData(data);
  };

  const changeChartType = (type) => {
    setChartType(type);
  };

  const onChangeDate = () => {
    setIsPending(true);
    setSelectedDate(date.current.value);
    fetchData(date.current.value);
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Global active power</h1>
      <div className={styles.graphWrap}>
        {!graphData || isPending ? (
          <Loading />
        ) : (
          <ElecChart graphData={graphData} chartType={chartType} />
        )}
      </div>
      <div className={styles.chartSelect}>
        <div className={styles.inputWrap}>
          <input
            onChange={onChangeDate}
            ref={date}
            type="date"
            className={styles.stylishDateInput}
            value={selectedDate}
            disabled={isPending}
          />
          {/* <button className={styles.applyBtn}>APPLY</button> */}
        </div>
        <div className={styles.buttonWrap}>
          <button
            disabled={isPending}
            onClick={() => changeChartType("line")}
            className={styles.selectBtn}
          >
            LINE
          </button>
          <button
            disabled={isPending}
            onClick={() => changeChartType("bar")}
            className={styles.selectBtn}
          >
            BAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
