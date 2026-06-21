import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/../lib/auth";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
    // Fa solo un check sulla sessione, i reindirizzamenti vengono gestiti direttamente dalle singole pagine che vogliamo proteggere, 
    // come consigliato da documentazione di better auth.
    // seguito nell'esecuzione da gemini per la risoluzione consigliata da better auth
}

export const config = {
    matcher: ["/dashboard"],
    //Proxy attivo solo nella route /dashboard, che é quella che richiede protezione tramite better auth
};