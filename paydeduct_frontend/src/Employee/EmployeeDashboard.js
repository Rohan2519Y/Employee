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
import { getData, postData, serverURL } from "../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import logo from "../assets/logo.jpeg";
import axios from "axios";

import Profile from "./Profile";
import EmployeeAttendance from "./EmployeeAttendance";
import Payslip from "../components/admin/Payslip";
import EmployeeAssign from "./EmployeeAssign";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [screen, setScreen] = useState(1)
    const [employee_id, setEmployeeId] = useState('')
    const admin = JSON.parse(localStorage.getItem("admin"))

    // const fetchEmpAttendance = async () => {
    //     const res = await axios.get(`https://campusshala.com:3022/employeeLoginDetail/${payslipData[0].employee_id}`);
    //     setEmpAttendence(res.data.data);
    // };

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

    // 1) First fetch employee_id
    useEffect(() => {
        if (!admin) {
            navigate('/employeelogin');
        }
        fetchEmpId();
    }, []);

    // 2) Then fetch user details ONLY when employee_id is available
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
                        Welcome, {user?.name || "User"}
                    </Typography>
                    <Avatar
                        sx={{ width: 45, height: 45 }}
                        alt={user.name}
                        src={
                            user.profileicon
                                ? `https://campusshala.com:3022/images/${user.profileicon}`
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
                    size={2}
                    sx={{
                        background: "#f3f3f3",
                        minHeight: "91vh",
                        borderRight: "1px solid #ddd",
                    }}
                >
                    <List>
                        <ListItemButton onClick={() => setScreen(1)} sx={{ background: screen == 1 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='My Profile' />
                        </ListItemButton>
                    </List>
                    <List>
                        <ListItemButton onClick={() => setScreen(2)} sx={{ background: screen == 2 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='My Attendance' />
                        </ListItemButton>
                    </List>
                    <List>
                        <ListItemButton onClick={() => setScreen(3)} sx={{ background: screen == 3 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='Leave Requests' />
                        </ListItemButton>
                    </List>
                    <List>
                        <ListItemButton onClick={() => setScreen(4)} sx={{ background: screen == 4 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='Payslip' />
                        </ListItemButton>
                    </List>
                    <List>
                        <ListItemButton onClick={() => setScreen(5)} sx={{ background: screen == 5 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='Job Assign' />
                        </ListItemButton>
                    </List>
                    <List>
                        <ListItemButton onClick={handleLogout} sx={{ background: screen == 6 ? '#a0a0a0ff' : '#f3f3f3' }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={logo}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28 }}
                                />
                            </ListItemAvatar>
                            <ListItemText primary='Logout' />
                        </ListItemButton>
                    </List>
                </Grid>

                {/* ===== Main Content ===== */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    {screen == 1 ? <Profile user={user} /> :
                        screen == 2 ? <EmployeeAttendance user={user} /> :
                            screen == 4 ? <Payslip user={user} /> :
                                screen == 5 ? <EmployeeAssign user={user} /> : ''
                    }
                </div>
            </Grid>
        </div>
    );
}