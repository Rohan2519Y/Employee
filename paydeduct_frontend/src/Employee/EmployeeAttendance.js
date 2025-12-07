import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import Swal from "sweetalert2";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    TextField,
    Stack,
    Paper,
    Card,
    Grid,
    Chip,
    Divider,
    Avatar,
    LinearProgress,
    Fade,
    Zoom,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    Schedule,
    Today,
    DateRange,
    Search,
    FilterList,
    Download,
    Refresh,
    AccessTime,
    LocationOn,
    CheckCircle,
    Cancel,
    Warning,
    ArrowUpward,
    ArrowDownward,
    CalendarToday,
    Person
} from "@mui/icons-material";
import { postData } from "../backendservices/FetchNodeServices";
import axios from "axios";

const EmployeeAttendance = ({ user }) => {
    const [empAttendance, setEmpAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState("thisMonth");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const officeStart = "10:00";
    const officeEnd = "18:00";

    const fetchAttendance = async (type, start = "", end = "") => {
        try {
            setLoading(true);
            const body = {
                empid: user?.employee_id,
                filterType: type,
                startDate: start,
                endDate: end,
            };
            const res = await postData(`employee/fetch_empattendence_by_id`, body);
            if (res?.status) {
                setEmpAttendance(res?.data);
            }
            // const res = await axios?.get(`https://campusshala.com:3022/employeeLoginDetail/${user.employee_id}`);
            // if (res?.data?.status) {
            //     setEmpAttendance(res?.data?.data);
            // }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: res?.data?.message || "Failed to fetch attendance",
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#5f27cd'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong",
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#5f27cd'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance("thisMonth");
    }, []);

    const highlight = (dateString, compareTime, condition) => {
        if (!dateString) return "-";
        try {
            const dt = new Date(dateString);
            const date = dt?.toLocaleDateString();
            const time = dt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2">
                        {date} {time}
                    </Typography>
                </Box>
            );
        } catch (error) {
            return "Invalid Date";
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            Approved: { color: "success", icon: <CheckCircle /> },
            Logout: { color: "info", icon: <ArrowDownward /> },
            Pending: { color: "warning", icon: <Warning /> },
            default: { color: "default", icon: <Schedule /> }
        };
        const config = statusConfig[status] || statusConfig.default;
        return (
            <Chip
                icon={config.icon}
                label={status}
                color={config.color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
            />
        );
    };

    const getApprovalChip = (value) => {
        return value === "1" ? (
            <Chip label="Approved" color="success" size="small" variant="filled" />
        ) : (
            <Chip label="Pending" color="warning" size="small" variant="outlined" />
        );
    };

    const calculateStats = () => {
        const total = empAttendance?.length;
        const onTime = empAttendance?.filter(row => {
            if (!row?.checkin_date) return false;
            const dt = new Date(row?.checkin_date);
            const time = dt?.toTimeString()?.slice(0, 5);
            return time < "10:16";
        })?.length;
        const late = total - onTime;
        return { total, onTime, late };
    };

    const stats = calculateStats();
    // Add this function after your other helper functions
    const calculateWorkingHours = (checkinDate, checkoutDate) => {
        if (!checkinDate || !checkoutDate) return "N/A";

        try {
            const checkin = new Date(checkinDate);
            const checkout = new Date(checkoutDate);

            // If checkout is before checkin (data error), return 0
            if (checkout < checkin) return "0h 0m";

            // Calculate difference in milliseconds
            const diffMs = checkout - checkin;

            // Convert to hours and minutes
            const diffHours = Math?.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math?.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            // Format as "Xh Ym"
            return `${diffHours}h ${diffMinutes}m`;
        } catch (error) {
            return "Error";
        }
    };

    // Optionally, add a function for color coding based on hours
    const getWorkingHoursColor = (hoursString) => {
        if (hoursString === "N/A" || hoursString === "Error") return "#666";

        try {
            // Extract hours from string like "8h 30m"
            const hoursMatch = hoursString?.match(/(\d+)h/);
            if (hoursMatch) {
                const hours = parseInt(hoursMatch[1]);
                if (hours < 4) return "#f44336"; // Red for <4 hours
                if (hours < 8) return "#ff9800"; // Orange for 4-8 hours
                return "#4caf50"; // Green for 8+ hours
            }
            return "#666";
        } catch (error) {
            return "#666";
        }
    };

    // Add these functions after your existing helper functions
    const [locationCache, setLocationCache] = useState({});

    const formatLocation = (location) => {
        if (!location) return "N/A";

        // Return cached location if available
        if (locationCache[location]) {
            // Truncate to 20 characters
            const cached = locationCache[location];
            return cached.length > 25 ? cached.substring(0, 25) + "..." : cached;
        }

        // If it's your specific coordinates, show short name
        if (location.includes("26.2161816") && location.includes("78.202204")) {
            return "ITM Campus";
        }

        // For other coordinates, show truncated version
        return location.length > 20 ? location.substring(0, 20) + "..." : location;
    };

    const getLocationName = async (coordinatesString) => {
        if (!coordinatesString) return "N/A";

        // Return cached result if available
        if (locationCache[coordinatesString]) {
            return locationCache[coordinatesString];
        }

        // Check if it contains coordinates
        const match = coordinatesString?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (!match) return coordinatesString;

        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

            if (response.ok) {
                const data = await response.json();
                const locationName = data?.display_name || coordinatesString;

                // Cache the result
                setLocationCache(prev => ({
                    ...prev,
                    [coordinatesString]: locationName
                }));

                return locationName;
            }
            return coordinatesString;
        } catch (error) {
            return coordinatesString;
        }
    };

    useEffect(() => {
        const fetchAllLocations = async () => {
            const cache = {};
            const locationPromises = empAttendance?.map(async (record) => {
                const checkinLocation = await getLocationName(record?.checkin_location);
                const checkoutLocation = await getLocationName(record?.checkout_location);

                if (record?.checkin_location) {
                    cache[record.checkin_location] = checkinLocation;
                }
                if (record?.checkout_location) {
                    cache[record.checkout_location] = checkoutLocation;
                }
            });

            await Promise.all(locationPromises);
            setLocationCache(cache);
        };

        if (empAttendance?.length > 0) {
            fetchAllLocations();
        }
    }, [empAttendance]);

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '80.7vw', mt: 1, p: 2 }}>
                {/* Header Card with Gradient */}
                <Card
                    elevation={4}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mb: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #ff8a00, #e52e71)'
                        }
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                            <Avatar
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    width: 56,
                                    height: 56,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Person sx={{ fontSize: 32, color: '#fff' }} />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: 'white',
                                    fontWeight: '800',
                                    mb: 0.5,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                Attendance Dashboard
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 500
                                }}
                            >
                                Track and manage your attendance records
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Refresh Data">
                                <IconButton
                                    onClick={() => fetchAttendance(filterType, fromDate, toDate)}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>

                    {/* Quick Stats */}
                    <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Total Records
                                </Typography>
                                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {stats?.total}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0?.2)'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    On Time
                                </Typography>
                                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                    {stats?.onTime}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Late Arrivals
                                </Typography>
                                <Typography variant="h3" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                    {stats?.late}
                                </Typography>
                            </Paper>
                        </Grid>
                        {/* // Add this as the 4th Grid item in your "Quick Stats" section */}
                        <Grid item xs={12} md={3}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Today's Status
                                </Typography>

                                {(() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const todayRecord = empAttendance?.find(record => {
                                        if (record?.checkin_date) {
                                            const recordDate = new Date(record.checkin_date).toISOString().split('T')[0];
                                            return recordDate === today;
                                        }
                                        return false;
                                    });

                                    if (todayRecord) {
                                        const checkinTime = new Date(todayRecord.checkin_date);
                                        const checkoutTime = todayRecord.checkout_date ? new Date(todayRecord.checkout_date) : null;
                                        const isCheckedOut = !!checkoutTime;
                                        const isLate = checkinTime.getHours() > 10 ||
                                            (checkinTime.getHours() === 10 && checkinTime.getMinutes() > 15);

                                        // Calculate working hours if checked out
                                        let workingHours = "N/A";
                                        if (isCheckedOut) {
                                            const diffMs = checkoutTime - checkinTime;
                                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                            workingHours = `${diffHours}h ${diffMinutes}m`;
                                        }

                                        return (
                                            <>
                                                {/* Status Text */}
                                                <Typography variant="h6" sx={{
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.5rem' // Match other stats font size
                                                }}>
                                                    {isCheckedOut ? 'CHECKED OUT' : 'CHECKED IN'}
                                                </Typography>

                                                {/* Check-in Time */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }} />
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                        In: {checkinTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>

                                                {/* Check-out Time */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }} />
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                        Out: {checkoutTime
                                                            ? checkoutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : 'Not yet'}
                                                    </Typography>
                                                </Box>

                                                {/* Working Hours (if checked out) */}
                                                {isCheckedOut && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,  }}>
                                                        <Schedule sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }} />
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                            Hours: {workingHours}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Status Badge */}
                                                <Box sx={{
                                                    display: 'inline-block',
                                                    bgcolor: isLate ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                                                    border: `1px solid ${isLate ? '#f44336' : '#4caf50'}`,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    mt: 'auto' // Push to bottom for consistent layout
                                                }}>
                                                    <Typography variant="caption" sx={{
                                                        color: isLate ? '#ffcdd2' : '#c8e6c9',
                                                        fontWeight: 600
                                                    }}>
                                                        {isLate ? 'Late Arrival' : 'On Time'}
                                                    </Typography>
                                                </Box>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <Typography variant="h4" sx={{
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    fontSize: '1.75rem'
                                                }}>
                                                    NOT CHECKED IN
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                        Check-in: --
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                        Check-out: --
                                                    </Typography>
                                                </Box>

                                                <Box sx={{
                                                    display: 'inline-block',
                                                    bgcolor: 'rgba(255, 152, 0, 0.3)',
                                                    border: '1px solid #ff9800',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    mt: 'auto'
                                                }}>
                                                    <Typography variant="caption" sx={{ color: '#ffe0b2', fontWeight: 600 }}>
                                                        Awaiting Check-in
                                                    </Typography>
                                                </Box>
                                            </>
                                        );
                                    }
                                })()}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Filter Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            onClick={() => {
                                setFilterType("previousMonth");
                                fetchAttendance("previousMonth");
                            }}
                            startIcon={<Schedule />}
                            sx={{
                                backgroundColor: filterType === "previousMonth"
                                    ? "white"
                                    : "rgba(255,255,255,0.2)",
                                color: filterType === "previousMonth" ? "#5f27cd" : "white",
                                border: "1px solid rgba(255,255,255,0.3)",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Previous Month
                        </Button>

                        <Button
                            onClick={() => {
                                setFilterType("thisMonth");
                                fetchAttendance("thisMonth");
                            }}
                            startIcon={<Today />}
                            sx={{
                                backgroundColor: filterType === "thisMonth"
                                    ? "white"
                                    : "rgba(255,255,255,0.2)",
                                color: filterType === "thisMonth" ? "#5f27cd" : "white",
                                border: "1px solid rgba(255,255,255,0.3)",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            This Month
                        </Button>

                        <Button
                            onClick={() => {
                                setFilterType("custom");
                                setFromDate("");
                                setToDate("");
                            }}
                            startIcon={<DateRange />}
                            sx={{
                                backgroundColor: filterType === "custom"
                                    ? "white"
                                    : "rgba(255,255,255,0.2)",
                                color: filterType === "custom" ? "#5f27cd" : "white",
                                border: "1px solid rgba(255,255,255,0.3)",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Custom Range
                        </Button>

                        <Tooltip title="Export Data">
                            <Button
                                startIcon={<Download />}
                                sx={{
                                    color: 'white',
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Export
                            </Button>
                        </Tooltip>
                    </Stack>

                    {/* Custom Date Range */}
                    {filterType === "custom" && (
                        <Zoom in={true}>
                            <Stack direction="row" spacing={2} mt={3} alignItems="center">
                                <TextField
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    InputProps={{
                                        startAdornment: <CalendarToday sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgba(255,255,255,0.3)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255,255,255,0.7)',
                                        }
                                    }}
                                />
                                <Typography sx={{ color: 'white' }}>to</Typography>
                                <TextField
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    InputProps={{
                                        startAdornment: <CalendarToday sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgba(255,255,255,0.3)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                            },
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => fetchAttendance("custom", fromDate, toDate)}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#5f27cd',
                                        fontWeight: 'bold',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: '#f5f5f5',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Apply Filter
                                </Button>
                            </Stack>
                        </Zoom>
                    )}
                </Card>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ mb: 3 }}>
                        <LinearProgress
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #667eea, #764ba2)'
                            }}
                        />
                        <Typography align="center" sx={{ mt: 2, color: '#666' }}>
                            Loading attendance records...
                        </Typography>
                    </Box>
                )}

                {/* Table Container */}
                <Zoom in={!loading} style={{ transitionDelay: !loading ? '200ms' : '0ms' }}>
                    <Card
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0',
                            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
                        }}
                    >
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                    <FilterList sx={{ color: '#5f27cd' }} />
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                                        Attendance Records
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                        Showing {empAttendance.length} records • Office Hours: {officeStart} - {officeEnd}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        placeholder="Search records..."
                                        size="small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: '#999' }} />,
                                        }}
                                        sx={{
                                            width: 250,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'white'
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Table */}
                        <Box sx={{ p: 1 }}>
                            <MaterialTable
                                title=""
                                // In your MaterialTable columns array:
                                columns={[
                                    // {
                                    //     title: "ID",
                                    //     field: "eld_id",
                                    //     render: (row) => (
                                    //         <Chip
                                    //             label={`#${row.eld_id}`}
                                    //             size="small"
                                    //             sx={{ fontWeight: 600, bgcolor: '#e8f4fd', color: '#1976d2' }}
                                    //         />
                                    //     )
                                    // },
                                    {
                                        title: "Check-in",
                                        field: "checkin_date",
                                        render: (row) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ArrowUpward sx={{ fontSize: 16, color: '#4caf50' }} />
                                                {highlight(row.checkin_date, officeStart, "before")}
                                            </Box>
                                        ),
                                    },
                                    {
                                        title: "Status",
                                        render: (row) => {
                                            if (!row?.checkin_date) return "-";
                                            const dt = new Date(row?.checkin_date);
                                            const time = dt?.toTimeString()?.slice(0, 5);
                                            const isLate = time > "10:15";

                                            return (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isLate ? (
                                                        <Cancel sx={{ color: '#f44336' }} />
                                                    ) : (
                                                        <CheckCircle sx={{ color: '#4caf50' }} />
                                                    )}
                                                    <Chip
                                                        label={isLate ? "Late Arrival" : "On Time"}
                                                        color={isLate ? "error" : "success"}
                                                        size="small"
                                                        variant="filled"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>
                                            );
                                        },
                                    },
                                    {
                                        title: "Check-out",
                                        field: "checkout_date",
                                        render: (row) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ArrowDownward sx={{ fontSize: 16, color: '#ff9800' }} />
                                                {highlight(row.checkout_date, officeEnd, "after")}
                                            </Box>
                                        ),
                                    },
                                    // NEW: Add Working Hours Column here
                                    {
                                        title: "Working Hours",
                                        field: "working_hours",
                                        render: (row) => {
                                            const workingHours = calculateWorkingHours(row.checkin_date, row.checkout_date);
                                            const hoursColor = getWorkingHoursColor(workingHours);

                                            return (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    justifyContent: 'center'
                                                }}>
                                                    <AccessTime sx={{ fontSize: 16, color: hoursColor }} />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: hoursColor,
                                                            backgroundColor: workingHours !== "N/A" ? 'rgba(0,0,0,0.02)' : 'transparent',
                                                            padding: '4px 8px',
                                                            borderRadius: 1,
                                                            minWidth: '70px',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {workingHours}
                                                    </Typography>
                                                </Box>
                                            );
                                        },
                                        // Optional: Add sorting functionality
                                        customSort: (a, b) => {
                                            const getHours = (hoursString) => {
                                                if (hoursString === "N/A" || hoursString === "Error") return 0;
                                                const match = hoursString?.match(/(\d+)h/);
                                                return match ? parseInt(match[1]) : 0;
                                            };

                                            const hoursA = getHours(calculateWorkingHours(a.checkin_date, a.checkout_date));
                                            const hoursB = getHours(calculateWorkingHours(b.checkin_date, b.checkout_date));
                                            return hoursA - hoursB;
                                        }
                                    },
                                    // Update the checkin_location column in your MaterialTable columns array
                                    // {
                                    //     title: "Check-in Location",
                                    //     field: "checkin_location",
                                    //     render: (row) => (
                                    //         <Tooltip title={locationCache[row?.checkin_location] || row?.checkin_location || 'N/A'} arrow>
                                    //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    //                 <LocationOn sx={{ fontSize: 16, color: '#5f27cd' }} />
                                    //                 <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                                    //                     {formatLocation(row?.checkin_location)}
                                    //                 </Typography>
                                    //             </Box>
                                    //         </Tooltip>
                                    //     ),
                                    //     cellStyle: {
                                    //         maxWidth: '180px',
                                    //         overflow: 'hidden'
                                    //     }
                                    // },
                                    // {
                                    //     title: "Check-out Location",
                                    //     field: "checkout_location",
                                    //     render: (row) => (
                                    //         <Tooltip title={locationCache[row?.checkout_location] || row?.checkout_location || 'N/A'} arrow>
                                    //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    //                 <LocationOn sx={{ fontSize: 16, color: '#ff9800' }} />
                                    //                 <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                                    //                     {formatLocation(row?.checkout_location)}
                                    //                 </Typography>
                                    //             </Box>
                                    //         </Tooltip>
                                    //     ),
                                    //     cellStyle: {
                                    //         maxWidth: '180px',
                                    //         overflow: 'hidden'
                                    //     }
                                    // },
                                    {
                                        title: "Status",
                                        field: "current_status",
                                        render: (row) => getStatusChip(row?.current_status)
                                    },
                                    // {
                                    //     title: "Clock-in Approve",
                                    //     field: "clockinapprove",
                                    //     render: (row) => getApprovalChip(row?.clockinapprove)
                                    // },
                                    // {
                                    //     title: "Clock-out Approve",
                                    //     field: "clockoutapprove",
                                    //     render: (row) => getApprovalChip(row?.clockoutapprove)
                                    // },
                                ]}
                                data={empAttendance}
                                options={{
                                    headerStyle: {
                                        backgroundColor: '#f5f7fa',
                                        fontWeight: "bold",
                                        fontSize: 14,
                                        color: '#2c3e50',
                                        borderBottom: '2px solid #e0e0e0'
                                    },
                                    rowStyle: {
                                        fontSize: 14,
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    },
                                    search: true,
                                    paging: true,
                                    pageSize: 10,
                                    pageSizeOptions: [5, 10, 20],
                                    paginationType: 'stepped',
                                    sorting: true,
                                    actionsColumnIndex: -1,
                                    showTitle: false,
                                    toolbar: false,
                                    searchFieldAlignment: 'right',
                                    searchFieldVariant: 'outlined',
                                    searchFieldStyle: {
                                        borderRadius: 2,
                                        marginBottom: 16
                                    }
                                }}
                                components={{
                                    OverlayLoading: () => (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress sx={{ color: '#5f27cd' }} />
                                        </Box>
                                    )
                                }}
                                localization={{
                                    body: {
                                        emptyDataSourceMessage: 'No attendance records found',
                                    },
                                    pagination: {
                                        labelRowsSelect: 'rows',
                                        labelDisplayedRows: '{from}-{to} of {count}',
                                    },
                                    toolbar: {
                                        searchPlaceholder: 'Search records...',
                                    }
                                }}
                            />
                        </Box>

                        {/* Footer */}
                        <Divider />
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                Last updated: {new Date()?.toLocaleDateString()} {new Date()?.toLocaleTimeString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                                Employee ID: {user?.employee_id || 'N/A'}
                            </Typography>
                        </Box>
                    </Card>
                </Zoom>
            </Box>
        </Fade>
    );
};

export default EmployeeAttendance;