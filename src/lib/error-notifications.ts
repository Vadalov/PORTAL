/**
 * Error Notification Integration
 * Automatically create notifications for critical/high severity errors
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('error-notifications');

export interface ErrorNotificationOptions {
  errorId: string;
  errorCode: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  component?: string;
  url?: string;
}

/**
 * Create notification for error
 * Sends to admins for critical/high severity errors
 */
export async function createErrorNotification(
  options: ErrorNotificationOptions
): Promise<void> {
  const { errorId, errorCode, title, severity, category, component, url } = options;

  // Only create notifications for critical and high severity
  if (severity !== 'critical' && severity !== 'high') {
    return;
  }

  try {
    // Get all admin and super admin users
    // Note: This would need to query users by role
    // For now, we'll create a general notification structure

    const severityEmoji = severity === 'critical' ? '🚨' : '⚠️';
    const categoryLabel = getCategoryLabel(category);

    const notificationTitle = `${severityEmoji} ${
      severity === 'critical' ? 'KRİTİK HATA' : 'YÜKSEK ÖNCELİKLİ HATA'
    }`;

    const notificationBody = `
Hata: ${title}
Kategori: ${categoryLabel}
Kod: ${errorCode}
${component ? `Bileşen: ${component}` : ''}
${url ? `URL: ${url}` : ''}

Lütfen acilen kontrol edin.
    `.trim();

    logger.warn('Error notification created', {
      errorId,
      severity,
      title,
    });

    // TODO: Integrate with workflow_notifications table
    // This would require querying for admin users and creating notifications
    // Example:
    // await fetchMutation(api.workflow_notifications.create, {
    //   recipient: adminUserId,
    //   category: 'hatirlatma',
    //   title: notificationTitle,
    //   body: notificationBody,
    //   status: 'beklemede',
    //   created_at: new Date().toISOString(),
    //   reference: {
    //     type: 'error',
    //     id: errorId,
    //   },
    // });

    logger.warn('Error notification would be sent', {
      title: notificationTitle,
      body: notificationBody,
    });
  } catch (error) {
    logger.error('Failed to create error notification', error, {
      errorId,
      severity,
    });
  }
}

/**
 * Get human-readable category label
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    runtime: 'Çalışma Zamanı',
    ui_ux: 'UI/UX',
    design_bug: 'Tasarım Hatası',
    system: 'Sistem',
    data: 'Veri',
    security: 'Güvenlik',
    performance: 'Performans',
    integration: 'Entegrasyon',
  };

  return labels[category] || category;
}

/**
 * Send email notification for critical errors
 * (Placeholder - would integrate with email service)
 */
export async function sendCriticalErrorEmail(
  options: ErrorNotificationOptions
): Promise<void> {
  if (options.severity !== 'critical') {
    return;
  }

  logger.info('Critical error email would be sent', {
    errorId: options.errorId,
    title: options.title,
  });

  // TODO: Integrate with email service
  // This would use the existing email service from the project
}
