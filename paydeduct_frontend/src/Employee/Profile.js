import {
    Avatar,
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Typography,
    Chip,
    Stack,
    Container
} from "@mui/material";
import logo from "../assets/logo.jpeg";
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon
} from "@mui/icons-material";
import { serverURL } from '../backendservices/FetchNodeServices'

export default function Profile({ user }) {
    return (
        <Container sx={{ p: { xs: 1, sm: 2, md: 3 } }} style={{ maxWidth: '82.8vw' }}>
            <Box
                sx={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    borderRadius: 3,
                    p: { xs: 2, sm: 3, md: 4 },
                    boxShadow: "0 10px 40px rgba(106, 27, 154, 0.15)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background: "linear-gradient(90deg, #6a1b9a, #9c4dcc, #6a1b9a)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 3s infinite linear",
                    },
                    "@keyframes shimmer": {
                        "0%": { backgroundPosition: "-200% 0" },
                        "100%": { backgroundPosition: "200% 0" }
                    }
                }}
            >
                {/* Header */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(90deg, #6a1b9a, #9c4dcc)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-0.5px",
                        mb: 4,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
                    }}
                >
                    Employee Profile
                </Typography>

                {/* Single Row Layout */}
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(106, 27, 154, 0.2)",
                        background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                        border: "2px solid rgba(106, 27, 154, 0.1)",
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        overflow: "hidden",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 15px 40px rgba(106, 27, 154, 0.3)",
                        }
                    }}
                >
                    {/* Left Section - Profile */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "300px" },
                            p: { xs: 2, sm: 3, md: 4 },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(145deg, rgba(106, 27, 154, 0.05), rgba(156, 77, 204, 0.05))",
                            borderRight: { xs: "none", md: "2px solid rgba(106, 27, 154, 0.1)" },
                            borderBottom: { xs: "2px solid rgba(106, 27, 154, 0.1)", md: "none" },
                            position: "relative"
                        }}
                    >
                        {/* Avatar Container */}
                        <Box sx={{ position: "relative", mb: 3 }}>
                            <Avatar
                                src={
                                    user?.profileicon
                                        ? `${serverURL}/images/${user.profileicon}`
                                        : logo
                                }
                                alt={user?.name || "User"}
                                sx={{
                                    width: { xs: 120, sm: 140, md: 160 },
                                    height: { xs: 120, sm: 140, md: 160 },
                                    border: "4px solid #6a1b9a",
                                    boxShadow: "0 8px 24px rgba(106, 27, 154, 0.3)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow: "0 12px 32px rgba(106, 27, 154, 0.4)",
                                    }
                                }}
                            />
                            {/* Department Chip */}
                            <Chip
                                label={user?.department || "HR"}
                                size="small"
                                icon={<BusinessIcon />}
                                sx={{
                                    position: "absolute",
                                    bottom: -10,
                                    right: 10,
                                    background: "linear-gradient(90deg, #6a1b9a, #9c4dcc)",
                                    color: "white",
                                    fontWeight: "bold",
                                    border: "2px solid white",
                                    boxShadow: "0 4px 12px rgba(106, 27, 154, 0.3)"
                                }}
                            />
                        </Box>

                        {/* Name and Designation */}
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: "#2d2d2d",
                                letterSpacing: "0.5px",
                                textAlign: "center",
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            {user?.name || "Employee Name"}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                            sx={{ mb: 3 }}
                        >
                            <WorkIcon sx={{ fontSize: 18, color: "#6a1b9a" }} />
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 500,
                                    color: "#6a1b9a",
                                    fontStyle: "italic",
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                {user?.designation || "Employee"}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Right Section - Personal Information */}
                    <Box sx={{
                        flex: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                        overflow: "hidden"
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: "bold",
                                mb: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "#6a1b9a",
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            Personal Information
                        </Typography>

                        <Divider sx={{
                            mb: 4,
                            "&::before, &::after": {
                                borderColor: "#9c4dcc",
                            }
                        }} />

                        <Grid container spacing={2}>
                            {/* Email */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    background: "rgba(106, 27, 154, 0.05)",
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(106, 27, 154, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                }}>
                                    <Box sx={{
                                        background: "linear-gradient(135deg, #6a1b9a, #9c4dcc)",
                                        borderRadius: "50%",
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: { xs: "40px", md: "48px" },
                                        minHeight: { xs: "40px", md: "48px" },
                                        flexShrink: 0
                                    }}>
                                        <EmailIcon sx={{ color: "white", fontSize: { xs: 18, md: 22 } }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: '0.875rem', md: '1rem' },
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word"
                                        }}>
                                            {user?.emailid || "Not Provided"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Mobile */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    background: "rgba(106, 27, 154, 0.05)",
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(106, 27, 154, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                }}>
                                    <Box sx={{
                                        background: "linear-gradient(135deg, #6a1b9a, #9c4dcc)",
                                        borderRadius: "50%",
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: { xs: "40px", md: "48px" },
                                        minHeight: { xs: "40px", md: "48px" },
                                        flexShrink: 0
                                    }}>
                                        <PhoneIcon sx={{ color: "white", fontSize: { xs: 18, md: 22 } }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                            Mobile Number
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: '0.875rem', md: '1rem' },
                                            wordBreak: "break-word"
                                        }}>
                                            {user?.mobileno || "Not Provided"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Department */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    background: "rgba(106, 27, 154, 0.05)",
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(106, 27, 154, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                }}>
                                    <Box sx={{
                                        background: "linear-gradient(135deg, #6a1b9a, #9c4dcc)",
                                        borderRadius: "50%",
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: { xs: "40px", md: "48px" },
                                        minHeight: { xs: "40px", md: "48px" },
                                        flexShrink: 0
                                    }}>
                                        <BusinessIcon sx={{ color: "white", fontSize: { xs: 18, md: 22 } }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                            Department
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: '0.875rem', md: '1rem' }
                                        }}>
                                            {user?.department || "HR"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Joining Date */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    background: "rgba(106, 27, 154, 0.05)",
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(106, 27, 154, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                }}>
                                    <Box sx={{
                                        background: "linear-gradient(135deg, #6a1b9a, #9c4dcc)",
                                        borderRadius: "50%",
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: { xs: "40px", md: "48px" },
                                        minHeight: { xs: "40px", md: "48px" },
                                        flexShrink: 0
                                    }}>
                                        <CalendarIcon sx={{ color: "white", fontSize: { xs: 18, md: 22 } }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                            Joining Date
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: '0.875rem', md: '1rem' }
                                        }}>
                                            {user?.anniversary
                                                ? new Date(user.anniversary).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : "Not Provided"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Address - Full Width */}
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 2,
                                    p: 2,
                                    background: "rgba(106, 27, 154, 0.05)",
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "rgba(106, 27, 154, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                }}>
                                    <Box sx={{
                                        background: "linear-gradient(135deg, #6a1b9a, #9c4dcc)",
                                        borderRadius: "50%",
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: { xs: "40px", md: "48px" },
                                        minHeight: { xs: "40px", md: "48px" },
                                        flexShrink: 0,
                                        mt: 0.5
                                    }}>
                                        <LocationIcon sx={{ color: "white", fontSize: { xs: 18, md: 22 } }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                            Address
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 500,
                                            fontSize: { xs: '0.875rem', md: '1rem' },
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word"
                                        }}>
                                            {user?.address || "Not Provided"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>
            </Box>
        </Container>
    );
}