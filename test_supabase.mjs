import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

const supabase = createClient(
  'https://xymfoqajotosdepudonh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJhdWQiOiJzdHVlZmFzdC1pZCIsImV4cCI6MTc0MzAyNjEwMC4wMDY5NDQsImlzcyI6InN0YWZmLXNlcnZlciIsInNpZCI6Inl1ZmF7OTliYzhjZmM1ZDk0MjhiNjczYmM0YjhkM2U5YmI1OTIzYTQ5M2FkIn0.-g5q3Lz6k8KXxgJ8exE6Y3YXKF7k8xgJ8exE6Y3YXKF7k8xgJ8exE6Y3YXKF7k8'
);

// Probar conexión simple
supabase.from('user_diagnostics').select('count').then(({ data, error }) => {
  console.log('DATA:', data);
  console.log('ERROR:', error);
}).catch(e => console.error('EXCEPTION:', e));
