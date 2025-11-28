import React, { useEffect, useState } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { getData, postData } from "../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const DeductionForm = () => {
  const [payslipData, setPayslipData] = useState([]);
  const [payslipDate, setPayslipDate] = useState([]);
  const [payslipId, setPayslipId] = useState("");
  const [dateOfPayslip, setDateOfPayslip] = useState("");
  const [deductionType, setDeductionType] = useState("");
  const [remark, setRemark] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const params = useParams();

  const fetchPayslipData = async () => {
    const res = await postData("deduction/payslip_data", { empid: params.empid });
    setPayslipData(res.data);
    console.log(res.data)
  };

  const fetchPayslipDate = async () => {
    const res = await postData("deduction/payslip_data_by_id", { payslipId });
    setPayslipDate(res.data);
  };

  useEffect(() => {
    fetchPayslipData();
  }, []);

  useEffect(() => {
    fetchPayslipDate();
  }, [payslipId]);

  const getPreviousMonthFirstDate = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    now.setDate(1);

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (payslipData.length === 0) return;

    if (payslipData.length > 0 && payslipData[0].date_of_payslip) {
      const fetchedDate = new Date(payslipData[0].date_of_payslip);
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
  }, [payslipData]);


  const validateForm = () => {
    let tempErrors = {};
    tempErrors.dateOfPayslip = dateOfPayslip ? "" : "Please select a date";
    tempErrors.deductionType = deductionType ? "" : "Please select deduction type";
    tempErrors.deductionAmount = deductionAmount ? "" : "Enter deduction amount";
    if (deductionType === "others") tempErrors.remark = remark ? "" : "Please enter remark";

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const body = {
      payslip_id: params.payid,
      date_of_payslip: dateOfPayslip,
      deduction_type: deductionType,
      remark: deductionType === "others" ? remark : null,
      deduction_amount: deductionAmount,
    };

    const response = await postData("deduction/insert_deduction", body);
    if (response.status) {
      Swal.fire({
        title: response.message,
        icon: "success",
        timer: 1500,
      });
      navigate(`/payslip/${params.payid}`);
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
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        p: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Deduction Entry Form
      </Typography>

      {/* Date Dropdown (Replaces Payslip ID) */}
      <TextField
        label="Date of Payslip"
        type="date"
        fullWidth
        margin="normal"
        value={dateOfPayslip}
        onChange={(e) => setDateOfPayslip(e.target.value)}
        error={!!errors.dateOfPayslip}
        helperText={errors.dateOfPayslip}
        InputLabelProps={{ shrink: true }}
      />

      {/* Deduction Type Dropdown */}
      <TextField
        select
        label="Deduction Type"
        fullWidth
        margin="normal"
        value={deductionType}
        onChange={(e) => {
          setDeductionType(e.target.value);
          if (e.target.value !== "Others") setRemark("");
        }}
        error={!!errors.deductionType}
        helperText={errors.deductionType}
      >
        <MenuItem value="EMI">EMI</MenuItem>
        <MenuItem value="IMS">IMS</MenuItem>
        <MenuItem value="Advance">Advance</MenuItem>
        <MenuItem value="Tax">Tax</MenuItem>
        <MenuItem value="TDS">TDS</MenuItem>
        <MenuItem value="Others">Others</MenuItem>
      </TextField>

      {/* Remark Field (only if "Others" selected) */}
      {deductionType === "Others" && (
        <TextField
          label="Remark"
          fullWidth
          margin="normal"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          error={!!errors.remark}
          helperText={errors.remark}
        />
      )}

      {/* Deduction Amount */}
      <TextField
        label="Deduction Amount"
        type="number"
        fullWidth
        margin="normal"
        value={deductionAmount}
        onChange={(e) => setDeductionAmount(e.target.value)}
        error={!!errors.deductionAmount}
        helperText={errors.deductionAmount}
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
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => { navigate(`/payslip/${params.payid}`) }}
      >
        Skip
      </Button>
    </Box>
  );
};

export default DeductionForm;
