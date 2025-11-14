const pool = require("../pool");

const pendingApproval = (req, res) => {
  let str = "";
  if (req.query.type.toLowerCase() == "clockin") {
    str = "ED.clockinapprove is null";
  } else {
    str = "ED.clockoutapprove is null and ED.checkout_date is not null";
  }
  pool.query(
    "select ED.*,(select E.name from employees E where E.employee_id=ED.employee_id) as ename from emp_login_details ED where "+str,
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
};

module.exports = { pendingApproval };
