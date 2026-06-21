"use client";

import React, { useState } from "react";

import { Button, Card, CardHeader, CardFooter, Modal, Form, Input, TextArea, toast } from "@heroui/react";
import { Award, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { addPortfolioProject, deletePortfolioProject } from "@/../actions/portfolioActions";

type PortfolioProject = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    imageKey?: string;
};

type FreelancerPortfolioProps = {
    projects?: PortfolioProject[];
};

export default function FreelancerPortfolio({ projects = [] }: FreelancerPortfolioProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<{ id: string; imageKey?: string } | null>(null);

    const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = await addPortfolioProject(formData);

        if (res.error) {
            toast.danger(res.error);
        } else {
            toast.success(res.success);
            setIsModalOpen(false);
            window.dispatchEvent(new Event("refreshFreelancerProfile"));
        }
        setIsLoading(false);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(projectToDelete.id);
        const res = await deletePortfolioProject(projectToDelete.id, projectToDelete.imageKey || "");

        if (res.error) {
            toast.danger(res.error);
        } else {
            toast.success(res.success);
            window.dispatchEvent(new Event("refreshFreelancerProfile"));
        }
        setIsDeleting(null);
        setProjectToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-blue-600" /> Il tuo Portfolio
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Mostra i tuoi migliori lavori ({projects.length}/5)</p>
                </div>
                <Button
                    variant="primary"
                    onPress={() => setIsModalOpen(true)}
                    isDisabled={projects.length >= 5}
                    className="font-semibold shadow-sm text-white"
                >
                    <Plus size={18} /> Aggiungi
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-lg font-bold text-gray-700">Nessun progetto caricato</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">Non hai ancora aggiunto alcun progetto al tuo portfolio. Carica la tua prima immagine per mostrare di cosa sei capace!</p>
                    <Button variant="primary" onPress={() => setIsModalOpen(true)} className="mt-6 font-semibold">
                        Aggiungi il tuo primo progetto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <Card
                            key={project.id || `fallback-key-${index}`}
                            className="border border-gray-200 shadow-sm overflow-hidden group"
                        >
                            <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                                <a href={project.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </a>
                            </div>
                            <CardHeader className="flex flex-col items-start px-5 pt-5 pb-0">
                                <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{project.title}</h4>
                            </CardHeader>
                            <div className="px-5">
                                <p className="text-sm text-gray-600 line-clamp-3 mt-1">{project.description}</p>
                            </div>
                            <CardFooter className="px-5 pb-5 pt-4 flex justify-end">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onPress={() => setProjectToDelete({ id: project.id, imageKey: project.imageKey })}
                                    isPending={isDeleting === project.id}
                                >
                                    <Trash2 size={16} /> Elimina
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <Modal.Backdrop variant="blur">
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.Header className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                                <Modal.Heading className="font-bold text-gray-800 text-lg">Conferma Eliminazione</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body className="py-6">
                                <p className="text-gray-600 font-medium">
                                    Sei sicuro di voler eliminare definitivamente questo progetto dal tuo portfolio? L&apos;operazione non può essere annullata e l&apos;immagine verrà rimossa.
                                </p>
                                <div className="flex gap-2 justify-end mt-4">
                                    <Button variant="ghost" onPress={() => setProjectToDelete(null)}>Annulla</Button>
                                    <Button variant="danger" onPress={confirmDelete} isPending={!!isDeleting} className="font-bold">
                                        Sì, Elimina
                                    </Button>
                                </div>
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <Modal.Backdrop variant="blur">
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.Header className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                                <Modal.Heading className="font-bold text-gray-800 text-lg">Aggiungi Progetto al Portfolio</Modal.Heading>
                                <p className="text-sm text-gray-500">Formati supportati: JPG, PNG, WEBP. Max 5MB.</p>
                            </Modal.Header>
                            <Modal.Body className="py-6">
                                <Form onSubmit={handleAddProject} className="flex flex-col gap-4">
                                    <Input name="title" required placeholder="Es: Restyling Sito Web" className="font-medium" />
                                    <TextArea name="description" required placeholder="Racconta i dettagli di questo progetto..." className="font-medium" />

                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="text-sm font-bold text-gray-900">Immagine</label>
                                        <input type="file" name="image" accept="image/jpeg, image/png, image/webp" required
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button variant="ghost" onPress={() => setIsModalOpen(false)}>Annulla</Button>
                                        <Button variant="primary" type="submit" isPending={isLoading} className="text-white font-bold">Salva Progetto</Button>
                                    </div>
                                </Form>
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    );
}