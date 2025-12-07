import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import Swal from "sweetalert2";
import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Divider,
} from "@mui/material";
import {
    Send as SendIcon,
    Business as BusinessIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Share as ShareIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { postData } from "../backendservices/FetchNodeServices";
import ResumeInput from "./ResumeInput";

const EmployeeAssign = ({ user }) => {
    const [empAssign, setEmpAssign] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({})

    const fetchAllEmpAssign = async () => {
        try {
            setLoading(true);
            const res = await postData('employee/fetch_emp_assign', { empid: user.employee_id })
            if (res.status && res?.data) {
                setEmpAssign(res.data);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: res.message || "Failed to fetch assignment data",
                    timer: 1500,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while fetching assignments",
                timer: 1500,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEmpAssign();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const getManagerStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    return (<>
        {open ? <ResumeInput data={data} /> :
            <Box sx={{
                width: '82.35vw',
                mx: "auto",
                p: 1,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)',
                minHeight: '100vh',
            }}>
                {/* Header Section */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Avatar sx={{
                        bgcolor: '#667eea',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                    }}>
                        <WorkIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h4" sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        mb: 1
                    }}>
                        Job Assignments
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        Track and manage your assigned job responsibilities
                    </Typography>
                </Box>

                {/* Main Card */}
                <Paper sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    background: 'white',
                }}>
                    {/* Table Header */}
                    <Box sx={{
                        background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                        p: 2.5,
                        color: 'white',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BusinessIcon sx={{ mr: 1.5, fontSize: 24 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Assignment Records ({empAssign.length})
                                </Typography>
                            </Box>
                            <Chip
                                label="Active"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            />
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 8
                        }}>
                            <CircularProgress sx={{ color: '#667eea', mb: 2 }} />
                            <Typography variant="body1" sx={{ color: '#666' }}>
                                Loading assignment data...
                            </Typography>
                        </Box>
                    ) : (
                        <MaterialTable
                            title=""
                            columns={[
                                {
                                    title: "Assign ID",
                                    field: "job_assign_id",
                                    cellStyle: {
                                        fontWeight: 'bold',
                                        color: '#4776E6',
                                        fontFamily: 'monospace'
                                    },
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                    },
                                },
                                {
                                    title: "Company",
                                    field: "companyname",
                                    render: (rowData) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BusinessIcon sx={{ mr: 1, color: '#666', fontSize: 18 }} />
                                            <Typography variant="body2">
                                                {rowData.companyname}
                                            </Typography>
                                        </Box>
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                {
                                    title: "Job Title",
                                    field: "job_title",
                                    render: (rowData) => (
                                        <Typography sx={{ fontWeight: '500' }}>
                                            {rowData.job_title}
                                        </Typography>
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                {
                                    title: "Assign Date",
                                    field: "assign_date",
                                    render: (rowData) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                                            <Typography variant="body2">
                                                {formatDate(rowData.assign_date)}
                                            </Typography>
                                        </Box>
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                {
                                    title: "Status",
                                    field: "statuses",
                                    render: (rowData) => (
                                        <Chip
                                            label={rowData.statuses || "N/A"}
                                            size="small"
                                            color={getStatusColor(rowData.statuses)}
                                            sx={{ fontWeight: '500' }}
                                        />
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                {
                                    title: "Remove Date",
                                    field: "remove_date",
                                    render: (rowData) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                                            <Typography variant="body2">
                                                {formatDate(rowData.remove_date)}
                                            </Typography>
                                        </Box>
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                {
                                    title: "Manager Status",
                                    field: "manager_status",
                                    render: (rowData) => (
                                        <Chip
                                            label={rowData.manager_status || "N/A"}
                                            size="small"
                                            color={getManagerStatusColor(rowData.manager_status)}
                                            sx={{
                                                fontWeight: '500',
                                                ...(rowData.manager_status?.toLowerCase() === 'approved' && {
                                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                                    color: '#2e7d32',
                                                }),
                                                ...(rowData.manager_status?.toLowerCase() === 'pending' && {
                                                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                                                    color: '#f57c00',
                                                }),
                                            }}
                                        />
                                    ),
                                    headerStyle: {
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: 'bold',
                                    },
                                },
                                // {
                                //     title: "Actions",
                                //     render: () => (
                                //         <Tooltip title="Share Assignment">
                                //             <IconButton sx={{
                                //                 color: '#FF9800',
                                //                 '&:hover': {
                                //                     bgcolor: 'rgba(255, 152, 0, 0.1)',
                                //                 }
                                //             }}>
                                //                 <ShareIcon />
                                //             </IconButton>
                                //         </Tooltip>
                                //     ),
                                //     headerStyle: {
                                //         backgroundColor: '#f8f9fa',
                                //         fontWeight: 'bold',
                                //     },
                                // },
                            ]}
                            data={empAssign}
                            actions={[
                                {
                                    icon: () => (
                                        <IconButton sx={{
                                            color: '#2196F3',
                                            '&:hover': {
                                                bgcolor: 'rgba(33, 150, 243, 0.1)',
                                            }
                                        }}>
                                            <SendIcon />
                                        </IconButton>
                                    ),
                                    tooltip: 'Send Assignment Details',
                                    onClick: (event, rowData) => {
                                        // Swal.fire({
                                        //     title: 'Share Assignment',
                                        //     text: `Share details for "${rowData.job_title}" at ${rowData.companyname}?`,
                                        //     icon: 'info',
                                        //     showCancelButton: true,
                                        //     confirmButtonText: 'Yes, Share',
                                        //     cancelButtonText: 'Cancel'
                                        // }).then((result) => {
                                        //     if (result.isConfirmed) {
                                        //         Swal.fire({
                                        //             icon: 'success',
                                        //             title: 'Shared!',
                                        //             text: 'Assignment details have been shared successfully.',
                                        //             timer: 1500,
                                        //         });
                                        //     }
                                        // });
                                        setData(rowData)
                                        setOpen(true)
                                    },
                                }
                            ]}
                            options={{
                                actionsColumnIndex: -1,
                                pageSize: 10,
                                pageSizeOptions: [5, 10, 20],
                                headerStyle: {
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    borderBottom: '2px solid #e0e0e0',
                                },
                                rowStyle: (rowData, index) => ({
                                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                                    '&:hover': {
                                        backgroundColor: '#f5f8ff',
                                    },
                                }),
                                searchFieldStyle: {
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    border: '1px solid #e0e0e0',
                                },
                                filtering: false,
                                showFirstLastPageButtons: true,
                            }}
                        />
                    )}

                    {/* Footer */}
                    <Divider />
                    <Box sx={{
                        p: 2,
                        bgcolor: '#f8f9fa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Typography variant="body2" color="textSecondary">
                            Employee ID: {user?.employee_id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Total Assignments: {empAssign.length}
                        </Typography>
                    </Box>
                </Paper>

                {/* Info Box */}
                <Box sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: '#f0f7ff',
                    borderRadius: 1,
                    border: '1px solid #d1e3ff',
                }}>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontSize: '0.875rem' }}>
                        📋 This table shows all your assigned job responsibilities. Use the share button to send assignment details to team members or managers.
                    </Typography>
                </Box>
            </Box>
        }</>);
};

export default EmployeeAssign;