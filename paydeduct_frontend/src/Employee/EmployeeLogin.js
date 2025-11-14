import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { AccountCircle, Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { postData } from "../backendservices/FetchNodeServices";

const LoginForm = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [loginInput, setLoginInput] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await postData("employee/chk_admin_login", { emailid: loginInput, password });

    if (result.status) {
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
      });
      localStorage.setItem('admin', JSON.stringify(loginInput))
      localStorage.setItem('empid', JSON.stringify(result.data[0].employee_id))
      navigate("/employeedashboard");
    } else {
      Swal.fire({
        icon: "error",
        title: result.message || "Invalid Email/Mobile or Password",
        showConfirmButton: false,
        timer: 2500,
        toast: true,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5", // light background
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 380,
          borderRadius: 3,
          backgroundColor: "white",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold" }}
        >
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff color="action" />
                    ) : (
                      <Visibility color="action" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#115293" },
            }}
          >
            Submit
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;
