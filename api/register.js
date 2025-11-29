import { connect } from 'http';
// Note: Vercel uses ES modules by default. This is a serverless function.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    data.timestamp = new Date().toISOString();

    // Save to MongoDB
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('vijayacricket');
    const collection = db.collection('registrations');
    await collection.insertOne(data);
    await client.close();

    // Append to Google Sheet
    await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };
