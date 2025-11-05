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

const DisplayAllPayslips = () => {
    const [payslipList, setPayslipList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // For edit dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchAllPayslips = async () => {
        setLoading(true);
        const res = await getData("payslip/fetch_all_payslips");
        if (res.status) {
            setPayslipList(res.data);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message || "Failed to fetch payslip data",
                timer: 1500,
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllPayslips();
    }, []);

    const handleDelete = async (payslipId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This payslip will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await postData("payslip/delete_payslip", { payslip_id: payslipId });
                if (res.status) {
                    Swal.fire({ title: res.message, icon: "success", timer: 1200 });
                    fetchAllPayslips();
                } else {
                    Swal.fire({ title: res.message, icon: "error", timer: 1200 });
                }
            }
        });
    };

    const handleEdit = (rowData) => {
        setEditData(rowData);
        setOpenDialog(true);
    };

    const handleDialogClose = () => setOpenDialog(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...editData, [name]: value };

        // Auto-calculate DA and HRA when basic_salary changes
        if (name === "basic_salary") {
            const salary = parseFloat(value);
            if (!isNaN(salary)) {
                updatedData.da = (salary * 0.1).toFixed(2);
                updatedData.hra = (salary * 0.1).toFixed(2);
            } else {
                updatedData.da = "";
                updatedData.hra = "";
            }
        }

        setEditData(updatedData);
    };


    const handleUpdate = async () => {
        const res = await postData("payslip/edit_payslip", editData);
        if (res.status) {
            Swal.fire({ icon: "success", title: "Payslip Updated", timer: 1200 });
            setOpenDialog(false);
            fetchAllPayslips();
        } else {
            Swal.fire({ icon: "error", title: "Update Failed", text: res.message });
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
                Payslip Records
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <MaterialTable
                    title="All Payslips"
                    columns={[
                        { title: "ID", field: "payslip_id", filtering: false },
                        { title: "Employee Name", field: "name" },
                        { title: "Date", field: "date_of_payslip" },
                        { title: "Basic Salary", field: "basic_salary", type: "string" },
                        { title: "DA", field: "da", type: "string" },
                        { title: "HRA", field: "hra", type: "string" },
                        { title: "CCA", field: "cca", type: "string" },
                    ]}
                    data={payslipList}
                    actions={[
                        {
                            icon: "edit",
                            tooltip: "Edit Payslip",
                            onClick: (event, rowData) => handleEdit(rowData),
                        },
                        {
                            icon: "delete",
                            tooltip: "Delete Payslip",
                            onClick: (event, rowData) => handleDelete(rowData.payslip_id),
                        },
                        {
                            icon: "add",
                            tooltip: "Add Payslip",
                            isFreeAction: true,
                            onClick: () => navigate("/payslipform"),
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
                <DialogTitle>Edit Payslip</DialogTitle>
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

                    <TextField
                        label="Basic Salary"
                        name="basic_salary"
                        value={editData.basic_salary || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                    <TextField
                        label="DA"
                        name="da"
                        value={editData.da || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                    <TextField
                        label="HRA"
                        name="hra"
                        value={editData.hra || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                    <TextField
                        label="CCA"
                        name="cca"
                        value={editData.cca || ""}
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

export default DisplayAllPayslips;