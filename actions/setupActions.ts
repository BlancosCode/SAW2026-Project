"use server";

import { auth } from "../lib/auth";
import { connectToDatabase } from "../lib/mongodb";
import Manager from "../models/Manager";
import mongoose from "mongoose";

export async function createTemporaryManager() {
  try {
    await connectToDatabase();
    
    const email = "admin@rawtalent.com";
    const password = "password123";
    const firstName = "Admin";
    const lastName = "Temporaneo";
    const betterAuthName = "Admin Temporaneo";

    // 1. Creazione utente Better Auth
    const newUserResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: betterAuthName,
      }
    });

    if (!newUserResponse || !newUserResponse.user) {
      return { error: "L'account temporaneo potrebbe esistere già. Prova ad accedere con admin@rawtalent.com / password123" };
    }

    const newUserId = newUserResponse.user.id;
    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    // 2. Setup Ruolo in DB
    await db.collection("user").updateOne(
      { id: newUserId },
      { $set: { role: "manager" } }
    );

    // 3. Pulizia Sessione Better Auth per forzare il login con il nuovo ruolo
    await db.collection("session").deleteMany({ userId: newUserId });

    // 4. Creazione Profilo Manager DB Specifico
    await Manager.create({
      userId: newUserId,
      firstName,
      lastName,
      contactNumber: "0000000000",
      coverColor: "#44070f"
    });

    return { success: "Manager temporaneo creato! Accedi con email: admin@rawtalent.com / password: password123" };

  } catch (err: any) {
    console.error("Errore setup:", err);
    return { error: err.message || "Errore imprevisto lato server." };
  }
}
