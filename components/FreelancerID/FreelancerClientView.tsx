"use client";

import { Chip, Button, Card, CardHeader } from "@heroui/react";
import { MapPin, Link as LinkIcon, CheckCircle2, Star, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";


// Tipizzazione consigliata da gemini per evitare l'utilizzo di any, più conforme a TypeScript
export interface PortfolioProject {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
    imageKey?: string;
    createdAt?: Date | string;
}

export interface FreelancerPublicProfile {
    firstName: string;
    lastName: string;
    bio?: string;
    location?: string;
    mainPortfolioUrl?: string;
    cvUrl?: string;
    profilePicture?: string;
    coverColor?: string;
    macroCategories: string[];
    experienceLevel: "newbie" | "good" | "master";
    availability: {
        status: "available" | "busy" | "unavailable";
    };
    portfolioProjects: PortfolioProject[];
}

export function FreelancerClientView({ profile }: { profile: FreelancerPublicProfile }) {
    // Calcolo sicuro delle iniziali
    const initials = `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase();
    const coverColor = profile.coverColor || "#4f46e5";

    // Mappatura leggibile per il livello di esperienza
    const experienceLabels = {
        newbie: "Base",
        good: "Intermedio",
        master: "Esperto"
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">

                    {/* HEADER COLORATO CON PULSANTE BACK */}
                    <div className="h-48 relative transition-colors duration-500" style={{ backgroundColor: coverColor }}>
                        <Link href="/" passHref>
                            <Button variant="ghost" className="absolute top-4 left-4 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors">
                                <ArrowLeft size={16} /> Torna alla Home
                            </Button>
                        </Link>
                    </div>

                    <div className="px-6 sm:px-10 pb-8 relative">
                        {/* FOTO PROFILO / INIZIALI */}
                        <div className="flex justify-between items-end">
                            <div
                                className="-mt-16 border-4 border-white rounded-full h-32 w-32 flex items-center justify-center text-4xl font-black text-white shadow-md z-10 select-none overflow-hidden relative transition-colors duration-500"
                                style={{ backgroundColor: coverColor }}
                            >
                                {profile.profilePicture ? (
                                    <img
                                        src={profile.profilePicture}
                                        alt={`Profilo di ${profile.firstName} ${profile.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    initials || "?"
                                )}
                            </div>
                        </div>

                        {/* INFO TESTUALI */}
                        <div className="mt-4">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {profile.firstName} {profile.lastName}
                            </h1>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {profile.macroCategories?.map((cat: string) => (
                                <Chip key={cat} variant="primary" color="default" size="sm" className="font-medium px-1">
                                    {cat}
                                </Chip>
                            ))}
                        </div>

                        <p className="mt-6 text-gray-700 leading-relaxed max-w-3xl whitespace-pre-wrap">
                            {profile.bio || "Nessuna biografia inserita."}
                        </p>

                        {/* GRIGLIA DETTAGLI E DISPONIBILITÀ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-4 text-gray-600 group">
                                <div className="bg-gray-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-50 transition-colors">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sede Operativa</p>
                                    <p className="font-semibold text-gray-800">{profile.location || "Non specificata"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600 group">
                                <div className="bg-gray-50 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                    <LinkIcon size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Portfolio Principale</p>
                                    {profile.mainPortfolioUrl ? (
                                        <a href={profile.mainPortfolioUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                                            Visita il sito web
                                        </a>
                                    ) : (
                                        <p className="font-semibold text-gray-800">Non inserito</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600 group">
                                <div className="bg-gray-50 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                                    <CheckCircle2 size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Stato Attuale</p>
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {profile.availability?.status || "Disponibile"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600 group">
                                <div className="bg-gray-50 p-3 rounded-full text-amber-500 group-hover:bg-amber-50 transition-colors">
                                    <Star size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Livello di Esperienza</p>
                                    <p className="font-semibold text-gray-800">
                                        {experienceLabels[profile.experienceLevel] || "Base"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SEZIONE PORTFOLIO */}
                        <div className="mt-12 border-t border-gray-100 pt-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Portfolio
                            </h2>

                            {!profile.portfolioProjects || profile.portfolioProjects.length === 0 ? (
                                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                                    <h3 className="text-lg font-bold text-gray-600">Nessun progetto</h3>
                                    <p className="text-gray-500 mt-1">Questo freelancer non ha ancora aggiunto progetti al suo portfolio.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profile.portfolioProjects.map((project: PortfolioProject, index: number) => (
                                        // Usiamo fallback sull'index se l'ID non fosse presente nei vecchi dati
                                        <Card key={project._id || project.id || index} className="border border-gray-200 shadow-sm overflow-hidden group">
                                            <div className="h-48 w-full relative overflow-hidden bg-gray-100 block">
                                                {project.imageUrl && (
                                                    <a href={project.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 w-full h-full z-10">
                                                        <img
                                                            src={project.imageUrl}
                                                            alt={project.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </a>
                                                )}
                                            </div>
                                            <CardHeader className="flex flex-col items-start px-5 pt-5 pb-0">
                                                <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{project.title}</h4>
                                            </CardHeader>
                                            <div className="px-5 py-3">
                                                <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}