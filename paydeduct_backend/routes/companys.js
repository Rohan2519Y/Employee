var express = require('express');
var router = express.Router();
var pool = require('./pool');
var upload = require('./multer')

router.post('/insert_company', upload.single('companylogo'), function (req, res, next) {
  try {
    pool.query("insert into company (companyname, companylogo, contactperson, emailid, mobile, created_time, created_date, user, status) values(?,?,?,?,?,?,?,?,?)", [req.body.companyname, req.file.filename, req.body.contactperson, req.body.emailid, req.body.mobile, req.body.created_time, req.body.created_date, req.body.user, req.body.status], function (error, result) {
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
    console.log(e)
    res.status(202).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
  }
});

router.get('/fetch_company', function (req, res, next) {
  try {
    pool.query('select * from company', function (error, result) {
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

router.post('/edit_company', function (req, res, next) {
  try {
    pool.query("update company set companyname=?,  contactperson=?, emailid=?, mobile=?, created_time=?, created_date=?, user=?, status=? where company_id=?", [req.body.companyname,  req.body.contactperson, req.body.emailid, req.body.mobile, req.body.created_time, req.body.created_date, req.body.user, req.body.status, req.body.company_id], function (error, result) {
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

router.post('/update_icon', upload.single('companylogo'), function (req, res, next) {
  try {
    pool.query("update company set companylogo=? where company_id=?", [req.file.filename, req.body.company_id], function (error, result) {
      if (error) {

        res.status(200).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
      }
      else {
        res.status(200).json({ status: true, message: 'Brand Icon Updated Successfully..' })
      }
    })
  }
  catch (e) {
    res.status(200).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
  }
});

router.post('/delete_company', function (req, res, next) {
  try {
    pool.query("delete from company where company_id=?", [req.body.company_id], function (error, result) {
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