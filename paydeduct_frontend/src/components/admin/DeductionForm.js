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
  console.log(params)

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
        select
        label="Date of Payslip"
        fullWidth
        margin="normal"
        value={dateOfPayslip}
        onChange={(e) => {
          const selectedDate = e.target.value;
          setDateOfPayslip(selectedDate);
          const selectedPayslip = payslipData.find(
            (item) => item.date_of_payslip === selectedDate
          );
          if (selectedPayslip) setPayslipId(selectedPayslip.payslip_id);
        }}
        error={!!errors.dateOfPayslip}
        helperText={errors.dateOfPayslip}
      >
        {payslipData.map((item) => (
          <MenuItem key={item.date_of_payslip} value={item.date_of_payslip}>
            {item.date_of_payslip}
          </MenuItem>
        ))}
      </TextField>

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
    </Box>
  );
};

export default DeductionForm;
