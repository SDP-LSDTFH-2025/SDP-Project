# PDF Upload Fix - Test Instructions

## Problem Fixed
The "An unknown file format not allowed" error was caused by:
1. **PDF Compression**: PDFs were being gzipped before upload, but Cloudinary expects original PDF format
2. **Missing PDF Delete Method**: No specific method to delete PDFs from Cloudinary

## Changes Made

### 1. Fixed PDF Upload (`uploadPDF` method)
- **Removed**: PDF compression (gzip) before upload
- **Added**: Better upload options for PDFs
- **Result**: PDFs now upload in their original format

### 2. Added PDF Delete Method (`deletePDF` method)
- **Added**: Specific method to delete PDFs with `resource_type: 'raw'`
- **Used by**: PDF deletion endpoint

## Test the Fix

### Using Swagger UI:
1. Go to `http://localhost:3000/public-resources/api-docs`
2. Try uploading a PDF:
   - Use field name: `pdf`
   - Add `event_id` field
   - Upload any PDF file (up to 50MB)

### Using cURL:
```bash
# Upload PDF (should work now)
curl -X POST "http://localhost:3000/api/v1/public/pdf" \
  -F "pdf=@document.pdf" \
  -F "event_id=test-event-123"

# Get the uploaded resource
curl -X GET "http://localhost:3000/api/v1/public/test-event-123"

# Delete the PDF
curl -X DELETE "http://localhost:3000/api/v1/public/pdf/test-event-123"
```

## Expected Result
- ✅ PDF uploads should work without "unknown file format" error
- ✅ PDFs should be accessible via secure URLs
- ✅ PDF deletion should work properly
- ✅ No more compression issues

## File Size Limits
- **Images**: 5MB per file
- **PDFs**: 50MB per file
- **Multiple Images**: Max 10 files at once

## Cloudinary Resource Types
- **Images**: `resource_type: 'image'` (default)
- **PDFs**: `resource_type: 'raw'` (for documents)
