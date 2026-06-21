"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Bell, BellOff, Info } from "lucide-react";
import { savePushSubscription, deletePushSubscription } from "@/../actions/pushActions";

// La gestione delle notifiche, come gia detto, é stata implementata con Gemini 
// Utility per convertire la chiave VAPID pubblica per la registrazione nativa
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function checkSubscription() {
            // 1. Controlliamo se il browser supporta le notifiche e i Service Worker
            if ("serviceWorker" in navigator && "PushManager" in window) {
                setIsSupported(true);
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    if (subscription) {
                        setIsSubscribed(true);
                    }
                } catch (e) {
                    console.error("Errore nel controllo della sottoscrizione", e);
                }
            }
        }
        checkSubscription();

        // 2. UX: Controlliamo se l'app è installata (PWA) usando le CSS Media Queries lato JS
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsStandalone(true);
        }
    }, []);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const registration = await navigator.serviceWorker.ready;
                const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicVapidKey) throw new Error("VAPID key pubblica mancante.");

                // Registra il dispositivo nei server push del browser
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });

                // Salva la credenziale generata su MongoDB tramite la nostra Server Action
                const res = await savePushSubscription(JSON.parse(JSON.stringify(subscription)));
                if (res.success) setIsSubscribed(true);
            }
        } catch (error: unknown) {
            console.error("Errore durante l'iscrizione alle notifiche:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe(); // Rimuoviamo il permesso locale nel browser
                const res = await deletePushSubscription(subscription.endpoint); // Lo togliamo dal Database
                if (res.success) setIsSubscribed(false);
            }
        } catch (error: unknown) {
            console.error("Errore durante la disattivazione delle notifiche:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) return null; // Non renderizzare niente su browser non supportati

    return (
        // Risolto il bug dell'altezza fissa (h-24) sostituendola con un padding (p-4 md:p-6)
        <div className="bg-white max-w-4xl mx-auto mt-8 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 w-full transition-all">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`p-3 rounded-full shrink-0 transition-colors ${isSubscribed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
                </div>
                <div className="flex flex-col">
                    <p className="font-bold text-gray-900">Notifiche Push</p>
                    <p className="text-sm text-gray-500 leading-tight mt-1">
                        {isSubscribed
                            ? "Il tuo dispositivo riceverà aggiornamenti in tempo reale."
                            : "Attiva per ricevere aggiornamenti sui tuoi progetti in background."}
                    </p>
                    {!isStandalone && !isSubscribed && (
                        <p className="text-xs text-red-900 font-semibold mt-2 flex items-center gap-1">
                            <Info size={14} /> Suggerimento: Installa l&apos;App per un&apos;esperienza migliore!
                        </p>
                    )}
                </div>
            </div>

            <Button
                isDisabled={isLoading}
                isPending={isLoading}
                onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
                className={`w-full md:w-auto font-bold px-6 py-2 shadow-sm shrink-0 transition-colors ${isSubscribed ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
            >
                {isSubscribed ? "Disattiva Notifiche" : "Attiva Ora"}
            </Button>
        </div>
    );
}