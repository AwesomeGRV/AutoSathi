const { body, validationResult } = require('express-validator');
const FuelEntry = require('../models/FuelEntry');
const Vehicle = require('../models/Vehicle');

class FuelController {
  static validateCreate = [
    body('vehicleId')
      .isUUID()
      .withMessage('Valid vehicle ID is required'),
    body('fuelDate')
      .isISO8601()
      .withMessage('Please provide a valid fuel date'),
    body('odometerReading')
      .isInt({ min: 0 })
      .withMessage('Odometer reading must be a non-negative integer'),
    body('fuelQuantity')
      .isFloat({ min: 0.1 })
      .withMessage('Fuel quantity must be greater than 0'),
    body('fuelPricePerLiter')
      .isFloat({ min: 0.1 })
      .withMessage('Fuel price per liter must be greater than 0'),
    body('totalCost')
      .isFloat({ min: 0.1 })
      .withMessage('Total cost must be greater than 0'),
    body('fuelStation')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Fuel station name must be less than 100 characters'),
    body('fuelType')
      .isIn(['petrol', 'diesel', 'cng'])
      .withMessage('Invalid fuel type'),
  ];

  static validateUpdate = [
    body('fuelDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid fuel date'),
    body('odometerReading')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Odometer reading must be a non-negative integer'),
    body('fuelQuantity')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('Fuel quantity must be greater than 0'),
    body('fuelPricePerLiter')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('Fuel price per liter must be greater than 0'),
    body('totalCost')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('Total cost must be greater than 0'),
    body('fuelStation')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Fuel station name must be less than 100 characters'),
    body('fuelType')
      .optional()
      .isIn(['petrol', 'diesel', 'cng'])
      .withMessage('Invalid fuel type'),
  ];

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { vehicleId } = req.body;

      // Verify vehicle belongs to user
      const vehicle = await Vehicle.findById(vehicleId, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      // Validate odometer reading is not less than current vehicle odometer
      if (req.body.odometerReading < vehicle.current_odometer) {
        return res.status(400).json({
          success: false,
          message: 'Odometer reading cannot be less than current vehicle odometer',
        });
      }

      const fuelEntry = await FuelEntry.create({
        ...req.body,
      });

      // Update vehicle odometer if this entry has higher reading
      if (fuelEntry.odometer_reading > vehicle.current_odometer) {
        await Vehicle.updateOdometer(vehicleId, req.user.id, fuelEntry.odometer_reading);
      }

      res.status(201).json({
        success: true,
        message: 'Fuel entry created successfully',
        data: { fuelEntry },
      });
    } catch (error) {
      console.error('Create fuel entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getByVehicleId(req, res) {
    try {
      const { vehicleId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      // Verify vehicle belongs to user
      const vehicle = await Vehicle.findById(vehicleId, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const fuelEntries = await FuelEntry.findByVehicleId(vehicleId, req.user.id, limit, offset);
      const totalCount = await FuelEntry.getTotalCount(vehicleId, req.user.id);

      res.json({
        success: true,
        data: {
          fuelEntries,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get fuel entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const fuelEntry = await FuelEntry.findById(id, req.user.id);

      if (!fuelEntry) {
        return res.status(404).json({
          success: false,
          message: 'Fuel entry not found',
        });
      }

      res.json({
        success: true,
        data: { fuelEntry },
      });
    } catch (error) {
      console.error('Get fuel entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;

      const existingEntry = await FuelEntry.findById(id, req.user.id);
      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          message: 'Fuel entry not found',
        });
      }

      const fuelEntry = await FuelEntry.update(id, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Fuel entry updated successfully',
        data: { fuelEntry },
      });
    } catch (error) {
      console.error('Update fuel entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const fuelEntry = await FuelEntry.findById(id, req.user.id);
      if (!fuelEntry) {
        return res.status(404).json({
          success: false,
          message: 'Fuel entry not found',
        });
      }

      await FuelEntry.delete(id, req.user.id);

      res.json({
        success: true,
        message: 'Fuel entry deleted successfully',
      });
    } catch (error) {
      console.error('Delete fuel entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getMonthlyStats(req, res) {
    try {
      const { vehicleId } = req.params;
      const months = parseInt(req.query.months) || 12;

      // Verify vehicle belongs to user
      const vehicle = await Vehicle.findById(vehicleId, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const stats = await FuelEntry.getMonthlyStats(vehicleId, req.user.id, months);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error('Get monthly stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getAverageMileage(req, res) {
    try {
      const { vehicleId } = req.params;

      // Verify vehicle belongs to user
      const vehicle = await Vehicle.findById(vehicleId, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const avgMileage = await FuelEntry.getAverageMileage(vehicleId, req.user.id);

      res.json({
        success: true,
        data: { averageMileage: avgMileage },
      });
    } catch (error) {
      console.error('Get average mileage error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getTotalExpense(req, res) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;

      // Verify vehicle belongs to user
      const vehicle = await Vehicle.findById(vehicleId, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const totalExpense = await FuelEntry.getTotalFuelExpense(
        vehicleId, 
        req.user.id, 
        startDate, 
        endDate
      );

      res.json({
        success: true,
        data: { totalExpense },
      });
    } catch (error) {
      console.error('Get total expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getRecentEntries(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const entries = await FuelEntry.getRecentEntries(req.user.id, limit);

      res.json({
        success: true,
        data: { entries },
      });
    } catch (error) {
      console.error('Get recent entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = FuelController;
