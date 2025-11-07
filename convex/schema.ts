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
    location_coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    location_address: v.optional(v.string()),
    route_points: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
    route_distance: v.optional(v.number()),
    route_duration: v.optional(v.number()),
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

  // Files Collection (metadata for uploaded files)
  files: defineTable({
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id('_storage'), // Convex fileStorage ID
    uploadedBy: v.optional(v.id('users')),
    uploadedAt: v.string(),
    beneficiary_id: v.optional(v.id('beneficiaries')), // Link to beneficiary for documents
    document_type: v.optional(v.string()), // Type: 'identity', 'photo', 'other', etc.
  })
    .index('by_storage_id', ['storageId'])
    .index('by_bucket', ['bucket'])
    .index('by_uploaded_by', ['uploadedBy'])
    .index('by_beneficiary', ['beneficiary_id']),

  // Partners Collection
  partners: defineTable({
    name: v.string(),
    type: v.union(v.literal('organization'), v.literal('individual'), v.literal('sponsor')),
    contact_person: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    tax_number: v.optional(v.string()),
    partnership_type: v.union(
      v.literal('donor'),
      v.literal('supplier'),
      v.literal('volunteer'),
      v.literal('sponsor'),
      v.literal('service_provider')
    ),
    collaboration_start_date: v.optional(v.string()),
    collaboration_end_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('pending')),
    total_contribution: v.optional(v.number()),
    contribution_count: v.optional(v.number()),
    logo_url: v.optional(v.string()),
  })
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_partnership_type', ['partnership_type'])
    .index('by_name', ['name']),

  // Consent Declarations (Rıza Beyanları)
  consents: defineTable({
    beneficiary_id: v.id('beneficiaries'),
    consent_type: v.string(), // 'data_processing', 'photo_usage', 'communication', etc.
    consent_text: v.string(),
    status: v.union(v.literal('active'), v.literal('revoked'), v.literal('expired')),
    signed_at: v.string(),
    signed_by: v.optional(v.string()), // Person who signed
    expires_at: v.optional(v.string()),
    created_by: v.optional(v.id('users')),
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_status', ['status']),

  // Bank Accounts (Banka Hesapları)
  bank_accounts: defineTable({
    beneficiary_id: v.id('beneficiaries'),
    bank_name: v.string(),
    account_holder: v.string(),
    account_number: v.string(),
    iban: v.optional(v.string()),
    branch_name: v.optional(v.string()),
    branch_code: v.optional(v.string()),
    account_type: v.union(v.literal('checking'), v.literal('savings'), v.literal('other')),
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    is_primary: v.optional(v.boolean()),
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('closed')),
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_status', ['status']),

  // Dependent People (Baktığı Kişiler)
  dependents: defineTable({
    beneficiary_id: v.id('beneficiaries'), // Who is responsible for this dependent
    name: v.string(),
    relationship: v.string(), // 'spouse', 'child', 'parent', 'sibling', 'other'
    birth_date: v.optional(v.string()),
    gender: v.optional(v.string()),
    tc_no: v.optional(v.string()),
    phone: v.optional(v.string()),
    education_level: v.optional(v.string()),
    occupation: v.optional(v.string()),
    health_status: v.optional(v.string()),
    has_disability: v.optional(v.boolean()),
    disability_detail: v.optional(v.string()),
    monthly_income: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_relationship', ['relationship']),

  // System Settings (Sistem Ayarları)
  system_settings: defineTable({
    category: v.string(), // 'organization', 'email', 'notifications', 'system', 'security', 'appearance', 'integrations', 'reports'
    key: v.string(), // Unique key for the setting (e.g., 'org_name', 'smtp_host')
    value: v.any(), // Flexible value type (string, number, boolean, object)
    description: v.optional(v.string()), // Human-readable description
    data_type: v.union(v.literal('string'), v.literal('number'), v.literal('boolean'), v.literal('object'), v.literal('array')),
    is_sensitive: v.optional(v.boolean()), // For sensitive data like passwords
    updated_by: v.optional(v.id('users')),
    updated_at: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_key', ['key'])
    .index('by_category_key', ['category', 'key']),

  // Scholarships (Burs Programları)
  scholarships: defineTable({
    title: v.string(), // Burs programı adı
    description: v.optional(v.string()), // Program açıklaması
    amount: v.number(), // Burs miktarı
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    duration_months: v.optional(v.number()), // Burs süresi (ay)
    category: v.string(), // 'academic', 'sports', 'arts', 'need_based', 'orphan', 'other'
    eligibility_criteria: v.optional(v.string()), // Uygunluk kriterleri
    requirements: v.optional(v.array(v.string())), // Gerekli belgeler
    application_start_date: v.string(), // Başvuru başlangıç tarihi
    application_end_date: v.string(), // Başvuru bitiş tarihi
    academic_year: v.optional(v.string()), // Akademik yıl
    max_recipients: v.optional(v.number()), // Maksimum alıcı sayısı
    is_active: v.boolean(), // Program aktif mi?
    created_by: v.id('users'),
    created_at: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_is_active', ['is_active'])
    .index('by_application_dates', ['application_start_date', 'application_end_date']),

  // Scholarship Applications (Burs Başvuruları)
  scholarship_applications: defineTable({
    scholarship_id: v.id('scholarships'), // Başvuru yapılan burs programı
    student_id: v.optional(v.id('beneficiaries')), // Öğrenci (eğer kayıtlıysa)
    created_by: v.optional(v.id('users')), // Application creator (staff/admin)
    applicant_name: v.string(), // Başvuran adı
    applicant_tc_no: v.string(), // TC Kimlik No
    applicant_phone: v.string(), // Telefon
    applicant_email: v.optional(v.string()), // Email
    university: v.optional(v.string()), // Üniversite
    department: v.optional(v.string()), // Bölüm
    grade_level: v.optional(v.string()), // Sınıf düzeyi (1., 2., 3., 4.)
    gpa: v.optional(v.number()), // GPA/Ortalama
    academic_year: v.optional(v.string()), // Akademik yıl
    monthly_income: v.optional(v.number()), // Aylık gelir
    family_income: v.optional(v.number()), // Aile geliri
    father_occupation: v.optional(v.string()), // Baba mesleği
    mother_occupation: v.optional(v.string()), // Anne mesleği
    sibling_count: v.optional(v.number()), // Kardeş sayısı
    is_orphan: v.optional(v.boolean()), // Yetim mi?
    has_disability: v.optional(v.boolean()), // Engelli mi?
    essay: v.optional(v.string()), // Essay/motivasyon mektubu
    status: v.union(v.literal('draft'), v.literal('submitted'), v.literal('under_review'), v.literal('approved'), v.literal('rejected'), v.literal('waitlisted')),
    priority_score: v.optional(v.number()), // Öncelik puanı (otomatik hesaplanacak)
    reviewer_notes: v.optional(v.string()), // İnceleyen notları
    submitted_at: v.optional(v.string()), // Başvuru gönderim tarihi
    reviewed_by: v.optional(v.id('users')), // İnceleyen
    reviewed_at: v.optional(v.string()), // İnceleme tarihi
    documents: v.optional(v.array(v.string())), // Yüklenen belge isimleri
    created_at: v.string(),
  })
    .index('by_scholarship', ['scholarship_id'])
    .index('by_status', ['status'])
    .index('by_tc_no', ['applicant_tc_no'])
    .index('by_submitted_at', ['submitted_at']),

  // Scholarship Payments (Burs Ödemeleri)
  scholarship_payments: defineTable({
    application_id: v.id('scholarship_applications'), // Başvuru ID
    payment_date: v.string(), // Ödeme tarihi
    amount: v.number(), // Ödeme miktarı
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    payment_method: v.string(), // Ödeme yöntemi
    payment_reference: v.optional(v.string()), // Ödeme referansı
    bank_account: v.optional(v.string()), // Banka hesabı
    notes: v.optional(v.string()), // Notlar
    status: v.union(v.literal('pending'), v.literal('paid'), v.literal('failed'), v.literal('cancelled')),
    processed_by: v.optional(v.id('users')), // İşleyen kişi
    receipt_file_id: v.optional(v.string()), // Makbuz dosya ID
    created_at: v.string(),
  })
    .index('by_application', ['application_id'])
    .index('by_payment_date', ['payment_date'])
    .index('by_status', ['status']),
});
