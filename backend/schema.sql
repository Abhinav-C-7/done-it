--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2025-03-08 22:34:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 214 (class 1259 OID 66014)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 66018)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    user_id integer DEFAULT nextval('public.users_user_id_seq'::regclass) NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    phone_number text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 66015)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_review_id_seq OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 66081)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer DEFAULT nextval('public.reviews_review_id_seq'::regclass) NOT NULL,
    service_request_id integer,
    customer_id integer,
    serviceman_id integer,
    rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 66016)
-- Name: service_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_requests_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_requests_request_id_seq OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 66070)
-- Name: service_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_requests (
    request_id integer DEFAULT nextval('public.service_requests_request_id_seq'::regclass) NOT NULL,
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
    time_slot text NOT NULL
);


ALTER TABLE public.service_requests OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 66043)
-- Name: serviceman_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.serviceman_profiles (
    serviceman_id integer NOT NULL,
    email text NOT NULL,
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
    current_status text DEFAULT 'offline'::text,
    current_location point,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_active_at timestamp with time zone
);


ALTER TABLE public.serviceman_profiles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 66042)
-- Name: serviceman_profiles_serviceman_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.serviceman_profiles_serviceman_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.serviceman_profiles_serviceman_id_seq OWNER TO postgres;

--
-- TOC entry 3403 (class 0 OID 0)
-- Dependencies: 221
-- Name: serviceman_profiles_serviceman_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.serviceman_profiles_serviceman_id_seq OWNED BY public.serviceman_profiles.serviceman_id;


--
-- TOC entry 220 (class 1259 OID 66030)
-- Name: serviceman_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.serviceman_registrations (
    registration_id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    id_proof_path text NOT NULL,
    id_proof_content text,
    address text NOT NULL,
    city text NOT NULL,
    pincode text NOT NULL,
    skills text[] NOT NULL,
    status text DEFAULT 'pending'::text,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.serviceman_registrations OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 66029)
-- Name: serviceman_registrations_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.serviceman_registrations_registration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.serviceman_registrations_registration_id_seq OWNER TO postgres;

--
-- TOC entry 3404 (class 0 OID 0)
-- Dependencies: 219
-- Name: serviceman_registrations_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.serviceman_registrations_registration_id_seq OWNED BY public.serviceman_registrations.registration_id;


--
-- TOC entry 217 (class 1259 OID 66017)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.services_service_id_seq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 66060)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    service_id integer DEFAULT nextval('public.services_service_id_seq'::regclass) NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    base_price numeric(10,2) NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 3203 (class 2604 OID 66046)
-- Name: serviceman_profiles serviceman_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_profiles ALTER COLUMN serviceman_id SET DEFAULT nextval('public.serviceman_profiles_serviceman_id_seq'::regclass);


--
-- TOC entry 3200 (class 2604 OID 66033)
-- Name: serviceman_registrations registration_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_registrations ALTER COLUMN registration_id SET DEFAULT nextval('public.serviceman_registrations_registration_id_seq'::regclass);


--
-- TOC entry 3390 (class 0 OID 66018)
-- Dependencies: 218
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (user_id, email, password, full_name, phone_number, created_at) FROM stdin;
1	abhinavc038@gmail.com	$2b$10$UaXZn6qvUKAcu80Ki3R41OK0bzOecN.SlN06/U9UvPH1ZV8xTZS0O	Abhinav C	9895843913	2025-03-08 17:55:22.819903+05:30
\.


--
-- TOC entry 3397 (class 0 OID 66081)
-- Dependencies: 225
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, service_request_id, customer_id, serviceman_id, rating, comment, created_at) FROM stdin;
\.


--
-- TOC entry 3396 (class 0 OID 66070)
-- Dependencies: 224
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_requests (request_id, customer_id, service_type, description, latitude, longitude, address, payment_method, payment_id, amount, status, assigned_serviceman, created_at, updated_at, landmark, city, pincode, scheduled_date, time_slot) FROM stdin;
1	1	Furniture Repair	Service requested for Furniture Repair. Includes booking fee: ₹49.00, service fee: ₹30.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741450340667	678.00	pending	\N	2025-03-08 21:42:20.859428+05:30	2025-03-08 21:42:20.859428+05:30		Kannur	670017	2025-03-22	02:00 PM - 04:00 PM
2	1	Exterior Painting	Service requested for Exterior Painting. Includes booking fee: ₹49.00, service fee: ₹1000.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741450430626	21048.00	pending	\N	2025-03-08 21:43:50.700084+05:30	2025-03-08 21:43:50.700084+05:30		Kannur	670017	2025-03-28	02:00 PM - 04:00 PM
3	1	Exterior Painting	Service requested for Exterior Painting. Includes booking fee: ₹49.00, service fee: ₹1000.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741451761619	21048.00	pending	\N	2025-03-08 22:06:01.708289+05:30	2025-03-08 22:06:01.708289+05:30		Kannur	670017	2025-03-21	02:00 PM - 04:00 PM
4	1	Door Work	Service requested for Door Work. Includes booking fee: ₹49.00, service fee: ₹40.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741452014949	888.00	pending	\N	2025-03-08 22:10:15.01859+05:30	2025-03-08 22:10:15.01859+05:30		Kannur	670017	2025-03-28	04:00 PM - 06:00 PM
5	1	Wood Polish	Service requested for Wood Polish. Includes booking fee: ₹49.00, service fee: ₹45.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741452644454	993.00	pending	\N	2025-03-08 22:20:44.470118+05:30	2025-03-08 22:20:44.470118+05:30		Kannur	670017	2025-03-20	02:00 PM - 04:00 PM
6	1	Wiring Work	Service requested for Wiring Work. Includes booking fee: ₹49.00, service fee: ₹35.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741452719924	783.00	pending	\N	2025-03-08 22:22:00.008915+05:30	2025-03-08 22:22:00.008915+05:30		Kannur	670017	2025-03-20	04:00 PM - 06:00 PM
7	1	Door Work	Service requested for Door Work. Includes booking fee: ₹49.00, service fee: ₹40.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741453008418	888.00	pending	\N	2025-03-08 22:26:48.509715+05:30	2025-03-08 22:26:48.509715+05:30		Kannur	670017	2025-03-15	02:00 PM - 04:00 PM
8	1	Furniture Repair	Service requested for Furniture Repair. Includes booking fee: ₹49.00, service fee: ₹30.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741453028284	678.00	pending	\N	2025-03-08 22:27:08.357515+05:30	2025-03-08 22:27:08.357515+05:30		Kannur	670017	2025-03-28	02:00 PM - 04:00 PM
9	1	Fan Repair	Service requested for Fan Repair. Includes booking fee: ₹49.00, service fee: ₹20.00	11.86630000	75.36600000	Dhanalakshmi Bank, Fort Road, Caltex, Thavakkara, Kannur, Kerala, 670017, India	demo	pay_demo_1741453050901	468.00	pending	\N	2025-03-08 22:27:30.972908+05:30	2025-03-08 22:27:30.972908+05:30		Kannur	670017	2025-03-12	11:00 AM - 01:00 PM
\.


--
-- TOC entry 3394 (class 0 OID 66043)
-- Dependencies: 222
-- Data for Name: serviceman_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serviceman_profiles (serviceman_id, email, password, full_name, phone_number, address, city, pincode, skills, rating, total_jobs, completed_jobs, cancelled_jobs, current_status, current_location, is_active, created_at, last_active_at) FROM stdin;
\.


--
-- TOC entry 3392 (class 0 OID 66030)
-- Dependencies: 220
-- Data for Name: serviceman_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serviceman_registrations (registration_id, email, password, full_name, phone_number, id_proof_path, id_proof_content, address, city, pincode, skills, status, rejection_reason, created_at) FROM stdin;
\.


--
-- TOC entry 3395 (class 0 OID 66060)
-- Dependencies: 223
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (service_id, title, description, category, base_price, image_url, created_at, is_active) FROM stdin;
1	House Cleaning	Professional house cleaning service	Cleaning	599.00	/images/services/cleaning.png	2025-03-08 17:52:14.366642+05:30	t
2	Plumbing Work	Expert plumbing repair and installation	Plumbing	499.00	/images/services/plumbing.png	2025-03-08 17:52:14.366642+05:30	t
3	AC Service	AC maintenance and repair	Appliance	799.00	/images/services/ac.png	2025-03-08 17:52:14.366642+05:30	t
4	Painting	Professional painting service	Home Care	1499.00	/images/services/painting.png	2025-03-08 17:52:14.366642+05:30	t
5	Pest Control	Comprehensive pest control treatment	Home Care	1299.00	/images/services/pest-control.png	2025-03-08 17:52:14.366642+05:30	t
6	Carpentry Work	Custom carpentry services	Carpentry	999.00	/images/services/carpentry.png	2025-03-08 17:52:14.366642+05:30	t
7	Electrical Repair	Professional electrical services	Electrical	699.00	/images/services/electrical.png	2025-03-08 17:52:14.366642+05:30	t
8	Appliance Repair	All appliance repair services	Appliance	899.00	/images/services/appliance.png	2025-03-08 17:52:14.366642+05:30	t
\.


--
-- TOC entry 3405 (class 0 OID 0)
-- Dependencies: 215
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- TOC entry 3406 (class 0 OID 0)
-- Dependencies: 216
-- Name: service_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_requests_request_id_seq', 9, true);


--
-- TOC entry 3407 (class 0 OID 0)
-- Dependencies: 221
-- Name: serviceman_profiles_serviceman_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.serviceman_profiles_serviceman_id_seq', 1, false);


--
-- TOC entry 3408 (class 0 OID 0)
-- Dependencies: 219
-- Name: serviceman_registrations_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.serviceman_registrations_registration_id_seq', 1, false);


--
-- TOC entry 3409 (class 0 OID 0)
-- Dependencies: 217
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq', 8, true);


--
-- TOC entry 3410 (class 0 OID 0)
-- Dependencies: 214
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- TOC entry 3222 (class 2606 OID 66028)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 3224 (class 2606 OID 66026)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3238 (class 2606 OID 66090)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 3236 (class 2606 OID 66080)
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (request_id);


--
-- TOC entry 3230 (class 2606 OID 66059)
-- Name: serviceman_profiles serviceman_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_profiles
    ADD CONSTRAINT serviceman_profiles_email_key UNIQUE (email);


--
-- TOC entry 3232 (class 2606 OID 66057)
-- Name: serviceman_profiles serviceman_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_profiles
    ADD CONSTRAINT serviceman_profiles_pkey PRIMARY KEY (serviceman_id);


--
-- TOC entry 3226 (class 2606 OID 66041)
-- Name: serviceman_registrations serviceman_registrations_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_registrations
    ADD CONSTRAINT serviceman_registrations_email_key UNIQUE (email);


--
-- TOC entry 3228 (class 2606 OID 66039)
-- Name: serviceman_registrations serviceman_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serviceman_registrations
    ADD CONSTRAINT serviceman_registrations_pkey PRIMARY KEY (registration_id);


--
-- TOC entry 3234 (class 2606 OID 66069)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 3241 (class 2606 OID 66101)
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(user_id);


--
-- TOC entry 3242 (class 2606 OID 66106)
-- Name: reviews reviews_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(request_id);


--
-- TOC entry 3243 (class 2606 OID 66111)
-- Name: reviews reviews_serviceman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_serviceman_id_fkey FOREIGN KEY (serviceman_id) REFERENCES public.serviceman_profiles(serviceman_id);


--
-- TOC entry 3239 (class 2606 OID 66096)
-- Name: service_requests service_requests_assigned_serviceman_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_assigned_serviceman_fkey FOREIGN KEY (assigned_serviceman) REFERENCES public.serviceman_profiles(serviceman_id);


--
-- TOC entry 3240 (class 2606 OID 66091)
-- Name: service_requests service_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(user_id);


-- Completed on 2025-03-08 22:34:51

--
-- PostgreSQL database dump complete
--

