var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.get('/fetch_all_deductions', function (req, res, next) {
    try {
        pool.query("select D.*,P.*,E.* from payslip P,deduction D,employees E where D.payslip_id=P.payslip_id and E.employee_id=P.employee_id", function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/edit_deduction', function (req, res, next) {
    try {
        console.log(req.body)
        pool.query("update deduction set payslip_id=?, date=?, type_of_deduction=?, deduction_amt=?, remark=? where deduction_id=?", [req.body.payslip_id, req.body.date, req.body.type_of_deduction, req.body.deduction_amt, req.body.remark, req.body.deduction_id], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/payslip_data', function (req, res, next) {
    try {
        pool.query("select PD.*,E.* from payslip_date PD,employees E where PD.employee_id=E.employee_id and PD.employee_id=?", [req.body.empid], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/payslip_data_by_id', function (req, res, next) {
    try {
        pool.query("select P.*,PD.* from payslip P,payslip_date PD where P.employee_id=PD.employee_id and payslip_id=?", [req.body.payslipId], function (error, result) {
            if (error) {
                res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', data: result })
            }
        })
    }
    catch (e) {
        res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/insert_deduction', function (req, res, next) {
    try {
        pool.query("insert into deduction (payslip_id, date, type_of_deduction, deduction_amt, remark) values(?,?,?,?,?)", [req.body.payslip_id, req.body.date_of_payslip, req.body.deduction_type, req.body.deduction_amount, req.body.remark], function (error, result) {
            if (error) {
                console.log(error)
                res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', data: result.insertId })
            }
        })
    }
    catch (e) {
        res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/delete_deduction', function (req, res, next) {
    try {
        pool.query("delete from deduction where deduction_id=?", [req.body.deduction_id], function (error, result) {
            if (error) {
                res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', })
            }
        })
    }
    catch (e) {
        res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

module.exports = router