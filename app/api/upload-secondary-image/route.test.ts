// app/api/upload-secondary-image/route.test.ts
import { POST } from './route';
import { NextRequest } from 'next/server';
import httpMocks from 'node-mocks-http';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  access: jest.fn().mockResolvedValue(undefined),
}));

describe('/api/upload-secondary-image POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no file is uploaded', async () => {
    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(new FormData()),
    });

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('No file uploaded');
  });

  it('should successfully upload a file', async () => {
    const mockFile = new File(['dummy content'], 'test-secondary-image.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
    });

    const mockDateNow = 1234567890001; // Different time for different filename
    jest.spyOn(Date, 'now').mockImplementation(() => mockDateNow);

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const expectedFilename = `${mockDateNow}-test-secondary-image.jpg`;
    expect(json.filePath).toBe(`/uploads/secondary-images/${expectedFilename}`);

    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining(path.join('public', 'uploads', 'secondary-images')), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'uploads', 'secondary-images', expectedFilename)),
      Buffer.from(await mockFile.arrayBuffer())
    );
    (Date.now as jest.Mock).mockRestore();
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
    (fs.mkdir as jest.Mock).mockRejectedValueOnce({ code: 'EEXIST' });

    const mockFile = new File(['dummy content'], 'test-secondary-eexist.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);
     const req = httpMocks.createRequest<NextRequest>({
      method: 'POST',
      formData: () => Promise.resolve(formData),
    });
    jest.spyOn(Date, 'now').mockImplementation(() => 12346);

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.filePath).toBe(`/uploads/secondary-images/12346-test-secondary-eexist.jpg`);
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
