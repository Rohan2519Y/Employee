import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { getData, postData } from "../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

const DisplayAllDeductions = () => {
    const [deductionList, setDeductionList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Edit dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({});

    // Fetch all deductions
    const fetchAllDeductions = async () => {
        setLoading(true);
        const res = await getData("deduction/fetch_all_deductions");
        if (res.status) {
            setDeductionList(res.data);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message || "Failed to fetch deduction data",
                timer: 1500,
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllDeductions();
    }, []);

    // Delete deduction
    const handleDelete = async (deductionId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This deduction will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await postData("deduction/delete_deduction", {
                    deduction_id: deductionId,
                });
                if (res.status) {
                    Swal.fire({ title: res.message, icon: "success", timer: 1200 });
                    fetchAllDeductions();
                } else {
                    Swal.fire({ title: res.message, icon: "error", timer: 1200 });
                }
            }
        });
    };

    // Edit
    const handleEdit = (rowData) => {
        setEditData(rowData);
        setOpenDialog(true);
    };

    const handleDialogClose = () => setOpenDialog(false);

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Update
    const handleUpdate = async () => {
        const res = await postData("deduction/edit_deduction", editData);
        if (res.status) {
            Swal.fire({ icon: "success", title: "Deduction Updated", timer: 1200 });
            setOpenDialog(false);
            fetchAllDeductions();
        } else {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: res.message,
            });
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 1100,
                mx: "auto",
                mt: 5,
                p: 3,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 2,
            }}
        >
            <Typography variant="h6" gutterBottom>
                Deduction Records
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <MaterialTable
                    title="All Deductions"
                    columns={[
                        { title: "ID", field: "deduction_id", filtering: false },
                        { title: "Employee Name", field: "name" },
                        { title: "Date of Payslip", field: "date_of_payslip" },
                        { title: "Deduction Type", field: "type_of_deduction" },
                        { title: "Deduction Amount", field: "deduction_amt" },
                        { title: "Remark", field: "remark" },
                    ]}
                    data={deductionList}
                    actions={[
                        {
                            icon: "edit",
                            tooltip: "Edit Deduction",
                            onClick: (event, rowData) => handleEdit(rowData),
                        },
                        {
                            icon: "delete",
                            tooltip: "Delete Deduction",
                            onClick: (event, rowData) => handleDelete(rowData.deduction_id),
                        },
                    ]}
                    options={{
                        headerStyle: {
                            backgroundColor: "#f5f5f5",
                            fontWeight: "bold",
                        },
                        rowStyle: {
                            fontSize: 14,
                        },
                    }}
                />
            )}

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} fullWidth>
                <DialogTitle>Edit Deduction</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Employee Name"
                        name="name"
                        value={editData.name || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />

                    <TextField
                        label="Date of Payslip"
                        name="date_of_payslip"
                        value={editData.date_of_payslip || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />

                    {/* ✅ Proper dropdown with correct binding */}
                    <TextField
                        select
                        label="Deduction Type"
                        name="type_of_deduction"
                        value={editData.type_of_deduction || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                        SelectProps={{ native: true }}
                    >
                        <option value="EMI">EMI</option>
                        <option value="IMS">IMS</option>
                        <option value="Advance">Advance</option>
                        <option value="Tax">Tax</option>
                        <option value="TDS">TDS</option>
                        <option value="Others">Others</option>
                    </TextField>

                    <TextField
                        label="Deduction Amount"
                        name="deduction_amt"
                        value={editData.deduction_amt || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />

                    <TextField
                        label="Remark"
                        name="remark"
                        value={editData.remark || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleUpdate}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
};

export default DisplayAllDeductions;
