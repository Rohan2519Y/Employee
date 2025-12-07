var express = require("express");
const pool = require("./pool");
var router = express.Router();

router.post("/leave", function (req, res) {
    const {
        employee_id,
        type_of_leave,
        start_date,
        end_date,
        reason,
        status,
        value,
        total_duration,
        work_handover,
        work_handover_details,
    } = req.body;

    console.log(req.body);

    pool.query(
        "INSERT INTO emp_leave (employee_id, type_of_leave, start_date, end_date, reason,status,value,total_duration, work_handover, work_handover_details) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [
            employee_id,
            type_of_leave,
            start_date,
            end_date,
            reason,
            status,
            value,
            total_duration,
            work_handover,
            work_handover_details,
        ],
        function (error, result) {
            if (error) {
                console.log(error);
                res.status(500).json({ status: false, message: error.sqlMessage });
            } else {
                console.log(result);
                res
                    .status(200)
                    .json({ status: true, message: "Data inserted successfully" });
            }
        }
    );
});

module.exports = router;