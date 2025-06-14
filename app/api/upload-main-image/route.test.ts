// app/api/upload-main-image/route.test.ts
import { POST } from './route'; // Adjust if your handler is named differently or exported differently
import { NextRequest } from 'next/server';
import httpMocks from 'node-mocks-http';
import fs from 'fs/promises'; // Already mocked in lib/face-recognition.test.ts, ensure mocks are per-file or global as needed

// If fs mocks are not global, mock them here as well:
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  access: jest.fn().mockResolvedValue(undefined),
  // Add readdir if getFirstMainUserImage is involved, though not for this specific route.
}));

describe('/api/upload-main-image POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no file is uploaded', async () => {
    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(new FormData()), // Empty FormData
    });

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('No file uploaded');
  });

  it('should successfully upload a file', async () => {
    const mockFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
      // NextRequest specific properties might be needed if your handler uses them.
      // e.g., headers, nextUrl, etc. For basic FormData, this might suffice.
    });

    // Mock Date.now() to have predictable filenames
    const mockDateNow = 1234567890000;
    jest.spyOn(Date, 'now').mockImplementation(() => mockDateNow);

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const expectedFilename = `${mockDateNow}-test-image.jpg`;
    expect(json.filePath).toBe(`/uploads/main-images/${expectedFilename}`);

    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining(path.join('public', 'uploads', 'main-images')), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'uploads', 'main-images', expectedFilename)),
      Buffer.from(await mockFile.arrayBuffer())
    );

    (Date.now as jest.Mock).mockRestore(); // Restore original Date.now
  });

  it('should handle directory creation error (not EEXIST)', async () => {
    (fs.mkdir as jest.Mock).mockRejectedValueOnce({ code: 'EROFS', message: 'Read-only file system' });

    const mockFile = new File(['dummy content'], 'test-error.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
    });

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Could not create upload directory');
  });

  it('should ignore EEXIST error when creating directory', async () => {
    (fs.mkdir as jest.Mock).mockRejectedValueOnce({ code: 'EEXIST' }); // First call EEXIST
    (fs.mkdir as jest.Mock).mockResolvedValueOnce(undefined); // Subsequent calls fine (if any)

    const mockFile = new File(['dummy content'], 'test-eexist.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);
     const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
    });
    jest.spyOn(Date, 'now').mockImplementation(() => 12345);


    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.filePath).toBe(`/uploads/main-images/12345-test-eexist.jpg`);
    expect(fs.writeFile).toHaveBeenCalled();
    (Date.now as jest.Mock).mockRestore();
  });

  it('should handle writeFile error', async () => {
    (fs.writeFile as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));

    const mockFile = new File(['dummy content'], 'test-write-error.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);
    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
    });

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Error uploading file');
  });
});

// Helper to ensure path is imported if not already
import path from 'path';
