import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  InputLabel,
  FormControl, Select
} from '@mui/material';
import Swal from 'sweetalert2';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getData, getDate, postData, getTime } from '../../../backendservices/FetchNodeServices';

export default function JobDescription() {

  const [job_title, setjob_title] = useState("");

  const [job_location, setjob_location] = useState('');
  const [lpa, setlpa] = useState('');
  const [exp_min, setexp_min] = useState("");
  const [createdTime, setcreatedTime] = useState("");
  const [createdDate, setcreatedDate] = useState("");
  const [exp_max, setexp_max] = useState("");
  const [job_des, setjob_des] = useState("");
  const [error, setError] = useState({});
  const [companydd, setcompanydd] = useState("")
  const [companyList, setcompanyList] = useState([])

  const handleError = (field, message) => {
    setError((prev) => ({ ...prev, [field]: message }));
  };


  const validation = () => {
    let isError = false;
    let newErrors = {};

    if (!job_title.trim()) {
      newErrors.job_title = "Please enter company name";
      isError = true;
    }

    if (!job_location.trim()) {
      newErrors.job_location = "Please enter contact person";
      isError = true;
    }

    if (!lpa.trim()) {
      newErrors.lpa = "Please enter email ID";
      isError = true;
    }

    if (!exp_min.trim()) {
      newErrors.exp_min = "Please enter mobile number";
      isError = true;
    } else if (exp_min.length !== 10) {
      newErrors.exp_min = "Mobile number must be 10 digits";
      isError = true;
    }



    setError(newErrors);
    return isError;
  };

  const handlecompany = (e) => {

    setcompanydd(e.target.value)
  }
  const fetchAllCompany = async () => {
    var response = await getData("companys/fetch_company");
    setcompanyList(response.data)
  }
  useEffect(function () {
    fetchAllCompany();
  }, []);
  const fillAllCompany = () => {
    return companyList.map((item) => (
      <MenuItem value={item.company_id}>{item.companyname}</MenuItem>
    ))

  }
  const handleChange = async () => {
    setError({});
    const hasError = validation();
    if (hasError) return;

    const body = {
      job_title: job_title,
      lpa: lpa,
      job_location: job_location,
      exp_min: exp_min,
      exp_max: exp_max,
      job_des: job_des,
      company_id: companydd,
     
    };

    const response = await postData("jobdescription/insert_jobdescription", body);

    if (response?.job_des) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: response.message,
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: response?.message || "Upload failed",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
        margin: 'auto',
        mt: 5,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h5" mb={2} align="center">
        Company Registration Form
      </Typography>
      {/* job_id, company_id, job_title, job_location, lpa, exp_min, exp_max, job_des */}
      <Grid container spacing={2}>

        <Grid size={12}>
          <FormControl fullWidth>
            <InputLabel>company</InputLabel>
            <Select
              label="company"
              value={companydd}
              fullWidth
              onChange={handlecompany}
            >
              {fillAllCompany()}
            </Select>
          </FormControl>

        </Grid>
        <Grid size={12}>
          <TextField
            label="job_title"
            name="job_title"
            value={job_title}
            onChange={(e) => setjob_title(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.job_title}
            helperText={error.job_title}
          />
        </Grid>



        <Grid size={6}>
          <TextField
            label="job_location"
            name="job_location"
            value={job_location}
            onChange={(e) => setjob_location(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.job_location}
            helperText={error.job_location}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="LPA"
            name="lpa"
            type="email"
            value={lpa}
            onChange={(e) => setlpa(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.lpa}
            helperText={error.lpa}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="exp_min"
            name="exp_min"
            type="text"
            value={exp_min}
            onChange={(e) => setexp_min(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.exp_min}
            helperText={error.exp_min}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="exp_max"
            name="exp_max"
            value={exp_max}
            onChange={(e) => setexp_max(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Grid>

        <Grid size={12}>
          <label htmlFor="job_des"></label>
          <TextField
            label="Job Description"
            name="job_des"
            value={job_des}
            onChange={(e) => setjob_des(e.target.value)}

            fullWidth
            margin="normal"

          />
        </Grid>


        <Grid size={12}>
          <Button
            variant="contained"
            color="success"
            onClick={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
