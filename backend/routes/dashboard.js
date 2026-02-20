const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');
const Vehicle = require('../models/Vehicle');
const FuelEntry = require('../models/FuelEntry');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get vehicle statistics
    const vehicleStats = await Vehicle.getVehicleStats(userId);

    // Get upcoming renewals (next 30 days)
    const upcomingRenewals = await Vehicle.getUpcomingRenewals(userId, 30);

    // Get current month fuel expense
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthExpense = await query(
      `SELECT COALESCE(SUM(fe.total_cost), 0) as total_expense
       FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE v.user_id = $1 AND v.is_active = true
       AND fe.fuel_date >= $2`,
      [userId, currentMonthStart]
    );

    // Get recent fuel entries
    const recentEntries = await FuelEntry.getRecentEntries(userId, 5);

    // Get unread notifications count
    const notificationsResult = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    const overview = {
      vehicleStats: vehicleStats,
      upcomingRenewals: upcomingRenewals.length,
      currentMonthExpense: parseFloat(currentMonthExpense.rows[0].total_expense),
      recentEntries: recentEntries,
      unreadNotifications: parseInt(notificationsResult.rows[0].count),
    };

    res.json({
      success: true,
      data: { overview },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get mileage statistics
router.get('/mileage-stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const result = await query(
      `SELECT 
        v.id,
        v.make,
        v.model,
        v.registration_number,
        AVG(fe.mileage_calculated) as avg_mileage,
        COUNT(fe.id) as fuel_entries_count
       FROM vehicles v
       LEFT JOIN fuel_entries fe ON v.id = fe.vehicle_id AND fe.mileage_calculated IS NOT NULL
       WHERE v.user_id = $1 AND v.is_active = true
       GROUP BY v.id, v.make, v.model, v.registration_number
       ORDER BY avg_mileage DESC NULLS LAST`,
      [userId]
    );

    res.json({
      success: true,
      data: { mileageStats: result.rows },
    });
  } catch (error) {
    console.error('Mileage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get monthly expense trends
router.get('/expense-trends', async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 12;

    const result = await query(
      `SELECT 
        DATE_TRUNC('month', fe.fuel_date) as month,
        SUM(fe.total_cost) as total_expense,
        COUNT(fe.id) as entries_count
       FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE v.user_id = $1 AND v.is_active = true
       AND fe.fuel_date >= CURRENT_DATE - INTERVAL '${months} months'
       GROUP BY DATE_TRUNC('month', fe.fuel_date)
       ORDER BY month ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: { expenseTrends: result.rows },
    });
  } catch (error) {
    console.error('Expense trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get service reminders
router.get('/service-reminders', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        v.id,
        v.make,
        v.model,
        v.registration_number,
        v.current_odometer,
        sr.next_service_odometer,
        sr.next_service_date,
        sr.service_type,
        CASE 
          WHEN sr.next_service_odometer IS NOT NULL AND v.current_odometer >= sr.next_service_odometer - 500 THEN true
          WHEN sr.next_service_date IS NOT NULL AND sr.next_service_date <= CURRENT_DATE + INTERVAL '30 days' THEN true
          ELSE false
        END as is_due_soon
       FROM vehicles v
       LEFT JOIN LATERAL (
         SELECT DISTINCT ON (vehicle_id) 
           vehicle_id,
           next_service_odometer,
           next_service_date,
           service_type
         FROM service_records
         WHERE vehicle_id = v.id
         ORDER BY vehicle_id, service_date DESC
       ) sr ON true
       WHERE v.user_id = $1 AND v.is_active = true
       AND (sr.next_service_odometer IS NOT NULL OR sr.next_service_date IS NOT NULL)
       ORDER BY is_due_soon DESC, sr.next_service_date ASC NULLS LAST`,
      [userId]
    );

    res.json({
      success: true,
      data: { serviceReminders: result.rows },
    });
  } catch (error) {
    console.error('Service reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get vehicle health summary
router.get('/vehicle-health', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        v.id,
        v.make,
        v.model,
        v.registration_number,
        v.current_odometer,
        CASE 
          WHEN i.expiry_date IS NOT NULL AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'insurance_due'
          WHEN p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'puc_due'
          WHEN sr.next_service_odometer IS NOT NULL AND v.current_odometer >= sr.next_service_odometer - 500 THEN 'service_due'
          ELSE 'healthy'
        END as status,
        i.expiry_date as insurance_expiry,
        p.expiry_date as puc_expiry,
        sr.next_service_date as service_due_date
       FROM vehicles v
       LEFT JOIN LATERAL (
         SELECT DISTINCT ON (vehicle_id) 
           vehicle_id, expiry_date
         FROM insurance
         WHERE vehicle_id = v.id AND is_active = true
         ORDER BY vehicle_id, expiry_date DESC
       ) i ON true
       LEFT JOIN LATERAL (
         SELECT DISTINCT ON (vehicle_id) 
           vehicle_id, expiry_date
         FROM puc
         WHERE vehicle_id = v.id AND is_valid = true
         ORDER BY vehicle_id, expiry_date DESC
       ) p ON true
       LEFT JOIN LATERAL (
         SELECT DISTINCT ON (vehicle_id) 
           vehicle_id, next_service_date, next_service_odometer
         FROM service_records
         WHERE vehicle_id = v.id
         ORDER BY vehicle_id, service_date DESC
       ) sr ON true
       WHERE v.user_id = $1 AND v.is_active = true
       ORDER BY 
         CASE 
           WHEN i.expiry_date IS NOT NULL AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1
           WHEN p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 2
           WHEN sr.next_service_odometer IS NOT NULL AND v.current_odometer >= sr.next_service_odometer - 500 THEN 3
           ELSE 4
         END ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: { vehicleHealth: result.rows },
    });
  } catch (error) {
    console.error('Vehicle health error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
