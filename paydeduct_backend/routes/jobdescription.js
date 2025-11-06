var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.post('/insert_jobdescription', function (req, res, next) {
    try {
        console.log(req.body);
        pool.query("insert into job_description (company_id, job_title, job_location, lpa, exp_min, exp_max, job_des) values(?,?,?,?,?,?,?)", [req.body.company_id, req.body.job_title, req.body.job_location, req.body.lpa, req.body.exp_min, req.body.exp_max, req.body.job_des], function (error, result) {
            if (error) {
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

router.get('/fetch_jobdescription', function (req, res, next) {
    try {
        pool.query('select C.*,J.* from company C,job_description J where C.company_id=J.company_id', function (error, result) {
            if (error) {
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

router.post('/edit_jobdescription', function (req, res, next) {
    try {
        pool.query("update job_description set company_id=?, job_title=?, job_location=?, lpa=?, exp_min=?, exp_max=?, job_des=? where job_id=?", [req.body.company_id, req.body.job_title, req.body.job_location, req.body.lpa, req.body.exp_min, req.body.exp_max, req.body.job_des, req.body.job_id], function (error, result) {
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

router.post('/delete_jobdescription', function (req, res, next) {
    try {
        pool.query("delete from job_description where job_id=?", [req.body.job_id], function (error, result) {
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