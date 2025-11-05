var express = require('express');
var router = express.Router();
var pool = require('./pool');
var upload = require('./multer')

router.post('/insert_jobassign', function (req, res, next) {
    try {
        pool.query("insert into job_assign (company_id, job_id, employee_id, assign_date, statuses, remove_date, manager_status) values(?,?,?,?,?,?,?)", [req.body.company_id, req.body.job_id, req.body.employee_id, req.body.assign_date, req.body.statuses, req.body.remove_date, req.body.manager_status], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..' })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.get('/fetch_jobassign', function (req, res, next) {
    try {
        pool.query('select C.*,JD.*,JA.* from company C,job_description JD,job_assign JA where C.company_id=JD.company_id and JD.job_id=JA.job_id', function (error, result) {
            if (error) {
                console.log(error)
                res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Success..', data: result })
            }
        })
    }
    catch (e) {
        res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
})

router.post('/edit_jobassign', function (req, res, next) {
    try {
        pool.query("update job_assign set company_id=?, job_id=?, employee_id=?, assign_date=?, statuses=?, remove_date=?, manager_status=? where job_assign_id=?", [req.body.company_id, req.body.job_id, req.body.employee_id, req.body.assign_date, req.body.statuses, req.body.remove_date, req.body.manager_status, req.body.job_assign_id], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Services Successfully Submitted..' })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});

router.post('/delete_jobdescription', function (req, res, next) {
    try {
        pool.query("delete from job_assign where job_assign_id=?", [req.body.job_assign_id], function (error, result) {
            if (error) {
                console.log(error)
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