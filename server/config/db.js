import mongoose from "mongoose";

// Cached on `global` so a warm serverless invocation reuses the same
// connection instead of opening a new one per request -- in a traditional
// persistent process (server.js) this just means connectDB() is a no-op
// after the first call, same as before.
const cached = (global.__mongooseConn ??= { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
