var express = require("express");
const pool = require("./pool");
var router = express.Router();

router.post("/", function (req, res) {
  pool.query("insert into employees set ?", req.body, function (error, result) {
    if (error) {
      res.status(500).json({ status: false, message: error.sqlMessage });
    } else {
      res
        .status(200)
        .json({ status: true, message: "Data inserted successfully" });
    }
  });
});

router.get("/", function (req, res) {
  pool.query("SELECT E.* FROM employees E", function (error, result) {
    if (error) {
      res.status(500).json({ status: false, message: error.sqlMessage });
    } else {
      res.status(200).json({
        status: true,
        message: "Data found successfully",
        data: result,
      });
    }
  });
});

router.get("/:employee_id", function (req, res) {
  pool.query(
    "SELECT E.* FROM employees E where E.employee_id=?",
    [req.params.employee_id],
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res.status(200).json({
          status: true,
          message: "Data found successfully",
          data: result[0],
        });
      }
    }
  );
});

router.put("/:employee_id", function (req, res) {
  pool.query(
    "update employees set ? where employee_id=?",
    [req.body, req.params.employee_id],
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res.status(200).json({
          status: true,
          message: "Data updated successfully",
        });
      }
    }
  );
});

router.delete("/:employee_id", function (req, res) {
  pool.query(
    "delete from employees where employee_id=?",
    [req.params.employee_id],
    function (error, result) {
      if (error) {
        res.status(500).json({ status: false, message: error.sqlMessage });
      } else {
        res.status(200).json({
          status: true,
          message: "Data deleted successfully",
        });
      }
    }
  );
});

router.post("/login", function (req, res) {
  pool.query(
    "select E.* from employees E where (E.emailid=? or E.mobileno=?) and E.password=? and E.status=1",
    [req.body.email, req.body.email, req.body.password],
    function (err, result) {
      if (err) {
        res.status(500).json({ status: false, message: err.sqlMessage });
      } else {
        if (result.length > 0) {
          res.status(200).json({
            status: true,
            message: "Data found successfully",
            data: result[0],
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Invalid Email/Password",
          });
        }
      }
    }
  );
});

router.post("/changepassword", function (req, res) {
  pool.query(
    "select E.* from employees E where E.employee_id=? and E.password=? and E.status=1",
    [req.body.employeeid, req.body.oldpassword],
    function (err, result) {
      if (err) {
        res.status(500).json({ status: false, message: err.sqlMessage });
      } else {
        if (result.length > 0) {
          pool.query(
            "update employees set password=? where employee_id=?",
            [req.body.newpassword, req.body.employeeid],
            function (error, response) {
              if (error) {
                res
                  .status(500)
                  .json({ status: false, message: error.sqlMessage });
              } else {
                res.status(200).json({
                  status: true,
                  message: "Password Updated successfully",
                });
              }
            }
          );
        } else {
          res.status(200).json({
            status: false,
            message: "Old password is incorrect",
          });
        }
      }
    }
  );
});

module.exports = router;