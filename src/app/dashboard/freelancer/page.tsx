"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "@/../lib/auth-client";
import { useRouter } from "next/navigation";

import { Button, Chip, Skeleton, Tabs } from "@heroui/react";
import { MapPin, Link as LinkIcon, DollarSign, Edit2, LogOut, CheckCircle2, FolderKanban, Banknote, CalendarClock, Award, ArrowLeft, Star } from "lucide-react";
import { getLoggedFreelancerProfile } from "@/../actions/userActions";
import EditProfileModal from "@/../components/dashboard/freelancer/EditProfileModal";
import FreelancerProjects from "@/../components/dashboard/freelancer/FreelancerProjects";
import FreelancerPortfolio from "@/../components/dashboard/freelancer/FreelancerPortfolio";

export default function FreelancerDashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Gestione reindirizzamento in base al ruolo
    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push("/");
            } else {
                const userRole = (session.user as { role?: string }).role;
                if (userRole !== "freelancer") {
                    router.push(`/dashboard/${userRole}`);
                }
            }
        }
    }, [session, isPending, router]);

    const loadProfile = async () => {
        setIsLoading(true);
        const res = await getLoggedFreelancerProfile();
        if (res.success) setProfile(res.profile);
        setIsLoading(false);
    };

    useEffect(() => {
        loadProfile();
        window.addEventListener("refreshFreelancerProfile", loadProfile);
        return () => window.removeEventListener("refreshFreelancerProfile", loadProfile);
    }, []);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: { onSuccess: () => router.push("/") },
        });
    };

    if (isLoading || isPending) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="px-6 sm:px-10 pb-8 relative">
                        <Skeleton className="w-32 h-32 rounded-full border-4 border-white -mt-16" />
                        <Skeleton className="h-8 w-1/3 mt-4" />
                        <Skeleton className="h-4 w-1/4 mt-2" />
                        <Skeleton className="h-20 w-full mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    const initials = `${profile?.publicData?.firstName?.[0] || ""}${profile?.publicData?.lastName?.[0] || ""}`.toUpperCase();
    const coverColor = profile?.publicData?.coverColor || "#531d1d";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                <Tabs className="w-full">
                    <Tabs.ListContainer className="mb-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                        <Tabs.List aria-label="Dashboard Freelancer" className="flex gap-4">
                            <Tabs.Tab id="profile" className="text-gray-600 font-semibold px-4 py-2">
                                Il Mio Profilo
                                <Tabs.Indicator className="transition-colors duration-500" style={{ backgroundColor: coverColor }} />
                            </Tabs.Tab>
                            <Tabs.Tab id="portfolio" className="text-gray-600 font-semibold px-4 py-2">
                                Portfolio
                                <Tabs.Indicator className="transition-colors duration-500" style={{ backgroundColor: coverColor }} />
                            </Tabs.Tab>
                            <Tabs.Tab id="projects" className="text-gray-600 font-semibold px-4 py-2">
                                Progetti e Incarichi
                                <Tabs.Indicator className="transition-colors duration-500" style={{ backgroundColor: coverColor }} />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>

                    <Tabs.Panel id="profile">
                        {/* COVER E HEADER DEL PROFILO */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 animate-in fade-in duration-300">
                            <div className="h-48 relative transition-colors duration-500" style={{ backgroundColor: coverColor }}>
                                <Button onPress={handleLogout} variant="ghost" className="absolute top-4 right-4 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors">
                                    <LogOut size={16} /> Esci
                                </Button>
                                <Button onPress={() => window.location.href = "/"} variant="ghost" className="absolute top-4 left-4 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors">
                                    <ArrowLeft size={16} /> Torna a RAW
                                </Button>
                            </div>
                            <div className="px-6 sm:px-10 pb-8 relative">
                                <div className="flex justify-between items-end">
                                    <div className="relative -mt-16 border-4 border-white rounded-full h-32 w-32 flex items-center justify-center text-4xl font-black text-white shadow-md z-10 select-none overflow-hidden transition-colors duration-500" style={{ backgroundColor: coverColor }}>
                                        {profile?.publicData?.profilePicture ? (
                                            <img
                                                src={profile.publicData.profilePicture}
                                                alt="Profilo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            initials || "?"
                                        )}
                                    </div>
                                    <Button className="bg-gray-900 hover:bg-blue-700 text-white shadow-sm mt-4 transition-colors font-medium" onPress={() => setIsEditModalOpen(true)}>
                                        <Edit2 size={16} /> Modifica Profilo
                                    </Button>
                                </div>

                                {/* INFO TESTUALI */}
                                <div className="mt-4">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                        {profile?.publicData?.firstName} {profile?.publicData?.lastName}
                                    </h1>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {profile?.publicData?.macroCategories?.map((cat: string) => (
                                        <Chip key={cat} variant="soft" color="default" size="sm" className="font-medium px-1">{cat}</Chip>
                                    ))}
                                </div>

                                <p className="mt-6 mb-4 text-gray-700 leading-relaxed max-w-3xl whitespace-pre-wrap">
                                    {profile?.publicData?.bio || "Nessuna biografia inserita. Clicca su \u0027Modifica Profilo\u0027 per far sapere agli altri di cosa ti occupi."}
                                </p>

                                {/* GRIGLIA DETTAGLI E DISPONIBILITÀ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 text-gray-600 group">
                                        <div className="bg-gray-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-50 transition-colors"><MapPin size={22} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sede Operativa</p>
                                            <p className="font-semibold text-gray-800">{profile?.publicData?.location || "Non specificata"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-gray-600 group">
                                        <div className="bg-gray-50 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-50 transition-colors"><LinkIcon size={22} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Portfolio Principale</p>
                                            {profile?.publicData?.mainPortfolioUrl ? (
                                                <a href={profile.publicData.mainPortfolioUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline hover:text-blue-800 transition-colors">Visita il sito web</a>
                                            ) : (
                                                <p className="font-semibold text-gray-800">Non inserito</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-gray-600 group">
                                        <div className="bg-gray-50 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-50 transition-colors"><CheckCircle2 size={22} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Stato Attuale</p>
                                            <p className="font-semibold text-gray-800 capitalize">{profile?.publicData?.availability?.status || "available"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-gray-600 group">
                                        <div className="bg-gray-50 p-3 rounded-full text-amber-500 group-hover:bg-amber-50 transition-colors"><Star size={22} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Livello di Esperienza</p>
                                            <p className="font-semibold text-gray-800">
                                                {profile?.publicData?.experienceLevel === "newbie" ? "Base" : profile?.publicData?.experienceLevel === "good" ? "Intermedio" : profile?.publicData?.experienceLevel === "master" ? "Esperto" : "Base"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel id="portfolio">
                        <FreelancerPortfolio projects={profile?.publicData?.portfolioProjects || []} />
                    </Tabs.Panel>
                    <Tabs.Panel id="projects">
                        <FreelancerProjects />
                    </Tabs.Panel>
                </Tabs>
            </div>

            <EditProfileModal
                profile={profile}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
}