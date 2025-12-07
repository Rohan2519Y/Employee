import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { postData } from "../../backendservices/FetchNodeServices";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const PayslipDisplay = ({ setPayOpen, setPayId, user }) => {
  const [payslipList, setPayslipList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPayslips = async () => {
    setLoading(true);
    const res = await postData("payslip/fetch_all_payslip_by_id", { 
      empid: user.employee_id 
    });
    
    if (res.status) {
      setPayslipList(res.data);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.message || "Failed to fetch payslip data",
        timer: 1500,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllPayslips();
  }, []);

  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotal = (rowData) => {
    return (
      parseFloat(rowData.basic_salary || 0) +
      parseFloat(rowData.da || 0) +
      parseFloat(rowData.hra || 0) +
      parseFloat(rowData.cca || 0) +
      parseFloat(rowData.incentive || 0)
    );
  };

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)',
    }}>
      {/* Simple Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar sx={{ 
          bgcolor: '#667eea', 
          width: 80, 
          height: 80,
          mx: 'auto',
          mb: 2,
          boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
        }}>
          <ReceiptIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#333',
          mb: 1 
        }}>
          My Payslips
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          View and manage all your salary slips
        </Typography>
      </Box>

      {/* Payslip Table */}
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1.5, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Payslip Records ({payslipList.length})
            </Typography>
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
              Loading your payslips...
            </Typography>
          </Box>
        ) : (
          <MaterialTable
            title=""
            columns={[
              {
                title: "ID",
                field: "payslip_id",
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
                title: "Date",
                field: "date_of_payslip",
                render: (rowData) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ 
                      mr: 1, 
                      color: '#666', 
                      fontSize: 16 
                    }} />
                    <Typography variant="body2">
                      {formatDate(rowData.date_of_payslip)}
                    </Typography>
                  </Box>
                ),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "Basic",
                field: "basic_salary",
                render: (rowData) => (
                  <Typography sx={{ fontWeight: '500' }}>
                    {formatCurrency(rowData.basic_salary)}
                  </Typography>
                ),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "DA",
                field: "da",
                render: (rowData) => formatCurrency(rowData.da),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "HRA",
                field: "hra",
                render: (rowData) => formatCurrency(rowData.hra),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "Allowance",
                field: "cca",
                render: (rowData) => formatCurrency(rowData.cca),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "Incentive",
                field: "incentive",
                render: (rowData) => (
                  <Chip
                    label={formatCurrency(rowData.incentive)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      color: '#2e7d32',
                      fontWeight: '500',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                    }}
                  />
                ),
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
              {
                title: "Total",
                field: "total",
                render: (rowData) => {
                  const total = calculateTotal(rowData);
                  return (
                    <Typography sx={{ 
                      fontWeight: 'bold',
                      color: '#4CAF50',
                      fontSize: '0.95rem'
                    }}>
                      {formatCurrency(total)}
                    </Typography>
                  );
                },
                headerStyle: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
            ]}
            data={payslipList}
            actions={[
              {
                icon: () => (
                    <IconButton sx={{
                      color: '#4776E6',
                      '&:hover': {
                        bgcolor: 'rgba(71, 118, 230, 0.1)',
                      }
                    }}>
                      <VisibilityIcon />
                    </IconButton>
                ),
                tooltip: 'View Details',
                onClick: (event, rowData) => {
                  setPayOpen(true);
                  setPayId(rowData.payslip_id);
                },
              },
              {
                icon: () => (
                    <IconButton sx={{
                      color: '#FF5722',
                      '&:hover': {
                        bgcolor: 'rgba(255, 87, 34, 0.1)',
                      }
                    }}>
                      <DownloadIcon />
                    </IconButton>
                ),
                tooltip: 'Download',
                onClick: () => {
                  Swal.fire({
                    icon: 'info',
                    title: 'Coming Soon',
                    text: 'Download feature will be available soon!',
                    timer: 1500,
                  });
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

        {/* Simple Footer */}
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
            Total Records: {payslipList.length}
          </Typography>
        </Box>
      </Paper>

      {/* Info Note */}
      <Box sx={{
        mt: 3,
        p: 2,
        bgcolor: '#f0f7ff',
        borderRadius: 1,
        border: '1px solid #d1e3ff',
      }}>
        <Typography variant="body2" sx={{ color: '#1976d2', fontSize: '0.875rem' }}>
          📄 Click the view icon to see detailed payslip information. 
          Contact HR department for any queries regarding your salary.
        </Typography>
      </Box>
    </Box>
  );
};

export default PayslipDisplay;