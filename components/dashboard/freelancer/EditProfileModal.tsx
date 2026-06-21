"use client";

//Gli edit profile (sia di freelancer che delle company) sono stati generati embrionariamente e poi sistemati 
//con l'aiuto dell'IA tramite i dati degli specifici utenti e le documentazioni di heroui

import React, { useState, useEffect } from "react";
import type { Key } from "@heroui/react";

import {
    Modal, Form, TextField, Input, Label, Select, ListBox, Button, TextArea, FieldError, toast, ComboBox, Chip,
    ColorPicker,
    ColorSwatch,
    ColorArea,
    ColorSlider,
    CloseButton
} from "@heroui/react";
import { Edit3 } from "lucide-react";
import { updateLoggedFreelancerProfile, getUniqueMacroCategories } from "@/../actions/userActions";
import { SendResetPasswordButton } from "../../SendResetPasswordButton";

type EditProfileModalProps = {
    profile: Record<string, any> | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function EditProfileModal({ profile, isOpen, onClose }: EditProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState<Key | null>("available");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [comboInput, setComboInput] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [coverColor, setCoverColor] = useState("#531d1d");
    const [experienceLevel, setExperienceLevel] = useState<Key | null>("newbie");
    const [removePic, setRemovePic] = useState(false);


    useEffect(() => {
        if (isOpen) {
            getUniqueMacroCategories().then(res => {
                if (res.success && res.categories) setAvailableCategories(res.categories);
            });
            setAvailabilityStatus(profile?.publicData?.availability?.status || "available");
            setSelectedCategories(profile?.publicData?.macroCategories || []);
            setComboInput("");
            setCoverColor(profile?.publicData?.coverColor || "#4f46e5");
            setExperienceLevel(profile?.publicData?.experienceLevel || "newbie");
            setRemovePic(false);
        }
    }, [isOpen, profile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        if (availabilityStatus) formData.set("availabilityStatus", availabilityStatus.toString());
        if (experienceLevel) formData.set("experienceLevel", experienceLevel.toString());

        if (comboInput.trim()) {
            const currentCats = formData.get("macroCategories") as string;
            const newCats = currentCats ? `${currentCats}, ${comboInput.trim()}` : comboInput.trim();
            formData.set("macroCategories", newCats);
        }

        // Forza l'inserimento del colore selezionato in modo sicuro saltando il DOM
        formData.set("coverColor", coverColor);

        const result = await updateLoggedFreelancerProfile(formData);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {
            toast.success(result.success);
            window.dispatchEvent(new Event("refreshFreelancerProfile"));
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
                                <Edit3 className="size-6 text-blue-600" />
                                Modifica il Tuo Profilo
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="py-6 bg-gray-50/50">
                            <Form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextField name="firstName" isRequired defaultValue={profile?.publicData?.firstName}>
                                        <Label className={labelStyle}>Nome</Label>
                                        <Input placeholder="Es. Mario" />
                                        <FieldError />
                                    </TextField>
                                    <TextField name="lastName" isRequired defaultValue={profile?.publicData?.lastName}>
                                        <Label className={labelStyle}>Cognome</Label>
                                        <Input placeholder="Es. Rossi" />
                                        <FieldError />
                                    </TextField>
                                    <TextField name="location" defaultValue={profile?.publicData?.location}>
                                        <Label className={labelStyle}>Città / Sede</Label>
                                        <Input placeholder="Es. Milano, Italia" />
                                    </TextField>
                                    <TextField name="mainPortfolioUrl" type="url" className="md:col-span-2" defaultValue={profile?.publicData?.mainPortfolioUrl}>
                                        <Label className={labelStyle}>Link al tuo Portfolio principale</Label>
                                        <Input placeholder="https://..." />
                                    </TextField>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label className={labelStyle}>Curriculum Vitae (PDF)</Label>
                                        {profile?.hasCv && profile?.publicData?.cvUrl && (
                                            <div className="mb-1 text-sm text-gray-600">
                                                CV Attuale: <a href={profile.publicData.cvUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline hover:text-blue-800">Visualizza Documento</a>
                                            </div>
                                        )}
                                        <input type="file" name="cvFile" accept="application/pdf"
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                                            required={!profile?.hasCv}
                                        />
                                        {!profile?.hasCv && <span className="text-xs text-red-500 font-medium">L&apos;inserimento del CV è obbligatorio per completare il profilo.</span>}
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label className={labelStyle}>Foto Profilo</Label>
                                        {(profile?.profilePicture || profile?.publicData?.profilePicture) && !removePic && (
                                            <div className="mb-2 flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-full border border-gray-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={profile.profilePicture || profile.publicData.profilePicture}
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

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label className={labelStyle}>Macro Categorie (Ruoli)</Label>
                                        <input type="hidden" name="macroCategories" value={selectedCategories.join(', ')} />
                                        {selectedCategories.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-1">
                                                {selectedCategories.map(cat => (
                                                    <Chip key={cat} variant="soft" color="default">
                                                        {cat}
                                                        <CloseButton onPress={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} />
                                                    </Chip>
                                                ))}
                                            </div>
                                        )}
                                        <ComboBox className="w-full" inputValue={comboInput} onInputChange={setComboInput} allowsCustomValue aria-label="Aggiungi categoria"
                                            onSelectionChange={(key) => {
                                                if (key) {
                                                    const cat = key.toString().trim();
                                                    if (!selectedCategories.includes(cat)) setSelectedCategories([...selectedCategories, cat]);
                                                    setTimeout(() => setComboInput(""), 0);
                                                }
                                            }}
                                        >
                                            <ComboBox.InputGroup><Input placeholder="Cerca o scrivi una nuova categoria (es. Copywriter, Dev...)" /><ComboBox.Trigger /></ComboBox.InputGroup>
                                            <ComboBox.Popover><ListBox>{availableCategories.filter(c => !selectedCategories.includes(c)).map(cat => (<ListBox.Item key={cat} id={cat} textValue={cat}>{cat}</ListBox.Item>))}</ListBox></ComboBox.Popover>
                                        </ComboBox>
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                                        <ColorPicker value={coverColor} onChange={(color) => setCoverColor(color.toString("hex"))}>
                                            <Label className="block text-xs font-bold text-gray-900 mb-1 mt-3">Colore Tema Profilo: </Label>
                                            <ColorPicker.Trigger className="flex items-center gap-3 mt-1 cursor-pointer w-max hover:opacity-80 transition-opacity">
                                                <ColorSwatch size="lg" className="rounded-md border border-gray-200 shadow-sm ml-2" />
                                                <span className="text-sm text-gray-600 font-medium">Scegli il tuo colore</span>
                                            </ColorPicker.Trigger>
                                            <ColorPicker.Popover className="p-3 bg-white rounded-xl shadow-xl border border-gray-100" aria-label="Selettore colore">
                                                <ColorArea aria-label="Area colore" className="max-w-full mb-3" colorSpace="hsb" xChannel="saturation" yChannel="brightness">
                                                    <ColorArea.Thumb />
                                                </ColorArea>
                                                <ColorSlider channel="hue" aria-label="Tonalità" className="gap-1 px-1" colorSpace="hsb">
                                                    <div className="flex justify-between w-full items-center mb-1">
                                                        <Label className="text-xs font-bold text-gray-500">Tonalità (Hue)</Label>
                                                        <ColorSlider.Output className="text-xs font-medium text-gray-400" />
                                                    </div>
                                                    <ColorSlider.Track>
                                                        <ColorSlider.Thumb />
                                                    </ColorSlider.Track>
                                                </ColorSlider>
                                            </ColorPicker.Popover>
                                        </ColorPicker>
                                    </div>

                                    <TextField name="bio" className="md:col-span-2" defaultValue={profile?.publicData?.bio}>
                                        <Label className={labelStyle}>Biografia / Presentazione</Label>
                                        <TextArea placeholder="Descrivi le tue competenze, le tue esperienze..." />
                                    </TextField>
                                </div>

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <ListBox.Item key="available" id="available" textValue="Disponibile">Disponibile (Accetto nuovi progetti)<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="busy" id="busy" textValue="Occupato">Occupato (Sto lavorando)<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="unavailable" id="unavailable" textValue="Non Disponibile">Non Disponibile (Ferie, ecc.)<ListBox.ItemIndicator /></ListBox.Item>
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
                                                <ListBox.Item key="newbie" id="newbie" textValue="Base">Base (0-2 anni)<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="good" id="good" textValue="Intermedio">Intermedio (3-5 anni)<ListBox.ItemIndicator /></ListBox.Item>
                                                <ListBox.Item key="master" id="master" textValue="Esperto">Esperto (5+ anni)<ListBox.ItemIndicator /></ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm">
                                    <Label className={labelStyle}>Modifica Password</Label>
                                    <div className="text-sm text-gray-500">Usa questo pulsante per inviare a te stesso un&apos;email con il link per reimpostare la password.</div>
                                    <SendResetPasswordButton />
                                </div>
                                <div className="pt-4 flex justify-end gap-3"><Button variant="ghost" onPress={onClose}>Annulla</Button><Button type="submit" isDisabled={isLoading} isPending={isLoading} className="bg-blue-600 text-white font-bold px-6 shadow-sm">Salva Modifiche</Button></div>
                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}