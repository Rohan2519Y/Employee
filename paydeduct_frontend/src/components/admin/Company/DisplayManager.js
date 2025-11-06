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
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { serverURL } from "../../../backendservices/FetchNodeServices";
import { useEffect, useState } from "react";
import { getDate, getTime } from "../../../backendservices/FetchNodeServices";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { useNavigate } from "react-router-dom";

export default function DisplayManager() {
    const [open, setOpen] = useState(false);
    const [managerList, setmanagerList] = useState([]);
    const [managerid,setmanagerid]=useState("")

      const [companyList, setCompanyList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [jobId, setJobId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [othContactNo, setOthContactNo] = useState("");
  

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
      manager_id:managerid

     
    };

    const response = await postData("manager/edit_manager", body);
    if (response.status) {
      Swal.fire({
        title: response.message,
        icon: "success",
        timer: 1500,
      });
      fetctAllmanager()
      setOpen(false)
    } else {
      Swal.fire({
        title: response.message,
        icon: "error",
        timer: 1500,
      });
    }
  };
const showManager=()=>{
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


   

    const fetctAllmanager = async () => {
        var res = await getData("manager/fetch_mangers");
        setmanagerList(res.data);
        console.log("data", res.data);
    };

    useEffect(function () {
        fetctAllmanager();
    }, []);

    const HandleDelete = async (managerid) => {
        Swal.fire({
            title: "Do you want to Delete the selected?",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await postData("manager/delete_manager", { manager_id:managerid });
                Swal.fire(response.message);
                fetctAllmanager();
            }
        });
    };


    const HandleopenDialog = (rowData, status) => {
        console.log(rowData);
        setManagerName(rowData.managername)
        setMobileNo(rowData.mobileno);
        setEmailId(rowData.emailid);
        setOthContactNo(rowData.oth_contact_no)
        setJobId(rowData.job_id)
        setmanagerid(rowData.manager_id)
        setCompanyId(rowData.company_id)
        setOpen(true);
    };

    const HandelcloseDialog = () => {

        
        setOpen(false);
        
    };

    const showDialog = () => {
        return (
            <Dialog open={open} onClose={HandelcloseDialog}>
                <DialogTitle style={{ display: "flex", justifyContent: "flex-end" }}>
                    <CloseIcon onClick={HandelcloseDialog} style={{ cursor: "pointer" }} />
                </DialogTitle>
                <DialogContent>{showManager()}</DialogContent>
            </Dialog>
        );
    };
//manager_id, company_id, job_id, managername, emailid, mobileno, oth_contact_no
    const DisplayAllrecod = () => {
        return (
            <MaterialTable
                title="List of Manager"
                columns={[
                    { title: "company_id", field: "companyname" },
                    { title: "job_des", field: "job_title" },
                    { title: "managername", field: "managername" },
                    { title: "emailid", field: "emailid" },
                    { title: "mobileno", field: "mobileno" },
                    { title: "oth_contact_no", field: "oth_contact_no" },

                    
                ]}
                data={managerList}
                actions={[
                    {
                        icon: "edit",
                        tooltip: "Edit Job",
                        onClick: (event, rowData) => HandleopenDialog(rowData),
                    },
                    {
                        icon: "delete",
                        tooltip: "Delete Job",
                        onClick: (event, rowData) => HandleDelete(rowData.manager_id),
                    },

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
