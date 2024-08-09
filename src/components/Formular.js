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
  const [sonstiges2, setSonstiges2] = useState("");
  const [gvp, setGVP] = useState("");
  const [photo, setPhoto] = useState(null);
  const { onClose, selectedValue, open } = props;
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submissions, setSubmissions] = useState([]); // Store all submissions
  const [successOpen, setSuccessOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  //const webcamRef = useRef(null);

  useEffect(() => {
    setCurrentDate(new Date().toISOString().slice(0, 10));
  }, [currentDate, setCurrentDate]);

  /*  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  };
 */
  /* const videoConstraints = {
    width: 440,
    height: 280,
    facingMode: { exact: "environment" },
  }; */

  const handlePhotoChange = (e) => {
    const photoFile = e.target.files[0];
    setPhoto(photoFile);
  };

  const resetForm = () => {
    setPunktnummer("");
    setStreckennummer("");
    setKm("");
    setMet("");
    setSeite(false);
    setSonstiges("");
    setMastnummer("");
    setselectedStatus(null);
    setselectedVermarkungstrager(null);
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

  const vermarkungOptions = [
    { value: 10, label: "Keiner" },
    { value: 20, label: "Laterne" },
    { value: 30, label: "Wand" },
    { value: 40, label: "Fundament" },
    { value: 50, label: "Lärmschutzwand" },
    { value: 60, label: "Widerlager" },
    { value: 70, label: "Sonstiges" },
  ];

  const statusOptions = [
    { value: 1, label: "Neu vermarkter GVP mit Target" },
    { value: 2, label: "Vorhanden (nicht in Auswahl) mit Target" },
  ];

  const handleChangeVermarkungstrager = (event) => {
    setselectedVermarkungstrager(event.target.value);
    if (event.target.value) {
      setMastnummer(""); // Reset Mastnummer when Vermarkungstrager is selected
    }
  };

  const handleChangeStatus = (event) => {
    setselectedStatus(event.target.value);
  };

  const handleSubmit = () => {
    // Check if a photo is selected
    if (!photo) {
      setErrorMessage("Bitte wählen Sie ein Foto aus, bevor Sie fortfahren.");
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    // Check if streckennummer is empty
    if (!streckennummer) {
      setErrorMessage(
        "Bitte geben Sie die Streckennummer ein, bevor Sie fortfahren."
      );
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    if (!km & !met) {
      setErrorMessage(
        "Bitte geben Sie die Kilometrierung ein, bevor Sie fortfahren."
      );
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    if (!seite) {
      setErrorMessage("Bitte wählen Sie eine Seite aus, bevor Sie fortfahren.");
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    if (!mastnummer) {
      setErrorMessage(
        "Bitte geben Sie eine Mastnummer ein, bevor Sie fortfahren."
      );
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    if (!selectedStatus) {
      setErrorMessage(
        "Bitte wählen Sie einen Status aus, bevor Sie fortfahren."
      );
      setSuccessMessage(""); // Clear any existing success message
      return;
    }
    // Reset the form after a successful submission
    resetForm();

    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64Photo = event.target.result;
      const maxSizeInBytes = 0.5 * 1024 * 1024; // 0.5 MB
      let quality = 1;

      const image = new Image();
      image.src = base64Photo;

      image.onload = async () => {
        // Check if the photo size is smaller than or equal to 0.5 MB
        if (event.total <= maxSizeInBytes) {
          // Do nothing, the photo is already within the size limit
          const vermarkungLabel = selectedVermarkungstrager
            ? vermarkungOptions.find(
                (option) => option.value === selectedVermarkungstrager
              )?.label
            : "";

          const statusLabel = selectedStatus
            ? statusOptions.find((option) => option.value === selectedStatus)
                ?.label
            : "";
          // Append new submission to the array
          const newSubmission = {
            punktnummer: punktnummer,
            streckennummer: streckennummer,
            km: km,
            met: met,
            seite: seite,
            sonstiges: sonstiges,
            mastnummer: mastnummer,
            selectedVermarkungstrager: vermarkungLabel,
            selectedStatus: statusLabel,
            sonstiges2: sonstiges2,
            gvp: gvp,
            currentDate: currentDate,
            photo: base64Photo,
          };

          // Save the new submission to IndexedDB
          try {
            const db = await openDatabase();
            await addSubmission(db, newSubmission);
            const data = await getAllSubmissions(db);
            setSubmissions(data);
            setSuccessMessage("Erfolgreich hinzugefügt");
            setSuccessOpen(true);
          } catch (error) {
            console.error("Error adding or fetching submission: ", error);
          } finally {
            // Clear the success message after a short delay
            setTimeout(() => {
              setSuccessMessage("");
            }, 3000); // Adjust the delay as needed
          }
        } else {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = image.width;
          canvas.height = image.height;

          ctx.drawImage(image, 0, 0, image.width, image.height);

          try {
            const compressedPhotoBlob = await new Promise((resolve) => {
              canvas.toBlob(resolve, "image/jpeg", quality);
            });

            const compressedPhoto = await imageCompression(
              compressedPhotoBlob,
              {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              }
            );
            console.log(
              "compressedFile instanceof Blob",
              compressedPhoto instanceof Blob
            ); // true
            console.log(
              `compressedFile size ${compressedPhoto.size / 1024 / 1024} MB`
            ); // smaller than maxSizeMB

            const vermarkungLabel = selectedVermarkungstrager
              ? vermarkungOptions.find(
                  (option) => option.value === selectedVermarkungstrager
                )?.label
              : "";

            const statusLabel = selectedStatus
              ? statusOptions.find((option) => option.value === selectedStatus)
                  ?.label
              : "";

            const newSubmission = {
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
              photo: compressedPhoto,
            };

            // Save the new submission to IndexedDB
            try {
              const db = await openDatabase();
              await addSubmission(db, newSubmission);
              const data = await getAllSubmissions(db);
              setSubmissions(data);
              setSuccessMessage("Erfolgreich hinzugefügt");
              setSuccessOpen(true);
            } catch (error) {
              console.error("Error adding or fetching submission: ", error);
            }
          } catch (error) {
            /* else {
              console.error("Compressed photo size is still too large.");
              setErrorMessage(
                "Die komprimierte Foto-Größe ist immer noch zu groß, um eine vernünftige Qualität beizubehalten. Bitte wählen Sie eine kleinere Dateigröße oder optimieren Sie das Bild, bevor Sie es hochladen."
              );
              setSuccessMessage(""); // Clear any existing success message
            } */
            console.error("Error compressing photo: ", error);
          }
        }
      };
    };

    // Read the photo data as a data URL
    reader.readAsDataURL(photo);
    reff.current.value = "";
  };

  const downloadCombinedTodayData = () => {
    const zip = new JSZip();
    const todaySubmissions = submissions.filter(
      (entry) => entry.currentDate === currentDate
    );

    // Add the CSV data to the ZIP file
    const csvContent =
      "Punktnummer; Streckennummer; Kilometrierung; Seite (bezogen auf Strecke); Sonstiges; Mastnummer; Status; Vermarkung; Sonstiges Vermarkung; Offset [m]; Datum\n" +
      todaySubmissions
        .map((entry) => {
          const gvpInMeters = (entry.gvp / 1000).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
          });
          return `${entry.punktnummer};${entry.streckennummer};${entry.km},${entry.met};${entry.seite};${entry.sonstiges};${entry.mastnummer};${entry.selectedStatus};${entry.selectedVermarkungstrager};${entry.sonstiges2};${gvpInMeters};${currentDate}`;
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
      "Punktnummer; Streckennummer;Kilometrierung; Seite (bezogen auf Strecke); Sonstiges; Mastnummer; Status; Vermarkung; Sonstiges Vermarkung; Offset [m]; Datum\n" +
      submissions
        .map((entry) => {
          const gvpInMeters = (entry.gvp / 1000).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
          });
          return `${entry.punktnummer};${entry.streckennummer};${entry.km},${entry.met};${entry.seite};${entry.sonstiges};${entry.mastnummer};${entry.selectedStatus};${entry.selectedVermarkungstrager};${entry.sonstiges2};${gvpInMeters};${entry.currentDate}`;
        })
        .join("\n");

    zip.file("alle_daten.csv", csvContent);

    const vorhandenMitTargetFolder = zip.folder("Vorhanden_mit_Target");
    const vorhandenOhneTargetFolder = zip.folder("Vorhanden_ohne_Target");

    // Add the image files to the ZIP file
    submissions.forEach((el, index) => {
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
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "combined_data.zip";
      setTimeout(() => {
        link.click();
      }, 100);
    });
  };

  const downloadPhoto = () => {
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
  };
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
        <Attribute
          name="Punktnummer"
          value={punktnummer}
          setValue={setPunktnummer}
        />
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
        <Typography variant="h6" className={classes.title}>
          Status:
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="status"
            id="status"
            value={selectedStatus}
            label="Status"
            onChange={(event) => handleChangeStatus(event)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="h6" className={classes.title}>
          Wenn keine Mastnummer vorhanden ist, dann Vermarkungsträger auswählen:
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Vermarkungsträger
          </InputLabel>
          <Select
            labelId="vermarkungstraeger"
            id="vermarkungstraeger"
            value={selectedVermarkungstrager}
            label="Vermarkung"
            onChange={(event) => handleChangeVermarkungstrager(event)}
            disabled={!!mastnummer}
          >
            {vermarkungOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Attribute
          name="Sonstiges"
          value={sonstiges2}
          setValue={setSonstiges2}
          disabled={selectedVermarkungstrager !== 70}
        />
        <br></br>
        <Attribute name="Offset [mm]" value={gvp} setValue={setGVP} />
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
          Foto hochladen
        </Typography>
        {/* <Webcam
          audio={false}
          videoConstraints={videoConstraints}
          ref={webcamRef}
        /> */}
        {/* <button onClick={capture}>Foto aufnehmen</button>
        {photo && <img src={photo} alt="Captured" />} */}
        <input
          ref={(el) => (reff.current = el)}
          required
          type="file"
          name="photo"
          accept="image/*;capture=camera"
          onChange={(e) => handlePhotoChange(e)}
        />
      </Box>
      <Buttons
        handleSubmit={handleSubmit}
        downloadPhoto={downloadPhoto}
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
