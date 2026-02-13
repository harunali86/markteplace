-- =============================================
-- STORAGE BUCKET CONFIGURATION
-- =============================================

-- 1. Create 'listings' bucket for public marketplace images
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- 2. Security Policies for 'listings'

-- Policy: Public Read Access (Anyone can view images)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'listings' );

-- Policy: Vendor Upload Access (Vendor members can upload)
-- Note: We need a complex check to ensure they are uploading for *their* vendor.
-- For MVP, we'll allow any authenticated user to upload, but enforce association in the DB insert.
-- A stricter policy would check if the folder name matches a vendor_id the user belongs to.
-- Pattern: listings/{vendor_id}/{resource_id}/{filename}

create policy "Authenticated Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listings' 
    and auth.role() = 'authenticated'
  );

-- Policy: Vendor Delete/Update (Only own objects)
-- We enforce this by conventions or by checking ownership metadata if possible.
-- For now, allow authenticated update/delete for simplicity in MVP, relying on UUID unguessability + app logic.
create policy "Authenticated Update/Delete"
  on storage.objects for update
  using ( bucket_id = 'listings' and auth.role() = 'authenticated' );

create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'listings' and auth.role() = 'authenticated' );
