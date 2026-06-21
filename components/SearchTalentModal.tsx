"use client";

import React, { useState, useEffect } from 'react';
import { Modal, SearchField, Spinner, ComboBox, ListBox, Chip, CloseButton, Input, Select, Label } from '@heroui/react';
import { searchFreelancers, getUniqueMacroCategories } from '@/../actions/userActions';
import { Search, UserSearch } from 'lucide-react';
import Link from 'next/link';


// 1. Tipizzazione aggiornata per accogliere la foto profilo
type FreelancerResult = {
    id: string;
    actualId?: string;
    name: string;
    initials: string;
    categories: string[];
    availability: string;
    experienceLevel: string;
    coverColor: string;
    profilePicture?: string;
};

// Card Component (Isolato e Tipizzato)
function FreelancerCard({ freelancer }: { freelancer: FreelancerResult }) {
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
        <Link href={`/freelancer/${freelancer.id}`} passHref>
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-48 flex flex-col">

                {/* Metà Superiore (Copertina e Avatar) */}
                <div className="h-[60%] w-full transition-colors relative" style={{ backgroundColor: freelancer.coverColor }}>
                    <div
                        className="absolute top-4 left-4 w-12 h-12 rounded-full shadow-md border-2 border-white flex items-center justify-center text-white text-lg font-black select-none transition-colors overflow-hidden"
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

                {/* Metà Inferiore (Info) */}
                <div className="h-[40%] bg-white p-4 pt-2 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-800 truncate group-hover:text-red-900 transition-colors">
                            {freelancer.name}
                        </h3>
                        {getExperienceChip(freelancer.experienceLevel)}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 truncate">
                            {freelancer.categories?.join(', ') || 'Nessuna categoria'}
                        </p>
                        {getAvailabilityChip(freelancer.availability)}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function SearchTalentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [comboInput, setComboInput] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<string | undefined>("all");
    const [results, setResults] = useState<FreelancerResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Reset degli stati quando il modale si apre
    useEffect(() => {
        if (isOpen) {
            setSelectedCategories([]);
            setSearchTerm("");
            setSelectedExperience("all");
            getUniqueMacroCategories().then(res => {
                if (res.success && res.categories) {
                    setAvailableCategories(res.categories);
                }
            });
        }
    }, [isOpen]);

    // Implementazione del pattern Debounce per la ricerca
    useEffect(() => {
        const handler = setTimeout(() => {
            if (isOpen) handleSearch();
        }, 300); // Ritardo di 300ms

        return () => clearTimeout(handler);
    }, [searchTerm, selectedCategories, selectedExperience, isOpen]);

    const handleSearch = async () => {
        setIsLoading(true);
        const res = await searchFreelancers({ term: searchTerm, categories: selectedCategories, experienceLevel: selectedExperience });
        if (res.success && res.freelancers) {
            setResults(res.freelancers);
        } else {
            setResults([]);
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <Modal.Backdrop variant='blur'>
                <Modal.Container>
                    <Modal.Dialog className="w-full max-w-3xl p-6 rounded-xl shadow-lg">
                        <Modal.Header>
                            <Modal.Heading className="flex items-center text-2xl font-bold text-gray-900">
                                <Search className="w-5 h-5 mr-2" />
                                Cerca i tuoi Talenti in RAW
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="text-gray-600 mb-6 text-center">
                                Inserisci parole chiave e filtra per categoria per trovare i freelancer più adatti alle tue esigenze. <br />
                                Puoi cercare per città, regione, competenze specifiche e/o grado di esperienza. <br />
                                I risultati mostreranno una panoramica dei profili, con la possibilità di cliccare per maggiori dettagli.
                            </div>

                            {/* ZONA FILTRI */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10">
                                <div className="md:col-span-2 ml-1">
                                    <SearchField aria-label="Regione o città" value={searchTerm} onChange={setSearchTerm}>
                                        <Input placeholder="Regione o città..." />
                                    </SearchField>
                                </div>
                                <div className="md:col-span-2">
                                    <Select
                                        className="w-full"
                                        aria-label="Filtra per esperienza"
                                        name="experienceLevel"
                                        placeholder="Esperienza richiesta"
                                        value={selectedExperience}
                                        onChange={(value) => {
                                            setSelectedExperience(value ? value.toString() : "all");
                                        }}
                                    >
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                <ListBox.Item key="all" id="all" textValue="Qualsiasi" className="text-gray-400">
                                                    Qualsiasi
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item key="newbie" id="newbie" textValue="Base" className="text-gray-400">
                                                    Base o superiore
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item key="good" id="good" textValue="Intermedio" className="text-gray-400">
                                                    Intermedio o superiore
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                                <ListBox.Item key="master" id="master" textValue="Esperto" className="text-gray-400">
                                                    Esperto
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    {selectedCategories.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedCategories.map(cat => (
                                                <Chip key={cat} variant="soft" color="default">
                                                    {cat}
                                                    <CloseButton onPress={() => setSelectedCategories(cats => cats.filter(c => c !== cat))} />
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                    <ComboBox
                                        className="mr-1"
                                        aria-label="Filtra per categoria"
                                        inputValue={comboInput}
                                        onInputChange={setComboInput}
                                        onSelectionChange={(key) => {
                                            if (key) {
                                                const cat = key.toString();
                                                if (!selectedCategories.includes(cat)) {
                                                    setSelectedCategories(cats => [...cats, cat]);
                                                }
                                                setComboInput("");
                                            }
                                        }}
                                    >
                                        <ComboBox.InputGroup>
                                            <Input placeholder="Seleziona una o più categorie" />
                                            <ComboBox.Trigger />
                                        </ComboBox.InputGroup>
                                        <ComboBox.Popover>
                                            <ListBox items={availableCategories.filter(c => !selectedCategories.includes(c)).map(c => ({ id: c, name: c }))}>
                                                {(item) => <ListBox.Item textValue={item.name} className='text-gray-500'>{item.name}</ListBox.Item>}
                                            </ListBox>
                                        </ComboBox.Popover>
                                    </ComboBox>
                                </div>
                            </div>

                            {/* ZONA RISULTATI */}
                            <div className="min-h-[400px] relative flex-1 mt-4">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                                        <Spinner size="lg" aria-label="Caricamento talenti..." />
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.map(freelancer => <FreelancerCard key={freelancer.id} freelancer={freelancer} />)}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full pt-16">
                                        <UserSearch size={48} className="text-gray-300 mb-4" />
                                        <h3 className="font-semibold text-lg">Nessun risultato</h3>
                                        <p className="text-sm">Prova a modificare i criteri di ricerca.</p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER MODALE (Accessibilità sistemata) */}
                            <div className="text-gray-700 mt-6 text-sm text-center border-t border-gray-100 pt-6">
                                Non trovi un talento adatto?{' '}
                                <a
                                    href="mailto:info@rawtalent.it"
                                    className="text-red-900 font-bold hover:underline"
                                >
                                    Contattaci e ti aiuteremo a trovare la persona giusta per il tuo progetto!
                                </a>
                            </div>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}