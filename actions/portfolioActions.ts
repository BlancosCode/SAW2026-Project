"use server";

import { auth } from "@/../lib/auth";
import { headers } from "next/headers";
import { connectToDatabase } from "@/../lib/mongodb";
import Freelancer from "@/../models/Freelancer";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, R2_BUCKET_NAME } from "@/../lib/s3";
import crypto from "crypto";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export async function addPortfolioProject(formData: FormData) {
    // 1. Sicurezza: Controllo sessione e ruolo
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "freelancer") return { error: "Non autorizzato." };

    try {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const file = formData.get("image") as File;

        // 2. Validazione Dati in ingresso (Server-Side)
        if (!title || !title.trim()) {
            return { error: "Il titolo del progetto è obbligatorio." };
        }

        if (!file || file.size === 0) {
            return { error: "Immagine obbligatoria." };
        }

        if (file.size > 5 * 1024 * 1024) {
            return { error: "L'immagine supera il limite di 5MB." };
        }

        // 3. Sicurezza: Controllo che sia effettivamente un'immagine
        if (!file.type.startsWith("image/")) {
            return { error: "Il file caricato non è un formato immagine valido." };
        }

        // 4. Regola di Business: Limite massimo 5 progetti
        await connectToDatabase();
        const freelancer = await Freelancer.findOne({ userId: session.user.id }).lean() as any;

        const currentProjectsCount = freelancer?.publicData?.portfolioProjects?.length || 0;
        if (currentProjectsCount >= 5) {
            return { error: "Hai raggiunto il limite massimo di 5 progetti nel portfolio." };
        }

        // La gestione dello storage R2 e quindi salvataggio immagini e file é stata implementata con Gemini
        // 5. Upload su Cloudflare R2
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split('.').pop() || "jpg";
        const uniqueId = crypto.randomUUID();
        const fileName = `portfolio/${session.user.id}/${uniqueId}.${fileExt}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // Costruzione dell'URL pubblico fornito da R2
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

        // 6. Aggiornamento Array in MongoDB
        await Freelancer.findOneAndUpdate(
            { userId: session.user.id },
            {
                $push: {
                    "publicData.portfolioProjects": {
                        id: uniqueId,
                        title: title.trim(),
                        description: description?.trim() || "",
                        imageUrl: publicUrl,
                        imageKey: fileName,
                        createdAt: new Date()
                    }
                }
            }
        );

        return { success: "Progetto aggiunto al portfolio!" };
    } catch (error: unknown) {
        console.error("Errore addPortfolioProject:", getErrorMessage(error));
        return { error: "Errore imprevisto durante il caricamento del progetto." };
    }
}

export async function deletePortfolioProject(projectId: string, imageKey: string) {
    // 1. Sicurezza: Controllo Autorizzazione
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "freelancer") return { error: "Non autorizzato." };

    try {
        // 2. Operazione S3: Elimina fisicamente il file dallo storage R2
        if (imageKey) {
            const command = new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: imageKey,
            });
            await s3Client.send(command);
        }

        // 3. Operazione DB: Rimuovi l'oggetto dall'array di Mongoose
        await connectToDatabase();
        await Freelancer.findOneAndUpdate(
            { userId: session.user.id },
            {
                $pull: {
                    "publicData.portfolioProjects": { id: projectId }
                }
            }
        );

        return { success: "Progetto eliminato con successo!" };
    } catch (error: unknown) {
        console.error("Errore deletePortfolioProject:", getErrorMessage(error));
        return { error: "Errore imprevisto durante l'eliminazione del progetto." };
    }
}