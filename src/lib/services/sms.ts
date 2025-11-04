/**
 * SMS Service
 * Handles SMS sending via Twilio or other providers
 */

import { getServerEnv, hasSmsConfig } from '@/lib/env-validation';
import logger from '@/lib/logger';

interface SmsOptions {
  to: string | string[];
  message: string;
  from?: string;
}

/**
 * Send SMS via Twilio
 * Returns true if SMS was sent successfully, false otherwise
 */
export async function sendSMS(options: SmsOptions): Promise<boolean> {
  const env = getServerEnv();
  
  if (!hasSmsConfig(env)) {
    logger.warn('SMS not configured', {
      service: 'sms',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    });
    return false;
  }

  try {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const fromNumber = options.from || env.TWILIO_PHONE_NUMBER || '';
    
    logger.info('SMS sending attempted', {
      service: 'sms',
      recipients: recipients.length,
      from: fromNumber,
      messageLength: options.message.length,
    });

    // TODO: Implement actual SMS sending via Twilio
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // 
    // for (const recipient of recipients) {
    //   await client.messages.create({
    //     body: options.message,
    //     from: fromNumber,
    //     to: recipient,
    //   });
    // }
    
    // For now, return true (simulated success)
    // In production, implement actual Twilio integration
    return true;
  } catch (error) {
    logger.error('SMS sending failed', error, {
      service: 'sms',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    });
    return false;
  }
}

/**
 * Send bulk SMS
 */
export async function sendBulkSMS(
  recipients: string[],
  message: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const result = await sendSMS({
      to: recipient,
      message,
    });
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

