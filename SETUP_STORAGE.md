# Setup Supabase Storage for Event Images

## Step 1: Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Enter:
   - **Name**: `events`
   - **Public bucket**: ✅ **Yes** (check this)
4. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

Go to **SQL Editor** and run:

```sql
-- Allow public read access to events bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');

-- Allow authenticated users to upload to events bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events');
```

## Step 3: Verify

1. Try uploading an image in the admin panel
2. Check the `events` bucket in Storage to see if the file appears
3. The image URL will be automatically generated and saved to the event

## Notes

- Images are stored in the `events/` folder within the bucket
- File names are automatically generated to prevent conflicts
- Maximum file size: 5MB
- Supported formats: All image formats (jpg, png, gif, webp, etc.)

