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
import { useNavigate } from "react-router-dom";

export default function ManagerForm() {
  const [companyList, setCompanyList] = useState([]);
  const [jobList, setJobList] = useState([]);

  // Form fields
  const [companyId, setCompanyId] = useState("");
  const [jobId, setJobId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [othContactNo, setOthContactNo] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [status, setStatus] = useState("");
  const [removeDate, setRemoveDate] = useState("");
  const [managerStatus, setManagerStatus] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Fetch company list
  const fetchAllCompany = async () => {
    const res = await getData("companys/fetch_company");
    if (res.status) setCompanyList(res.data);
  };

  // Fetch jobs based on company
  const fetchAllJobs = async () => {
    if (!companyId) return;
    const res = await postData("manager/fetch_jobdescription_by_id", {
      company_id: companyId,
    });
    if (res.status) setJobList(res.data || []);
  };

  useEffect(() => {
    fetchAllCompany();
  }, []);

  useEffect(() => {
    fetchAllJobs();
  }, [companyId]);

  const validateForm = () => {
    let temp = {};
    temp.companyId = companyId ? "" : "Please select company";
    temp.jobId = jobId ? "" : "Please select job";
    temp.managerName = managerName ? "" : "Please enter manager name";
    temp.emailId = emailId ? "" : "Please enter email";
    temp.mobileNo = mobileNo ? "" : "Please enter mobile no";
    temp.othContactNo = othContactNo ? "" : "Please enter other contact no";

    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  const handleSubmit = async () => {
      
    if (!validateForm()) return;
    const body = {
      company_id: companyId,
      job_id: jobId,
      manager_name: managerName,
      email_id: emailId,
      mobile_no: mobileNo,
      oth_contact_no: othContactNo,
      assign_date: assignDate,
      statuses: status,
      remove_date: removeDate || null,
      manager_status: managerStatus,
    };

    const response = await postData("manager/insert_manager", body);
    if (response.status) {
      Swal.fire({
        title: response.message,
        icon: "success",
        timer: 1500,
      });
    
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
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        p: 4,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Manager Form
      </Typography>

      <Grid container spacing={2}>
        {/* Company Dropdown */}
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
            {companyList.map((item) => (
              <MenuItem key={item.company_id} value={item.company_id}>
                {item.companyname}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Job Dropdown */}
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
            {jobList.map((item) => (
              <MenuItem key={item.job_id} value={item.job_id}>
                {item.job_title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Manager Name */}
        <Grid item size={6}>
          <TextField
            label="Manager Name"
            fullWidth
            value={managerName}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value)) {
                setManagerName(value);
              }
            }}
            error={!!errors.managerName}
            helperText={errors.managerName}
          />
        </Grid>

        {/* Email ID */}
        <Grid item size={6}>
          <TextField
            label="Email ID"
            type="email"
            fullWidth
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            error={!!errors.emailId}
            helperText={errors.emailId}
          />
        </Grid>

        {/* Mobile No */}
        <Grid item size={6}>
          <TextField
            label="Mobile No"
            type="number"
            fullWidth
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            error={!!errors.mobileNo}
            helperText={errors.mobileNo}
          />
        </Grid>

        {/* Other Contact No */}
        <Grid item size={6}>
          <TextField
            label="Other Contact No"
            type="number"
            fullWidth
            value={othContactNo}
            onChange={(e) => setOthContactNo(e.target.value)}
            error={!!errors.othContactNo}
            helperText={errors.othContactNo}
          />
        </Grid>

        {/* Assign Date */}

        {/* Status */}

        {/* Remove Date */}

        {/* Manager Status */}

        {/* Submit Button */}
        <Grid item xs={12}>
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
}
