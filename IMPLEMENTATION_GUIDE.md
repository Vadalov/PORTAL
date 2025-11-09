# 🔧 PORTAL - Eksik Özelliklerin Implementasyon Kılavuzu

Bu dokümantasyon, eksik özelliklerin nasıl implement edileceğini adım adım açıklar.

---

## 📧 1. EMAIL SERVİSİ - Production Implementation

### Adım 1: Dependencies Kurulumu

```bash
npm install nodemailer
npm install -D @types/nodemailer
npm install handlebars # Email templates için
```

### Adım 2: Environment Variables

`.env.local` dosyasına ekle:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=dernek@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Dernek Yönetim <noreply@example.com>
```

### Adım 3: Email Service Implementation

`src/lib/services/email.ts` dosyasını güncelle:

```typescript
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

interface EmailOptions {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email Templates
const templates = {
  welcome: `
    <h1>Hoş Geldiniz!</h1>
    <p>Merhaba {{name}},</p>
    <p>Dernek Yönetim Sistemi'ne hoş geldiniz.</p>
    <p>Kullanıcı adınız: {{email}}</p>
  `,
  passwordReset: `
    <h1>Şifre Sıfırlama</h1>
    <p>Merhaba {{name}},</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
    <a href="{{resetLink}}">Şifremi Sıfırla</a>
  `,
  notification: `
    <h1>{{title}}</h1>
    <p>{{message}}</p>
  `,
  aidApproved: `
    <h1>Yardım Başvurunuz Onaylandı</h1>
    <p>Merhaba {{beneficiaryName}},</p>
    <p>{{aidType}} yardım başvurunuz onaylanmıştır.</p>
    <p>Detaylar: {{details}}</p>
  `,
  scholarshipApproved: `
    <h1>Burs Başvurunuz Onaylandı</h1>
    <p>Merhaba {{studentName}},</p>
    <p>Burs başvurunuz onaylanmıştır.</p>
    <p>Aylık tutar: {{amount}} TL</p>
    <p>Başlangıç: {{startDate}}</p>
  `,
};

// Email Gönderme Fonksiyonu
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Template varsa compile et
    let htmlContent = options.html;
    if (options.template && templates[options.template]) {
      const template = Handlebars.compile(templates[options.template]);
      htmlContent = template(options.templateData || {});
    }

    // Email gönder
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.body,
      html: htmlContent || options.body,
      attachments: options.attachments,
    });

    // Convex'e log kaydet
    const convex = getConvexHttp();
    await convex.mutation(api.communication_logs.create, {
      type: 'email',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      message: options.body || '',
      status: 'sent',
      messageId: info.messageId,
      sentAt: new Date().toISOString(),
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email send error:', error);

    // Hata logla
    const convex = getConvexHttp();
    await convex.mutation(api.communication_logs.create, {
      type: 'email',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      message: options.body || '',
      status: 'failed',
      error: error.message,
      sentAt: new Date().toISOString(),
    });

    throw error;
  }
}

// Bulk Email
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  body: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sendEmail({ to: recipient, subject, body });
      sent++;
    } catch (error) {
      failed++;
    }
  }

  return { sent, failed };
}

// Örnek Kullanımlar
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Dernek Yönetim Sistemi'ne Hoş Geldiniz",
    template: 'welcome',
    templateData: { name, email },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Şifre Sıfırlama',
    template: 'passwordReset',
    templateData: { name, resetLink },
  });
}

export async function sendAidApprovedEmail(
  email: string,
  beneficiaryName: string,
  aidType: string,
  details: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Yardım Başvurunuz Onaylandı',
    template: 'aidApproved',
    templateData: { beneficiaryName, aidType, details },
  });
}
```

### Adım 4: Convex Communication Logs Koleksiyonu

`convex/schema.ts` dosyasına ekle:

```typescript
communication_logs: defineTable({
  type: v.string(), // 'email' | 'sms'
  to: v.string(),
  subject: v.optional(v.string()),
  message: v.string(),
  status: v.string(), // 'sent' | 'failed' | 'pending'
  messageId: v.optional(v.string()),
  error: v.optional(v.string()),
  sentAt: v.string(),
  userId: v.optional(v.id('users')),
  metadata: v.optional(v.any()),
})
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_sent_at', ['sentAt'])
  .index('by_user', ['userId']),
```

### Adım 5: Convex Communication Logs Functions

`convex/communication_logs.ts` - YENİ DOSYA:

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    type: v.string(),
    to: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.string(),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.string(),
    userId: v.optional(v.id('users')),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('communication_logs', args);
  },
});

export const list = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('communication_logs');

    if (args.type) {
      query = query.withIndex('by_type', (q) => q.eq('type', args.type));
    }

    const logs = await query.order('desc').take(args.limit || 100);

    return logs;
  },
});

export const getStats = query({
  args: {
    type: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('communication_logs')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .filter((q) =>
        q.and(q.gte(q.field('sentAt'), args.startDate), q.lte(q.field('sentAt'), args.endDate))
      )
      .collect();

    return {
      total: logs.length,
      sent: logs.filter((l) => l.status === 'sent').length,
      failed: logs.filter((l) => l.status === 'failed').length,
    };
  },
});
```

### Adım 6: Test

```typescript
// src/__tests__/lib/services/email.test.ts
import { describe, it, expect, vi } from 'vitest';
import { sendEmail, sendWelcomeEmail } from '@/lib/services/email';

describe('Email Service', () => {
  it('should send email successfully', async () => {
    await expect(
      sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email',
      })
    ).resolves.not.toThrow();
  });

  it('should send welcome email with template', async () => {
    await expect(sendWelcomeEmail('test@example.com', 'Test User')).resolves.not.toThrow();
  });
});
```

---

## 📱 2. SMS SERVİSİ - Production Implementation

### Adım 1: Dependencies

```bash
npm install twilio
npm install -D @types/twilio
```

### Adım 2: Environment Variables

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+905xxxxxxxxx
```

### Adım 3: SMS Service Implementation

`src/lib/services/sms.ts` dosyasını güncelle:

```typescript
import twilio from 'twilio';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface SMSOptions {
  to: string; // +90 5XX XXX XX XX
  message: string;
  priority?: 'normal' | 'high';
  metadata?: Record<string, any>;
}

export async function sendSMS(options: SMSOptions): Promise<void> {
  try {
    // Phone numarası validasyonu
    const cleanPhone = options.to.replace(/\s/g, '');
    if (!cleanPhone.startsWith('+90')) {
      throw new Error('Invalid Turkish phone number');
    }

    // SMS gönder
    const result = await twilioClient.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone,
    });

    // Convex'e log kaydet
    const convex = getConvexHttp();
    await convex.mutation(api.communication_logs.create, {
      type: 'sms',
      to: cleanPhone,
      message: options.message,
      status: 'sent',
      messageId: result.sid,
      sentAt: new Date().toISOString(),
      metadata: options.metadata,
    });

    console.log('SMS sent:', result.sid);
  } catch (error) {
    console.error('SMS send error:', error);

    // Hata logla
    const convex = getConvexHttp();
    await convex.mutation(api.communication_logs.create, {
      type: 'sms',
      to: options.to,
      message: options.message,
      status: 'failed',
      error: error.message,
      sentAt: new Date().toISOString(),
      metadata: options.metadata,
    });

    throw error;
  }
}

// Bulk SMS
export async function sendBulkSMS(
  recipients: string[],
  message: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sendSMS({ to: recipient, message });
      sent++;
      // Rate limiting için bekleme
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      failed++;
    }
  }

  return { sent, failed };
}

// Örnek Kullanımlar
export async function sendVerificationSMS(phone: string, code: string): Promise<void> {
  const message = `Dernek Yönetim Sistemi doğrulama kodunuz: ${code}`;
  await sendSMS({ to: phone, message });
}

export async function sendNotificationSMS(phone: string, notification: string): Promise<void> {
  await sendSMS({ to: phone, message: notification });
}

export async function sendAidApprovedSMS(
  phone: string,
  beneficiaryName: string,
  aidType: string
): Promise<void> {
  const message = `Merhaba ${beneficiaryName}, ${aidType} yardım başvurunuz onaylanmıştır. Detaylar için sisteme giriş yapınız.`;
  await sendSMS({ to: phone, message });
}
```

### Adım 4: Test

```bash
npm run test src/__tests__/lib/services/sms.test.ts
```

---

## 📊 3. ANALYTICS ENDPOINT - Fix

### Adım 1: API Route Oluştur

`src/app/api/analytics/route.ts` - YENİ DOSYA:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties, userId, sessionId } = body;

    // Validation
    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Convex'e kaydet
    const convex = getConvexHttp();
    await convex.mutation(api.analytics.track, {
      event,
      properties: properties || {},
      userId: userId || null,
      sessionId: sessionId || null,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!event || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'event, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();
    const stats = await convex.query(api.analytics.getEventStats, {
      event,
      startDate,
      endDate,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
```

### Adım 2: Convex Analytics Schema

`convex/schema.ts` - Ekle:

```typescript
analytics_events: defineTable({
  event: v.string(),
  userId: v.optional(v.id('users')),
  sessionId: v.optional(v.string()),
  properties: v.any(),
  timestamp: v.string(),
  userAgent: v.optional(v.string()),
})
  .index('by_event', ['event'])
  .index('by_user', ['userId'])
  .index('by_timestamp', ['timestamp']),
```

### Adım 3: Convex Analytics Functions

`convex/analytics.ts` - YENİ DOSYA:

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const track = mutation({
  args: {
    event: v.string(),
    properties: v.any(),
    userId: v.optional(v.id('users')),
    sessionId: v.optional(v.string()),
    timestamp: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('analytics_events', args);
  },
});

export const getEventStats = query({
  args: {
    event: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analytics_events')
      .withIndex('by_event', (q) => q.eq('event', args.event))
      .filter((q) =>
        q.and(
          q.gte(q.field('timestamp'), args.startDate),
          q.lte(q.field('timestamp'), args.endDate)
        )
      )
      .collect();

    const uniqueUsers = new Set(events.filter((e) => e.userId).map((e) => e.userId));

    return {
      count: events.length,
      uniqueUsers: uniqueUsers.size,
      events: events.slice(0, 100), // İlk 100 eventi döndür
    };
  },
});

export const getTopEvents = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analytics_events')
      .withIndex('by_timestamp')
      .filter((q) =>
        q.and(
          q.gte(q.field('timestamp'), args.startDate),
          q.lte(q.field('timestamp'), args.endDate)
        )
      )
      .collect();

    // Event'leri say
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Sırala ve limit uygula
    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, args.limit || 10)
      .map(([event, count]) => ({ event, count }));
  },
});
```

### Adım 4: Frontend Integration

`src/lib/analytics.ts` - Güncelle:

```typescript
export async function trackEvent(event: string, properties?: Record<string, any>) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties,
        userId: getUserId(), // Auth store'dan al
        sessionId: getSessionId(), // Session'dan al
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
```

---

## 🔒 4. AUDIT LOGGING - Implementation

### Adım 1: Convex Schema

`convex/schema.ts` - Ekle:

```typescript
audit_logs: defineTable({
  userId: v.id('users'),
  userName: v.string(),
  action: v.string(), // 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  resource: v.string(), // 'beneficiary' | 'user' | 'donation'
  resourceId: v.string(),
  changes: v.optional(v.any()), // { before: {}, after: {} }
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  timestamp: v.string(),
  metadata: v.optional(v.any()),
})
  .index('by_user', ['userId'])
  .index('by_resource', ['resource', 'resourceId'])
  .index('by_action', ['action'])
  .index('by_timestamp', ['timestamp']),
```

### Adım 2: Convex Audit Functions

`convex/audit_logs.ts` - YENİ DOSYA:

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth } from './auth';

export const logAction = mutation({
  args: {
    action: v.string(),
    resource: v.string(),
    resourceId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    await ctx.db.insert('audit_logs', {
      userId: user._id,
      userName: user.name,
      ...args,
      timestamp: new Date().toISOString(),
    });
  },
});

export const list = query({
  args: {
    resourceId: v.optional(v.string()),
    userId: v.optional(v.id('users')),
    action: v.optional(v.string()),
    resource: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let query = ctx.db.query('audit_logs');

    // Filters
    if (args.userId) {
      query = query.withIndex('by_user', (q) => q.eq('userId', args.userId));
    } else if (args.resource && args.resourceId) {
      query = query.withIndex('by_resource', (q) =>
        q.eq('resource', args.resource).eq('resourceId', args.resourceId)
      );
    }

    let logs = await query.order('desc').take(args.limit || 100);

    // Additional filters
    if (args.startDate || args.endDate) {
      logs = logs.filter((log) => {
        if (args.startDate && log.timestamp < args.startDate) return false;
        if (args.endDate && log.timestamp > args.endDate) return false;
        return true;
      });
    }

    if (args.action) {
      logs = logs.filter((log) => log.action === args.action);
    }

    return logs;
  },
});

export const getStats = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const logs = await ctx.db
      .query('audit_logs')
      .filter((q) =>
        q.and(
          q.gte(q.field('timestamp'), args.startDate),
          q.lte(q.field('timestamp'), args.endDate)
        )
      )
      .collect();

    return {
      total: logs.length,
      byAction: logs.reduce(
        (acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byResource: logs.reduce(
        (acc, log) => {
          acc[log.resource] = (acc[log.resource] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topUsers: getTopUsers(logs, 10),
    };
  },
});

function getTopUsers(logs: any[], limit: number) {
  const userCounts = logs.reduce(
    (acc, log) => {
      const key = `${log.userId}:${log.userName}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key, count]) => {
      const [userId, userName] = key.split(':');
      return { userId, userName, count };
    });
}
```

### Adım 3: Helper Function

`src/lib/audit.ts` - YENİ DOSYA:

```typescript
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

export async function logAuditAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  resource: string,
  resourceId: string,
  changes?: { before?: any; after?: any },
  request?: Request
) {
  try {
    const convex = getConvexHttp();
    await convex.mutation(api.audit_logs.logAction, {
      action,
      resource,
      resourceId,
      changes,
      ipAddress: request?.headers.get('x-forwarded-for') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
```

### Adım 4: Usage Example

```typescript
// src/app/api/beneficiaries/[id]/route.ts
import { logAuditAction } from '@/lib/audit';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const before = await convex.query(api.beneficiaries.get, { id: params.id });

  const body = await request.json();
  await convex.mutation(api.beneficiaries.update, {
    id: params.id,
    ...body,
  });

  const after = await convex.query(api.beneficiaries.get, { id: params.id });

  await logAuditAction('UPDATE', 'beneficiary', params.id, { before, after }, request);

  return NextResponse.json({ success: true });
}
```

---

## 📁 5. DOSYA YÜKLEME - Complete Implementation

### Adım 1: Convex Storage API

`convex/storage.ts` - Güncelle:

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth } from './auth';

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    contentType: v.string(),
    size: v.number(),
    relatedTo: v.optional(
      v.object({
        collection: v.string(),
        id: v.string(),
      })
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const documentId = await ctx.db.insert('documents', {
      storageId: args.storageId,
      fileName: args.fileName,
      contentType: args.contentType,
      size: args.size,
      uploadedBy: user._id,
      uploadedAt: new Date().toISOString(),
      relatedTo: args.relatedTo,
      metadata: args.metadata,
    });

    return documentId;
  },
});

export const getFile = query({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) return null;

    const url = await ctx.storage.getUrl(document.storageId);

    return { ...document, url };
  },
});

export const deleteFile = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error('Document not found');

    await ctx.storage.delete(document.storageId);
    await ctx.db.delete(args.id);
  },
});

export const listFiles = query({
  args: {
    collection: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const documents = await ctx.db.query('documents').collect();

    let filtered = documents;
    if (args.collection && args.relatedId) {
      filtered = documents.filter(
        (doc) =>
          doc.relatedTo?.collection === args.collection && doc.relatedTo?.id === args.relatedId
      );
    }

    // Get URLs
    const withUrls = await Promise.all(
      filtered.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return withUrls;
  },
});
```

### Adım 2: API Routes

`src/app/api/storage/upload/route.ts` - YENİ DOSYA:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validations
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Get upload URL from Convex
    const convex = getConvexHttp();
    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl);

    // Upload to Convex Storage
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    const { storageId } = await result.json();

    // Save metadata
    const relatedTo = formData.get('relatedTo');
    const metadata = formData.get('metadata');

    const documentId = await convex.mutation(api.storage.saveFile, {
      storageId,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      relatedTo: relatedTo ? JSON.parse(relatedTo as string) : undefined,
      metadata: metadata ? JSON.parse(metadata as string) : undefined,
    });

    return NextResponse.json({ documentId, storageId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### Adım 3: React Component

`src/components/documents/FileUpload.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onUpload: (fileId: string) => void;
  relatedTo?: {
    collection: string;
    id: string;
  };
  maxSize?: number; // bytes
  accept?: string[]; // MIME types
}

export function FileUpload({
  onUpload,
  relatedTo,
  maxSize = 10 * 1024 * 1024,
  accept = ['image/*', 'application/pdf', '.doc', '.docx'],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        if (relatedTo) {
          formData.append('relatedTo', JSON.stringify(relatedTo));
        }

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            setProgress(percentage);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const { documentId } = JSON.parse(xhr.responseText);
            onUpload(documentId);
            setProgress(100);
          } else {
            setError('Yükleme başarısız');
          }
          setUploading(false);
        });

        xhr.addEventListener('error', () => {
          setError('Yükleme başarısız');
          setUploading(false);
        });

        xhr.open('POST', '/api/storage/upload');
        xhr.send(formData);
      } catch (err) {
        setError('Yükleme başarısız');
        setUploading(false);
      }
    },
    maxSize,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Dosyayı buraya bırakın'
            : 'Dosya yüklemek için tıklayın veya sürükleyin'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maksimum {(maxSize / 1024 / 1024).toFixed(0)} MB
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 text-center">
            Yükleniyor... %{progress.toFixed(0)}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Sonraki Adımlar

1. Email servisi için SMTP credentials alın
2. Twilio hesabı oluşturun ve SMS servisini test edin
3. Analytics endpoint'i deploy edin ve test edin
4. Audit logging'i tüm critical işlemlere ekleyin
5. Dosya yükleme UI'sini tüm ilgili sayfalara entegre edin
6. Comprehensive testler yazın

---

**Not:** Her implementasyon için test yazılmalı ve production'a geçmeden önce staging environment'ta test edilmelidir.
