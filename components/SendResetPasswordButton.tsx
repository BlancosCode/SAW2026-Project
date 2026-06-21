"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { authClient } from "@/../lib/auth-client";
import { Mail, CheckCircle2 } from "lucide-react";


//La gestione del reset password, se pur simulata in questo progetto, funziona, ma ;e stata implementata sotto costante appoggio di gemini
export function SendResetPasswordButton() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Estraiamo la sessione per sapere a chi inviare il reset
    const { data: session } = authClient.useSession();

    const handleSendResetEmail = async () => {
        if (!session?.user?.email) {
            console.error("Errore: Utente non loggato o email mancante.");
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const { error } = await authClient.requestPasswordReset({
                email: session.user.email,
                // Il redirectTo dice a Better Auth come costruire il link da stampare nel terminale
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                console.error("Errore durante la generazione del reset: " + error.message);
            } else {
                console.log("Richiesta di reset generata per: " + session.user.email);
                console.log("Controlla il terminale del server per il link!");
                setSuccess(true);

                // Resetta il bottone dopo 5 secondi
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error("Errore imprevisto nel bottone di reset:", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            isPending={loading}
            onPress={handleSendResetEmail}
            className={`text-white font-medium shadow-sm hover:cursor-pointer rounded-full py-2 px-4 mt-4 mb-4 transition-colors ${success ? "bg-green-600 hover:bg-green-700" : "bg-red-900 hover:bg-red-700"
                }`}
        >
            {success ? (
                <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Link generato nel Server!
                </>
            ) : (
                <>
                    <Mail className="w-4 h-4 mr-2" /> Reimposta Password
                </>
            )}
        </Button>
    );
}