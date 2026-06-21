import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI non definita tra le variabili d'ambiente in auth.ts");
}

let clientPromise: Promise<MongoClient>;
const client = new MongoClient(MONGODB_URI);
clientPromise = client.connect();

const connectedClient = await clientPromise;
const db = connectedClient.db();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
  database: mongodbAdapter(db),

  //nel progetto originale era presente la gestione del reset e modifica della password, 
  // resa simulativa tramite gemini visto che l'api resend non puó funzionare senza dominio personale
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      // MOCKING DELL'INVIO EMAIL PER AMBIENTE LOCALE/ESAME
      console.log("=========================================");
      console.log(`SIMULAZIONE EMAIL INVIATA A: ${user.email}`);
      console.log(`Clicca su questo link per resettare: ${url}`);
      console.log("=========================================");
    },
    onPasswordReset: async ({ user }, _request) => {
      console.log(`Password resettata con successo per ${user.email}`);
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "freelancer"
      }
    }
  },

  plugins: [nextCookies()]
});