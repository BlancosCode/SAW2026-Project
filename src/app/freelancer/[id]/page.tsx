import { getPublicFreelancerProfile } from "@/../actions/userActions";
import { notFound } from "next/navigation";
import { FreelancerClientView } from "@/../components/FreelancerID/FreelancerClientView";

export default async function FreelancerPublicProfile({ params }: { params: Promise<{ id: string }> }) {
    // 1. Risolvi i parametri
    const resolvedParams = await params;

    // 2. Fetch dei dati dal Server
    const { success, profile, error } = await getPublicFreelancerProfile(resolvedParams.id);

    // 3. Gestione errori o utente non trovato
    if (!success || !profile) {
        notFound();
    }

    // 4. Passa i dati al Client Component per il rendering
    const safeProfile = JSON.parse(JSON.stringify(profile));
    return <FreelancerClientView profile={safeProfile} />;
}