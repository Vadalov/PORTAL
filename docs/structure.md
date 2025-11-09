├── **tests**
│ ├── api
│ │ └── auth.test.ts
│ ├── hooks
│ │ └── useInfiniteScroll.test.ts
│ ├── integration
│ │ └── beneficiary-sanitization.test.ts
│ ├── lib
│ │ ├── api-client.test.ts
│ │ ├── beneficiary-validation.test.ts
│ │ ├── cache-config.test.ts
│ │ ├── env-validation.test.ts
│ │ ├── errors.test.ts
│ │ ├── performance.test.ts
│ │ ├── persistent-cache.test.ts
│ │ ├── route-helpers.test.ts
│ │ ├── sanitization.test.ts
│ │ ├── utils.test.ts
│ │ └── validations
│ │ └── beneficiary.test.ts
│ ├── mocks
│ │ ├── handlers.ts
│ │ └── server.ts
│ └── setup.ts
├── app
│ ├── (dashboard)
│ │ ├── ayarlar
│ │ │ └── parametreler
│ │ │ └── page.tsx
│ │ ├── bagis
│ │ │ ├── kumbara
│ │ │ │ └── page.tsx
│ │ │ ├── liste
│ │ │ │ └── page.tsx
│ │ │ └── raporlar
│ │ │ └── page.tsx
│ │ ├── burs
│ │ │ ├── basvurular
│ │ │ │ └── page.tsx
│ │ │ ├── ogrenciler
│ │ │ │ └── page.tsx
│ │ │ └── yetim
│ │ │ └── page.tsx
│ │ ├── financial-dashboard
│ │ │ └── page.tsx
│ │ ├── fon
│ │ │ ├── gelir-gider
│ │ │ │ └── page.tsx
│ │ │ └── raporlar
│ │ │ └── page.tsx
│ │ ├── genel
│ │ │ └── page.tsx
│ │ ├── is
│ │ │ ├── gorevler
│ │ │ │ └── page.tsx
│ │ │ ├── toplantilar
│ │ │ │ └── page.tsx
│ │ │ └── yonetim
│ │ │ └── page.tsx
│ │ ├── kullanici
│ │ │ ├── [id]
│ │ │ │ └── duzenle
│ │ │ │ └── page.tsx
│ │ │ ├── page.tsx
│ │ │ └── yeni
│ │ │ └── page.tsx
│ │ ├── layout.tsx
│ │ ├── mesaj
│ │ │ ├── kurum-ici
│ │ │ │ └── page.tsx
│ │ │ └── toplu
│ │ │ └── page.tsx
│ │ ├── partner
│ │ │ └── liste
│ │ │ └── page.tsx
│ │ ├── performance-monitoring
│ │ │ └── page.tsx
│ │ ├── settings
│ │ │ └── page.tsx
│ │ └── yardim
│ │ ├── basvurular
│ │ │ ├── [id]
│ │ │ │ └── page.tsx
│ │ │ └── page.tsx
│ │ ├── ihtiyac-sahipleri
│ │ │ ├── [id]
│ │ │ │ └── page.tsx
│ │ │ └── page.tsx
│ │ ├── liste
│ │ │ └── page.tsx
│ │ └── nakdi-vezne
│ │ └── page.tsx
│ ├── api
│ │ ├── aid-applications
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── auth
│ │ │ ├── login
│ │ │ │ └── route.ts
│ │ │ ├── logout
│ │ │ │ └── route.ts
│ │ │ └── session
│ │ │ └── route.ts
│ │ ├── beneficiaries
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── csrf
│ │ │ └── route.ts
│ │ ├── donations
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ ├── route.ts
│ │ │ └── stats
│ │ │ └── route.ts
│ │ ├── health
│ │ │ └── route.ts
│ │ ├── kumbara
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── meeting-action-items
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── meeting-decisions
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── meetings
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── messages
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── monitoring
│ │ │ └── rate-limit
│ │ │ └── route.ts
│ │ ├── partners
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── settings
│ │ │ ├── [category]
│ │ │ │ ├── [key]
│ │ │ │ │ └── route.ts
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── storage
│ │ │ ├── [fileId]
│ │ │ │ └── route.ts
│ │ │ └── upload
│ │ │ └── route.ts
│ │ ├── tasks
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── users
│ │ │ ├── [id]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ └── workflow-notifications
│ │ ├── [id]
│ │ │ └── route.ts
│ │ └── route.ts
│ ├── error.tsx
│ ├── favicon.ico
│ ├── global-error.tsx
│ ├── globals.css
│ ├── layout.tsx
│ ├── login
│ │ └── page.tsx
│ ├── page.tsx
│ └── providers.tsx
├── components
│ ├── PlaceholderPage.tsx
│ ├── analytics
│ │ ├── GoogleAnalytics.tsx
│ │ └── WebVitalsTracker.tsx
│ ├── bank-accounts
│ │ └── BankAccountsManager.tsx
│ ├── beneficiary-analytics
│ │ └── AidHistoryChart.tsx
│ ├── consents
│ │ └── ConsentsManager.tsx
│ ├── dependents
│ │ └── DependentsManager.tsx
│ ├── documents
│ │ └── DocumentsManager.tsx
│ ├── error-boundary.tsx
│ ├── forms
│ │ ├── AdvancedBeneficiaryForm.tsx
│ │ ├── AidApplicationForm.tsx
│ │ ├── BeneficiaryForm.tsx
│ │ ├── BeneficiaryQuickAddModal.tsx
│ │ ├── BudgetForm.tsx
│ │ ├── DonationForm.tsx
│ │ ├── InvoiceForm.tsx
│ │ ├── MeetingForm.tsx
│ │ ├── MessageForm.tsx
│ │ ├── ParameterSelect.tsx
│ │ ├── TaskForm.tsx
│ │ ├── TransactionForm.tsx
│ │ └── user-form.tsx
│ ├── kumbara
│ │ ├── KumbaraCharts.tsx
│ │ ├── KumbaraForm.tsx
│ │ ├── KumbaraList.tsx
│ │ ├── KumbaraPrintQR.tsx
│ │ ├── KumbaraStats.tsx
│ │ └── MapLocationPicker.tsx
│ ├── layouts
│ │ └── PageLayout.tsx
│ ├── meetings
│ │ └── CalendarView.tsx
│ ├── messages
│ │ ├── MessageTemplateSelector.tsx
│ │ └── RecipientSelector.tsx
│ ├── scholarships
│ │ ├── ApplicationCard.tsx
│ │ └── StudentCard.tsx
│ ├── tables
│ │ └── users-table.tsx
│ ├── tasks
│ │ └── KanbanBoard.tsx
│ ├── ui
│ │ ├── accessible-form-field.tsx
│ │ ├── advanced-search-modal.tsx
│ │ ├── alert-dialog.tsx
│ │ ├── analytics-tracker.tsx
│ │ ├── animated-gradient.tsx
│ │ ├── avatar.tsx
│ │ ├── background-pattern.tsx
│ │ ├── badge.tsx
│ │ ├── breadcrumb-nav.tsx
│ │ ├── button.tsx
│ │ ├── calendar.tsx
│ │ ├── card.tsx
│ │ ├── checkbox.tsx
│ │ ├── column-visibility-toggle.tsx
│ │ ├── corporate-login-form.tsx
│ │ ├── data-table.tsx
│ │ ├── date-picker.tsx
│ │ ├── dialog.tsx
│ │ ├── empty-state.tsx
│ │ ├── enhanced-toast.tsx
│ │ ├── error-alert.tsx
│ │ ├── error-boundary.tsx
│ │ ├── export-buttons.tsx
│ │ ├── file-upload.tsx
│ │ ├── filter-panel.tsx
│ │ ├── form-field-group.tsx
│ │ ├── form.tsx
│ │ ├── glass-card.tsx
│ │ ├── input.tsx
│ │ ├── keyboard-shortcuts.tsx
│ │ ├── label.tsx
│ │ ├── loading-overlay.tsx
│ │ ├── modern-sidebar.tsx
│ │ ├── page-loader.tsx
│ │ ├── pagination.tsx
│ │ ├── popover.tsx
│ │ ├── progress.tsx
│ │ ├── radio-group.tsx
│ │ ├── responsive-table.tsx
│ │ ├── select.tsx
│ │ ├── separator.tsx
│ │ ├── skeleton-optimized.tsx
│ │ ├── skeleton.tsx
│ │ ├── sparkles.tsx
│ │ ├── stat-card.tsx
│ │ ├── step-progress.tsx
│ │ ├── suspense-boundary.tsx
│ │ ├── switch.tsx
│ │ ├── table.tsx
│ │ ├── tabs.tsx
│ │ ├── text-hover-effect.tsx
│ │ ├── textarea.tsx
│ │ ├── theme-switcher.tsx
│ │ ├── tooltip.tsx
│ │ └── virtualized-data-table.tsx
│ └── users
│ └── permission-checkbox-group.tsx
├── config
│ ├── design-tokens.ts
│ └── navigation.ts
├── data
│ └── mock
│ └── beneficiaries-extended.json
├── hooks
│ ├── useApiCache.ts
│ ├── useFormMutation.ts
│ └── useInfiniteScroll.ts
├── lib
│ ├── api
│ │ ├── auth-utils.ts
│ │ ├── convex-api-client.ts
│ │ ├── index.ts
│ │ ├── route-helpers.ts
│ │ ├── scholarships.ts
│ │ └── settings.ts
│ ├── api-cache.ts
│ ├── auth
│ │ ├── get-user.ts
│ │ ├── password.ts
│ │ └── session.ts
│ ├── cache-config.ts
│ ├── constants
│ │ ├── orphan-types.ts
│ │ └── pdf-strings.ts
│ ├── convex
│ │ ├── api.ts
│ │ ├── client.ts
│ │ └── server.ts
│ ├── csrf.ts
│ ├── data-export.ts
│ ├── env-validation.ts
│ ├── errors.ts
│ ├── export
│ │ └── index.ts
│ ├── http-cache.ts
│ ├── logger.ts
│ ├── performance
│ │ └── web-vitals.ts
│ ├── performance-monitor.tsx
│ ├── performance.ts
│ ├── persistent-cache.ts
│ ├── rate-limit-config.ts
│ ├── rate-limit-monitor.ts
│ ├── rate-limit.ts
│ ├── sanitization.ts
│ ├── security.ts
│ ├── services
│ │ ├── email.ts
│ │ └── sms.ts
│ ├── utils
│ │ ├── format.ts
│ │ ├── pdf-export.ts
│ │ └── scholarship-helpers.tsx
│ ├── utils.ts
│ └── validations
│ ├── aid-application.ts
│ ├── beneficiary.ts
│ ├── kumbara.ts
│ ├── meeting.ts
│ ├── meetingActionItem.ts
│ ├── message.ts
│ └── task.ts
├── middleware.ts
├── scripts
│ └── create-demo-data.ts
├── stores
│ ├── **tests**
│ │ └── authStore.test.ts
│ └── authStore.ts
└── types
├── auth.ts
├── beneficiary.ts
├── database.ts
├── financial.ts
├── permissions.ts
└── scholarship.ts
