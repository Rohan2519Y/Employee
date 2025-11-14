import React, { useEffect, useState } from "react";
import {
  Grid,
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Box,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getData, serverURL } from "../../admin/services/FetchNodeServices";
import Swal from "sweetalert2";
import logo from "../../assets/logoo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const employee_id = localStorage.getItem("employee_id");
      const token = localStorage.getItem("Token");

      if (!token || !employee_id) {
        console.warn("No token or employee_id found");
        navigate("/login");
        return;
      }

      const result = await getData(`employee/${employee_id}`);
      console.log("API Response:", result);

      if (result.status) {
        setUser(result.data);
      } else {
        Swal.fire({
          icon: "error",
          title: "Session expired, please login again",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
        });
        navigate("/login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      Swal.fire({
        icon: "error",
        title: "Unable to fetch data",
        text: "Please try again later",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("employee_id");
    Swal.fire({
      icon: "success",
      title: "Logged out successfully",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AppBar position="static" sx={{ background: "#6a1b9a" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Welcome, {user.name || "User"}
          </Typography>
          <Avatar
            sx={{ width: 45, height: 45 }}
            alt={user.name}
            src={
              user.profileicon
                ? `${serverURL}/images/${user.profileicon}`
                : logo
            }
          />
        </Toolbar>
      </AppBar>

      {/* ===== Layout Grid ===== */}
      <Grid container>
        {/* ===== Sidebar ===== */}
        <Grid
          item
          xs={12}
          sm={3}
          md={2}
          sx={{
            background: "#f3f3f3",
            minHeight: "100vh",
            borderRight: "1px solid #ddd",
          }}
        >
          <List>
            {[
              "My Profile",
              "My Attendance",
              "Leave Requests",
              "Payslip",
              "Logout",
            ].map((item, index) => (
              <ListItemButton
                key={index}
                onClick={
                  item === "Logout"
                    ? handleLogout
                    : () =>
                        navigate(
                          `/dashboard/${item.toLowerCase().replace(/\s+/g, "")}`
                        )
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={logo}
                    variant="rounded"
                    sx={{ width: 28, height: 28 }}
                  />
                </ListItemAvatar>
                <ListItemText primary={item} />
              </ListItemButton>
            ))}
          </List>
        </Grid>

        {/* ===== Main Content ===== */}
        <Grid item xs={12} sm={9} md={10} sx={{ p: 3 }}>
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              p: 4,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
              Employee Profile
            </Typography>

            <Grid container spacing={3}>
              {/* Profile Picture */}
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <Avatar
                    src={
                      user.profileicon
                        ? `${serverURL}/images/${user.profileicon}`
                        : logo
                    }
                    alt={user.name}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "3px solid #6a1b9a",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.designation || "Employee"}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={8}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Personal Information
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body1">
                      <strong>Email:</strong> {user.emailid || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Mobile:</strong> {user.mobileno || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Department:</strong>{" "}
                      {user.department || "Non-Tech"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Joining Date:</strong>{" "}
                      {user.anniversary
                        ? new Date(user.anniversary).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Address:</strong> {user.address || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}
