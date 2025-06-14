import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie } from '@/app/utils/jwt';

// Connection URI - ensure your MONGODB_URI is set in .env.local
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client: MongoClient;
let db: Db;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri!);
    await client.connect();
    const dbName = new URL(uri!).pathname.substring(1) || 'wadding-ai-app';
    db = client.db(dbName);
  }
  return db;
}

export async function POST(request: Request) {
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
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Remove password from the user object returned to the client
    const userToReturn = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    // Generate JWT token
    const token = generateToken(userToReturn);

    // Create response
    const response = NextResponse.json(
      { message: 'Login successful', user: userToReturn },
      { status: 200 }
    );

    // Set the token cookie
    await setTokenCookie(token);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
