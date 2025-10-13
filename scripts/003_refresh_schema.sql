-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Ensure tables are in the public schema and accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Refresh the schema cache
SELECT pg_notify('pgrst', 'reload schema');
