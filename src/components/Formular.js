import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  SnackbarContent,
  Typography,
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Checkbox,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Attribute from "./Attribute";
import React, { useEffect, useState, useRef } from "react";
import Buttons from "./Buttons";
import { openDatabase, addSubmission, getAllSubmissions } from "../db";
import JSZip from "jszip";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import imageCompression from "browser-image-compression";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: "bold",
    fontSize: "1.2rem", // Adjust the font size
    marginBottom: "5px", // Add some spacing below titles
    textAlign: "center",
  },
  textField: {
    marginBottom: "1px", // Add margin to text fields
  },
  successSnackbar: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  errorSnackbar: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

export const SimpleDialog = (props, ref) => {
  const classes = useStyles();
  // Separate state for each attribute
  const [selectedPunktart, setselectedPunktArt] = useState(null);
  const [punktzustand, setselectedPunktzustand] = useState("");
  const [punktnummer, setPunktnummer] = useState("");
  const [streckennummer, setStreckennummer] = useState("");
  const [km, setKm] = useState("");
  const [met, setMet] = useState("");
  const [seite, setSeite] = useState(false);
  const [sonstiges, setSonstiges] = useState("");
  const [mastnummer, setMastnummer] = useState("");
  const [selectedStatus, setselectedStatus] = useState(null);
  const [selectedVermarkungstrager, setselectedVermarkungstrager] =
    useState(null);
  const [selectedVermarkungsArt, setselectedVermarkungsArt] = useState(null);
  const [sonstiges2, setSonstiges2] = useState("");
  const [sonstigesArt, setSonstigesArt] = useState("");
  const [gvp, setGVP] = useState("");
  const [photo, setPhoto] = useState(null);
  const { onClose, selectedValue, open } = props;
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submissions, setSubmissions] = useState([]); // Store all submissions
  const [successOpen, setSuccessOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [showWarning, setShowWarning] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const WARNINGS_KEYS = {
    vermarkungsart: "vermarkungsartWarning",
    foto: "fotoWarning",
  };
  //const webcamRef = useRef(null);

  useEffect(() => {
    setCurrentDate(new Date().toISOString().slice(0, 10));
  }, [currentDate, setCurrentDate]);

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
    setPhoto(selectedFiles); // Update state to hold an array of files
  };

  const resetForm = () => {
    setselectedPunktArt(null);
    setPunktnummer("");
    setStreckennummer("");
    setKm("");
    setMet("");
    setSeite(false);
    setSonstiges("");
    setMastnummer("");
    setselectedStatus(null);
    setselectedVermarkungstrager(null);
    setSonstigesArt("");
    setGVP("");
    setSonstiges2("");
    setPhoto(null);
    setCurrentDate(new Date().toISOString().slice(0, 10));
  };

  const reff = useRef(null);

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorMessage("");
  };

  const handleSuccessClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage("");
    setSuccessOpen(false);
  };

  const punktzustandOptions = [
    { value: 10, label: "Vorschlag GNSS-Punkt" },
    { value: 20, label: "Neu vermarkter Punkt" },
    { value: 30, label: "Bestandspunkt" },
  ];

  const punktartOptions = [
    { value: 100, label: "PS0" },
    { value: 101, label: "PS1" },
    { value: 102, label: "PS2" },
    { value: 103, label: "PS3" },
    { value: 104, label: "PS4" },
  ];

  const vermarkungOptions = [
    { value: 10, label: "Keiner" },
    { value: 20, label: "Granitpfeiler" },
    { value: 30, label: "Ortbeton" },
    { value: 40, label: "Bauwerk" },
    { value: 50, label: "EÜ" },
    { value: 60, label: "Fundament" },
    { value: 70, label: "Gebäude" },
    { value: 80, label: "Stahlgittermast" },
    { value: 90, label: "Rundmast (Betonmast)" },
    { value: 100, label: "Gleisvermarkungspfosten" },
    { value: 110, label: "Laterne" },
    { value: 120, label: "Wand" },
    { value: 130, label: "Lärmschutzwand" },
    { value: 140, label: "Widerlager" },
    { value: 150, label: "Tunnel" },
    { value: 160, label: "Sonstiges" },
  ];

  const vermarkungArtOptions = [
    { value: 10, label: "Attenberger mit Höhenmarke" },
    { value: 20, label: "Kreuzprofil mit Kappe" },
    { value: 30, label: "Messingbolzen auf Bauwerk" },
    { value: 40, label: "Messingbolzen auf Fundament" },
    { value: 50, label: "Rundbolzen mit ID" },
    { value: 60, label: "Flachbolzen mit ID" },
    { value: 70, label: "Messingbolzen (⌀ ≥ 28 mm)" },
    { value: 80, label: "Messingbolzen auf Bauwerk (3D)" },
    { value: 90, label: "Messingbolzen auf Fundament (3D)" },
    { value: 100, label: "Mauerbolzen" },
    { value: 110, label: "Stehbolzen" },
    { value: 120, label: "Attenberger ohne Höhenmarke" },
    { value: 130, label: "Lochstein" },
    { value: 140, label: "Grenzstein" },
    { value: 150, label: "Nagel" },
    { value: 160, label: "Eisenrohr" },
    { value: 170, label: "Tonrohr" },
    { value: 180, label: "Messingbolzen in Ortbeton" },
    { value: 190, label: "Messingbolzen in Granitpfeiler" },
    { value: 200, label: "Sonstiges" },
  ];

  const statusOptions = [
    { value: 1, label: "In Ordnung" },
    { value: 2, label: "Zerstört" },
    { value: 3, label: "Nicht gefunden" },
    { value: 4, label: "Nicht aufgesucht" },
    { value: 5, label: "Vorhanden (mit Target)" },
    { value: 6, label: "Vorhanden (ohne Target)" },
    { value: 7, label: "Neu vermarkter GVP mit Target" },
    { value: 8, label: "Vorhanden (nicht in Auswahl) mit Target" },
  ];

  const handleChangePunktart = (event) => {
    setselectedPunktArt(event.target.value);
  };

  const handlePunktzustandChange = (event) => {
    setselectedPunktzustand(event.target.value);
  };

  const handleChangeVermarkungstrager = (event) => {
    setselectedVermarkungstrager(event.target.value);
    if (event.target.value) {
      setMastnummer(""); // Reset Mastnummer when Vermarkungstrager is selected
    }
  };

  const handleChangeVermarkungsArt = (event) => {
    const selectedValue = event.target.value;
    setselectedVermarkungsArt(selectedValue);
    //handleSelection(punktzustandOption, punktartOption, selectedValue);
  };

  const shouldDisablePunktart = (punktartOption, punktzustandOption) => {
    // Logic for "PS0"
    if (punktzustandOption === 10) {
      return !(
        punktartOption === 100 ||
        punktartOption === 101 ||
        punktartOption === 102
      );
    }
    // Default case: enable all options
    return false;
  };

  const shouldDisableVermarkung = (
    vermarkungOption,
    punktzustandOption,
    punktartOption
  ) => {
    // Logic for "Vorschlag GNSS"
    if (punktzustandOption === 10) {
      // Disable all options except: "Fundament" (40), "Bauwerk" (70), "Sonstiges" (100)
      return !(
        vermarkungOption === 20 ||
        vermarkungOption === 30 ||
        vermarkungOption === 40
      );
    }

    // Logic for "Neu Vermarkter Punkt" && "PS0" and "Neu Vermarkter Punkt" && "PS2"
    if (
      (punktzustandOption === 20 && punktartOption === 100) ||
      (punktzustandOption === 20 && punktartOption === 102)
    ) {
      return true;
    }

    // Logic for "Neu Vermarkter Punkt" && "PS1"
    if (punktzustandOption === 20 && punktartOption === 101) {
      return !(
        vermarkungOption === 20 ||
        vermarkungOption === 30 ||
        vermarkungOption === 40 ||
        vermarkungOption === 160
      );
    }

    // Logic for "Neu Vermarkter Punkt" && "PS3"
    if (punktzustandOption === 20 && punktartOption === 103) {
      return !(
        vermarkungOption === 50 ||
        vermarkungOption === 60 ||
        vermarkungOption === 70 ||
        vermarkungOption === 140
      );
    }

    // Default case: enable all options
    return false;
  };

  const shouldDisableVermarkungArt = (
    vermarkungArtOption,
    punktzustandOption,
    punktartOption
  ) => {
    // Logic for "Vorschlag GNSS"
    if (punktzustandOption === 10) {
      return !(
        vermarkungArtOption === 10 ||
        vermarkungArtOption === 20 ||
        vermarkungArtOption === 30 ||
        vermarkungArtOption === 40
      );
    }

    // Logic for "Neu Vermarkter Punkt" && PS0
    if (punktzustandOption === 20 && punktartOption === 100) {
      return !(vermarkungArtOption === 50 || vermarkungArtOption === 60);
    }

    // Logic for "Neu Vermarkter Punkt" && PS1
    if (punktzustandOption === 20 && punktartOption === 101) {
      return !(vermarkungArtOption === 70);
    }

    // Logic for "Neu Vermarkter Punkt" && PS2
    if (punktzustandOption === 20 && punktartOption === 102) {
      return !(
        vermarkungArtOption === 10 ||
        vermarkungArtOption === 20 ||
        vermarkungArtOption === 80 ||
        vermarkungArtOption === 90
      );
    }

    // Logic for "Neu Vermarkter Punkt" && PS3
    if (punktzustandOption === 20 && punktartOption === 103) {
      return !(vermarkungArtOption === 100 || vermarkungArtOption === 110);
    }

    // Logic for "Bestandspunkt" && PS0
    if (punktzustandOption === 30 && punktartOption === 100) {
      return !(vermarkungArtOption === 50 || vermarkungArtOption === 60);
    }

    // Logic for "Bestandspunkt" && PS1
    if (punktzustandOption === 30 && punktartOption === 101) {
      return !(vermarkungArtOption === 70);
    }

    // Logic for "Bestandspunkt" && PS2
    if (punktzustandOption === 30 && punktartOption === 102) {
      return !(
        vermarkungArtOption === 10 ||
        vermarkungArtOption === 20 ||
        vermarkungArtOption === 30 ||
        vermarkungArtOption === 40 ||
        vermarkungArtOption === 120 ||
        vermarkungArtOption === 130 ||
        vermarkungArtOption === 140 ||
        vermarkungArtOption === 150 ||
        vermarkungArtOption === 160 ||
        vermarkungArtOption === 170 ||
        vermarkungArtOption === 200
      );
    }

    // Logic for "Bestandspunkt" && PS3
    if (
      (punktzustandOption === 30 && punktartOption === 103) ||
      vermarkungArtOption === 170
    ) {
      return !(
        vermarkungArtOption === 100 ||
        vermarkungArtOption === 110 ||
        vermarkungArtOption === 200
      );
    }

    // Default case: enable all options
    return false;
  };

  const shouldDisableStatus = (
    statusOption,
    punktartOption,
    punktzustandOption
  ) => {
    console.log(
      `Evaluating: statusOption=${statusOption}, punktartOption=${punktartOption}, punktzustandOption=${punktzustandOption}`
    );
    // Check for specific punktartOptions and punktzustand combinations
    if (
      [100, 101, 102, 103].includes(punktartOption) &&
      punktzustandOption === 10
    ) {
      return ![1, 2, 3, 4].includes(statusOption);
    }

    if (punktartOption === 104 && punktzustandOption === 10) {
      return ![2, 5, 6].includes(statusOption);
    }

    if (
      [100, 101, 102, 103].includes(punktartOption) &&
      punktzustandOption === 20
    ) {
      return true;
    }

    if (punktartOption === 104 && punktzustandOption === 20) {
      return ![7, 8].includes(statusOption);
    }
    // Default case: enable all options
    return false;
  };

  const [dontShowWarnings, setDontShowWarnings] = useState({
    [WARNINGS_KEYS.vermarkungsart]: false,
    [WARNINGS_KEYS.foto]: false,
  });

  useEffect(() => {
    const savedPreferences =
      JSON.parse(localStorage.getItem("dontShowWarnings")) || {};
    setDontShowWarnings(WARNINGS_KEYS.vermarkungsart);
  }, []);

  const handleSelectionVermarkungsart = (
    punktzustandOption,
    punktartOption,
    vermarkungsArtOption
  ) => {
    // Check the conditions for showing the warning window
    if (
      punktzustandOption === 20 &&
      punktartOption === 102 &&
      vermarkungsArtOption === 20 &&
      !dontShowAgain
    ) {
      setShowWarning({
        key: WARNINGS_KEYS.vermarkungsart,
        message:
          "Achtung! Nur nach Absprache mit PL, Vermarkungsart ist nicht in allen Regionalbereichen erlaubt.",
      });
    } else {
      setShowWarning(null); // Reset the warning if conditions are not met
    }
  };

  const handleSelectionFoto = (punktzustandOption, punktartOption) => {
    // Check the conditions for showing the warning window
    if (punktzustandOption === 20 && punktartOption === 100 && !dontShowAgain) {
      setShowWarning({
        key: WARNINGS_KEYS.foto,
        message:
          "Gelber Farbkreis um Bolzen (⌀ ca. 10 cm) & lesbare ID neben Bolzen geschrieben?",
      });
    } else {
      setShowWarning(null); // Reset the warning if conditions are not met
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(null); // Close the warning window
  };

  const handleDontShowAgainChange = (event) => {
    if (!showWarning) return;

    const updatedDontShowWarnings = {
      ...dontShowWarnings,
      [showWarning.key]: event.target.checked,
    };

    setDontShowWarnings(updatedDontShowWarnings);
    localStorage.setItem(
      "dontShowWarnings",
      JSON.stringify(updatedDontShowWarnings)
    );
  };

  const handleSubmit = async () => {
    // Input validations
    if (!selectedPunktart) {
      setErrorMessage("Bitte wählen Sie einen Punktart, bevor Sie fortfahren.");
      setSuccessMessage("");
      return;
    }
    if (!photo || photo.length === 0) {
      setErrorMessage(
        "Bitte wählen Sie mindestens ein Foto aus, bevor Sie fortfahren."
      );
      setSuccessMessage("");
      return;
    }
    if (!streckennummer) {
      setErrorMessage(
        "Bitte geben Sie die Streckennummer ein, bevor Sie fortfahren."
      );
      setSuccessMessage("");
      return;
    }
    if (!km && !met) {
      setErrorMessage(
        "Bitte geben Sie die Kilometrierung ein, bevor Sie fortfahren."
      );
      setSuccessMessage("");
      return;
    }
    if (!seite) {
      setErrorMessage("Bitte wählen Sie eine Seite aus, bevor Sie fortfahren.");
      setSuccessMessage("");
      return;
    }
    if (!mastnummer && !selectedVermarkungstrager) {
      setErrorMessage(
        "Bitte geben Sie eine Mastnummer ein oder wählen Sie einen Vermarkungsträger."
      );
      return;
    }
    if (!selectedStatus) {
      setErrorMessage(
        "Bitte wählen Sie einen Status aus, bevor Sie fortfahren."
      );
      setSuccessMessage("");
      return;
    }

    // Process all selected photos
    for (const photoFile of photo) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const base64Photo = event.target.result;
        const maxSizeInBytes = 0.5 * 1024 * 1024; // 0.5 MB
        const image = new Image();
        image.src = base64Photo;

        image.onload = async () => {
          const finalPhoto =
            event.total <= maxSizeInBytes
              ? base64Photo
              : await compressPhoto(image);

          const newSubmission = await createSubmission(finalPhoto);

          if (newSubmission) {
            // Trigger photo download after submission
            downloadPhoto(newSubmission);
          }
        };
      };

      reader.readAsDataURL(photoFile); // Process each photo individually
    }

    // Reset input field after processing
    reff.current.value = "";
  };

  const getTitle = (punktzustandOption, punktartOption) => {
    // Function to determine the title based on `punktzustand`
    if (
      (punktzustandOption === 20 || punktzustandOption === 30) &&
      punktartOption !== 104
    ) {
      return "Umgebungsfoto hochladen";
    }
    if (punktartOption === 104) {
      return "Foto hochladen";
    }
    if (punktzustandOption === 10) {
      return "Foto hochladen für GNSS-Situation";
    }
  };

  const compressPhoto = async (image) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0, image.width, image.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.7 // Adjust compression quality as needed
      );
    });
  };

  const createSubmission = async (photoData) => {
    const punktartLabel = selectedPunktart
      ? punktartOptions.find((option) => option.value === selectedPunktart)
          ?.label
      : "";

    const vermarkungLabel = selectedVermarkungstrager
      ? vermarkungOptions.find(
          (option) => option.value === selectedVermarkungstrager
        )?.label
      : "";

    const statusLabel = selectedStatus
      ? statusOptions.find((option) => option.value === selectedStatus)?.label
      : "";

    const newSubmission = {
      punktart: punktartLabel,
      punktnummer: punktnummer,
      streckennummer: streckennummer,
      km: km,
      met: met,
      seite: seite,
      sonstiges: sonstiges,
      mastnummer: mastnummer,
      selectedStatus: statusLabel,
      selectedVermarkungstrager: vermarkungLabel,
      sonstiges2: sonstiges2,
      gvp: gvp,
      currentDate: currentDate,
      photo: photoData,
    };

    try {
      const db = await openDatabase();
      await addSubmission(db, newSubmission);
      const data = await getAllSubmissions(db);
      setSubmissions(data); // Update the state
      setSuccessMessage("Erfolgreich hinzugefügt");
      setSuccessOpen(true);
      return newSubmission; // Return the created submission
    } catch (error) {
      console.error("Error adding submission: ", error);
      setErrorMessage("Fehler beim Hinzufügen der Einreichung.");
      return null;
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  const downloadPhoto = (submission) => {
    if (!submission) {
      console.error("No submission data for downloading");
      return;
    }

    const date = submission.currentDate.replace(/-/g, "");
    let roundedMetWithoutLastDigit;

    if (submission.met && submission.met.toString().length >= 3) {
      const metAsNumber = parseFloat(submission.met);
      const roundedMet = Math.round(metAsNumber / 10) * 10;
      roundedMetWithoutLastDigit = Math.floor(roundedMet / 10);
    } else {
      roundedMetWithoutLastDigit = submission.met; // No rounding if met has 1 or 2 digits
    }

    let filename;

    if (submission.mastnummer && submission.mastnummer.endsWith("N")) {
      let mastnummer = submission.mastnummer.trim().slice(0, -1);
      filename = `${submission.streckennummer}_${submission.km},${roundedMetWithoutLastDigit}_${submission.seite}_${mastnummer}_${date}.jpg`;
    } else if (
      submission.selectedVermarkungstrager &&
      submission.selectedVermarkungstrager !== "Sonstiges" &&
      submission.selectedVermarkungstrager !== "Keiner"
    ) {
      filename = `${submission.streckennummer}_${submission.km},${roundedMetWithoutLastDigit}_${submission.seite}_${submission.selectedVermarkungstrager}_${date}.jpg`;
    } else if (submission.sonstiges2) {
      filename = `${submission.streckennummer}_${submission.km},${roundedMetWithoutLastDigit}_${submission.seite}_${submission.sonstiges2}_${date}.jpg`;
    } else if (submission.mastnummer) {
      filename = `${submission.streckennummer}_${submission.km},${roundedMetWithoutLastDigit}_${submission.seite}_${submission.mastnummer}_${date}.jpg`;
    } else {
      console.error("Invalid submission data");
      return;
    }

    const base64Data = submission.photo.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters, (char) =>
      char.charCodeAt(0)
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCombinedTodayData = () => {
    const zip = new JSZip();
    const todaySubmissions = submissions.filter(
      (entry) => entry.currentDate === currentDate
    );

    // Add the CSV data to the ZIP file
    const csvContent =
      "Punktart; Punktnummer; Streckennummer; Kilometrierung; Seite (bezogen auf Strecke); Sonstiges; Mastnummer; Status; Vermarkung; Sonstiges Vermarkung; Offset [m]; Datum\n" +
      todaySubmissions
        .map((entry) => {
          const gvpInMeters = (entry.gvp / 1000).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
          });
          return `${entry.selectedPunktart};${entry.punktnummer};${entry.streckennummer};${entry.km},${entry.met};${entry.seite};${entry.sonstiges};${entry.mastnummer};${entry.selectedStatus};${entry.selectedVermarkungstrager};${entry.sonstiges2};${gvpInMeters};${currentDate}`;
        })
        .join("\n");

    zip.file(`${currentDate}.csv`, csvContent);

    const vorhandenMitTargetFolder = zip.folder("Vorhanden_mit_Target");
    const vorhandenOhneTargetFolder = zip.folder("Vorhanden_ohne_Target");

    // Add the image files to the ZIP file
    todaySubmissions.forEach((el, index) => {
      const date = el.currentDate.replace(/-/g, "");
      let roundedMetWithoutLastDigit;
      if (el.met && el.met.toString().length >= 3) {
        const metAsNumber = parseFloat(el.met);
        const roundedMet = Math.round(metAsNumber / 10) * 10;
        roundedMetWithoutLastDigit = Math.floor(roundedMet / 10);
      } else {
        roundedMetWithoutLastDigit = el.met; // No rounding if met has 1 or 2 digits
      }
      let folderToAdd;
      if (el.selectedStatus === "Vorhanden ohne Target") {
        folderToAdd = vorhandenOhneTargetFolder;
      } else {
        folderToAdd = vorhandenMitTargetFolder;
      }

      let filename;

      if (el.mastnummer && el.mastnummer.endsWith("N")) {
        let mastnummer = el.mastnummer;
        mastnummer = mastnummer.trim().slice(0, -1);
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${mastnummer}_${date}.jpg`;
      } else if (
        el.selectedVermarkungstrager &&
        el.selectedVermarkungstrager !== "Sonstiges"
      ) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.selectedVermarkungstrager}_${date}.jpg`;
      } else if (el.sonstiges2) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.sonstiges2}_${date}.jpg`;
      } else if (el.mastnummer) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.mastnummer}_${date}.jpg`;
      } else {
        // Handle the case when none of the conditions are met
        console.error("Invalid submission data");
        return;
      }
      if (el.photo instanceof Blob) {
        // Assuming el.photo is a Blob
        folderToAdd.file(filename, el.photo);
      } else if (typeof el.photo === "string") {
        // Assuming el.photo is a base64 encoded string
        const base64Data = el.photo.split(",")[1];
        folderToAdd.file(filename, base64Data, { base64: true });
      }
    });

    // Create and trigger a download link for the ZIP file
    zip.generateAsync({ type: "blob" }).then((content) => {
      const cur_date = new Date().toISOString().slice(0, 10);
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cur_date}.zip`;
      setTimeout(() => {
        link.click();
      }, 100);
    });
  };

  const downloadCombinedData = () => {
    const zip = new JSZip();

    // Add the CSV data to the ZIP file
    const csvContent =
      "Punktart; Punktnummer; Streckennummer;Kilometrierung; Seite (bezogen auf Strecke); Sonstiges; Mastnummer; Status; Vermarkung; Sonstiges Vermarkung; Offset [m]; Datum\n" +
      submissions
        .map((entry) => {
          console.log(entry.selectedStatus);
          const gvpInMeters = (entry.gvp / 1000).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
          });
          return `${entry.selectedPunktart};${entry.punktnummer};${entry.streckennummer};${entry.km},${entry.met};${entry.seite};${entry.sonstiges};${entry.mastnummer};${entry.selectedStatus};${entry.selectedVermarkungstrager};${entry.sonstiges2};${gvpInMeters};${entry.currentDate}`;
        })
        .join("\n");

    zip.file("alle_daten.csv", csvContent);

    const ps0 = zip.folder("PS0");
    const ps1 = zip.folder("PS1");
    const ps2 = zip.folder("PS2");
    const ps3 = zip.folder("PS3");
    const gvp = zip.folder("GVP");
    const vorhandenMitTargetFolder = gvp.folder("Vorhanden_mit_Target");
    const vorhandenOhneTargetFolder = gvp.folder("Vorhanden_ohne_Target");
    console.log("GVP folder exists:", gvp);
    console.log("Vorhanden_mit_Target folder:", vorhandenMitTargetFolder);
    console.log("Vorhanden_ohne_Target folder:", vorhandenOhneTargetFolder);

    // Add the image files to the ZIP file
    submissions.forEach((el, index) => {
      console.log(
        `Processing submission #${index} with status: '${el.selectedStatus}'and punktart: '${el.selectedPunktart}'`
      );
      const date = el.currentDate.replace(/-/g, "");
      let roundedMetWithoutLastDigit;

      if (el.met && el.met.toString().length >= 3) {
        const metAsNumber = parseFloat(el.met);
        const roundedMet = Math.round(metAsNumber / 10) * 10;
        roundedMetWithoutLastDigit = Math.floor(roundedMet / 10);
      } else {
        roundedMetWithoutLastDigit = el.met; // No rounding if met has 1 or 2 digits
      }
      const normalizedStatus = el.selectedStatus?.trim().toLowerCase();
      console.log(`Normalized status: '${normalizedStatus}'`);
      let folderToAdd;
      if (el.selectedPunktart === "PS0") folderToAdd = ps0;
      else if (el.selectedPunktart === "PS1") folderToAdd = ps1;
      else if (el.selectedPunktart === "PS2") folderToAdd = ps2;
      else if (el.selectedPunktart === "PS3") folderToAdd = ps3;
      else if (
        el.selectedPunktart === "PS4" &&
        normalizedStatus === "vorhanden (ohne target)"
      )
        folderToAdd = vorhandenOhneTargetFolder;
      else if (
        el.selectedPunktart === "PS4" &&
        normalizedStatus === "vorhanden (mit target)"
      )
        folderToAdd = vorhandenMitTargetFolder;
      else {
        folderToAdd = gvp;
      }
      console.log(`Adding to folder: ${folderToAdd.name}`);

      let filename;

      if (el.mastnummer && el.mastnummer.endsWith("N")) {
        let mastnummer = el.mastnummer;
        mastnummer = mastnummer.trim().slice(0, -1);
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${mastnummer}_${date}.jpg`;
      } else if (
        el.selectedVermarkungstrager &&
        el.selectedVermarkungstrager !== "Sonstiges"
      ) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.selectedVermarkungstrager}_${date}.jpg`;
      } else if (el.sonstiges2) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.sonstiges2}_${date}.jpg`;
      } else if (el.mastnummer) {
        filename = `${el.streckennummer}_${el.km},${roundedMetWithoutLastDigit}_${el.seite}_${el.mastnummer}_${date}.jpg`;
      } else {
        // Handle the case when none of the conditions are met
        console.error("Invalid submission data");
        return;
      }
      if (el.photo instanceof Blob) {
        // Assuming el.photo is a Blob
        folderToAdd.file(filename, el.photo);
      } else if (typeof el.photo === "string") {
        // Assuming el.photo is a base64 encoded string
        const base64Data = el.photo.split(",")[1];
        folderToAdd.file(filename, base64Data, { base64: true });
      }
    });

    // Create and trigger a download link for the ZIP file
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "combined_data.zip";
      setTimeout(() => {
        link.click();
      }, 100);
    });
  };

  /*const downloadPhoto = () => {
    if (submissions.length === 0) {
      console.error("No submissions available");
      return;
    }

    const lastSubmission = submissions[submissions.length - 1];

    const date = lastSubmission.currentDate.replace(/-/g, "");
    let roundedMetWithoutLastDigit;

    if (lastSubmission.met && lastSubmission.met.toString().length >= 3) {
      const metAsNumber = parseFloat(lastSubmission.met);
      const roundedMet = Math.round(metAsNumber / 10) * 10;
      roundedMetWithoutLastDigit = Math.floor(roundedMet / 10);
    } else {
      roundedMetWithoutLastDigit = lastSubmission.met; // No rounding if met has 1 or 2 digits
    }

    let filename;

    if (lastSubmission.mastnummer && lastSubmission.mastnummer.endsWith("N")) {
      let mastnummer = lastSubmission.mastnummer;
      mastnummer = mastnummer.trim().slice(0, -1);
      filename = `${lastSubmission.streckennummer}_${lastSubmission.km},${roundedMetWithoutLastDigit}_${lastSubmission.seite}_${mastnummer}_${date}.jpg`;
    } else if (
      lastSubmission.selectedVermarkungstrager &&
      lastSubmission.selectedVermarkungstrager !== "Sonstiges"
    ) {
      filename = `${lastSubmission.streckennummer}_${lastSubmission.km},${roundedMetWithoutLastDigit}_${lastSubmission.seite}_${lastSubmission.selectedVermarkungstrager}_${date}.jpg`;
    } else if (lastSubmission.sonstiges2) {
      filename = `${lastSubmission.streckennummer}_${lastSubmission.km},${roundedMetWithoutLastDigit}_${lastSubmission.seite}_${lastSubmission.sonstiges2}_${date}.jpg`;
    } else if (lastSubmission.mastnummer) {
      filename = `${lastSubmission.streckennummer}_${lastSubmission.km},${roundedMetWithoutLastDigit}_${lastSubmission.seite}_${lastSubmission.mastnummer}_${date}.jpg`;
    } else {
      console.error("Invalid submission data");
      return;
    }

    if (lastSubmission.photo instanceof Blob) {
      const url = window.URL.createObjectURL(lastSubmission.photo);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } else if (typeof lastSubmission.photo === "string") {
      const base64Data = lastSubmission.photo.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  };*/
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        maxWidth="400px"
        margin="0 auto"
        padding="20px"
        marginTop="10px"
        border="1px solid #ccc"
        borderRadius="8px"
        boxShadow="0 0 5px rgba(0, 0, 0, 0.2)"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <FormControl component="fieldset">
            <RadioGroup
              row
              required
              id="punktzustand"
              name="punktzustand"
              value={punktzustand}
              onChange={(e) => {
                setselectedPunktzustand(Number(e.target.value));
              }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              {punktzustandOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <br />
        <Typography variant="h6" className={classes.title}>
          Punktart
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="punktart"
            id="punktart"
            value={selectedPunktart}
            label="Punktart"
            onChange={(event) => handleChangePunktart(event)}
          >
            {punktartOptions
              .filter(
                (option) => !shouldDisablePunktart(option.value, punktzustand)
              )
              .map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <br></br>
        <Attribute
          name="Punktnummer"
          value={punktnummer}
          setValue={setPunktnummer}
        />
        <Typography variant="h6" className={classes.title}>
          Status:
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="status"
            id="status"
            value={selectedStatus}
            label="Status"
            //onChange={(event) => handleChangeStatus(event)}
            disabled={
              [100, 101, 102, 103].includes(selectedPunktart) &&
              punktzustand === 20
            }
          >
            {statusOptions
              .filter(
                (option) =>
                  !shouldDisableStatus(
                    option.value,
                    selectedPunktart,
                    punktzustand
                  )
              )
              .map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <br></br>
        <Typography variant="h6" className={classes.title}>
          Vermarkungsträger:
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="vermarkungstraeger"
            id="vermarkungstraeger"
            value={selectedVermarkungstrager}
            label="Vermarkung"
            onChange={(event) => handleChangeVermarkungstrager(event)}
            disabled={!!mastnummer}
          >
            {vermarkungOptions
              .filter(
                (option) =>
                  !shouldDisableVermarkung(
                    option.value,
                    punktzustand,
                    selectedPunktart
                  )
              )
              .map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {selectedVermarkungstrager === 160 && (
          <Attribute
            name="Sonstiges"
            value={sonstiges2}
            setValue={setSonstiges2}
            disabled={selectedVermarkungstrager !== 160}
          />
        )}

        <br></br>
        <Typography variant="h6" className={classes.title}>
          Vermarkungsart:
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="vermarkungsArt"
            id="vermarkungsArt"
            value={selectedVermarkungsArt}
            label="Vermarkungsart"
            onChange={(event) => {
              handleChangeVermarkungsArt(event);
              handleSelectionVermarkungsart(
                punktzustand,
                selectedPunktart,
                event.target.value
              );
            }}
            disabled={!!mastnummer}
          >
            {vermarkungArtOptions
              .filter(
                (option) =>
                  !shouldDisableVermarkungArt(
                    option.value,
                    punktzustand,
                    selectedPunktart
                  )
              )
              .map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {selectedVermarkungsArt === 200 && (
          <Attribute
            name="Sonstiges"
            value={sonstigesArt}
            setValue={setSonstigesArt}
            disabled={selectedVermarkungsArt !== 200}
          />
        )}
        {showWarning && (
          <Dialog
            open={!!showWarning}
            onClose={handleCloseWarning}
            aria-labelledby="warning-dialog-title"
            aria-describedby="warning-dialog-description"
          >
            <DialogTitle id="warning-dialog-title">Warnung</DialogTitle>
            <DialogContent>
              <Typography id="warning-dialog-description">
                {showWarning.message}
              </Typography>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <Checkbox
                  checked={dontShowWarnings[showWarning.key]}
                  onChange={handleDontShowAgainChange}
                  color="primary"
                  id="dont-show-again-checkbox"
                />
                <label
                  htmlFor="dont-show-again-checkbox"
                  style={{ cursor: "pointer" }}
                >
                  Nicht mehr anzeigen
                </label>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseWarning} color="primary" autoFocus>
                Verstanden
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <br></br>
        <Attribute
          name="Streckennummer"
          value={streckennummer}
          setValue={setStreckennummer}
        />
        <Typography variant="h6" className={classes.title}>
          Kilometrierung [km]
        </Typography>
        <Box display="flex" flexDirection="row" alignItems="center">
          <TextField
            required
            value={km}
            style={{ marginRight: "5px" }}
            id="km"
            name="km"
            placeholder="z.B. 695"
            onChange={(e) => setKm(e.target.value)}
            inputProps={{ style: { textAlign: "center" }, maxLength: 2 }}
          />
          <Typography>, </Typography>
          <TextField
            required
            value={met}
            style={{ marginLeft: "5px" }}
            id="met"
            name="met"
            placeholder="87"
            onChange={(e) => setMet(e.target.value)}
            inputProps={{ style: { textAlign: "center" }, maxLength: 3 }}
          />
        </Box>

        <br></br>
        <Typography variant="h6" className={classes.title}>
          Seite (bezogen auf Strecke)
        </Typography>

        <Box display="flex" flexDirection="row" alignItems="center">
          <FormControl component="fieldset">
            <RadioGroup
              row
              required
              id="seite"
              name="seite"
              value={seite}
              onChange={(e) => setSeite(e.target.value)}
            >
              <FormControlLabel value="L" control={<Radio />} label="L" />
              <FormControlLabel value="R" control={<Radio />} label="R" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            value={sonstiges}
            onChange={(e) => setSonstiges(e.target.value)}
            label="Sonstiges"
            id="sonstiges"
            name="sonstiges"
            InputLabelProps={{
              style: { textAlign: "center", width: "100%", marginLeft: "0" },
            }}
            inputProps={{ style: { textAlign: "center" } }}
          />
        </Box>
        <br></br>
        <Attribute
          name="Mastnummer"
          value={mastnummer}
          setValue={setMastnummer}
          disabled={
            selectedVermarkungstrager !== null &&
            selectedVermarkungstrager !== 10
          }
        />
        <Attribute
          name="Offset [mm]"
          value={gvp}
          setValue={setGVP}
          disabled={selectedPunktart !== 104}
        />
        <br></br>
        <Typography variant="h6" className={classes.title}>
          Datum
        </Typography>
        <br></br>
        <TextField
          required
          fullWidth
          name="currentDate"
          placeholder="z.B. 2023-10-20"
          value={currentDate}
          onChange={(e) => {
            setCurrentDate(e.target.value);
          }}
          margin="normal"
          inputProps={{ style: { textAlign: "center" } }}
        />
        <br></br>

        <Typography variant="h6" className={classes.title}>
          {getTitle(punktzustand, selectedPunktart)}
        </Typography>

        <input
          ref={(el) => (reff.current = el)}
          required
          type="file"
          name="photo"
          accept="image/*;capture=camera"
          multiple
          onChange={(e) => {
            handleSelectionFoto(punktzustand, selectedPunktart);
            handlePhotoChange(e);
          }}
        />

        {photo && photo.length > 0 && (
          <div>
            {photo.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                style={{ width: 100, height: 100, margin: 5 }}
              />
            ))}
          </div>
        )}
      </Box>
      <Buttons
        handleSubmit={handleSubmit}
        downloadCombinedData={downloadCombinedData}
        downloadCombinedTodayData={downloadCombinedTodayData}
      />
      <Snackbar
        open={!!successMessage}
        autoHideDuration={7000}
        onClose={handleSuccessClose}
      >
        <SnackbarContent
          message={successMessage}
          className={classes.successSnackbar}
        />
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={12000}
        onClose={handleErrorClose}
      >
        <SnackbarContent
          message={errorMessage}
          className={classes.errorSnackbar}
        />
      </Snackbar>
    </Dialog>
  );
};

export default SimpleDialog;
