var express = require('express');
var router = express.Router();
var pool = require('./pool');

router.post('/pl_count', function (req, res, next) {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Simple date range - Jan to previous month
        const startDate = `${currentYear}-01-01`;
        const endDate = currentMonth > 1 ? 
            `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-31` : 
            `${currentYear - 1}-12-31`;
        
        console.log(`Employee: ${req.body.employeeId}, Date Range: ${startDate} to ${endDate}`);
        
        // First, let's check what data exists for this employee
        const debugQuery = `
            SELECT * FROM emp_leave 
            WHERE employee_id = ? 
            AND type_of_leave IN ('SL', 'SHORT_LEAVE', 'HD')
            ORDER BY start_date
        `;
        
        pool.query(debugQuery, [req.body.employeeId], function (debugError, debugResult) {
            if (debugError) {
                console.log('Debug Query Error:', debugError);
                return res.status(500).json({ status: false, message: 'Debug Query Failed' });
            }
            
            console.log('All leaves for employee:', debugResult);
            
            // Now run the actual query
            const mainQuery = `
                SELECT  
                    E.employee_id, 
                    COALESCE(SUM(CASE 
                        WHEN EL.type_of_leave = 'SL' THEN 
                            DATEDIFF(EL.end_date, EL.start_date) + 1
                        ELSE 0 
                    END), 0) AS SL,
                    COALESCE(SUM(CASE WHEN EL.type_of_leave = 'SHORT_LEAVE' THEN EL.value ELSE 0 END), 0) AS SHL, 
                    COALESCE(SUM(CASE WHEN EL.type_of_leave = 'HD' THEN EL.value ELSE 0 END), 0) AS HD 
                FROM employees E 
                INNER JOIN emp_leave EL ON E.employee_id = EL.employee_id 
                WHERE E.employee_id = ? 
                AND EL.start_date >= ? 
                AND EL.start_date <= ?
                GROUP BY E.employee_id
            `;
            
            pool.query(mainQuery, [req.body.employeeId, startDate, endDate], function (error, result) {
                if (error) {
                    console.log('Main Query Error:', error)
                    res.status(500).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
                }
                else {
                    console.log('Final Result:', result)
                    res.status(200).json({ 
                        status: true, 
                        message: 'Data Fetched', 
                        data: result,
                        debug: {
                            dateRange: `${startDate} to ${endDate}`,
                            allLeaves: debugResult
                        }
                    })
                }
            });
        });
        
    }
    catch (e) {
        console.error('Critical Error:', e);
        res.status(500).json({ status: false, message: 'Critical Error,Pls Contact Server Administrator' })
    }
});


router.post('/emp_holiday', function (req, res, next) {
    try {
        pool.query('Select * from emp_leave where employee_id=?', [req.body.employeeId], function (error, result) {
            if (error) {
                console.log(error)
                res.status(201).json({ status: false, message: 'Database Error,Pls Contact Backend Team' })
            }
            else {
                res.status(200).json({ status: true, message: 'Data Fetched', data: result })
            }
        })
    }
    catch (e) {
        res.status(202).json({ status: false, message: 'Critical Error, Pls Contact Server Administrator' })
    }
})
module.exports = router