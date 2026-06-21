"use client";

import { ToastProvider } from "@heroui/react";
//provider che utilizzano il client inseriti a parte (davano problemi con la libreria next [risoluzione consigliata da gemini attraverso ricerche]) 
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ToastProvider />
            {children}
        </>
    );
}
