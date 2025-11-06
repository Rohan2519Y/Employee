var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.post('/insert_manager', function (req, res, next) {
    try {
        pool.query("insert into managers (company_id, job_id, managername, emailid, mobileno, oth_contact_no) values(?,?,?,?,?,?)", [req.body.company_id, req.body.job_id, req.body.managername, req.body.emailid, req.body.mobileno, req.body.oth_contact_no], function (error, result) {
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

router.get('/fetch_mangers', function (req, res, next) {
    try {
        pool.query('select C.*,JD.*,M.* from company C,job_description JD,managers M where C.company_id=JD.company_id and C.company_id=JD.company_id', function (error, result) {
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

router.post('/fetch_jobdescription_by_id', function (req, res, next) {
    try {
        pool.query('select C.*,J.* from company C,job_description J where C.company_id=J.company_id and C.company_id=?', [req.body.company_id], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Success..', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
})

router.post('/edit_manager', function (req, res, next) {
    try {
        pool.query("update managers set company_id=?, job_id=?, managername=?, emailid=?, mobileno=?, oth_contact_no=? where manager_id=?", [req.body.company_id, req.body.job_id, req.body.managername, req.body.emailid, req.body.mobileno, req.body.oth_contact_no, req.body.manager_id], function (error, result) {
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

router.post('/delete_manager', function (req, res, next) {
    try {
        pool.query("delete from managers where manager_id=?", [req.body.manager_id], function (error, result) {
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

module.exports = router