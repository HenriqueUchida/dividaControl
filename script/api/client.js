import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://bkhgbbhlwzajjllxrruj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraGdiYmhsd3phampsbHhycnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjkyMzQsImV4cCI6MjA4NDUwNTIzNH0.3ENrwpJ5ZFQl38sqPNMndYL74TZ9G1Rzam7Dked4u-8';
export const supabaseClient = createClient(supabaseUrl, supabaseKey);