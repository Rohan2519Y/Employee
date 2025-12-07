var express = require('express');
var router = express.Router();
var pool = require('./pool');
var upload = require('./multer')

router.post('/chk_admin_login', function (req, res, next) {
    pool.query("select * from employees where (emailid=? or mobileno=?) and password=?", [req.body.phone, req.body.phone, req.body.password], function (error, result) {
        if (error) {
            console.log(error)
            res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
        }
        else {
            if (result.length == 1)
                res.status(200).json({ status: true, message: 'Login Successful', data: result })
            else
                res.status(202).json({ status: false, message: 'Invalid Emailid/Mobileno/Password' })
        }
    })
});

router.post('/fetch_empid', function (req, res, next) {
    try {
        pool.query("select * from employees where (emailid=? or mobileno=?) and password=?", [req.body.emailid, req.body.emailid, req.body.password], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Login Successful', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error' })
    }
});

router.post('/fetch_emp_by_id', function (req, res, next) {
    try {
        pool.query("select * from employees where employee_id=?", [req.body.empid], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Login Successful', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error' })
    }
});

router.post('/fetch_empattendence_by_id', function (req, res, next) {
    try {
        const { empid, filterType } = req.body;

        let query = "SELECT * FROM emp_login_details WHERE employee_id = ?";
        let params = [empid];

        // THIS MONTH
        if (filterType === "thisMonth") {
            query += `
                AND MONTH(checkin_date) = MONTH(CURRENT_DATE)
                AND YEAR(checkin_date) = YEAR(CURRENT_DATE)
            `;
        }

        // PREVIOUS MONTH
        else if (filterType === "previousMonth") {
            query += `
                AND MONTH(checkin_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
                AND YEAR(checkin_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
            `;
        }

        pool.query(query, params, function (error, result) {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    status: false,
                    message: "Database Error, Please contact backend team"
                });
            }

            res.status(200).json({
                status: true,
                message: "Attendance fetched successfully",
                data: result
            });
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            status: false,
            message: "Critical Error"
        });
    }
});


router.post('/fetch_emp_assign', function (req, res, next) {
    try {
        pool.query("select C.*,JD.*,JA.*,E.* from company C,job_description JD,job_assign JA,employees E where C.company_id=JD.company_id and JD.job_id=JA.job_id and JA.employee_id=E.employee_id and E.employee_id=?", [req.body.empid], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Login Successful', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error' })
    }
});


module.exports = router