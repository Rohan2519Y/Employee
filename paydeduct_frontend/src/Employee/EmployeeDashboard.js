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
    Button,
    Chip,
    Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getData, postData, serverURL } from "../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import logo from "../assets/logo.jpeg";
import axios from "axios";
import {
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Logout as LogoutIcon,
    Assignment as AssignmentIcon,
    AccountBalanceWallet as WalletIcon,
    CalendarMonth as CalendarIcon
} from "@mui/icons-material";

import Profile from "./Profile";
import EmployeeAttendance from "./EmployeeAttendance";
import Payslip from "../components/admin/Payslip";
import EmployeeAssign from "./EmployeeAssign";
import PayslipDisplay from "../components/admin/PayslipDisplay";
import LeaveRequest from "./LeaveApply";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [screen, setScreen] = useState(1)
    const [payOpen, setPayOpen] = useState(false)
    const [payId, setPayId] = useState('')
    const [employee_id, setEmployeeId] = useState('')
    const admin = JSON.parse(localStorage.getItem("admin"))

    const menuItems = [
        { id: 1, label: 'My Profile', icon: <PersonIcon /> },
        { id: 2, label: 'My Attendance', icon: <ScheduleIcon /> },
        { id: 3, label: 'Leave Apply', icon: <CalendarIcon /> },
        { id: 4, label: 'Payslip', icon: <WalletIcon /> },
        { id: 5, label: 'Job Assign', icon: <AssignmentIcon /> }
    ];

    const fetchEmpId = async () => {
        const res = await postData('employee/fetch_empid', {
            emailid: admin?.loginInput,
            password: admin?.password
        });

        if (res?.data && res.data.length > 0) {
            setEmployeeId(res.data[0].employee_id);
        } else {
            console.log("NO EMPLOYEE FOUND", res);
            Swal.fire({
                icon: "error",
                title: "Employee not found",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
            });
        }
    };

    const fetchUserData = async () => {
        try {
            const result = await postData(`employee/fetch_emp_by_id`, { empid: employee_id });
            if (result.status) {
                setUser(result.data[0]);
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
        if (!admin) {
            navigate('/employeelogin');
        }
        fetchEmpId();
    }, []);

    useEffect(() => {
        if (employee_id) {
            fetchUserData();
        }
    }, [employee_id]);

    const handleLogout = () => {
        localStorage.removeItem("admin");
        Swal.fire({
            icon: "success",
            title: "Logged out successfully",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
        });
        navigate("/employeelogin");
    };

    if (loading) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                <CircularProgress sx={{ color: "white" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Header */}
            <AppBar
                position="static"
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    py: 0.5
                }}
            >
                <Toolbar>
                    <Typography variant="h6" sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        color: "white",
                        letterSpacing: "0.5px"
                    }}>
                        Welcome, {user?.name || "User"}
                    </Typography>

                    <Chip
                        label={user?.designation || "Employee"}
                        size="small"
                        sx={{
                            mr: 2,
                            background: "rgba(255,255,255,0.2)",
                            color: "white",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.3)"
                        }}
                    />

                    <Avatar
                        sx={{
                            width: 45,
                            height: 45,
                            border: "3px solid rgba(255,255,255,0.3)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                        }}
                        alt={user.name}
                        src={
                            user.profileicon
                                ? `https://campusshala.com:3022/images/${user.profileicon}`
                                : logo
                        }
                    />
                </Toolbar>
            </AppBar>

            {/* Main Layout */}
            <Grid container sx={{ flex: 1 }}>
                {/* Sidebar */}
                <Grid item xs={12} sm={3} md={2}>
                    <Paper
                        sx={{
                            minHeight: "calc(100vh - 64px)",
                            background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
                            borderRight: "1px solid #e0e0e0",
                            borderRadius: 0,
                            boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
                            py: 2
                        }}
                    >
                        {/* Menu Items */}
                        <List sx={{ px: 1 }}>
                            {menuItems.map((item) => (
                                <ListItemButton
                                    key={item.id}
                                    onClick={() => setScreen(item.id)}
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 2,
                                        background: screen === item.id
                                            ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                                            : "transparent",
                                        color: screen === item.id ? "white" : "#555",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: screen === item.id
                                                ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                                                : "rgba(102, 126, 234, 0.1)",
                                            transform: "translateX(4px)"
                                        }
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 40 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                background: screen === item.id
                                                    ? "rgba(255,255,255,0.2)"
                                                    : "rgba(102, 126, 234, 0.1)",
                                                color: screen === item.id ? "white" : "#667eea"
                                            }}
                                        >
                                            {item.icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.label}
                                        sx={{
                                            "& .MuiTypography-root": {
                                                fontWeight: screen === item.id ? 600 : 500,
                                                fontSize: "0.95rem"
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>

                        <Divider sx={{ my: 2, mx: 2 }} />

                        {/* Logout Button */}
                        <List sx={{ px: 1 }}>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: 2,
                                    background: "rgba(244, 67, 54, 0.1)",
                                    color: "#f44336",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(244, 67, 54, 0.2)",
                                        transform: "translateX(4px)"
                                    }
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            background: "rgba(244, 67, 54, 0.2)",
                                            color: "#f44336"
                                        }}
                                    >
                                        <LogoutIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary="Logout"
                                    sx={{
                                        "& .MuiTypography-root": {
                                            fontWeight: 600,
                                            fontSize: "0.95rem"
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} sm={9} md={10}>
                    <Box sx={{
                        p: 3,
                        height: "100%",
                        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                        minHeight: "calc(100vh - 64px)"
                    }}>
                        {screen === 1 && <Profile user={user} />}
                        {screen === 2 && <EmployeeAttendance user={user} />}
                        {screen === 3 && <LeaveRequest user={user} />}
                        {screen === 4 && (
                            payOpen ? (
                                <Card sx={{
                                    borderRadius: 3,
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                    width: "83.4vw",
                                    mx: "auto"
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Button
                                            onClick={() => setPayOpen(false)}
                                            startIcon={<LogoutIcon sx={{ transform: "rotate(180deg)" }} />}
                                            sx={{
                                                mb: 3,
                                                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                                                color: "white",
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                "&:hover": {
                                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                                                }
                                            }}
                                        >
                                            Back to Payslips
                                        </Button>
                                        <Payslip user={user} payId={payId} />
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card sx={{
                                    borderRadius: 3,
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                    width: "83.4vw",
                                    mx: "auto"
                                }}>
                                    <CardContent>
                                        <PayslipDisplay user={user} setPayOpen={setPayOpen} setPayId={setPayId} />
                                    </CardContent>
                                </Card>
                            )
                        )}
                        {screen === 5 && <EmployeeAssign user={user} />}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}