import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Avatar,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton
} from "@mui/material";
import {
    Person as PersonIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    AttachFile as AttachFileIcon,
    Description as DescriptionIcon,
    School as SchoolIcon,
    Star as StarIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarTodayIcon,
    Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { postData } from "../backendservices/FetchNodeServices";
import Swal from "sweetalert2";

const ResumeInput = ({ user, data }) => {
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);

    // Use the data prop directly
    const selectedJob = data;

    const [resumeData, setResumeData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        summary: "",
        experience: [{
            company: "",
            position: "",
            duration: "",
            description: ""
        }],
        education: [{
            institution: "",
            degree: "",
            year: "",
            percentage: ""
        }],
        skills: "",
        certifications: "",
        coverLetter: "",
        jobAssignId: data?.job_assign_id || ""
    });

    // Set jobAssignId from data when component mounts
    useEffect(() => {
        if (data?.job_assign_id) {
            setResumeData(prev => ({ ...prev, jobAssignId: data.job_assign_id }));
        }
    }, [data]);

    // Rest of your functions remain the same...
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, [name]: value }));
    };

    const handleExperienceChange = (index, field, value) => {
        const updatedExperience = [...resumeData.experience];
        updatedExperience[index][field] = value;
        setResumeData(prev => ({ ...prev, experience: updatedExperience }));
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...resumeData.education];
        updatedEducation[index][field] = value;
        setResumeData(prev => ({ ...prev, education: updatedEducation }));
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                company: "",
                position: "",
                duration: "",
                description: ""
            }]
        }));
    };

    const removeExperience = (index) => {
        if (resumeData.experience.length > 1) {
            const updatedExperience = [...resumeData.experience];
            updatedExperience.splice(index, 1);
            setResumeData(prev => ({ ...prev, experience: updatedExperience }));
        }
    };

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, {
                institution: "",
                degree: "",
                year: "",
                percentage: ""
            }]
        }));
    };

    const removeEducation = (index) => {
        if (resumeData.education.length > 1) {
            const updatedEducation = [...resumeData.education];
            updatedEducation.splice(index, 1);
            setResumeData(prev => ({ ...prev, education: updatedEducation }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            
            // Extract name from filename
            const fileName = file.name;
            const patterns = [
                /resume[-_\s]*([A-Z][a-z]+[-_\s]*[A-Z][a-z]+)/i,
                /([A-Z][a-z]+[-_\s]*[A-Z][a-z]+)[-_\s]*resume/i,
                /^([A-Z][a-z]+[-_\s]*[A-Z][a-z]+)/i,
                /CV[-_\s]*([A-Z][a-z]+[-_\s]*[A-Z][a-z]+)/i,
            ];
            
            for (const pattern of patterns) {
                const match = fileName.match(pattern);
                if (match && match[1]) {
                    const extractedName = match[1]
                        .replace(/[-_]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    setResumeData(prev => ({
                        ...prev,
                        fullName: extractedName
                    }));
                    
                    Swal.fire({
                        icon: "success",
                        title: "Name Detected!",
                        text: `Name "${extractedName}" extracted from filename`,
                        timer: 2000,
                    });
                    break;
                }
            }
            
            Swal.fire({
                icon: "success",
                title: "File Uploaded!",
                text: `${file.name} uploaded successfully`,
                timer: 1500,
            });
        }
    };

    const removeFile = () => {
        setResumeFile(null);
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!resumeData.fullName || !resumeData.email || !resumeData.phone) {
            Swal.fire({
                icon: "error",
                title: "Required Fields",
                text: "Please fill in all required personal information",
                timer: 1500,
            });
            return;
        }

        if (!resumeFile) {
            Swal.fire({
                icon: "error",
                title: "Resume Required",
                text: "Please upload your resume before submitting",
                timer: 1500,
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("employee_id", user.employee_id);
            formData.append("job_assign_id", resumeData.jobAssignId);
            formData.append("fullName", resumeData.fullName);
            formData.append("email", resumeData.email);
            formData.append("phone", resumeData.phone);
            formData.append("address", resumeData.address);
            formData.append("summary", resumeData.summary);
            formData.append("experience", JSON.stringify(resumeData.experience));
            formData.append("education", JSON.stringify(resumeData.education));
            formData.append("skills", resumeData.skills);
            formData.append("certifications", resumeData.certifications);
            formData.append("coverLetter", resumeData.coverLetter);
            formData.append("resumeFile", resumeFile);

            const result = await postData("resume/submit", formData);

            if (result.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your resume has been submitted successfully",
                    timer: 3000,
                    showConfirmButton: true,
                });

                // Reset form
                setResumeData({
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    summary: "",
                    experience: [{
                        company: "",
                        position: "",
                        duration: "",
                        description: ""
                    }],
                    education: [{
                        institution: "",
                        degree: "",
                        year: "",
                        percentage: ""
                    }],
                    skills: "",
                    certifications: "",
                    coverLetter: "",
                    jobAssignId: data?.job_assign_id || ""
                });
                setResumeFile(null);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed",
                    text: result.message || "Failed to submit resume",
                    timer: 2000,
                });
            }
        } catch (error) {
            console.error("Error submitting resume:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
                timer: 2000,
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box sx={{
            width: "82.35vw",
            p: 1,
            background: '#f8f9fa',
            minHeight: '100vh',
        }}>
            {/* Job Assignment Header - Using data prop */}
            {selectedJob && (
                <Paper elevation={2} sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                }}>
                    {/* Header with title and ID */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            {/* Show the name from your data */}
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {data.name || selectedJob.job_title || "Job Assignment"}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {selectedJob.companyname || "Company Name"}
                            </Typography>
                        </Box>
                        <Chip
                            label={`ID: ${selectedJob.job_assign_id || "N/A"}`}
                            sx={{
                                bgcolor: 'white',
                                color: '#667eea',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        />
                    </Box>

                    {/* Details Grid - Fixed Grid v2 syntax */}
                    <Grid container spacing={2}>
                        {/* Assign ID */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                height: '100%'
                            }}>
                                <Typography variant="caption" sx={{
                                    opacity: 0.9,
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Assign ID
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <AssignmentIcon fontSize="small" />
                                    {selectedJob.job_assign_id || "N/A"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Company Name */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                height: '100%'
                            }}>
                                <Typography variant="caption" sx={{
                                    opacity: 0.9,
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Company Name
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <BusinessIcon fontSize="small" />
                                    {selectedJob.companyname || "Not specified"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Job Title */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                height: '100%'
                            }}>
                                <Typography variant="caption" sx={{
                                    opacity: 0.9,
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Job Title
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <WorkIcon fontSize="small" />
                                    {selectedJob.job_title || "Not specified"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Status */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                height: '100%'
                            }}>
                                <Typography variant="caption" sx={{
                                    opacity: 0.9,
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Status
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <CheckCircleIcon fontSize="small" />
                                    {selectedJob.statuses || "Not specified"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Assign Date - Full width */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                mt: 1
                            }}>
                                <Typography variant="caption" sx={{
                                    opacity: 0.9,
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Assign Date
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <CalendarTodayIcon fontSize="small" />
                                    {selectedJob.assign_date ? new Date(selectedJob.assign_date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : 'Not available'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Main Form Card - Rest of your form remains the same */}
            <Card sx={{
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                background: 'white',
            }}>
                {/* Form Header */}
                <Box sx={{
                    background: '#4776E6',
                    p: 2,
                    color: 'white',
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        Resume Submission
                    </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {/* Resume Upload Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CloudUploadIcon color="primary" /> Upload Resume (Auto-fill enabled)
                        </Typography>

                        {resumeFile ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {resumeFile.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={removeFile}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #ccc', borderRadius: 1 }}>
                                <input
                                    accept=".pdf,.doc,.docx,.txt,.rtf"
                                    style={{ display: 'none' }}
                                    id="resume-upload"
                                    type="file"
                                    onChange={handleFileUpload}
                                />
                                <label htmlFor="resume-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        startIcon={<AttachFileIcon />}
                                    >
                                        Choose Resume File
                                    </Button>
                                </label>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                    Upload resume to auto-fill name from filename
                                </Typography>
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                                    Tip: Name your file like "resume_John_Doe.pdf" or "John_Doe_resume.docx"
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Personal Information */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" /> Personal Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Full Name"
                                    name="fullName"
                                    value={resumeData.fullName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={resumeData.email}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Phone Number"
                                    name="phone"
                                    value={resumeData.phone}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={resumeData.address}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Professional Summary"
                                    name="summary"
                                    value={resumeData.summary}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Brief summary of your professional background..."
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Work Experience */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon color="primary" /> Work Experience
                        </Typography>

                        {resumeData.experience.map((exp, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Experience {index + 1}
                                    </Typography>
                                    {index > 0 && (
                                        <IconButton size="small" onClick={() => removeExperience(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            value={exp.company}
                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Job Position"
                                            value={exp.position}
                                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Duration"
                                            value={exp.duration}
                                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                            placeholder="e.g., 2020-2022"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            value={exp.description}
                                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                            multiline
                                            rows={2}
                                            placeholder="Describe your responsibilities and achievements..."
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            onClick={addExperience}
                            size="small"
                            sx={{ mt: 1 }}
                        >
                            Add Experience
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Education */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon color="primary" /> Education
                        </Typography>

                        {resumeData.education.map((edu, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Education {index + 1}
                                    </Typography>
                                    {index > 0 && (
                                        <IconButton size="small" onClick={() => removeEducation(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Institution"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Degree/Course"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Year"
                                            value={edu.year}
                                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                            placeholder="e.g., 2016-2020"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Percentage/CGPA"
                                            value={edu.percentage}
                                            onChange={(e) => handleEducationChange(index, 'percentage', e.target.value)}
                                            placeholder="e.g., 85% or 8.5"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            onClick={addEducation}
                            size="small"
                            sx={{ mt: 1 }}
                        >
                            Add Education
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Skills & Certifications */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon color="primary" /> Skills & Certifications
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Skills"
                                    name="skills"
                                    value={resumeData.skills}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Enter your skills separated by commas"
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Certifications"
                                    name="certifications"
                                    value={resumeData.certifications}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="List your certifications"
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Cover Letter */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon color="primary" /> Cover Letter (Optional)
                        </Typography>

                        <TextField
                            fullWidth
                            label="Cover Letter"
                            name="coverLetter"
                            value={resumeData.coverLetter}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            placeholder="Write your cover letter here..."
                            variant="outlined"
                            size="small"
                        />
                    </Box>

                    {/* Submit Section */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                        <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
                            Please review all information before submitting. Make sure your resume file is uploaded.
                        </Alert>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                size="large"
                                sx={{
                                    background: '#4CAF50',
                                    minWidth: 200,
                                    '&:hover': {
                                        background: '#388E3C'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Resume'}
                            </Button>
                        </Box>
                    </Box>

                </CardContent>
            </Card>
        </Box>
    );
};

export default ResumeInput;