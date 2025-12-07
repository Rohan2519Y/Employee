import React, { useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { postData } from "../../backendservices/FetchNodeServices";

const AutoPayslipGenerator = ({ payslipRef, employeeId, payslipDate, payId }) => {

    useEffect(() => {
        if (payslipRef.current && employeeId && payslipDate && payId) {
            setTimeout(() => {
                generateAndUploadPDF();
            }, 2000);
        }
    }, [payslipRef, payslipDate, employeeId, payId]);

    const generateAndUploadPDF = async () => {
        const element = payslipRef.current;

        // Build dynamic filename
        const fileName = `Numeric Infosystem Private Limited ${employeeId} ${payslipDate} Payslip.pdf`;

        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output("blob");

        // ---------------------------
        // 1️⃣ Auto Download with custom name
        // ---------------------------
        // const downloadUrl = URL.createObjectURL(pdfBlob);
        // const link = document.createElement("a");
        // link.href = downloadUrl;
        // link.download = fileName;
        // link.click();
        // URL.revokeObjectURL(downloadUrl);

        // ---------------------------
        // 2️⃣ Upload PDF to backend
        // ---------------------------
        const formData = new FormData();
        formData.append('payid', payId)
        formData.append('pdf', pdfBlob, fileName);

        const res = await postData('payslip/insert_payslip_pdf', formData)
    };

    return null;
};

export default AutoPayslipGenerator;