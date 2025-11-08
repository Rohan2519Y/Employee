var express = require('express')
var router = express.Router();
var pool = require('./pool');

router.get('/fetch_public_holidays', function (req, res, next) {
    try {
        pool.query('select * from calender', function (error, result) {
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

router.get("/:employee_id", function (req, res) {
    let condition = [],
        str = "";
    if (req.query.date) {
        condition.push(`date(checkin_date)=date('${req.query.date}')`);
    }
    if (req.query.startdate) {
        condition.push(`date(checkin_date)>=date('${req.query.startdate}')`);
    }
    if (req.query.enddate) {
        condition.push(`date(checkin_date)<=date('${req.query.enddate}')`);
    }
    if (req.query.startdate || req.query.enddate || req.query.date) {
        str = " and " + condition.join(" and ");
    }
    pool.query(
        "select * from emp_login_details where (employee_id=?)" +
        str +
        " order by date(checkin_date)",
        [req.params.employee_id],
        function (error, result) {
            if (error) {
                res.status(500).json({ status: false, message: error.sqlMessage });
            } else {
                if (req.query.date) {
                    if (result.length > 0) {
                        res.status(200).json({
                            status: true,
                            message: "Data found successfully",
                            data: result[0],
                        });
                    } else {
                        res.status(200).json({
                            status: false,
                            message: "Not loggedin yet",
                        });
                    }
                } else {
                    res.status(200).json({
                        status: true,
                        message: "Data found successfully",
                        data: result,
                    });
                }
            }
        }
    );
});

module.exports = router