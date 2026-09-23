-- =============================================================================
-- PostgreSQL Database Schema for Madrasah Management & Administration SaaS
-- Phase 02: Production-Grade Relational Schema
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('FREE_TRIAL', 'STANDARD', 'PROFESSIONAL', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE madrasah_type AS ENUM ('QAWMI', 'ALIA', 'CADET', 'HIFZ_ONLY', 'NURANI_ONLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'MUHTAMIM', 'HEAD_TEACHER', 'TEACHER', 'ACCOUNTANT', 'STAFF', 'GUARDIAN', 'STUDENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('NURANI', 'NAJERA', 'HIFZ', 'KITAB', 'DAWRA_HADITH', 'IFTA', 'ALIA_EBETEDAYEE', 'ALIA_DAKHIL', 'ALIA_ALIM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE blood_group_type AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'ALUMNI', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'BKASH', 'NAGAD', 'ROCKET', 'CHEQUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'WAIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('MONTHLY', 'FIRST_TERM', 'MID_TERM', 'FINAL', 'CENTRAL_BEFAQ');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 1. SAAS TENANCY & IDENTITY ACCESS MANAGEMENT (IAM)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_bangla VARCHAR(255) NOT NULL,
    name_english VARCHAR(255) NOT NULL,
    name_arabic VARCHAR(255),
    madrasah_type madrasah_type NOT NULL DEFAULT 'QAWMI',
    eiin_code VARCHAR(50),
    registration_no VARCHAR(100),
    established_year INT,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    division VARCHAR(100),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    website VARCHAR(200),
    logo_url TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    plan_type subscription_plan NOT NULL DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_district ON tenants(district);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    mobile VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role role_type NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_role UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- 2. ACADEMIC STRUCTURE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hijri_year VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_tenant_current ON academic_sessions(tenant_id, is_current);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type department_type NOT NULL,
    name_bangla VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_dept_name UNIQUE (tenant_id, name_bangla)
);

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    name_bangla VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_classes_tenant_order ON classes(tenant_id, order_index);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_section UNIQUE (class_id, name)
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name_bangla VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    name_arabic VARCHAR(150),
    total_marks INT NOT NULL DEFAULT 100,
    pass_marks INT NOT NULL DEFAULT 33,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_subject_code UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_subject UNIQUE (class_id, subject_id)
);

-- -----------------------------------------------------------------------------
-- 3. STUDENTS & GUARDIANS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id_card_no VARCHAR(50) NOT NULL,
    admission_no VARCHAR(50) NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    name_bangla VARCHAR(200) NOT NULL,
    name_english VARCHAR(200) NOT NULL,
    name_arabic VARCHAR(200),
    gender gender_type NOT NULL DEFAULT 'MALE',
    date_of_birth DATE NOT NULL,
    blood_group blood_group_type,
    birth_certificate_no VARCHAR(50),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    roll_no INT NOT NULL,
    is_residential BOOLEAN NOT NULL DEFAULT FALSE,
    room_number VARCHAR(50),
    seat_number VARCHAR(50),
    status student_status NOT NULL DEFAULT 'ACTIVE',
    photo_url TEXT,
    father_name_bangla VARCHAR(200) NOT NULL,
    mother_name_bangla VARCHAR(200) NOT NULL,
    guardian_name VARCHAR(200) NOT NULL,
    guardian_relation VARCHAR(50) NOT NULL,
    guardian_mobile VARCHAR(30) NOT NULL,
    present_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    previous_madrasah VARCHAR(255),
    tc_number VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_tenant_student_id UNIQUE (tenant_id, student_id_card_no),
    CONSTRAINT uq_tenant_admission_no UNIQUE (tenant_id, admission_no)
);

CREATE INDEX IF NOT EXISTS idx_students_search ON students(tenant_id, class_id, section_id, roll_no);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON students(guardian_mobile);

CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name_bangla VARCHAR(200) NOT NULL,
    name_english VARCHAR(200),
    relation VARCHAR(50) NOT NULL,
    nid_number VARCHAR(50),
    mobile_number VARCHAR(30) NOT NULL,
    alt_mobile_number VARCHAR(30),
    occupation VARCHAR(100),
    yearly_income NUMERIC(12, 2),
    present_address TEXT NOT NULL,
    permanent_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardians_mobile ON guardians(tenant_id, mobile_number);

CREATE TABLE IF NOT EXISTS student_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    relation_type VARCHAR(50) NOT NULL,
    CONSTRAINT uq_student_guardian UNIQUE (student_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_academic_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    roll_no INT NOT NULL,
    gpa_or_division VARCHAR(50),
    pass_year INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stud_history ON student_academic_histories(student_id, session_id);

-- -----------------------------------------------------------------------------
-- 4. ATTENDANCE & ACADEMIC ROUTINE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    in_time VARCHAR(20),
    out_time VARCHAR(20),
    sms_sent BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_student_attendance UNIQUE (tenant_id, date, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendances_query ON attendances(tenant_id, section_id, date);

CREATE TABLE IF NOT EXISTS homeworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    given_date DATE NOT NULL,
    due_date DATE NOT NULL,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. FINANCIAL MANAGEMENT: FEES, FUNDS, INCOMES & EXPENSES
-- IMMUTABLE AUDIT RULES: PHYSICAL DELETION PROHIBITED
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name_bangla VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    default_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_fee_type UNIQUE (tenant_id, name_bangla)
);

CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    fee_type_id UUID NOT NULL REFERENCES fee_types(id) ON DELETE RESTRICT,
    month_year VARCHAR(20) NOT NULL, -- Format: YYYY-MM
    original_amount NUMERIC(12, 2) NOT NULL,
    waiver_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_amount NUMERIC(12, 2) NOT NULL,
    status fee_status NOT NULL DEFAULT 'UNPAID',
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_fees_lookup ON student_fees(tenant_id, student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_fees_month ON student_fees(tenant_id, month_year);

CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_receipt_no UNIQUE (tenant_id, receipt_no)
);

CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(tenant_id, payment_date);

CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_fee_id UUID NOT NULL REFERENCES student_fees(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    transaction_ref_no VARCHAR(100),
    collected_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(tenant_id, payment_date);

CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name_bangla VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_fund_code UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    voucher_no VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    income_date DATE NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    description TEXT,
    received_from VARCHAR(200),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(tenant_id, fund_id, income_date);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    voucher_no VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    description TEXT NOT NULL,
    paid_to VARCHAR(200) NOT NULL,
    approval_status approval_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    approved_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(tenant_id, fund_id, expense_date);

CREATE TABLE IF NOT EXISTS fund_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    from_fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    to_fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL,
    transfer_date DATE NOT NULL,
    reason TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. DONORS, DONATIONS, SUPPLIERS & PURCHASES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name_bangla VARCHAR(200) NOT NULL,
    name_english VARCHAR(200),
    mobile VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    address TEXT,
    donor_type VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donors_mobile ON donors(tenant_id, mobile);

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    donation_type VARCHAR(50) NOT NULL, -- ZAKAT, FITRA, SADQAH, GENERAL, BUILDING
    donation_date DATE NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(tenant_id, donation_date);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    mobile VARCHAR(30) NOT NULL,
    address TEXT,
    materials TEXT,
    current_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    invoice_no VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    due_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    items_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TEACHERS, STAFF, PAYROLL & LEAVE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    name_bangla VARCHAR(200) NOT NULL,
    name_english VARCHAR(200) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    mobile VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    nid_number VARCHAR(50),
    joining_date DATE NOT NULL,
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    blood_group blood_group_type,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_tenant_employee_id UNIQUE (tenant_id, employee_id)
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT uq_teacher_subject UNIQUE (staff_id, subject_id)
);

CREATE TABLE IF NOT EXISTS salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    base_amount NUMERIC(12, 2) NOT NULL,
    house_rent_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    medical_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    special_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    provident_fund_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(12, 2) NOT NULL,
    effective_from DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    month_year VARCHAR(20) NOT NULL, -- Format: YYYY-MM
    paid_amount NUMERIC(12, 2) NOT NULL,
    deduction_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    bonus_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    disbursement_date DATE NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staff_salary_month UNIQUE (tenant_id, staff_id, month_year)
);

CREATE TABLE IF NOT EXISTS advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    request_date DATE NOT NULL,
    reason TEXT NOT NULL,
    repaid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    monthly_deduction NUMERIC(12, 2) NOT NULL,
    is_fully_repaid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    topic_name VARCHAR(200) NOT NULL,
    target_date DATE NOT NULL,
    completion_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. EXAMINATIONS, MARKS & RESULTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    title_bangla VARCHAR(200) NOT NULL,
    title_english VARCHAR(200) NOT NULL,
    exam_type exam_type NOT NULL DEFAULT 'FIRST_TERM',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_lookup ON exams(tenant_id, session_id, class_id);

CREATE TABLE IF NOT EXISTS exam_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    pass_marks INT NOT NULL DEFAULT 33,
    CONSTRAINT uq_exam_subject UNIQUE (exam_id, subject_id)
);

CREATE TABLE IF NOT EXISTS exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    admit_card_no VARCHAR(50) NOT NULL,
    is_cleared_fees BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_exam_registration UNIQUE (exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_subject_id UUID NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    written_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    viva_or_oral_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    practical_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_marks NUMERIC(6, 2) NOT NULL,
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    grade VARCHAR(50),
    remarks TEXT,
    entered_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_marks_record UNIQUE (exam_subject_id, student_id)
);

CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    grand_total_marks NUMERIC(8, 2) NOT NULL,
    percentage NUMERIC(6, 2) NOT NULL,
    division_or_grade VARCHAR(50) NOT NULL,
    position_in_class INT,
    is_passed BOOLEAN NOT NULL DEFAULT TRUE,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_result_record UNIQUE (exam_id, student_id)
);

-- -----------------------------------------------------------------------------
-- 9. ROUTINES, NOTICES & NOTIFICATIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    period_number INT NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    teacher_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    publish_date DATE NOT NULL,
    expire_date DATE,
    target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL',
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(tenant_id, publish_date);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- SMS, IN_APP, EMAIL
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(tenant_id, recipient_id, is_read);

-- -----------------------------------------------------------------------------
-- 10. ASSETS, CERTIFICATES, PROMOTIONS & ALUMNI
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asset_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    purchase_date DATE,
    purchase_cost NUMERIC(12, 2),
    location_room VARCHAR(100),
    condition VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    certificate_type VARCHAR(100) NOT NULL,
    certificate_no VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    issued_by VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    from_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    to_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    from_class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    to_class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    promoted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT
);

-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS, SYSTEM SETTINGS, SUBSCRIPTIONS & LICENSES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_lookup ON audit_logs(tenant_id, entity_name, created_at);

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institution_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_setting UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'STANDARD',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    amount_paid NUMERIC(12, 2) NOT NULL,
    transaction_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    max_students INT NOT NULL DEFAULT 500,
    max_staff INT NOT NULL DEFAULT 50,
    expires_at TIMESTAMPTZ NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. MULTI-TENANT QUERY OPTIMIZATION INDEXES
-- Enforces fast indexed lookups across every tenant boundary
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON shifts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sections_tenant_class ON sections(tenant_id, class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_tenant ON subjects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_tenant ON teacher_subjects(tenant_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_docs_tenant ON student_documents(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_tenant ON student_guardians(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_homeworks_tenant_class ON homeworks(tenant_id, class_id, submission_date);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_tenant ON lesson_plans(tenant_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_fee_types_tenant ON fee_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_funds_tenant ON funds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fund_transfers_tenant ON fund_transfers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchases_tenant ON purchases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_role ON staff(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_salaries_tenant ON salaries(tenant_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_tenant ON salary_payments(tenant_id, staff_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_advances_tenant ON advances(tenant_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant ON leaves(tenant_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_tenant ON exam_subjects(tenant_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_regs_tenant ON exam_registrations(tenant_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_tenant_exam_sub ON marks(tenant_id, exam_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_results_tenant_exam ON results(tenant_id, exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_routines_tenant_sec ON routines(tenant_id, class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_tenant ON certificates(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_promotions_tenant ON promotions(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_institution_settings_tenant ON institution_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_licenses_tenant ON licenses(tenant_id, is_valid);

-- -----------------------------------------------------------------------------
-- 12. IMMUTABILITY RULE FOR FINANCIAL AUDIT INTEGRITY
-- Prevents physical deletion of financial ledger records.
-- Normal application workflows must use status cancellation or reversal entries.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trg_prevent_financial_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Physical deletion of financial records is strictly prohibited for audit and compliance. Use status cancellation, reversal entries, or soft-archival instead.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_no_delete_fee_payments ON fee_payments;
CREATE TRIGGER enforce_no_delete_fee_payments
BEFORE DELETE ON fee_payments
FOR EACH ROW EXECUTE FUNCTION trg_prevent_financial_deletion();

DROP TRIGGER IF EXISTS enforce_no_delete_receipts ON receipts;
CREATE TRIGGER enforce_no_delete_receipts
BEFORE DELETE ON receipts
FOR EACH ROW EXECUTE FUNCTION trg_prevent_financial_deletion();

DROP TRIGGER IF EXISTS enforce_no_delete_incomes ON incomes;
CREATE TRIGGER enforce_no_delete_incomes
BEFORE DELETE ON incomes
FOR EACH ROW EXECUTE FUNCTION trg_prevent_financial_deletion();

DROP TRIGGER IF EXISTS enforce_no_delete_expenses ON expenses;
CREATE TRIGGER enforce_no_delete_expenses
BEFORE DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION trg_prevent_financial_deletion();

DROP TRIGGER IF EXISTS enforce_no_delete_salary_payments ON salary_payments;
CREATE TRIGGER enforce_no_delete_salary_payments
BEFORE DELETE ON salary_payments
FOR EACH ROW EXECUTE FUNCTION trg_prevent_financial_deletion();
