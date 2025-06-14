import { NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/app/utils/jwt';
import { MongoClient, Db, ObjectId } from 'mongodb';

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

export async function GET() {
  try {
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json({ message: 'No session' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    const database = await connectToDatabase();
    const usersCollection = database.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 