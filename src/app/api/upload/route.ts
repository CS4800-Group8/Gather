/**
 * @file S3 Image Upload API (POST /api/upload)
 *
 * @description
 * Handles uploading image files to AWS S3. This endpoint:
 *   - Accepts multipart/form-data uploads
 *   - Validates image type and file size (Vercel 4MB limit)
 *   - Converts uploaded File → Buffer
 *   - Calls `uploadToS3()` helper to store the file in AWS S3
 *   - Returns a public image URL for frontend usage
 *
 * Supported file types: images only (image/* MIME types)
 *
 * @dependencies
 * - uploadToS3(): AWS S3 upload helper from @/lib/s3
 * - NextRequest / NextResponse: Next.js API utilities
 */

// AnN add: API endpoint for uploading recipe photos to S3 on 10/28
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    // Get the form data from request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB for Vercel compatibility)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes (Vercel limit: 4.5MB)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 4MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename: timestamp_originalname
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, fileName, file.type);

    // Return success with image URL
    return NextResponse.json(
      { 
        success: true,
        imageUrl: imageUrl,
        message: 'File uploaded successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}