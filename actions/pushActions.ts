"use server";

import { auth } from "@/../lib/auth";
import { headers } from "next/headers";
import { connectToDatabase } from "@/../lib/mongodb";
import Freelancer from "@/../models/Freelancer";
import Company from "@/../models/Company";
import Manager from "@/../models/Manager";
import webpush, { WebPushError } from "web-push";

//come worker la gestione delle notifiche push della PWA é stata gestita da Gemini 

// 1. Tipizzazione Rigorosa della Sottoscrizione W3C
export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

const vapidEmail = process.env.VAPID_EMAIL || "mailto:info@rawtalent.it";
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Fail-Fast discreto: non crashiamo l'app, ma avvisiamo nei log
if (publicKey && privateKey) {
    webpush.setVapidDetails(vapidEmail, publicKey, privateKey);
} else {
    console.warn("Chiavi VAPID mancanti. Le notifiche Push non funzioneranno.");
}

// Helper per tipizzare gli errori
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

// Helper per selezionare il modello corretto
function getModelByRole(role: string) {
    if (role === "freelancer") return Freelancer;
    if (role === "company") return Company;
    if (role === "admin" || role === "manager") return Manager;
    return null;
}

export async function savePushSubscription(subscription: PushSubscription) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Non autorizzato." };

    try {
        await connectToDatabase();
        const model = getModelByRole(session.user.role);
        if (!model) return { error: "Ruolo non riconosciuto." };

        // Rimuoviamo eventuali sottoscrizioni identiche per evitare duplicati
        await model.updateOne(
            { userId: session.user.id },
            { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
        );

        // Aggiungiamo la nuova sottoscrizione del dispositivo
        await model.updateOne(
            { userId: session.user.id },
            { $push: { pushSubscriptions: subscription } }
        );

        return { success: true };
    } catch (error: unknown) {
        console.error("Errore salvataggio sottoscrizione push:", getErrorMessage(error));
        return { error: "Impossibile salvare la sottoscrizione." };
    }
}

export async function deletePushSubscription(endpoint: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Non autorizzato." };

    try {
        await connectToDatabase();
        const model = getModelByRole(session.user.role);
        if (!model) return { error: "Ruolo non riconosciuto." };

        await model.updateOne(
            { userId: session.user.id },
            { $pull: { pushSubscriptions: { endpoint } } }
        );

        return { success: true };
    } catch (error: unknown) {
        console.error("Errore rimozione sottoscrizione push:", getErrorMessage(error));
        return { error: "Impossibile rimuovere la sottoscrizione." };
    }
}

export async function sendPushNotification(
    userId: string,
    role: string,
    payload: { title: string; body: string; url?: string }
) {
    if (!publicKey || !privateKey) {
        return { error: "Sistema di notifiche non configurato sul server." };
    }

    try {
        await connectToDatabase();

        const model = getModelByRole(role);
        if (!model) return { error: "Ruolo non riconosciuto per l'invio." };

        const userRecord = await model.findOne({ userId }).lean() as any;

        if (!userRecord || !userRecord.pushSubscriptions || userRecord.pushSubscriptions.length === 0) {
            return { error: "L'utente non ha dispositivi registrati per le notifiche." };
        }

        const notificationPayload = JSON.stringify(payload);

        // Invia la notifica in parallelo e intercetta le eccezioni dei dispositivi morti
        const sendPromises = userRecord.pushSubscriptions.map(async (sub: PushSubscription) => {
            try {
                await webpush.sendNotification(sub, notificationPayload);
            } catch (err: unknown) {
                if (err instanceof WebPushError) {
                    // 404 Not Found o 410 Gone significano che il dispositivo non è più raggiungibile
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        console.log(`Dispositivo inattivo rilevato. Rimozione endpoint: ${sub.endpoint}`);
                        await model.updateOne(
                            { userId },
                            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                        );
                    } else {
                        console.error("Errore invio Web Push (StatusCode:", err.statusCode, ")", err.message);
                    }
                } else {
                    console.error("Errore sconosciuto invio notifica:", getErrorMessage(err));
                }
            }
        });

        await Promise.all(sendPromises);
        return { success: true };
    } catch (error: unknown) {
        console.error("Errore invio notifica push:", getErrorMessage(error));
        return { error: "Errore durante l'invio della notifica." };
    }
}