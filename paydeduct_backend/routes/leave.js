var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.post('/pl_count', function (req, res, next) {
    try {
        pool.query(`SELECT 
                    E.employee_id,
                    SUM(CASE WHEN EL.type_of_leave = 'SL' THEN 1 ELSE 0 END) AS SL,
                    SUM(CASE WHEN EL.type_of_leave = 'SHORT_LEAVE' THEN EL.value ELSE 0 END) AS SHL,
                    SUM(CASE WHEN EL.type_of_leave = 'HD' THEN EL.value ELSE 0 END) AS HD,
                    EL.start_date,
                    EL.end_date
                    FROM employees E
                    INNER JOIN emp_leave EL ON E.employee_id = EL.employee_id
                    WHERE E.employee_id = ?
                    GROUP BY E.employee_id`, [req.body.employeeId], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Data Fetched', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/emp_holiday', function (req, res, next) {
    try {
        pool.query('Select * from emp_leave where employee_id=?', [req.body.employeeId], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Data Fetched', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error, Pls Contact Server Administrator' })
    }
})
module.exports = router