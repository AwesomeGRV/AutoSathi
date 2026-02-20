const express = require('express');
const VehicleController = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Create vehicle
router.post('/', VehicleController.validateCreate, VehicleController.create);

// Get all vehicles for the authenticated user
router.get('/', VehicleController.getAll);

// Get vehicle statistics
router.get('/stats', VehicleController.getStats);

// Get upcoming renewals
router.get('/renewals', VehicleController.getUpcomingRenewals);

// Get vehicle by ID
router.get('/:id', VehicleController.getById);

// Update vehicle
router.put('/:id', VehicleController.validateUpdate, VehicleController.update);

// Update vehicle odometer
router.patch('/:id/odometer', VehicleController.updateOdometer);

// Delete vehicle (soft delete)
router.delete('/:id', VehicleController.delete);

module.exports = router;
