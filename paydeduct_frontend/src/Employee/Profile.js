import { Avatar, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import logo from "../assets/logo.jpeg";

export default function Profile({ user }) {
    return (<>
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
                                    ? `https://campusshala.com:3022/images/${user.profileicon}`
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
    </>)
}