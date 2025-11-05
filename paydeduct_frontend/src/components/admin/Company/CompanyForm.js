import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import Swal from 'sweetalert2';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getData, getDate, postData, getTime } from '../../../backendservices/FetchNodeServices';

export default function Company() {

  const [companyName, setcompanyName] = useState("");
  const [companyLogo, setcompanyLogo] = useState({
    bytes: "",
    filename: "",
  });
  const [contactPerson, setcontactPerson] = useState('');
  const [emailId, setemailId] = useState('');
  const [mobileNo, setmobileNo] = useState("");
  const [createdTime, setcreatedTime] = useState("");
  const [createdDate, setcreatedDate] = useState("");
  const [user, setuser] = useState("");
  const [status, setstatus] = useState("");
  const [error, setError] = useState({});

 
  const handleError = (field, message) => {
    setError((prev) => ({ ...prev, [field]: message }));
  };

  
  const validation = () => {
    let isError = false;
    let newErrors = {};

    if (!companyName.trim()) {
      newErrors.companyName = "Please enter company name";
      isError = true;
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = "Please enter contact person";
      isError = true;
    }

    if (!emailId.trim()) {
      newErrors.emailId = "Please enter email ID";
      isError = true;
    }

    if (!mobileNo.trim()) {
      newErrors.mobileNo = "Please enter mobile number";
      isError = true;
    } else if (mobileNo.length !== 10) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
      isError = true;
    }

    if (!companyLogo.bytes) {
      newErrors.fileError = "Please upload company logo";
      isError = true;
    }

    setError(newErrors);
    return isError;
  };


  const handleChangelogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setcompanyLogo({
        bytes: file,
        filename: URL.createObjectURL(file),
      });
      handleError("fileError", null);
    }
  };


  const handleChange = async () => {
    setError({});
    const hasError = validation();
    if (hasError) return;

    const formData = new FormData();
    formData.append("companyname", companyName);
    formData.append("emailid", emailId);
    formData.append("contactperson", contactPerson);
    formData.append("mobile", mobileNo);
    formData.append("companylogo", companyLogo.bytes);
    formData.append("created_date", getDate());
    formData.append("created_time", getTime());
    formData.append("user", "xxxxxx");
    formData.append("status", status);

    const response = await postData("companys/insert_company", formData);

    if (response?.status) {
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

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Company Name"
            name="companyName"
            value={companyName}
            onChange={(e) => setcompanyName(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.companyName}
            helperText={error.companyName}
          />
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Company Logo
          </Typography>

          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <img
              src={companyLogo.filename || "/placeholder.png"}
              width={60}
              height={60}
              alt="Company Logo"
              style={{ borderRadius: 6, objectFit: "cover" }}
            />
            <div style={{ color: "#d32f2f", fontSize: "0.75rem" }}>
              {error?.fileError}
            </div>

            <IconButton
              component="label"
              style={{
                display: "flex",
                flexDirection: "column",
                color: "hsla(321, 32%, 37%, 1.00)",
              }}
            >
              <input type="file" hidden onChange={handleChangelogo} />
              <CloudUploadIcon style={{ fontSize: 36 }} />
              <div style={{ fontSize: 10 }}>Upload</div>
            </IconButton>
          </div>
        </Grid>

        <Grid size={6}>
          <TextField
            label="Contact Person"
            name="contactPerson"
            value={contactPerson}
            onChange={(e) => setcontactPerson(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.contactPerson}
            helperText={error.contactPerson}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="Email ID"
            name="emailId"
            type="email"
            value={emailId}
            onChange={(e) => setemailId(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.emailId}
            helperText={error.emailId}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="Mobile No"
            name="mobileNo"
            type="tel"
            value={mobileNo}
            onChange={(e) => setmobileNo(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error.mobileNo}
            helperText={error.mobileNo}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="User"
            name="user"
            value={user}
            onChange={(e) => setuser(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setstatus(e.target.value)}
            select
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Hold">Hold</MenuItem>
            <MenuItem value="Close">Close</MenuItem>
          </TextField>
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
