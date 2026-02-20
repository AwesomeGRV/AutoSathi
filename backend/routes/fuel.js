const express = require('express');
const FuelController = require('../controllers/fuelController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All fuel routes require authentication
router.use(authenticateToken);

// Create fuel entry
router.post('/', FuelController.validateCreate, FuelController.create);

// Get recent fuel entries across all vehicles
router.get('/recent', FuelController.getRecentEntries);

// Get fuel entries for a specific vehicle
router.get('/vehicle/:vehicleId', FuelController.getByVehicleId);

// Get monthly statistics for a vehicle
router.get('/vehicle/:vehicleId/stats/monthly', FuelController.getMonthlyStats);

// Get average mileage for a vehicle
router.get('/vehicle/:vehicleId/stats/mileage', FuelController.getAverageMileage);

// Get total fuel expense for a vehicle
router.get('/vehicle/:vehicleId/stats/expense', FuelController.getTotalExpense);

// Get fuel entry by ID
router.get('/:id', FuelController.getById);

// Update fuel entry
router.put('/:id', FuelController.validateUpdate, FuelController.update);

// Delete fuel entry
router.delete('/:id', FuelController.delete);

module.exports = router;
