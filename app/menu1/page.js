"use client";

import { useState, useEffect } from "react";

const Menu1 = () => {
  const [saveVal, setSaveVal] = useState(null);

  useEffect(() => {
    fetchApiData();
  }, []);

  useEffect(() => {
    console.log("updated saveVal: ", saveVal);
  }, [saveVal]);

  const fetchApiData = async () => {
    try {
      const res = await fetch("http://34.47.116.47/health");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json(); // 또는 await res.text() 등
      setSaveVal(data);
    } catch (error) {
      console.error(error);
    }
  };

  return <div>This is Menu1 Page...</div>;
};

export default Menu1;
