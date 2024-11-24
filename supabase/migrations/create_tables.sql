-- Create dashboard_metrics table
CREATE TABLE public.dashboard_metrics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    upcoming_deadlines INTEGER NOT NULL DEFAULT 0,
    active_clients INTEGER NOT NULL DEFAULT 0,
    documents_pending INTEGER NOT NULL DEFAULT 0,
    compliance_alerts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activities table
CREATE TABLE public.activities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create deadlines table
CREATE TABLE public.deadlines (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert some sample data
INSERT INTO public.dashboard_metrics 
(upcoming_deadlines, active_clients, documents_pending, compliance_alerts)
VALUES (5, 12, 8, 3);

INSERT INTO public.activities (text)
VALUES 
('Client tax return submitted for review'),
('New document uploaded by client ABC Corp'),
('Deadline reminder sent to XYZ Ltd'),
('Meeting scheduled with client John Doe');

INSERT INTO public.deadlines (text, date)
VALUES 
('Tax Return Due - ABC Corp', '2024-04-15'),
('Quarterly Filing - XYZ Ltd', '2024-03-31'),
('Annual Review - John Doe LLC', '2024-05-01'),
('Document Submission - Smith Co', '2024-03-15');