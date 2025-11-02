#!/usr/bin/env node

/**
 * Database Migration Script for Dernek Yönetim Sistemi
 * Creates all 13 collections in Appwrite with proper schemas and permissions
 *
 * Collections created:
 * - users (kullanıcılar)
 * - beneficiaries (ihtiyaç sahipleri - 40+ alan)
 * - donations (bağışlar)
 * - aid_requests (yardım talepleri)
 * - aid_applications (yardım başvuruları - Portal Plus)
 * - scholarships (burslar)
 * - parameters (parametreler - 107 parametre, 26 kategori)
 * - tasks (görevler - 188 bekleyen iş)
 * - meetings (toplantılar)
 * - messages (mesajlar - SMS/Email)
 * - finance_records (finans kayıtları)
 * - orphans (yetimler - 35+ alan)
 * - sponsors (sponsorlar)
 * - campaigns (kampanyalar)
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

// Load environment variables
dotenv.config();

// TypeScript strict mode - define all types explicitly
type Permission = {
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
};

type AttributeType = 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'enum' | 'array';

type CollectionAttribute = {
  key: string;
  type: AttributeType;
  required: boolean;
  array?: boolean;
  size?: number;
  default?: any;
  arrayOptions?: {
    minItems?: number;
    maxItems?: number;
  };
  enumOptions?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
};

type CollectionDefinition = {
  name: string;
  description: string;
  attributes: CollectionAttribute[];
  permissions: Permission;
  indexes?: Array<{
    key: string;
    type: 'unique' | 'key' | 'fulltext';
    attributes: string[];
  }>;
};

// Logger utility
class MigrationLogger {
  private static log(
    prefix: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const timestamp = new Date().toISOString();
    const color = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    }[type];

    const reset = '\x1b[0m';
    console.log(`${color}[${timestamp}] ${prefix}: ${message}${reset}`);
  }

  static info(message: string) {
    this.log('INFO', message, 'info');
  }
  static success(message: string) {
    this.log('SUCCESS', message, 'success');
  }
  static warning(message: string) {
    this.log('WARNING', message, 'warning');
  }
  static error(message: string) {
    this.log('ERROR', message, 'error');
  }
}

// Collection definitions based on TypeScript types
const COLLECTIONS_DEFINITIONS: Record<string, CollectionDefinition> = {
  users: {
    name: 'users',
    description: 'Kullanıcılar - Sistem kullanıcıları ve roller',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'email', type: 'string', required: true, size: 255 },
      { key: 'role', type: 'enum', required: true, enumOptions: ['admin', 'user', 'viewer'] },
      { key: 'avatar', type: 'string', required: false, size: 500 },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'labels', type: 'array', required: false, array: true },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'email_idx', type: 'unique', attributes: ['email'] },
      { key: 'role_idx', type: 'key', attributes: ['role'] },
    ],
  },

  beneficiaries: {
    name: 'beneficiaries',
    description: 'İhtiyaç Sahipleri - 40+ alan ile genişletilmiş',
    attributes: [
      // Temel Kişisel Bilgiler
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'tc_no', type: 'string', required: true, size: 11 },
      { key: 'phone', type: 'string', required: true, size: 15 },
      { key: 'email', type: 'string', required: false, size: 255 },
      { key: 'birth_date', type: 'datetime', required: false },
      {
        key: 'gender',
        type: 'enum',
        required: false,
        enumOptions: ['Erkek', 'Kadın', 'Belirtmek İstemiyorum'],
      },
      { key: 'nationality', type: 'string', required: false, size: 100 },
      {
        key: 'religion',
        type: 'enum',
        required: false,
        enumOptions: ['Islam', 'Hristiyan', 'Yahudi', 'Diğer', 'Belirtmek İstemiyorum'],
      },
      {
        key: 'marital_status',
        type: 'enum',
        required: false,
        enumOptions: ['Bekar', 'Evli', 'Boşanmış', 'Dul'],
      },

      // Adres Bilgileri
      { key: 'address', type: 'string', required: true, size: 500 },
      { key: 'city', type: 'string', required: true, size: 100 },
      { key: 'district', type: 'string', required: true, size: 100 },
      { key: 'neighborhood', type: 'string', required: true, size: 100 },

      // Aile Bilgileri
      { key: 'family_size', type: 'integer', required: true, validation: { min: 1, max: 20 } },
      { key: 'children_count', type: 'integer', required: false, validation: { min: 0, max: 20 } },
      {
        key: 'orphan_children_count',
        type: 'integer',
        required: false,
        default: 0,
        validation: { min: 0, max: 20 },
      },
      {
        key: 'elderly_count',
        type: 'integer',
        required: false,
        default: 0,
        validation: { min: 0, max: 20 },
      },
      {
        key: 'disabled_count',
        type: 'integer',
        required: false,
        default: 0,
        validation: { min: 0, max: 20 },
      },

      // Ekonomik Durum
      {
        key: 'income_level',
        type: 'enum',
        required: false,
        enumOptions: [
          'Yok',
          '1-2000 TL',
          '2001-4000 TL',
          '4001-6000 TL',
          '6001-8000 TL',
          '8001+ TL',
        ],
      },
      { key: 'income_source', type: 'string', required: false, size: 255 },
      { key: 'has_debt', type: 'boolean', required: true, default: false },
      {
        key: 'housing_type',
        type: 'enum',
        required: false,
        enumOptions: ['Kiracı', 'Ev Sahibi', 'Lojman', 'Konak', 'Diğer'],
      },
      { key: 'has_vehicle', type: 'boolean', required: true, default: false },

      // Sağlık Bilgileri
      { key: 'health_status', type: 'string', required: false, size: 255 },
      { key: 'has_chronic_illness', type: 'boolean', required: true, default: false },
      { key: 'chronic_illness_detail', type: 'string', required: false, size: 500 },
      { key: 'has_disability', type: 'boolean', required: true, default: false },
      { key: 'disability_detail', type: 'string', required: false, size: 500 },
      { key: 'has_health_insurance', type: 'boolean', required: true, default: false },
      { key: 'regular_medication', type: 'string', required: false, size: 500 },

      // Eğitim ve İstihdam
      {
        key: 'education_level',
        type: 'enum',
        required: false,
        enumOptions: [
          'Okur-Yazar',
          'İlkokul',
          'Ortaokul',
          'Lise',
          'Üniversite',
          'Yüksek Lisans',
          'Doktora',
        ],
      },
      { key: 'occupation', type: 'string', required: false, size: 255 },
      {
        key: 'employment_status',
        type: 'enum',
        required: false,
        enumOptions: ['Çalışmıyor', 'Çalışıyor', 'Emekli', 'Öğrenci', 'Ev Hanımı'],
      },

      // Yardım Talebi
      { key: 'aid_type', type: 'string', required: false, size: 255 },
      { key: 'aid_amount', type: 'float', required: false, validation: { min: 0 } },
      { key: 'aid_duration', type: 'string', required: false, size: 100 },
      {
        key: 'priority',
        type: 'enum',
        required: false,
        enumOptions: ['Düşük', 'Normal', 'Yüksek', 'Acil'],
      },

      // Referans Bilgileri
      { key: 'reference_name', type: 'string', required: false, size: 255 },
      { key: 'reference_phone', type: 'string', required: false, size: 15 },
      { key: 'reference_relation', type: 'string', required: false, size: 100 },
      { key: 'application_source', type: 'string', required: false, size: 255 },

      // Ek Bilgiler
      { key: 'notes', type: 'string', required: false, size: 1000 },
      { key: 'previous_aid', type: 'boolean', required: true, default: false },
      { key: 'other_organization_aid', type: 'boolean', required: true, default: false },
      { key: 'emergency', type: 'boolean', required: true, default: false },
      {
        key: 'contact_preference',
        type: 'enum',
        required: false,
        enumOptions: ['Telefon', 'E-posta', 'Yüz Yüze'],
      },

      // Durum ve Onay
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['TASLAK', 'AKTIF', 'PASIF', 'SILINDI'],
      },
      {
        key: 'approval_status',
        type: 'enum',
        required: false,
        enumOptions: ['pending', 'approved', 'rejected'],
      },
      { key: 'approved_by', type: 'string', required: false, size: 100 },
      { key: 'approved_at', type: 'datetime', required: false },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'tc_no_idx', type: 'unique', attributes: ['tc_no'] },
      { key: 'phone_idx', type: 'key', attributes: ['phone'] },
      { key: 'city_district_idx', type: 'key', attributes: ['city', 'district'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'priority_idx', type: 'key', attributes: ['priority'] },
    ],
  },

  donations: {
    name: 'donations',
    description: 'Bağışlar - Bağış kayıtları ve makbuz yönetimi',
    attributes: [
      { key: 'donor_name', type: 'string', required: true, size: 255 },
      { key: 'donor_phone', type: 'string', required: true, size: 15 },
      { key: 'donor_email', type: 'string', required: false, size: 255 },
      { key: 'amount', type: 'float', required: true, validation: { min: 0 } },
      { key: 'currency', type: 'enum', required: true, enumOptions: ['TRY', 'USD', 'EUR'] },
      { key: 'donation_type', type: 'string', required: true, size: 100 },
      { key: 'payment_method', type: 'string', required: true, size: 100 },
      { key: 'donation_purpose', type: 'string', required: true, size: 255 },
      { key: 'notes', type: 'string', required: false, size: 500 },
      { key: 'receipt_number', type: 'string', required: true, size: 50 },
      { key: 'receipt_file_id', type: 'string', required: false, size: 100 },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['pending', 'completed', 'cancelled'],
      },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'receipt_number_idx', type: 'unique', attributes: ['receipt_number'] },
      { key: 'donor_phone_idx', type: 'key', attributes: ['donor_phone'] },
      { key: 'status_date_idx', type: 'key', attributes: ['status'] },
      { key: 'amount_idx', type: 'key', attributes: ['amount'] },
    ],
  },

  aid_requests: {
    name: 'aid_requests',
    description: 'Yardım Talepleri - İhtiyaç sahiplerinden gelen yardım talepleri',
    attributes: [
      { key: 'beneficiary_id', type: 'string', required: true, size: 100 },
      {
        key: 'request_type',
        type: 'enum',
        required: true,
        enumOptions: ['financial', 'food', 'health', 'education', 'housing'],
      },
      { key: 'description', type: 'string', required: true, size: 1000 },
      { key: 'amount_requested', type: 'float', required: false, validation: { min: 0 } },
      {
        key: 'priority',
        type: 'enum',
        required: true,
        enumOptions: ['low', 'medium', 'high', 'urgent'],
      },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['pending', 'approved', 'rejected', 'completed'],
      },
      { key: 'approved_by', type: 'string', required: false, size: 100 },
      { key: 'approved_at', type: 'datetime', required: false },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'beneficiary_idx', type: 'key', attributes: ['beneficiary_id'] },
      { key: 'status_priority_idx', type: 'key', attributes: ['status', 'priority'] },
      { key: 'request_type_idx', type: 'key', attributes: ['request_type'] },
    ],
  },

  aid_applications: {
    name: 'aid_applications',
    description: 'Yardım Başvuruları - Portal Plus stil başvurular',
    attributes: [
      // Başvuru Bilgileri
      { key: 'application_date', type: 'datetime', required: true },
      {
        key: 'applicant_type',
        type: 'enum',
        required: true,
        enumOptions: ['person', 'organization', 'partner'],
      },
      { key: 'applicant_name', type: 'string', required: true, size: 255 },
      { key: 'beneficiary_id', type: 'string', required: false, size: 100 },

      // Yardım Türleri (Portal Plus'taki 5 tür)
      { key: 'one_time_aid', type: 'float', required: false, validation: { min: 0 } },
      { key: 'regular_financial_aid', type: 'float', required: false, validation: { min: 0 } },
      { key: 'regular_food_aid', type: 'integer', required: false, validation: { min: 0 } },
      { key: 'in_kind_aid', type: 'integer', required: false, validation: { min: 0 } },
      { key: 'service_referral', type: 'integer', required: false, validation: { min: 0 } },

      // Aşama ve Durum
      {
        key: 'stage',
        type: 'enum',
        required: true,
        enumOptions: ['draft', 'under_review', 'approved', 'ongoing', 'completed'],
      },
      { key: 'status', type: 'enum', required: true, enumOptions: ['open', 'closed'] },

      // Detaylar
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'notes', type: 'string', required: false, size: 500 },
      {
        key: 'priority',
        type: 'enum',
        required: false,
        enumOptions: ['low', 'normal', 'high', 'urgent'],
      },

      // İşlem Bilgileri
      { key: 'processed_by', type: 'string', required: false, size: 100 },
      { key: 'processed_at', type: 'datetime', required: false },
      { key: 'approved_by', type: 'string', required: false, size: 100 },
      { key: 'approved_at', type: 'datetime', required: false },
      { key: 'completed_at', type: 'datetime', required: false },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'applicant_type_idx', type: 'key', attributes: ['applicant_type'] },
      { key: 'stage_status_idx', type: 'key', attributes: ['stage', 'status'] },
      { key: 'priority_idx', type: 'key', attributes: ['priority'] },
      { key: 'beneficiary_idx', type: 'key', attributes: ['beneficiary_id'] },
    ],
  },

  scholarships: {
    name: 'scholarships',
    description: 'Burslar - Öğrenci burs yönetimi',
    attributes: [
      { key: 'student_name', type: 'string', required: true, size: 255 },
      { key: 'tc_no', type: 'string', required: true, size: 11 },
      { key: 'school_name', type: 'string', required: true, size: 255 },
      { key: 'grade', type: 'integer', required: true, validation: { min: 1, max: 12 } },
      { key: 'scholarship_amount', type: 'float', required: true, validation: { min: 0 } },
      {
        key: 'scholarship_type',
        type: 'enum',
        required: true,
        enumOptions: ['monthly', 'one-time', 'annual'],
      },
      { key: 'start_date', type: 'datetime', required: false },
      { key: 'end_date', type: 'datetime', required: false },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['active', 'paused', 'completed'],
      },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'tc_no_idx', type: 'key', attributes: ['tc_no'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'grade_idx', type: 'key', attributes: ['grade'] },
      { key: 'type_idx', type: 'key', attributes: ['scholarship_type'] },
    ],
  },

  parameters: {
    name: 'parameters',
    description: 'Parametreler - 107 parametre, 26 kategori',
    attributes: [
      {
        key: 'category',
        type: 'enum',
        required: true,
        enumOptions: [
          'gender',
          'religion',
          'marital_status',
          'employment_status',
          'living_status',
          'housing_type',
          'income_level',
          'guardian_relation',
          'education_status',
          'education_level',
          'education_success',
          'death_reason',
          'health_problem',
          'illness',
          'treatment',
          'special_condition',
          'occupation',
          'cancellation_reason',
          'document_type',
          'refund_reason',
          'sponsorship_end_reason',
          'sponsorship_continue',
          'school_type',
          'school_institution_type',
          'orphan_assignment_correction',
          'orphan_detail',
        ],
      },
      { key: 'name_tr', type: 'string', required: true, size: 255 },
      { key: 'name_en', type: 'string', required: false, size: 255 },
      { key: 'name_ar', type: 'string', required: false, size: 255 },
      { key: 'name_ru', type: 'string', required: false, size: 255 },
      { key: 'name_fr', type: 'string', required: false, size: 255 },
      { key: 'value', type: 'string', required: true, size: 255 },
      { key: 'order', type: 'integer', required: true, validation: { min: 0, max: 999 } },
      { key: 'is_active', type: 'boolean', required: true, default: true },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'category_order_idx', type: 'key', attributes: ['category', 'order'] },
      { key: 'active_idx', type: 'key', attributes: ['is_active'] },
      { key: 'value_idx', type: 'key', attributes: ['value'] },
    ],
  },

  tasks: {
    name: 'tasks',
    description: 'Görevler - Portal Plus stil görev yönetimi (188 bekleyen iş)',
    attributes: [
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'assigned_to', type: 'string', required: false, size: 100 },
      { key: 'created_by', type: 'string', required: true, size: 100 },
      {
        key: 'priority',
        type: 'enum',
        required: true,
        enumOptions: ['low', 'normal', 'high', 'urgent'],
      },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['pending', 'in_progress', 'completed', 'cancelled'],
      },
      { key: 'due_date', type: 'datetime', required: false },
      { key: 'completed_at', type: 'datetime', required: false },
      { key: 'category', type: 'string', required: false, size: 100 },
      { key: 'tags', type: 'array', required: false, array: true },
      { key: 'is_read', type: 'boolean', required: true, default: false },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'assigned_to_status_idx', type: 'key', attributes: ['assigned_to', 'status'] },
      { key: 'priority_status_idx', type: 'key', attributes: ['priority', 'status'] },
      { key: 'due_date_idx', type: 'key', attributes: ['due_date'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
      { key: 'is_read_idx', type: 'key', attributes: ['is_read'] },
    ],
  },

  meetings: {
    name: 'meetings',
    description: 'Toplantılar - Portal Plus stil toplantı yönetimi',
    attributes: [
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'meeting_date', type: 'datetime', required: true },
      { key: 'location', type: 'string', required: false, size: 255 },
      { key: 'organizer', type: 'string', required: true, size: 100 },
      { key: 'participants', type: 'array', required: true, array: true },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      },
      {
        key: 'meeting_type',
        type: 'enum',
        required: true,
        enumOptions: ['general', 'committee', 'board', 'other'],
      },
      { key: 'agenda', type: 'string', required: false, size: 1000 },
      { key: 'notes', type: 'string', required: false, size: 1000 },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'meeting_date_idx', type: 'key', attributes: ['meeting_date'] },
      { key: 'status_type_idx', type: 'key', attributes: ['status', 'meeting_type'] },
      { key: 'organizer_idx', type: 'key', attributes: ['organizer'] },
    ],
  },

  messages: {
    name: 'messages',
    description: 'Mesajlar - SMS ve E-posta mesaj yönetimi',
    attributes: [
      {
        key: 'message_type',
        type: 'enum',
        required: true,
        enumOptions: ['sms', 'email', 'internal'],
      },
      { key: 'sender', type: 'string', required: true, size: 100 },
      { key: 'recipients', type: 'array', required: true, array: true },
      { key: 'subject', type: 'string', required: false, size: 255 },
      { key: 'content', type: 'string', required: true, size: 5000 },
      { key: 'sent_at', type: 'datetime', required: false },
      { key: 'status', type: 'enum', required: true, enumOptions: ['draft', 'sent', 'failed'] },
      { key: 'is_bulk', type: 'boolean', required: true, default: false },
      { key: 'template_id', type: 'string', required: false, size: 100 },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'message_type_idx', type: 'key', attributes: ['message_type'] },
      { key: 'status_sent_idx', type: 'key', attributes: ['status', 'sent_at'] },
      { key: 'is_bulk_idx', type: 'key', attributes: ['is_bulk'] },
      { key: 'template_id_idx', type: 'key', attributes: ['template_id'] },
    ],
  },

  finance_records: {
    name: 'finance_records',
    description: 'Finans Kayıtları - Gelir-Gider yönetimi',
    attributes: [
      { key: 'record_type', type: 'enum', required: true, enumOptions: ['income', 'expense'] },
      { key: 'category', type: 'string', required: true, size: 100 },
      { key: 'amount', type: 'float', required: true, validation: { min: 0 } },
      { key: 'currency', type: 'enum', required: true, enumOptions: ['TRY', 'USD', 'EUR'] },
      { key: 'description', type: 'string', required: true, size: 500 },
      { key: 'transaction_date', type: 'datetime', required: true },
      { key: 'payment_method', type: 'string', required: false, size: 100 },
      { key: 'receipt_number', type: 'string', required: false, size: 50 },
      { key: 'receipt_file_id', type: 'string', required: false, size: 100 },
      { key: 'related_to', type: 'string', required: false, size: 100 },
      { key: 'created_by', type: 'string', required: true, size: 100 },
      { key: 'approved_by', type: 'string', required: false, size: 100 },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['pending', 'approved', 'rejected'],
      },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'record_type_date_idx', type: 'key', attributes: ['record_type', 'transaction_date'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
      { key: 'created_by_idx', type: 'key', attributes: ['created_by'] },
    ],
  },

  orphans: {
    name: 'orphans',
    description: 'Yetimler - Portal Plus stil yetim/öğrenci yönetimi (35+ alan)',
    attributes: [
      // Temel Bilgiler
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'tc_no', type: 'string', required: true, size: 11 },
      { key: 'birth_date', type: 'datetime', required: true },
      { key: 'gender', type: 'enum', required: true, enumOptions: ['Erkek', 'Kadın'] },
      { key: 'nationality', type: 'string', required: false, size: 100 },
      { key: 'religion', type: 'string', required: false, size: 100 },

      // Kategori (Portal Plus parametreleri)
      {
        key: 'category',
        type: 'enum',
        required: true,
        enumOptions: ['ihh_orphan', 'orphan', 'family', 'education_scholarship'],
      },
      {
        key: 'special_condition',
        type: 'enum',
        required: false,
        enumOptions: ['Yetim', 'Öksüz', 'Mülteci'],
      },

      // Vasi Bilgileri
      { key: 'guardian_name', type: 'string', required: false, size: 255 },
      {
        key: 'guardian_relation',
        type: 'enum',
        required: false,
        enumOptions: ['Anne', 'Baba', 'Büyükanne', 'Büyükbaba', 'Amca', 'Teyze', 'Diğer'],
      },
      { key: 'guardian_phone', type: 'string', required: false, size: 15 },
      { key: 'guardian_tc_no', type: 'string', required: false, size: 11 },

      // Vefat Bilgileri (Ebeveyn)
      {
        key: 'father_status',
        type: 'enum',
        required: false,
        enumOptions: ['Hayatta', 'Vefat Etmiş'],
      },
      { key: 'father_death_date', type: 'datetime', required: false },
      { key: 'father_death_reason', type: 'string', required: false, size: 255 },
      {
        key: 'mother_status',
        type: 'enum',
        required: false,
        enumOptions: ['Hayatta', 'Vefat Etmiş'],
      },
      { key: 'mother_death_date', type: 'datetime', required: false },
      { key: 'mother_death_reason', type: 'string', required: false, size: 255 },

      // Adres
      { key: 'address', type: 'string', required: true, size: 500 },
      { key: 'city', type: 'string', required: true, size: 100 },
      { key: 'district', type: 'string', required: true, size: 100 },
      { key: 'neighborhood', type: 'string', required: true, size: 100 },

      // Eğitim
      {
        key: 'education_status',
        type: 'enum',
        required: false,
        enumOptions: ['Okul Çağında', 'Okula Gidiyor', 'Mezun', 'Okula Gitmiyor'],
      },
      { key: 'school_name', type: 'string', required: false, size: 255 },
      {
        key: 'school_type',
        type: 'enum',
        required: false,
        enumOptions: ['İlköğretim', 'Ortaokul', 'Lise', 'Üniversite'],
      },
      {
        key: 'school_institution_type',
        type: 'enum',
        required: false,
        enumOptions: ['Devlet', 'Özel', 'Vakıf'],
      },
      { key: 'grade', type: 'integer', required: false, validation: { min: 1, max: 12 } },
      {
        key: 'education_success',
        type: 'enum',
        required: false,
        enumOptions: ['Başarılı', 'Orta', 'Başarısız', 'Devamsız'],
      },

      // Sağlık
      { key: 'health_status', type: 'string', required: false, size: 255 },
      { key: 'illness', type: 'string', required: false, size: 255 },
      { key: 'treatment', type: 'string', required: false, size: 255 },
      { key: 'has_disability', type: 'boolean', required: true, default: false },
      { key: 'disability_detail', type: 'string', required: false, size: 500 },

      // Sponsorluk
      { key: 'sponsor_id', type: 'string', required: false, size: 100 },
      { key: 'sponsorship_amount', type: 'float', required: false, validation: { min: 0 } },
      { key: 'sponsorship_start_date', type: 'datetime', required: false },
      {
        key: 'sponsorship_status',
        type: 'enum',
        required: false,
        enumOptions: ['active', 'paused', 'ended'],
      },

      // Dökümanlar
      { key: 'photo_id', type: 'string', required: false, size: 100 },
      { key: 'documents', type: 'array', required: false, array: true },

      // Notlar
      { key: 'notes', type: 'string', required: false, size: 1000 },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['active', 'inactive', 'graduated'],
      },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'tc_no_idx', type: 'unique', attributes: ['tc_no'] },
      { key: 'category_status_idx', type: 'key', attributes: ['category', 'status'] },
      { key: 'city_district_idx', type: 'key', attributes: ['city', 'district'] },
      { key: 'grade_education_idx', type: 'key', attributes: ['grade', 'education_status'] },
      { key: 'sponsor_idx', type: 'key', attributes: ['sponsor_id'] },
    ],
  },

  sponsors: {
    name: 'sponsors',
    description: 'Sponsorlar - Sponsorluk yönetimi',
    attributes: [
      { key: 'sponsor_name', type: 'string', required: true, size: 255 },
      {
        key: 'sponsor_type',
        type: 'enum',
        required: true,
        enumOptions: ['individual', 'corporate'],
      },
      { key: 'email', type: 'string', required: false, size: 255 },
      { key: 'phone', type: 'string', required: false, size: 15 },
      { key: 'address', type: 'string', required: false, size: 500 },
      { key: 'city', type: 'string', required: false, size: 100 },
      { key: 'country', type: 'string', required: false, size: 100 },

      // Sponsorluk Bilgileri
      {
        key: 'total_sponsored',
        type: 'integer',
        required: true,
        default: 0,
        validation: { min: 0 },
      },
      { key: 'monthly_amount', type: 'float', required: false, validation: { min: 0 } },
      { key: 'start_date', type: 'datetime', required: false },

      // İletişim Tercihi
      { key: 'contact_preference', type: 'string', required: false, size: 255 },
      { key: 'notes', type: 'string', required: false, size: 500 },
      { key: 'status', type: 'enum', required: true, enumOptions: ['active', 'inactive'] },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'sponsor_type_idx', type: 'key', attributes: ['sponsor_type'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'email_idx', type: 'key', attributes: ['email'] },
      { key: 'total_sponsored_idx', type: 'key', attributes: ['total_sponsored'] },
    ],
  },

  campaigns: {
    name: 'campaigns',
    description: 'Kampanyalar - Kampanya yönetimi',
    attributes: [
      { key: 'campaign_name', type: 'string', required: true, size: 255 },
      {
        key: 'campaign_type',
        type: 'enum',
        required: true,
        enumOptions: ['donation', 'orphan_support', 'education', 'health', 'ramadan', 'other'],
      },
      { key: 'description', type: 'string', required: true, size: 1000 },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: false },
      { key: 'target_amount', type: 'float', required: false, validation: { min: 0 } },
      {
        key: 'collected_amount',
        type: 'float',
        required: false,
        default: 0,
        validation: { min: 0 },
      },
      {
        key: 'status',
        type: 'enum',
        required: true,
        enumOptions: ['active', 'completed', 'cancelled'],
      },
      { key: 'created_by', type: 'string', required: true, size: 100 },
    ],
    permissions: { read: true, write: true, update: true, delete: true },
    indexes: [
      { key: 'campaign_type_idx', type: 'key', attributes: ['campaign_type'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'start_date_idx', type: 'key', attributes: ['start_date'] },
      { key: 'created_by_idx', type: 'key', attributes: ['created_by'] },
    ],
  },
};

// Database Migration Class
class DatabaseMigration {
  private client: Client;
  private databases: Databases;
  private databaseId: string;
  private errors: string[] = [];

  constructor() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    this.databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || 'dernek_db';

    if (!endpoint || !projectId || !apiKey) {
      throw new Error('Appwrite configuration is missing. Please check environment variables.');
    }

    this.client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

    this.databases = new Databases(this.client);
  }

  // Validate configuration
  private validateConfig(): void {
    const requiredEnvVars = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'APPWRITE_API_KEY',
    ];

    const missing = requiredEnvVars.filter((env) => !process.env[env]);

    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    MigrationLogger.info('✅ Configuration validated successfully');
  }

  // Check if collection exists
  private async collectionExists(collectionId: string): Promise<boolean> {
    try {
      await this.databases.getCollection(this.databaseId, collectionId);
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      throw error;
    }
  }

  // Create a single collection
  private async createCollection(
    collectionId: string,
    definition: CollectionDefinition
  ): Promise<void> {
    try {
      // Check if collection already exists
      if (await this.collectionExists(collectionId)) {
        MigrationLogger.warning(`Collection "${collectionId}" already exists, skipping creation`);
        return;
      }

      MigrationLogger.info(`Creating collection "${collectionId}"...`);

      // Create collection with basic info
      await this.databases.createCollection(
        this.databaseId,
        collectionId,
        definition.name,
        definition.description
      );

      // Add permissions (public read/write access for now)
      // Note: In production, you might want more restrictive permissions
      await this.databases.updateCollection(
        this.databaseId,
        collectionId,
        definition.name,
        definition.description,
        ['*'] // Public read access
      );

      MigrationLogger.success(`✅ Collection "${collectionId}" created successfully`);
    } catch (error: any) {
      const errorMsg = `Failed to create collection "${collectionId}": ${error.message}`;
      MigrationLogger.error(errorMsg);
      this.errors.push(errorMsg);
      throw error;
    }
  }

  // Create attributes for a collection
  private async createAttributes(
    collectionId: string,
    definition: CollectionDefinition
  ): Promise<void> {
    for (const attribute of definition.attributes) {
      try {
        MigrationLogger.info(`Creating attribute "${attribute.key}" in "${collectionId}"...`);

        switch (attribute.type) {
          case 'string':
            await this.databases.createStringAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.size || 255,
              attribute.required,
              attribute.default
            );
            break;

          case 'integer':
            await this.databases.createIntegerAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.default,
              attribute.validation?.min,
              attribute.validation?.max
            );
            break;

          case 'float':
            await this.databases.createFloatAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.default,
              attribute.validation?.min,
              attribute.validation?.max
            );
            break;

          case 'boolean':
            await this.databases.createBooleanAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.default ?? false
            );
            break;

          case 'datetime':
            await this.databases.createDatetimeAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.default
            );
            break;

          case 'enum':
            if (!attribute.enumOptions) {
              throw new Error(`Enum attribute "${attribute.key}" must have enumOptions`);
            }
            await this.databases.createEnumAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              attribute.enumOptions,
              attribute.required,
              attribute.default
            );
            break;

          case 'array':
            // For array attributes, we'll use a string attribute to store JSON
            await this.databases.createStringAttribute(
              this.databaseId,
              collectionId,
              attribute.key,
              1000, // Large enough for JSON array
              attribute.required,
              JSON.stringify(attribute.default || [])
            );
            break;

          default:
            throw new Error(`Unsupported attribute type: ${attribute.type}`);
        }

        MigrationLogger.success(`✅ Attribute "${attribute.key}" created successfully`);
      } catch (error: any) {
        const errorMsg = `Failed to create attribute "${attribute.key}" in "${collectionId}": ${error.message}`;
        MigrationLogger.error(errorMsg);
        this.errors.push(errorMsg);
        throw error;
      }
    }
  }

  // Create indexes for a collection
  private async createIndexes(
    collectionId: string,
    definition: CollectionDefinition
  ): Promise<void> {
    if (!definition.indexes) return;

    for (const index of definition.indexes) {
      try {
        MigrationLogger.info(`Creating index "${index.key}" in "${collectionId}"...`);

        await this.databases.createIndex(
          this.databaseId,
          collectionId,
          index.key,
          index.type,
          index.attributes
        );

        MigrationLogger.success(`✅ Index "${index.key}" created successfully`);
      } catch (error: any) {
        const errorMsg = `Failed to create index "${index.key}" in "${collectionId}": ${error.message}`;
        MigrationLogger.error(errorMsg);
        this.errors.push(errorMsg);
        throw error;
      }
    }
  }

  // Main migration function
  public async run(): Promise<void> {
    MigrationLogger.info('🚀 Starting database migration...');
    const startTime = Date.now();

    try {
      // Validate configuration
      this.validateConfig();

      // Create each collection
      for (const [collectionId, definition] of Object.entries(COLLECTIONS_DEFINITIONS)) {
        try {
          await this.createCollection(collectionId, definition);
          await this.createAttributes(collectionId, definition);
          await this.createIndexes(collectionId, definition);
        } catch (error) {
          // Continue with other collections even if one fails
          MigrationLogger.error(
            `Failed to process collection "${collectionId}", continuing with others...`
          );
          continue;
        }
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (this.errors.length === 0) {
        MigrationLogger.success(`🎉 Migration completed successfully in ${duration.toFixed(2)}s`);
        MigrationLogger.success('All 13 collections created with their schemas and permissions');
      } else {
        MigrationLogger.warning(
          `⚠️ Migration completed with ${this.errors.length} errors in ${duration.toFixed(2)}s`
        );
        MigrationLogger.warning('Some collections may have been created partially');
      }
    } catch (error: any) {
      MigrationLogger.error(`💥 Migration failed: ${error.message}`);
      process.exit(1);
    }
  }

  // Get migration summary
  public getSummary(): { totalCollections: number; errors: string[] } {
    return {
      totalCollections: Object.keys(COLLECTIONS_DEFINITIONS).length,
      errors: [...this.errors],
    };
  }
}

// Main execution
async function main() {
  try {
    const migration = new DatabaseMigration();
    await migration.run();

    const summary = migration.getSummary();
    if (summary.errors.length > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    MigrationLogger.error(`💥 Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

export { DatabaseMigration, COLLECTIONS_DEFINITIONS };
