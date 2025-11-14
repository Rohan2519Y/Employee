var express = require("express");
const pool = require("./pool");
var router = express.Router();

router.post("/", function (req, res) {
  pool.query("insert into admins set ?", req.body, function (error, _result) {
    if (error) {
      res.status(500).json({ status: false, message: error.sqlMessage });
    } else {
      res
        .status(200)
        .json({ status: true, message: "Data inserted successfully" });
    }
  });
});

router.get("/", function (_req, res) {
  pool.query("select * from admins", function (error, result) {
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

router.get("/:id", function (req, res) {
  pool.query(
    "select * from admins where id=?",
    [req.params.id],
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

router.put("/:id", function (req, res) {
  pool.query(
    "update admins set ? where id=?",
    [req.body, req.params.id],
    function (error, _result) {
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

router.delete("/:id", function (req, res) {
  pool.query(
    "delete from admins where id=?",
    [req.params.id],
    function (error, _result) {
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
    "select * from admins where (emailid=? or mobileno=? or username=?) and password=?",
    [
      req.body.username,
      req.body.username,
      req.body.username,
      req.body.password,
    ],
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
module.exports = router;
