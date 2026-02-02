import express from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { getActivityLogs } from '../controllers/activityLogController';
import { getAttendance, checkIn, checkOut } from '../controllers/attendanceController';

const router = express.Router();

router.get('/', getAnalytics);
router.get('/activity-logs', getActivityLogs);
router.get('/attendance', getAttendance);
router.post('/attendance/check-in', checkIn);
router.put('/attendance/check-out', checkOut);

export default router;
