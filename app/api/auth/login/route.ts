import { NextResponse, NextRequest } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getFaceDescriptors, findBestMatch } from '@/lib/face-recognition';
import path from 'path';
import fs from 'fs/promises'; // For reading main images directory

// Connection URI - ensure your MONGODB_URI is set in .env.local
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client: MongoClient;
let db: Db;

async function connectToDatabase() {
  if (!client || !client.topology || !client.topology.isConnected()) {
    client = new MongoClient(uri!);
    await client.connect();
    const dbName = new URL(uri!).pathname.substring(1) || 'wadding-ai-app';
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
  }
  return db;
}

// Placeholder function to get the first main user image
// THIS IS NOT ROBUST AND NEEDS TO BE REPLACED WITH ACTUAL LOGIC
async function getFirstMainUserImage(): Promise<string | null> {
  const mainImagesDir = path.join(process.cwd(), 'public', 'uploads', 'main-images');
  try {
    await fs.access(mainImagesDir); // Check if directory exists
    const files = await fs.readdir(mainImagesDir);
    if (files.length > 0) {
      // Return the public path
      return `/uploads/main-images/${files[0]}`;
    }
    return null;
  } catch (error) {
    console.warn('Main images directory not found or no images available:', error);
    return null;
  }
}


export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields (email, password)' }, { status: 400 });
    }

    const database = await connectToDatabase();
    const usersCollection = database.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Remove password from the user object returned to the client
    let userToReturn: any = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Assuming role exists
        isSecondaryUser: user.isSecondaryUser, // Assuming this flag exists
        secondaryImagePath: user.secondaryImagePath, // Assuming this path exists
        createdAt: user.createdAt
    };

    // --- Face Recognition Logic for Secondary Users ---
    // Placeholder: Identify secondary user (e.g., by role or a specific flag)
    // This needs to be adapted based on your actual user schema.
    const isSecondaryUser = user.role === 'secondary' || user.isSecondaryUser === true;

    if (isSecondaryUser) {
      console.log(`User ${email} identified as a secondary user. Attempting face recognition.`);
      // Placeholder: Assume secondary user's image path is stored in user.secondaryImagePath
      // This path should be relative to the 'public' directory, e.g., '/uploads/secondary-images/userId.jpg'
      const secondaryUserImagePath = user.secondaryImagePath || `/uploads/secondary-images/${user._id}.jpg`; // Example path

      // Placeholder: Get the main user image to compare against.
      // THIS IS A MAJOR PLACEHOLDER AND NEEDS ACTUAL LOGIC
      const mainUserImagePath = await getFirstMainUserImage();

      if (secondaryUserImagePath && mainUserImagePath) {
        try {
          console.log(`Secondary image: ${secondaryUserImagePath}, Main image: ${mainUserImagePath}`);

          // Ensure paths are relative to project root for getFaceDescriptors if they are not already absolute
          const secondaryDescriptor = await getFaceDescriptors(path.join('public', secondaryUserImagePath), true) as faceapi.FaceDescriptor | undefined;

          if (secondaryDescriptor) {
            const mainDescriptors = await getFaceDescriptors(path.join('public', mainUserImagePath)) as faceapi.FaceDescriptor[];

            if (mainDescriptors && mainDescriptors.length > 0) {
              const matchResult = await findBestMatch(secondaryDescriptor, mainDescriptors);
              console.log(`Face match result for ${email}:`, matchResult);
              userToReturn.faceMatchResult = { ...matchResult, mainImageUsed: mainUserImagePath };
              // Note: In a real app, store this securely, perhaps in a session or DB,
              // and don't just pass raw distance to the client unless needed.
            } else {
              console.warn(`Could not get descriptors for main image: ${mainUserImagePath}`);
              userToReturn.faceMatchResult = { matched: false, error: 'Main image descriptors not found.', mainImageUsed: mainUserImagePath };
            }
          } else {
            console.warn(`Could not get descriptor for secondary user image: ${secondaryUserImagePath}`);
            userToReturn.faceMatchResult = { matched: false, error: 'Secondary image descriptor not found.', mainImageUsed: mainUserImagePath };
          }
        } catch (faceError: any) {
          console.error(`Face recognition error for ${email}:`, faceError.message);
          userToReturn.faceMatchResult = { matched: false, error: `Face recognition failed: ${faceError.message}`, mainImageUsed: mainUserImagePath };
        }
      } else {
        let missingPathsError = "Missing image paths for face recognition. ";
        if (!secondaryUserImagePath) missingPathsError += "Secondary user image path not available. ";
        if (!mainUserImagePath) missingPathsError += "Main user image path not available.";
        console.warn(missingPathsError);
        userToReturn.faceMatchResult = { matched: false, error: missingPathsError };
      }
    }
    // --- End Face Recognition Logic ---

    // In a real application, you would typically generate a JWT or session cookie here
    // and potentially include faceMatchResult in the session data if successful.
    return NextResponse.json({ message: 'Login successful', user: userToReturn }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
