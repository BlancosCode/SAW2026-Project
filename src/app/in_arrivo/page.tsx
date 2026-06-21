"use client";

import React, { useState } from "react";
import CustomHeader from "@/../components/CustomHeader";
import Footer from "@/../components/CustomFooter";
import Image from "next/image";

export default function InArrivoPage() {
    // in questo modo posso inserire o modificare le funzionalitá in arrivo direttamente da upcomingFeatures, visto che il codice che le renderizza é dinamico
    // scandisce questo array e per ogni elemento mi crea la sezione dedicata
  const upcomingFeatures = [
    {
      title: "Sistema di Recensioni e Feedback",
      description: "La fiducia è alla base di ogni collaborazione di successo. Stiamo introducendo un sistema di recensioni bilaterale che permetterà ad aziende e freelancer di valutarsi a vicenda al termine di ogni progetto. Questo non solo aiuterà i talenti a costruire una reputazione solida sulla piattaforma, ma garantirà anche alle aziende di scegliere i collaboratori migliori basandosi su feedback reali e verificati.",
      largeImage: "/img/banner.jpg",
      smallImage: "/img/img-left.jpg"
    },
    {
      title: "Pagamenti Sicuri e Fatturazione Integrata",
      description: "Dimentica lo stress della burocrazia. Con il prossimo aggiornamento, implementeremo un sistema di pagamenti sicuri integrato direttamente in RAW Talent. Le aziende potranno depositare il budget del progetto e i freelancer verranno pagati in base al completamento delle milestone. Inoltre, il sistema genererà in automatico fatture e ricevute, semplificando la contabilità per tutti.",
      largeImage: "/img/img-right.jpg",
      smallImage: "/img/img-left.jpg"
    },
    {
      title: "Community Hub ed Eventi di Formazione",
      description: "RAW Talent non è solo un portale di lavoro, è un ecosistema per crescere. Stiamo sviluppando un&apos;area Community dove le aziende potranno contrattare i freelancer per progetti specifici, potrai confrontarti con professionisti, partecipare a discussioni, e chattare direttamente in piattaforma con il team del tuo progetto. In futuro, organizzeremo anche eventi di formazione online e offline, workshop e webinar con esperti del settore per aiutarti a migliorare le tue competenze e rimanere aggiornato sulle ultime tendenze del mercato.",
      largeImage: "/img/banner.jpg",
      smallImage: "/img/img-right.jpg"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <CustomHeader />
      
      <div className="pt-32 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        
        <div className="text-center mb-20 animate-in fade-in duration-1000">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Novità in Arrivo</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Il nostro team di sviluppo è costantemente al lavoro per migliorare RAW. <br/> 
            Ecco un&apos;anteprima delle funzionalità che introdurremo nei prossimi mesi.
          </p>
          <p className="text-red-900 text-lg font-black mt-2">
            (DevLog)
          </p>
        </div>

        <div className="flex flex-col gap-20">
          {upcomingFeatures.map((feature, index) => (
            // Uso il titolo come chiave univoca
            <div key={feature.title} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             {/* Contenitore Immagine Grande */}
              <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg mb-10 border border-gray-100 group">
                <Image 
                  src={feature.largeImage} 
                  alt={`Copertina ${feature.title}`} 
                  fill // Riempie lo spazio del contenitore padre
                  sizes="(max-width: 768px) 100vw, 1024px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{feature.title}</h2>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-2/3 text-gray-600 text-lg leading-relaxed font-medium">
                  {feature.description}
                </div>
                
                {/* Contenitore Immagine Piccola */}
                <div className="relative md:w-1/3 w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-md border border-gray-100 shrink-0 group">
                  <Image 
                    src={feature.smallImage} 
                    alt={`Dettaglio ${feature.title}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
              </div>

              {index !== upcomingFeatures.length - 1 && (
                <div className="mt-20 w-full flex justify-center">
                  <div className="w-[95%] h-0.5 bg-gray-200 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}