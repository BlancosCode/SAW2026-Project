import { getPublicFreelancerProfile } from "@/../actions/userActions";
import { notFound } from "next/navigation";
import { FreelancerClientView } from "@/../components/FreelancerID/FreelancerClientView";

export default async function FreelancerPublicProfile({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    const { success, profile, error } = await getPublicFreelancerProfile(resolvedParams.id);

    if (!success || !profile) {
        notFound();
    }

    const safeProfile = JSON.parse(JSON.stringify(profile));
    return <FreelancerClientView profile={safeProfile} />;
}