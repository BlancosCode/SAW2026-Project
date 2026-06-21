//l'intero file é stato refattorizzato tramite gemini per migliorare la gestione degli errori dati da typescript
//l'utilizzo di supporto IA nelle singole funzioni verrá indicato con commenti specifici.
"use server";

import { auth } from "@/../lib/auth";
import { cookies, headers } from "next/headers";
import { connectToDatabase } from "@/../lib/mongodb";
import Freelancer from "@/../models/Freelancer";
import Manager from "@/../models/Manager";
import Company from "@/../models/Company";
import InternalProject from "@/../models/InternalProjects";
import mongoose from "mongoose";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, R2_BUCKET_NAME } from "@/../lib/s3";
import { sendPushNotification } from "./pushActions";
import crypto from "crypto";

// --- HELPER DI UTILITÀ ---
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Generata interamente da Gemini, sfruttando la documentazione ufficiale di R2.
// Non é altro che una funzione per eliminare le immagini da R2 quando vengono sostituite in modo da evitare la starvation dello storage
async function deleteOldImageFromR2(oldUrl?: string) {
  if (!oldUrl) return;
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl && oldUrl.startsWith(publicUrl)) {
    const key = oldUrl.replace(`${publicUrl}/`, "");
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    } catch (error) {
      console.error("Errore durante l'eliminazione della vecchia immagine da R2:", error);
    }
  }
}

// --- AZIONI PUBBLICHE ---
export async function getUniqueMacroCategories() {
  try {
    await connectToDatabase();
    const categories = await Freelancer.distinct("publicData.macroCategories");
    return { success: true, categories: categories.filter(Boolean) as string[] };
  } catch (error: unknown) {
    console.error("Errore fetch categorie:", getErrorMessage(error));
    return { error: "Impossibile caricare le categorie." };
  }
}

// --- AZIONI MANAGER (Gestione Utenti) ---
// Tutta la parte di salvataggio dei cookie per evitare di far perdere la sessione al manager aggirando il normale funzionamento di better auth
// é stata sviluppata con l'aiuto di Gemini, non trovando abbastanza documentazione per gestirla da solo.
export async function createNewUser(formData: FormData) {
  const cookieStore = await cookies();

  // 1. Salviamo la sessione del Manager prima che Better Auth faccia danni
  const managerAuthCookies = cookieStore.getAll().filter(c => c.name.includes("better-auth"));

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "manager") {
    return { error: "Non autorizzato. Solo i manager possono creare utenti." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !role) {
    return { error: "Email, Password e Ruolo sono obbligatori." };
  }

  try {
    await connectToDatabase();

    let betterAuthName = "";
    if (role === "company") {
      betterAuthName = formData.get("companyName") as string;
    } else {
      betterAuthName = `${formData.get("firstName")} ${formData.get("lastName")}`.trim();
    }

    if (!betterAuthName) {
      return { error: "Inserisci Nome e Cognome (o il Nome dell'Azienda)." };
    }

    // 2. Creiamo l'utente tramite l'API base (qui Better Auth prova a loggare il nuovo utente)
    const newUserResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: betterAuthName,
        role
      }
    });

    if (!newUserResponse || !newUserResponse.user) {
      return { error: "Errore. L'email potrebbe essere già in uso o non valida." };
    }

    const newUserId = newUserResponse.user.id;
    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    // 3. RIPRISTINIAMO I COOKIE DEL MANAGER! 
    // Il browser riceverà questa istruzione e manterrà la tua sessione intatta.
    for (const cookie of managerAuthCookies) {
      cookieStore.set(cookie.name, cookie.value, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Sicurezza extra per la produzione
        sameSite: "lax"
      });
    }

    // 4. Pulizia: Cancelliamo la sessione orfana usando l'ID del nuovo utente
    await db.collection("session").deleteMany({ userId: newUserId });

    // 5. Forziamo il ruolo richiesto nel Database
    await db.collection("user").updateOne(
      { id: newUserId },
      { $set: { role: role } }
    );

    // 6. Popoliamo Mongoose
    if (role === "freelancer") {
      await Freelancer.create({
        userId: newUserId,
        publicData: {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          location: formData.get("location") as string || "",
          mainPortfolioUrl: formData.get("mainPortfolioUrl") as string || "",
          cvUrl: "",
          bio: "",
          macroCategories: (formData.get("macroCategories") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
          experienceLevel: formData.get("experienceLevel") as string || "newbie",
          availability: { status: "available" },
          portfolioProjects: []
        },
        internalData: {
          subSpecializations: [],
          professionalReferences: [],
          certifications: [],
          languages: [],
          workPreferences: { remote: true, onsite: false },
          managerNotes: []
        }
      });
    }
    else if (role === "manager") {
      await Manager.create({
        userId: newUserId,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        contactNumber: formData.get("contactNumber") as string || ""
      });
    }
    else if (role === "company") {
      await Company.create({
        userId: newUserId,
        name: formData.get("companyName") as string,
        industry: formData.get("industry") as string || "",
        description: formData.get("description") as string || "",
        website: formData.get("website") as string || "",
        mainContactEmail: formData.get("mainContactEmail") as string || email,
        pIVA: formData.get("pIVA") as string || "",
        status: "active",
        freelancersCollaborated: [],
        internalData: {
          earningsHistory: [],
          internalNotes: []
        }
      });
    }

    return { success: `L'account per ${betterAuthName} (${role}) è stato creato!` };

  } catch (err: any) {
    console.error("Errore Action:", err);
    return { error: err.message || "Errore imprevisto lato server." };
  }
}




export async function fetchUsers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "manager") {
    return { error: "Non autorizzato. Solo i manager possono visualizzare gli utenti." };
  }

  try {
    await connectToDatabase();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    const baseUsers = await db.collection("user").find({}).sort({ createdAt: -1 }).toArray();

    const [freelancers, companies, managers] = await Promise.all([
      Freelancer.find({}).lean(),
      Company.find({}).lean(),
      Manager.find({}).lean()
    ]);

    const formattedUsers = baseUsers.map((baseUser) => {
      const actualId = baseUser._id?.toString() || baseUser.id || "ID_SCONOSCIUTO";

      let status = "N/D";
      let profile: Record<string, unknown> | null = null;
      let derivedName = baseUser.name || "Senza Nome";

      if (baseUser.role === "freelancer") {
        const f = freelancers.find((f: any) => f.userId === actualId) as any;
        profile = f || null;
        status = f?.publicData?.availability?.status || "available";
        if (f?.publicData?.firstName || f?.publicData?.lastName) {
          derivedName = `${f.publicData.firstName || ""} ${f.publicData.lastName || ""}`.trim();
        }
      } else if (baseUser.role === "company") {
        const c = companies.find((c: any) => c.userId === actualId) as any;
        profile = c || null;
        status = c?.status || "active";
        if (c?.name) {
          derivedName = c.name;
        }
      } else if (baseUser.role === "manager") {
        const m = managers.find((m: any) => m.userId === actualId) as any;
        profile = m || null;
        status = "active";
        if (m?.firstName || m?.lastName) {
          derivedName = `${m.firstName || ""} ${m.lastName || ""}`.trim();
        }
      }

      return {
        id: actualId,
        name: derivedName,
        email: baseUser.email || "",
        image: baseUser.image || profile?.profilePicture || (profile?.publicData as any)?.profilePicture || "",
        role: baseUser.role || "user",
        createdAt: baseUser.createdAt ? new Date(baseUser.createdAt).toLocaleDateString("it-IT") : "N/D",
        status,
        profileData: profile ? JSON.parse(JSON.stringify(profile)) : null
      };
    });

    return { success: true, users: formattedUsers };

  } catch (error: unknown) {
    console.error("Errore fetchUsers:", getErrorMessage(error));
    return { error: "Errore imprevisto durante il caricamento degli utenti." };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  // La gestione delle profile pic é stata  sviluppata con l'aiuto di Gemini, sia per garantire una corretta gestione dei file sia per mancanza di chiara documentazione in merito
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "manager") {
    return { error: "Non autorizzato. Operazione riservata ai manager." };
  }

  try {
    await connectToDatabase();

    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    let betterAuthName = "";
    if (role === "company") {
      betterAuthName = formData.get("companyName") as string;
    } else {
      betterAuthName = `${formData.get("firstName")} ${formData.get("lastName")}`.trim();
    }

    let oldPicUrl = "";
    if (role === "freelancer") {
      const f = await Freelancer.findOne({ userId }).lean();
      oldPicUrl = f?.publicData?.profilePicture || "";
    } else if (role === "company") {
      const c = await Company.findOne({ userId }).lean();
      oldPicUrl = c?.profilePicture || "";
    } else if (role === "manager") {
      const m = await Manager.findOne({ userId }).lean();
      oldPicUrl = m?.profilePicture || "";
    }

    const removeProfilePicture = formData.get("removeProfilePicture") === "true";
    let profilePicAction: "keep" | "remove" | "update" = "keep";
    let newProfilePicUrl = "";
    const profilePicFile = formData.get("profilePicture") as File;

    if (removeProfilePicture) {
      if (oldPicUrl) await deleteOldImageFromR2(oldPicUrl);
      profilePicAction = "remove";
    } else if (profilePicFile && profilePicFile.size > 0) {
      if (!profilePicFile.type.startsWith("image/")) return { error: "La foto profilo deve essere un'immagine." };
      if (profilePicFile.size > 5 * 1024 * 1024) return { error: "La foto profilo supera i 5MB." };
      const fileBuffer = Buffer.from(await profilePicFile.arrayBuffer());
      const fileExt = profilePicFile.name.split('.').pop() || "jpg";
      const uniqueId = crypto.randomUUID();
      const fileName = `profile-pictures/${userId}/${uniqueId}.${fileExt}`;
      const command = new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileName, Body: fileBuffer, ContentType: profilePicFile.type });
      await s3Client.send(command);
      newProfilePicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

      if (oldPicUrl) await deleteOldImageFromR2(oldPicUrl);
      profilePicAction = "update";
    }

    const userQuery: Record<string, unknown> = { $or: [{ id: userId }, { _id: userId }] };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      (userQuery.$or as Array<unknown>).push({ _id: new mongoose.Types.ObjectId(userId) });
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    const userUpdate: Record<string, string> = { email, name: betterAuthName, role };
    if (profilePicAction === "remove") userUpdate.image = "";
    else if (profilePicAction === "update") userUpdate.image = newProfilePicUrl;

    await db.collection("user").updateOne(userQuery, { $set: userUpdate });

    // l'aggiornamento dei dati, avendone gia gestito l'inserimento, sono anch'essi sviluppati con Gemini per risparmio di tempo, essendo un'azione pressocché identica 
    if (role === "freelancer") {
      const notesText = formData.get("managerNotes") as string;
      const managerNotes = notesText ? notesText.split('\n').filter(n => n.trim() !== '').map(note => ({
        date: new Date(),
        managerId: session.user.id,
        note: note.trim()
      })) : [];

      await Freelancer.findOneAndUpdate(
        { userId },
        {
          $set: {
            "publicData.firstName": formData.get("firstName") as string,
            "publicData.lastName": formData.get("lastName") as string,
            "publicData.location": formData.get("location") as string,
            "publicData.mainPortfolioUrl": formData.get("mainPortfolioUrl") as string,
            "publicData.cvUrl": formData.get("cvUrl") as string,
            "publicData.macroCategories": (formData.get("macroCategories") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            "publicData.bio": formData.get("bio") as string,
            "publicData.experienceLevel": formData.get("experienceLevel") as string || "newbie",
            "publicData.availability.status": formData.get("availabilityStatus") as string,
            "internalData.phoneNumber": formData.get("phoneNumber") as string,
            "internalData.subSpecializations": (formData.get("subSpecializations") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            "internalData.certifications": (formData.get("certifications") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            "internalData.languages": (formData.get("languages") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            "internalData.managerNotes": managerNotes,
            ...(profilePicAction === "remove" ? { "publicData.profilePicture": "" } : {}),
            ...(profilePicAction === "update" ? { "publicData.profilePicture": newProfilePicUrl } : {}),
          }
        },
        { upsert: true }
      );
    } else if (role === "company") {
      const notesText = formData.get("internalNotes") as string;
      const internalNotes = notesText ? notesText.split('\n').filter(n => n.trim() !== '').map(note => ({
        date: new Date(),
        note: note.trim()
      })) : [];

      await Company.findOneAndUpdate(
        { userId },
        {
          $set: {
            name: formData.get("companyName") as string,
            pIVA: formData.get("pIVA") as string,
            industry: formData.get("industry") as string,
            mainContactEmail: formData.get("mainContactEmail") as string,
            website: formData.get("website") as string,
            status: formData.get("companyStatus") as string,
            description: formData.get("description") as string,
            "internalData.internalNotes": internalNotes,
            ...(profilePicAction === "remove" ? { profilePicture: "" } : {}),
            ...(profilePicAction === "update" ? { profilePicture: newProfilePicUrl } : {}),
          }
        },
        { upsert: true }
      );
    } else if (role === "manager") {
      await Manager.findOneAndUpdate(
        { userId },
        {
          $set: {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            contactNumber: formData.get("contactNumber") as string,
            coverColor: formData.get("coverColor") as string || "#064e3b",
            ...(profilePicAction === "remove" ? { profilePicture: "" } : {}),
            ...(profilePicAction === "update" ? { profilePicture: newProfilePicUrl } : {}),
          }
        },
        { upsert: true }
      );
    }

    return { success: "Profilo utente aggiornato con successo!" };
  } catch (error: unknown) {
    console.error("Errore updateUser:", getErrorMessage(error));
    return { error: "Errore imprevisto durante l'aggiornamento." };
  }
}

export async function deleteUsers(userIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "manager") {
    return { error: "Non autorizzato. Solo i manager possono eliminare gli utenti." };
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    let deletedCount = 0;

    for (const id of userIds) {
      if (id === session.user.id) continue;

      await Freelancer.deleteOne({ userId: id });
      await Company.deleteOne({ userId: id });
      await Manager.deleteOne({ userId: id });

      const userQuery: Record<string, unknown> = { $or: [{ id }, { _id: id }, { accountId: id }] };
      const referenceQuery: Record<string, unknown> = { $or: [{ userId: id }] };

      if (mongoose.Types.ObjectId.isValid(id)) {
        (userQuery.$or as Array<unknown>).push({ _id: new mongoose.Types.ObjectId(id) });
        (referenceQuery.$or as Array<unknown>).push({ userId: new mongoose.Types.ObjectId(id) });
      }

      await db.collection("user").deleteOne(userQuery);
      await db.collection("session").deleteMany(referenceQuery);
      await db.collection("account").deleteMany(referenceQuery);

      deletedCount++;
    }

    if (deletedCount === 0) {
      return { error: "Nessun utente eliminato (potresti aver provato a eliminare il tuo account)." };
    }

    return { success: `${deletedCount} ${deletedCount === 1 ? "utente eliminato" : "utenti eliminati"} con successo.` };
  } catch (error: unknown) {
    console.error("Errore deleteUsers:", getErrorMessage(error));
    return { error: "Errore imprevisto durante l'eliminazione." };
  }
}

// --- AZIONI PROGETTI E DASHBOARD ---
export async function fetchProjects() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "manager") {
    return { error: "Non autorizzato. Solo i manager possono visualizzare i progetti." };
  }

  try {
    await connectToDatabase();

    const [projects, companies, freelancers] = await Promise.all([
      InternalProject.find({}).lean(),
      Company.find({}).lean(),
      Freelancer.find({}).lean()
    ]);

    const formattedProjects = projects.map((p: any) => {
      const company = companies.find((c: any) => c.userId === p.companyId);
      const projectFreelancers = freelancers.filter((f: any) => p.freelancersId?.includes(f.userId));

      return {
        id: p._id.toString(),
        title: p.title || "Senza Titolo",
        companyName: company?.name || "Azienda Sconosciuta",
        freelancers: projectFreelancers.map((f: any) => `${f.publicData?.firstName || ""} ${f.publicData?.lastName || ""}`.trim()).filter(Boolean),
        status: p.status || "pending",
        requiredExperienceLevel: p.requiredExperienceLevel || "newbie",
        budget: p.budget?.amount || 0,
      };
    });

    return { success: true, projects: formattedProjects };

  } catch (error: unknown) {
    console.error("Errore fetchProjects:", getErrorMessage(error));
    return { error: "Errore imprevisto durante il caricamento dei progetti." };
  }
}

export async function getEntitiesForProjects() {
  try {
    await connectToDatabase();

    const [companies, freelancers] = await Promise.all([
      Company.find({}).lean(),
      Freelancer.find({}).lean()
    ]);

    return {
      success: true,
      companies: companies.map((c: any) => ({ id: c.userId, name: c.name })),
      freelancers: freelancers.map((f: any) => ({
        id: f.userId,
        name: `${f.publicData?.firstName || ""} ${f.publicData?.lastName || ""}`.trim() || "Senza Nome"
      }))
    };
  } catch (error: unknown) {
    console.error("Errore getEntitiesForProjects:", getErrorMessage(error));
    return { error: "Impossibile caricare le entità associate." };
  }
}

export async function createInternalProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "manager") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();

    const freelancersString = formData.get("freelancersId") as string;
    const freelancersArray = freelancersString ? freelancersString.split(',').map(s => s.trim()).filter(Boolean) : [];

    const newProject = await InternalProject.create({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      companyId: formData.get("companyId") as string,
      freelancersId: freelancersArray,
      status: formData.get("status") as string || "pending",
      requiredExperienceLevel: formData.get("experienceLevel") as string || "newbie",
      proposalDate: formData.get("proposalDate") ? new Date(formData.get("proposalDate") as string) : undefined,
      budget: {
        amount: Number(formData.get("budgetAmount")) || 0,
        currency: formData.get("budgetCurrency") as string || "EUR"
      }
    });

    for (const fId of freelancersArray) {
      sendPushNotification(fId, "freelancer", {
        title: "Nuovo Incarico RAW!",
        body: `Sei stato assegnato al progetto: ${newProject.title}.`,
        url: "/dashboard/freelancer"
      });
    }

    sendPushNotification(newProject.companyId, "company", {
      title: "Progetto Registrato",
      body: `Il progetto ${newProject.title} è stato avviato dai nostri Manager.`,
      url: "/dashboard/company"
    });

    return { success: "Progetto interno creato con successo!" };
  } catch (error: unknown) {
    console.error("Errore createInternalProject:", getErrorMessage(error));
    return { error: "Errore imprevisto durante la creazione del progetto." };
  }
}

export async function fetchFreelancerProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "freelancer") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();
    const projects = await InternalProject.find({ freelancersId: session.user.id }).lean();

    const companyIds = [...new Set(projects.map((p: any) => p.companyId))];
    const companies = await Company.find({ userId: { $in: companyIds } }).lean();

    const allFreelancerIds = [...new Set(projects.flatMap((p: any) => p.freelancersId || []))];
    const allFreelancers = await Freelancer.find({ userId: { $in: allFreelancerIds } }).lean();

    const formattedProjects = projects.map((p: any) => {
      const company = companies.find((c: any) => c.userId === p.companyId);
      const projectFreelancers = allFreelancers.filter((f: any) => p.freelancersId?.includes(f.userId));

      return {
        id: p._id.toString(),
        title: p.title || "Senza Titolo",
        companyName: company?.name || "Azienda Sconosciuta",
        description: p.description || "",
        status: p.status || "pending",
        proposalDate: p.proposalDate ? new Date(p.proposalDate).toLocaleDateString("it-IT") : null,
        acceptanceDate: p.acceptanceDate ? new Date(p.acceptanceDate).toLocaleDateString("it-IT") : null,
        completionDate: p.completionDate ? new Date(p.completionDate).toLocaleDateString("it-IT") : null,
        requiredExperienceLevel: p.requiredExperienceLevel || "newbie",
        budget: p.budget?.amount || 0,
        currency: p.budget?.currency || "EUR",
        collaborators: projectFreelancers.map((f: any) => `${f.publicData?.firstName || ""} ${f.publicData?.lastName || ""}`.trim()).filter(Boolean),
      };
    });

    return { success: true, projects: formattedProjects };
  } catch (error: unknown) {
    console.error("Errore fetchFreelancerProjects:", getErrorMessage(error));
    return { error: "Errore imprevisto durante il caricamento dei progetti." };
  }
}

export async function fetchCompanyProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "company") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();
    const projects = await InternalProject.find({ companyId: session.user.id }).lean();

    const allFreelancerIds = [...new Set(projects.flatMap((p: any) => p.freelancersId || []))];
    const allFreelancers = await Freelancer.find({ userId: { $in: allFreelancerIds } }).lean();

    const formattedProjects = projects.map((p: any) => {
      const projectFreelancers = allFreelancers.filter((f: any) => p.freelancersId?.includes(f.userId));

      return {
        id: p._id.toString(),
        title: p.title || "Senza Titolo",
        description: p.description || "",
        status: p.status || "pending",
        proposalDate: p.proposalDate ? new Date(p.proposalDate).toLocaleDateString("it-IT") : null,
        acceptanceDate: p.acceptanceDate ? new Date(p.acceptanceDate).toLocaleDateString("it-IT") : null,
        completionDate: p.completionDate ? new Date(p.completionDate).toLocaleDateString("it-IT") : null,
        requiredExperienceLevel: p.requiredExperienceLevel || "newbie",
        budget: p.budget?.amount || 0,
        currency: p.budget?.currency || "EUR",
        collaborators: projectFreelancers.map((f: any) => `${f.publicData?.firstName || ""} ${f.publicData?.lastName || ""}`.trim()).filter(Boolean),
        collaboratorsData: projectFreelancers.map((f: any) => {
          const firstName = (f.publicData?.firstName || "").trim();
          const lastName = (f.publicData?.lastName || "").trim();
          const name = `${firstName} ${lastName}`.trim() || "Senza Nome";
          const nameParts = name.split(" ");
          const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() : (nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "?");
          const slug = (firstName || lastName) ? `${firstName}_${lastName}`.toLowerCase().split(' ').join('_') : f.userId;
          return {
            id: slug,
            name: name,
            initials,
            categories: f.publicData?.macroCategories || [],
            availability: f.publicData?.availability?.status || "available",
            experienceLevel: f.publicData?.experienceLevel || "newbie",
            coverColor: f.publicData?.coverColor || "#4f46e5",
            profilePicture: f.publicData?.profilePicture || ""
          };
        })
      };
    });

    return { success: true, projects: formattedProjects };
  } catch (error: unknown) {
    console.error("Errore fetchCompanyProjects:", getErrorMessage(error));
    return { error: "Errore imprevisto durante il caricamento dei progetti." };
  }
}

// --- AZIONI PROFILO E RICERCA ---
export async function getLoggedFreelancerProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "freelancer") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();
    const freelancer = await Freelancer.findOne({ userId: session.user.id }).lean();
    if (!freelancer) return { error: "Accesso negato. Profilo non trovato." };
    return { success: true, profile: JSON.parse(JSON.stringify(freelancer)), user: session.user };
  } catch (error: unknown) {
    console.error("Errore getLoggedFreelancerProfile:", getErrorMessage(error));
    return { error: "Errore durante il caricamento del profilo." };
  }
}

export async function updateLoggedFreelancerProfile(formData: FormData) {
  // 1. Sicurezza: Verifica ruolo utente attivo
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "freelancer") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const fullName = `${firstName} ${lastName}`.trim();

    // Recuperiamo il freelancer corrente per controllare i vecchi file
    const currentFreelancer = await Freelancer.findOne({ userId: session.user.id }).lean() as any;

    // --- GESTIONE FOTO PROFILO ---
    const removeProfilePicture = formData.get("removeProfilePicture") === "true";
    let profilePicAction: "keep" | "remove" | "update" = "keep";
    let newProfilePicUrl = "";
    const profilePicFile = formData.get("profilePicture") as File;

    if (removeProfilePicture) {
      if (currentFreelancer?.publicData?.profilePicture) {
        await deleteOldImageFromR2(currentFreelancer.publicData.profilePicture);
      }
      profilePicAction = "remove";
    } else if (profilePicFile && profilePicFile.size > 0) {
      if (!profilePicFile.type.startsWith("image/")) return { error: "La foto profilo deve essere un'immagine." };
      if (profilePicFile.size > 5 * 1024 * 1024) return { error: "La foto profilo supera i 5MB." };

      const fileBuffer = Buffer.from(await profilePicFile.arrayBuffer());
      const fileExt = profilePicFile.name.split('.').pop() || "jpg";
      const uniqueId = crypto.randomUUID();
      const fileName = `profile-pictures/${session.user.id}/${uniqueId}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: profilePicFile.type
      });
      await s3Client.send(command);
      newProfilePicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

      if (currentFreelancer?.publicData?.profilePicture) {
        await deleteOldImageFromR2(currentFreelancer.publicData.profilePicture);
      }
      profilePicAction = "update";
    }

    // 2. Aggiornamento Core Utente (Better Auth)
    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    const userUpdate: Record<string, string> = { name: fullName };
    if (profilePicAction === "remove") userUpdate.image = "";
    else if (profilePicAction === "update") userUpdate.image = newProfilePicUrl;

    await db.collection("user").updateOne({ id: session.user.id }, { $set: userUpdate });

    // --- GESTIONE UPLOAD CV ---
    let newCvUrl = currentFreelancer?.publicData?.cvUrl || "";
    let newHasCv = currentFreelancer?.hasCv || false;

    const cvFile = formData.get("cvFile") as File;
    if (cvFile && cvFile.size > 0) {
      if (cvFile.type !== "application/pdf") {
        return { error: "Il CV deve essere un file in formato PDF." };
      }
      if (cvFile.size > 5 * 1024 * 1024) {
        return { error: "Il file del CV supera il limite massimo di 5MB." };
      }

      const fileBuffer = Buffer.from(await cvFile.arrayBuffer());
      const uniqueId = crypto.randomUUID();
      const fileName = `cvs/${session.user.id}/${uniqueId}.pdf`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: "application/pdf",
      });

      await s3Client.send(command);
      newCvUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
      newHasCv = true;
    }

    // 3. Aggiornamento Modello Mongoose (Freelancer)
    await Freelancer.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          isFirstAccess: false,
          hasCv: newHasCv,
          "publicData.firstName": firstName,
          "publicData.lastName": lastName,
          "publicData.location": formData.get("location") as string || "",
          "publicData.mainPortfolioUrl": formData.get("mainPortfolioUrl") as string || "",
          "publicData.cvUrl": newCvUrl,
          "publicData.bio": formData.get("bio") as string || "",
          "publicData.coverColor": formData.get("coverColor") as string || "#4f46e5",
          "publicData.macroCategories": (formData.get("macroCategories") as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
          "publicData.experienceLevel": formData.get("experienceLevel") as string || "newbie",
          "publicData.availability.status": formData.get("availabilityStatus") as string || "available",
          ...(profilePicAction === "remove" ? { "publicData.profilePicture": "" } : {}),
          ...(profilePicAction === "update" ? { "publicData.profilePicture": newProfilePicUrl } : {}),
        }
      },
      { upsert: true }
    );

    return { success: "Il tuo profilo è stato aggiornato con successo!" };
  } catch (error: unknown) {
    console.error("Errore updateLoggedFreelancerProfile:", getErrorMessage(error));
    return { error: "Errore durante l'aggiornamento del profilo." };
  }
}

export async function getLoggedCompanyProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "company") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();
    const company = await Company.findOne({ userId: session.user.id }).lean();
    if (!company) return { error: "Accesso negato. Profilo non trovato." };
    return { success: true, profile: JSON.parse(JSON.stringify(company)), user: session.user };
  } catch (error: unknown) {
    console.error("Errore getLoggedCompanyProfile:", getErrorMessage(error));
    return { error: "Errore durante il caricamento del profilo aziendale." };
  }
}

export async function updateLoggedCompanyProfile(formData: FormData) {
  // 1. Sicurezza: Verifica ruolo utente attivo
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "company") return { error: "Non autorizzato." };

  try {
    await connectToDatabase();
    const name = formData.get("name") as string;

    // Recuperiamo l'azienda corrente per i controlli sulle immagini vecchie
    const currentCompany = await Company.findOne({ userId: session.user.id }).lean() as any;

    // --- GESTIONE FOTO PROFILO AZIENDA ---
    const removeProfilePicture = formData.get("removeProfilePicture") === "true";
    let profilePicAction: "keep" | "remove" | "update" = "keep";
    let newProfilePicUrl = "";
    const profilePicFile = formData.get("profilePicture") as File;

    if (removeProfilePicture) {
      if (currentCompany?.profilePicture) {
        await deleteOldImageFromR2(currentCompany.profilePicture);
      }
      profilePicAction = "remove";
    } else if (profilePicFile && profilePicFile.size > 0) {
      if (!profilePicFile.type.startsWith("image/")) return { error: "Il logo deve essere un'immagine." };
      if (profilePicFile.size > 5 * 1024 * 1024) return { error: "Il logo supera i 5MB." };

      const fileBuffer = Buffer.from(await profilePicFile.arrayBuffer());
      const fileExt = profilePicFile.name.split('.').pop() || "jpg";
      const uniqueId = crypto.randomUUID();
      const fileName = `profile-pictures/${session.user.id}/${uniqueId}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: profilePicFile.type
      });
      await s3Client.send(command);
      newProfilePicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

      if (currentCompany?.profilePicture) {
        await deleteOldImageFromR2(currentCompany.profilePicture);
      }
      profilePicAction = "update";
    }

    // 2. Aggiornamento Core Utente (Better Auth)
    const db = mongoose.connection.db;
    if (!db) throw new Error("Connessione al database non disponibile");

    const userUpdate: Record<string, string> = { name };
    if (profilePicAction === "remove") userUpdate.image = "";
    else if (profilePicAction === "update") userUpdate.image = newProfilePicUrl;

    if (name) {
      await db.collection("user").updateOne({ id: session.user.id }, { $set: userUpdate });
    }

    // 3. Aggiornamento Modello Mongoose (Company)
    await Company.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          name: name,
          pIVA: formData.get("pIVA") as string || "",
          industry: formData.get("industry") as string || "",
          description: formData.get("description") as string || "",
          website: formData.get("website") as string || "",
          mainContactEmail: formData.get("mainContactEmail") as string || "",
          coverColor: formData.get("coverColor") as string || "#9333ea",
          ...(profilePicAction === "remove" ? { profilePicture: "" } : {}),
          ...(profilePicAction === "update" ? { profilePicture: newProfilePicUrl } : {}),
        }
      },
      { upsert: true }
    );

    return { success: "Il profilo aziendale è stato aggiornato con successo!" };
  } catch (error: unknown) {
    console.error("Errore updateLoggedCompanyProfile:", getErrorMessage(error));
    return { error: "Errore imprevisto durante l'aggiornamento del profilo aziendale." };
  }
}

export async function getLoggedUserBadgeData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  let coverColor = "#4f46e5";
  let profilePicture = "";
  try {
    await connectToDatabase();
    if (session.user.role === "freelancer") {
      const f = await Freelancer.findOne({ userId: session.user.id }).lean() as any;
      coverColor = f?.publicData?.coverColor || coverColor;
      profilePicture = f?.publicData?.profilePicture || "";
    } else if (session.user.role === "company") {
      const c = await Company.findOne({ userId: session.user.id }).lean() as any;
      coverColor = c?.coverColor || "#9333ea";
      profilePicture = c?.profilePicture || "";
    } else if (session.user.role === "manager") {
      const m = await Manager.findOne({ userId: session.user.id }).lean() as any;
      coverColor = m?.coverColor || "#064e3b";
      profilePicture = m?.profilePicture || "";
    }
  } catch (error) {
    console.error("Errore nel recupero dati badge utente:", error);
  }

  const nameParts = session.user.name ? session.user.name.split(" ") : [];
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "?");

  return {
    role: session.user.role,
    initials,
    coverColor,
    profilePicture: profilePicture || session.user.image || ""
  };
}

export async function searchFreelancers(query: { term?: string; categories?: string[]; experienceLevel?: string }) {
  try {
    await connectToDatabase();

    const searchQuery: Record<string, unknown> = {};

    if (query.term) {
      const regex = new RegExp(query.term, 'i');
      searchQuery.$or = [{ 'publicData.location': regex }];
    }

    if (query.categories && query.categories.length > 0) {
      searchQuery['publicData.macroCategories'] = { $in: query.categories };
    }

    if (query.experienceLevel && query.experienceLevel !== "all") {
      const expLevels = ["newbie", "good", "master"];
      const levelIndex = expLevels.indexOf(query.experienceLevel);
      if (levelIndex !== -1) {
        const allowedLevels = expLevels.slice(levelIndex);
        searchQuery['publicData.experienceLevel'] = { $in: allowedLevels };
      } else {
        searchQuery['publicData.experienceLevel'] = query.experienceLevel;
      }
    }

    const freelancers = await Freelancer.find(searchQuery)
      .select('userId publicData.firstName publicData.lastName publicData.macroCategories publicData.experienceLevel publicData.availability.status publicData.coverColor publicData.profilePicture')
      .limit(20)
      .lean();

    const formattedFreelancers = freelancers.map((f: any) => {
      const name = `${f.publicData.firstName} ${f.publicData.lastName}`;
      const nameParts = name.split(" ");
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : (nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "?");

      const firstName = (f.publicData.firstName || "").trim();
      const lastName = (f.publicData.lastName || "").trim();
      const slug = `${firstName}_${lastName}`.toLowerCase().split(' ').join('_');

      return {
        id: slug,
        actualId: f.userId,
        name: name,
        initials,
        categories: f.publicData.macroCategories,
        availability: f.publicData.availability.status,
        experienceLevel: f.publicData.experienceLevel || "newbie",
        coverColor: f.publicData.coverColor,
        profilePicture: f.publicData.profilePicture,
      }
    });

    return { success: true, freelancers: JSON.parse(JSON.stringify(formattedFreelancers)) };
  } catch (error: unknown) {
    console.error("Errore searchFreelancers:", getErrorMessage(error));
    return { error: "Errore durante la ricerca dei freelancer." };
  }
}

export async function getPublicFreelancerProfile(slugOrId: string) {
  try {
    await connectToDatabase();

    let freelancer = await Freelancer.findOne({ userId: slugOrId }).lean();

    if (!freelancer) {
      freelancer = await Freelancer.findOne({
        $expr: {
          $eq: [
            slugOrId.toLowerCase(),
            {
              $replaceAll: {
                input: {
                  $toLower: {
                    $concat: [
                      { $trim: { input: { $ifNull: ["$publicData.firstName", ""] } } },
                      "_",
                      { $trim: { input: { $ifNull: ["$publicData.lastName", ""] } } }
                    ]
                  }
                },
                find: " ",
                replacement: "_"
              }
            }
          ]
        }
      }).lean();
    }

    if (!freelancer) return { error: "Profilo non trovato." };
    return { success: true, profile: (freelancer as any).publicData };
  } catch (error: unknown) {
    console.error("Errore getPublicFreelancerProfile:", getErrorMessage(error));
    return { error: "Errore durante il caricamento del profilo." };
  }
}
