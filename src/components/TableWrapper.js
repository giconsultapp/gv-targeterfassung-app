import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import MainFormDialogContainer from "./MainFormDialogContainer";
import Dialog from "@material-ui/core/Dialog";
import MainForm from "./MainForm";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: "#6a8dbb",
    color: theme.palette.common.white,
  },
  editButton: {
    color: theme.palette.secondary.main,
  },
  addButtonRow: {
    textAlign: "right",
    padding: theme.spacing(2),
  },
}));

function SimpleDialog({ row, open, onClose, reff, setImportData }) {
  const classes = useStyles();

  const handleClose = () => {
    onClose(); // Closes the dialog
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <Paper elevation={3} className={classes.paper}>
        <MainForm
          row={row}
          reff={reff}
          setImportData={setImportData}
          setOpen={onClose} // Ensures the dialog closes on submission
        />
      </Paper>
    </Dialog>
  );
}

const TableWrapper = ({ importData, reff, setImportData, colNames }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Open the dialog with an empty row for adding a new entry
  const handleOpenNewRowDialog = () => {
    setSelectedRow({}); // Empty row for new entry
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="enhanced table">
        <TableHead>
          <TableRow className={classes.tableHead}>
            {colNames.map((col, idx) => (
              <TableCell key={`keys-${idx}`} align="right">
                {col}
              </TableCell>
            ))}
            <TableCell key={`keys-edit`} align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {importData.map((row, idx) => (
            <TableRow key={idx}>
              {colNames.map((col, idx) => (
                <TableCell key={`values-${idx}`} align="right">
                  {row[col]}
                </TableCell>
              ))}
              <TableCell align="right">
                <MainFormDialogContainer
                  row={row}
                  reff={reff}
                  setImportData={setImportData}
                />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={colNames.length + 1} align="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenNewRowDialog}
              >
                Neuer Punkt hinzufügen
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <SimpleDialog
          row={selectedRow}
          open={open}
          onClose={handleClose}
          reff={reff}
          setImportData={setImportData}
        />
      </Table>
    </TableContainer>
  );
};

export default TableWrapper;
