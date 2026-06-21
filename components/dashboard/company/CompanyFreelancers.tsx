"use client";

import React, { useEffect, useState } from "react";

import { fetchCompanyProjects } from "@/../actions/userActions";
import { Spinner, Chip } from "@heroui/react";
import { Users, Calendar } from "lucide-react";
import Link from "next/link";

type FreelancerData = {
    id: string;
    name: string;
    initials: string;
    categories: string[];
    availability: string;
    experienceLevel: string;
    coverColor: string;
    profilePicture?: string;
};

type Project = {
    id: string;
    title: string;
    status: string;
    proposalDate: string | null;
    collaboratorsData?: FreelancerData[];
};

function FreelancerCard({ freelancer }: { freelancer: FreelancerData }) {
    const getAvailabilityChip = (status: string) => {
        switch (status) {
            case 'available': return <Chip color="success" variant="soft" size="sm">Disponibile</Chip>;
            case 'busy': return <Chip color="warning" variant="soft" size="sm">Occupato</Chip>;
            case 'unavailable': return <Chip color="danger" variant="soft" size="sm">Non Disponibile</Chip>;
            default: return <Chip color="default" variant="soft" size="sm">N/D</Chip>;
        }
    };

    const getExperienceChip = (level: string) => {
        switch (level) {
            case 'newbie': return <Chip color="default" variant="soft" size="sm">Base</Chip>;
            case 'good': return <Chip color="default" variant="soft" size="sm">Intermedio</Chip>;
            case 'master': return <Chip color="default" variant="soft" size="sm">Esperto</Chip>;
            default: return null;
        }
    };

    return (
        <Link href={`/freelancer/${freelancer.id}`}>
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-48 flex flex-col">
                <div className="h-[60%] w-full transition-colors" style={{ backgroundColor: freelancer.coverColor }}>
                    <div
                        className="absolute top-4 left-4 w-12 h-12 rounded-full shadow-md border-2 border-white flex items-center justify-center text-white text-lg font-black select-none overflow-hidden transition-colors"
                        style={{ backgroundColor: freelancer.coverColor }}
                    >
                        {freelancer.profilePicture ? (
                            <img
                                src={freelancer.profilePicture}
                                alt={freelancer.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            freelancer.initials
                        )}
                    </div>
                </div>
                <div className="h-[40%] bg-white p-4 pt-2 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">{freelancer.name}</h3>
                        {getExperienceChip(freelancer.experienceLevel)}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 truncate mr-2">{freelancer.categories.join(', ') || 'Nessuna categoria'}</p>
                        {getAvailabilityChip(freelancer.availability)}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CompanyFreelancers() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetchCompanyProjects();
                if (res.success && res.projects) {
                    setProjects(res.projects);
                }
            } catch (error) {
                console.error("Errore fetchCompanyProjects:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProjects();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "active":
                return { color: "success" as const, label: "In Corso" };
            case "pending":
                return { color: "warning" as const, label: "In Attesa" };
            case "completed":
                return { color: "default" as const, label: "Concluso" };
            default:
                return { color: "default" as const, label: status };
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 w-full animate-in fade-in h-40">
                <Spinner color="current" aria-label="Caricamento freelancer..." />
                <span className="ml-3 text-gray-600 font-medium">Caricamento freelancer in corso...</span>
            </div>
        );
    }

    // Filtriamo i progetti che non hanno freelancer assegnati per non mostrare liste vuote
    const projectsWithFreelancers = projects.filter(p => p.collaboratorsData && p.collaboratorsData.length > 0);

    if (projectsWithFreelancers.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in duration-300">
                <Users className="mx-auto text-gray-300 mb-4" size={64} />
                <h2 className="text-xl font-bold text-gray-700">Nessun Freelancer Assegnato</h2>
                <p className="text-gray-500 mt-2 font-medium">Non è ancora stato assegnato alcun freelancer ai tuoi progetti.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {projectsWithFreelancers.map((project) => {
                const { color, label } = getStatusConfig(project.status);

                return (
                    <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* HEADER PROGETTO */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 font-medium mt-1">
                                    {project.proposalDate ? (
                                        <><Calendar size={14} className="mr-1" /> Proposto il {project.proposalDate}</>
                                    ) : (
                                        <span>Nessuna data di proposta definita</span>
                                    )}
                                </div>
                            </div>
                            <Chip color={color} variant="primary" size="sm" className="font-medium shrink-0">
                                {label}
                            </Chip>
                        </div>

                        {/* GRIGLIA FREELANCER */}
                        <div className="p-6 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {project.collaboratorsData?.map((freelancer) => (
                                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}