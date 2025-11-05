import React, { useEffect, useState } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { getData, postData } from "../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const PayslipForm = () => {
    const [employeeData, setEmployeeData] = useState([]);
    const [paySlipData, setPaySlipData] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [dateOfPayslip, setDateOfPayslip] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [da, setDa] = useState("");
    const [hra, setHra] = useState("");
    const [cca, setCca] = useState("Not-Applicable");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate()

    const fetchAllEmployee = async () => {
        const res = await getData("payslip/employee_data");
        setEmployeeData(res.data);
    };

    const fetchAllPaySlip = async () => {
        const res = await postData("payslip/employee_data_by_id", { employeeId });
        setPaySlipData(res?.data || []);
    };


    useEffect(() => {
        fetchAllEmployee();
    }, []);

    useEffect(() => {
        fetchAllPaySlip();
    }, [employeeId]);

    // Auto calculate DA and HRA (10% each) when Basic Salary changes
    const handleBasicSalaryChange = (e) => {
        const value = e.target.value;
        setBasicSalary(value);

        if (value && !isNaN(value)) {
            const salary = parseFloat(value);
            setDa((salary * 0.1).toFixed(2));
            setHra((salary * 0.1).toFixed(2));
        } else {
            setDa("");
            setHra("");
        }
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // update every second

        return () => clearInterval(timer); // cleanup on unmount
    }, []);

    const formattedDate = currentTime.toLocaleDateString();
    const formattedTime = currentTime.toLocaleTimeString();

    const validateForm = () => {
        let tempErrors = {};
        tempErrors.employeeId = employeeId ? "" : "Please select an Employee ID";
        tempErrors.dateOfPayslip = dateOfPayslip ? "" : "Please select a date";
        tempErrors.basicSalary = basicSalary ? "" : "Enter basic salary";
        tempErrors.da = da ? "" : "Enter DA";
        tempErrors.hra = hra ? "" : "Enter HRA";
        tempErrors.cca = cca ? "" : "Enter CCA";

        setErrors(tempErrors);
        return Object.values(tempErrors).every((x) => x === "");
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const body = {
            employee_id: employeeId,
            date_of_payslip: dateOfPayslip,
            basic_salary: basicSalary,
            da,
            hra,
            cca,
        };

        const response = await postData("payslip/insert_payslip", body);
        if (response.status) {
            Swal.fire({
                title: response.message,
                icon: "success",
                timer: 1500
            });
            navigate(`/deductionform/${employeeId}/${response.data}`)
        }
        else {
            Swal.fire({
                title: response.message,
                icon: "error",
                timer: 1500
            });
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 400,
                mx: "auto",
                mt: 5,
                p: 3,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 2,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <Typography variant="h6" gutterBottom>
                        Payslip Entry Form
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        {formattedDate} {formattedTime}
                    </Typography>
                </div>
                <div style={{ marginTop: 15 }}>
                    <FormatListBulletedIcon style={{ fontSize: 40, cursor: 'pointer' }} onClick={()=>navigate('/payslipdisplay')} />
                </div>
            </div>
            {/* Employee ID Dropdown */}
            <TextField
                select
                label="Employee ID"
                fullWidth
                margin="normal"
                value={employeeId}
                onChange={(e) => {
                    const selectedId = e.target.value;
                    setEmployeeId(selectedId);
                    const selectedEmp = employeeData.find(
                        (item) => item.employee_id === selectedId
                    );
                    if (selectedEmp) setDateOfPayslip(selectedEmp.date_of_payslip);
                }}
                error={!!errors.employeeId}
                helperText={errors.employeeId}
            >
                {employeeData.map((emp) => (
                    <MenuItem key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                    </MenuItem>
                ))}
            </TextField>

            {/* Date of Payslip Dropdown */}
            <TextField
                select
                label="Date of Payslip"
                fullWidth
                margin="normal"
                value={dateOfPayslip}
                onChange={(e) => setDateOfPayslip(e.target.value)}
                error={!!errors.dateOfPayslip}
                helperText={errors.dateOfPayslip}
            >
                {paySlipData.map((pay) => (
                    <MenuItem key={pay.date_of_payslip} value={pay.date_of_payslip}>
                        {pay.date_of_payslip}
                    </MenuItem>
                ))}
            </TextField>

            {/* Salary Fields */}
            <TextField
                label="Basic Salary"
                type="number"
                fullWidth
                margin="normal"
                value={basicSalary}
                onChange={handleBasicSalaryChange}
                error={!!errors.basicSalary}
                helperText={errors.basicSalary}
            />

            <TextField
                label="DA (10%)"
                type="number"
                fullWidth
                margin="normal"
                value={da}
                onChange={(e) => setDa(e.target.value)}
                error={!!errors.da}
                helperText={errors.da}
            />

            <TextField
                label="HRA (10%)"
                type="number"
                fullWidth
                margin="normal"
                value={hra}
                onChange={(e) => setHra(e.target.value)}
                error={!!errors.hra}
                helperText={errors.hra}
            />

            <TextField
                label="CCA"
                type="text"
                fullWidth
                margin="normal"
                value={cca}
                onChange={(e) => setCca(e.target.value)}
                error={!!errors.cca}
                helperText={errors.cca}
            />

            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </Box>
    );
};

export default PayslipForm;
