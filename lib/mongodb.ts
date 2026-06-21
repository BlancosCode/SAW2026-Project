import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI non definita tra le variabili d'ambiente");
}

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

//Creazione Singleton per evitare connessioni multiple a MongoDB 
let cached = global.mongooseConnection;
if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
//Se esiste già una connessione, la restituisce (pattern Singleton)
  if (cached.conn) {
    return cached.conn;
  }
//Se non esiste una connessione in corso, la crea e viene memorizzata in cache
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      console.log("Nuova connessione a MongoDB stabilita con successo.");
      return mongooseInstance;
    });
  }

//Gestisce la connessione e eventuali errori
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Errore durante la connessione al database:", error);
    throw error;
  }

  return cached.conn;
};