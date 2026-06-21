"use client";

import { useState, Suspense } from "react";
import { Button } from "@heroui/react";
import { authClient } from "@/../lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, CheckCircle2 } from "lucide-react";
//generato interamente con gemini e controllato punto per punto


function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Estraiamo il token. Se è nullo, lo gestiamo prima di renderizzare il form.
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Gestione Errore 1: Nessun token fornito nell'URL
    if (!token) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
                <h1 className="text-2xl font-black text-gray-900 mb-2">Link Non Valido</h1>
                <p className="text-gray-600 mb-6 font-medium">Il link per il reset della password è mancante o potrebbe essere scaduto.</p>
                <Button onPress={() => router.push("/")} className="w-full bg-gray-900 text-white rounded-full font-bold">
                    Torna alla Home
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        // Estrazione dati tramite FormData (Best Practice Uncontrolled Forms)
        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validazione Client-Side
        if (password !== confirmPassword) {
            setError("Le password inserite non coincidono.");
            setLoading(false);
            return;
        }

        // Chiamata al server (Estraiamo solo 'error', risolvendo il warning del linter)
        const { error: resetError } = await authClient.resetPassword({
            newPassword: password,
            token,
        });

        setLoading(false);

        if (resetError) {
            setError(resetError.message || "Si è verificato un errore durante l'aggiornamento.");
        } else {
            setMessage("La tua password è stata aggiornata con successo! Reindirizzamento in corso...");
            // Reindirizzamento morbido alla home page dopo il successo
            setTimeout(() => {
                router.push("/");
            }, 3000);
        }
    };

    // UI di Successo (Sostituisce il form)
    if (message) {
        return (
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                <h1 className="text-2xl font-black text-gray-900 mb-2">Fatto!</h1>
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-6 h-6 text-red-900" />
                <h1 className="text-2xl font-black text-gray-900">Nuova Password</h1>
            </div>
            <p className="text-gray-600 mb-8 text-sm font-medium">
                Scegli una password sicura di almeno 8 caratteri per proteggere il tuo account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nuova Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Conferma Password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                <Button
                    isPending={loading}
                    type="submit"
                    className="w-full bg-red-900 hover:bg-red-950 text-white rounded-xl py-6 font-bold mt-4 shadow-md transition-colors"
                >
                    Reimposta Password
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            {/* Il Suspense previene il de-opt in client-side rendering durante la build
        e fornisce un fallback visivo elegante mentre Next.js estrae l'URL.
      */}
            <Suspense fallback={
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
                    <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Verifica del link in corso...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}