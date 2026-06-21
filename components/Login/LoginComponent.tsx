"use client";

import { useState, useEffect } from "react";
import { DoorClosedLocked, Loader2 } from "lucide-react";
import LoginModal from "./LoginModal";
import Link from "next/link";
import { getLoggedUserBadgeData } from "@/../actions/userActions";

export default function LoginComponent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userData, setUserData] = useState<{ role: string; initials: string; coverColor: string; profilePicture?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLoggedUserBadgeData().then((data) => {
      setUserData(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (userData) {
    return (
      <Link 
        href={`/dashboard/${userData.role}`}
        className="cursor-pointer w-12 h-12 rounded-full shadow-sm border-2 border-white flex items-center justify-center text-white text-lg font-black transition-all hover:shadow-md hover:scale-105 select-none overflow-hidden"
        style={{ backgroundColor: userData.coverColor }}
        title="Vai alla tua Dashboard"
      >
        {userData.profilePicture ? (
          <img src={userData.profilePicture} alt="Profilo" className="w-full h-full object-cover" />
        ) : (
          userData.initials
        )}
      </Link>
    );
  }

  return (
    <>
      {/* Bottone Login Circolare */}
      <div 
        onClick={() => setIsLoginModalOpen(true)}
        className="cursor-pointer w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md hover:bg-gray-100 transition-all group"
        title="Accesso Area Personale"
      >
        <DoorClosedLocked className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
      </div>

      {/*Gestione del MODALE DI LOGIN */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}