const { query } = require('../config/database');

class FuelEntry {
  static async create(fuelData) {
    const {
      vehicleId,
      fuelDate,
      odometerReading,
      fuelQuantity,
      fuelPricePerLiter,
      totalCost,
      fuelStation,
      fuelType,
    } = fuelData;

    // Calculate mileage if previous entry exists
    let mileageCalculated = null;
    const previousEntry = await this.getPreviousEntry(vehicleId, odometerReading);
    
    if (previousEntry) {
      const distanceTraveled = odometerReading - previousEntry.odometer_reading;
      if (distanceTraveled > 0) {
        mileageCalculated = parseFloat((distanceTraveled / fuelQuantity).toFixed(2));
      }
    }

    const result = await query(
      `INSERT INTO fuel_entries 
       (vehicle_id, fuel_date, odometer_reading, fuel_quantity, fuel_price_per_liter, 
        total_cost, fuel_station, fuel_type, mileage_calculated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        vehicleId, fuelDate, odometerReading, fuelQuantity, fuelPricePerLiter,
        totalCost, fuelStation, fuelType, mileageCalculated
      ]
    );

    return result.rows[0];
  }

  static async getPreviousEntry(vehicleId, currentOdometer) {
    const result = await query(
      `SELECT * FROM fuel_entries 
       WHERE vehicle_id = $1 AND odometer_reading < $2
       ORDER BY odometer_reading DESC, fuel_date DESC 
       LIMIT 1`,
      [vehicleId, currentOdometer]
    );
    return result.rows[0];
  }

  static async findByVehicleId(vehicleId, userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT fe.* FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.vehicle_id = $1 AND v.user_id = $2 AND v.is_active = true
       ORDER BY fe.fuel_date DESC, fe.odometer_reading DESC
       LIMIT $3 OFFSET $4`,
      [vehicleId, userId, limit, offset]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      `SELECT fe.* FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.id = $1 AND v.user_id = $2 AND v.is_active = true`,
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, updateData) {
    const {
      fuelDate,
      odometerReading,
      fuelQuantity,
      fuelPricePerLiter,
      totalCost,
      fuelStation,
      fuelType,
    } = updateData;

    // Recalculate mileage
    let mileageCalculated = null;
    const previousEntry = await this.getPreviousEntry(
      await this.getVehicleId(id, userId),
      odometerReading
    );
    
    if (previousEntry) {
      const distanceTraveled = odometerReading - previousEntry.odometer_reading;
      if (distanceTraveled > 0) {
        mileageCalculated = parseFloat((distanceTraveled / fuelQuantity).toFixed(2));
      }
    }

    const result = await query(
      `UPDATE fuel_entries 
       SET fuel_date = $1, odometer_reading = $2, fuel_quantity = $3, 
           fuel_price_per_liter = $4, total_cost = $5, fuel_station = $6,
           fuel_type = $7, mileage_calculated = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        fuelDate, odometerReading, fuelQuantity, fuelPricePerLiter,
        totalCost, fuelStation, fuelType, mileageCalculated, id
      ]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await query(
      `DELETE FROM fuel_entries fe
       USING vehicles v
       WHERE fe.id = $1 AND v.id = fe.vehicle_id AND v.user_id = $2
       RETURNING fe.*`,
      [id, userId]
    );

    return result.rows[0];
  }

  static async getVehicleId(id, userId) {
    const result = await query(
      `SELECT vehicle_id FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.id = $1 AND v.user_id = $2`,
      [id, userId]
    );
    return result.rows[0]?.vehicle_id;
  }

  static async getMonthlyStats(vehicleId, userId, months = 12) {
    const result = await query(
      `SELECT 
        DATE_TRUNC('month', fuel_date) as month,
        COUNT(*) as entries,
        SUM(fuel_quantity) as total_fuel,
        SUM(total_cost) as total_cost,
        AVG(mileage_calculated) as avg_mileage
       FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.vehicle_id = $1 AND v.user_id = $2 
         AND fe.fuel_date >= CURRENT_DATE - INTERVAL '${months} months'
       GROUP BY DATE_TRUNC('month', fuel_date)
       ORDER BY month DESC`,
      [vehicleId, userId]
    );
    return result.rows;
  }

  static async getAverageMileage(vehicleId, userId) {
    const result = await query(
      `SELECT AVG(mileage_calculated) as avg_mileage
       FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.vehicle_id = $1 AND v.user_id = $2 
         AND fe.mileage_calculated IS NOT NULL
       GROUP BY fe.vehicle_id`,
      [vehicleId, userId]
    );
    return result.rows[0]?.avg_mileage || 0;
  }

  static async getTotalFuelExpense(vehicleId, userId, startDate = null, endDate = null) {
    let queryText = `
      SELECT SUM(total_cost) as total_expense
      FROM fuel_entries fe
      INNER JOIN vehicles v ON fe.vehicle_id = v.id
      WHERE fe.vehicle_id = $1 AND v.user_id = $2`;
    
    const params = [vehicleId, userId];

    if (startDate) {
      queryText += ` AND fe.fuel_date >= $3`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND fe.fuel_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const result = await query(queryText, params);
    return parseFloat(result.rows[0]?.total_expense) || 0;
  }

  static async getRecentEntries(userId, limit = 10) {
    const result = await query(
      `SELECT fe.*, v.make, v.model, v.registration_number
       FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE v.user_id = $1 AND v.is_active = true
       ORDER BY fe.fuel_date DESC, fe.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async getTotalCount(vehicleId, userId) {
    const result = await query(
      `SELECT COUNT(*) FROM fuel_entries fe
       INNER JOIN vehicles v ON fe.vehicle_id = v.id
       WHERE fe.vehicle_id = $1 AND v.user_id = $2 AND v.is_active = true`,
      [vehicleId, userId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = FuelEntry;
