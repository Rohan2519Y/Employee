import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Snackbar,
    CircularProgress
} from "@mui/material";
import { postData } from "../backendservices/FetchNodeServices";
import Swal from "sweetalert2";

const LeaveRequest = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        type_of_leave: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        reason: "",
        status: "Pending",
        value: "",
        work_handover: "",
        work_handover_details: "",
        total_duration: ''
    });

    const leaveTypes = [
        { value: "SL", label: "Sick/Casual Leave" },
        { value: "HD", label: "Half Day" },
        { value: "SHORT_LEAVE", label: "Short Leave" }
    ];

    // Calculate total duration in 'X hr Y min' format and get hours/minutes
    const calculateTotalDuration = () => {
        if (!formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
            return { duration: "", hours: 0, minutes: 0 };
        }

        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

        if (endDateTime <= startDateTime) {
            return { duration: "", hours: 0, minutes: 0 };
        }

        // Calculate difference in minutes
        const diffMs = endDateTime - startDateTime;
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Format as 'X hr Y min'
        const duration = `${hours} hr ${minutes} min`;
        
        return { duration, hours, minutes };
    };

    // Auto-fill times based on leave type
    useEffect(() => {
        if (!formData.type_of_leave || !formData.start_date) return;

        let startTime = formData.start_time;
        let endTime = formData.end_time;
        let endDate = formData.end_date;

        if (formData.type_of_leave === "SL") {
            // For Sick Leave: same day, 10 AM to 6 PM
            startTime = "10:00";
            endTime = "18:00";
            endDate = formData.start_date;
        } else if (formData.type_of_leave === "HD") {
            // For Half Day: same day, 4 hours duration
            if (formData.start_time) {
                const start = new Date(`${formData.start_date}T${formData.start_time}`);
                const end = new Date(start.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours
                endTime = end.toTimeString().slice(0, 5);
                endDate = formData.start_date;
            }
        } else if (formData.type_of_leave === "SHORT_LEAVE") {
            // For Short Leave: same day, 2 hours duration
            if (formData.start_time) {
                const start = new Date(`${formData.start_date}T${formData.start_time}`);
                const end = new Date(start.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
                endTime = end.toTimeString().slice(0, 5);
                endDate = formData.start_date;
            }
        }

        setFormData(prev => ({
            ...prev,
            start_time: startTime,
            end_time: endTime,
            end_date: endDate
        }));
    }, [formData.type_of_leave, formData.start_date, formData.start_time]);

    // Update total duration when relevant fields change
    useEffect(() => {
        const { duration, hours, minutes } = calculateTotalDuration();
        setFormData(prev => ({ ...prev, total_duration: duration }));
        
        // Calculate value for short leave based on hours
        if (formData.type_of_leave === "SHORT_LEAVE" && duration) {
            const totalHours = hours + (minutes / 60);
            const dayFraction = (totalHours / 8).toFixed(3); // Assuming 8 hour work day
            setFormData(prev => ({ ...prev, value: dayFraction }));
        }
    }, [formData.start_date, formData.start_time, formData.end_date, formData.end_time]);

    // Calculate value (for HD)
    useEffect(() => {
        if (formData.type_of_leave === "HD") {
            setFormData(prev => ({ ...prev, value: "0.5" }));
        } else if (formData.type_of_leave === "SL") {
            setFormData(prev => ({ ...prev, value: "" }));
        }
    }, [formData.type_of_leave]);

    const handleLeaveTypeChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            type_of_leave: value
        }));

        if (error) setError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.type_of_leave) {
            setError("Please select type of leave");
            return;
        }

        if (!formData.start_date || !formData.start_time) {
            setError("Please select start date and time");
            return;
        }

        if (!formData.end_date || !formData.end_time) {
            setError("Please select end date and time");
            return;
        }

        if (!formData.reason.trim()) {
            setError("Please provide reason for leave");
            return;
        }

        // Validate date/time
        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

        if (endDateTime <= startDateTime) {
            setError("End date/time must be after start date/time");
            return;
        }

        // For HD and SHORT_LEAVE, should be same day
        if ((formData.type_of_leave === "HD" || formData.type_of_leave === "SHORT_LEAVE") &&
            formData.start_date !== formData.end_date) {
            setError("Start and end date must be same for Half Day and Short Leave");
            return;
        }

        // For SL, should be same day (already enforced)
        if (formData.type_of_leave === "SL" && formData.start_date !== formData.end_date) {
            setError("Sick Leave must be for the same day");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Format dates to ISO string with time
            const startDateISO = new Date(`${formData.start_date}T${formData.start_time}`).toISOString();
            const endDateISO = new Date(`${formData.end_date}T${formData.end_time}`).toISOString();

            // For SL, set total_duration to empty string, for HD/SHORT_LEAVE use the calculated format
            const totalDurationToSend = formData.type_of_leave === "SL" ? "" : formData.total_duration;
            
            // For SL, set value to empty string
            const valueToSend = formData.type_of_leave === "SL" ? "" : formData.value;

            const payload = {
                employee_id: user?.employee_id,
                type_of_leave: formData.type_of_leave,
                start_date: startDateISO,
                end_date: endDateISO,
                reason: formData.reason,
                status: "Pending",
                value: valueToSend,
                total_duration: totalDurationToSend,
                work_handover: formData.work_handover || "",
                work_handover_details: formData.work_handover_details || ""
            };

            const result = await postData("employeeLeave/leave", payload);

            if (result.status) {
                setSuccess(true);
                Swal.fire({
                    icon: "success",
                    title: "Leave Request Submitted",
                    text: "Your leave request has been submitted successfully",
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end"
                });

                // Reset form
                setFormData({
                    type_of_leave: "",
                    start_date: "",
                    start_time: "",
                    end_date: "",
                    end_time: "",
                    reason: "",
                    status: "Pending",
                    value: "",
                    work_handover: "",
                    work_handover_details: "",
                    total_duration: ''
                });
            } else {
                setError(result.message || "Failed to submit leave request");
            }
        } catch (err) {
            console.error("Error submitting leave request:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            type_of_leave: "",
            start_date: "",
            start_time: "",
            end_date: "",
            end_time: "",
            reason: "",
            status: "Pending",
            value: "",
            work_handover: "",
            work_handover_details: "",
            total_duration: ''
        });
        setError("");
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
    };

    return (
        <Box sx={{ width: "82.35vw", p: 1 }}>
            <Card sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                background: "white"
            }}>
                <CardContent sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold",
                                mb: 0.5,
                                color: "#333"
                            }}
                        >
                            Apply for Leave
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: 1, py: 0.5 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Leave Type */}
                            <Grid item xs={12} size={3}>
                                <FormControl fullWidth required size="small">
                                    <InputLabel>Type of Leave</InputLabel>
                                    <Select
                                        name="type_of_leave"
                                        value={formData.type_of_leave}
                                        onChange={handleLeaveTypeChange}
                                        label="Type of Leave"
                                    >
                                        {leaveTypes.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Start Date & Time */}
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Start Date"
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Start Time"
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>

                            {/* End Date & Time */}
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    required
                                    label="End Date"
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: formData.start_date || new Date().toISOString().split('T')[0]
                                    }}
                                    size="small"
                                    disabled={formData.type_of_leave === "SL" ||
                                        formData.type_of_leave === "HD" ||
                                        formData.type_of_leave === "SHORT_LEAVE"}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    required
                                    label="End Time"
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    disabled={formData.type_of_leave === "SL"}
                                />
                            </Grid>

                            {/* Total Duration Display */}
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    label="Total Duration"
                                    value={formData.total_duration}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    size="small"
                                    placeholder="Will be calculated automatically"
                                />
                            </Grid>

                            {/* Value Display */}
                            {/* <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    label="Value (in days)"
                                    value={formData.value}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    size="small"
                                    placeholder="Auto-calculated"
                                />
                            </Grid> */}


                            {/* Work Handover */}
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    label="Work Handover To"
                                    name="work_handover"
                                    value={formData.work_handover}
                                    onChange={handleChange}
                                    placeholder="Person name"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} size={3}>
                                <TextField
                                    fullWidth
                                    label="Handover Details"
                                    name="work_handover_details"
                                    value={formData.work_handover_details}
                                    onChange={handleChange}
                                    placeholder="Details"
                                    size="small"
                                />
                            </Grid>

                            {/* Reason for Leave */}
                            <Grid item xs={12} size={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Reason for Leave"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    size="small"
                                    placeholder="Please provide detailed reason for your leave request..."
                                />
                            </Grid>
                            {/* Buttons */}
                            <Grid item xs={12} size={12}>
                                <Box sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    pt: 2,
                                    borderTop: "1px solid #e0e0e0"
                                }}>
                                    <Grid item xs={6} size={3}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleReset}
                                            disabled={loading}
                                            size="medium"
                                            sx={{ borderRadius: 1 }}
                                            fullWidth
                                        >
                                            Reset
                                        </Button>
                                    </Grid>

                                    <Grid item xs={6} size={3}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            size='medium'
                                            fullWidth
                                            sx={{
                                                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                                                borderRadius: 1,
                                                "&:hover": {
                                                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)"
                                                }
                                            }}
                                        >
                                            {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
                                        </Button>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            {/* Success Snackbar */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Leave request submitted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LeaveRequest;