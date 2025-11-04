import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users Collection
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // UserRole enum
    avatar: v.optional(v.string()),
    isActive: v.boolean(),
    labels: v.optional(v.array(v.string())),
    createdAt: v.optional(v.string()),
    lastLogin: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
  })
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  // Beneficiaries Collection
  beneficiaries: defineTable({
    name: v.string(),
    tc_no: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    birth_date: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    marital_status: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    district: v.string(),
    neighborhood: v.string(),
    family_size: v.number(),
    children_count: v.optional(v.number()),
    orphan_children_count: v.optional(v.number()),
    elderly_count: v.optional(v.number()),
    disabled_count: v.optional(v.number()),
    income_level: v.optional(v.string()),
    income_source: v.optional(v.string()),
    has_debt: v.optional(v.boolean()),
    housing_type: v.optional(v.string()),
    has_vehicle: v.optional(v.boolean()),
    health_status: v.optional(v.string()),
    has_chronic_illness: v.optional(v.boolean()),
    chronic_illness_detail: v.optional(v.string()),
    has_disability: v.optional(v.boolean()),
    disability_detail: v.optional(v.string()),
    has_health_insurance: v.optional(v.boolean()),
    regular_medication: v.optional(v.string()),
    education_level: v.optional(v.string()),
    occupation: v.optional(v.string()),
    employment_status: v.optional(v.string()),
    aid_type: v.optional(v.string()),
    totalAidAmount: v.optional(v.number()),
    aid_duration: v.optional(v.string()),
    priority: v.optional(v.string()),
    reference_name: v.optional(v.string()),
    reference_phone: v.optional(v.string()),
    reference_relation: v.optional(v.string()),
    application_source: v.optional(v.string()),
    notes: v.optional(v.string()),
    previous_aid: v.optional(v.boolean()),
    other_organization_aid: v.optional(v.boolean()),
    emergency: v.optional(v.boolean()),
    contact_preference: v.optional(v.string()),
    status: v.union(
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
    approval_status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))
    ),
    approved_by: v.optional(v.string()),
    approved_at: v.optional(v.string()),
  })
    .index('by_tc_no', ['tc_no'])
    .index('by_status', ['status'])
    .index('by_city', ['city']),

  // Donations Collection
  donations: defineTable({
    donor_name: v.string(),
    donor_phone: v.string(),
    donor_email: v.optional(v.string()),
    amount: v.number(),
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    donation_type: v.string(),
    payment_method: v.string(),
    donation_purpose: v.string(),
    notes: v.optional(v.string()),
    receipt_number: v.string(),
    receipt_file_id: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('cancelled')),
    // Kumbara-related fields
    is_kumbara: v.optional(v.boolean()),  // Whether this donation came from a kumbara
    kumbara_location: v.optional(v.string()),  // Location where kumbara was placed/collected
    collection_date: v.optional(v.string()),  // Date when kumbara was collected
    kumbara_institution: v.optional(v.string()),  // Institution/place where kumbara is located
  })
    .index('by_status', ['status'])
    .index('by_donor_email', ['donor_email'])
    .index('by_receipt_number', ['receipt_number'])
    .index('by_is_kumbara', ['is_kumbara'])
    .index('by_kumbara_location', ['kumbara_location']),

  // Tasks Collection
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assigned_to: v.optional(v.id('users')),
    created_by: v.id('users'),
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    due_date: v.optional(v.string()),
    completed_at: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    is_read: v.boolean(),
  })
    .index('by_assigned_to', ['assigned_to'])
    .index('by_status', ['status'])
    .index('by_created_by', ['created_by']),

  // Meetings Collection
  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    meeting_date: v.string(),
    location: v.optional(v.string()),
    organizer: v.id('users'),
    participants: v.array(v.id('users')),
    status: v.union(
      v.literal('scheduled'),
      v.literal('ongoing'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    meeting_type: v.union(
      v.literal('general'),
      v.literal('committee'),
      v.literal('board'),
      v.literal('other')
    ),
    agenda: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index('by_organizer', ['organizer'])
    .index('by_status', ['status'])
    .index('by_meeting_date', ['meeting_date']),

  // Messages Collection
  messages: defineTable({
    message_type: v.union(v.literal('sms'), v.literal('email'), v.literal('internal')),
    sender: v.id('users'),
    recipients: v.array(v.id('users')),
    subject: v.optional(v.string()),
    content: v.string(),
    sent_at: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('sent'), v.literal('failed')),
    is_bulk: v.boolean(),
    template_id: v.optional(v.string()),
  })
    .index('by_sender', ['sender'])
    .index('by_status', ['status']),

  // Parameters Collection
  parameters: defineTable({
    category: v.string(),
    name_tr: v.string(),
    name_en: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    name_ru: v.optional(v.string()),
    name_fr: v.optional(v.string()),
    value: v.string(),
    order: v.number(),
    is_active: v.boolean(),
  })
    .index('by_category', ['category'])
    .index('by_value', ['value']),

  // Aid Applications Collection
  aid_applications: defineTable({
    application_date: v.string(),
    applicant_type: v.union(v.literal('person'), v.literal('organization'), v.literal('partner')),
    applicant_name: v.string(),
    beneficiary_id: v.optional(v.id('beneficiaries')),
    one_time_aid: v.optional(v.number()),
    regular_financial_aid: v.optional(v.number()),
    regular_food_aid: v.optional(v.number()),
    in_kind_aid: v.optional(v.number()),
    service_referral: v.optional(v.number()),
    stage: v.union(
      v.literal('draft'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('ongoing'),
      v.literal('completed')
    ),
    status: v.union(v.literal('open'), v.literal('closed')),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent'))
    ),
    processed_by: v.optional(v.id('users')),
    processed_at: v.optional(v.string()),
    approved_by: v.optional(v.id('users')),
    approved_at: v.optional(v.string()),
    completed_at: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_stage', ['stage'])
    .index('by_status', ['status']),

  // Finance Records Collection
  finance_records: defineTable({
    record_type: v.union(v.literal('income'), v.literal('expense')),
    category: v.string(),
    amount: v.number(),
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    description: v.string(),
    transaction_date: v.string(),
    payment_method: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    receipt_file_id: v.optional(v.string()),
    related_to: v.optional(v.string()),
    created_by: v.id('users'),
    approved_by: v.optional(v.id('users')),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
  })
    .index('by_record_type', ['record_type'])
    .index('by_status', ['status'])
    .index('by_created_by', ['created_by']),
});
