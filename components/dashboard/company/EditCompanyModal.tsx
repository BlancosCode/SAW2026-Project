"use client";

//Gli edit profile (sia di freelancer che delle company) sono stati generati embrionariamente e poi sistemati 
//con l'aiuto dell'IA tramite i dati degli specifici utenti e le documentazioni di heroui

import React, { useState, useEffect } from "react";

import {
    Modal, Form, TextField, Input, Label, Button, TextArea, FieldError, toast,
    ColorPicker, ColorSwatch, ColorArea, ColorSlider
} from "@heroui/react";
import { Edit3 } from "lucide-react";
import { updateLoggedCompanyProfile } from "@/../actions/userActions";
import { SendResetPasswordButton } from "../../SendResetPasswordButton";

type EditCompanyModalProps = {
    profile: Record<string, any> | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function EditCompanyModal({ profile, isOpen, onClose }: EditCompanyModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [coverColor, setCoverColor] = useState("#9333ea");
    const [removePic, setRemovePic] = useState(false);

    useEffect(() => {
        if (isOpen && profile) {
            setCoverColor(profile.coverColor || "#9333ea");
            setRemovePic(false);
        }
    }, [isOpen, profile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("coverColor", coverColor);

        const result = await updateLoggedCompanyProfile(formData);

        if (result.error) {
            toast.danger(result.error);
        } else if (result.success) {
            toast.success(result.success);
            window.dispatchEvent(new Event("refreshCompanyProfile"));
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
                                <Edit3 className="size-6 text-purple-600" />
                                Modifica Profilo Aziendale
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="py-6 bg-gray-50/50">
                            <Form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextField name="name" isRequired defaultValue={profile?.name} className="md:col-span-2">
                                        <Label className={labelStyle}>Ragione Sociale</Label>
                                        <Input placeholder="Es. Tech Solutions S.p.A." />
                                        <FieldError />
                                    </TextField>

                                    <TextField name="pIVA" isRequired defaultValue={profile?.pIVA}>
                                        <Label className={labelStyle}>Partita IVA</Label>
                                        <Input placeholder="Es. 01234567890" />
                                        <FieldError />
                                    </TextField>

                                    <TextField name="industry" defaultValue={profile?.industry}>
                                        <Label className={labelStyle}>Settore</Label>
                                        <Input placeholder="Es. IT Consulting" />
                                    </TextField>

                                    <TextField name="mainContactEmail" type="email" defaultValue={profile?.mainContactEmail}>
                                        <Label className={labelStyle}>Email di Contatto (Pubblica)</Label>
                                        <Input placeholder="info@azienda.com" />
                                    </TextField>

                                    <TextField name="website" type="url" defaultValue={profile?.website}>
                                        <Label className={labelStyle}>Sito Web</Label>
                                        <Input placeholder="https://..." />
                                    </TextField>

                                    <TextField name="description" className="md:col-span-2" defaultValue={profile?.description}>
                                        <Label className={labelStyle}>Descrizione Azienda</Label>
                                        <TextArea placeholder="Descrivi la tua azienda, la missione, ecc..." />
                                    </TextField>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label className={labelStyle}>Foto Profilo</Label>
                                        {(profile?.profilePicture || profile?.publicData?.profilePicture) && !removePic && (
                                            <div className="mb-2 flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-full border border-gray-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={profile.profilePicture || profile.publicData?.profilePicture}
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

                                    <div className="md:col-span-2 flex flex-col gap-2 mt-2 border-t border-gray-100 pt-4">
                                        <ColorPicker value={coverColor} onChange={(color) => setCoverColor(color.toString("hex"))}>
                                            <Label className="block text-xs font-bold text-gray-900 mb-1 mt-3">Colore Tema Profilo: </Label>
                                            <ColorPicker.Trigger className="flex items-center gap-3 mt-1 cursor-pointer w-max hover:opacity-80 transition-opacity">
                                                <ColorSwatch size="lg" className="rounded-md border border-gray-200 shadow-sm ml-2" />
                                                <span className="text-sm text-gray-600 font-medium">Scegli il tuo colore</span>
                                            </ColorPicker.Trigger>
                                            <ColorPicker.Popover className="p-3 bg-white rounded-xl shadow-xl border border-gray-100" aria-label="Selettore colore">
                                                <ColorArea aria-label="Area colore" className="max-w-full mb-3" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><ColorArea.Thumb /></ColorArea>
                                                <ColorSlider channel="hue" aria-label="Tonalità" className="gap-1 px-1" colorSpace="hsb">
                                                    <div className="flex justify-between w-full items-center mb-1"><Label className="text-xs font-bold text-gray-500">Tonalità</Label><ColorSlider.Output className="text-xs font-medium text-gray-400" /></div>
                                                    <ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track>
                                                </ColorSlider>
                                            </ColorPicker.Popover>
                                        </ColorPicker>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-md border border-gray-200 w-full shadow-sm">
                                    <Label className={labelStyle}>Modifica Password</Label>
                                    <SendResetPasswordButton />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <Button variant="ghost" onPress={onClose}>Annulla</Button>
                                    <Button type="submit" isDisabled={isLoading} isPending={isLoading} className="bg-purple-600 text-white font-bold px-6 shadow-sm">Salva Modifiche</Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}