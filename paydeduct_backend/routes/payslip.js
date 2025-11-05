var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.get('/employee_data', function (req, res, next) {
    try {
        pool.query("select * from employees", function (error, result) {
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

router.get('/fetch_all_payslips', function (req, res, next) {
    try {
        pool.query("SELECT P.*,E.* FROM payslip P, employees E where E.employee_id=P.employee_id", function (error, result) {
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

router.post('/payslip_data_by_id', function (req, res, next) {
    try {
        pool.query("SELECT P.*,D.*,E.* FROM payslip P, deduction D, employees E where P.payslip_id=D.payslip_id and E.employee_id=P.employee_id and P.payslip_id=?", [req.body.payslipId], function (error, result) {
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

router.post('/employee_data_by_id', function (req, res, next) {
    try {
        pool.query("select * from payslip_date where employee_id=?", [req.body.employeeId], function (error, result) {
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

router.post('/insert_payslip', function (req, res, next) {
    try {
        pool.query("insert into payslip (employee_id, date_of_payslip, basic_salary, da, hra, cca) values(?,?,?,?,?,?)", [req.body.employee_id, req.body.date_of_payslip, req.body.basic_salary, req.body.da, req.body.hra, req.body.cca], function (error, result) {
            if (error) {
                res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                console.log(result)
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..', data: result.insertId })
            }
        })
    }
    catch (e) {
        res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/edit_payslip', function (req, res, next) {
    try {
        pool.query("update payslip set date_of_payslip=?, basic_salary=?, da=?, hra=?, cca=? where payslip_id=?", [req.body.date_of_payslip, req.body.basic_salary, req.body.da, req.body.hra, req.body.cca, req.body.payslip_id], function (error, result) {
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

router.post('/delete_payslip', function (req, res, next) {
    try {
        pool.query("delete from payslip where payslip_id=?", [req.body.payslip_id], function (error, result) {
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