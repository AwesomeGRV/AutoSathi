const cron = require('node-cron');
const { query } = require('../config/database');

class CronJobs {
  static async checkExpiryReminders() {
    try {
      console.log('🔄 Running expiry reminder check...');

      const notificationDaysBefore = parseInt(process.env.NOTIFICATION_DAYS_BEFORE) || 30;
      
      // Check insurance expiry
      const insuranceExpiryResult = await query(
        `SELECT 
          v.user_id,
          v.id as vehicle_id,
          v.make,
          v.model,
          v.registration_number,
          i.policy_number,
          i.expiry_date,
          i.insurance_company
         FROM vehicles v
         INNER JOIN insurance i ON v.id = i.vehicle_id
         WHERE v.is_active = true 
         AND i.is_active = true
         AND i.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${notificationDaysBefore} days'
         AND NOT EXISTS (
           SELECT 1 FROM notifications n 
           WHERE n.user_id = v.user_id 
           AND n.vehicle_id = v.id 
           AND n.notification_type = 'insurance'
           AND n.title LIKE '%Insurance Renewal Reminder%'
           AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`,
        []
      );

      // Check PUC expiry
      const pucExpiryResult = await query(
        `SELECT 
          v.user_id,
          v.id as vehicle_id,
          v.make,
          v.model,
          v.registration_number,
          p.certificate_number,
          p.expiry_date,
          p.testing_center
         FROM vehicles v
         INNER JOIN puc p ON v.id = p.vehicle_id
         WHERE v.is_active = true 
         AND p.is_valid = true
         AND p.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${notificationDaysBefore} days'
         AND NOT EXISTS (
           SELECT 1 FROM notifications n 
           WHERE n.user_id = v.user_id 
           AND n.vehicle_id = v.id 
           AND n.notification_type = 'puc'
           AND n.title LIKE '%PUC Certificate%'
           AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`,
        []
      );

      // Check service due (odometer or date based)
      const serviceDueResult = await query(
        `SELECT 
          v.user_id,
          v.id as vehicle_id,
          v.make,
          v.model,
          v.registration_number,
          sr.next_service_odometer,
          sr.next_service_date,
          sr.service_type,
          v.current_odometer
         FROM vehicles v
         INNER JOIN LATERAL (
           SELECT DISTINCT ON (vehicle_id) 
             vehicle_id,
             next_service_odometer,
             next_service_date,
             service_type
           FROM service_records
           WHERE vehicle_id = v.id
           ORDER BY vehicle_id, service_date DESC
         ) sr ON true
         WHERE v.is_active = true
         AND (
           (sr.next_service_odometer IS NOT NULL AND v.current_odometer >= sr.next_service_odometer - 500)
           OR (sr.next_service_date IS NOT NULL AND sr.next_service_date <= CURRENT_DATE + INTERVAL '7 days')
         )
         AND NOT EXISTS (
           SELECT 1 FROM notifications n 
           WHERE n.user_id = v.user_id 
           AND n.vehicle_id = v.id 
           AND n.notification_type = 'service'
           AND n.title LIKE '%Service Due%'
           AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`,
        []
      );

      // Create notifications for insurance expiry
      for (const insurance of insuranceExpiryResult.rows) {
        const daysUntilExpiry = Math.ceil(
          (new Date(insurance.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        await query(
          `INSERT INTO notifications (user_id, vehicle_id, notification_type, title, message, scheduled_date)
           VALUES ($1, $2, 'insurance', $3, $4, $5)`,
          [
            insurance.user_id,
            insurance.vehicle_id,
            'Insurance Renewal Reminder',
            `Your vehicle insurance (${insurance.registration_number}) for ${insurance.make} ${insurance.model} expires in ${daysUntilExpiry} days on ${insurance.expiry_date.toLocaleDateString()}. Policy: ${insurance.policy_number} with ${insurance.insurance_company}.`,
            new Date()
          ]
        );
      }

      // Create notifications for PUC expiry
      for (const puc of pucExpiryResult.rows) {
        const daysUntilExpiry = Math.ceil(
          (new Date(puc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        await query(
          `INSERT INTO notifications (user_id, vehicle_id, notification_type, title, message, scheduled_date)
           VALUES ($1, $2, 'puc', $3, $4, $5)`,
          [
            puc.user_id,
            puc.vehicle_id,
            'PUC Certificate Expiry',
            `Your PUC certificate (${puc.certificate_number}) for ${puc.make} ${puc.model} (${puc.registration_number}) expires in ${daysUntilExpiry} days on ${puc.expiry_date.toLocaleDateString()}. Tested at: ${puc.testing_center}.`,
            new Date()
          ]
        );
      }

      // Create notifications for service due
      for (const service of serviceDueResult.rows) {
        let message = `Your ${service.make} ${service.model} (${service.registration_number}) is due for `;
        
        if (service.next_service_odometer && service.current_odometer >= service.next_service_odometer - 500) {
          message += `service at odometer reading ${service.next_service_odometer} km. Current reading: ${service.current_odometer} km.`;
        } else if (service.next_service_date) {
          message += `service on ${new Date(service.next_service_date).toLocaleDateString()}.`;
        }
        
        await query(
          `INSERT INTO notifications (user_id, vehicle_id, notification_type, title, message, scheduled_date)
           VALUES ($1, $2, 'service', $3, $4, $5)`,
          [
            service.user_id,
            service.vehicle_id,
            'Service Due Reminder',
            message,
            new Date()
          ]
        );
      }

      console.log(`✅ Expiry reminder check completed:
        - Insurance reminders: ${insuranceExpiryResult.rows.length}
        - PUC reminders: ${pucExpiryResult.rows.length}
        - Service reminders: ${serviceDueResult.rows.length}`);

    } catch (error) {
      console.error('❌ Error in expiry reminder check:', error);
    }
  }

  static initializeCronJobs() {
    // Run daily at 8 AM (configurable via environment variable)
    const cronSchedule = process.env.CRON_SCHEDULE || '0 8 * * *';
    
    cron.schedule(cronSchedule, async () => {
      await this.checkExpiryReminders();
    });

    console.log(`🕐 Cron job scheduled: ${cronSchedule} - Daily expiry reminder check`);
    
    // Run immediately on startup for testing (remove in production if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Running expiry reminder check on startup (development mode)');
      setTimeout(() => this.checkExpiryReminders(), 5000);
    }
  }
}

module.exports = CronJobs;
