import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { getData, postData } from "../../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
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
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
} from "@mui/material";

const DisplayAllJobAssign = () => {
    const [jobAssignList, setJobAssignList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dropdown data for editing
    const [companyList, setCompanyList] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({});

    // Fetch job assignments
    const fetchAllJobAssign = async () => {
        setLoading(true);
        const res = await getData("jobassign/fetch_jobassign");
        if (res.status) {
            setJobAssignList(res.data);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message || "Failed to fetch job assignment data",
                timer: 1500,
            });
        }
        setLoading(false);
    };

    // Fetch dropdown data
    const fetchAllCompany = async () => {
        const res = await getData("companys/fetch_company");
        setCompanyList(res.data || []);
    };

    const fetchAllEmployee = async () => {
        const res = await getData("payslip/employee_data");
        setEmployeeList(res.data || []);
    };

    const fetchAllJobs = async (company_id) => {
        const res = await postData("manager/fetch_jobdescription_by_id", { company_id });
        setJobList(res.data || []);
    };

    useEffect(() => {
        fetchAllJobAssign();
        fetchAllCompany();
        fetchAllEmployee();
    }, []);

    // Edit
    const handleEdit = (rowData) => {
        setEditData(rowData);
        fetchAllJobs(rowData.company_id);
        setOpenDialog(true);
    };

    const handleDialogClose = () => setOpenDialog(false);

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
        if (e.target.name === "company_id") {
            fetchAllJobs(e.target.value);
            setEditData({ ...editData, company_id: e.target.value, job_id: "" });
        }
    };

    // Update
    const handleUpdate = async () => {
        const res = await postData("jobassign/edit_jobassign", editData);
        if (res.status) {
            Swal.fire({ icon: "success", title: "Updated Successfully", timer: 1200 });
            setOpenDialog(false);
            fetchAllJobAssign();
        } else {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: res.message,
            });
        }
    };

    // Delete
    const handleDelete = async (jobAssignId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This record will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await postData("jobassign/delete_jobassign", { job_assign_id: jobAssignId });
                if (res.status) {
                    Swal.fire({ title: res.message, icon: "success", timer: 1200 });
                    fetchAllJobAssign();
                } else {
                    Swal.fire({ title: res.message, icon: "error", timer: 1200 });
                }
            }
        });
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
                Job Assignment Records
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <MaterialTable
                    title="All Job Assignments"
                    columns={[
                        { title: "ID", field: "job_assign_id", filtering: false },
                        { title: "Company", field: "companyname" },
                        { title: "Job Title", field: "job_title" },
                        { title: "Employee Name", field: "name" },
                        { title: "Assign Date", field: "assign_date" },
                        { title: "Status", field: "statuses" },
                        { title: "Remove Date", field: "remove_date" },
                        { title: "Manager Status", field: "manager_status" },
                    ]}
                    data={jobAssignList}
                    actions={[
                        {
                            icon: "edit",
                            tooltip: "Edit Job Assignment",
                            onClick: (event, rowData) => handleEdit(rowData),
                        },
                        {
                            icon: "delete",
                            tooltip: "Delete Job Assignment",
                            onClick: (event, rowData) => handleDelete(rowData.job_assign_id),
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
                <DialogTitle>Edit Job Assignment</DialogTitle>
                <DialogContent dividers>
                    {/* Company */}
                    <TextField
                        select
                        label="Company"
                        name="company_id"
                        value={editData.company_id || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    >
                        {companyList.map((item) => (
                            <MenuItem key={item.company_id} value={item.company_id}>
                                {item.companyname}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Job */}
                    <TextField
                        select
                        label="Job"
                        name="job_id"
                        value={editData.job_id || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    >
                        {jobList.map((item) => (
                            <MenuItem key={item.job_id} value={item.job_id}>
                                {item.job_title}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Employee */}
                    <TextField
                        select
                        label="Employee"
                        name="employee_id"
                        value={editData.employee_id || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    >
                        {employeeList.map((item) => (
                            <MenuItem key={item.employee_id} value={item.employee_id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Assign Date */}
                    <TextField
                        label="Assign Date"
                        name="assign_date"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={editData.assign_date || ""}
                        onChange={handleChange}
                    />

                    {/* Status */}
                    <TextField
                        select
                        label="Status"
                        name="statuses"
                        value={editData.statuses || ""}
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    >
                        <MenuItem value="Grant">Grant</MenuItem>
                        <MenuItem value="Remove">Remove</MenuItem>
                    </TextField>

                    {/* Remove Date */}
                    <TextField
                        label="Remove Date"
                        name="remove_date"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={editData.remove_date || ""}
                        onChange={handleChange}
                    />

                    {/* Manager Status */}
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <FormLabel>Manager Status</FormLabel>
                        <RadioGroup
                            row
                            name="manager_status"
                            value={editData.manager_status || ""}
                            onChange={handleChange}
                            sx={{ justifyContent: "center" }}
                        >
                            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio />} label="No" />
                        </RadioGroup>
                    </Box>
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

export default DisplayAllJobAssign;