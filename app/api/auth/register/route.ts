import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';

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
    // Use a specific database name, e.g., 'wadding-ai-app' from your connection string
    // It's good practice to not use the default 'test' database for applications.
    // Extracting from URI or setting explicitly:
    const dbName = new URL(uri!).pathname.substring(1) || 'wadding-ai-app';
    db = client.db(dbName);
  }
  return db;
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password)' }, { status: 400 });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Password strength (example: at least 6 characters)
    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const database = await connectToDatabase();
    const usersCollection = database.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Insert new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Remove password from the user object returned to the client
    const newUser = {
        _id: result.insertedId,
        name,
        email,
        createdAt: new Date()
    };

    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Check if the error is a known type, otherwise generic message
    if (error instanceof Error) {
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
