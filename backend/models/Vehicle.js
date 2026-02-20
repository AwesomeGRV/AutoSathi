const { query } = require('../config/database');

class Vehicle {
  static async create(vehicleData) {
    const {
      userId,
      make,
      model,
      year,
      vehicleType,
      fuelType,
      registrationNumber,
      chassisNumber,
      engineNumber,
      purchaseDate,
      purchaseOdometer = 0,
      currentOdometer = 0,
    } = vehicleData;

    const result = await query(
      `INSERT INTO vehicles 
       (user_id, make, model, year, vehicle_type, fuel_type, registration_number, 
        chassis_number, engine_number, purchase_date, purchase_odometer, current_odometer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId, make, model, year, vehicleType, fuelType, registrationNumber,
        chassisNumber, engineNumber, purchaseDate, purchaseOdometer, currentOdometer
      ]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    const result = await query(
      `SELECT * FROM vehicles 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async findById(id, userId = null) {
    const queryText = userId
      ? 'SELECT * FROM vehicles WHERE id = $1 AND user_id = $2 AND is_active = true'
      : 'SELECT * FROM vehicles WHERE id = $1 AND is_active = true';
    
    const params = userId ? [id, userId] : [id];
    const result = await query(queryText, params);
    return result.rows[0];
  }

  static async update(id, userId, updateData) {
    const {
      make,
      model,
      year,
      vehicleType,
      fuelType,
      registrationNumber,
      chassisNumber,
      engineNumber,
      purchaseDate,
      currentOdometer,
    } = updateData;

    const result = await query(
      `UPDATE vehicles 
       SET make = $1, model = $2, year = $3, vehicle_type = $4, fuel_type = $5,
           registration_number = $6, chassis_number = $7, engine_number = $8,
           purchase_date = $9, current_odometer = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12 AND is_active = true
       RETURNING *`,
      [
        make, model, year, vehicleType, fuelType, registrationNumber,
        chassisNumber, engineNumber, purchaseDate, currentOdometer, id, userId
      ]
    );

    return result.rows[0];
  }

  static async updateOdometer(id, userId, odometerReading) {
    const result = await query(
      `UPDATE vehicles 
       SET current_odometer = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND is_active = true
       RETURNING *`,
      [odometerReading, id, userId]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await query(
      `UPDATE vehicles 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  }

  static async getByRegistrationNumber(registrationNumber, userId = null) {
    const queryText = userId
      ? 'SELECT * FROM vehicles WHERE registration_number = $1 AND user_id = $2 AND is_active = true'
      : 'SELECT * FROM vehicles WHERE registration_number = $1 AND is_active = true';
    
    const params = userId ? [registrationNumber, userId] : [registrationNumber];
    const result = await query(queryText, params);
    return result.rows[0];
  }

  static async getTotalCount(userId) {
    const result = await query(
      'SELECT COUNT(*) FROM vehicles WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async getVehicleStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_vehicles,
        COUNT(CASE WHEN vehicle_type = 'car' THEN 1 END) as cars,
        COUNT(CASE WHEN vehicle_type = 'bike' THEN 1 END) as bikes,
        COUNT(CASE WHEN vehicle_type = 'scooter' THEN 1 END) as scooters,
        COUNT(CASE WHEN fuel_type = 'petrol' THEN 1 END) as petrol_vehicles,
        COUNT(CASE WHEN fuel_type = 'diesel' THEN 1 END) as diesel_vehicles,
        COUNT(CASE WHEN fuel_type = 'cng' THEN 1 END) as cng_vehicles,
        COUNT(CASE WHEN fuel_type = 'electric' THEN 1 END) as electric_vehicles
       FROM vehicles 
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    return result.rows[0];
  }

  static async getUpcomingRenewals(userId, days = 30) {
    const result = await query(
      `SELECT DISTINCT ON (v.id)
        v.id, v.make, v.model, v.registration_number,
        i.expiry_date as insurance_expiry,
        p.expiry_date as puc_expiry,
        LEAST(i.expiry_date, p.expiry_date) as next_expiry
       FROM vehicles v
       LEFT JOIN insurance i ON v.id = i.vehicle_id AND i.is_active = true
       LEFT JOIN puc p ON v.id = p.vehicle_id AND p.is_valid = true
       WHERE v.user_id = $1 AND v.is_active = true
       AND (i.expiry_date <= CURRENT_DATE + INTERVAL '$2 days' 
            OR p.expiry_date <= CURRENT_DATE + INTERVAL '$2 days')
       ORDER BY v.id, next_expiry ASC`,
      [userId, days]
    );
    return result.rows;
  }
}

module.exports = Vehicle;
