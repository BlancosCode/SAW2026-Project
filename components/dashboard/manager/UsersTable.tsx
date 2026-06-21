"use client";

import type { SortDescriptor, Selection, Key } from "@heroui/react";
import React, { useEffect, useState, useMemo } from "react";

import {
    Table,
    TableLayout,
    Virtualizer,
    EmptyState,
    Chip,
    Spinner,
    SearchField,
} from "@heroui/react";
import { Inbox, ChevronUp } from "lucide-react";
import { fetchUsers } from "@/../actions/userActions";
import EditUserModal from "./EditUserModal";

type User = {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    createdAt: string;
    status: string;
    profileData?: Record<string, unknown>;
};

function SortableColumnHeader({
    children,
    sortDirection,
}: {
    children: React.ReactNode;
    sortDirection?: "ascending" | "descending";
}) {
    return (
        <span className="flex items-center justify-between gap-2">
            {children}
            {!!sortDirection && (
                <ChevronUp
                    className={`size-3 transform transition-transform duration-100 ease-out ${sortDirection === "descending" ? "rotate-180" : ""
                        }`}
                />
            )}
        </span>
    );
}

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetchUsers();
                if (res.success && res.users) {
                    setUsers(res.users);
                } else {
                    console.error("Errore caricamento utenti:", res?.error);
                }
            } catch (error: unknown) {
                console.error("Errore fetchUsers:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadUsers();

        window.addEventListener("refreshUsersTable", loadUsers);
        return () => window.removeEventListener("refreshUsersTable", loadUsers);
    }, []);

    const hasSearchFilter = Boolean(filterValue);

    // 1. Filtraggio per ricerca (nome, email o ruolo), come per i progetti, gestito da IA il sistema di sorting e filtering.
    const filteredItems = useMemo(() => {
        let filteredUsers = [...users];
        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((user) =>
                user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.role.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredUsers;
    }, [users, filterValue]);

    // 2. Ordinamento (Sorting)
    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const col = sortDescriptor.column as keyof User;
            const first = String(a[col] || "");
            const second = String(b[col] || "");
            let cmp = first.localeCompare(second);

            if (sortDescriptor.direction === "descending") {
                cmp *= -1;
            }
            return cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
            case "available": return "success";
            case "busy": return "warning";
            case "inactive": return "danger";
            default: return "default";
        }
    };

    const topContent = (
        <div className="flex flex-col gap-4 mb-2 ">
            <div className="flex justify-between items-center gap-3">
                <SearchField
                    aria-label="Cerca utente"
                    className="w-full sm:max-w-[44%]"
                    value={filterValue}
                    onChange={(val) => {
                        setFilterValue(val);
                    }}
                >
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input placeholder="Cerca utente per nome, email o ruolo..." />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>


            </div>
        </div>
    );

    const handleRowAction = (key: Key) => {
        const user = users.find((u) => u.id === key);
        if (user) setSelectedUser(user);
    };

    return (
        <div className="flex flex-col gap-3">
            {topContent}
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Spinner color="current" aria-label="Caricamento utenti..." />
                    <span className="ml-2 text-gray-600">Caricamento utenti...</span>
                </div>
            ) : (
                <Virtualizer
                    layout={TableLayout}
                    layoutOptions={{
                        headingHeight: 40,
                        rowHeight: 55,
                    }}
                >
                    <Table>
                        <Table.ScrollContainer>
                            <Table.Content
                                aria-label="Tabella riassuntiva utenti"
                                className="min-w-[600px] max-h-[500px] rounded-lg border border-gray-200 shadow-sm overflow-y-auto"
                                sortDescriptor={sortDescriptor}
                                onSortChange={setSortDescriptor}
                                onRowAction={handleRowAction}
                            >
                                <Table.Header className="h-full w-full">

                                    <Table.Column allowsSorting isRowHeader id="name" minWidth={200} className="hover:text-gray-900">
                                        {({ sortDirection }: { sortDirection?: "ascending" | "descending" }) => (
                                            <SortableColumnHeader sortDirection={sortDirection}>UTENTE</SortableColumnHeader>
                                        )}
                                    </Table.Column>
                                    <Table.Column allowsSorting id="role" minWidth={120} className="hover:text-gray-900">
                                        {({ sortDirection }: { sortDirection?: "ascending" | "descending" }) => (
                                            <SortableColumnHeader sortDirection={sortDirection}>RUOLO</SortableColumnHeader>
                                        )}
                                    </Table.Column>
                                    <Table.Column allowsSorting id="status" minWidth={120} className="hover:text-gray-900">
                                        {({ sortDirection }: { sortDirection?: "ascending" | "descending" }) => (
                                            <SortableColumnHeader sortDirection={sortDirection}>STATO</SortableColumnHeader>
                                        )}
                                    </Table.Column>
                                    <Table.Column allowsSorting id="createdAt" minWidth={140} className="hover:text-gray-900">
                                        {({ sortDirection }: { sortDirection?: "ascending" | "descending" }) => (
                                            <SortableColumnHeader sortDirection={sortDirection}>REGISTRAZIONE</SortableColumnHeader>
                                        )}
                                    </Table.Column>
                                </Table.Header>
                                <Table.Body
                                    items={sortedItems}
                                    renderEmptyState={() => (
                                        <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center bg-white">
                                            <Inbox className="text-default-300" size={40} />
                                            <span className="text-sm text-gray-600">Nessun utente trovato, prova a modificare i criteri di ricerca.</span>
                                        </EmptyState>
                                    )}
                                >
                                    {(item) => (
                                        <Table.Row key={item.id} id={item.id} className="cursor-pointer hover:bg-gray-50 transition-colors">

                                            <Table.Cell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-500 font-bold text-sm">
                                                                {item.name.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <span className="font-semibold text-sm capitalize text-gray-700">{item.name}</span>
                                                        <span className="text-xs text-gray-400">{item.email}</span>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Chip
                                                    className="capitalize border-none gap-1"
                                                    size="lg"
                                                    variant="soft">
                                                    <Chip.Label className="font-semibold">{item.role}</Chip.Label>
                                                </Chip>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Chip
                                                    color={getStatusColor(item.status)}
                                                    size="lg"
                                                    variant="soft">
                                                    <Chip.Label>{item.status}</Chip.Label>
                                                </Chip>
                                            </Table.Cell>
                                            <Table.Cell><span className="text-sm text-gray-700">{item.createdAt}</span></Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>
                </Virtualizer>
            )}

            <div className="py-2 flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 font-medium">
                    Totale: {sortedItems.length} {sortedItems.length === 1 ? "utente" : "utenti"}
                </span>
            </div>
            <EditUserModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    );
}