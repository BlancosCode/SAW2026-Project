"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardFooter, Chip, Spinner, Modal } from "@heroui/react";
import { FolderKanban, Calendar, Building2 } from "lucide-react";
import { fetchFreelancerProjects } from "@/../actions/userActions";
import PushNotificationManager from "../../PushNotificationManager";

type Project = {
    id: string;
    title: string;
    companyName: string;
    description: string;
    status: string;
    proposalDate: string | null;
    acceptanceDate?: string | null;
    completionDate?: string | null;
    requiredExperienceLevel?: string;
    budget?: number;
    currency?: string;
    collaborators?: string[];
};

export default function FreelancerProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetchFreelancerProjects();
                if (res.success && res.projects) {
                    setProjects(res.projects);
                }
            } catch (error) {
                console.error("Errore fetchFreelancerProjects:", error);
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
                <Spinner color="current" aria-label="Caricamento progetti..." />
                <span className="ml-3 text-gray-600 font-medium">Caricamento progetti in corso...</span>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in duration-300">
                <FolderKanban className="mx-auto text-gray-300 mb-4" size={64} />
                <h2 className="text-xl font-bold text-gray-700">Nessun Progetto Assegnato</h2>
                <p className="text-gray-500 mt-2 font-medium">Al momento non ci sono progetti assegnati al tuo account.</p>
            </div>
        );
    }

    return (
        <>
            <PushNotificationManager />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 mt-6">

                {projects.map((project) => {
                    const { color, label } = getStatusConfig(project.status);
                    return (
                        <button key={project.id} onClick={() => setSelectedProject(project)} className="w-full text-left">
                            <Card
                                className="border border-gray-200 shadow-sm w-full text-left"
                            >
                                <CardHeader className="flex justify-between items-start pt-5 px-6">
                                    <div className="flex flex-col gap-1 w-2/3">
                                        <h3 className="text-lg font-bold text-gray-900 truncate" title={project.title}>{project.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 font-medium truncate" title={project.companyName}>
                                            <Building2 size={14} className="mr-1 min-w-[14px]" />
                                            {project.companyName}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                                        <Chip color={color} variant="primary" size="sm" className="font-medium">
                                            {label}
                                        </Chip>
                                        <Chip
                                            color="default"
                                            variant="soft"
                                            size="sm"
                                        >
                                            {project.requiredExperienceLevel === "master" ? "Esperto" : project.requiredExperienceLevel === "good" ? "Intermedio" : "Base"}
                                        </Chip>
                                    </div>
                                </CardHeader>

                                <div className="px-6 py-4 w-full">
                                    <p className="text-gray-600 text-sm line-clamp-3 text-left">
                                        {project.description || "Nessuna descrizione fornita per questo progetto."}
                                    </p>
                                </div>

                                <CardFooter className="px-6 py-3 bg-gray-50 flex justify-between items-center text-xs text-gray-500 font-medium">
                                    {project.proposalDate ? (
                                        <div className="flex items-center gap-1"><Calendar size={14} /> Proposto il {project.proposalDate}</div>
                                    ) : (<span>Nessuna data di proposta definita</span>)}
                                </CardFooter>
                            </Card>
                        </button>
                    );
                })}
            </div>

            {/* MODALE DETTAGLI PROGETTO */}
            <Modal
                isOpen={!!selectedProject}
                onOpenChange={(open) => !open && setSelectedProject(null)}
            >
                <Modal.Backdrop variant="blur">
                    <Modal.Container>
                        <Modal.Dialog className="sm:max-w-[550px]">
                            <Modal.Header className="border-b border-gray-100 flex flex-col gap-1 pb-4">
                                <Modal.Heading className="text-gray-800 font-bold text-lg">Dettagli Progetto</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body className="py-6">
                                {selectedProject && (
                                    <div className="flex flex-col gap-6">

                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Titolo Progetto</p>
                                                <h2 className="text-xl font-bold text-gray-900">{selectedProject.title}</h2>
                                                <p className="text-sm text-gray-600 mt-1 font-medium">{selectedProject.companyName}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 mt-1">
                                                <Chip color={getStatusConfig(selectedProject.status).color} variant="primary" size="md" className="font-medium">
                                                    {getStatusConfig(selectedProject.status).label}
                                                </Chip>
                                                <Chip
                                                    color="default"
                                                    variant="soft"
                                                    size="sm"
                                                >
                                                    Richiesto: {selectedProject.requiredExperienceLevel === "master" ? "Esperto" : selectedProject.requiredExperienceLevel === "good" ? "Intermedio" : "Base"}
                                                </Chip>
                                            </div>
                                        </div>

                                        {/* GUADAGNO E DATE */}
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Compenso Stimato</p>
                                                <p className="text-xl font-bold text-emerald-600">
                                                    {selectedProject.budget && selectedProject.budget > 0
                                                        ? `${(selectedProject.budget * 0.8 / (selectedProject.collaborators?.length || 1)).toLocaleString('it-IT')} ${selectedProject.currency}`
                                                        : "Da definire"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Calcolato sull&apos;80% del budget totale{selectedProject.collaborators && selectedProject.collaborators.length > 1 ? ` diviso equamente per i ${selectedProject.collaborators.length} collaboratori` : ""}.
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {selectedProject.proposalDate && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Proposto il</p>
                                                        <p className="text-sm font-medium text-gray-800">{selectedProject.proposalDate}</p>
                                                    </div>
                                                )}
                                                {selectedProject.acceptanceDate && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accettato il</p>
                                                        <p className="text-sm font-medium text-gray-800">{selectedProject.acceptanceDate}</p>
                                                    </div>
                                                )}
                                                {selectedProject.completionDate && (
                                                    <div className="flex justify-between">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Concluso il</p>
                                                        <p className="text-sm font-medium text-gray-800">{selectedProject.completionDate}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* TEAM DI LAVORO */}
                                        {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Team di Lavoro ({selectedProject.collaborators.length})</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProject.collaborators.map((name, i) => (
                                                        <Chip key={i} variant="primary" color="default" className="text-gray-700 font-medium bg-gray-100 border border-gray-200">
                                                            {name}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrizione Completa</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedProject.description || "Nessuna descrizione fornita."}</p>
                                        </div>

                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer className="border-t border-gray-100">
                                <p className="text-sm text-gray-400 w-full text-center">
                                    Clicca fuori dalla finestra per chiudere.
                                </p>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}