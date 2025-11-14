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
import { postData } from "../backendservices/FetchNodeServices";

const EmployeeAssign = ({ user }) => {
    const [empAssign, setEmpAssign] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllEmpAssign = async () => {
        try {
            setLoading(true);
            const res = await postData('employee/fetch_emp_assign', { empid: user.employee_id })
            if (res.status && res?.data) {
                setEmpAssign(res.data);
                console.log(res.data)
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
        fetchAllEmpAssign();
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
                    title="Job Assign Details"
                    columns={[
                        { title: "Assign ID", field: "job_assign_id", filtering: false },
                        { title: "Company Name", field: "companyname" },
                        { title: "Job Title", field: "job_title" },
                        {
                            title: "Assign Date",
                            field: "assign_date",
                            render: rowData =>
                                rowData.assign_date
                                    ? new Date(rowData.assign_date).toLocaleDateString()
                                    : "-"
                        },
                        { title: "Status", field: "statuses" },
                        {
                            title: "Remove Date",
                            field: "remove_date",
                            render: rowData =>
                                rowData.remove_date
                                    ? new Date(rowData.remove_date).toLocaleDateString()
                                    : "-"
                        },
                        { title: "Manager Status", field: "manager_status" }
                    ]}
                    data={empAssign}
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

export default EmployeeAssign;