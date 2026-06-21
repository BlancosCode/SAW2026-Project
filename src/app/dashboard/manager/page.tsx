// app/dashboard/manager/page.tsx
"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/../lib/auth-client";
import CreateUserForm from "@/../components/dashboard/manager/CreateUserForm";
import UsersTable from "@/../components/dashboard/manager/UsersTable";
import ProjectsTable from "@/../components/dashboard/manager/ProjectTable";
import { Skeleton, Button } from "@heroui/react";
import { ArrowLeft, LogOut } from "lucide-react";
import { getLoggedUserBadgeData } from "@/../actions/userActions";

// --- COMPONENTE HELPER PER LAZY LOADING (INTERSECTION OBSERVER) ---
// Lazy loading gestito tramite richiesta da IA, non sapendo come fare 
function LazyLoad({ children, fallback, minHeight = "300px" }: { children: ReactNode; fallback?: ReactNode; minHeight?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Una volta entrato in visuale, disconnetti l'osservatore
                }
            },
            { rootMargin: "150px" } // Inizia a caricare quando mancano 150px dall'entrata nello schermo
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ minHeight: isVisible ? "auto" : minHeight }}>
            {isVisible ? children : fallback}
        </div>
    );
}

export default function ManagerDashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [coverColor, setCoverColor] = useState("#686868"); // Colore di default pre-caricamento

    // Gestione reindirizzamento in base al ruolo
    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push("/");
            } else {
                const userRole = (session.user as { role?: string }).role;
                if (userRole !== "manager") {
                    router.push(`/dashboard/${userRole}`);
                }
            }
        }
    }, [session, isPending, router]);

    useEffect(() => {
        getLoggedUserBadgeData().then((data) => {
            if (data?.coverColor) setCoverColor(data.coverColor);
        });
    }, []);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => router.push("/"),
            },
        });
    };

    // --- NUOVO CARICAMENTO CON SKELETON HEROUI ---
    // Generati in base alla forma del progetto di base sfruttando i componenti skeleton di heroui
    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-200 p-5">
                <div className="max-w-5xl mx-auto">
                    {/* --- NAVBAR SKELETON --- */}
                    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-2 mb-8 flex justify-start sm:justify-center gap-2 overflow-x-auto sticky top-4 z-20">
                        <Skeleton className="w-28 h-9 rounded-md" />
                        <Skeleton className="w-32 h-9 rounded-md" />
                        <Skeleton className="w-28 h-9 rounded-md" />
                        <Skeleton className="w-32 h-9 rounded-md" />
                        <Skeleton className="w-40 h-9 rounded-md" />
                    </div>

                    {/* --- HEADER SKELETON --- */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center border border-gray-200">
                        <div className="mb-4 md:mb-0 w-full flex flex-col gap-3">
                            <Skeleton className="w-1/2 md:w-1/3 h-8 rounded-lg" />
                            <Skeleton className="w-3/4 md:w-1/2 h-5 rounded-lg" />
                        </div>
                        <Skeleton className="w-full md:w-32 h-10 rounded-lg" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* PANNELLO 1 SKELETON: Progetti Interni */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex flex-col">
                            <div className="flex flex-col items-center gap-2 mb-4 mt-2">
                                <Skeleton className="w-1/2 h-6 rounded-lg" />
                                <Skeleton className="w-4/5 h-4 rounded-lg" />
                            </div>
                            <div className="p-2 mt-4">
                                <Skeleton className="w-full h-[500px] rounded-lg" />
                            </div>
                        </div>

                        {/* PANNELLO 2 SKELETON: Gestione Utenti */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:col-span-1 lg:col-span-2 flex flex-col">
                            <div className="flex flex-col items-center gap-2 mb-4 mt-2">
                                <Skeleton className="w-1/3 h-6 rounded-lg" />
                                <Skeleton className="w-1/2 h-4 rounded-lg" />
                            </div>
                            <div className="p-2">
                                <Skeleton className="w-full h-[400px] rounded-lg" />
                            </div>
                        </div>

                        {/* PANNELLO 3 SKELETON: Eventi e Blog */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
                            <div className="flex flex-col items-center gap-2 mb-4 mt-2">
                                <Skeleton className="w-1/4 h-6 rounded-lg" />
                                <Skeleton className="w-1/3 h-4 rounded-lg" />
                            </div>
                            <div className="p-6 mt-4">
                                <Skeleton className="w-full h-20 rounded-lg" />
                            </div>
                        </div>

                        {/* PANNELLO 4 SKELETON: Database Utenti */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
                            <div className="flex flex-col items-center gap-2 mb-6 mt-2">
                                <Skeleton className="w-1/4 h-6 rounded-lg" />
                                <Skeleton className="w-1/3 h-4 rounded-lg" />
                            </div>
                            <div className="p-4 pt-0">
                                <Skeleton className="w-full h-[500px] rounded-lg" />
                            </div>
                        </div>

                        {/* PANNELLO 5 SKELETON: Reportistica */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
                            <div className="flex flex-col items-center gap-2 mb-4 mt-2">
                                <Skeleton className="w-1/4 h-6 rounded-lg" />
                                <Skeleton className="w-1/3 h-4 rounded-lg" />
                            </div>
                            <div className="p-6 mt-4">
                                <Skeleton className="w-full h-20 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CONTENUTO REALE DELLA PAGINA ---
    return (
        <div className="min-h-screen p-5" style={{ backgroundColor: coverColor + "20", transition: "background-color 0.5s ease" }}>
            <div className="max-w-5xl mx-auto">
                {/* --- NAVBAR ANCORAGGI STICKY --- */}
                <nav className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 p-2 mb-8 flex justify-start sm:justify-center gap-2 overflow-x-auto sticky top-4 z-20 transition-colors duration-500" style={{ borderTop: `4px solid ${coverColor}` }}>
                    <a href="#projects" className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        Progetti Interni
                    </a>
                    <a href="#create-users" className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        Creazione Utenti
                    </a>
                    <a href="#events" className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        Eventi e Blog
                    </a>
                    <a href="#database" className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        Database Utenti
                    </a>
                    <a href="#reports" className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        Report e Statistiche
                    </a>
                </nav>
                {/* --- HEADER DELLA DASHBOARD --- */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center border border-gray-200 transition-colors duration-500" style={{ borderTop: `6px solid ${coverColor}` }}>
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-800">Pannello Manager
                            <span className="text-sm text-gray-400 ml-2">Accesso eseguito come: {session?.user?.email}</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Ciao, <span className="font-semibold text-red-900">{session?.user?.name}</span>
                            ! Qui puoi gestire progetti, utenti, eventi e visualizzare report dettagliati.
                        </p>
                    </div>
                    <Button
                        onPress={handleLogout}
                        className="bg-red-300 text-red-600 hover:bg-red-500 hover:text-white transition-colors duration-200 "
                    >
                        <LogOut className="mr-2" size={18} />
                        Disconnetti
                    </Button>
                    <Button onPress={() => window.location.href = "/"} variant="ghost" className=" bg-gray-600/30 hover:bg-gray-800/40 text-white backdrop-blur-md transition-colors">
                        <ArrowLeft size={16} /> Torna a RAW
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* PANNELLO 1: Progetti Interni */}
                    <div id="projects" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2 animate-in slide-in-from-left-2 duration-200 scroll-mt-24">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 text-center">Progetti Interni</h2>
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                Monitora lo stato, il budget e le scadenze dei progetti assegnati.
                            </p>
                        </div>
                        <div className="p-2 animate-in slide-in-from-top-2 duration-200 mt-4">
                            <LazyLoad fallback={<div className="h-[500px] w-full"><Skeleton className="w-full h-full rounded-lg" /></div>}>
                                <ProjectsTable />
                            </LazyLoad>
                        </div>
                    </div>

                    {/* PANNELLO 2: Gestione Utenti */}
                    <div id="create-users" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2 md:col-span-1 lg:col-span-2 animate-in slide-in-from-right-2 duration-200 scroll-mt-24">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 text-center">Creazione Utenti</h2>
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                Aggiungi nuovi Freelancer, Aziende o altri Manager al database.
                            </p>
                        </div>
                        <div className="p-2">
                            <LazyLoad fallback={<div className="h-[400px] w-full"><Skeleton className="w-full h-full rounded-lg" /></div>}>
                                <CreateUserForm />
                            </LazyLoad>
                        </div>
                    </div>

                    {/* PANNELLO 3: Eventi e Blog */}
                    <div id="events" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden col-span-1 md:col-span-2 lg:col-span-3 p-2 animate-in slide-in-from-top-2 duration-200 scroll-mt-24">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 text-center">Eventi e Blog</h2>
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                Gestisci eventi, pubblica articoli e mantieni aggiornata la community.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 text-center animate-in slide-in-from-top-2 duration-200 mt-4">
                            <p className="text-gray-500 italic">Modulo eventi e blog in arrivo prossimamente...</p>
                        </div>
                    </div>

                    {/* PANNELLO 4: Tabella Database Utenti */}
                    <div id="database" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden col-span-1 md:col-span-2 lg:col-span-3 p-2 animate-in slide-in-from-bottom-2 duration-200 scroll-mt-24">
                        <div className="mt-2 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 text-center">Database Utenti</h2>
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                Cerca e visualizza l&apos;elenco completo di tutti gli utenti di sistema.
                            </p>
                        </div>
                        <div className="p-4 pt-0">
                            <LazyLoad fallback={<div className="h-[500px] w-full"><Skeleton className="w-full h-full rounded-lg" /></div>}>
                                <UsersTable />
                            </LazyLoad>
                        </div>
                    </div>
                    {/* PANNELLO 5: Reportistica */}
                    <div id="reports" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden col-span-1 md:col-span-2 lg:col-span-3 p-2 animate-in slide-in-from-top-2 duration-200 scroll-mt-24">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 text-center">Report e Statistiche</h2>
                            <p className="text-gray-500 text-sm mt-1 text-center">
                                Analizza le performance, i guadagni storici e il volume d&apos;affari.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 text-center animate-in slide-in-from-top-2 duration-200 mt-4">
                            <p className="text-gray-500 italic">Modulo reportistica in arrivo prossimamente...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}