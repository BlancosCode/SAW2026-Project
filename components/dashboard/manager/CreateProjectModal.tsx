"use client";

import React, { useState, useEffect } from "react";
import type { Key } from "@heroui/react";
import {
    Modal,
    Form,
    TextField,
    Input,
    Label,
    Select,
    ListBox,
    Button,
    TextArea,
    FieldError,
    toast,
    ComboBox,
    Chip,
    CloseButton
} from "@heroui/react";
import { FolderPlus } from "lucide-react";
import { createInternalProject, getEntitiesForProjects } from "@/../actions/userActions";

// --- COMPONENTE STATUS SELECTION ---
interface StatusSelectionProps {
    selectedStatus: Key | null;
    setSelectedStatus: (status: Key | null) => void;
    labelStyle: string;
}

//Stessa logica di CreateUserForm, in questo caso utilizza anche la documentazione dei modali di heroui
//scritto seguendo la documentazione e corretto in modo finalizzante con Gemini

function StatusSelection({ selectedStatus, setSelectedStatus, labelStyle }: StatusSelectionProps) {
    return (
        <Select
            className="w-full"
            isRequired
            name="status"
            value={selectedStatus?.toString() || "pending"}
            onChange={(val: any) => setSelectedStatus(val)}
        >
            <Label className={labelStyle}>Stato Attuale</Label>
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    <ListBox.Item key="pending" id="pending" textValue="In Attesa" className="text-gray-700">
                        In Attesa (Pending)
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item key="active" id="active" textValue="Attivo" className="text-gray-700">
                        Attivo (In Corso)
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item key="completed" id="completed" textValue="Completato" className="text-gray-700">
                        Completato
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
// ------------------------------------------

type CreateProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type Entity = { id: string; name: string };

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<Entity[]>([]);
    const [freelancers, setFreelancers] = useState<Entity[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<Key | null>("pending");
    const [selectedExperience, setSelectedExperience] = useState<Key | null>("newbie");
    const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);
    const [freelancerComboInput, setFreelancerComboInput] = useState("");

    useEffect(() => {
        if (isOpen) {
            getEntitiesForProjects().then((res) => {
                if (res.success) {
                    setCompanies(res.companies || []);
                    setFreelancers(res.freelancers || []);
                }
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const result = await createInternalProject(formData);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {
            toast.success(result.success);
            window.dispatchEvent(new Event("refreshProjectsTable")); // Aggiorna la tabella
            form.reset();
            setSelectedStatus("pending");
            setSelectedExperience("newbie");
            setSelectedFreelancers([]);
            setFreelancerComboInput("");
            onClose();
        }

        setIsLoading(false);
    };

    const labelStyle = "block text-xs font-bold text-gray-900 mb-1";

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Backdrop variant="blur">
                <Modal.Container scroll="inside">
                    <Modal.Dialog className="rounded-t-3xl rounded-b-none sm:rounded-2xl m-0 sm:m-auto max-w-2xl w-full max-h-[90vh]">
                        <Modal.Header className="flex flex-col gap-1 text-gray-800 border-b border-gray-100 pb-4">
                            <Modal.Heading className="text-gray-600 font-bold flex items-center gap-2 text-lg">
                                <FolderPlus className="size-6 text-red-900" />
                                Crea Nuovo Progetto Interno
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="py-6 bg-gray-50/50">
                            <Form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextField
                                        name="title"
                                        isRequired
                                        className="md:col-span-2"
                                        validate={(value: string) => {
                                            if (!value) return "Il titolo del progetto è obbligatorio";
                                            return null;
                                        }}
                                    >
                                        <Label className={labelStyle}>Titolo Progetto</Label>
                                        <Input placeholder="es. Sviluppo App Mobile" />
                                        <FieldError />
                                    </TextField>

                                    <TextField
                                        name="description"
                                        isRequired
                                        className="md:col-span-2"
                                        validate={(value: string) => {
                                            if (!value) return "La descrizione è obbligatoria";
                                            return null;
                                        }}
                                    >
                                        <Label className={labelStyle}>Descrizione Dettagliata</Label>
                                        <TextArea placeholder="Descrivi l'obiettivo e i requisiti del progetto..." />
                                        <FieldError />
                                    </TextField>
                                </div>

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        name="companyId"
                                        isRequired
                                        className="md:col-span-2"
                                        placeholder="Seleziona un'azienda..."
                                        validate={(value) => {
                                            if (!value) return "Devi assegnare il progetto a un'azienda";
                                            return null;
                                        }}
                                    >
                                        <Label className={labelStyle}>Azienda Cliente</Label>
                                        <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {companies.map(c => (
                                                    <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="text-gray-700">
                                                        {c.name}
                                                        <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                        <FieldError />
                                    </Select>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label className={labelStyle}>Freelancer Assegnati (Opzionale)</Label>

                                        {/* Hidden input per inviare l'array unito da virgole al server */}
                                        <input type="hidden" name="freelancersId" value={selectedFreelancers.join(', ')} />

                                        {/* Chips freelancer selezionati */}
                                        {selectedFreelancers.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedFreelancers.map(fId => {
                                                    const freelancer = freelancers.find(f => f.id === fId);
                                                    return (
                                                        <Chip key={fId} variant="soft" color="default">
                                                            {freelancer ? freelancer.name : fId}
                                                            <CloseButton onPress={() => setSelectedFreelancers(selectedFreelancers.filter(id => id !== fId))} />
                                                        </Chip>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Combobox per ricerca e selezione rapida */}
                                        <div className="flex gap-2 items-start w-full">
                                            <ComboBox
                                                className="w-full"
                                                inputValue={freelancerComboInput}
                                                onInputChange={setFreelancerComboInput}
                                                aria-label="Aggiungi freelancer"
                                                onSelectionChange={(key) => {
                                                    if (key) {
                                                        const fId = key.toString();
                                                        if (!selectedFreelancers.includes(fId)) {
                                                            setSelectedFreelancers([...selectedFreelancers, fId]);
                                                        }
                                                        setTimeout(() => setFreelancerComboInput(""), 0);
                                                    }
                                                }}
                                            >
                                                <ComboBox.InputGroup>
                                                    <Input placeholder="Cerca e seleziona un freelancer..." />
                                                    <ComboBox.Trigger />
                                                </ComboBox.InputGroup>
                                                <ComboBox.Popover>
                                                    <ListBox>
                                                        {freelancers.filter(f => !selectedFreelancers.includes(f.id)).map(f => (
                                                            <ListBox.Item key={f.id} id={f.id} textValue={f.name} className="text-gray-600">
                                                                {f.name}
                                                            </ListBox.Item>
                                                        ))}
                                                    </ListBox>
                                                </ComboBox.Popover>
                                            </ComboBox>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <StatusSelection selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} labelStyle={labelStyle} />

                                    <Select
                                        name="experienceLevel"
                                        className="w-full"
                                        aria-label="Esperienza Richiesta"
                                        value={selectedExperience?.toString() || "newbie"}
                                        onChange={(val: any) => setSelectedExperience(val)}
                                    >
                                        <Label className={labelStyle}>Esperienza Minima Richiesta</Label>
                                        <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item key="newbie" id="newbie" textValue="Base" className="text-gray-700">Base<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="good" id="good" textValue="Intermedio" className="text-gray-700">Intermedio<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="master" id="master" textValue="Esperto" className="text-gray-700">Esperto<ListBox.ItemIndicator /></ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>

                                    <TextField name="proposalDate" type="date">
                                        <Label className={labelStyle}>Data Proposta</Label>
                                        <Input />
                                        <FieldError />
                                    </TextField>

                                    <TextField name="budgetAmount" type="number">
                                        <Label className={labelStyle}>Preventivo Netto (€)</Label>
                                        <Input placeholder="es. 5000" />
                                        <FieldError />
                                    </TextField>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 w-full">
                                    <Button variant="ghost" onPress={onClose} type="button">
                                        Annulla
                                    </Button>
                                    <Button type="submit" isDisabled={isLoading} className="bg-black hover:bg-red-900 text-white font-bold px-6 shadow-sm transition-colors">
                                        Crea Progetto
                                    </Button>
                                </div>

                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}