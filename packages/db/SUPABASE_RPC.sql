-- 4. RPC: Create Vendor (Transactional) - UPDATED
-- Creates a vendor, assigns owner membership, and promotes user role.
create or replace function public.create_vendor(
  name text,
  slug text,
  category text
) returns uuid as $$
declare
  new_vendor_id uuid;
begin
  -- 1. Insert Vendor
  insert into public.vendors (name, slug, category)
  values (name, slug, category)
  returning id into new_vendor_id;

  -- 2. Insert Membership (Owner)
  insert into public.vendor_memberships (vendor_id, user_id, role)
  values (new_vendor_id, auth.uid(), 'owner');

  -- 3. Promote User Role to 'vendor_admin'
  update public.profiles
  set role = 'vendor_admin'
  where id = auth.uid();

  return new_vendor_id;
end;
$$ language plpgsql security definer;
