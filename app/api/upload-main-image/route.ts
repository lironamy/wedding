import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'main-images');
    const filePath = path.join(uploadsDir, filename);

    // Ensure the uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error: any) {
      // Ignore error if directory already exists
      if (error.code !== 'EEXIST') {
        console.error('Error creating directory:', error);
        return NextResponse.json({ success: false, error: 'Could not create upload directory' }, { status: 500 });
      }
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/main-images/${filename}`;
    return NextResponse.json({ success: true, filePath: publicPath });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Error uploading file' }, { status: 500 });
  }
}
