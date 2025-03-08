-- Drop existing tables and sequences if they exist
DROP TABLE IF EXISTS public.service_requests CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.worker_profiles CASCADE;
DROP TABLE IF EXISTS public.serviceman_registrations CASCADE;
DROP TABLE IF EXISTS public.serviceman_profiles CASCADE;

DROP SEQUENCE IF EXISTS public.reviews_review_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.service_requests_request_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.services_service_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.users_user_id_seq CASCADE;

-- Create sequences
CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.reviews_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.service_requests_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.services_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create tables
CREATE TABLE public.customers (
    user_id integer NOT NULL DEFAULT nextval('public.users_user_id_seq'::regclass),
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    full_name text NOT NULL,
    phone_number text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE TABLE public.serviceman_registrations (
    registration_id SERIAL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    id_proof_path text NOT NULL,
    id_proof_content text,
    address text NOT NULL,
    city text NOT NULL,
    pincode text NOT NULL,
    skills text[] NOT NULL,
    status text DEFAULT 'pending',
    rejection_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.serviceman_profiles (
    serviceman_id SERIAL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    pincode text NOT NULL,
    skills text[] NOT NULL,
    rating numeric(2,1) DEFAULT 0,
    total_jobs integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    cancelled_jobs integer DEFAULT 0,
    current_status text DEFAULT 'offline',
    current_location point,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_active_at timestamp with time zone
);

CREATE TABLE public.services (
    service_id integer NOT NULL DEFAULT nextval('public.services_service_id_seq'::regclass),
    title character varying(100) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    base_price numeric(10,2) NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    PRIMARY KEY (service_id)
);

CREATE TABLE public.service_requests (
    request_id integer NOT NULL DEFAULT nextval('public.service_requests_request_id_seq'::regclass),
    customer_id integer NOT NULL,
    service_type text NOT NULL,
    description text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    address text NOT NULL,
    payment_method text NOT NULL,
    payment_id text,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text,
    assigned_serviceman integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    landmark text,
    city text NOT NULL,
    pincode text NOT NULL,
    scheduled_date date NOT NULL,
    time_slot text NOT NULL,
    PRIMARY KEY (request_id)
);

CREATE TABLE public.reviews (
    review_id integer NOT NULL DEFAULT nextval('public.reviews_review_id_seq'::regclass),
    service_request_id integer,
    customer_id integer,
    serviceman_id integer,
    rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

-- Add foreign key constraints
ALTER TABLE public.service_requests
    ADD CONSTRAINT service_requests_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(user_id);

ALTER TABLE public.service_requests
    ADD CONSTRAINT service_requests_assigned_serviceman_fkey 
    FOREIGN KEY (assigned_serviceman) REFERENCES public.serviceman_profiles(serviceman_id);

ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(user_id);

ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_service_request_id_fkey 
    FOREIGN KEY (service_request_id) REFERENCES public.service_requests(request_id);

ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_serviceman_id_fkey 
    FOREIGN KEY (serviceman_id) REFERENCES public.serviceman_profiles(serviceman_id);

-- Insert some default services
INSERT INTO public.services (title, description, category, base_price, image_url) VALUES
    ('House Cleaning', 'Professional house cleaning service', 'Cleaning', 599.00, '/images/services/cleaning.png'),
    ('Plumbing Work', 'Expert plumbing repair and installation', 'Plumbing', 499.00, '/images/services/plumbing.png'),
    ('AC Service', 'AC maintenance and repair', 'Appliance', 799.00, '/images/services/ac.png'),
    ('Painting', 'Professional painting service', 'Home Care', 1499.00, '/images/services/painting.png'),
    ('Pest Control', 'Comprehensive pest control treatment', 'Home Care', 1299.00, '/images/services/pest-control.png'),
    ('Carpentry Work', 'Custom carpentry services', 'Carpentry', 999.00, '/images/services/carpentry.png'),
    ('Electrical Repair', 'Professional electrical services', 'Electrical', 699.00, '/images/services/electrical.png'),
    ('Appliance Repair', 'All appliance repair services', 'Appliance', 899.00, '/images/services/appliance.png');
