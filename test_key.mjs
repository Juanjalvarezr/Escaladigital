import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

const supabase = createClient(
  'https://xymfoqajotosdepudonh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bWZvcWFqb3Rvc2RlcHVkb25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDUzNTksImV4cCI6MjEwNDQ4MTM1OX0.LhHmXMs0lwnMiIXcD2P6oYfc5hJhAKkbuO5cLa1iuRI'
);

supabase.from('user_diagnostics').select('count').then(({data, error}) => {
  console.log('DATA:', data);
  console.log('ERROR:', error ? error.message : 'none');
}).catch(e => console.error('EX:', e.message));
