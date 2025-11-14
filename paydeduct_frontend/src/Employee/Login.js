import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import {
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { postData } from "../../admin/services/FetchNodeServices";

const defaultTheme = createTheme();

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [loginInput, setLoginInput] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginInput || !password) {
      Swal.fire({
        icon: "error",
        title: "Please enter all fields",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
      });
      return;
    }

    setLoading(true);

    const body = {
      phone: loginInput,
      password: password,
    };

    const result = await postData("employee/login", body);
    setLoading(false);

    if (result.status) {
      localStorage.setItem("Token", result.token);
      localStorage.setItem("employee_id", result.data.employee_id);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
      });

      navigate("/dashboard");
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
    <ThemeProvider theme={defaultTheme}>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Log in
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email or Mobile Number"
              autoFocus
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
            />

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 8, mb: 4 }}
        >
          {"Copyright © "}
          <Link color="inherit" href="https://user.com/">
            NIS Pvt. Ltd. Mumbai
          </Link>{" "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
      </Container>
    </ThemeProvider>
  );
}