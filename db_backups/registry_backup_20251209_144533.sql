--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

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

ALTER TABLE IF EXISTS ONLY public.visions DROP CONSTRAINT IF EXISTS visions_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_cases DROP CONSTRAINT IF EXISTS use_cases_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_cases DROP CONSTRAINT IF EXISTS use_cases_primary_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_stakeholders DROP CONSTRAINT IF EXISTS use_case_stakeholders_use_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_stakeholders DROP CONSTRAINT IF EXISTS use_case_stakeholders_person_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_preconditions DROP CONSTRAINT IF EXISTS use_case_preconditions_use_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_preconditions DROP CONSTRAINT IF EXISTS use_case_preconditions_precondition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_postconditions DROP CONSTRAINT IF EXISTS use_case_postconditions_use_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_postconditions DROP CONSTRAINT IF EXISTS use_case_postconditions_postcondition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_exceptions DROP CONSTRAINT IF EXISTS use_case_exceptions_use_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.use_case_exceptions DROP CONSTRAINT IF EXISTS use_case_exceptions_exception_id_fkey;
ALTER TABLE IF EXISTS ONLY public.requirements DROP CONSTRAINT IF EXISTS requirements_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.preconditions DROP CONSTRAINT IF EXISTS preconditions_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.postconditions DROP CONSTRAINT IF EXISTS postconditions_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.needs DROP CONSTRAINT IF EXISTS needs_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.need_sites DROP CONSTRAINT IF EXISTS need_sites_site_id_fkey;
ALTER TABLE IF EXISTS ONLY public.need_sites DROP CONSTRAINT IF EXISTS need_sites_need_id_fkey;
ALTER TABLE IF EXISTS ONLY public.need_components DROP CONSTRAINT IF EXISTS need_components_need_id_fkey;
ALTER TABLE IF EXISTS ONLY public.need_components DROP CONSTRAINT IF EXISTS need_components_component_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exceptions DROP CONSTRAINT IF EXISTS exceptions_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagrams DROP CONSTRAINT IF EXISTS diagrams_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagram_edges DROP CONSTRAINT IF EXISTS diagram_edges_target_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagram_edges DROP CONSTRAINT IF EXISTS diagram_edges_source_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagram_edges DROP CONSTRAINT IF EXISTS diagram_edges_diagram_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagram_components DROP CONSTRAINT IF EXISTS diagram_components_diagram_id_fkey;
ALTER TABLE IF EXISTS ONLY public.diagram_components DROP CONSTRAINT IF EXISTS diagram_components_component_id_fkey;
ALTER TABLE IF EXISTS ONLY public.components DROP CONSTRAINT IF EXISTS components_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.component_relationships DROP CONSTRAINT IF EXISTS component_relationships_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.component_relationships DROP CONSTRAINT IF EXISTS component_relationships_child_id_fkey;
DROP INDEX IF EXISTS public.ix_visions_project_id;
DROP INDEX IF EXISTS public.ix_visions_area;
DROP INDEX IF EXISTS public.ix_visions_aid;
DROP INDEX IF EXISTS public.ix_users_username;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_users_aid;
DROP INDEX IF EXISTS public.ix_use_cases_project_id;
DROP INDEX IF EXISTS public.ix_use_cases_aid;
DROP INDEX IF EXISTS public.ix_sites_id;
DROP INDEX IF EXISTS public.ix_requirements_project_id;
DROP INDEX IF EXISTS public.ix_requirements_aid;
DROP INDEX IF EXISTS public.ix_projects_name;
DROP INDEX IF EXISTS public.ix_projects_id;
DROP INDEX IF EXISTS public.ix_preconditions_project_id;
DROP INDEX IF EXISTS public.ix_preconditions_id;
DROP INDEX IF EXISTS public.ix_postconditions_project_id;
DROP INDEX IF EXISTS public.ix_postconditions_id;
DROP INDEX IF EXISTS public.ix_people_id;
DROP INDEX IF EXISTS public.ix_needs_project_id;
DROP INDEX IF EXISTS public.ix_needs_aid;
DROP INDEX IF EXISTS public.ix_linkages_project_id;
DROP INDEX IF EXISTS public.ix_linkages_aid;
DROP INDEX IF EXISTS public.ix_exceptions_project_id;
DROP INDEX IF EXISTS public.ix_exceptions_id;
DROP INDEX IF EXISTS public.ix_documents_project_id;
DROP INDEX IF EXISTS public.ix_documents_area;
DROP INDEX IF EXISTS public.ix_documents_aid;
DROP INDEX IF EXISTS public.ix_diagrams_id;
DROP INDEX IF EXISTS public.ix_components_id;
DROP INDEX IF EXISTS public.ix_comments_artifact_aid;
DROP INDEX IF EXISTS public.ix_artifact_events_id;
DROP INDEX IF EXISTS public.ix_areas_code;
ALTER TABLE IF EXISTS ONLY public.visions DROP CONSTRAINT IF EXISTS visions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.use_cases DROP CONSTRAINT IF EXISTS use_cases_pkey;
ALTER TABLE IF EXISTS ONLY public.use_case_stakeholders DROP CONSTRAINT IF EXISTS use_case_stakeholders_pkey;
ALTER TABLE IF EXISTS ONLY public.use_case_preconditions DROP CONSTRAINT IF EXISTS use_case_preconditions_pkey;
ALTER TABLE IF EXISTS ONLY public.use_case_postconditions DROP CONSTRAINT IF EXISTS use_case_postconditions_pkey;
ALTER TABLE IF EXISTS ONLY public.use_case_exceptions DROP CONSTRAINT IF EXISTS use_case_exceptions_pkey;
ALTER TABLE IF EXISTS ONLY public.sites DROP CONSTRAINT IF EXISTS sites_pkey;
ALTER TABLE IF EXISTS ONLY public.requirements DROP CONSTRAINT IF EXISTS requirements_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.preconditions DROP CONSTRAINT IF EXISTS preconditions_pkey;
ALTER TABLE IF EXISTS ONLY public.postconditions DROP CONSTRAINT IF EXISTS postconditions_pkey;
ALTER TABLE IF EXISTS ONLY public.people DROP CONSTRAINT IF EXISTS people_pkey;
ALTER TABLE IF EXISTS ONLY public.needs DROP CONSTRAINT IF EXISTS needs_pkey;
ALTER TABLE IF EXISTS ONLY public.need_sites DROP CONSTRAINT IF EXISTS need_sites_pkey;
ALTER TABLE IF EXISTS ONLY public.need_components DROP CONSTRAINT IF EXISTS need_components_pkey;
ALTER TABLE IF EXISTS ONLY public.linkages DROP CONSTRAINT IF EXISTS linkages_pkey;
ALTER TABLE IF EXISTS ONLY public.exceptions DROP CONSTRAINT IF EXISTS exceptions_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.diagrams DROP CONSTRAINT IF EXISTS diagrams_pkey;
ALTER TABLE IF EXISTS ONLY public.diagram_edges DROP CONSTRAINT IF EXISTS diagram_edges_pkey;
ALTER TABLE IF EXISTS ONLY public.diagram_components DROP CONSTRAINT IF EXISTS diagram_components_pkey;
ALTER TABLE IF EXISTS ONLY public.components DROP CONSTRAINT IF EXISTS components_pkey;
ALTER TABLE IF EXISTS ONLY public.component_relationships DROP CONSTRAINT IF EXISTS component_relationships_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.artifact_events DROP CONSTRAINT IF EXISTS artifact_events_pkey;
ALTER TABLE IF EXISTS ONLY public.areas DROP CONSTRAINT IF EXISTS areas_pkey;
ALTER TABLE IF EXISTS ONLY public.alembic_version DROP CONSTRAINT IF EXISTS alembic_version_pkc;
ALTER TABLE IF EXISTS public.artifact_events ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.visions;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.use_cases;
DROP TABLE IF EXISTS public.use_case_stakeholders;
DROP TABLE IF EXISTS public.use_case_preconditions;
DROP TABLE IF EXISTS public.use_case_postconditions;
DROP TABLE IF EXISTS public.use_case_exceptions;
DROP TABLE IF EXISTS public.sites;
DROP TABLE IF EXISTS public.requirements;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.preconditions;
DROP TABLE IF EXISTS public.postconditions;
DROP TABLE IF EXISTS public.people;
DROP TABLE IF EXISTS public.needs;
DROP TABLE IF EXISTS public.need_sites;
DROP TABLE IF EXISTS public.need_components;
DROP TABLE IF EXISTS public.linkages;
DROP TABLE IF EXISTS public.exceptions;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.diagrams;
DROP TABLE IF EXISTS public.diagram_edges;
DROP TABLE IF EXISTS public.diagram_components;
DROP TABLE IF EXISTS public.components;
DROP TABLE IF EXISTS public.component_relationships;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.artifact_events_id_seq;
DROP TABLE IF EXISTS public.artifact_events;
DROP TABLE IF EXISTS public.areas;
DROP TABLE IF EXISTS public.alembic_version;
DROP TYPE IF EXISTS public.status;
DROP TYPE IF EXISTS public.reqlevel;
DROP TYPE IF EXISTS public.needlevel;
DROP TYPE IF EXISTS public.linktype;
DROP TYPE IF EXISTS public.earstype;
DROP TYPE IF EXISTS public.documenttype;
--
-- Name: documenttype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.documenttype AS ENUM (
    'URL',
    'FILE',
    'TEXT'
);


--
-- Name: earstype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.earstype AS ENUM (
    'UBIQUITOUS',
    'EVENT_DRIVEN',
    'UNWANTED_BEHAVIOR',
    'STATE_DRIVEN',
    'OPTIONAL_FEATURE',
    'COMPLEX'
);


--
-- Name: linktype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.linktype AS ENUM (
    'DERIVES_FROM',
    'SATISFIES',
    'REFINES',
    'VERIFIES',
    'PARENT',
    'TRACES_TO',
    'DEPENDS_ON',
    'ILLUSTRATED_BY',
    'DOCUMENTED_IN',
    'ALLOCATED_TO',
    'RELATED_TO'
);


--
-- Name: needlevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.needlevel AS ENUM (
    'MISSION',
    'ENTERPRISE',
    'TECHNICAL'
);


--
-- Name: reqlevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reqlevel AS ENUM (
    'STK',
    'SYS',
    'SUB'
);


--
-- Name: status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status AS ENUM (
    'DRAFT',
    'READY_FOR_REVIEW',
    'IN_REVIEW',
    'APPROVED',
    'DEFERRED',
    'REJECTED',
    'SUPERSEDED',
    'RETIRED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    code character varying NOT NULL,
    name character varying NOT NULL,
    description text
);


--
-- Name: artifact_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artifact_events (
    id integer NOT NULL,
    artifact_type character varying NOT NULL,
    artifact_id character varying NOT NULL,
    event_type character varying NOT NULL,
    event_data json NOT NULL,
    "timestamp" timestamp without time zone,
    user_id character varying,
    user_name character varying,
    comment character varying
);


--
-- Name: artifact_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.artifact_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: artifact_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.artifact_events_id_seq OWNED BY public.artifact_events.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    artifact_aid character varying NOT NULL,
    field_name character varying NOT NULL,
    comment_text text NOT NULL,
    author character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved boolean NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by character varying
);


--
-- Name: component_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.component_relationships (
    parent_id character varying NOT NULL,
    child_id character varying NOT NULL,
    cardinality character varying,
    type character varying,
    protocol character varying,
    data_items character varying
);


--
-- Name: components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.components (
    id character varying NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    description character varying,
    x integer,
    y integer,
    tags character varying,
    lifecycle character varying,
    project_id character varying
);


--
-- Name: diagram_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagram_components (
    diagram_id character varying NOT NULL,
    component_id character varying NOT NULL,
    x integer,
    y integer
);


--
-- Name: diagram_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagram_edges (
    diagram_id character varying NOT NULL,
    source_id character varying NOT NULL,
    target_id character varying NOT NULL,
    source_handle character varying,
    target_handle character varying
);


--
-- Name: diagrams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagrams (
    id character varying NOT NULL,
    project_id character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    type character varying,
    filter_data json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    title character varying NOT NULL,
    description text,
    document_type public.documenttype NOT NULL,
    content_url character varying NOT NULL,
    mime_type character varying,
    aid character varying NOT NULL,
    status public.status,
    area character varying,
    created_date timestamp without time zone,
    last_updated timestamp without time zone,
    project_id character varying NOT NULL,
    content_text text
);


--
-- Name: exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exceptions (
    id character varying NOT NULL,
    trigger character varying NOT NULL,
    handling text NOT NULL,
    project_id character varying NOT NULL
);


--
-- Name: linkages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linkages (
    aid character varying NOT NULL,
    source_artifact_type character varying NOT NULL,
    source_id character varying NOT NULL,
    target_artifact_type character varying NOT NULL,
    target_id character varying NOT NULL,
    relationship_type public.linktype NOT NULL,
    project_id character varying NOT NULL
);


--
-- Name: need_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.need_components (
    need_id character varying NOT NULL,
    component_id character varying NOT NULL
);


--
-- Name: need_sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.need_sites (
    need_id character varying NOT NULL,
    site_id character varying NOT NULL
);


--
-- Name: needs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.needs (
    title character varying NOT NULL,
    description text NOT NULL,
    level public.needlevel,
    rationale text,
    area character varying,
    owner_id character varying,
    stakeholder_id character varying,
    aid character varying NOT NULL,
    status public.status,
    created_date timestamp without time zone,
    last_updated timestamp without time zone,
    project_id character varying NOT NULL
);


--
-- Name: people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.people (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    project_id character varying,
    roles json
);


--
-- Name: postconditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.postconditions (
    id character varying NOT NULL,
    text character varying NOT NULL,
    project_id character varying NOT NULL
);


--
-- Name: preconditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preconditions (
    id character varying NOT NULL,
    text character varying NOT NULL,
    project_id character varying NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description text
);


--
-- Name: requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirements (
    short_name character varying NOT NULL,
    text text NOT NULL,
    level public.reqlevel NOT NULL,
    ears_type public.earstype NOT NULL,
    area character varying,
    ears_trigger text,
    ears_state text,
    ears_condition text,
    ears_feature text,
    rationale text,
    owner character varying,
    aid character varying NOT NULL,
    status public.status,
    created_date timestamp without time zone,
    last_updated timestamp without time zone,
    project_id character varying NOT NULL
);


--
-- Name: sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites (
    id character varying NOT NULL,
    name character varying NOT NULL,
    security_domain character varying
);


--
-- Name: use_case_exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use_case_exceptions (
    use_case_id character varying NOT NULL,
    exception_id character varying NOT NULL
);


--
-- Name: use_case_postconditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use_case_postconditions (
    use_case_id character varying NOT NULL,
    postcondition_id character varying NOT NULL
);


--
-- Name: use_case_preconditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use_case_preconditions (
    use_case_id character varying NOT NULL,
    precondition_id character varying NOT NULL
);


--
-- Name: use_case_stakeholders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use_case_stakeholders (
    use_case_id character varying NOT NULL,
    person_id character varying NOT NULL
);


--
-- Name: use_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use_cases (
    title character varying NOT NULL,
    description text,
    area character varying,
    trigger text,
    primary_actor_id character varying,
    mss json,
    extensions json,
    aid character varying NOT NULL,
    status public.status,
    created_date timestamp without time zone,
    last_updated timestamp without time zone,
    project_id character varying NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    aid character varying NOT NULL,
    username character varying,
    email character varying,
    hashed_password character varying,
    is_active character varying,
    created_date timestamp without time zone
);


--
-- Name: visions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visions (
    title character varying,
    description text,
    aid character varying NOT NULL,
    status public.status,
    area character varying,
    created_date timestamp without time zone,
    last_updated timestamp without time zone,
    project_id character varying NOT NULL
);


--
-- Name: artifact_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact_events ALTER COLUMN id SET DEFAULT nextval('public.artifact_events_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
8a6a44960292
\.


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.areas (code, name, description) FROM stdin;
AIC2	AI Command and Control	
UC	Unified Communications	\N
MC	Modernize Comms	\N
GLOBAL	GLOBAL	
ISR	ISR	
CLD	Combat Cloud	\N
JER	JERNAS	\N
DSO	DevSecOps	\N
\.


--
-- Data for Name: artifact_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artifact_events (id, artifact_type, artifact_id, event_type, event_data, "timestamp", user_id, user_name, comment) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, artifact_aid, field_name, comment_text, author, created_at, resolved, resolved_at, resolved_by) FROM stdin;
ba2b4cf7-de9f-4e2d-848c-284da987ea84	TR2-AIC2-NEED-002	description	testing comments\n	Reviewer	2025-12-07 11:56:25.415944+04	f	\N	\N
5a4c78c2-69c6-466a-97aa-5fa364a4cc7a	TR2-AIC2-NEED-002	rationale	test 2	Reviewer	2025-12-07 12:01:26.179303+04	t	2025-12-07 08:10:25.300353+04	Reviewer
606aed69-2fce-4973-acd9-f029a943ab4a	TR2-GLOBAL-UC-001	postconditions	seriously	Reviewer	2025-12-07 12:13:27.56472+04	t	2025-12-07 08:13:33.827861+04	Reviewer
\.


--
-- Data for Name: component_relationships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.component_relationships (parent_id, child_id, cardinality, type, protocol, data_items) FROM stdin;
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	a209b9d8-3f2d-4c07-9de0-d6636a11be63	*	composition		
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	f5bbfcaf-e701-4790-ab92-98f66149f3c2	1	composition		
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	39fd9361-5b15-475b-8cd5-e5f58ce2ba44	1	composition		
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	96fc07d5-c51c-418f-a2ad-4fb65d94ea32	1	composition		
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	9dc238b7-a1c0-425d-b6f8-c1812427d329	1	composition		
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	eed12d39-cb3f-4211-90c6-ac802b0adc6b	1	composition		
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	3d875027-64ec-433f-8f7a-28fcc42e5809	1	composition		
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	59b947eb-d878-4020-88e2-5db63e9c33d1	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	026bd82b-0eee-4680-a43a-ad2ffd67b271	1	composition		
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	04065bf3-b3e0-4e56-b6a0-65e35c40f79b	1	communication	TR1	
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	1c0d79c9-b901-45ec-b4d4-0090f03f31fd	1	communication	TR2	
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	6b0cc3f0-2f3d-47b7-aa1e-d139709b97fb	1	composition		
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	3187d41c-8b40-4572-9d25-6bca582bcd7b	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	4eb87dbd-2f63-47a5-b9a1-c14364809ffc	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	af0a98f7-efcd-4157-b2ec-da63e931814f	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	523d568c-ec5c-436d-8f65-eacd5d44ac5d	1	composition		
989736dc-515c-47f1-a188-5f3798c7c7af	ad2c2e36-ef90-4e5b-9a39-d3786ff83ffc	1	composition		
989736dc-515c-47f1-a188-5f3798c7c7af	5cd004bb-deff-453f-b43e-aee59dc0a743	1	composition		
7c4be581-b17f-42f3-8008-18423a0aa4b9	3bfafb77-62af-4189-94e6-d982c1353173	1	composition		
7c4be581-b17f-42f3-8008-18423a0aa4b9	91eda296-e967-40f1-a9d9-5a3fca7fef8c	1	composition		
7c4be581-b17f-42f3-8008-18423a0aa4b9	7280b69d-873a-44be-bd4b-3174df07fbcb	1	composition		
989736dc-515c-47f1-a188-5f3798c7c7af	c1a8fc05-35f5-47eb-97fe-777f0968fc48	1	composition		
989736dc-515c-47f1-a188-5f3798c7c7af	7c4be581-b17f-42f3-8008-18423a0aa4b9	1	communication	TR1	
7c4be581-b17f-42f3-8008-18423a0aa4b9	05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	1	communication	TR2	
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	fb6a9858-f843-433c-9013-a09f319c8827	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	ed9bbfa6-54a2-4f94-ba38-95f17e8b456c	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	5b3012e2-16be-43d6-99ff-c1ab93180d7f	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	9fb65d8a-9da9-452c-84c4-5ecced155d01	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	432bccf5-a0cf-4e6f-b7b3-0f389e83f281	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	f34e7aa9-8f5a-4be7-816c-9cd961368038	1	composition		
2bace07c-a711-4a12-87d5-254d22cd2b06	9c0d4bf7-8de4-4a29-aeb8-1d6657896980	1	composition		
2bace07c-a711-4a12-87d5-254d22cd2b06	09f6b631-c634-403f-b8df-41abb75907a8	1	composition		
2bace07c-a711-4a12-87d5-254d22cd2b06	586c4fc3-bc0d-487f-8f9c-0411b4e757a9	1	composition		
2bace07c-a711-4a12-87d5-254d22cd2b06	79589a7d-708a-4664-b145-5febb3333ccc	1	composition		
c6e8740c-3145-43dc-bb12-9f1e4c730c5c	4ed40965-f6f4-4909-ad58-15577136f97b	1	composition		
c6e8740c-3145-43dc-bb12-9f1e4c730c5c	fe3e51c0-744f-4d2e-9eaa-022d30f69986	1	composition		
c6e8740c-3145-43dc-bb12-9f1e4c730c5c	45e4e0a5-b803-4d1b-84be-b92ce72bc029	1	composition		
c6e8740c-3145-43dc-bb12-9f1e4c730c5c	2bace07c-a711-4a12-87d5-254d22cd2b06	1	communication	TR1	
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	43a0556f-8ffe-4e7a-8790-74fb0d0a0327	4	composition		
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	fef45207-1028-435d-be22-e8c9d25525e0	2	composition		
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	a36ec61d-5c44-44fa-a00e-3300b063546c	1	composition		
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	f5081d24-ca63-44d0-a63f-59386eaac013	1	composition		
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	f51e6637-3bb9-48e1-a2a8-989c66d18c33	2	composition		
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	f54440a6-8140-4da6-94aa-92c673e37a5e	4	composition		
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	54fb4d02-4277-405a-95d3-2f04bd0bc8ee	1	composition		
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	58437f73-568e-43fe-905e-7094f39efbba	1	composition		
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	6b26e058-ed22-4bd1-8c2d-60c95bb1442e	1	communication	TR1	
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	f54440a6-8140-4da6-94aa-92c673e37a5e	1	composition		
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	f51e6637-3bb9-48e1-a2a8-989c66d18c33	1	composition		
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	58437f73-568e-43fe-905e-7094f39efbba	1	composition		
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	54fb4d02-4277-405a-95d3-2f04bd0bc8ee	1	composition		
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	4e79498c-c8d5-4cfd-8baf-5bc2b7cda29c	1	composition		
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	1	communication	TR2	
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	e084feb4-2aad-44c7-ad4f-f6d309ad0b18	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	c312d773-ec80-4303-b8ab-67dbd5dfee53	1	composition		
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	078f4099-cae1-429e-8902-f18617ea916d	1	composition		
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	078f4099-cae1-429e-8902-f18617ea916d	1	composition		
\.


--
-- Data for Name: components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.components (id, name, type, description, x, y, tags, lifecycle, project_id) FROM stdin;
39fd9361-5b15-475b-8cd5-e5f58ce2ba44	JRE	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
3187d41c-8b40-4572-9d25-6bca582bcd7b	WEM	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
96fc07d5-c51c-418f-a2ad-4fb65d94ea32	BC3	Software		\N	\N	["TR1"]	Legacy	a1573933-ec35-4bbd-a94c-e0fedbd2581d
3d875027-64ec-433f-8f7a-28fcc42e5809	WEM	Software		\N	\N	["TR1"]	Legacy	a1573933-ec35-4bbd-a94c-e0fedbd2581d
a209b9d8-3f2d-4c07-9de0-d6636a11be63	TDF	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f5bbfcaf-e701-4790-ab92-98f66149f3c2	MSCT	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
59b947eb-d878-4020-88e2-5db63e9c33d1	CIQ Exportable Tracker	Software	CommandIQ Exportable Tracker	\N	\N	["TR1"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
6b26e058-ed22-4bd1-8c2d-60c95bb1442e	Compute Stack	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
e084feb4-2aad-44c7-ad4f-f6d309ad0b18	CIQ Exportable Tracker	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
2bace07c-a711-4a12-87d5-254d22cd2b06	Network Stack	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	Compute Stack	Hardware		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
2a5de2ae-7650-4d7d-a17b-5b7baa6f986a	Comms	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
026bd82b-0eee-4680-a43a-ad2ffd67b271	CIQ Battle Management	Software	CommandIQ AI Augmented Battle Manager	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9dc238b7-a1c0-425d-b6f8-c1812427d329	CIQ MSCS	Software	CommandIQ Multi Source Correlation System	\N	\N	["TR1"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
eed12d39-cb3f-4211-90c6-ac802b0adc6b	CIQ IO  Adaptors	Software	CommandIQ Input/Output Adaptors	\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
6b0cc3f0-2f3d-47b7-aa1e-d139709b97fb	CIQ SRM	Software	CommandIQ Sensor Resource Manager	\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
3bfafb77-62af-4189-94e6-d982c1353173	CIQ V2+ Common Services	Software		\N	\N	["TR1"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4eb87dbd-2f63-47a5-b9a1-c14364809ffc	CIQ Threat Assessment	Software	Command IQ AI Augmented Threat Assessment	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
af0a98f7-efcd-4157-b2ec-da63e931814f	CIQ Engagement 	Software	Command IQ AI Augmented Engagement Coordination	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
523d568c-ec5c-436d-8f65-eacd5d44ac5d	CIQ Datalink Gateway	Software	CommandIQ Track and Data Management	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ad2c2e36-ef90-4e5b-9a39-d3786ff83ffc	DIAMOND Shield	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
5cd004bb-deff-453f-b43e-aee59dc0a743	Common Services	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
91eda296-e967-40f1-a9d9-5a3fca7fef8c	CIQ DIAMOND Shield	Software		\N	\N	["TR1"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
fb6a9858-f843-433c-9013-a09f319c8827	CIQ V3 Common Services	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
0483d73b-78b0-4d71-b97b-8c4c4ea442dd	CRC	Software	CRC EADGE-T	\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
04065bf3-b3e0-4e56-b6a0-65e35c40f79b	CRC	Software	CRC Planned for TR1	\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
1c0d79c9-b901-45ec-b4d4-0090f03f31fd	CRC	Software	CRC Planned for TR2	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	CAOC	Software	CAOC Planned for TR2	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
989736dc-515c-47f1-a188-5f3798c7c7af	CAOC	Software	Current CAOC EADGE-T	\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
7c4be581-b17f-42f3-8008-18423a0aa4b9	CAOC	Software	CAOC Planned for TR1	\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f54440a6-8140-4da6-94aa-92c673e37a5e	Dell R760	Hardware		\N	\N	["TR1", "TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
5b3012e2-16be-43d6-99ff-c1ab93180d7f	CIQ ISR	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9fb65d8a-9da9-452c-84c4-5ecced155d01	CIQ - BDA	Software	CommandIQ Battle Damage Assessment	\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
432bccf5-a0cf-4e6f-b7b3-0f389e83f281	CIQ Mod & Sim	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
7280b69d-873a-44be-bd4b-3174df07fbcb	ISR	Software		\N	\N	["TR1"]	Legacy	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c6e8740c-3145-43dc-bb12-9f1e4c730c5c	Network Stack	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4ed40965-f6f4-4909-ad58-15577136f97b	Juniper EX4550 Switch	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f51e6637-3bb9-48e1-a2a8-989c66d18c33	Dell R660	Hardware		\N	\N	["TR1", "TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9c0d4bf7-8de4-4a29-aeb8-1d6657896980	Juniper QX5120 Leaf Switch	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
586c4fc3-bc0d-487f-8f9c-0411b4e757a9	Juniper SRX4700 Firewall	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
79589a7d-708a-4664-b145-5febb3333ccc	Juniper SRX4700 Encryptor	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	Compute Stack	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
fef45207-1028-435d-be22-e8c9d25525e0	Dell R640	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
a36ec61d-5c44-44fa-a00e-3300b063546c	VSAN - 13,350GB SSD	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
58437f73-568e-43fe-905e-7094f39efbba	VMWare Cloud 9	Software		\N	\N	["TR1", "TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4e79498c-c8d5-4cfd-8baf-5bc2b7cda29c	GPU Cluster	Hardware		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ed9bbfa6-54a2-4f94-ba38-95f17e8b456c	CIQ Planner	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f34e7aa9-8f5a-4be7-816c-9cd961368038	CIQ Effector Management	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
fe3e51c0-744f-4d2e-9eaa-022d30f69986	Juniper Firewall	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
09f6b631-c634-403f-b8df-41abb75907a8	Juniper QX5220 Spine Switch	Hardware		\N	\N	["TR1"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
43a0556f-8ffe-4e7a-8790-74fb0d0a0327	Dell R740	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f5081d24-ca63-44d0-a63f-59386eaac013	VMWare 6.7	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c1a8fc05-35f5-47eb-97fe-777f0968fc48	ISR	Software		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c312d773-ec80-4303-b8ab-67dbd5dfee53	CIQ SRM	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
078f4099-cae1-429e-8902-f18617ea916d	CIQ IO  Adaptors	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
45e4e0a5-b803-4d1b-84be-b92ce72bc029	Juniper Encryptor	Hardware		\N	\N	["EADGE-T"]	Active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
54fb4d02-4277-405a-95d3-2f04bd0bc8ee	VSAN 46,080 GB SSD	Hardware		\N	\N	["TR1", "TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ce33d846-dcf8-4530-ba14-753738c92cb0	CIQ SCM	Software		\N	\N	["TR2"]	Planned	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: diagram_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagram_components (diagram_id, component_id, x, y) FROM stdin;
0392b7fe-b683-4928-923d-107552922be5	05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d	1264	-68
0392b7fe-b683-4928-923d-107552922be5	989736dc-515c-47f1-a188-5f3798c7c7af	55	-70
0392b7fe-b683-4928-923d-107552922be5	7c4be581-b17f-42f3-8008-18423a0aa4b9	647	-69
0392b7fe-b683-4928-923d-107552922be5	7280b69d-873a-44be-bd4b-3174df07fbcb	649	135
9298054f-67c0-4286-a2e2-377bd82e3ffc	79589a7d-708a-4664-b145-5febb3333ccc	790	17
9298054f-67c0-4286-a2e2-377bd82e3ffc	586c4fc3-bc0d-487f-8f9c-0411b4e757a9	589	16
9298054f-67c0-4286-a2e2-377bd82e3ffc	09f6b631-c634-403f-b8df-41abb75907a8	388	16
9298054f-67c0-4286-a2e2-377bd82e3ffc	9c0d4bf7-8de4-4a29-aeb8-1d6657896980	199	17
9298054f-67c0-4286-a2e2-377bd82e3ffc	45e4e0a5-b803-4d1b-84be-b92ce72bc029	-45	16
9298054f-67c0-4286-a2e2-377bd82e3ffc	fe3e51c0-744f-4d2e-9eaa-022d30f69986	-245	15
9298054f-67c0-4286-a2e2-377bd82e3ffc	4ed40965-f6f4-4909-ad58-15577136f97b	-440	15
9298054f-67c0-4286-a2e2-377bd82e3ffc	2bace07c-a711-4a12-87d5-254d22cd2b06	457	-224
9298054f-67c0-4286-a2e2-377bd82e3ffc	c6e8740c-3145-43dc-bb12-9f1e4c730c5c	-245	-225
0d331c47-732f-4ffc-908f-3ee2deecef3f	ff6bcaec-c5a0-452b-9bc7-bfd2c825e257	924	-132
0d331c47-732f-4ffc-908f-3ee2deecef3f	58437f73-568e-43fe-905e-7094f39efbba	702	-40
0d331c47-732f-4ffc-908f-3ee2deecef3f	54fb4d02-4277-405a-95d3-2f04bd0bc8ee	748	129
0d331c47-732f-4ffc-908f-3ee2deecef3f	f51e6637-3bb9-48e1-a2a8-989c66d18c33	374	128
0d331c47-732f-4ffc-908f-3ee2deecef3f	f54440a6-8140-4da6-94aa-92c673e37a5e	565	128
0d331c47-732f-4ffc-908f-3ee2deecef3f	6b26e058-ed22-4bd1-8c2d-60c95bb1442e	470	-132
0d331c47-732f-4ffc-908f-3ee2deecef3f	fef45207-1028-435d-be22-e8c9d25525e0	158	129
0d331c47-732f-4ffc-908f-3ee2deecef3f	43a0556f-8ffe-4e7a-8790-74fb0d0a0327	-35	129
0d331c47-732f-4ffc-908f-3ee2deecef3f	a51f5e4d-7f6f-4c7c-8e04-aa04cf878eb7	64	-133
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	0483d73b-78b0-4d71-b97b-8c4c4ea442dd	211	-40
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	1c0d79c9-b901-45ec-b4d4-0090f03f31fd	1356	-40
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	04065bf3-b3e0-4e56-b6a0-65e35c40f79b	673	-40
0392b7fe-b683-4928-923d-107552922be5	ad2c2e36-ef90-4e5b-9a39-d3786ff83ffc	54	46
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	6b0cc3f0-2f3d-47b7-aa1e-d139709b97fb	674	386
0392b7fe-b683-4928-923d-107552922be5	91eda296-e967-40f1-a9d9-5a3fca7fef8c	760	46
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	c312d773-ec80-4303-b8ab-67dbd5dfee53	1264	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	078f4099-cae1-429e-8902-f18617ea916d	1644	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	39fd9361-5b15-475b-8cd5-e5f58ce2ba44	80	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	96fc07d5-c51c-418f-a2ad-4fb65d94ea32	769	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	3187d41c-8b40-4572-9d25-6bca582bcd7b	368	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	4eb87dbd-2f63-47a5-b9a1-c14364809ffc	1450	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	3d875027-64ec-433f-8f7a-28fcc42e5809	560	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	026bd82b-0eee-4680-a43a-ad2ffd67b271	1641	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	af0a98f7-efcd-4157-b2ec-da63e931814f	1248	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	523d568c-ec5c-436d-8f65-eacd5d44ac5d	1061	75
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	a209b9d8-3f2d-4c07-9de0-d6636a11be63	110	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	9dc238b7-a1c0-425d-b6f8-c1812427d329	767	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	eed12d39-cb3f-4211-90c6-ac802b0adc6b	956	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	f5bbfcaf-e701-4790-ab92-98f66149f3c2	290	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	59b947eb-d878-4020-88e2-5db63e9c33d1	556	288
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	e084feb4-2aad-44c7-ad4f-f6d309ad0b18	1450	288
0392b7fe-b683-4928-923d-107552922be5	5b3012e2-16be-43d6-99ff-c1ab93180d7f	1569	46
0392b7fe-b683-4928-923d-107552922be5	9fb65d8a-9da9-452c-84c4-5ecced155d01	1376	46
0392b7fe-b683-4928-923d-107552922be5	ed9bbfa6-54a2-4f94-ba38-95f17e8b456c	1154	46
0392b7fe-b683-4928-923d-107552922be5	5cd004bb-deff-453f-b43e-aee59dc0a743	246	46
0392b7fe-b683-4928-923d-107552922be5	c1a8fc05-35f5-47eb-97fe-777f0968fc48	-134	46
0392b7fe-b683-4928-923d-107552922be5	3bfafb77-62af-4189-94e6-d982c1353173	524	46
0392b7fe-b683-4928-923d-107552922be5	fb6a9858-f843-433c-9013-a09f319c8827	967	46
0392b7fe-b683-4928-923d-107552922be5	432bccf5-a0cf-4e6f-b7b3-0f389e83f281	1380	243
0392b7fe-b683-4928-923d-107552922be5	f34e7aa9-8f5a-4be7-816c-9cd961368038	1153	243
0d331c47-732f-4ffc-908f-3ee2deecef3f	a36ec61d-5c44-44fa-a00e-3300b063546c	64	214
0d331c47-732f-4ffc-908f-3ee2deecef3f	f5081d24-ca63-44d0-a63f-59386eaac013	257	-40
0d331c47-732f-4ffc-908f-3ee2deecef3f	4e79498c-c8d5-4cfd-8baf-5bc2b7cda29c	1064	-40
\.


--
-- Data for Name: diagram_edges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagram_edges (diagram_id, source_id, target_id, source_handle, target_handle) FROM stdin;
\.


--
-- Data for Name: diagrams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagrams (id, project_id, name, description, type, filter_data, created_at, updated_at) FROM stdin;
ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	a1573933-ec35-4bbd-a94c-e0fedbd2581d	CRC Transition	Transition from EADGE-T to TR2	component	null	2025-12-02 15:04:22+04	2025-12-04 16:00:29+04
0392b7fe-b683-4928-923d-107552922be5	a1573933-ec35-4bbd-a94c-e0fedbd2581d	CAOC Transition		component	null	2025-12-03 06:22:58+04	\N
9298054f-67c0-4286-a2e2-377bd82e3ffc	a1573933-ec35-4bbd-a94c-e0fedbd2581d	Network Stack Transition		component	null	2025-12-03 08:55:59+04	\N
0d331c47-732f-4ffc-908f-3ee2deecef3f	a1573933-ec35-4bbd-a94c-e0fedbd2581d	Compute Stack Transition		component	null	2025-12-03 09:09:22+04	\N
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (title, description, document_type, content_url, mime_type, aid, status, area, created_date, last_updated, project_id, content_text) FROM stdin;
pdf	pdf	FILE	/api/v1/documents/files/20251207122212_cog_tickets.pdf	application/pdf	TR2-AIC2-DOC-001	DRAFT	AIC2	2025-12-07 12:22:15.006895	2025-12-07 12:22:15.006895	a1573933-ec35-4bbd-a94c-e0fedbd2581d	\N
MD Doc	MD Doc	TEXT		\N	TR2-GEN-DOC-001	DRAFT	\N	2025-12-06 14:06:48.182067	2025-12-07 12:31:15.858731	a1573933-ec35-4bbd-a94c-e0fedbd2581d	# TR2 Artifact Registry — Official Link Types Reference Guide  \n**Tech Refresh Phase 2 | 06 December 2025**\n\n| Link Type         | Symbol | Color       | Direction                     | Allowed Source Types                              | Allowed Target Types                                         | When to Use (TR2 Examples)                                                                                                           |\n|-------------------|--------|-------------|-------------------------------|---------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|\n| **derives_from**  | ↓      | Blue        | Child → Parent                | Need, Use Case, Requirement, Test Case            | Vision, Need, Use Case, Requirement                          | Classic vertical traceability<br>• UC-001 **derives_from** TR2-MISSION-NEED-001<br>• SR-1234 **derives_from** UC-001                     |\n| **satisfies**     | ✓      | Green       | Child → Parent (coverage)     | Requirement, Test Case                            | Need, Use Case                                               | Shows fulfillment<br>• SR-789 **satisfies** TR2-MISSION-NEED-001<br>• GT-005 **satisfies** SR-789                                  |\n| **refines**       | ↳      | Purple      | Lower → Higher                | Requirement, Design Element                       | Need, Requirement                                            | Adds detail without changing intent<br>• System Req **refines** Stakeholder Req                                                      |\n| **verifies**      | ✔      | Orange      | Verification → Verified        | Test Case, Demo, Analysis                         | Requirement                                                  | Formal V&V<br>• GT-042 **verifies** SR-2100                                                                                         |\n| **parent**        | ↑      | Gray        | Child → Parent (tree only)    | Any                                               | Same type, Vision, Need                                      | Navigation tree only – **do not use for traceability**                                                                              |\n| **traces_to**     | →      | Light Blue  | Any → Any (lateral)           | Vision, Need, Requirement                         | Vision, Need, Technical Need, Document, Component            | General traceability<br>• TR2-MISSION-NEED-001 **traces_to** TR2-TECHNICAL-NEED-003 (VDI)                                              |\n| **depends_on**    | ⇢      | Red         | A → B (A needs B)             | Need, Requirement, Risk                           | Need, Requirement, External System                           | Risk chaining<br>• Rapid Insertion (B1) **depends_on** EOL Hardware Elimination (C1)                                                |\n| **illustrated_by**| ◉      | Brown       | Artifact → Diagram/Image       | Vision, Need, Use Case, Requirement               | Diagram, Confluence page, Lucid, Cameo package               | One-click visuals<br>• 30-min ATO Need **illustrated_by** “ATO Flow v3” diagram                                             |\n| **documented_in** | 📄      | Slate       | Artifact → Reference Doc       | Vision, Need, Requirement, Interface               | CONOPS, ICD, MOSA Plan, Security Plan, BOM, Test Plan        | Audit trail<br>• Zero-Trust Need **documented_in** “Zero-Trust CONOPS v2.1.pdf”                                                     |\n| **allocated_to**  | ⚙️      | Teal        | Requirement → Component         | Requirement                                        | System Component (Network Stack, VDI, Core Routing, etc.)    | Architecture allocation<br>• SR-567 **allocated_to** Virtualized Compute Stack                                                      |\n| **related_to**    | ↔      | Gray        | Peer ↔ Peer                   | Any                                               | Any                                                          | Catch-all<br>• Mobile C2 Need **related_to** Deployable Kit BOM                                                                     |\n\n### Quick Decision Cheat-Sheet\n\n| I want to say…                                              | → Use this link type | Example                                      |\n|-------------------------------------------------------------|----------------------|----------------------------------------------|\n| “This requirement came from that need/use case”             | derives_from         | Req → Need                                   |\n| “This mission need drives that technical need”              | traces_to            | Mission Need → Technical Need                |\n| “If we don’t upgrade routers, rapid insertion fails”        | depends_on           | Enterprise Need → Technical Need              |\n| “Here is the diagram that explains this need”               | illustrated_by       | Need → Confluence diagram                    |\n| “The security details are in the ICD”                       | documented_in        | Requirement → ICD PDF                        |\n| “This requirement lives in the VDI stack”                   | allocated_to         | Requirement → Virtualized VDI Stack         |\n| “These two needs both impact the same risk”                 | related_to           | Need ↔ Need                                 |\n\n### UI Legend (as shown in the registry)\n\n| Symbol | Meaning            |\n|--------|--------------------|\n| ↓      | derives_from       |\n| ✓      | satisfies          |\n| ↳      | refines            |\n| ✔      | verifies           |\n| ↑      | parent (tree)     |\n| →      | traces_to          |\n| ⇢      | depends_on         |\n| ◉      | illustrated_by     |\n| 📄      | documented_in      |\n| ⚙️      | allocated_to       |\n| ↔      | related_to         |\n\n**Maintained by:** Dr. Thomas Rathbun\n**Last updated:** 06 Dec 2025
Combat Cloud Background		TEXT		\N	TR2-CLD-DOC-001	DRAFT	CLD	2025-12-09 11:40:56.213572	2025-12-09 11:42:08.915912	a1573933-ec35-4bbd-a94c-e0fedbd2581d	# Combat Cloud Definition and Technical Baseline  \n**Artifact ID**: TR2-CLD-001  \n**Version**: 1.0 (Draft for Stakeholder Review)  \n**Date**: 09 December 2025  \n**Author**: Systems Engineering Team (Supporting Dr. Thomas Rathbun)  \n**Classification**: Unclassified // FOUO  \n**Program**: Tech Refresh Phase 2  \n\n---\n\n## 1. Purpose  \nThis artifact establishes the authoritative definition, key attributes, and operational implications of “Combat Cloud” to resolve customer ambiguity and serve as the baseline for deriving stakeholder needs, system requirements, and subsystem requirements in Tech Refresh Phase 2.  \n\nAll future requirements, use cases, and architecture artifacts shall trace back to this document via the FastAPI Artifact Registry.\n\n\n---\n\n## 2. Standard Definition (DoD / USAF)  \n\n> **Combat Cloud**  \n> “An overarching meshed network for data distribution and information sharing within a battlespace, where each authorized user, platform, or node transparently contributes and receives essential information and is able to utilize it across the full range of military operations.”  \n\n**Primary Source**: U.S. Air Force Air Combat Command (2016), formalized by Lt Gen David A. Deptula (Ret.) in 2013.  \n**Current Evolution**: Core enabler of Joint All-Domain Command & Control (JADC2) and NATO Multi-Domain Operations (MDO).\n\n\n---\n\n## 3. Core Attributes and Operational Implications  \n\n| Attribute                     | Description                                                                                              | Operational Benefit                                      | Tech Refresh Phase 2 Relevance                              |\n|-------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------|-------------------------------------------------------------|\n| Meshed Network Topology       | Self-forming, self-healing, non-hierarchical network with no single point of failure                     | Persistent connectivity in contested/jammed environments | Edge computing, tactical data links, mesh routing protocols |\n| Transparent Contribution/Consumption | Every node is simultaneously a sensor and effector; data shared automatically via open standards       | Dramatically shortened OODA loop                         | AI/ML-driven data fusion, metadata tagging, pub/sub architecture |\n| Domain-Agnostic Interoperability | Seamless bridging of air, land, sea, space, cyber, and coalition systems                                | True Joint All-Domain Operations (JADO)                 | Gateway services, translation layers, open APIs (e.g., OMS, UCI) |\n| Cyber-Resilience & Graceful Degradation | Zero-trust, redundant paths, edge processing, metadata-driven access control                           | Survivability against peer/near-peer adversaries         | Zero-trust architecture, data provenance, encryption at rest/in motion |\n| Hybrid Cloud (Tactical ↔ Strategic) | Leverages commercial cloud (JWCC/IL5-IL6) and tactical edge clouds                                      | Scalable processing and storage of massive data volumes | Containerized microservices, Kubernetes orchestration, hybrid deployment model |\n\n\n---\n\n## 4. Relationship to Larger DoD Initiatives  \n\n| Initiative                    | Role of Combat Cloud                                                                 |\n|-------------------------------|--------------------------------------------------------------------------------------|\n| JADC2 (Joint All-Domain C2)   | Foundational data transport and sharing fabric                                       |\n| ABMS (Advanced Battle Management System) | USAF instantiation of Combat Cloud principles                                     |\n| Project Convergence (Army)   | Army contribution and integration point                                             |\n| Project Overmatch (Navy)      | Naval equivalent and integration node                                                |\n| NATO Multi-Domain Operations  | Allied interoperability framework                                                    |\n| FCAS / GCAP / NGAD            | Future 6th-gen air combat ecosystems built around Combat Cloud concepts             |\n\n\n---\n\n## 5. Proposed Vision Statement (Tech Refresh Phase 2)  \n\n> “Tech Refresh Phase 2 shall deliver a Combat Cloud-enabled command-and-control architecture that achieves information superiority through resilient, meshed, domain-agnostic data sharing, enabling joint and coalition forces to sense, make sense, and act decisively faster than adversaries in contested environments.”\n\n\n---\n\n## 6. Traceability & Next Steps  \n\n- This artifact is stored in the FastAPI Artifact Registry (TR2-REQ-001).  \n- All derived stakeholder needs, use cases, and requirements shall link back to this document.  \n- Scheduled stakeholder workshop (Q1 FY26) will validate or refine this definition against the customer’s intent.  \n\n---
DevSecOps		FILE	/api/v1/documents/files/20251209141228_DevSecOps.pdf	application/pdf	TR2-DSO-DOC-001	DRAFT	DSO	2025-12-09 14:12:30.983139	2025-12-09 14:12:30.983139	a1573933-ec35-4bbd-a94c-e0fedbd2581d	\N
\.


--
-- Data for Name: exceptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exceptions (id, trigger, handling, project_id) FROM stdin;
59e72748-7d73-4261-a57e-e74a0e34d92a	faulure	call admin	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4aef7fdc-b4f0-40f7-9c98-51104ba3d9fc	Model confidence < 70%	Flag as low-confidence, route to human analyst for validation	a1573933-ec35-4bbd-a94c-e0fedbd2581d
03a4ee81-cccd-4bf3-ac7c-da99f8ebaa02	Data feed degradation	Fall back to legacy sensor fusion, notify operator of reduced AI fidelity	a1573933-ec35-4bbd-a94c-e0fedbd2581d
231e3778-1950-46b9-8533-27262f58cc70	Insufficient resources to meet all tasks	AI prioritizes tasks per commander guidance and highlights shortfalls	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f3ef7870-5aa4-4d99-b4a4-14024f87e7d9	Assistant confidence low or knowledge gap	Escalates to human SME and logs for training improvement	a1573933-ec35-4bbd-a94c-e0fedbd2581d
bd35e2b3-4744-42c0-9ceb-55d45873f24d	Governance check fails	Pipeline halts deployment, notifies team with specific failure reason	a1573933-ec35-4bbd-a94c-e0fedbd2581d
529af3bb-2283-4958-b10b-4007ba13ad6c	AI confidence < 70%	Route to human analyst for confirmation	a1573933-ec35-4bbd-a94c-e0fedbd2581d
28bf7023-789f-4790-9e77-9b76d6008e06	System fault during engagement	Fail-safe to manual procedures	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: linkages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.linkages (aid, source_artifact_type, source_id, target_artifact_type, target_id, relationship_type, project_id) FROM stdin;
c74e62ee-8875-4f25-9d1a-42358af5334b	need	TR2-AIC2-NEED-003	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
2143d31d-ba9e-467b-9307-d0482d640a08	need	TR2-AIC2-NEED-004	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
88f1b0d2-75cc-404f-9db7-a9e17f5885b1	need	TR2-UC-NEED-001	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
426778f7-19ad-4647-b8ed-fa7bc76bfadf	need	TR2-UC-NEED-002	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
aad28b90-6de0-4971-9800-87841e22ad40	need	TR2-UC-NEED-003	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
0103f433-d61d-4606-b949-15e838c1193f	need	TR2-UC-NEED-004	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c3ca008c-9921-4ee6-bdce-e37221371894	need	TR2-UC-NEED-005	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
07d5c959-6483-4d10-875c-fb9f0cfaca3f	need	TR2-AIC2-NEED-005	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c69f2895-3667-4ca1-b794-d7f96c16fba3	need	TR2-AIC2-NEED-006	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
a2550934-5193-407a-983d-c5b4e6159ffc	need	TR2-AIC2-NEED-007	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
7493fa66-4633-41b3-ae2e-2c0e4a55a254	need	TR2-AIC2-NEED-008	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
0da7b969-35c7-4af1-858f-2b5dad34d77c	need	TR2-AIC2-NEED-010	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
52dc27f2-5fc4-4206-8d55-8b4f3cb6d107	need	TR2-MC-NEED-001	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
d52c728c-3f56-4d31-9a4a-11b26f56a090	need	TR2-MC-NEED-002	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ab0d4e69-629c-497c-bead-da2a96e3eef8	need	TR2-MC-NEED-003	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
619aa81b-8dac-44cb-8138-03b73cb9771c	need	TR2-MC-NEED-004	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4217d8e7-846e-4b94-b880-847bb392c561	need	TR2-MC-NEED-005	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
7f982eef-3a32-4a94-bce8-a61d5bb56d1b	need	TR2-MC-NEED-006	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
6b8bff76-2870-471b-9348-3c6bf12e3ac7	need	TR2-MC-NEED-007	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c50a8b19-f131-4e9c-a774-a0205d6cbb2a	need	TR2-MC-NEED-008	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
cbc09cf1-e69e-4cb5-97cc-f5d7df4391c6	need	TR2-AIC2-NEED-001	diagram	ddfc548d-ab83-42ef-9058-2c7ce8a8bbcf	ILLUSTRATED_BY	a1573933-ec35-4bbd-a94c-e0fedbd2581d
dcf67885-724f-42d9-aa72-82c954cb7b13	need	TR2-AIC2-NEED-001	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c571815f-ecd9-4e15-b941-c0dd9b5fed3b	need	TR2-AIC2-NEED-005	url	https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/3741371/nsa-publishes-guidance-for-strengthening-ai-system-security	DOCUMENTED_IN	a1573933-ec35-4bbd-a94c-e0fedbd2581d
178d23f6-721c-465e-94cd-a344c0c472cf	need	TR2-AIC2-NEED-011	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
fa74ae7a-af26-437f-b534-c9934bbfa993	need	TR2-AIC2-NEED-001	use_case	TR2-AIC2-UC-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
dc614762-83bd-4ba1-8ab7-d7e87663b1b6	need	TR2-AIC2-NEED-001	use_case	TR2-GLOBAL-UC-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
afed6b9f-bbbc-448e-910e-5ab0595c1a25	need	TR2-AIC2-NEED-004	use_case	TR2-AIC2-UC-003	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
3deb96bf-1c8d-4c8b-956e-9ce8076c8965	need	TR2-AIC2-NEED-005	use_case	TR2-AIC2-UC-005	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
46ed28e8-22f9-4b1e-a662-4acde1ce95e4	need	TR2-AIC2-NEED-006	use_case	TR2-AIC2-UC-006	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
e6998c18-6d7a-4890-8740-4c7a13589c8f	need	TR2-AIC2-NEED-007	use_case	TR2-AIC2-UC-007	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
dbb4bd98-64b3-4928-98eb-ed6a597a2035	need	TR2-AIC2-NEED-008	use_case	TR2-AIC2-UC-008	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
c5312ef1-eca6-4ecb-ab12-22da6c517d22	need	TR2-AIC2-NEED-010	use_case	TR2-AIC2-UC-009	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
8ab25c74-5594-4ab3-86b0-65ba8f9a96e9	need	TR2-AIC2-NEED-011	use_case	TR2-AIC2-UC-004	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ac57710b-b94f-4fd0-b66c-20518cb1eb73	use_case	TR2-AIC2-UC-002	need	TR2-AIC2-NEED-003	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
14032763-88d7-4bd3-bfbc-1ed84fa96a7c	need	TR2-AIC2-NEED-005	url	https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodm/5000101p.PDF?ver=FfOR56lIK5S1LDFfSlYwYQ%253D%253D	DOCUMENTED_IN	a1573933-ec35-4bbd-a94c-e0fedbd2581d
37a67a52-4894-4814-bb7e-efc4ecb36322	need	TR2-AIC2-NEED-010	need	TR2-AIC2-NEED-004	TRACES_TO	a1573933-ec35-4bbd-a94c-e0fedbd2581d
dd3ffb97-c742-4912-9406-3c6b0e629f23	need	TR2-MC-NEED-002	url	https://www.ainvest.com/news/5g-advanced-network-deployment-uae-investment-implications-du-leadership-5g-infrastructure-innovation-reshaping-future-connectivity-2508/	DOCUMENTED_IN	a1573933-ec35-4bbd-a94c-e0fedbd2581d
3e56cee7-7206-4c94-97e2-edcbc18db8f3	need	TR2-MC-NEED-002	url	https://www.stimson.org/2025/gcc-welcomes-starlink-but-limits-its-reach/	DOCUMENTED_IN	a1573933-ec35-4bbd-a94c-e0fedbd2581d
e118e829-f4af-4b56-9001-23aaa7478bf5	need	TR2-ISR-NEED-001	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
d3060a19-bcd0-449a-85fe-afca30421336	need	TR2-ISR-NEED-002	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ae8c5729-c02b-457d-b4f7-db0beab17276	need	TR2-ISR-NEED-003	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
12b4c81a-9bb5-48ba-b88e-83d277926093	need	TR2-ISR-NEED-005	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
adaebf19-d869-45c5-8ee5-f953db75174c	need	TR2-ISR-NEED-004	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
538796d9-ae6b-4aa7-85cc-a36eb65dff31	need	TR2-UC-NEED-005	need	TR2-UC-NEED-004	TRACES_TO	a1573933-ec35-4bbd-a94c-e0fedbd2581d
53482f35-560e-4e01-abf8-5dedcadf0ba4	need	TR2-JER-NEED-001	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
b7043c3f-1d79-4f78-b56f-131898ac5310	need	TR2-JER-NEED-002	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
6efe2b93-64b0-4ed7-a555-bda36556c05b	need	TR2-JER-NEED-003	vision	TR2-GLOBAL-VISION-001	DERIVES_FROM	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: need_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.need_components (need_id, component_id) FROM stdin;
TR2-AIC2-NEED-001	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-AIC2-NEED-003	05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d
TR2-AIC2-NEED-004	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-AIC2-NEED-004	05358f5b-2f0b-4738-8fa8-16fd0fc2cd8d
TR2-UC-NEED-001	04065bf3-b3e0-4e56-b6a0-65e35c40f79b
TR2-UC-NEED-002	04065bf3-b3e0-4e56-b6a0-65e35c40f79b
TR2-UC-NEED-003	04065bf3-b3e0-4e56-b6a0-65e35c40f79b
TR2-UC-NEED-005	2bace07c-a711-4a12-87d5-254d22cd2b06
TR2-UC-NEED-004	6b26e058-ed22-4bd1-8c2d-60c95bb1442e
TR2-AIC2-NEED-005	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-AIC2-NEED-006	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-AIC2-NEED-007	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-AIC2-NEED-010	1c0d79c9-b901-45ec-b4d4-0090f03f31fd
TR2-MC-NEED-001	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-002	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-003	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-004	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-005	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-006	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-007	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-MC-NEED-008	2a5de2ae-7650-4d7d-a17b-5b7baa6f986a
TR2-ISR-NEED-001	5b3012e2-16be-43d6-99ff-c1ab93180d7f
TR2-ISR-NEED-002	5b3012e2-16be-43d6-99ff-c1ab93180d7f
TR2-ISR-NEED-003	5b3012e2-16be-43d6-99ff-c1ab93180d7f
TR2-ISR-NEED-005	5b3012e2-16be-43d6-99ff-c1ab93180d7f
TR2-ISR-NEED-004	5b3012e2-16be-43d6-99ff-c1ab93180d7f
TR2-AIC2-NEED-012	0483d73b-78b0-4d71-b97b-8c4c4ea442dd
TR2-AIC2-NEED-013	0483d73b-78b0-4d71-b97b-8c4c4ea442dd
TR2-JER-NEED-003	c312d773-ec80-4303-b8ab-67dbd5dfee53
\.


--
-- Data for Name: need_sites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.need_sites (need_id, site_id) FROM stdin;
TR2-AIC2-NEED-001	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-001	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-003	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-003	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-004	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-004	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-UC-NEED-001	0256eb78-64e1-474f-ad15-87faef3f20cb
TR2-UC-NEED-001	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-UC-NEED-001	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-UC-NEED-002	6aafa7db-f2bb-451e-ba6c-b516416bdacd
TR2-UC-NEED-002	96dbf380-327c-4092-b040-a7248e3adb6f
TR2-UC-NEED-002	b7c93fe7-8caa-4637-aa83-4e64a90273ee
TR2-UC-NEED-003	6aafa7db-f2bb-451e-ba6c-b516416bdacd
TR2-UC-NEED-003	96dbf380-327c-4092-b040-a7248e3adb6f
TR2-UC-NEED-003	b7c93fe7-8caa-4637-aa83-4e64a90273ee
TR2-UC-NEED-004	6aafa7db-f2bb-451e-ba6c-b516416bdacd
TR2-UC-NEED-004	96dbf380-327c-4092-b040-a7248e3adb6f
TR2-UC-NEED-004	b7c93fe7-8caa-4637-aa83-4e64a90273ee
TR2-UC-NEED-005	6aafa7db-f2bb-451e-ba6c-b516416bdacd
TR2-UC-NEED-005	96dbf380-327c-4092-b040-a7248e3adb6f
TR2-UC-NEED-005	b7c93fe7-8caa-4637-aa83-4e64a90273ee
TR2-AIC2-NEED-005	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-005	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-006	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-006	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-007	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-007	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-008	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-008	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-010	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-010	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-MC-NEED-001	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-002	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-003	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-004	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-005	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-006	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-007	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-MC-NEED-008	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-AIC2-NEED-011	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-011	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-004	96dbf380-327c-4092-b040-a7248e3adb6f
TR2-AIC2-NEED-004	b7c93fe7-8caa-4637-aa83-4e64a90273ee
TR2-ISR-NEED-001	dc0297e1-6751-4ba8-8af9-d8f77235b753
TR2-ISR-NEED-001	e8b5bd99-977e-4518-bd92-e01831ce313b
TR2-ISR-NEED-002	dc0297e1-6751-4ba8-8af9-d8f77235b753
TR2-ISR-NEED-002	e8b5bd99-977e-4518-bd92-e01831ce313b
TR2-ISR-NEED-003	dc0297e1-6751-4ba8-8af9-d8f77235b753
TR2-ISR-NEED-003	e8b5bd99-977e-4518-bd92-e01831ce313b
TR2-ISR-NEED-004	dc0297e1-6751-4ba8-8af9-d8f77235b753
TR2-ISR-NEED-004	e8b5bd99-977e-4518-bd92-e01831ce313b
TR2-ISR-NEED-005	dc0297e1-6751-4ba8-8af9-d8f77235b753
TR2-ISR-NEED-005	e8b5bd99-977e-4518-bd92-e01831ce313b
TR2-AIC2-NEED-012	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-012	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-AIC2-NEED-013	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-AIC2-NEED-013	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-001	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-JER-NEED-001	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-001	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-JER-NEED-002	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-JER-NEED-002	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-002	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-JER-NEED-003	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-JER-NEED-003	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-003	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-JER-NEED-004	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-JER-NEED-004	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-005	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-JER-NEED-005	aa9f9015-8ace-4854-a04e-788b7d23a6df
TR2-JER-NEED-006	a4e27734-003e-481e-a72c-23bec403e2ab
TR2-JER-NEED-006	f246d82e-41aa-4dcc-a62b-2009f15de3a7
TR2-JER-NEED-006	1762e009-29df-4045-8ae2-c08bae7ebe2f
TR2-JER-NEED-006	de9e719b-fa07-4fca-8fa3-a642ea6a2cda
TR2-JER-NEED-007	24ac2d13-6453-4a5e-88f1-68e84c07789f
\.


--
-- Data for Name: needs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.needs (title, description, level, rationale, area, owner_id, stakeholder_id, aid, status, created_date, last_updated, project_id) FROM stdin;
AI-Driven Support	*As* **C2 Operators**, \n\n- *We need* AI-driven tools to support operators on how-tos, trouble shooting, system queries \n- *So that* operators are more productive	MISSION	AI Agents are much faster or researching and answering queries	AIC2	99b93b39-0bfa-4030-8373-19eb86489007	e18e881f-599f-4164-954e-5edd77d09336	TR2-AIC2-NEED-004	DRAFT	2025-12-03 03:24:31	2025-12-08 13:03:46.705471	a1573933-ec35-4bbd-a94c-e0fedbd2581d
AI-Driven Planning	*As* **Mission Planners**, \n\n- *We need* AI-driven tools to generate ATOs that maximize resources against mission task requests \n- *So that* we can make best use of available Weapons Systems	MISSION	AI Generated ATOs make best use of available resources	AIC2	99b93b39-0bfa-4030-8373-19eb86489007	e2d79690-bbef-4a42-9de5-df839c2bc84d	TR2-AIC2-NEED-003	DRAFT	2025-12-02 15:28:04	2025-12-08 13:01:16.370774	a1573933-ec35-4bbd-a94c-e0fedbd2581d
AI-Driven Threat Anticipation	*As* **Mission Operators**, \n\n- *We need* AI-driven tools that anticipate emerging threats by continuously analyzing all-source data in real-time \n- *So that* we can act before *adversaries* complete their decision cycle.	MISSION	AI Augmented Threat Detection is a force Multiplier	AIC2	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-AIC2-NEED-001	DRAFT	2025-12-02 14:36:27	2025-12-08 13:02:48.677069	a1573933-ec35-4bbd-a94c-e0fedbd2581d
NSA/ATP-Compliant AI Governance Framework	*As* **Program Managers and Security Certifiers**, \n\n- *We need* an NSA/ATP-compliant governance framework for all AIC2 models (training data, versioning, human-in-the-loop, audit logs) \n- *So that* TR2 can achieve and maintain Authority to Operate in RED Domain enclaves.	ENTERPRISE	Mandatory for any AI operating at Secret//REL in DoD/Coalition environment	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	bc0457d5-08b6-4e16-8371-96d7f8bf2221	TR2-AIC2-NEED-005	DRAFT	2025-12-04 03:41:08	2025-12-08 13:06:30.452161	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Automated Model Deployment Pipeline	*As* **DevSecOps Teams**, \n\n- *We need* fully automated, secure pipelines to train, test, and deploy updated AIC2 models across AOC/AAOC/ enclaves \n- **So that** new capabilities can be fielded in weeks instead of months without breaking ATO.	ENTERPRISE	Enables continuous improvement of all four mission needs	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	42b8adeb-26de-42cb-b6bd-d8f862759caf	TR2-AIC2-NEED-006	DRAFT	2025-12-04 03:41:09	2025-12-08 13:07:57.17859	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Real-Time All-Source Data Ingestion Backbone	*As* **Data Architects**, \n\n- *We need* a centralized, high-throughput data lake and streaming backbone that ingests and normalizes all Sensors, Datalinks, Meta data, and open-source feeds in real-time \n- *So that* all AIC2 capabilities have a single source of truth for training.	ENTERPRISE	Foundational enabler for Threat Anticipation, COA, and ATO generation	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	56560ea5-2423-46c7-a875-f5af9a4c0ea1	TR2-AIC2-NEED-007	DRAFT	2025-12-04 03:41:10	2025-12-08 13:09:33.329162	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Explainable AI for Courses of Action	*As* **Systems Engineers**, \n\n- *We need* all AI-generated COAs and ATO recommendations to include human-readable rationale and confidence scores \n- *So that* operators and commanders can maintain positive control and trust.	TECHNICAL	Directly flows from Mission Needs 002 & 003; required for ATP human-in-the-loop rules	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	f0bc0118-aa95-4cff-be2d-9d4894bacd53	TR2-AIC2-NEED-008	DRAFT	2025-12-04 03:41:11	2025-12-08 13:11:08.562318	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Operator Assistant Knowledge Base Integration	*As* **C2 UI/UX Designers**, \n\n- *We need* the AI operator assistant to be connected to live tech manuals, TTPs, and system logs \n- *So that* it can provide context-aware troubleshooting and how-to guidance	TECHNICAL	Directly satisfies Mission Need 004	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	17b5c2c7-a189-4514-b360-7578346252bd	TR2-AIC2-NEED-010	DRAFT	2025-12-04 03:41:13	2025-12-08 13:15:34.032597	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Exportable Cross-Domain Link-16 Information Exchange	*As* **Combined US–UAE Task Force Commanders, Air Battle Managers, and airborne aircrew,** \n\n- *We need* a fully exportable, CDS-approved mechanism to exchange approved IERs between US Secret Releasable and UAE Secret domains\n- *So that* we can establish and maintain a common recognized air picture and execute combined air defense and strike operations without compromising US releasability restrictions.	MISSION	Mission-level justification for combined US–UAE air operations requiring controlled cross-domain Link-16 data sharing.	UC	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-UC-NEED-003	DRAFT	2025-12-03 10:12:40	2025-12-08 13:45:35.23411	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Real-Time Link-16 Integration in Red Domain	*As* **UAE Force Air Component Commanders** and **Mission operators**, \n\n- *We need* real-time Link-16 voice and data exchange with airborne platforms using Type 1 encryption \n- *So that* we can participate in US Coalition Activities	MISSION	Enables participation in US Coalition events and exercises	UC	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-UC-NEED-002	DRAFT	2025-12-03 10:00:31	2025-12-08 13:48:52.792812	a1573933-ec35-4bbd-a94c-e0fedbd2581d
High Availability and Fault Tolerance	*As* **Systems Administrators**, \n\n- *We need* to ensure high availability and fault tolerance in remote networking equipment \n- *So that* we can minimize single points of failure in edge and LAN components and sustain operations during failures.	TECHNICAL	Extends virtual chassis and link aggregation designs from Annex E for redundancy across 280 sites.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	f95f841c-4c25-47e4-a229-6323e3675bd2	TR2-MC-NEED-004	DRAFT	2025-12-04 06:52:44	2025-12-08 13:26:43.419292	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Secure Integration of Exportable CDS with EADGE-T C2	*As* **Security Engineers and Network Integrators**,\n\n- *We need* to configure and harden the FMS-procured exportable CDS (guards, filters, audit, key management, and red/black separation) to satisfy NSA, US DAO, and UAE IA requirements\n- *So that* approved IERs can flow bi-directionally between US Secret Releasable and UAE Secret domains without introducing unacceptable risk.	TECHNICAL	Defines the exact TR2 integration and security engineering effort required for the FMS-provided CDS.	UC	63897ae0-ab20-4b15-9bbe-c4eafcf34e16	1d8284a7-0d2a-4cfa-a208-9ec21fc40c55	TR2-UC-NEED-005	DRAFT	2025-12-03 10:19:53	2025-12-09 11:30:57.156864	a1573933-ec35-4bbd-a94c-e0fedbd2581d
AI-Driven COA Generation	*As* **Mission Operators**, \n\n- *We need* AI-driven tools that create Optimized Course of Actions to neutrealize threats with the available resources \n- *So that* the homeland is protected	MISSION	AI Gnerated COAs make best use of resources	AIC2	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	322ea09b-7eb0-402a-a745-ec402213439b	TR2-AIC2-NEED-011	DRAFT	2025-12-07 14:40:10.602846	2025-12-08 13:17:35.916502	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Enhanced Security Postures	*As* **Security Officers**, \n\n- *We need* to enhance security monitoring at remote sites with advanced encryption and intruder detection \n- *So that* we can maintain system integrety across all enclaves and protect against evolving cyber threats.	ENTERPRISE	Builds on existing encryptors and firewalls in EADGE-T to meet UAE SENSITIVE and export control requirements.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	db9893f7-cbc0-4fb1-bb9e-e72e94a517ab	TR2-MC-NEED-003	DRAFT	2025-12-04 06:52:43	2025-12-08 13:23:24.855721	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Efficient Upgrade Rollout and Sustainment	*As* **Program Managers**, \n\n- *We need* to support efficient rollout of software updates and patching across 280+ sites,\n- *So that* we can minimize disruption and ensure long-term operational readiness and continual ATP	ENTERPRISE	Facilitates phased implementation to avoid impacts on mission-critical systems.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	62b300c1-2088-4276-a10a-c1a2204df02d	TR2-MC-NEED-006	DRAFT	2025-12-04 06:52:46	2025-12-08 13:42:22.099245	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Real-Time Link-16 Integration in Pink Domain	*As* **UAE Force Air Component Commanders** and **Mission operators**, \n\n- *We need* real-time Link-16 voice and data exchange with airborne platforms using CSfC-compliant commercial encryption \n- *So that* we can execute fully sovereign UAE air defense operations in the UAE Secret domain.	MISSION	Enables UAE-controlled, rapidly fieldable Link-16 capability using commercial layered encryption	UC	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-UC-NEED-001	DRAFT	2025-12-03 09:54:56	2025-12-08 13:54:36.510216	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Video and Imagery Analysis Tool Replacement	*As* **ISR Analyst at AFAD Intelligence Department or EADGE-T Operation Center**,\n\n- *We need* the system to integrate BAE's GXP suite (replacing GeoFlix) to provide advanced geospatial exploitation capabilities for viewing, analyzing, and processing video streams from UAVs, imagery, and multi-source ISR products, ensuring compatibility with existing TAISR and target/weaponeering workflows.\n- *So that* analysts can perform anomaly detection, feature extraction, and temporal playback efficiently, reducing analysis time.	MISSION	To enhance geospatial exploitation with advanced tools while maintaining workflow integration.	ISR	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	b62052a7-3751-45ec-9673-edf055143013	TR2-ISR-NEED-001	DRAFT	2025-12-08 14:26:01.056712	2025-12-08 14:33:56.843998	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Exploitation Management and RFI Handling Retention/Upgrade	*As* **Exploitation Manager at IAC or EADGE-T site**,\n\n- *We need* the system to retain and enhance the TAISR application for exploitation management, including RFI client functionality, to manage requests for information, search ISR metadata, and facilitate product ingest/download, while integrating with the new GXP tool for seamless workflows.\n- *So that* managers can efficiently handle RFIs and ISR products across systems.	MISSION	To improve RFI management and metadata handling with upgraded capabilities.	ISR	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	998ef0bb-4ea3-4282-acb3-1f0eeb657d6c	TR2-ISR-NEED-002	DRAFT	2025-12-08 14:26:02.043877	2025-12-08 14:33:23.913745	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Upgraded ISR Storage Capabilities	*As* **ISR Operator at AGS or AFAD site**,\n\n- *We need* the system to upgrade TAISR storage services to handle increased volume of ISR products with improved indexing, redundancy, and integration with AFAD Intelligence Department filesystem, supporting efficient upload/download across sites.\n- *So that* operators can manage large data volumes reliably.	ENTERPRISE	To support higher data volumes and ensure data redundancy across distributed sites.	ISR	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	3f5bb957-b356-4139-aa64-cf0620f0f93a	TR2-ISR-NEED-003	DRAFT	2025-12-08 14:26:03.02149	2025-12-08 14:34:46.993516	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Additional Security Controls Beyond UAE Secret Network	*As* **System Operator at EADGE-T site**,\n\n- *We need* the system to incorporate extra security measures, such as encryption at rest/transit, multi-factor authentication (MFA), and intrusion detection, to protect ISR data flows across interfaces while complying with UAE Secret standards and export controls (e.g., ITAR).\n- *So that* data exchanges are secure against threats.	ENTERPRISE	To add layers of security beyond baseline network protections for sensitive ISR operations.	ISR	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	9e5d8e84-28ba-4352-a8c8-7f3b49f60712	TR2-ISR-NEED-005	DRAFT	2025-12-08 14:26:04.990776	2025-12-08 14:35:56.244271	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Centralized Communications Management	*As* **Operations Managers**, \n\n- *We need* to enable centralized planning, configuration, and monitoring of remote site communications from main operations centers \n- *So that* we can reduce on-site maintenance and improve efficiency.	ENTERPRISE	Aligns with SIEM-ELK management approaches in TR1 for scaled operations.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	66b63658-c658-4a9f-8dbb-e0edb92c6c38	TR2-MC-NEED-005	DRAFT	2025-12-04 06:52:45	2025-12-09 08:42:59.600379	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Interoperability with Main Sites	*As* **Integration Engineers**, \n\n- *We need* to maintain interoperability between upgraded remote sites and existing main/core sites, including voice/data services and MPLS-based QoS\n- *So that* we can ensure seamless end-to-end operations during TR2 implementation timeframe.	MISSION	Preserves compatibility with Phase 1 upgrades and EADGE-T services.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	0ef4fd2a-505d-4737-a2e1-40d03eb5e7a5	TR2-MC-NEED-007	DRAFT	2025-12-04 06:52:47	2025-12-09 08:43:38.015004	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Modular Design for Future Technologies	*As* **Systems Architects**, \n\n- *We need* to design the remote site uplift and mobile Comms for modularity\n- *So that* we can incorporate future technologies without full redesigns and adapt to evolving transport options.	TECHNICAL	Future-proofs against advancements like expanded 5G defense uses and LEO satellite integration.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	7702e214-a153-420f-966a-4a6946209c7a	TR2-MC-NEED-008	DRAFT	2025-12-04 06:52:48	2025-12-09 11:26:41.159617	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Enhanced Role-Based Access Control (RBAC) for Sensitive Data	*As* **Security Administrator and ISR Analyst**,\n\n- *We need* the system to implement granular RBAC to restrict access to sensitive ISR data based on user roles, ensuring only authorized personnel can view, edit, or download products, integrated across TAISR, GXP, and interfaces like AGS/IAC MINDS.\n- *So that* sensitive data is protected with role-specific access.\n	MISSION	To provide fine-grained control over access to sensitive intelligence data.	ISR	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	b62052a7-3751-45ec-9673-edf055143013	TR2-ISR-NEED-004	DRAFT	2025-12-08 14:26:04.021431	2025-12-08 14:36:56.483922	a1573933-ec35-4bbd-a94c-e0fedbd2581d
High-Bandwidth Low-Latency Connectivity	*As* **Mission Operators**, \n\n- *We need* high reliability, high-bandwidth, low-latency connectivity to remote sites to support real-time data/sensor exchanges, VOIP/ROIP communications, site cyber monitoring, software upgrades and patching, \n- *So that* we can achieve enhanced C4ISR effectiveness.	MISSION	Addresses bandwidth limitations in remote sites as per EADGE-T architecture, enabling faster sensor data transmission.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	322ea09b-7eb0-402a-a745-ec402213439b	TR2-MC-NEED-001	DRAFT	2025-12-04 06:52:41	2025-12-09 08:37:32.455667	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Diverse Transport Technology Integration	*As* **Network Engineers**, \n\n- *We need* to integrate diverse transport technologies, including emerging options like 5G cellular and LEO satellites such as Starlink, \n- *So that* we can enhance flexibility and coverage in varied terrains for resilient communications.\n	TECHNICAL	Leverages potential UAE 5G defense projects and emerging LEO satellite constellations access for backup in contested environments.	MC	60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	e5d2d8b3-8cd1-414d-8433-746fad8de926	TR2-MC-NEED-002	DRAFT	2025-12-04 06:52:42	2025-12-09 08:40:31.418026	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Integration of FMS-Procured Exportable CDS into EADGE-T Enclaves	*As* **Program Managers and System Integrators**,\n\n- *We need* to integrate the FMS-procured exportable Cross-Domain Solution into the EADGE-T UAE Secret and US Secret-Releasable enclaves\n- *So that* we can meet all US and UAE security, certification, and releasability requirements for combined Link-16 operations.	ENTERPRISE	The CDS hardware/software is acquired via FMS; TR2 is responsible only for integration, configuration, and accreditation support.	UC	63897ae0-ab20-4b15-9bbe-c4eafcf34e16	2c6a4f2a-8b19-415e-b5a7-cbe02f94a8a9	TR2-UC-NEED-004	DRAFT	2025-12-03 10:16:46	2025-12-09 11:30:30.657627	a1573933-ec35-4bbd-a94c-e0fedbd2581d
AI-Driven COA Generation	As Mission Operators, we need AI-driven tools that create Optimized Course of Actions to neutrealize threats given the available resources so that protect the homeland	MISSION	AI Gnerated COAs make best use of resources	AIC2	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-AIC2-NEED-012	DRAFT	2025-12-09 13:51:48.14729	2025-12-09 13:51:48.14729	a1573933-ec35-4bbd-a94c-e0fedbd2581d
AI-Driven COA Generation	As Mission Operators, we need AI-driven tools that create Optimized Course of Actions to neutrealize threats given the available resources so that protect the homeland	MISSION	AI Gnerated COAs make best use of resources	AIC2	99b93b39-0bfa-4030-8373-19eb86489007	322ea09b-7eb0-402a-a745-ec402213439b	TR2-AIC2-NEED-013	DRAFT	2025-12-09 14:00:12.008532	2025-12-09 14:00:12.008532	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Mission-Level JERNAS Integration for Enhanced Operational Communication	*As* **Air Defense Mission Operators**, \n\n- *We need* seamless integration with the JERNAS communication system to enable full mesh connectivity between remote radio sites and C2 centers, leveraging the new SOA interfaces for real-time data exchange \n- *So that* we can achieve faster decision-making, improved situational awareness, and reliable command and control during air defense operations.	MISSION	JERNAS Block#3 introduces advanced communication capabilities that align with TRP2 goals for modernized air defense networks, transitioning from hub-and-spoke to mesh architecture for operational resilience.	JER	3c3956c5-49a7-42e2-ac0a-72fa95cffe16	322ea09b-7eb0-402a-a745-ec402213439b	TR2-JER-NEED-001	DRAFT	2025-12-09 14:03:53.862158	2025-12-09 14:03:53.862158	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Enterprise-Level Network Modernization for JERNAS Support	*As* **Enterprise Network Administrators**, \n\n- *We need* upgraded enterprise network infrastructure, including additional firewall/encryptor sets at remote sites and higher bandwidth connections from Al Sharyan FOBB, to support JERNAS full mesh connectivity while initially utilizing existing EADGE-T POPs \n- *So that* the organization can maintain secure, scalable communication across all sites without disrupting current operations.	ENTERPRISE	The current hub-and-spoke EADGE-T architecture limits mesh capabilities required by JERNAS; enterprise upgrades ensure compliance with defense communication standards and future-proof the network.	JER	d425e3d9-732b-44d9-92f4-35f86087f8f3	99d758ff-1095-47b9-9c67-c75f7751e13c	TR2-JER-NEED-002	DRAFT	2025-12-09 14:03:54.517201	2025-12-09 14:03:54.517201	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Technical-Level SOA and WAN Interface Implementation for JERNAS	*As* **Systems Engineers**, \n\n- *We need* technical implementation of JERNAS SOA interfaces in C4SI software, along with WAN enhancements for mesh tunneling (e.g., MLP tunnels), QoS features, and performance metrics as defined in JERNAS ICDs \n- *So that* the system can handle increased traffic loads, secure data exchanges, and meet interface specifications for inventory, execution data, and equipment status.	TECHNICAL	JERNAS Block#3 ICDs specify services like JCMS TACCOM, inventory, and FCP, requiring technical alignments in software and network to avoid integration failures.	JER	48e4b60c-da4d-4154-aa05-138989a69ffc	2b14da30-bbad-4efb-9a1d-3bf2b547786e	TR2-JER-NEED-003	DRAFT	2025-12-09 14:03:55.175233	2025-12-09 14:05:57.739862	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Technical Implementation of JCMS SOA Interfaces and Data Models	*As* **Systems Engineers**, \n\n- *We need* to implement JCMS SOA interfaces (I7) in C4SI software, including services for communication preparation, monitoring/control, voice/data exchange, maintenance, and administration, while integrating logical data models such as JCMS TACCOM, inventory, FCP, and station models for inventory, execution data, and equipment status \n- *So that* the system enables seamless end-to-end operational planning, resource management, and real-time supervision of JERNAS communications.	TECHNICAL	The JERNAS C4I ICD specifies business services and data models requiring precise API implementations (e.g., OpenAPI format) to support interactions like FCP management and ATO integration, ensuring compatibility and avoiding integration issues.	JER	48e4b60c-da4d-4154-aa05-138989a69ffc	2b14da30-bbad-4efb-9a1d-3bf2b547786e	TR2-JER-NEED-004	DRAFT	2025-12-09 14:28:06.279466	2025-12-09 14:28:06.279466	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Secured WAN Performance and Feature Compliance	*As* **Network Engineers**, \n\n- *We need* the Secured WAN to meet specified performance metrics including average latency <10ms (max <15ms) between stations, uptime of 99.999%, packet loss <0.1%, support for IPv4/IPv6, QoS features (DiffServ, LLQ, CBWFQ), GRE tunneling, and maximum frame size of 1518 bytes \n- *So that* JERNAS achieves reliable full-mesh connectivity for ground relay and data exchanges without performance degradation.	TECHNICAL	The JERNAS WAN ICD outlines general, cabinet connection, QoS, tunneling, and performance requirements to support interfaces like I3, I4.b, I7, I8, ensuring secure and efficient communication across sites.	JER	461e19bc-9b1f-4f1b-8ec9-1187edeb63f3	753b3d9e-e584-4c46-bc04-5c3f27903145	TR2-JER-NEED-005	DRAFT	2025-12-09 14:28:07.085847	2025-12-09 14:28:07.085847	a1573933-ec35-4bbd-a94c-e0fedbd2581d
POP Configuration and Site Connectivity Implementation	*As* **Deployment Engineers**, \n\n- *We need* deployment of Secure POPs with configurations (POP-1G-STD, POP-1G-DUAL, POP-10G-DUAL) at specified sites, ensuring redundancy in filtering, routing, and encryption, and integration with Al-Sharyan backbones (NGN 10Gb, SDH 155Mb) \n- *So that* all JERNAS Block 3 sites, including data centers, PAPs, OSAs, and pilot systems, achieve required connectivity without direct IP routing or filtering from Al-Sharyan endpoints.	TECHNICAL	Appendix A and B of the WAN ICD detail site-specific POP configurations and Al-Sharyan network characteristics, necessitating precise hardware and connectivity setups for operational and testing environments.	JER	bb18d87c-fdfa-4427-a4b8-6d9b73b9e656	c503eea7-4a78-4eff-aa7a-7c84c4b4c43a	TR2-JER-NEED-006	DRAFT	2025-12-09 14:28:07.940536	2025-12-09 14:28:07.940536	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Authentication and Authorization Mechanisms for Interfaces	*As* **Security Engineers**, \n\n- *We need* certificate-based authentication and authorization for C4I systems accessing JCMS DC, including enrollment procedures, credential filtering based on force ID, and secure interactions over JERNAS Secured WAN \n- *So that* only authorized systems can perform service interactions, maintaining operational security and integrity.	TECHNICAL	Preconditions in the C4I ICD require valid certificates and registry in JCMS DC for authentication, ensuring controlled access to services without user-level identification.	JER	613ad4d3-ce8b-46b2-b020-adb5eef026ee	21b9b7aa-ece9-4c74-abd5-2761ba4c1ef2	TR2-JER-NEED-007	DRAFT	2025-12-09 14:28:08.711986	2025-12-09 14:28:08.711986	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.people (id, name, description, project_id, roles) FROM stdin;
322ea09b-7eb0-402a-a745-ec402213439b	Mission Operator	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder", "actor"]
e2d79690-bbef-4a42-9de5-df839c2bc84d	Mission Planner	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder", "actor"]
e18e881f-599f-4164-954e-5edd77d09336	All Operators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder", "actor"]
63897ae0-ab20-4b15-9bbe-c4eafcf34e16	Security Officer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
2c6a4f2a-8b19-415e-b5a7-cbe02f94a8a9	System Integrators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
1d8284a7-0d2a-4cfa-a208-9ec21fc40c55	Network Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
60ef46a0-7786-4c4d-8dea-8b0cfb7a3a77	Rathbun	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
42b8adeb-26de-42cb-b6bd-d8f862759caf	DevSecOps Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
db9893f7-cbc0-4fb1-bb9e-e72e94a517ab	Security Certifiers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
bc0457d5-08b6-4e16-8371-96d7f8bf2221	NSA Certifiers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
d9214ce1-3ae9-41a7-8e97-160fa909620d	US DAO Program Office	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
8d77a0cf-6e9f-4ea4-a833-6901c03916c1	Edge Platform Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
17b5c2c7-a189-4514-b360-7578346252bd	UX Designers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
4b9d3be7-0695-4a4e-9ab0-a1c61ed40956	Intelligence Analyst	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
99b93b39-0bfa-4030-8373-19eb86489007	Air Power Commander	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner", "stakeholder"]
f95aba3f-61ef-49d0-b03b-6d9ba53fb495	Training Officer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
7a8d7fad-c1d7-4a41-a409-4e60e013c5a0	C2 Operator	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
6de1cf55-62b2-49d3-8934-1fc2f1981e20	DevSecOps Team	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
4ea2738a-648a-42b0-95d5-92f2ccc26e54	DevSecOps Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
b14b3cbc-3038-431d-8964-2ac69d53dd45	Tech Pubs Team	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder", "actor"]
16a018af-2ae7-4dcc-8d35-8a7a5cd3ef2f	AIC2 Assistant	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
bd1703d1-7f15-4c1b-a70f-f3c9afea1b56	Operator Assistant	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
f0bc0118-aa95-4cff-be2d-9d4894bacd53	AI Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
56560ea5-2423-46c7-a875-f5af9a4c0ea1	Data Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
95e52b88-8ee3-4b8b-9846-659af5d989c9	Air Battle Manager	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
fc96d0ac-137b-40e8-b8e0-7e7bba0f0299	Weapons System Officers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
7abb1629-9d9f-431a-9618-8392b0360eaa	Program Manager	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
78791452-94f2-4645-ac6b-9401af14e635	Security Certifier	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor", "stakeholder"]
69e47b48-eba6-4883-8692-72db2a812461	AIC2 Model Developers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
1f268053-93ea-49db-b3a1-f0375c67fe05	Network Team	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
e8d6cd0f-d4d3-489c-915f-2bff96ef5f5a	Data Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
4af25d66-3b65-4c37-9a51-b6c1584b81a2	Commander	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
f4621731-f290-49b7-8712-883f953edfec	C2 Operators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
106a2a88-52ae-460b-8f9c-5ffaaec38eff	Weapons Director	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
e5d2d8b3-8cd1-414d-8433-746fad8de926	Network Planners	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
ceaea440-8478-463c-8c65-3160d707e58f	AIC2 System	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
08cbf521-dc56-4d36-ab12-63da6c83894f	DevSecOps	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
8434f89e-befc-4335-aa99-be9ce57ed1eb	Governance Framework	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
f95f841c-4c25-47e4-a229-6323e3675bd2	Systems Administrators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
68e3688e-ce0e-4764-9581-6198f133a93b	Automated Pipeline	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
66b63658-c658-4a9f-8dbb-e0edb92c6c38	Operations Managers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
e7cf819f-dce2-466f-8693-40de5169a861	System	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
62b300c1-2088-4276-a10a-c1a2204df02d	Program Managers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
ad1678a4-27b5-4464-a5e1-822ebafe5d4b	Operators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder", "actor"]
0ef4fd2a-505d-4737-a2e1-40d03eb5e7a5	Integration Engineers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
7fed6ba2-33fc-4f36-92a7-35bbe588af03	Ingestion Backbone	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
7702e214-a153-420f-966a-4a6946209c7a	Systems Architects	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
f918d1d1-3437-4e34-a7cc-1b6e2682236e	CRC Operator		6685dcc7-19c6-4e5f-9f29-25d9a0dae703	["owner"]
d9424b42-a8bb-4947-a1ef-53d6ccb8e862	Artificial Intelligence		6685dcc7-19c6-4e5f-9f29-25d9a0dae703	["stakeholder"]
cc24912c-8881-4016-9f56-db54bf2db245	Data Lake	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
d4aa5c3f-3496-46b0-a060-bccdc582328d	Tech Pubs	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
bf94a2a3-076a-41cd-91b5-d95f4a328a5b	Ingestion Pipeline	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
5e842d7c-c9da-4f4c-9b41-3f6e2de9e98c	Sensor Network	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
fa3a2e25-fbcf-4b63-b44f-25355d917a18	AIC2 Threat Anticipation	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
109cf6f6-cc34-4e64-84c4-5154b2220efd	Weapons System	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["actor"]
ddc35c68-95e1-4723-bb2d-02057ba53e39	AFAD Intelligence Department	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
998ef0bb-4ea3-4282-acb3-1f0eeb657d6c	Exploitation Managers	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
b62052a7-3751-45ec-9673-edf055143013	ISR Analysts	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
339b544b-3e5b-4092-9e6c-7d0cb2c042b8	Security Administrators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
3f5bb957-b356-4139-aa64-cf0620f0f93a	ISR Operators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
9e5d8e84-28ba-4352-a8c8-7f3b49f60712	System Operators	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
4baf74e4-a065-4a0b-8380-a0b15194c9d7	Security Teams	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
3c3956c5-49a7-42e2-ac0a-72fa95cffe16	Air Defense Commander	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
d425e3d9-732b-44d9-92f4-35f86087f8f3	Signal Corps Manager	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
99d758ff-1095-47b9-9c67-c75f7751e13c	Network Administrator	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
48e4b60c-da4d-4154-aa05-138989a69ffc	Chief Systems Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
2b14da30-bbad-4efb-9a1d-3bf2b547786e	Systems Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
461e19bc-9b1f-4f1b-8ec9-1187edeb63f3	Network Architect	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
753b3d9e-e584-4c46-bc04-5c3f27903145	Network Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
bb18d87c-fdfa-4427-a4b8-6d9b73b9e656	Deployment Lead	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
c503eea7-4a78-4eff-aa7a-7c84c4b4c43a	Deployment Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
613ad4d3-ce8b-46b2-b020-adb5eef026ee	Security Architect	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["owner"]
21b9b7aa-ece9-4c74-abd5-2761ba4c1ef2	Security Engineer	\N	a1573933-ec35-4bbd-a94c-e0fedbd2581d	["stakeholder"]
\.


--
-- Data for Name: postconditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.postconditions (id, text, project_id) FROM stdin;
331fa45c-de49-4f88-8140-fde93ce7731d	shot down	a1573933-ec35-4bbd-a94c-e0fedbd2581d
b318e9e6-1836-4b63-ab35-a72406941f5d	Operator is alerted with high-confidence threat prediction	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4421d0f6-41ed-4278-8821-1d1c9c00da23	Threat track automatically created/flagged	a1573933-ec35-4bbd-a94c-e0fedbd2581d
0970b84b-fa12-492f-b212-f233cc95e260	Recommended COAs pre-positioned for review	a1573933-ec35-4bbd-a94c-e0fedbd2581d
4054c276-dbc4-46a5-b9f7-5956c5c1e21f	Draft ATO presented with optimization score and rationale	a1573933-ec35-4bbd-a94c-e0fedbd2581d
6700a692-2d81-4ec3-95e9-5b3824a6589a	ATO ready for commander approval	a1573933-ec35-4bbd-a94c-e0fedbd2581d
2673e324-9ede-474f-8dba-ca85216d13e4	Operator receives correct guidance	a1573933-ec35-4bbd-a94c-e0fedbd2581d
cd93fada-a426-4ebb-a626-723c06215f05	Issue resolved or escalated appropriately	a1573933-ec35-4bbd-a94c-e0fedbd2581d
95e33301-d3d4-4487-bc79-5ef77c883074	Operator presented with ranked COAs including rationale and confidence	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9aa8e839-0c4d-4650-ae2f-6dd40a71531d	Model approved or rejected with audit trail	a1573933-ec35-4bbd-a94c-e0fedbd2581d
8f093106-78e8-4852-9fd8-3c7c887e05ca	ATO remains intact	a1573933-ec35-4bbd-a94c-e0fedbd2581d
74883f72-bfb6-44aa-b93a-34f09ae6131f	New model live in < 2 weeks	a1573933-ec35-4bbd-a94c-e0fedbd2581d
92cb2e10-b239-4710-919f-fa8ed7e9df69	Zero operational downtime	a1573933-ec35-4bbd-a94c-e0fedbd2581d
fd050ee2-5873-4e29-b356-e88105c9018d	New feed normalized and available to all AIC2 models within 24 hours	a1573933-ec35-4bbd-a94c-e0fedbd2581d
5cf7eed7-f3f7-4a0d-a8f9-129442bd7975	Operator trusts and acts on recommendation (or modifies with understanding)	a1573933-ec35-4bbd-a94c-e0fedbd2581d
42eb44a5-abf3-4ec8-a8b9-1b6189113258	Assistant immediately reflects latest guidance	a1573933-ec35-4bbd-a94c-e0fedbd2581d
8a97335d-362e-4254-a90c-1e752d014eea	Threat neutralized or safely managed	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: preconditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.preconditions (id, text, project_id) FROM stdin;
6d8eed8a-91b5-4293-9b2c-0e2cd008c557	system running	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f819ad3f-d97d-43bf-9036-4bcdccee10e9	System is operational	a1573933-ec35-4bbd-a94c-e0fedbd2581d
a9ca0b4c-350f-4dc4-a769-f21f402a12ea	Real-time data ingestion backbone active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
78211bfb-655f-47dd-b8a2-15e76e723cca	AIC2 threat anticipation models deployed and running	a1573933-ec35-4bbd-a94c-e0fedbd2581d
acc38579-884e-4fd4-82a3-86d16bdf0b75	Current resource database up-to-date	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9265a423-5620-410c-9cb7-c71d85e62213	AIC2 planning models trained and accredited	a1573933-ec35-4bbd-a94c-e0fedbd2581d
1301d8c9-7bfd-44a9-8920-d47f488be10f	Operator Assistant knowledge base current	a1573933-ec35-4bbd-a94c-e0fedbd2581d
b2a29699-ced6-4c24-a28c-6df6d95b5639	Live system logs and tech manuals accessible	a1573933-ec35-4bbd-a94c-e0fedbd2581d
9d0fe62f-ca9f-444b-8ce8-fdbef9b6a7c1	Threat track established	a1573933-ec35-4bbd-a94c-e0fedbd2581d
f1b14ee4-5ed1-4044-80ea-64ac2bc261de	Current asset status available	a1573933-ec35-4bbd-a94c-e0fedbd2581d
64d73f30-2107-4a8a-8a59-69afb563fea1	Automated pipeline completed training and testing	a1573933-ec35-4bbd-a94c-e0fedbd2581d
7d649196-7242-4ffe-a45e-ef23c52c1764	Governance framework active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
b1936692-9ca1-4b9b-ae4a-557f566cd422	Model passed governance checks	a1573933-ec35-4bbd-a94c-e0fedbd2581d
ac6f5421-8608-4c46-809d-f73b5fbd2376	ATO boundary unchanged	a1573933-ec35-4bbd-a94c-e0fedbd2581d
77c3df9f-130d-4e06-b563-e9afdfe5d305	High-throughput backbone operational	a1573933-ec35-4bbd-a94c-e0fedbd2581d
e26c93e5-649a-493b-874c-bbdf26e8e472	Explainable AI module active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
1f6047a9-df1d-45e7-8ee0-f797b807a922	Knowledge base ingestion pipeline active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
2a36540a-99a7-45a7-a4f3-124470d73f0a	EADGE-T system operational	a1573933-ec35-4bbd-a94c-e0fedbd2581d
b613902d-f5d6-4f04-af25-fd7c179b7f91	AIC2 capabilities active	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, name, description) FROM stdin;
a1573933-ec35-4bbd-a94c-e0fedbd2581d	TR2	Generate Stakeholder Requirements for Tech Refresh Phase 2\n
\.


--
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requirements (short_name, text, level, ears_type, area, ears_trigger, ears_state, ears_condition, ears_feature, rationale, owner, aid, status, created_date, last_updated, project_id) FROM stdin;
\.


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sites (id, name, security_domain) FROM stdin;
a4e27734-003e-481e-a72c-23bec403e2ab	AOC - Pink	SECL
f246d82e-41aa-4dcc-a62b-2009f15de3a7	AAOC - Pink	SECL
96dbf380-327c-4092-b040-a7248e3adb6f	AOC - Red	SREL
b7c93fe7-8caa-4637-aa83-4e64a90273ee	AAOC - Red	SREL
0256eb78-64e1-474f-ad15-87faef3f20cb	Link-16 Remote Radio Site - Pink	SECL
6aafa7db-f2bb-451e-ba6c-b516416bdacd	Link-16 Remote Radio Site - Red	SREL
1762e009-29df-4045-8ae2-c08bae7ebe2f	Remote Sites	\N
dc0297e1-6751-4ba8-8af9-d8f77235b753	AOC	\N
e8b5bd99-977e-4518-bd92-e01831ce313b	AAOC	\N
b7c00d6f-9c82-4df3-a11b-fd214b68aa8f	DAOC	\N
f73cf8f0-76b2-497e-a243-92b0cd8810bd	MAOC	\N
aa9f9015-8ace-4854-a04e-788b7d23a6df	Core Network	\N
de9e719b-fa07-4fca-8fa3-a642ea6a2cda	Core Sites	\N
24ac2d13-6453-4a5e-88f1-68e84c07789f	C2 Centers	\N
\.


--
-- Data for Name: use_case_exceptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use_case_exceptions (use_case_id, exception_id) FROM stdin;
TR2-AIC2-UC-001	4aef7fdc-b4f0-40f7-9c98-51104ba3d9fc
TR2-AIC2-UC-001	03a4ee81-cccd-4bf3-ac7c-da99f8ebaa02
TR2-AIC2-UC-002	231e3778-1950-46b9-8533-27262f58cc70
TR2-AIC2-UC-003	f3ef7870-5aa4-4d99-b4a4-14024f87e7d9
TR2-AIC2-UC-005	bd35e2b3-4744-42c0-9ceb-55d45873f24d
TR2-GLOBAL-UC-001	28bf7023-789f-4790-9e77-9b76d6008e06
TR2-GLOBAL-UC-001	529af3bb-2283-4958-b10b-4007ba13ad6c
\.


--
-- Data for Name: use_case_postconditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use_case_postconditions (use_case_id, postcondition_id) FROM stdin;
TR2-AIC2-UC-001	b318e9e6-1836-4b63-ab35-a72406941f5d
TR2-AIC2-UC-001	4421d0f6-41ed-4278-8821-1d1c9c00da23
TR2-AIC2-UC-001	0970b84b-fa12-492f-b212-f233cc95e260
TR2-AIC2-UC-002	4054c276-dbc4-46a5-b9f7-5956c5c1e21f
TR2-AIC2-UC-002	6700a692-2d81-4ec3-95e9-5b3824a6589a
TR2-AIC2-UC-003	2673e324-9ede-474f-8dba-ca85216d13e4
TR2-AIC2-UC-003	cd93fada-a426-4ebb-a626-723c06215f05
TR2-AIC2-UC-004	95e33301-d3d4-4487-bc79-5ef77c883074
TR2-AIC2-UC-005	8f093106-78e8-4852-9fd8-3c7c887e05ca
TR2-AIC2-UC-005	9aa8e839-0c4d-4650-ae2f-6dd40a71531d
TR2-AIC2-UC-006	92cb2e10-b239-4710-919f-fa8ed7e9df69
TR2-AIC2-UC-006	74883f72-bfb6-44aa-b93a-34f09ae6131f
TR2-AIC2-UC-007	fd050ee2-5873-4e29-b356-e88105c9018d
TR2-AIC2-UC-008	5cf7eed7-f3f7-4a0d-a8f9-129442bd7975
TR2-AIC2-UC-009	42eb44a5-abf3-4ec8-a8b9-1b6189113258
TR2-GLOBAL-UC-001	8a97335d-362e-4254-a90c-1e752d014eea
\.


--
-- Data for Name: use_case_preconditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use_case_preconditions (use_case_id, precondition_id) FROM stdin;
TR2-AIC2-UC-001	f819ad3f-d97d-43bf-9036-4bcdccee10e9
TR2-AIC2-UC-001	78211bfb-655f-47dd-b8a2-15e76e723cca
TR2-AIC2-UC-001	a9ca0b4c-350f-4dc4-a769-f21f402a12ea
TR2-AIC2-UC-002	acc38579-884e-4fd4-82a3-86d16bdf0b75
TR2-AIC2-UC-002	9265a423-5620-410c-9cb7-c71d85e62213
TR2-AIC2-UC-003	1301d8c9-7bfd-44a9-8920-d47f488be10f
TR2-AIC2-UC-003	b2a29699-ced6-4c24-a28c-6df6d95b5639
TR2-AIC2-UC-004	f1b14ee4-5ed1-4044-80ea-64ac2bc261de
TR2-AIC2-UC-004	9d0fe62f-ca9f-444b-8ce8-fdbef9b6a7c1
TR2-AIC2-UC-005	64d73f30-2107-4a8a-8a59-69afb563fea1
TR2-AIC2-UC-005	7d649196-7242-4ffe-a45e-ef23c52c1764
TR2-AIC2-UC-006	ac6f5421-8608-4c46-809d-f73b5fbd2376
TR2-AIC2-UC-006	b1936692-9ca1-4b9b-ae4a-557f566cd422
TR2-AIC2-UC-007	77c3df9f-130d-4e06-b563-e9afdfe5d305
TR2-AIC2-UC-008	e26c93e5-649a-493b-874c-bbdf26e8e472
TR2-AIC2-UC-009	1f6047a9-df1d-45e7-8ee0-f797b807a922
TR2-GLOBAL-UC-001	b613902d-f5d6-4f04-af25-fd7c179b7f91
TR2-GLOBAL-UC-001	2a36540a-99a7-45a7-a4f3-124470d73f0a
\.


--
-- Data for Name: use_case_stakeholders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use_case_stakeholders (use_case_id, person_id) FROM stdin;
TR2-AIC2-UC-001	95e52b88-8ee3-4b8b-9846-659af5d989c9
TR2-AIC2-UC-001	4b9d3be7-0695-4a4e-9ab0-a1c61ed40956
TR2-AIC2-UC-001	322ea09b-7eb0-402a-a745-ec402213439b
TR2-AIC2-UC-002	e2d79690-bbef-4a42-9de5-df839c2bc84d
TR2-AIC2-UC-002	99b93b39-0bfa-4030-8373-19eb86489007
TR2-AIC2-UC-002	fc96d0ac-137b-40e8-b8e0-7e7bba0f0299
TR2-AIC2-UC-003	f95aba3f-61ef-49d0-b03b-6d9ba53fb495
TR2-AIC2-UC-003	e18e881f-599f-4164-954e-5edd77d09336
TR2-AIC2-UC-004	322ea09b-7eb0-402a-a745-ec402213439b
TR2-AIC2-UC-004	95e52b88-8ee3-4b8b-9846-659af5d989c9
TR2-AIC2-UC-005	7abb1629-9d9f-431a-9618-8392b0360eaa
TR2-AIC2-UC-005	bc0457d5-08b6-4e16-8371-96d7f8bf2221
TR2-AIC2-UC-005	6de1cf55-62b2-49d3-8934-1fc2f1981e20
TR2-AIC2-UC-006	ad1678a4-27b5-4464-a5e1-822ebafe5d4b
TR2-AIC2-UC-006	78791452-94f2-4645-ac6b-9401af14e635
TR2-AIC2-UC-007	1f268053-93ea-49db-b3a1-f0375c67fe05
TR2-AIC2-UC-007	69e47b48-eba6-4883-8692-72db2a812461
TR2-AIC2-UC-008	4af25d66-3b65-4c37-9a51-b6c1584b81a2
TR2-AIC2-UC-008	95e52b88-8ee3-4b8b-9846-659af5d989c9
TR2-AIC2-UC-009	f95aba3f-61ef-49d0-b03b-6d9ba53fb495
TR2-AIC2-UC-009	f4621731-f290-49b7-8712-883f953edfec
TR2-GLOBAL-UC-001	4af25d66-3b65-4c37-9a51-b6c1584b81a2
TR2-GLOBAL-UC-001	322ea09b-7eb0-402a-a745-ec402213439b
TR2-GLOBAL-UC-001	106a2a88-52ae-460b-8f9c-5ffaaec38eff
\.


--
-- Data for Name: use_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use_cases (title, description, area, trigger, primary_actor_id, mss, extensions, aid, status, created_date, last_updated, project_id) FROM stdin;
Generate Optimized Air Tasking Order Using AI	Mission Planner uses AI to automatically generate an optimized ATO that maximizes resource employment against current and predicted mission tasks.	AIC2	New mission tasking request received or significant change in resource availability	e2d79690-bbef-4a42-9de5-df839c2bc84d	[{"step_num": 1, "actor": "Mission Planner", "description": "Submits new mission tasking requirements"}, {"step_num": 2, "actor": "AIC2 System", "description": "Ingests tasks, current asset status, rules of engagement, and weather"}, {"step_num": 3, "actor": "AIC2 System", "description": "Generates multiple optimized ATO candidates with scoring"}, {"step_num": 4, "actor": "AIC2 System", "description": "Presents recommended ATO with explainable rationale"}, {"step_num": 5, "actor": "Mission Planner", "description": "Reviews, modifies if needed, and forwards for approval"}]	[]	TR2-AIC2-UC-002	DRAFT	2025-12-07 15:22:37.275241	2025-12-07 15:22:37.275241	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Ingest and Normalize New Real-Time Data Feed	Data Engineer onboards a new sensor or open-source feed into the centralized data lake with minimal latency impact.	AIC2	New data source becomes operationally available	e8d6cd0f-d4d3-489c-915f-2bff96ef5f5a	[{"step_num": 1, "actor": "Data Engineer", "description": "Configures connector using standard schema"}, {"step_num": 2, "actor": "Ingestion Backbone", "description": "Validates, normalizes, and streams data in real time"}, {"step_num": 3, "actor": "Data Lake", "description": "Stores historical data for model retraining"}]	[]	TR2-AIC2-UC-007	DRAFT	2025-12-07 15:22:37.56989	2025-12-07 15:22:37.56989	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Generate Optimized Course of Action Against Detected Threat	Mission Operator requests AI-generated COAs to neutralize a confirmed threat using available assets.	AIC2	Confirmed threat track declared hostile or requiring immediate response	322ea09b-7eb0-402a-a745-ec402213439b	[{"step_num": 1, "actor": "Mission Operator", "description": "Declares track as hostile and requests COA"}, {"step_num": 2, "actor": "AIC2 System", "description": "Generates multiple COAs considering assets, ROE, collateral risk"}, {"step_num": 3, "actor": "AIC2 System", "description": "Ranks COAs by effectiveness, risk, and resource use"}, {"step_num": 4, "actor": "AIC2 System", "description": "Displays top COAs with human-readable explanations"}, {"step_num": 5, "actor": "Mission Operator", "description": "Selects or modifies COA and executes"}]	[{"step": "4a", "condition": "Operator selects 'Explain'", "handling": "System shows decision tree and key factors influencing recommendation"}]	TR2-AIC2-UC-004	DRAFT	2025-12-07 15:22:37.412421	2025-12-07 15:22:37.412421	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Update Operator Assistant Knowledge Base	Technical Publications team publishes updated TTP or manual, automatically ingested by AI assistant.	AIC2	New or revised technical document approved	b14b3cbc-3038-431d-8964-2ac69d53dd45	[{"step_num": 1, "actor": "Tech Pubs", "description": "Publishes updated document to repository"}, {"step_num": 2, "actor": "Ingestion Pipeline", "description": "Detects change, parses, and vectorizes content"}, {"step_num": 3, "actor": "Operator Assistant", "description": "Confirms updated knowledge in next query"}]	[]	TR2-AIC2-UC-009	DRAFT	2025-12-07 15:22:37.724639	2025-12-07 15:22:37.724639	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Anticipate Emerging Air Threat Using AI	Mission Operator receives proactive AI-generated alert of an emerging threat before it is manually detected on the Recognized Air Picture.	AIC2	Continuous all-source data ingestion and AI processing detects anomalous pattern indicative of emerging threat	322ea09b-7eb0-402a-a745-ec402213439b	[{"step_num": 1, "actor": "AIC2 System", "description": "Continuously ingests and normalizes all-source data"}, {"step_num": 2, "actor": "AIC2 System", "description": "Detects anomalous pattern exceeding threat anticipation threshold"}, {"step_num": 3, "actor": "AIC2 System", "description": "Generates threat prediction with confidence score and rationale"}, {"step_num": 4, "actor": "Mission Operator", "description": "Receives proactive alert on C2 display with predicted track and timeline"}, {"step_num": 5, "actor": "Mission Operator", "description": "Reviews AI-generated Courses of Action"}]	[{"step": "4a", "condition": "Operator requests explanation", "handling": "System displays human-readable rationale and key contributing data sources"}]	TR2-AIC2-UC-001	DRAFT	2025-12-07 15:22:37.200959	2025-12-07 15:22:37.200959	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Receive Context-Aware Operator Assistance	C2 Operator queries the AI assistant for troubleshooting or procedural guidance and receives accurate, context-aware response instantly.	AIC2	Operator encounters system fault, uncertainty, or needs procedural reminder	7a8d7fad-c1d7-4a41-a409-4e60e013c5a0	[{"step_num": 1, "actor": "C2 Operator", "description": "Asks natural-language question via voice or text"}, {"step_num": 2, "actor": "AIC2 Assistant", "description": "Analyzes current screen context, system logs, and active alarms"}, {"step_num": 3, "actor": "AIC2 Assistant", "description": "Retrieves relevant TTPs, manuals, and past similar cases"}, {"step_num": 4, "actor": "AIC2 Assistant", "description": "Provides step-by-step guidance with references"}]	[]	TR2-AIC2-UC-003	DRAFT	2025-12-07 15:22:37.342233	2025-12-07 15:22:37.342233	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Maintain NSA/ATP-Compliant AI Governance Throughout Lifecycle	Security Certifier verifies that all AIC2 model changes comply with NSA AI security guidelines before deployment.	AIC2	New or updated AIC2 model ready for production deployment	78791452-94f2-4645-ac6b-9401af14e635	[{"step_num": 1, "actor": "DevSecOps", "description": "Submits model version via automated pipeline"}, {"step_num": 2, "actor": "Governance Framework", "description": "Validates training data provenance, versioning, HITL controls, audit logs"}, {"step_num": 3, "actor": "Security Certifier", "description": "Reviews automated compliance report"}, {"step_num": 4, "actor": "Security Certifier", "description": "Approves or rejects deployment"}]	[]	TR2-AIC2-UC-005	DRAFT	2025-12-07 15:22:37.469349	2025-12-07 15:22:37.469349	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Deploy Updated AIC2 Model via Automated Secure Pipeline	DevSecOps engineer triggers rapid, secure deployment of a new AIC2 capability across all enclaves.	AIC2	New validated model package approved	4ea2738a-648a-42b0-95d5-92f2ccc26e54	[{"step_num": 1, "actor": "DevSecOps Engineer", "description": "Triggers pipeline deployment"}, {"step_num": 2, "actor": "Automated Pipeline", "description": "Builds container, runs security scans, deploys to AOC/AAOC enclaves"}, {"step_num": 3, "actor": "System", "description": "Performs zero-downtime rollout"}, {"step_num": 4, "actor": "Operators", "description": "Receive notification of new capability availability"}]	[]	TR2-AIC2-UC-006	DRAFT	2025-12-07 15:22:37.519576	2025-12-07 15:22:37.519576	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Review Explainable AI Recommendation	Operator reviews and understands the rationale behind an AI-generated COA or ATO recommendation.	AIC2	AI presents recommendation with confidence score	322ea09b-7eb0-402a-a745-ec402213439b	[{"step_num": 1, "actor": "AIC2 System", "description": "Displays recommendation"}, {"step_num": 2, "actor": "Mission Operator", "description": "Clicks 'Explain'"}, {"step_num": 3, "actor": "AIC2 System", "description": "Shows natural-language rationale, key factors, and confidence breakdown"}]	[]	TR2-AIC2-UC-008	DRAFT	2025-12-07 15:22:37.636713	2025-12-07 15:22:37.636713	a1573933-ec35-4bbd-a94c-e0fedbd2581d
Detect and Respond to New Threat (Global Baseline)	Baseline end-to-end use case showing AIC2 integration with legacy C2 for threat detection through engagement.	GLOBAL	New airborne threat detected by sensor network	322ea09b-7eb0-402a-a745-ec402213439b	[{"step_num": 1, "actor": "Sensor Network", "description": "Detects new track"}, {"step_num": 2, "actor": "AIC2 Threat Anticipation", "description": "Flags as potential threat with prediction"}, {"step_num": 3, "actor": "Mission Operator", "description": "Receives AI alert and reviews COAs"}, {"step_num": 4, "actor": "Mission Operator", "description": "Selects and executes best COA"}, {"step_num": 5, "actor": "Weapons System", "description": "Engages threat"}]	[{"step": "3a", "condition": "Operator requests explanation", "handling": "AIC2 provides full rationale and confidence metrics"}]	TR2-GLOBAL-UC-001	DRAFT	2025-12-07 15:22:37.824369	2025-12-07 15:22:37.824369	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (aid, username, email, hashed_password, is_active, created_date) FROM stdin;
rathbun	rathbun	rathbunt@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$...	1	2025-12-02 14:07:59
\.


--
-- Data for Name: visions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visions (title, description, aid, status, area, created_date, last_updated, project_id) FROM stdin;
AI Augmented Command and Control	Tech Refresh Phase 2 (TR2) builds on Phase 1's foundation of modernized compute, storage, networking, and security-hardened virtualization—along with uplifted applications and the introduction of CommandIQ Elements—to deliver a resilient, scalable, AI-augmented command and control (C2) ecosystem. By centralizing logging and SIEM capabilities, TR2 empowers operators with mission-critical tools that enhance decision-making, ensure seamless remote operations across 280 sites, and maintain NSA/ATP certification compliance for RED Domain integration—all while driving architectural reliability, efficiency, and adaptability to emerging threats.\n\nTR2 Delivers Through Four Key Pillars:\n\n1.  **AI-Augmented Command and Control**: AI-driven detection, planning, and enhanced ISR processing to anticipate and neutralize threats in real-time, leveraging advancements like automated threat identification and decision support tools.\n2. **Secure, Agile Access and  Mobile Enclaves**: Zero-trust remote access, rapid mobile enclave deployment, with automated management, power resilience, and anti tampering.\n3. **Modernized Remote Sites and Communications**: Uplift of core and remote sites with generalzed compute statck, networking integrated of emerging transports (e.g., 5G for low-latency terrestrial links and Starlink for resilient satellite backups), GATR radio data/voice with JERNAS, RF Link 16 for Red Domain\n4. **DevSecOps Acceleration**: Automated pipelines that streamline development, secure deployments, and foster innovation without compromising compliance, incorporating DoD-aligned software factories for rapid updates to mission-critical systems.	TR2-GLOBAL-VISION-001	DRAFT	GLOBAL	2025-12-02 14:24:44	2025-12-08 12:40:19.297945	a1573933-ec35-4bbd-a94c-e0fedbd2581d
\.


--
-- Name: artifact_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.artifact_events_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (code);


--
-- Name: artifact_events artifact_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact_events
    ADD CONSTRAINT artifact_events_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: component_relationships component_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.component_relationships
    ADD CONSTRAINT component_relationships_pkey PRIMARY KEY (parent_id, child_id);


--
-- Name: components components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_pkey PRIMARY KEY (id);


--
-- Name: diagram_components diagram_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_components
    ADD CONSTRAINT diagram_components_pkey PRIMARY KEY (diagram_id, component_id);


--
-- Name: diagram_edges diagram_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_edges
    ADD CONSTRAINT diagram_edges_pkey PRIMARY KEY (diagram_id, source_id, target_id);


--
-- Name: diagrams diagrams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagrams
    ADD CONSTRAINT diagrams_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (aid);


--
-- Name: exceptions exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exceptions
    ADD CONSTRAINT exceptions_pkey PRIMARY KEY (id);


--
-- Name: linkages linkages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkages
    ADD CONSTRAINT linkages_pkey PRIMARY KEY (aid);


--
-- Name: need_components need_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_components
    ADD CONSTRAINT need_components_pkey PRIMARY KEY (need_id, component_id);


--
-- Name: need_sites need_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_sites
    ADD CONSTRAINT need_sites_pkey PRIMARY KEY (need_id, site_id);


--
-- Name: needs needs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs
    ADD CONSTRAINT needs_pkey PRIMARY KEY (aid);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: postconditions postconditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postconditions
    ADD CONSTRAINT postconditions_pkey PRIMARY KEY (id);


--
-- Name: preconditions preconditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preconditions
    ADD CONSTRAINT preconditions_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (aid);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: use_case_exceptions use_case_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_exceptions
    ADD CONSTRAINT use_case_exceptions_pkey PRIMARY KEY (use_case_id, exception_id);


--
-- Name: use_case_postconditions use_case_postconditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_postconditions
    ADD CONSTRAINT use_case_postconditions_pkey PRIMARY KEY (use_case_id, postcondition_id);


--
-- Name: use_case_preconditions use_case_preconditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_preconditions
    ADD CONSTRAINT use_case_preconditions_pkey PRIMARY KEY (use_case_id, precondition_id);


--
-- Name: use_case_stakeholders use_case_stakeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_stakeholders
    ADD CONSTRAINT use_case_stakeholders_pkey PRIMARY KEY (use_case_id, person_id);


--
-- Name: use_cases use_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_pkey PRIMARY KEY (aid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (aid);


--
-- Name: visions visions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visions
    ADD CONSTRAINT visions_pkey PRIMARY KEY (aid);


--
-- Name: ix_areas_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_areas_code ON public.areas USING btree (code);


--
-- Name: ix_artifact_events_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_artifact_events_id ON public.artifact_events USING btree (id);


--
-- Name: ix_comments_artifact_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comments_artifact_aid ON public.comments USING btree (artifact_aid);


--
-- Name: ix_components_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_components_id ON public.components USING btree (id);


--
-- Name: ix_diagrams_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_diagrams_id ON public.diagrams USING btree (id);


--
-- Name: ix_documents_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_documents_aid ON public.documents USING btree (aid);


--
-- Name: ix_documents_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_documents_area ON public.documents USING btree (area);


--
-- Name: ix_documents_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_documents_project_id ON public.documents USING btree (project_id);


--
-- Name: ix_exceptions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_exceptions_id ON public.exceptions USING btree (id);


--
-- Name: ix_exceptions_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_exceptions_project_id ON public.exceptions USING btree (project_id);


--
-- Name: ix_linkages_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_linkages_aid ON public.linkages USING btree (aid);


--
-- Name: ix_linkages_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_linkages_project_id ON public.linkages USING btree (project_id);


--
-- Name: ix_needs_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_needs_aid ON public.needs USING btree (aid);


--
-- Name: ix_needs_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_needs_project_id ON public.needs USING btree (project_id);


--
-- Name: ix_people_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_people_id ON public.people USING btree (id);


--
-- Name: ix_postconditions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_postconditions_id ON public.postconditions USING btree (id);


--
-- Name: ix_postconditions_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_postconditions_project_id ON public.postconditions USING btree (project_id);


--
-- Name: ix_preconditions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_preconditions_id ON public.preconditions USING btree (id);


--
-- Name: ix_preconditions_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_preconditions_project_id ON public.preconditions USING btree (project_id);


--
-- Name: ix_projects_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_projects_id ON public.projects USING btree (id);


--
-- Name: ix_projects_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_projects_name ON public.projects USING btree (name);


--
-- Name: ix_requirements_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_requirements_aid ON public.requirements USING btree (aid);


--
-- Name: ix_requirements_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_requirements_project_id ON public.requirements USING btree (project_id);


--
-- Name: ix_sites_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sites_id ON public.sites USING btree (id);


--
-- Name: ix_use_cases_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_use_cases_aid ON public.use_cases USING btree (aid);


--
-- Name: ix_use_cases_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_use_cases_project_id ON public.use_cases USING btree (project_id);


--
-- Name: ix_users_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_aid ON public.users USING btree (aid);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_visions_aid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visions_aid ON public.visions USING btree (aid);


--
-- Name: ix_visions_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visions_area ON public.visions USING btree (area);


--
-- Name: ix_visions_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visions_project_id ON public.visions USING btree (project_id);


--
-- Name: component_relationships component_relationships_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.component_relationships
    ADD CONSTRAINT component_relationships_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.components(id);


--
-- Name: component_relationships component_relationships_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.component_relationships
    ADD CONSTRAINT component_relationships_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.components(id);


--
-- Name: components components_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: diagram_components diagram_components_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_components
    ADD CONSTRAINT diagram_components_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.components(id);


--
-- Name: diagram_components diagram_components_diagram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_components
    ADD CONSTRAINT diagram_components_diagram_id_fkey FOREIGN KEY (diagram_id) REFERENCES public.diagrams(id);


--
-- Name: diagram_edges diagram_edges_diagram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_edges
    ADD CONSTRAINT diagram_edges_diagram_id_fkey FOREIGN KEY (diagram_id) REFERENCES public.diagrams(id);


--
-- Name: diagram_edges diagram_edges_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_edges
    ADD CONSTRAINT diagram_edges_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.components(id);


--
-- Name: diagram_edges diagram_edges_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagram_edges
    ADD CONSTRAINT diagram_edges_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.components(id);


--
-- Name: diagrams diagrams_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagrams
    ADD CONSTRAINT diagrams_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: exceptions exceptions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exceptions
    ADD CONSTRAINT exceptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: need_components need_components_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_components
    ADD CONSTRAINT need_components_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.components(id);


--
-- Name: need_components need_components_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_components
    ADD CONSTRAINT need_components_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.needs(aid);


--
-- Name: need_sites need_sites_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_sites
    ADD CONSTRAINT need_sites_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.needs(aid);


--
-- Name: need_sites need_sites_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_sites
    ADD CONSTRAINT need_sites_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: needs needs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs
    ADD CONSTRAINT needs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: postconditions postconditions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postconditions
    ADD CONSTRAINT postconditions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: preconditions preconditions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preconditions
    ADD CONSTRAINT preconditions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: requirements requirements_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: use_case_exceptions use_case_exceptions_exception_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_exceptions
    ADD CONSTRAINT use_case_exceptions_exception_id_fkey FOREIGN KEY (exception_id) REFERENCES public.exceptions(id);


--
-- Name: use_case_exceptions use_case_exceptions_use_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_exceptions
    ADD CONSTRAINT use_case_exceptions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES public.use_cases(aid);


--
-- Name: use_case_postconditions use_case_postconditions_postcondition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_postconditions
    ADD CONSTRAINT use_case_postconditions_postcondition_id_fkey FOREIGN KEY (postcondition_id) REFERENCES public.postconditions(id);


--
-- Name: use_case_postconditions use_case_postconditions_use_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_postconditions
    ADD CONSTRAINT use_case_postconditions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES public.use_cases(aid);


--
-- Name: use_case_preconditions use_case_preconditions_precondition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_preconditions
    ADD CONSTRAINT use_case_preconditions_precondition_id_fkey FOREIGN KEY (precondition_id) REFERENCES public.preconditions(id);


--
-- Name: use_case_preconditions use_case_preconditions_use_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_preconditions
    ADD CONSTRAINT use_case_preconditions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES public.use_cases(aid);


--
-- Name: use_case_stakeholders use_case_stakeholders_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_stakeholders
    ADD CONSTRAINT use_case_stakeholders_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: use_case_stakeholders use_case_stakeholders_use_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_case_stakeholders
    ADD CONSTRAINT use_case_stakeholders_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES public.use_cases(aid);


--
-- Name: use_cases use_cases_primary_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_primary_actor_id_fkey FOREIGN KEY (primary_actor_id) REFERENCES public.people(id);


--
-- Name: use_cases use_cases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: visions visions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visions
    ADD CONSTRAINT visions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- PostgreSQL database dump complete
--

