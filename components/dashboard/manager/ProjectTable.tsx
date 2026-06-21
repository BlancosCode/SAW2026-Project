"use client";

import type { SortDescriptor, Key } from "@heroui/react";
import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Chip,
    Spinner,
    SearchField,
    Modal,
    EmptyState,
    Button
} from "@heroui/react";
import { Inbox, Plus } from "lucide-react";
import { fetchProjects } from "@/../actions/userActions";
import CreateProjectModal from "./CreateProjectModal";

type Project = {
    id: string;
    title: string;
    companyName: string;
    freelancers: string[];
    status: string;
    requiredExperienceLevel?: string;
    budget: number;
};

export default function ProjectsTable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "title",
        direction: "ascending",
    });
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetchProjects();
                if (res.success && res.projects) {
                    setProjects(res.projects);
                }
            } catch (error: unknown) {
                console.error("Errore fetchProjects:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadProjects();

        // Ascoltatore globale per ricaricare la tabella dopo la creazione di un progetto
        // implementato completamente da gemini per permettere che la tabella si aggiorni subito 
        // dopo la creazione di un nuovo progetto
        window.addEventListener("refreshProjectsTable", loadProjects);
        return () => window.removeEventListener("refreshProjectsTable", loadProjects);
    }, []);

    const hasSearchFilter = Boolean(filterValue);

    // 1. Filtraggio Memorizzato richiesto ma gestito da IA
    const filteredItems = useMemo(() => {
        let filteredProjects = [...projects];
        if (hasSearchFilter) {
            filteredProjects = filteredProjects.filter((project) =>
                project.title.toLowerCase().includes(filterValue.toLowerCase()) ||
                project.companyName.toLowerCase().includes(filterValue.toLowerCase()) ||
                project.freelancers.some(f => f.toLowerCase().includes(filterValue.toLowerCase()))
            );
        }
        return filteredProjects;
    }, [projects, filterValue]);

    // 2. Ordinamento Memoizzato con Custom Logic per "Completati"
    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            // UX Excellence: I progetti completati rimangono sempre in fondo
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;

            const col = sortDescriptor.column as keyof Project;
            let cmp = 0;

            if (col === "budget") {
                cmp = (a.budget || 0) < (b.budget || 0) ? -1 : ((a.budget || 0) > (b.budget || 0) ? 1 : 0);
            } else {
                const first = String(a[col] || "");
                const second = String(b[col] || "");
                cmp = first.localeCompare(second);
            }

            if (sortDescriptor.direction === "descending") {
                cmp *= -1;
            }
            return cmp;
        });
    }, [filteredItems, sortDescriptor]);

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

    const handleRowAction = (key: Key) => {
        const project = projects.find((p) => p.id === key);
        if (project) setSelectedProject(project);
    };
    //La gestione della table é stata gestita attraverso la documentazione HeroUI come per le altre componenti del dashboard
    // seguita la documentazione e rifattorizzato per eventuali correzioni suggerite dall'IA

    // Top Content (Barra di ricerca in alto a sinistra)
    const topContent = (
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex justify-between items-center gap-3">
                <SearchField
                    aria-label="Cerca progetto"
                    className="w-full sm:max-w-full"
                    value={filterValue}
                    onChange={setFilterValue}
                >
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input placeholder="Cerca per titolo, azienda o freelancer..." />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>

                <Button
                    className="bg-gray-900 text-white min-w-max hover:bg-green-700"
                    onPress={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={16} />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-3">
            {topContent}
            {isLoading ? (
                <div className="flex justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-100 w-full">
                    <Spinner color="current" aria-label="Caricamento progetti..." />
                    <span className="ml-2 text-gray-600">Caricamento progetti...</span>
                </div>
            ) : (
                <Table>
                    <Table.ScrollContainer className="h-[500px]">
                        <Table.Content
                            aria-label="Tabella Progetti Interni"
                            className="min-w-full"
                            sortDescriptor={sortDescriptor}
                            onSortChange={setSortDescriptor}
                            onRowAction={handleRowAction}
                        >
                            <Table.Header>
                                <Table.Column allowsSorting isRowHeader id="companyName" className="hover:text-gray-900 w-2/3">
                                    AZIENDA
                                </Table.Column>
                                <Table.Column allowsSorting id="status" className="hover:text-gray-900 w-1/3">
                                    STATO
                                </Table.Column>
                            </Table.Header>
                            <Table.Body
                                items={sortedItems}
                                renderEmptyState={() => (
                                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center bg-gray p-6 rounded-lg">
                                        <Inbox className="text-default-300" size={40} />
                                        <span className="text-sm text-gray-600">Nessun progetto trovato, prova a modificare i criteri di ricerca.</span>
                                    </EmptyState>
                                )}
                            >
                                {(project) => {
                                    const { color, label } = getStatusConfig(project.status);
                                    const isCompleted = project.status === "completed";
                                    const rowOpacity = isCompleted ? "opacity-60 grayscale-[50%]" : "";

                                    return (
                                        <Table.Row key={project.id} id={project.id} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer ${rowOpacity}`}>
                                            <Table.Cell>
                                                <div className="flex items-center text-left py-2">
                                                    <span className="text-sm font-bold text-gray-800">{project.companyName}</span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex justify-center items-center">
                                                    <Chip color={color} variant="soft" size="sm" className="font-medium">{label}</Chip>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                }}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>
            )}
            <div className="py-2 flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 font-medium">
                    Totale: {sortedItems.length} {sortedItems.length === 1 ? "progetto" : "progetti"}
                </span>
            </div>

            {/* MODALE DETTAGLI PROGETTO IN SOLA LETTURA */}
            <Modal
                isOpen={!!selectedProject}
                onOpenChange={(open) => !open && setSelectedProject(null)}
            >
                <Modal.Backdrop variant="blur">
                    <Modal.Container>
                        <Modal.Dialog className="sm:max-w-[550px]">
                            <Modal.Header className="border-b border-gray-100 flex flex-col gap-1 pb-4">
                                <Modal.Heading className="text-gray-800 font-bold text-lg">Dettagli Progetto Interno</Modal.Heading>
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
                                                <Chip color={getStatusConfig(selectedProject.status).color} variant="soft" size="md" className="font-medium">
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

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget Preventivo</p>
                                                <p className="text-lg font-bold text-gray-700">€ {(selectedProject.budget || 0).toLocaleString('it-IT')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nostro Guadagno (Netto)</p>
                                                <p className="text-xl font-bold text-emerald-600">€ {((selectedProject.budget || 0) * 0.2).toLocaleString('it-IT')}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Freelancer Assegnati ({selectedProject.freelancers.length})</p>
                                            {selectedProject.freelancers.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProject.freelancers.map((name, i) => (
                                                        <Chip key={i} variant="soft" className="text-gray-700 font-medium bg-white border border-gray-200">
                                                            {name}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">Nessun freelancer assegnato a questo progetto.</p>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer className="border-t border-gray-100">
                                <p className="text-sm text-gray-300">
                                    Clicca fuori dalla finestra per tornare alla lista dei progetti.
                                </p>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            {/* MODALE DI CREAZIONE NUOVO PROGETTO */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}