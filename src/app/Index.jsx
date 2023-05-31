import React from "react";
import Head from "./Head";
import Forecast from "./Forecast";
import styles from "./styles/home.module.css";

export default function Index() {
  return (
    <div className={styles.home}>
      <Forecast />
    </div>
  );
}
