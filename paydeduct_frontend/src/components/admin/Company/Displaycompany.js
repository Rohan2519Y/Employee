

    import { getData, postData } from "../../../backendservices/FetchNodeServices";
import MaterialTable from "@material-table/core";
import Swal from "sweetalert2";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  Box,

} from "@mui/material";


import CloseIcon from "@mui/icons-material/Close";

import { serverURL } from "../../../backendservices/FetchNodeServices";

import { useEffect, useState } from "react";
import { getDate, getTime } from"../../../backendservices/FetchNodeServices";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

import FormLabel from "@mui/material/FormLabel";

import { useNavigate } from "react-router-dom";


export default function DisplayCompany() {
  

  const [open, setOpen] = useState(false);
  const [CompanyList, setCompanyList] = useState([]);


  //**************************************************Edit Company**************************************************************************** */




  const [companyName, setcompanyName] = useState("");
  const [companyLogo, setcompanylogo] = useState({
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
  const [company_id,setcompany_id]=useState("")


 
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
      setcompanylogo({
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
  
    const body = {
  companyname: companyName,
  emailid: emailId,
  contactperson: contactPerson,
  mobile: mobileNo,

  created_date: getDate(),
  created_time: getTime(),
  user: "xxxxxx",
  status: status,
  company_id:company_id
};


    const formData = new FormData();
   formData.append("companylogo", companyLogo.bytes);
    formData.append("created_date", getDate());
    formData.append("company_id", company_id);
    formData.append("created_time", getTime());
    const response = await postData("companys/edit_company", body);
    const response1 = await postData("companys/update_icon", formData);

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
    if (response1?.status) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: response1.message,
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
      fatchAllCompany()
      setOpen(false)

    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: response1?.message || "Upload failed",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    }
  };
const showCompany=()=>{
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
         <div style={{ display: "flex", marginBottom: "auto"  }}>
                  <IconButton onClick={HandelcloseDialog}>
                    <CloseIcon style={{ color: "#fff" }} />
                  </IconButton>
                </div>
      <Typography variant="h5" mb={2} align="center">
         Edit Company Registration Form
      </Typography>

      <Grid container spacing={1}>
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

  //***************************************************************************************************************************************** */
  const fatchAllCompany = async () => {
    var res = await getData("companys/fetch_company");
    setCompanyList(res.data);
    console.log("data", res.data);
  };
  useEffect(function () {
    fatchAllCompany();
  }, []);
  const HandleDelete = async (company_id) => {
    Swal.fire({
      title: "Do you want to Delete the selectedCategory?",

      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await postData("companys/delete_company", {
           company_id: company_id,
        });
        Swal.fire(response.message);
        fatchAllCompany()
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info")
      }
    });
  };

     //company_id, companyname, companylogo, contactperson, emailid, mobile, created_time, created_date, user, status
  const HandleopenDialog = (rowData, status) => {
    console.log(rowData);
setcompanyName(rowData.companyname)
setcontactPerson(rowData.contactperson)
setcreatedDate(rowData.created_date)
setcreatedTime(rowData.created_time)
setemailId(rowData.emailid)
setmobileNo(rowData.mobile)
setuser(rowData. user)
setstatus(rowData. status)
setcompany_id(rowData.company_id)

        setcompanylogo({
      filename: `${serverURL}/images/${rowData.companylogo}`,
      bytes: "",
    });
    
 setOpen(true);
  };

  const showDialog = () => {
    return (
      <div>
        <Dialog open={open}>
          <DialogTitle
            style={{ display: "flex", justifyContent: "flex-end" }}
          ></DialogTitle>
          <DialogContent>
            {showCompany()}
          
          </DialogContent>
      
        </Dialog>
      </div>
    );
  };
  const HandelcloseDialog = () => {
    setOpen(false);
  };

  const DisplayAllrecod = () => {

    return (
      <MaterialTable
        title="List of Delivery Boys"
        columns={[

{
  title: "Company Logo",
  render: (rowData) => (
    <img
      src={`${serverURL}/images/${rowData.companylogo}`}
      alt="Company Logo"
      style={{
        width: 60,
        height: 60,
        borderRadius: "8px",
        objectFit: "cover",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
      onError={(e) => (e.target.src = "/placeholder.png")} // fallback
    />
  ),
},

             {
            title: "Email ID/Mobile No",
            render: (rowData) => (
              <div>
                <div>{rowData.emailid}</div>
                <div>({rowData.mobile})</div>
              </div>
            ),
          },
          { title: "contactperson", field: "contactperson" },
          { title: "created_time", field: "created_time" },

                
          { title: "created_date", field: "created_date" },
          { title: " status", field: "status" },
          { title: " user", field: "user" },
         
        ]}
        data={CompanyList}
        actions={[
          {
            icon: "edit",
            tooltip: "Edit Student",
            onClick: (event, rowData) => HandleopenDialog(rowData),
          },
          {
            icon: "delete",
            tooltip: "Delete Student",
            onClick: (event, rowData) => HandleDelete(rowData.company_id),
          },
          {
                icon:'add',
                tooltip:'Add New Employee',
                isFreeAction:true,
                // onClick:(event)=> navigate("/AdminDashboard/DeliveryBoyInterface")
              }
        ]}
      />
    );
  };
  return (
    <>
      {DisplayAllrecod()}
      {showDialog()}
    </>
  );
}




