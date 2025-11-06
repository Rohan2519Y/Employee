import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
} from "@mui/material";
import { postData, getData } from "../../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const JobAssignForm = () => {
    const [companyList, setCompanyList] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);

    const [companyId, setCompanyId] = useState("");
    const [jobId, setJobId] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [assignDate, setAssignDate] = useState("");
    const [status, setStatus] = useState("");
    const [removeDate, setRemoveDate] = useState("");
    const [managerStatus, setManagerStatus] = useState("");
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const params = useParams();

    // Fetch dropdown data
    const fetchAllCompany = async () => {
        var response = await getData("companys/fetch_company");
        setCompanyList(response.data)
    }

    const fillAllCompany = () => {
        return companyList.map((item) => (
            <MenuItem value={item.company_id}>{item.companyname}</MenuItem>
        ))
    }

    const fetchAllJobs = async () => {
        const res = await postData("manager/fetch_jobdescription_by_id", { company_id: companyId });
        setJobList(res.data || []);
        console.log(res.data)
    };

    const fillAllJobs = () => {
        return jobList.map((item) => (
            <MenuItem value={item.job_id}>{item.job_title}</MenuItem>
        ))
    }

    const fetchAllEmployee = async () => {
        const res = await getData("payslip/employee_data");
        setEmployeeList(res.data);
    };

    useEffect(() => {
        fetchAllCompany();
        fetchAllEmployee();
    }, []);

    useEffect(() => {
        fetchAllJobs()
    }, [companyId]);

    const validateForm = () => {
        let temp = {};
        temp.companyId = companyId ? "" : "Please select company";
        temp.jobId = jobId ? "" : "Please select job";
        temp.employeeId = employeeId ? "" : "Please select employee";
        temp.assignDate = assignDate ? "" : "Please select assign date";
        temp.status = status ? "" : "Please select status";
        temp.managerStatus = managerStatus ? "" : "Please select manager status";
        setErrors(temp);
        return Object.values(temp).every((x) => x === "");
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const body = {
            company_id: companyId,
            job_id: jobId,
            employee_id: employeeId,
            assign_date: assignDate,
            statuses: status,
            remove_date: removeDate || null,
            manager_status: managerStatus,
        };

        const response = await postData("jobassign/insert_jobassign", body);
        if (response.status) {
            Swal.fire({
                title: response.message,
                icon: "success",
                timer: 1500,
            });
            navigate("/jobassign/display");
        } else {
            Swal.fire({
                title: response.message,
                icon: "error",
                timer: 1500,
            });
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 700,
                mx: "auto",
                mt: 5,
                p: 4,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 2,
            }}
        >
            <Typography variant="h6" gutterBottom>
                Job Assign Form
            </Typography>

            <Grid container spacing={2}>
                {/* Company */}
                <Grid item size={6}>
                    <TextField
                        select
                        label="Company"
                        fullWidth
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        error={!!errors.companyId}
                        helperText={errors.companyId}
                    >
                        {fillAllCompany()}
                    </TextField>
                </Grid>

                {/* Job */}
                <Grid item size={6}>
                    <TextField
                        select
                        label="Job"
                        fullWidth
                        value={jobId}
                        onChange={(e) => setJobId(e.target.value)}
                        error={!!errors.jobId}
                        helperText={errors.jobId}
                    >
                        {fillAllJobs()}
                    </TextField>
                </Grid>

                {/* Employee */}
                <Grid item size={6}>
                    <TextField
                        select
                        label="Employee"
                        fullWidth
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        error={!!errors.employeeId}
                        helperText={errors.employeeId}
                    >
                        {employeeList.map((item) => (
                            <MenuItem key={item.employee_id} value={item.employee_id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Assign Date */}
                <Grid item size={6}>
                    <TextField
                        label="Assign Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={assignDate}
                        onChange={(e) => setAssignDate(e.target.value)}
                        error={!!errors.assignDate}
                        helperText={errors.assignDate}
                    />
                </Grid>

                {/* Status */}
                <Grid item size={6}>
                    <TextField
                        select
                        label="Status"
                        fullWidth
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        error={!!errors.status}
                        helperText={errors.status}
                    >
                        <MenuItem value="Grant">Grant</MenuItem>
                        <MenuItem value="Remove">Remove</MenuItem>
                    </TextField>
                </Grid>

                {/* Remove Date */}
                <Grid item size={6}>
                    <TextField
                        label="Remove Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={removeDate}
                        onChange={(e) => setRemoveDate(e.target.value)}
                    />
                </Grid>

                {/* Manager Status */}
                <Grid item size={6}
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <FormLabel>Manager Status</FormLabel>
                    <RadioGroup
                        row
                        value={managerStatus}
                        onChange={(e) => setManagerStatus(e.target.value)}
                    >
                        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                    {errors.managerStatus && (
                        <Typography variant="caption" color="error">
                            {errors.managerStatus}
                        </Typography>
                    )}
                </Grid>

                {/* Submit */}
                <Grid item size={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default JobAssignForm;