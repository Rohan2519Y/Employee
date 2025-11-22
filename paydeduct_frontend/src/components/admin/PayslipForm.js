import React, { useEffect, useState } from "react";
import { TextField, Button, MenuItem, Box, Typography, Grid } from "@mui/material";
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
    const [incentive, setIncentive] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate()

    const fetchAllEmployee = async () => {
        const res = await getData("payslip/employee_data");
        setEmployeeData(res.data);
    };

    const fetchAllPaySlip = async () => {
        const res = await postData("payslip/employee_data_by_id", { employeeId });
        setPaySlipData(res?.data || []);
        // console.log(res.data);
    };

    useEffect(() => {
        fetchAllEmployee();
    }, []);

    const getPreviousMonthFirstDate = () => {
        const today = new Date();
        let prevMonth = today.getMonth() - 1;
        let year = today.getFullYear();
        if (prevMonth < 0) {
            prevMonth = 11;
            year -= 1;
        }
        const newDate = new Date(year, prevMonth, 1);
        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, "0");
        const dd = String(newDate.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const calculateAllowances = (salary) => {
        if (salary && !isNaN(salary)) {
            const salaryValue = parseFloat(salary);
            setDa((salaryValue * 0.1).toFixed(2));
            setHra((salaryValue * 0.1).toFixed(2));
        } else {
            setDa("");
            setHra("");
        }
    };

    const handleBasicSalaryChange = (e) => {
        const value = e.target.value;
        setBasicSalary(value);
        calculateAllowances(value);
    };

    useEffect(() => {
        if (employeeId) {
            const employee = employeeData.find(item => item.employee_id == employeeId);
            if (employee) {
                setBasicSalary(employee.salary);
                calculateAllowances(employee.salary);
            }
            fetchAllPaySlip();
        }
    }, [employeeId, employeeData]);

    // ✅ NEW useEffect to update date after paySlipData is fetched
    useEffect(() => {
        if (!employeeId) return;

        if (paySlipData.length > 0 && paySlipData[0].date_of_payslip) {
            const fetchedDate = new Date(paySlipData[0].date_of_payslip);
            const prevMonth = new Date();
            prevMonth.setMonth(prevMonth.getMonth() - 1);

            const updatedDate = new Date(
                prevMonth.getFullYear(),
                prevMonth.getMonth(),
                fetchedDate.getDate()
            );

            const yyyy = updatedDate.getFullYear();
            const mm = String(updatedDate.getMonth() + 1).padStart(2, "0");
            const dd = String(updatedDate.getDate()).padStart(2, "0");
            setDateOfPayslip(`${yyyy}-${mm}-${dd}`);
        } else {
            setDateOfPayslip(getPreviousMonthFirstDate());
        }
    }, [paySlipData, employeeId]);
    // ✅ END of new addition

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
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
            incentive
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
                maxWidth: 600,
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
                    <FormatListBulletedIcon style={{ fontSize: 40, cursor: 'pointer' }} onClick={() => navigate('/payslipdisplay')} />
                </div>
            </div>
            <Grid container spacing={2}>
                {/* Employee ID Dropdown */}
                <Grid size={6}>
                    <TextField
                        select
                        label="Employee ID"
                        fullWidth

                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        error={!!errors.employeeId}
                        helperText={errors.employeeId}
                    >
                        {employeeData.map((emp) => (
                            <MenuItem key={emp.employee_id} value={emp.employee_id}>
                                {emp.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Date of Payslip */}
                <Grid size={6}>
                    <TextField
                        label="Date of Payslip"
                        type="date"
                        fullWidth

                        value={dateOfPayslip}
                        onChange={(e) => setDateOfPayslip(e.target.value)}
                        error={!!errors.dateOfPayslip}
                        helperText={errors.dateOfPayslip}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {/* Salary Fields */}
                <Grid size={6}>
                    <TextField
                        label="Basic Salary"
                        type="number"
                        fullWidth

                        value={basicSalary}
                        onChange={handleBasicSalaryChange}
                        error={!!errors.basicSalary}
                        helperText={errors.basicSalary}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        label="DA (10%)"
                        type="number"
                        fullWidth

                        value={da}
                        onChange={(e) => setDa(e.target.value)}
                        error={!!errors.da}
                        helperText={errors.da}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        label="HRA (10%)"
                        type="number"
                        fullWidth

                        value={hra}
                        onChange={(e) => setHra(e.target.value)}
                        error={!!errors.hra}
                        helperText={errors.hra}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        label="Incentive"
                        type="number"
                        fullWidth
                        value={incentive}
                        onChange={(e) => setIncentive(e.target.value)}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        label="CCA"
                        type="text"
                        fullWidth

                        value={cca}
                        onChange={(e) => setCca(e.target.value)}
                        error={!!errors.cca}
                        helperText={errors.cca}
                    />
                </Grid>
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
        </Box>
    );
};

export default PayslipForm;
