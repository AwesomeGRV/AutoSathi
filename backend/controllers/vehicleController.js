const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');

class VehicleController {
  static validateCreate = [
    body('make')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Make must be between 2 and 50 characters'),
    body('model')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Model must be between 2 and 50 characters'),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Please provide a valid year'),
    body('vehicleType')
      .isIn(['car', 'bike', 'scooter', 'truck', 'bus'])
      .withMessage('Invalid vehicle type'),
    body('fuelType')
      .isIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid'])
      .withMessage('Invalid fuel type'),
    body('registrationNumber')
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage('Registration number must be between 5 and 20 characters')
      .matches(/^[A-Z0-9]+$/i)
      .withMessage('Registration number should contain only letters and numbers'),
    body('chassisNumber')
      .optional()
      .trim()
      .isLength({ min: 10, max: 50 })
      .withMessage('Chassis number must be between 10 and 50 characters'),
    body('engineNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Engine number must be between 5 and 50 characters'),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid purchase date'),
    body('purchaseOdometer')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Purchase odometer must be a non-negative integer'),
    body('currentOdometer')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Current odometer must be a non-negative integer'),
  ];

  static validateUpdate = [
    body('make')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Make must be between 2 and 50 characters'),
    body('model')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Model must be between 2 and 50 characters'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Please provide a valid year'),
    body('vehicleType')
      .optional()
      .isIn(['car', 'bike', 'scooter', 'truck', 'bus'])
      .withMessage('Invalid vehicle type'),
    body('fuelType')
      .optional()
      .isIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid'])
      .withMessage('Invalid fuel type'),
    body('registrationNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage('Registration number must be between 5 and 20 characters')
      .matches(/^[A-Z0-9]+$/i)
      .withMessage('Registration number should contain only letters and numbers'),
    body('chassisNumber')
      .optional()
      .trim()
      .isLength({ min: 10, max: 50 })
      .withMessage('Chassis number must be between 10 and 50 characters'),
    body('engineNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Engine number must be between 5 and 50 characters'),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid purchase date'),
    body('currentOdometer')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Current odometer must be a non-negative integer'),
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

      // Check if registration number already exists for this user
      const existingVehicle = await Vehicle.getByRegistrationNumber(
        req.body.registrationNumber,
        req.user.id
      );
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: 'Vehicle with this registration number already exists',
        });
      }

      const vehicleData = {
        ...req.body,
        userId: req.user.id,
      };

      const vehicle = await Vehicle.create(vehicleData);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: { vehicle },
      });
    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const vehicles = await Vehicle.findByUserId(req.user.id, limit, offset);
      const totalCount = await Vehicle.getTotalCount(req.user.id);

      res.json({
        success: true,
        data: {
          vehicles,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findById(id, req.user.id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      res.json({
        success: true,
        data: { vehicle },
      });
    } catch (error) {
      console.error('Get vehicle error:', error);
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

      // Check if vehicle exists and belongs to user
      const existingVehicle = await Vehicle.findById(id, req.user.id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      // Check if registration number is being updated and if it conflicts
      if (req.body.registrationNumber && req.body.registrationNumber !== existingVehicle.registration_number) {
        const conflictingVehicle = await Vehicle.getByRegistrationNumber(
          req.body.registrationNumber,
          req.user.id
        );
        if (conflictingVehicle) {
          return res.status(409).json({
            success: false,
            message: 'Vehicle with this registration number already exists',
          });
        }
      }

      const vehicle = await Vehicle.update(id, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: { vehicle },
      });
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async updateOdometer(req, res) {
    try {
      const { id } = req.params;
      const { odometerReading } = req.body;

      if (!odometerReading || odometerReading < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid odometer reading is required',
        });
      }

      const vehicle = await Vehicle.findById(id, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      const updatedVehicle = await Vehicle.updateOdometer(id, req.user.id, odometerReading);

      res.json({
        success: true,
        message: 'Odometer updated successfully',
        data: { vehicle: updatedVehicle },
      });
    } catch (error) {
      console.error('Update odometer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findById(id, req.user.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      await Vehicle.delete(id, req.user.id);

      res.json({
        success: true,
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Vehicle.getVehicleStats(req.user.id);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error('Get vehicle stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getUpcomingRenewals(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const renewals = await Vehicle.getUpcomingRenewals(req.user.id, days);

      res.json({
        success: true,
        data: { renewals },
      });
    } catch (error) {
      console.error('Get upcoming renewals error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = VehicleController;
