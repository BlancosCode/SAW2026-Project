"use client";

import React, { useState } from "react";
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
    CloseButton,
    Chip,
    ColorPicker,
    ColorSwatch,
    ColorArea,
    ColorSlider,
    AlertDialog
} from "@heroui/react";
import { Settings2, Trash2 } from "lucide-react";
import { updateUser, getUniqueMacroCategories, deleteUsers } from "@/../actions/userActions";
import { useSession } from "@/../lib/auth-client";
import { SendResetPasswordButton } from "@/../components/SendResetPasswordButton";

type UserModalType = {
    id: string;
    name: string;
    email: string;
    role: string;
    profileData?: Record<string, any>;
};

type EditUserModalProps = {
    user: UserModalType | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Key | null>("");
    const [availabilityStatus, setAvailabilityStatus] = useState<Key | null>("");
    const [experienceLevel, setExperienceLevel] = useState<Key | null>("");
    const [companyStatus, setCompanyStatus] = useState<Key | null>("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [comboInput, setComboInput] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [coverColor, setCoverColor] = useState("#064e3b");
    const [removePic, setRemovePic] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            getUniqueMacroCategories().then(res => {
                if (res.success && res.categories) {
                    setAvailableCategories(res.categories);
                }
            });
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (user) {
            setSelectedRole(user.role?.toLowerCase() || "");
            setAvailabilityStatus(user.profileData?.publicData?.availability?.status || "available");
            setCompanyStatus(user.profileData?.status || "active");
            setSelectedCategories(user.profileData?.publicData?.macroCategories || []);
            setComboInput("");
            setCoverColor(user.profileData?.coverColor || "#531d1d");
            setExperienceLevel(user.profileData?.publicData?.experienceLevel || "newbie");
            setRemovePic(false);
        }
    }, [user]);

    if (!user) return null;

    const profile = user.profileData || {};
    const isFreelancer = selectedRole === "freelancer";
    const isCompany = selectedRole === "company";
    const isManager = selectedRole === "manager";
    const isSelf = session?.user?.id === user.id;

    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        formData.set("email", user.email);
        formData.set("role", selectedRole?.toString() || "");
        if (availabilityStatus) formData.set("availabilityStatus", availabilityStatus.toString());
        if (companyStatus) formData.set("companyStatus", companyStatus.toString());

        if (comboInput.trim()) {
            const currentCats = formData.get("macroCategories") as string;
            const newCats = currentCats ? `${currentCats}, ${comboInput.trim()}` : comboInput.trim();
            formData.set("macroCategories", newCats);
        }

        if (isManager && isSelf) {
            formData.set("coverColor", coverColor);
        }

        const result = await updateUser(user.id, formData);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {
            toast.success(result.success);
            getUniqueMacroCategories().then(r => { if (r.success && r.categories) setAvailableCategories(r.categories) });
            window.location.reload();
            onClose();
        }

        setIsLoading(false);
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        setIsDeleting(true);
        const result = await deleteUsers([user.id]);
        setIsDeleting(false);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {
            toast.success(result.success);
            window.location.reload(); // Ricarica per pulire lo stato
            onClose();
        }
    };

    const labelStyle = "block text-xs font-bold text-gray-900 mb-1";

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <Modal.Backdrop variant="blur">
                <Modal.Container scroll="inside">
                    <Modal.Dialog className="rounded-t-3xl rounded-b-none sm:rounded-2xl m-0 sm:m-auto max-w-3xl w-full max-h-[90vh]">
                        <Modal.Header className="flex flex-col gap-1 text-gray-800 border-b border-gray-100 pb-4">
                            <Modal.Heading className="text-gray-600 font-bold flex items-center gap-2 text-lg">
                                <Settings2 className="size-6 text-gray-500" />
                                Modifica Profilo: {user.name}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="py-6">
                            <Form onSubmit={handleUpdateUser} className="flex flex-col gap-6 w-full">

                                {/* DATI BASE CONDIVISI */}
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Dati Base e Accesso</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <TextField name="email" type="email" isRequired defaultValue={user.email} isDisabled={true}>
                                            <Label className={labelStyle}>Email (Accesso)</Label>
                                            <Input placeholder="john@example.com" />
                                            <FieldError />
                                        </TextField>

                                        <Select
                                            name="role"
                                            className="w-full"
                                            isRequired
                                            value={selectedRole?.toString() || ""}
                                            onChange={(val: any) => setSelectedRole(val)}
                                            isDisabled={true}
                                        >
                                            <Label className={labelStyle}>Ruolo Sistema</Label>
                                            <Select.Trigger>
                                                <Select.Value />
                                                <Select.Indicator />
                                            </Select.Trigger>
                                            <Select.Popover>
                                                <ListBox>
                                                    <ListBox.Item key="freelancer" id="freelancer" textValue="Freelancer" className="text-gray-600">Freelancer<ListBox.ItemIndicator /></ListBox.Item>
                                                    <ListBox.Item key="company" id="company" textValue="Azienda" className="text-gray-600">Azienda (Company)<ListBox.ItemIndicator /></ListBox.Item>
                                                    <ListBox.Item key="manager" id="manager" textValue="Manager" className="text-gray-600">Manager<ListBox.ItemIndicator /></ListBox.Item>
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                    </div>
                                </div>

                                {/* === CAMPI FREELANCER === */}
                                {isFreelancer && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-white p-4 rounded-md border border-gray-200 w-full">
                                            <h3 className="text-sm font-bold text-blue-900 mb-3 border-b border-gray-200 pb-2">Dati Pubblici Freelancer</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextField name="firstName" isRequired defaultValue={profile.publicData?.firstName}>
                                                    <Label className={labelStyle}>Nome</Label>
                                                    <Input placeholder="John" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="lastName" isRequired defaultValue={profile.publicData?.lastName}>
                                                    <Label className={labelStyle}>Cognome</Label>
                                                    <Input placeholder="Doe" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="location" defaultValue={profile.publicData?.location}>
                                                    <Label className={labelStyle}>Sede / Città</Label>
                                                    <Input placeholder="es. Milano, Lombardia" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="mainPortfolioUrl" type="url" defaultValue={profile.publicData?.mainPortfolioUrl}>
                                                    <Label className={labelStyle}>URL Portfolio Principale</Label>
                                                    <Input placeholder="https://..." />
                                                    <FieldError />
                                                </TextField>
                                                <div className="md:col-span-2 flex flex-col gap-2">
                                                    <Label className={labelStyle}>Macro Categorie</Label>

                                                    <input type="hidden" name="macroCategories" value={selectedCategories.join(', ')} />

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
                                                <TextField name="bio" className="md:col-span-2" defaultValue={profile.publicData?.bio}>
                                                    <Label className={labelStyle}>Biografia</Label>
                                                    <TextArea placeholder="Una breve descrizione..." />
                                                    <FieldError />
                                                </TextField>
                                            </div>

                                            <h4 className="text-xs font-bold text-blue-800 mt-6 mb-3">Disponibilità e Esperienza</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select
                                                    name="availabilityStatus"
                                                    className="w-full"
                                                    value={availabilityStatus?.toString() || "available"}
                                                    onChange={(val: any) => setAvailabilityStatus(val)}
                                                >
                                                    <Label className={labelStyle}>Stato Disponibilità</Label>
                                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                                    <Select.Popover>
                                                        <ListBox>
                                                            <ListBox.Item key="available" id="available" textValue="Disponibile" className="text-gray-600">Available<ListBox.ItemIndicator /></ListBox.Item>
                                                            <ListBox.Item key="busy" id="busy" textValue="Occupato" className="text-gray-600">Busy<ListBox.ItemIndicator /></ListBox.Item>
                                                            <ListBox.Item key="unavailable" id="unavailable" textValue="Non Disponibile" className="text-gray-600">Unavailable<ListBox.ItemIndicator /></ListBox.Item>
                                                        </ListBox>
                                                    </Select.Popover>
                                                </Select>
                                                <Select
                                                    name="experienceLevel"
                                                    className="w-full"
                                                    value={experienceLevel?.toString() || "newbie"}
                                                    onChange={(val: any) => setExperienceLevel(val)}
                                                >
                                                    <Label className={labelStyle}>Livello di Esperienza</Label>
                                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                                    <Select.Popover>
                                                        <ListBox>
                                                            <ListBox.Item key="newbie" id="newbie" textValue="Base" className="text-gray-600">Base<ListBox.ItemIndicator /></ListBox.Item>
                                                            <ListBox.Item key="good" id="good" textValue="Intermedio" className="text-gray-600">Intermedio<ListBox.ItemIndicator /></ListBox.Item>
                                                            <ListBox.Item key="master" id="master" textValue="Esperto" className="text-gray-600">Esperto<ListBox.ItemIndicator /></ListBox.Item>
                                                        </ListBox>
                                                    </Select.Popover>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full">
                                            <h3 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">Dati Interni (Solo Manager)</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <TextField name="phoneNumber" defaultValue={profile.internalData?.phoneNumber}>
                                                    <Label className={labelStyle}>Numero di Telefono</Label>
                                                    <Input placeholder="+39 ..." />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="languages" className="md:col-span-2" defaultValue={profile.internalData?.languages?.join(', ')}>
                                                    <Label className={labelStyle}>Lingue Parlate (virgola)</Label>
                                                    <Input placeholder="es. Italiano, Inglese" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="managerNotes" className="md:col-span-2" defaultValue={profile.internalData?.managerNotes?.map((n: { note: string }) => n.note).join('\n') || ""}>
                                                    <Label className={labelStyle}>Note Manager</Label>
                                                    <TextArea placeholder="Proattivo al lavoro, ottimo collaboratore..." />
                                                    <FieldError />
                                                </TextField>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === CAMPI COMPANY === */}
                                {isCompany && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-white p-4 rounded-md border border-gray-200 w-full">
                                            <h3 className="text-sm font-bold text-purple-900 mb-3 border-b border-gray-200 pb-2">Dati Aziendali</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextField name="companyName" isRequired defaultValue={profile.name} className="md:col-span-2">
                                                    <Label className={labelStyle}>Ragione Sociale</Label>
                                                    <Input placeholder="es. Tech Solutions S.p.A." />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="pIVA" isRequired defaultValue={profile.pIVA}>
                                                    <Label className={labelStyle}>Partita IVA</Label>
                                                    <Input placeholder="es. 01234567890" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="industry" defaultValue={profile.industry}>
                                                    <Label className={labelStyle}>Settore</Label>
                                                    <Input placeholder="es. IT Consulting" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="mainContactEmail" type="email" defaultValue={profile.mainContactEmail}>
                                                    <Label className={labelStyle}>Email di Contatto (pubblica)</Label>
                                                    <Input placeholder="hr@azienda.com" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField name="website" type="url" defaultValue={profile.website}>
                                                    <Label className={labelStyle}>Sito Web</Label>
                                                    <Input placeholder="https://..." />
                                                    <FieldError />
                                                </TextField>
                                                <Select
                                                    name="companyStatus"
                                                    className="w-full"
                                                    value={companyStatus?.toString() || "active"}
                                                    onChange={(val: any) => setCompanyStatus(val)}
                                                >
                                                    <Label className={labelStyle}>Stato Azienda</Label>
                                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                                    <Select.Popover>
                                                        <ListBox>
                                                            <ListBox.Item key="active" id="active" textValue="Attiva" className="text-gray-600">Attiva<ListBox.ItemIndicator /></ListBox.Item>
                                                            <ListBox.Item key="inactive" id="inactive" textValue="Inattiva" className="text-gray-600">Inattiva<ListBox.ItemIndicator /></ListBox.Item>
                                                        </ListBox>
                                                    </Select.Popover>
                                                </Select>
                                                <TextField name="description" className="md:col-span-2" defaultValue={profile.description}>
                                                    <Label className={labelStyle}>Descrizione Azienda</Label>
                                                    <TextArea placeholder="Azienda leader nel settore..." />
                                                    <FieldError />
                                                </TextField>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full">
                                            <h3 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">Dati Interni (Solo Manager)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextField name="internalNotes" className="md:col-span-2" defaultValue={profile.internalData?.internalNotes?.map((n: { note: string }) => n.note).join('\n') || ""}>
                                                    <Label className={labelStyle}>Note Interne</Label>
                                                    <TextArea placeholder="Note riservate sui contatti con l&apos;azienda..." />
                                                    <FieldError />
                                                </TextField>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === CAMPI MANAGER === */}
                                {isManager && (
                                    <div className="bg-white p-4 rounded-md border border-gray-200 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h3 className="text-sm font-bold text-teal-900 mb-3 border-b border-gray-200 pb-2">Dati Interni Manager</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <TextField name="firstName" isRequired defaultValue={profile.firstName}>
                                                <Label className={labelStyle}>Nome</Label>
                                                <Input placeholder="Giulia" />
                                                <FieldError />
                                            </TextField>
                                            <TextField name="lastName" isRequired defaultValue={profile.lastName}>
                                                <Label className={labelStyle}>Cognome</Label>
                                                <Input placeholder="Verdi" />
                                                <FieldError />
                                            </TextField>
                                            <TextField name="contactNumber" defaultValue={profile.contactNumber} className="md:col-span-2">
                                                <Label className={labelStyle}>Numero di Contatto</Label>
                                                <Input placeholder="+39 ..." />
                                                <FieldError />
                                            </TextField>
                                        </div>

                                        {/* SELETTORE COLORE SOLO SE IL MANAGER MODIFICA SE STESSO */}
                                        {isSelf && (
                                            <div className="md:col-span-2 flex flex-col gap-2 mt-4 border-t border-gray-100 pt-4">
                                                <ColorPicker value={coverColor} onChange={(color) => setCoverColor(color.toString("hex"))}>
                                                    <Label className="block text-xs font-bold text-gray-900 mb-1 mt-3">Personalizza il Colore alla tua Dashboard:</Label>
                                                    <ColorPicker.Trigger className="flex items-center gap-3 mt-1 cursor-pointer w-max hover:opacity-80 transition-opacity">
                                                        <ColorSwatch size="lg" className="rounded-md border border-gray-200 shadow-sm ml-4" />
                                                        <span className="text-sm text-gray-600 font-medium">Scegli il colore </span>
                                                    </ColorPicker.Trigger>
                                                    <ColorPicker.Popover className="p-3 bg-white rounded-xl shadow-xl border border-gray-100" aria-label="Selettore colore">
                                                        <ColorArea aria-label="Area colore" className="max-w-full mb-3" colorSpace="hsb" xChannel="saturation" yChannel="brightness">
                                                            <ColorArea.Thumb />
                                                        </ColorArea>
                                                        <ColorSlider channel="hue" aria-label="Tonalità" className="gap-1 px-1" colorSpace="hsb">
                                                            <div className="flex justify-between w-full items-center mb-1">
                                                                <Label className="text-xs font-bold text-gray-500">Tonalità</Label>
                                                                <ColorSlider.Output className="text-xs font-medium text-gray-400" />
                                                            </div>
                                                            <ColorSlider.Track>
                                                                <ColorSlider.Thumb />
                                                            </ColorSlider.Track>
                                                        </ColorSlider>
                                                    </ColorPicker.Popover>
                                                </ColorPicker>
                                                <div className="md:col-span-2 flex flex-col gap-2">
                                                    <Label className={labelStyle}>Foto Profilo</Label>
                                                    {(profile?.profilePicture) && !removePic && (
                                                        <div className="mb-2 flex items-center gap-4">
                                                            <div className="relative w-16 h-16 rounded-full border border-gray-200 overflow-hidden shrink-0">
                                                                <img
                                                                    src={profile.profilePicture}
                                                                    alt="Profile"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <Button size="sm" variant="danger" onPress={() => setRemovePic(true)}>
                                                                Rimuovi Foto
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <input type="hidden" name="removeProfilePicture" value={removePic.toString()} />
                                                    <input type="file" name="profilePicture" accept="image/*"
                                                        onChange={() => setRemovePic(false)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 flex flex-col gap-2 mt-4 border-t border-gray-100 pt-4 inline-flex items-center">
                                                    <SendResetPasswordButton />
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex justify-between gap-3 mt-4">
                                    <div>
                                        {user?.id !== session?.user?.id && (
                                            <AlertDialog>
                                                <Button isDisabled={isDeleting} className="bg-red-600 hover:bg-red-900 text-white font-medium">
                                                    <Trash2 className="size-5" />
                                                    Elimina Utente
                                                </Button>
                                                <AlertDialog.Backdrop variant="blur">
                                                    <AlertDialog.Container>
                                                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                                                            <AlertDialog.Header>
                                                                <AlertDialog.Icon status="danger" />
                                                                <AlertDialog.Heading className="text-gray-600 font-semibold">Eliminare definitivamente?</AlertDialog.Heading>
                                                            </AlertDialog.Header>
                                                            <AlertDialog.Body>
                                                                <p className="text-sm text-gray-600">
                                                                    Sei sicuro di voler eliminare definitivamente <strong>{user?.name}</strong>? Questa operazione non è reversibile e cancellerà tutti i dati associati dal database.
                                                                </p>
                                                            </AlertDialog.Body>
                                                            <AlertDialog.Footer>
                                                                <Button slot="close" variant="ghost" className="text-gray-600">
                                                                    Annulla
                                                                </Button>
                                                                <Button slot="close" className="bg-red-600 hover:bg-red-900 text-white font-medium" onPress={handleDeleteUser}>
                                                                    Elimina Definitivamente
                                                                </Button>
                                                            </AlertDialog.Footer>
                                                        </AlertDialog.Dialog>
                                                    </AlertDialog.Container>
                                                </AlertDialog.Backdrop>
                                            </AlertDialog>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onPress={onClose}>
                                            Annulla
                                        </Button>
                                        <Button type="submit" isDisabled={isLoading || isDeleting} className="bg-gray-900 text-white font-bold px-6 hover:bg-gray-700 transition-colors">
                                            Salva Modifiche
                                        </Button>
                                    </div>
                                </div>

                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}