import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { openDatabase } from "./db";
import CSVimport from "./components/CSVimport";
import TableWrapper from "./components/TableWrapper";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f4f4",
    display: "flex",
    justifyContent: "center",
    "& > *": {
      padding: "10px",
      display: "flex",
      flexDirection: "column",
    },
  },
}));

// Function to clear the IndexedDB
const clearIndexedDB = async (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["submissions"], "readwrite");
    const objectStore = transaction.objectStore("submissions");

    const request = objectStore.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const App = () => {
  const classes = useStyles();

  const reff = useRef(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [importData, setImportData] = useState([]);
  const [colNames, setColNames] = useState([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const clearDatabaseEvery2Weeks = async () => {
      try {
        const db = await openDatabase();
        await clearIndexedDB(db);
        console.log("IndexedDB cleared.");
      } catch (error) {
        console.error("Error clearing IndexedDB: ", error);
      }
    };

    // Calculate the time until the next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = nextMidnight - now;

    // Schedule the first interval to start at the next midnight and repeat every 14 days at midnight
    const interval = 14 * 24 * 60 * 60 * 1000 + timeUntilMidnight;
    const intervalId = setInterval(clearDatabaseEvery2Weeks, interval);
    console.log(interval);

    // Cleanup the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const convertToCSV = (importData) => {
    // Ensure data is not empty
    if (!importData || importData.length === 0) {
      return "";
    }

    // Extract column names
    const columns = Object.keys(importData[0]);

    // Create header row
    const headerRow = columns.join(";");

    // Create data rows
    const dataRows = importData.map((row) =>
      columns.map((column) => row[column]).join(";")
    );

    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join("\n");

    return csvContent;
  };

  const handleDownload = () => {
    const csvContent = convertToCSV(importData);

    // Create a Blob and create a download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_data.csv";

    // Simulate a click to trigger the download
    link.click();
  };

  return (
    <div className={classnames(classes.root, "appWrapper")}>
      <CSVimport
        setShowTable={(value) => {
          setShowTable(value);
          setShowDownloadButton(value); // Set showDownloadButton based on showTable
        }}
        setImportData={setImportData}
        setColNames={setColNames}
      />
      {showTable && (
        <>
          <TableWrapper
            importData={importData}
            reff={reff}
            setImportData={setImportData}
            colNames={colNames}
          />
          {showDownloadButton && ( // Conditionally render the download button
            <Button
              variant="contained"
              color="primary"
              style={{ height: "50px", marginTop: "10px" }}
              className={classes.button}
              startIcon={<CloudDownloadIcon />}
              onClick={handleDownload}
            >
              Tabelle herunterladen
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default App;
