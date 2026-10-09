select u.full_name, u.email, a.created_at as account_created
from public.users u
join auth.users a on a.id = u.id;
