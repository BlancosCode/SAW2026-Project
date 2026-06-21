// app/dashboard/manager/CreateUserForm.tsx
"use client";

import { useState, useEffect } from "react";
import type { Key } from "@heroui/react";
import { Button, ListBox, FieldError, Form, Input, Label, TextField, Select, TextArea, CloseButton, toast, Description, ComboBox, Chip } from "@heroui/react";
import { createNewUser, getUniqueMacroCategories } from "@/../actions/userActions";
import { UserRoundPlus, BugPlay, Trash2 } from "lucide-react";

// --- COMPONENTI SELECTION SPOSTATI FUORI ---
interface SelectionProps {
    selectedRole: Key | null;
    setSelectedRole: (role: Key | null) => void;
    labelStyle: string; // Passiamo lo stile della label come prop
}
interface SelectionExperienceProps {
    selectedExperience: Key | null;
    setSelectedExperience: (exp: Key | null) => void;
    labelStyle: string;
}

function SelectionExperience({ selectedExperience, setSelectedExperience, labelStyle }: SelectionExperienceProps) {
    return (
        <Select
            className="w-full"
            name="experienceLevel"
            placeholder="Seleziona il livello di esperienza"
            value={selectedExperience}
            onChange={(value) => setSelectedExperience(value)}
        >
            <Label className={labelStyle}>Livello Esperienza</Label>
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    <ListBox.Item key="newbie" id="newbie" textValue="Base" className="text-gray-400">
                        Base
                        <ListBox.ItemIndicator />
                    </ListBox.Item>

                    <ListBox.Item key="good" id="good" textValue="Intermedio" className="text-gray-400">
                        Intermedio
                        <ListBox.ItemIndicator />
                    </ListBox.Item>

                    <ListBox.Item key="master" id="master" textValue="Esperto" className="text-gray-400">
                        Esperto
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                </ListBox>
            </Select.Popover>
        </Select>
    );
}

// --- COMPONENTE SELECTION ---


function SelectionRole({ selectedRole, setSelectedRole, labelStyle }: SelectionProps) {
    return (
        <Select
            className="w-full"
            placeholder="Selezione ruolo utente"
            isRequired
            name="role"
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
        >
            <Label className={labelStyle}>Ruolo</Label>
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    <ListBox.Item key="freelancer" id="freelancer" textValue="Freelancer" className="text-gray-400">
                        Freelancer
                        <ListBox.ItemIndicator />
                    </ListBox.Item>

                    <ListBox.Item key="company" id="company" textValue="Company" className="text-gray-400">
                        Azienda (Company)
                        <ListBox.ItemIndicator />
                    </ListBox.Item>

                    <ListBox.Item key="manager" id="manager" textValue="Manager" className="text-gray-400">
                        Manager Interno
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
// ------------------------------------------

export default function CreateUserForm() {
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Key | null>("freelancer");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [comboInput, setComboInput] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState<Key | null>("newbie");

    useEffect(() => {
        getUniqueMacroCategories().then(res => {
            if (res.success && res.categories) {
                setAvailableCategories(res.categories);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Se l'utente ha digitato una categoria ma ha dimenticato di premere "Aggiungi", la salviamo comunque!
        if (comboInput.trim()) {
            const currentCats = formData.get("macroCategories") as string;
            const newCats = currentCats ? `${currentCats}, ${comboInput.trim()}` : comboInput.trim();
            formData.set("macroCategories", newCats);
        }

        const result = await createNewUser(formData);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {

            // Estraiamo i dati inseriti nel form per preparare la mail di benvenuto
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            let name = "";
            if (selectedRole === "company") {
                name = formData.get("companyName") as string;
            } else {
                name = `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim();
            }

            toast.success(result.success);
            form.reset();
            setSelectedRole("freelancer");
            setSelectedCategories([]);
            setComboInput("");
            getUniqueMacroCategories().then(r => { if (r.success && r.categories) setAvailableCategories(r.categories) });
            window.dispatchEvent(new Event("refreshUsersTable"));
        }
        setIsLoading(false);
    };

    // Stili uniformati per i componenti HeroUI
    const labelStyle = "block text-xs font-bold text-gray-900 mb-1";

    return (
        <div className="w-full">
            <Form onSubmit={handleSubmit} className="space-y-6 mt-4 w-full">
                {/* --- SEZIONE 1: DATI DI ACCESSO CONDIVISI --- */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Dati di Accesso Base</h3>
                    {/* Sostituito <Form> interno con <div> */}
                    <div className="w-full grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <TextField
                            isRequired
                            name="email"
                            type="email"
                            validate={(value) => {
                                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                                    return "Please enter a valid email address";
                                }
                                return null;
                            }}
                        >
                            <Label className={labelStyle}>Email</Label>
                            <Input placeholder="john@example.com" />
                            <FieldError />
                        </TextField>

                        <TextField
                            isRequired
                            name="password"
                            type="text"
                            validate={(value) => {
                                if (value.length < 8) {
                                    return "Password must be at least 8 characters long";
                                }
                                return null;
                            }}
                        >
                            <Label className={labelStyle}>Password</Label>
                            <Input placeholder="••••••••" />
                            <Description className="text-xs text-gray-500 mt-1">La password deve essere di almeno 8 caratteri.</Description>
                            <FieldError />
                        </TextField>

                        <div className="col-span-2">
                            <SelectionRole selectedRole={selectedRole} setSelectedRole={setSelectedRole} labelStyle={labelStyle} />
                        </div>
                    </div>
                </div>

                {/* --- SEZIONE 2: DATI SPECIFICI IN BASE AL RUOLO --- */}
                <div className="bg-white w-full">

                    {/* === CAMPI FREELANCER === */}
                    {selectedRole === "freelancer" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-bold text-blue-900 mb-3 border-b border-gray-200 pb-2">Anagrafica Freelancer</h3>
                            {/* Sostituito <Form> con <div> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                    isRequired
                                    name="firstName"
                                    type="text"
                                    validate={(value) => {
                                        if (!value) {
                                            return "First name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Nome</Label>
                                    <Input placeholder="John" />
                                    <FieldError />
                                </TextField>
                                <TextField
                                    isRequired
                                    name="lastName"
                                    type="text"
                                    validate={(value) => {
                                        if (!value) {
                                            return "Last name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Cognome</Label>
                                    <Input placeholder="Doe" />
                                    <FieldError />
                                </TextField>
                                <TextField name="location" type="text">
                                    <Label className={labelStyle}>Sede / Posizione</Label>
                                    <Input placeholder="es. Milano, Lombardia" />
                                    <FieldError />
                                </TextField>
                                <SelectionExperience selectedExperience={selectedExperience} setSelectedExperience={setSelectedExperience} labelStyle={labelStyle} />
                                <TextField name="mainPortfolioUrl" type="url" className="md:col-span-2">
                                    <Label className={labelStyle}>URL Portfolio Principale</Label>
                                    <Input placeholder="https://..." />
                                    <FieldError />
                                </TextField>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <Label className={labelStyle}>Macro Categorie</Label>

                                    {/* Hidden input per il salvataggio */}
                                    <input type="hidden" name="macroCategories" value={selectedCategories.join(', ')} />

                                    {/* Chips categorie selezionate */}
                                    {selectedCategories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCategories.map(cat => (
                                                <Chip
                                                    key={cat}
                                                    variant="soft"
                                                    color="default"
                                                >

                                                    {cat}
                                                    <CloseButton onPress={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} />
                                                </Chip>
                                            ))}
                                        </div>
                                    )}

                                    {/* Combobox per ricerca/aggiunta */}
                                    <div className="flex gap-2 items-start w-full">
                                        <ComboBox
                                            className="w-full"
                                            inputValue={comboInput}
                                            onInputChange={setComboInput}
                                            allowsCustomValue
                                            aria-label="Aggiungi categoria"
                                        >
                                            <ComboBox.InputGroup>
                                                <Input
                                                    placeholder="Cerca o scrivi una nuova categoria..."
                                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const cat = comboInput.trim();
                                                            if (cat && !selectedCategories.includes(cat)) {
                                                                setSelectedCategories([...selectedCategories, cat]);
                                                            }
                                                            setComboInput("");
                                                        }
                                                    }}
                                                />
                                                <ComboBox.Trigger />
                                            </ComboBox.InputGroup>
                                            <ComboBox.Popover>
                                                <ListBox>
                                                    {availableCategories.filter(c => !selectedCategories.includes(c)).map(cat => (
                                                        <ListBox.Item key={cat} id={cat} textValue={cat} className="text-gray-600">
                                                            {cat}
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </ComboBox.Popover>
                                        </ComboBox>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onPress={() => {
                                                const cat = comboInput.trim();
                                                if (cat && !selectedCategories.includes(cat)) {
                                                    setSelectedCategories([...selectedCategories, cat]);
                                                }
                                                setComboInput("");
                                            }}
                                        >
                                            Aggiungi
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === CAMPI COMPANY === */}
                    {selectedRole === "company" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-bold text-purple-900 mb-3 border-b border-gray-200 pb-2">Dati Aziendali</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                    isRequired
                                    name="companyName"
                                    type="text"
                                    className="md:col-span-2"
                                    validate={(value) => {
                                        if (!value) {
                                            return "Company name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Ragione Sociale (Nome Azienda) *</Label>
                                    <Input placeholder="es. Tech Solutions S.p.A." />
                                    <FieldError />
                                </TextField>
                                <TextField
                                    isRequired
                                    name="pIVA"
                                    type="text"
                                    validate={(value) => {
                                        if (!value) {
                                            return "VAT number is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Partita IVA</Label>
                                    <Input placeholder="es. 01234567890" />
                                    <FieldError />
                                </TextField>
                                <TextField name="industry" type="text">
                                    <Label className={labelStyle}>Settore (Industry)</Label>
                                    <Input placeholder="es. IT Consulting" />
                                    <FieldError />
                                </TextField>
                                <TextField name="mainContactEmail" type="email">
                                    <Label className={labelStyle}>Email di Contatto Principale</Label>
                                    <Input placeholder="hr@azienda.com" />
                                    <FieldError />
                                </TextField>
                                <TextField name="website" type="url">
                                    <Label className={labelStyle}>Sito Web</Label>
                                    <Input placeholder="https://..." />
                                    <FieldError />
                                </TextField>
                                <TextField name="description" type="textarea" className="md:col-span-2">
                                    <Label className={labelStyle}>Descrizione Azienda</Label>
                                    <TextArea placeholder="Azienda leader nel settore..." />
                                    <FieldError />
                                </TextField>
                            </div>
                        </div>
                    )}

                    {/* === CAMPI MANAGER === */}
                    {selectedRole === "manager" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-bold text-emerald-900 mb-3 border-b border-gray-200 pb-2">Profilo Manager Interno</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                    isRequired
                                    name="firstName"
                                    type="text"
                                    validate={(value) => {
                                        if (!value) {
                                            return "First name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Nome</Label>
                                    <Input placeholder="Giulia" />
                                    <FieldError />
                                </TextField>
                                <TextField
                                    isRequired
                                    name="lastName"
                                    type="text"
                                    validate={(value) => {
                                        if (!value) {
                                            return "Last name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label className={labelStyle}>Cognome</Label>
                                    <Input placeholder="Verdi" />
                                    <FieldError />
                                </TextField>
                                <TextField name="contactNumber" type="text" className="md:col-span-2">
                                    <Label className={labelStyle}>Numero di Contatto</Label>
                                    <Input placeholder="+39 ..." />
                                    <FieldError />
                                </TextField>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    isDisabled={isLoading}
                    className={`w-full text-white font-bold py-3 px-4 shadow-sm transition-colors ${isLoading ? "bg-green-400" : "bg-gray-900 hover:bg-green-700"} ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <UserRoundPlus className="mr-2" size={18} />
                    {isLoading ? "Creazione in corso..." : `Salva Nuovo/a ${selectedRole} nel Database`}
                </Button>
            </Form>
        </div>
    );
}