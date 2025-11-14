var express = require("express");
const pool = require("./pool");
const eldController = require("./controller/employeeLoginDetail.controller");
var router = express.Router();

router.post("/", function (req, res) {
  req.body.current_status = "Active";
  pool.query(
    "insert into emp_login_details set ?",
    req.body,
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res
          .status(200)
          .json({ status: true, message: "Data inserted successfully" });
      }
    }
  );
});

router.get("/", function (req, res) {
  if (req.query.date) {
    req.body.date = req.query.date;
  } else {
    req.body.date = new Date();
  }
  let str = "";
  pool.query(
    "select ED.*,(select E.name from employees E where E.employee_id=ED.employee_id) as ename from emp_login_details ED where date(checkin_date)=date(?)" +
      str,
    [req.body.date],
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res.status(200).json({
          status: true,
          message: "Data found successfully",
          data: result,
        });
      }
    }
  );
});

router.put("/:eld_id", function (req, res) {
  if (req.body.checkout_date) {
    req.body.current_status = "Logout";
  }
  pool.query(
    "update emp_login_details set ? where eld_id=?",
    [req.body, req.params.eld_id],
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res
          .status(200)
          .json({ status: true, message: "Data updated successfully" });
      }
    }
  );
});

router.get("/pendingapproval", eldController.pendingApproval);

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

module.exports = router;
