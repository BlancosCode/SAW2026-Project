"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { createTemporaryManager } from "../actions/setupActions";

export default function TemporaryManagerButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        setMessage("");
        setIsError(false);

        const res = await createTemporaryManager();

        if (res.error) {
            setMessage(`Avviso: ${res.error}`);
            setIsError(true);
        } else if (res.success) {
            setMessage(`Successo: ${res.success}`);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 border border-white/10 rounded-xl bg-black/50 backdrop-blur-md max-w-md mx-auto my-8">
            <h3 className="text-xl font-bold text-white">Setup Iniziale</h3>
            <p className="text-sm text-gray-400 text-center">
                Crea un account Manager temporaneo per effettuare il primo accesso alla piattaforma.
            </p>

            <Button
                variant="danger"
                onPress={handleCreate}
                isPending={loading}
                className="font-semibold"
            >
                Crea Manager Temporaneo
            </Button>

            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium mt-2 text-center w-full ${isError ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                    {message}
                </div>
            )}
        </div>
    );
}
