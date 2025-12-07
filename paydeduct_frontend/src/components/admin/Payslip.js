import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getData, postData } from '../../backendservices/FetchNodeServices';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import AutoPayslipGenerator from "./AutoPayslipGenerator";

export default function Payslip({ user, payId }) {
    const params = useParams();
    const payslipRef = useRef();
    const [payslipData, setPayslipData] = useState([]);
    const [countData, setCountData] = useState([]);
    const [publicHolidays, setPublicHolidays] = useState(0);
    const [empAttendence, setEmpAttendence] = useState([]);
    const [leave, setLeave] = useState([]);
    const [totalLeave, setTotalLeave] = useState(18);

    // Reusable date calculations
    const currentDate = new Date();
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth();
    const monthName = prevMonth.toLocaleString("default", { month: "short" });
    const currentMonthYear = `${monthName} - ${year}`;

    // Memoized calculations - keeping original formulas
    const prevMonthTotalDays = useMemo(() =>
        new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate(), []);

    const prevMonthSundays = useMemo(() =>
        Array.from(
            { length: prevMonthTotalDays },
            (_, i) => new Date(new Date().getFullYear(), new Date().getMonth() - 1, i + 1)
        ).filter(d => d.getDay() === 0).length,
        [prevMonthTotalDays]);

    // Function to calculate total leaves based on joining date
    const calculateTotalLeaves = (joiningDate) => {
        if (!joiningDate) return 18;

        const join = new Date(joiningDate);
        const currentYear = new Date().getFullYear();

        if (join.getFullYear() === currentYear) {
            const leaveMonths = 12 - (join.getMonth() + 1) + 1;
            return (18 * leaveMonths) / 12;
        }

        return 18;
    };

    // Function to calculate leaves for the previous month's year
    const calculateLeavesForPreviousMonth = (joiningDate) => {
        const prevMonthYear = prevMonth.getFullYear();
        return calculateTotalLeaves(joiningDate, prevMonthYear);
    };

    // Reusable functions
    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const getPreviousMonthData = (data) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let previousMonth = currentMonth - 1;
        let yearOfPrevMonth = currentYear;
        if (previousMonth < 0) {
            previousMonth = 11;
            yearOfPrevMonth = currentYear - 1;
        }

        return data.filter((item) => {
            const itemDate = new Date(item.start_date);
            const month = itemDate.getMonth();
            const year = itemDate.getFullYear();
            return month === previousMonth && year === yearOfPrevMonth;
        });
    };

    const getPreviousMonthHolidaysCount = (holidaysData) => {
        const now = new Date();
        const prevMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
        const year = prevMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();

        let totalDays = 0;

        holidaysData.forEach((holiday) => {
            let from = new Date(holiday.date_from);
            let to = new Date(holiday.date_to);

            if (from > to) {
                [from, to] = [to, from];
            }

            for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
                const month = d.getUTCMonth();
                const yr = d.getUTCFullYear();
                if (month === prevMonth && yr === year) {
                    totalDays++;
                }
            }
        });

        return totalDays;
    };

    const numberToWords = (num) => {
        if (num === 0) return "Zero Rupees Only";
        if (isNaN(num)) return "";

        let isNegative = false;
        if (num < 0) {
            isNegative = true;
            num = Math.abs(num);
        }

        const a = [
            "", "One", "Two", "Three", "Four", "Five", "Six",
            "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
            "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
        ];
        const b = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        const inWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
            return "";
        };

        let str = "";
        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num / 100000) % 100);
        const thousand = Math.floor((num / 1000) % 100);
        const hundred = Math.floor((num / 100) % 10);
        const rest = Math.floor(num % 100);

        if (crore) str += inWords(crore) + " Crore ";
        if (lakh) str += inWords(lakh) + " Lakh ";
        if (thousand) str += inWords(thousand) + " Thousand ";
        if (hundred) str += a[hundred] + " Hundred ";
        if (rest) str += inWords(rest) + " ";

        str = str.trim() + " Rupees Only";

        return isNegative ? "Minus " + str : str;
    };

    // API calls
    const fetchPayslipData = async () => {
        const res = await postData('payslip/payslip_data_by_id', { payslipId: params.payslipid || payId });
        setPayslipData(res.data);
    };

    const fetchPubLicHolidays = async () => {
        const res = await getData('holiday/fetch_public_holidays');
        const count = getPreviousMonthHolidaysCount(res.data);
        setPublicHolidays(count);
    };

    const fetchEmpHolidays = async () => {
        const res = await postData('leave/emp_holiday', { employeeId: payslipData[0].employee_id });
        setLeave(res.data);
    };

    const fetchCount = async () => {
        const res = await postData('leave/pl_count', { employeeId: payslipData[0].employee_id });
        setCountData(res.data);
    };

    const fetchEmpAttendance = async () => {
        const res = await axios.get(`https://campusshala.com:3022/employeeLoginDetail/${payslipData[0].employee_id}`);
        setEmpAttendence(res.data.data);
    };

    function getPreviousMonthAttendanceCount(attendanceList) {
        if (!Array.isArray(attendanceList)) return 0;

        const today = new Date();
        let prevMonth = today.getMonth() - 1;
        let prevYear = today.getFullYear();

        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear -= 1;
        }

        const calculateDayAttendance = (checkin, checkout) => {
            if (!checkin || !checkout) return 0;

            const inTime = new Date(checkin);
            const outTime = new Date(checkout);

            const workedMs = outTime - inTime;
            if (workedMs <= 0) return 0;

            const workedHours = workedMs / (1000 * 60 * 60);
            const day = inTime.getDay();

            if (day >= 1 && day <= 5) {
                if (workedHours < 6) return 0.5;
                return 1;
            }

            return 1;
        };

        return attendanceList.reduce((sum, item) => {
            const d = new Date(item.checkin_date);
            if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) {
                return sum + calculateDayAttendance(item.checkin_date, item.checkout_date);
            }
            return sum;
        }, 0);
    }

    const monthlyLeaveData = useMemo(() => getPreviousMonthData(leave), [leave]);

    const monthlyShortLeave = useMemo(() =>
        monthlyLeaveData
            .filter((l) => l.type_of_leave === "SHORT_LEAVE")
            .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0),
        [monthlyLeaveData]);

    const monthlyHalfDay = useMemo(() =>
        monthlyLeaveData
            .filter((l) => l.type_of_leave === "HD")
            .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0),
        [monthlyLeaveData]);

    const totalSL = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let previousMonth = currentMonth - 1;
        let yearOfPrevMonth = currentYear;

        if (previousMonth < 0) {
            previousMonth = 11;
            yearOfPrevMonth = currentYear - 1;
        }

        return monthlyLeaveData
            .filter(leave => leave.type_of_leave === "SL")
            .reduce((total, leave) => {
                const start = new Date(leave.start_date);
                if (start.getMonth() !== previousMonth || start.getFullYear() !== yearOfPrevMonth) {
                    return total;
                }

                if (leave.value && !isNaN(parseFloat(leave.value))) {
                    return total + parseFloat(leave.value);
                }

                const startDate = new Date(leave.start_date);
                const endDate = new Date(leave.end_date);

                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                const timeDiff = endDate.getTime() - startDate.getTime();
                const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

                return total + diffDays;
            }, 0);
    }, [monthlyLeaveData]);

    const calculateDeductions = useMemo(() => {
        const deductions = {};

        payslipData.forEach(item => {
            const type = item?.type_of_deduction?.toLowerCase();
            const amount = parseFloat(item?.deduction_amt) || 0;

            if (deductions[type]) {
                deductions[type] += amount;
            } else {
                deductions[type] = amount;
            }
        });

        return deductions;
    }, [payslipData])

    // Add this function with your other reusable functions (after calculateTotalLeaves)
    const calculateProrataDays = (joiningDate) => {
        if (!joiningDate) return prevMonthTotalDays;

        const joinDate = new Date(joiningDate);
        const currentDate = new Date();
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);

        // Check if joining date is in previous month
        if (joinDate.getFullYear() === prevMonth.getFullYear() &&
            joinDate.getMonth() === prevMonth.getMonth()) {

            // Calculate days from joining date to end of month
            const daysInMonth = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 0).getDate();
            return daysInMonth - joinDate.getDate() + 1;
        }

        return prevMonthTotalDays;
    };

    // Original formulas preserved
    const prorataDays = calculateProrataDays(payslipData[0]?.anniversary);
    const presentDays = Math.min(getPreviousMonthAttendanceCount(empAttendence), prorataDays);
    const calculateSundayLeaves = (pd = presentDays + (parseFloat(countData[0]?.HD) || 0) +
        (parseFloat(countData[0]?.SHL) || 0) +
        (parseFloat(countData[0]?.SL) || 0)) => {
        let count = 0;
        if (pd <= 15 && pd >= 0) {
            count += 4;
        }
        return count;
    }

    const leaveTaken =
        (parseFloat(countData[0]?.HD) || 0) +
        (parseFloat(countData[0]?.SHL) || 0) +
        (parseFloat(countData[0]?.SL) || 0) + (prorataDays - presentDays - prevMonthSundays - publicHolidays - totalSL - monthlyHalfDay - monthlyShortLeave)
    const balanceLeave = totalLeave - leaveTaken;
    const absentDays = prorataDays - presentDays - prevMonthSundays - publicHolidays - totalSL - monthlyHalfDay - monthlyShortLeave;
    let totalLwp
    let calsun = calculateSundayLeaves(presentDays)
    if (calsun == 4) {
        totalLwp = prevMonthTotalDays - presentDays
    }
    else {
        totalLwp = (balanceLeave < 0 ? (leaveTaken - totalLeave) : 0)
    }
    const lwpAmt = totalLwp * ((parseInt(payslipData[0]?.basic_salary) || 0) + (parseInt(payslipData[0]?.incentive) || 0)) / prorataDays;
    const earningsTotal = ((parseInt(payslipData[0]?.basic_salary || 0) + parseInt(payslipData[0]?.incentive || 0)) * prorataDays / prevMonthTotalDays) || 0;
    const totalDeductions = Object.values(calculateDeductions).reduce((sum, amount) => sum + amount, 0) + lwpAmt;
    const netPay = earningsTotal - totalDeductions

    const thisMonthLeaves = parseFloat(totalSL.toFixed(2) || 0) + parseFloat(monthlyHalfDay.toFixed(2) || 0) + parseFloat(monthlyShortLeave.toFixed(2) || 0) + parseFloat(absentDays || 0)

    const downloadPDF = async () => {
        const element = payslipRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output("blob");
        const file = new File([pdfBlob], "payslip.pdf", { type: "application/pdf" });
        const url = URL.createObjectURL(file);
        window.open(url, "_blank");
    };

    useEffect(() => {
        fetchPayslipData();
        fetchPubLicHolidays();
    }, []);

    // In your useEffect, update how you set totalLeave:
    useEffect(() => {
        if (payslipData.length > 0 && payslipData[0].employee_id) {
            fetchCount();
            fetchEmpHolidays();
            fetchEmpAttendance();
            if (payslipData[0]?.anniversary) {
                const calculatedLeaves = calculateLeavesForPreviousMonth(payslipData[0].anniversary);

                // Add pro-rata adjustment if joined mid-month
                const joinDate = new Date(payslipData[0].anniversary);
                const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1);

                if (joinDate.getFullYear() === prevMonth.getFullYear() &&
                    joinDate.getMonth() === prevMonth.getMonth()) {
                    // Pro-rata the leaves for mid-month join
                    const daysInMonth = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 0).getDate();
                    const daysWorked = daysInMonth - joinDate.getDate() + 1;
                    const prorataFactor = daysWorked / daysInMonth;
                    setTotalLeave(calculatedLeaves * prorataFactor);
                } else {
                    setTotalLeave(calculatedLeaves);
                }
            }
        }
    }, [payslipData]);

    return (
        <>
            {payslipData && <AutoPayslipGenerator
                payslipRef={payslipRef}
                employeeId={payslipData[0]?.employee_id}
                payslipDate={payslipData[0]?.date_of_payslip}
                payId={params.payslipid}
            />}

            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '90vh' }}>
                <div ref={payslipRef} style={{
                    width: '210mm',
                    minHeight: 450,
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    padding: 20,
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',
                    lineHeight: '1.3',
                    boxSizing: 'border-box',
                    border: '1px solid #000'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: '2px solid #000'
                    }}>
                        <div>
                            <h1 style={{
                                margin: '0 0 4px 0',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>PAYSLIP</h1>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Numeric Infoysis PS Softech</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Payslip ID: {params.payslipid || payId}</div>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>For Month: {currentMonthYear}</div>
                            <div style={{ fontSize: '11px', marginTop: '2px' }}>Branch: Gwalior</div>
                        </div>
                    </div>

                    {/* Employee Details */}
                    <table style={{
                        width: '100%',
                        marginBottom: '12px',
                        fontSize: '11px',
                        borderCollapse: 'collapse',
                        border: '1px solid #000'
                    }}>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <td style={{
                                    padding: '6px 8px',
                                    width: '15%',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000'
                                }}>Emp Code</td>
                                <td style={{ padding: '6px 8px', width: '18%' }}>{payslipData[0]?.employee_id}</td>
                                <td style={{
                                    padding: '6px 8px',
                                    width: '17%',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>Employee Name</td>
                                <td style={{ padding: '6px 8px', width: '17%' }}>{payslipData[0]?.name}</td>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>Joining Date</td>
                                <td style={{ padding: '6px 8px' }}>{payslipData[0]?.anniversary}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000'
                                }}>Grade</td>
                                <td style={{ padding: '6px 8px' }}>Lateral</td>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>Department</td>
                                <td style={{ padding: '6px 8px' }}>HR</td>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>Designation</td>
                                <td style={{ padding: '6px 8px' }}>{payslipData[0]?.designation}</td>
                            </tr>
                            <tr>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000'
                                }}>ESIC No</td>
                                <td style={{ padding: '6px 8px' }}></td>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>PF No</td>
                                <td style={{ padding: '6px 8px' }}></td>
                                <td style={{
                                    padding: '6px 8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f0f0',
                                    borderRight: '1px solid #000',
                                    borderLeft: '1px solid #000'
                                }}>Division</td>
                                <td style={{ padding: '6px 8px' }}></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Attendance Summary - OPTIONAL (commented out in original) */}
                    {/* <table style={{ 
                        width: '100%', 
                        marginBottom: '12px', 
                        fontSize: '10px', 
                        borderCollapse: 'collapse', 
                        border: '1px solid #000' 
                    }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '4px 6px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Month Days</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{prevMonthTotalDays.toFixed(2)}</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Days Present</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{presentDays.toFixed(2)}</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>W.Off/Pd.Off</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{prevMonthSundays.toFixed(2)} / {publicHolidays.toFixed(2)}</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Total Yearly Leave</td>
                                <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{totalLeave.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table> */}

                    {/* Earnings and Deductions */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '15px'
                    }}>
                        {/* Earnings Table */}
                        <div style={{ flex: 1 }}>
                            <table style={{
                                width: '100%',
                                fontSize: '11px',
                                borderCollapse: 'collapse',
                                border: '1px solid #000'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            backgroundColor: '#e0e0e0',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '12px'
                                        }}>Earnings</th>
                                        <th style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            backgroundColor: '#e0e0e0',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            width: '35%'
                                        }}>Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>Basic</td>
                                        <td style={{
                                            padding: '6px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: '500'
                                        }}>{formatCurrency(payslipData[0]?.basic_salary - payslipData[0]?.hra - payslipData[0]?.da - payslipData[0]?.cca)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>H.R.A</td>
                                        <td style={{
                                            padding: '6px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: '500'
                                        }}>{formatCurrency(payslipData[0]?.hra)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>D.A</td>
                                        <td style={{
                                            padding: '6px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: '500'
                                        }}>{formatCurrency(payslipData[0]?.da)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>Transportation Allowance</td>
                                        <td style={{
                                            padding: '6px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: '500'
                                        }}>{payslipData[0]?.cca || '0.00'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>Incentive</td>
                                        <td style={{
                                            padding: '6px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: '500'
                                        }}>{formatCurrency(payslipData[0]?.incentive)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f0f0f0',
                                            fontSize: '12px'
                                        }}>Total Earnings:</td>
                                        <td style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f0f0f0',
                                            fontSize: '12px'
                                        }}>₹{formatCurrency(earningsTotal)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Deductions Table */}
                        <div style={{ flex: 1 }}>
                            <table style={{
                                width: '100%',
                                fontSize: '11px',
                                borderCollapse: 'collapse',
                                border: '1px solid #000'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            backgroundColor: '#e0e0e0',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '12px'
                                        }}>Deductions & Recoveries</th>
                                        <th style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            backgroundColor: '#e0e0e0',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            width: '35%'
                                        }}>Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const availableDeductions = Object.entries(calculateDeductions)
                                            .filter(([type, amount]) => amount > 0)
                                            .map(([type, amount]) => ({
                                                type: type,
                                                name: type.charAt(0).toUpperCase() + type.slice(1),
                                                amount: amount
                                            }));

                                        const rows = [];

                                        availableDeductions.forEach((deduction, index) => {
                                            if (index < 4) {
                                                rows.push(
                                                    <tr key={deduction.type}>
                                                        <td style={{ padding: '6px 6px', border: '1px solid #000' }}>{deduction.name}</td>
                                                        <td style={{
                                                            padding: '6px 6px',
                                                            border: '1px solid #000',
                                                            textAlign: 'right',
                                                            fontWeight: '500',
                                                            color: '#000'
                                                        }}>- {formatCurrency(deduction.amount)}</td>
                                                    </tr>
                                                );
                                            }
                                        });

                                        rows.push(
                                            <tr key="lwp">
                                                <td style={{ padding: '6px 6px', border: '1px solid #000' }}>Absentees / Short Hours</td>
                                                <td style={{
                                                    padding: '6px 6px',
                                                    border: '1px solid #000',
                                                    textAlign: 'right',
                                                    fontWeight: '500',
                                                    color: '#000'
                                                }}>- {lwpAmt.toFixed(2)}</td>
                                            </tr>
                                        );

                                        for (let i = availableDeductions.length; i < 4; i++) {
                                            rows.push(
                                                <tr key={`empty-${i}`}>
                                                    <td style={{ padding: '6px 6px', border: '1px solid #000' }}>&nbsp;</td>
                                                    <td style={{ padding: '6px 6px', border: '1px solid #000', textAlign: 'right' }}>&nbsp;</td>
                                                </tr>
                                            );
                                        }

                                        return rows;
                                    })()}
                                    <tr>
                                        <td style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f0f0f0',
                                            fontSize: '12px'
                                        }}>Total Deductions:</td>
                                        <td style={{
                                            padding: '8px 6px',
                                            border: '1px solid #000',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f0f0f0',
                                            fontSize: '12px',
                                            color: '#000'
                                        }}>- ₹{formatCurrency(totalDeductions)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Net Pay Section */}
                    <div style={{
                        marginBottom: '15px',
                        padding: '12px',
                        border: '2px solid #000',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                Net Pay Amount:
                                <span style={{
                                    fontSize: '16px',
                                    marginLeft: '10px',
                                    color: '#000'
                                }}>₹{formatCurrency(netPay)}</span>
                            </div>

                        </div>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            paddingTop: '6px',
                            borderTop: '1px dashed #ccc'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>In Words:</div>
                            <div>{numberToWords(netPay) || `-`}</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        fontSize: '11px',
                        paddingTop: '15px',
                        borderTop: '1px solid #000',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                            Numeric Infoysis PS Softech
                        </div>
                        <div>This is a computer generated payslip and does not require signature</div>
                    </div>
                </div>
                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    marginBottom: '40px'
                }}>
                    <button
                        onClick={downloadPDF}
                        style={{
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        Download Payslip (PDF)
                    </button>
                </div>
            </div>
        </>
    );
}