"use client";

// dopo aver scritto la pagina principale l'ho fatta refattorizzare da gemini per risolvere errori di typescript, react e next

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@heroui/react";
import Image from "next/image";
import CustomHeader from "@/../components/CustomHeader";
import SearchTalentModal from "@/../components/SearchTalentModal";
import Footer from "@/../components/CustomFooter";

export default function Home() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <CustomHeader />

      {/* BANNER */}
      <section className="relative w-full h-[45vh] max-h-[450px] bg-[url('/img/banner.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/100 to-white/0 z-1" />

        {/* Contenuto del Banner */}
        <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000 z-2">
          {/* Logo ottimizzato con div relative e object-contain */}
          <div className="relative w-64 h-32 md:w-96 md:h-48 flex justify-center opacity-80 mb-4">
            <Image
              src="/img/logotipoTag.png"
              alt="Logo RAW"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-lg md:text-3xl font-medium text-gray-500 m-2 text-center">
            Un portale per i giovani e aziende, <br />con risorse, eventi e opportunità per crescere e realizzare i propri sogni.<br /> Da giovani per i giovani.
          </p>
          <a href="#coseraw" className="text-lg md:text-xl font-medium text-gray-500 mb-6 hover:text-red-900 transition-colors">
            Scopri di più.
          </a>
        </div>
      </section>

      {/* SEZIONE INFORMATIVA */}
      <section className="relative z-3 max-w-6xl mx-auto px-4 pb-24 flex flex-col gap-20">

        {/* PULSANTE DI RICERCA */}
        <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onPress={() => setIsSearchModalOpen(true)}
            className="bg-red-900 hover:bg-red-700 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          >
            <Search className="w-5 h-5 mr-2" />
            Cerca i Tuoi Talenti
          </Button>
        </div>

        {/* BLOCCO 1: Per le aziende / Per i freelancer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in duration-1000">
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">Per le aziende</h3>
            <p className="text-gray-600 leading-relaxed font-medium md:text-lg">
              [WIP] RAW aiuta le aziende a trovare i talenti più adatti per i propri progetti. Semplifichiamo il processo di ricerca, selezione e gestione dei freelancer, offrendo strumenti avanzati per il monitoraggio dei lavori e l&apos;amministrazione.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in duration-1000">
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">Per i freelancer</h3>
            <p className="text-gray-600 leading-relaxed font-medium md:text-lg">
              [WIP] RAW offre ai freelancer una vetrina per le proprie competenze e l&apos;accesso a opportunità lavorative di qualità. Gestisci il tuo profilo, collabora con le aziende e organizza le tue finanze in un ecosistema pensato per te.
            </p>
          </div>
        </div>

        {/* BLOCCO 2: Cos'è RAW + Immagine SX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center" id="coseraw">
          {/* Immagine */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 h-64 md:h-96">
            <Image
              src="/img/img-left.jpg"
              alt="Info RAW SX"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {/* Testo */}
          <div className="animate-in fade-in duration-1000 p-6 md:p-0" >
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Cos&apos;è RAW</h3>
            <p className="text-gray-600 leading-relaxed font-medium md:text-lg">
              [WIP] RAW è una piattaforma innovativa progettata per rivoluzionare il modo in cui le aziende e i freelancer collaborano. La nostra missione è creare un ambiente digitale che faciliti la connessione tra aziende alla ricerca di talenti e freelancer desiderosi di offrire le proprie competenze. Con RAW, miriamo a semplificare il processo di collaborazione, fornendo strumenti efficaci per la gestione dei progetti, la comunicazione e la trasparenza, garantendo al contempo un&apos;esperienza utente fluida e soddisfacente per entrambe le parti coinvolte.
            </p>
          </div>
        </div>

        {/* BLOCCO 3: Cosa facciamo + Immagine DX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Testo */}
          <div className="animate-in fade-in duration-1000 order-2 md:order-1 p-6 md:p-0 ">
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Cosa facciamo</h3>
            <p className="text-gray-600 leading-relaxed font-medium md:text-lg">
              [WIP] RAW offre una piattaforma completa che consente alle aziende di pubblicare progetti, cercare e selezionare freelancer in base alle competenze richieste, gestire le collaborazioni in modo efficiente e monitorare i progressi dei progetti. I freelancer, d&apos;altra parte, possono creare profili dettagliati, candidarsi per progetti che corrispondono alle loro competenze e comunicare direttamente con le aziende per garantire una collaborazione di successo. Con RAW, miriamo a creare un ecosistema dinamico e collaborativo che favorisca la crescita professionale e il successo di entrambe le parti coinvolte.
            </p>
          </div>
          {/* Immagine */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 h-64 md:h-96 md:order-2">
            <Image
              src="/img/img-right.jpg"
              alt="Info RAW DX"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

      </section>

      {/* HOOK DI MARKETING */}
      <div className="max-w-5xl mx-auto mt-8 mb-20 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in duration-300">
          <div className="text-lg font-black text-gray-900 mb-4">
            Hook accattivante per legare il portale alla società di Marketing [WIP]
          </div>
          <p className="text-gray-500 mt-2">
            &quot;Vuoi dare un boost alla tua azienda? Contattaci e potremo metterti in contatto con le migliori agenzie di marketing e comunicazione per far crescere il tuo business!&quot; <br />
            [Inserire qui eventuale form di contatto rapido o link alla pagina di contatto]
          </p>
        </div>
      </div>

      <SearchTalentModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <Footer />
    </main>
  );
}