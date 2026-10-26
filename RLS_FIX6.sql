-- Grant INSERT privileges to authenticated role
GRANT INSERT ON public.companies TO authenticated;
GRANT INSERT ON public.company_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT SELECT, INSERT ON public.company_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
EOF