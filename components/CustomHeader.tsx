import LoginComponent from "./Login/LoginComponent";
import Link from "next/link";
export default function CustomHeader() {
    return (
        <header className="fixed top-0 left-0 w-full pt-1 pb-1 px-4 md:px-10 flex justify-start gap-5 md:gap-10 z-50 bg-gradient-to-b from-black/60">
            <Link href="/" className="flex text-white justify-start ml-2 font-black hover:text-red-900 transition-all drop-shadow-lg">
                <div>
                    <img src="img/logo.png" alt="Logo" className="h-10 md:h-12 w-auto mr-2 hover:scale-110 transition-transform" />
                </div>
            </Link>
            <nav className="mt-3">
                <Link href="/in_arrivo" className="text-gray-100 text-sm md:text-lg font-bold hover:text-red-900 transition-all drop-shadow-md">
                    Eventi
                </Link>
            </nav>
            <nav className="mt-3">
                <Link href="/in_arrivo" className="text-gray-100 text-sm md:text-lg font-bold hover:text-red-900 transition-all drop-shadow-md">
                    Articoli
                </Link>
            </nav>
            <nav className="mt-3">
                <Link href="/in_arrivo" className="text-gray-100 text-sm md:text-lg font-bold hover:text-red-900 transition-all drop-shadow-md">
                    In Arrivo...
                </Link>
            </nav>
            <div className="absolute right-4 top-10 transform -translate-y-1/2">
                <LoginComponent />
            </div>
        </header>

    );
}