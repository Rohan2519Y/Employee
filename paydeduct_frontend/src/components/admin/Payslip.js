import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getData, postData } from '../../backendservices/FetchNodeServices';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios, { Axios } from 'axios';

export default function Payslip() {

    const params = useParams()
    const payslipRef = useRef();
    const [payslipData, setPayslipData] = useState([])
    const [countData, setCountData] = useState([])
    const [publicHolidays, setPublicHolidays] = useState(0);
    const [empAttendence, setEmpAttendence] = useState([]);
    const [balanceLeave, setBalanceLeave] = useState({ EL: 0, SL: 0 });

    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "0.00";
        return num.toFixed(2);
    };

    const currentDate = new Date();
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth();
    const monthName = prevMonth.toLocaleString("default", { month: "short" });
    const currentMonthYear = `${monthName} - ${year}`;

    const fetchPayslipData = async () => {
        const res = await postData('payslip/payslip_data_by_id', { payslipId: params.payslipid })
        setPayslipData(res.data)
    }

    const fetchPubLicHolidays = async () => {
        const res = await getData('holiday/fetch_public_holidays')
        const count = getPreviousMonthHolidaysCount(res.data);
        setPublicHolidays(count)
    }
    const [leave, setLeave] = useState([])
    const fetchEmpHolidays = async () => {
        const res = await postData('leave/emp_holiday', { employeeId: payslipData[0].employee_id })
        setLeave(res.data)
        getPreviousMonthData(res.data)
    }

    function getPreviousMonthData(leaves) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Compute previous month and year
        let previousMonth = currentMonth - 1;
        let yearOfPrevMonth = currentYear;
        if (previousMonth < 0) {
            previousMonth = 11;
            yearOfPrevMonth = currentYear - 1;
        }

        // Filter data where start_date or end_date is in the previous month
        const filtered = leaves.filter((leave) => {
            const startDate = new Date(leave.start_date);
            const month = startDate.getMonth();
            const year = startDate.getFullYear();

            return month === previousMonth && year === yearOfPrevMonth;
        });
        return filtered;
    }

    const monthlyShortLeave = getPreviousMonthData(leave)
        .filter((l) => l.type_of_leave === "SHORT_LEAVE")
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

    const monthlyHalfDay = getPreviousMonthData(leave)
        .filter((l) => l.type_of_leave === "HD")
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

    const totalSL = getPreviousMonthData(leave)
        .filter(l => l.type_of_leave === "SL")
        .reduce((a, b) => a + (parseFloat(b.value) || ((new Date(b.end_date) - new Date(b.start_date)) / (1000 * 60 * 60 * 24) + 1)), 0);

    const getPreviousMonthHolidaysCount = (holidaysData) => {
        const now = new Date();
        const prevMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
        const year = prevMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();

        let totalDays = 0;

        holidaysData.forEach((holiday) => {
            let from = new Date(holiday.date_from);
            let to = new Date(holiday.date_to);

            // ✅ Fix swapped dates
            if (from > to) {
                const temp = from;
                from = to;
                to = temp;
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

    const fetchCount = async () => {
        const res = await postData('leave/pl_count', { employeeId: payslipData[0].employee_id });
        setCountData(res.data);
        const totalSL = 20;
        const usedSL = res.data[0]?.SL || 0;

        setBalanceLeave({
            SL: totalSL - usedSL
        });
    };

    const fetchEmpAttendance = async () => {
        const res = await axios.get(`https://campusshala.com:3022/employeeLoginDetail/19`)
        setEmpAttendence(res.data.data)
    }

    useEffect(() => {
        fetchEmpAttendance()
    }, [])

    const getPrevMonthPresentDays = (attendance, referenceDate = new Date()) => {
        // Determine previous month and year
        let month = referenceDate.getMonth() - 1;
        let year = referenceDate.getFullYear();
        if (month < 0) {
            month = 11;
            year -= 1;
        }

        // Filter records from previous month
        const filtered = attendance.filter((record) => {
            const date = new Date(record.checkin_date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        // Get unique days (avoid counting multiple check-ins in one day)
        const uniqueDays = new Set(filtered.map((r) => new Date(r.checkin_date).getDate()));

        return uniqueDays.size;
    };

    const totalLeave = 20
    const takenLeave = parseInt(countData[0]?.SL) + parseFloat(countData[0]?.SHL) + parseFloat(countData[0]?.HD)

    const numberToWords = (num) => {
        if (!num || isNaN(num)) return "";
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

        if (num === 0) return "Zero Rupees Only";

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

        // ✅ Added a space before "Rupees Only"
        return str.trim() + " Rupees Only";
    };

    useEffect(() => {
        fetchPayslipData();
        fetchPubLicHolidays()
    }, []);

    useEffect(() => {
        if (payslipData.length > 0 && payslipData[0].employee_id) {
            fetchCount();
            fetchEmpHolidays();
        }
    }, [payslipData]);

    const netPay =
        parseInt(payslipData[0]?.hra || 0) +
        parseInt(payslipData[0]?.da || 0) +
        parseInt(payslipData[0]?.basic_salary || 0) - parseInt(payslipData[0]?.deduction_amt)

    const downloadPDF = async () => {
        const element = payslipRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // ✅ Instead of saving directly, open in new tab for preview
        const pdfBlobUrl = pdf.output("bloburl");
        window.open(pdfBlobUrl, "_blank");
    };


    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div ref={payslipRef} style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#ffffff', border: '2px solid #000', padding: '30px', fontFamily: 'Arial, sans-serif' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #000' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>PaySlip {payslipData[0]?.payslip_id}</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '3px' }}>Payslip for the month {currentMonthYear}</div>
                        <div style={{ fontSize: '13px' }}>Branch Gwalior</div>
                    </div>
                </div>

                {/* Employee Info Grid */}
                <table style={{ width: '100%', marginBottom: '15px', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '5px 8px', width: '15%', fontWeight: 'bold' }}>Emp Code</td>
                            <td style={{ padding: '5px 8px', width: '18%' }}>{payslipData[0]?.employee_id}</td>
                            <td style={{ padding: '5px 8px', width: '17%', fontWeight: 'bold' }}>Employee Name</td>
                            <td style={{ padding: '5px 8px', width: '17%' }}>{payslipData[0]?.name}</td>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>Joining Date</td>
                            <td style={{ padding: '5px 8px' }}>{payslipData[0]?.anniversary}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>Grade</td>
                            <td style={{ padding: '5px 8px' }}>Lateral</td>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>Department</td>
                            <td style={{ padding: '5px 8px' }}>Non IT</td>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>Designation</td>
                            <td style={{ padding: '5px 8px' }}>{payslipData[0]?.designation}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>ESIC No</td>
                            <td style={{ padding: '5px 8px' }}></td>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>PF No</td>
                            <td style={{ padding: '5px 8px' }}></td>
                            <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>Division</td>
                            <td style={{ padding: '5px 8px' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Attendance Section */}
                <table style={{ width: '100%', marginBottom: '15px', fontSize: '11px', borderCollapse: 'collapse', border: '1px solid #000' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Days Paid</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate().toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Days Present</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>
                                {(new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate().toFixed(2)) -
                                    (Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) =>
                                        new Date(new Date().getFullYear(), new Date().getMonth(), i + 1)
                                    ).filter(d => d.getDay() === 0).length) - (publicHolidays.toFixed(2)) - totalSL - monthlyShortLeave.toFixed(2) - monthlyHalfDay.toFixed(2) - ((new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate().toFixed(2)) - getPrevMonthPresentDays(empAttendence))}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>W.Off/Pd.Off</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{
                                Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) =>
                                    new Date(new Date().getFullYear(), new Date().getMonth(), i + 1)
                                ).filter(d => d.getDay() === 0).length
                            } / {publicHolidays.toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Total Leave</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{totalLeave}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>LWP/Absent</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>0.00 / {(new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate().toFixed(2)) - getPrevMonthPresentDays(empAttendence) - (Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) =>
                                new Date(new Date().getFullYear(), new Date().getMonth(), i + 1)
                            ).filter(d => d.getDay() === 0).length) - publicHolidays.toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>This Month Sick / Casual Leave</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{totalSL || 0}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>This Short Leave / Half day</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{monthlyShortLeave.toFixed(2) || 0} / {monthlyHalfDay.toFixed(2) || 0}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Leave Taken</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{((parseFloat(countData[0]?.HD) || 0) + (parseFloat(countData[0]?.SHL) || 0) + (parseFloat(totalSL) || 0)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Bal. LWP</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>0</td>
                            <td colSpan={2} style={{ padding: '5px 0px 5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Bal. Half Day / Sick / Casual / Short Leave</td>
                            <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #000' }}>{(totalLeave - ((parseFloat(countData[0]?.HD) || 0) + (parseFloat(countData[0]?.SHL) || 0) + (parseFloat(totalSL) || 0))).toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Bal. Leave</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #000' }}>{(totalLeave - ((parseFloat(countData[0]?.HD) || 0) + (parseFloat(countData[0]?.SHL) || 0) + (parseFloat(totalSL) || 0))).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Earnings and Deductions */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    {/* Earnings */}
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', border: '2px solid #000' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#e0e0e0', textAlign: 'left', fontWeight: 'bold' }}>Earnings</th>
                                    <th style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#e0e0e0', textAlign: 'right', fontWeight: 'bold', width: '35%' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>H.R.A</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(payslipData[0]?.hra)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>D.A</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(payslipData[0]?.da)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>Basic</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(payslipData[0]?.basic_salary)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>C.C.A</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>{payslipData[0]?.cca}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Amount Total :</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>{formatCurrency(parseInt(payslipData[0]?.hra) + parseInt(payslipData[0]?.da) + parseInt(payslipData[0]?.basic_salary))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Deductions */}
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', border: '2px solid #000' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#e0e0e0', textAlign: 'left', fontWeight: 'bold' }}>Deductions & Recoveries</th>
                                    <th style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#e0e0e0', textAlign: 'right', fontWeight: 'bold', width: '35%' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>{payslipData[0]?.type_of_deduction}</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(payslipData[0]?.deduction_amt)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>&nbsp;</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>&nbsp;</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>&nbsp;</td>
                                    <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Amount Total :</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>{formatCurrency(payslipData[0]?.deduction_amt)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Net Pay */}
                <div style={{ marginBottom: '20px', fontSize: '13px', padding: '10px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Net Pay : {formatCurrency((parseInt(payslipData[0]?.hra) + parseInt(payslipData[0]?.da) + parseInt(payslipData[0]?.basic_salary)) - payslipData[0]?.deduction_amt)}</div>
                    <div style={{ fontWeight: 'bold' }}>Net Pay : {numberToWords(netPay)}</div>
                </div>

                {/* Footer */}
                <div style={{ fontSize: '12px', paddingTop: '15px', borderTop: '1px solid #000' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Skillventory</div>
                    <div>Numeric Infoysis PS Softech</div>
                </div>
            </div>
            <button
                onClick={downloadPDF}
                style={{
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginLeft: 1130
                }}
            >
                Download Payslip
            </button>
        </div>
    );
}