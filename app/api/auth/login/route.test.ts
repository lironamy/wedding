// app/api/auth/login/route.test.ts
import { POST } from './route';
import { NextRequest } from 'next/server';
import httpMocks from 'node-mocks-http';
import { Db, MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as faceRecognition from '@/lib/face-recognition';
import fs from 'fs/promises'; // Mocked for getFirstMainUserImage

// Mock MongoDB
let mockUserCollection = {
  findOne: jest.fn(),
};
const mockDb = {
  collection: jest.fn(() => mockUserCollection),
};
const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  db: jest.fn(() => mockDb as unknown as Db),
  topology: { isConnected: jest.fn(() => true) },
};

jest.mock('mongodb', () => ({
  MongoClient: jest.fn(() => mockClient),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock face-recognition library
jest.mock('@/lib/face-recognition', () => ({
  getFaceDescriptors: jest.fn(),
  findBestMatch: jest.fn(),
}));

// Mock fs.promises for getFirstMainUserImage
jest.mock('fs/promises', () => ({
  access: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue(['main-test-image.jpg']), // Default to one image
  // No need for mkdir/writeFile here unless other functions in this route use them
}));


describe('/api/auth/login POST', () => {
  const mockPassword = 'password123';
  const mockHashedPassword = 'hashedPassword';
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: mockHashedPassword,
    role: 'user', // Default role
    isSecondaryUser: false,
    secondaryImagePath: '/uploads/secondary-images/user123.jpg',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations for each test
    mockUserCollection.findOne.mockResolvedValue(null); // Default to user not found
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Default to password invalid
    (faceRecognition.getFaceDescriptors as jest.Mock).mockReset();
    (faceRecognition.findBestMatch as jest.Mock).mockReset();
    (fs.readdir as jest.Mock).mockResolvedValue(['main-test-image.jpg']); // Reset readdir mock
  });

  it('should return 400 if email or password is missing', async () => {
    let req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: 'test@example.com' }) });
    let response = await POST(req as NextRequest);
    expect(response.status).toBe(400);

    req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ password: 'password123' }) });
    response = await POST(req as NextRequest);
    expect(response.status).toBe(400);
  });

  it('should return 401 if user not found', async () => {
    mockUserCollection.findOne.mockResolvedValue(null);
    const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: 'unknown@example.com', password: mockPassword }) });
    const response = await POST(req as NextRequest);
    expect(response.status).toBe(401);
  });

  it('should return 401 if password is invalid', async () => {
    mockUserCollection.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: mockUser.email, password: 'wrongpassword' }) });
    const response = await POST(req as NextRequest);
    expect(response.status).toBe(401);
  });

  it('should successfully log in a non-secondary user', async () => {
    mockUserCollection.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: mockUser.email, password: mockPassword }) });

    const response = await POST(req as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe('Login successful');
    expect(json.user._id).toBe(mockUser._id);
    expect(json.user.password).toBeUndefined();
    expect(json.user.faceMatchResult).toBeUndefined(); // No face match for non-secondary user
  });

  describe('Secondary User Login with Face Recognition', () => {
    const secondaryUser = { ...mockUser, role: 'secondary', isSecondaryUser: true };
    const mockSecondaryDescriptor = new Float32Array([0.1]);
    const mockMainDescriptors = [new Float32Array([0.2])];

    beforeEach(() => {
      mockUserCollection.findOne.mockResolvedValue(secondaryUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (faceRecognition.getFaceDescriptors as jest.Mock)
        .mockImplementation(async (imagePath, singleFace) => {
          if (imagePath.includes(secondaryUser.secondaryImagePath)) return singleFace ? mockSecondaryDescriptor : [mockSecondaryDescriptor];
          if (imagePath.includes('main-test-image.jpg')) return mockMainDescriptors;
          return undefined;
        });
    });

    it('should attempt face recognition and return match result if secondary user', async () => {
      (faceRecognition.findBestMatch as jest.Mock).mockResolvedValue({ matched: true, distance: 0.3, bestMatchLabel: 'main_user_face_0' });
      const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: secondaryUser.email, password: mockPassword }) });
      const response = await POST(req as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user.faceMatchResult).toBeDefined();
      expect(json.user.faceMatchResult.matched).toBe(true);
      expect(json.user.faceMatchResult.distance).toBe(0.3);
      expect(json.user.faceMatchResult.mainImageUsed).toBe('/uploads/main-images/main-test-image.jpg');
      expect(faceRecognition.getFaceDescriptors).toHaveBeenCalledTimes(2); // Once for secondary, once for main
      expect(faceRecognition.findBestMatch).toHaveBeenCalledWith(mockSecondaryDescriptor, mockMainDescriptors);
    });

    it('should handle no main user image available', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]); // No main images
      const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: secondaryUser.email, password: mockPassword }) });
      const response = await POST(req as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user.faceMatchResult).toBeDefined();
      expect(json.user.faceMatchResult.matched).toBe(false);
      expect(json.user.faceMatchResult.error).toContain('Main user image path not available.');
    });

    it('should handle secondary user image descriptor not found', async () => {
        (faceRecognition.getFaceDescriptors as jest.Mock)
        .mockImplementation(async (imagePath, singleFace) => {
          if (imagePath.includes(secondaryUser.secondaryImagePath)) return undefined; // Secondary descriptor fails
          if (imagePath.includes('main-test-image.jpg')) return mockMainDescriptors;
          return undefined;
        });

      const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: secondaryUser.email, password: mockPassword }) });
      const response = await POST(req as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user.faceMatchResult).toBeDefined();
      expect(json.user.faceMatchResult.matched).toBe(false);
      expect(json.user.faceMatchResult.error).toBe('Secondary image descriptor not found.');
    });

    it('should handle main user image descriptors not found', async () => {
        (faceRecognition.getFaceDescriptors as jest.Mock)
        .mockImplementation(async (imagePath, singleFace) => {
          if (imagePath.includes(secondaryUser.secondaryImagePath)) return mockSecondaryDescriptor;
          if (imagePath.includes('main-test-image.jpg')) return []; // Main descriptors fail
          return undefined;
        });
      const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: secondaryUser.email, password: mockPassword }) });
      const response = await POST(req as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user.faceMatchResult).toBeDefined();
      expect(json.user.faceMatchResult.matched).toBe(false);
      expect(json.user.faceMatchResult.error).toBe('Main image descriptors not found.');
    });

    it('should handle face recognition error', async () => {
      (faceRecognition.findBestMatch as jest.Mock).mockRejectedValue(new Error('Test face match error'));
      const req = httpMocks.createRequest<NextRequest>({ method: 'POST', json: () => Promise.resolve({ email: secondaryUser.email, password: mockPassword }) });
      const response = await POST(req as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200); // Login still succeeds
      expect(json.user.faceMatchResult).toBeDefined();
      expect(json.user.faceMatchResult.matched).toBe(false);
      expect(json.user.faceMatchResult.error).toContain('Face recognition failed: Test face match error');
    });
  });
});
