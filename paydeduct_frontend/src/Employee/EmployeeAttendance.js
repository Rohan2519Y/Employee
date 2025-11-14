import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
} from "@mui/material";
import axios from "axios";

const EmployeeAttendance = ({ user }) => {
    const [empAttendance, setEmpAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllEmpAttendance = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://campusshala.com:3022/employeeLoginDetail/${user.employee_id}`
            );

            if (res.status && res.data?.data) {
                setEmpAttendance(res.data.data);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: res.message || "Failed to fetch attendance data",
                    timer: 1500,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while fetching attendance",
                timer: 1500,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEmpAttendance();
    }, []);

    return (
        <Box
            sx={{
                maxWidth: 1100,
                mx: "auto",
                mt: 5,
                p: 3,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 2,
            }}
        >
            <Typography variant="h6" gutterBottom>
                Employee Attendance Records
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <MaterialTable
                    title="All Attendance"
                    columns={[
                        { title: "ID", field: "eld_id", filtering: false },
                        {
                            title: "Check-in Date",
                            field: "checkin_date",
                            render: rowData =>
                                rowData.checkin_date
                                    ? new Date(rowData.checkin_date).toLocaleString()
                                    : "-"
                        },
                        {
                            title: "Check-out Date",
                            field: "checkout_date",
                            render: rowData =>
                                rowData.checkout_date
                                    ? new Date(rowData.checkout_date).toLocaleString()
                                    : "-"
                        },
                        { title: "Check-in Location", field: "checkin_location" },
                        { title: "Check-out Location", field: "checkout_location" },
                        { title: "Status", field: "current_status" },
                        { title: "Clock-in Approve", field: "clockinapprove" },
                        { title: "Clock-out Approve", field: "clockoutapprove" },
                    ]}
                    data={empAttendance}
                    options={{
                        headerStyle: {
                            backgroundColor: "#f5f5f5",
                            fontWeight: "bold",
                        },
                        rowStyle: {
                            fontSize: 14,
                        },
                        search: true,
                        paging: true,
                        sorting: true,
                    }}
                />
            )}
        </Box>
    );
};

export default EmployeeAttendance;
