import {WifiOff} from "lucide-react";
import CustomHeader from "@/../components/CustomHeader";
import CustomFooter from "@/../components/CustomFooter";
export default function OfflinePage() {
    return (
        <main className="min-h-screen flex flex-col bg-white">
            <CustomHeader />
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <WifiOff className="w-24 h-24 text-gray-300 mb-6" />
                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Sei Offline</h1>
                <p className="text-lg text-red-500 font-medium max-w-md">
                    Sembra che tu abbia perso la connessione a Internet. Controlla la tua rete e riprova.
                </p>
            </div>
            <CustomFooter />
        </main>
    );
}