-- =====================================================================
--  Storage buckets — create these FIRST in the Supabase dashboard:
--  Storage → New bucket → "dish-images" (Public)
--  Storage → New bucket → "chef-avatars" (Public)
--  Storage → New bucket → "customer-avatars" (Public)
--  Then run the policies below.
-- =====================================================================

CREATE POLICY "Chefs manage own dish images"
ON storage.objects FOR ALL
USING (bucket_id = 'dish-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'dish-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Chefs manage own avatar"
ON storage.objects FOR ALL
USING (bucket_id = 'chef-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'chef-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read dish images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

CREATE POLICY "Public read chef avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'chef-avatars');

CREATE POLICY "Customers manage own avatar"
ON storage.objects FOR ALL
USING (bucket_id = 'customer-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'customer-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read customer avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-avatars');
