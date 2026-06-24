CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE zones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    leader_name VARCHAR(255),
    leader_phone VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE sections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    zone_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_sections_zone FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE mass_centres (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE ministries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE guilds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    membership_no VARCHAR(40) NOT NULL UNIQUE,
    zone_id BIGINT NOT NULL,
    section_id BIGINT,
    mass_centre_id BIGINT,
    surname VARCHAR(255) NOT NULL,
    first_names VARCHAR(255) NOT NULL,
    home_address VARCHAR(255),
    email_address VARCHAR(255),
    telephone VARCHAR(255),
    cell VARCHAR(255) NOT NULL,
    baptism_place VARCHAR(255),
    baptism_date DATE,
    confirmation_date DATE,
    marriage_date DATE,
    parish_priest_name VARCHAR(255),
    date_of_issue DATE,
    status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_members_zone FOREIGN KEY (zone_id) REFERENCES zones(id),
    CONSTRAINT fk_members_section FOREIGN KEY (section_id) REFERENCES sections(id),
    CONSTRAINT fk_members_mass_centre FOREIGN KEY (mass_centre_id) REFERENCES mass_centres(id)
);

CREATE INDEX idx_members_membership_no ON members(membership_no);
CREATE INDEX idx_members_zone_id ON members(zone_id);

CREATE TABLE member_ministries (
    member_id BIGINT NOT NULL,
    ministry_id BIGINT NOT NULL,
    PRIMARY KEY (member_id, ministry_id),
    CONSTRAINT fk_member_ministries_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_member_ministries_ministry FOREIGN KEY (ministry_id) REFERENCES ministries(id)
);

CREATE TABLE member_guilds (
    member_id BIGINT NOT NULL,
    guild_id BIGINT NOT NULL,
    PRIMARY KEY (member_id, guild_id),
    CONSTRAINT fk_member_guilds_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_member_guilds_guild FOREIGN KEY (guild_id) REFERENCES guilds(id)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    member_id BIGINT,
    enabled BIT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_users_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BIT NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE billing_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    frequency VARCHAR(40) NOT NULL,
    applies_to VARCHAR(40) NOT NULL,
    year INT,
    month VARCHAR(10),
    status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE member_bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    billing_item_id BIGINT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    bill_year INT NOT NULL,
    bill_month VARCHAR(10) NOT NULL,
    due_date DATE,
    status VARCHAR(40) NOT NULL,
    amount_paid DECIMAL(14,2) NOT NULL,
    balance DECIMAL(14,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_member_bills_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_member_bills_billing_item FOREIGN KEY (billing_item_id) REFERENCES billing_items(id),
    CONSTRAINT uk_member_bill_period UNIQUE (member_id, billing_item_id, bill_year, bill_month)
);

CREATE INDEX idx_member_bills_member_id ON member_bills(member_id);
CREATE INDEX idx_member_bills_year_month ON member_bills(bill_year, bill_month);

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receipt_no VARCHAR(255) NOT NULL UNIQUE,
    member_id BIGINT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    payment_reference VARCHAR(255),
    payment_date DATE NOT NULL,
    received_by_user_id BIGINT,
    notes VARCHAR(255),
    reversed BIT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_payments_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_payments_received_by FOREIGN KEY (received_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_payments_receipt_no ON payments(receipt_no);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

CREATE TABLE payment_allocations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    member_bill_id BIGINT NOT NULL,
    amount_allocated DECIMAL(14,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_payment_allocations_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CONSTRAINT fk_payment_allocations_bill FOREIGN KEY (member_bill_id) REFERENCES member_bills(id)
);

CREATE TABLE contribution_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    contribution_month VARCHAR(10) NOT NULL,
    contribution_year INT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    paid BIT NOT NULL,
    receipt_number VARCHAR(255),
    payment_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_contribution_records_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX idx_contribution_member_year_month ON contribution_records(member_id, contribution_year, contribution_month);
