# Progetto d'Esame: RAW Talent Platform

**Corso di Sviluppo Applicazioni Web (SAW)**

Il presente documento illustra le istruzioni di installazione, le configurazioni necessarie e le funzionalità principali dell'applicativo **RAW Talent Platform**.

Il sistema è strutturato come una Progressive Web App (PWA) e ha l'obiettivo di fornire un ambiente gestionale per facilitare l'interazione e l'assegnazione di progetti tra aziende (Company) e professionisti (Freelancer), sotto la supervisione di amministratori di sistema (Manager).

---

## 1. Istruzioni per l'Installazione e l'Avvio

Per eseguire l'applicazione in ambiente locale, è necessario seguire i seguenti passaggi:

1. Verificare la corretta installazione dell'ambiente di runtime **Node.js**.
2. Clonare il repository del progetto e posizionarsi all'interno della directory principale tramite terminale.
3. Eseguire l'installazione delle dipendenze necessarie tramite il comando:
```bash
npm install

```


4. **Configurazione delle Variabili d'Ambiente:** Inserire il file `.env` (fornito in allegato alla presente consegna, come da specifiche del progetto) nella cartella root. Tale file contiene le chiavi di configurazione essenziali per la connessione al database MongoDB, al provider di autenticazione (Better Auth) e allo storage cloud (Cloudflare R2) per la gestione dei file multimediali.
5. Avviare il server di sviluppo tramite il comando:
```bash
npm run dev

```


6. L'applicazione sarà accessibile tramite browser all'indirizzo: `http://localhost:3000`.
7. **Requisiti PWA:** L'applicativo rispetta i vincoli richiesti: è installabile nativamente sul dispositivo, è in grado di gestire l'assenza di rete tramite service worker (fallback offline) ed è integrato con l'API per le notifiche Push.

---

## 2. Credenziali per la Valutazione (Dati di Test)

Per consentire al docente di ispezionare integralmente le funzionalità dell'applicativo e il sistema di autorizzazione (Role-Based Access Control), sono stati preconfigurati i seguenti account di test:

* **Ruolo Manager (Amministratore di Sistema)**
* **Email:** `managersaw@exam.com`
* **Password:** `saw671914`


* **Ruolo Company (Azienda Cliente)**
* **Email:** `companysaw@exam.com`
* **Password:** `saw671914`


* **Ruolo Freelancer (Professionista)**
* **Email:** `freelancersaw@exam.com`
* **Password:** `saw671914`

---

## 3. Architettura e Navigazione per Ruolo

La piattaforma instrada automaticamente l'utente verso una dashboard dedicata in base ai privilegi associati al suo token di sessione.

### 3.1. Dashboard Manager (`/dashboard/manager`)

Interfaccia di amministrazione globale. Utilizza una navigazione ancorata per gestire flussi di dati ad alta densità:

* **Progetti Interni:** Tabella interattiva (dotata di filtri di ricerca e ordinamento client-side) per il monitoraggio dei progetti. Consente la creazione di nuove commesse, l'assegnazione alle aziende clienti e la selezione dei team di freelancer.
* **Creazione Utenti:** Modulo per la registrazione autorizzata di nuovi account (Freelancer, Aziende o Manager). L'operazione sincronizza in tempo reale il provider di identità e il database non relazionale.
* **Database Utenti:** Componente a lista virtualizzata per l'ispezione completa dell'utenza. Consente l'eliminazione massiva dei record e l'aggiornamento dettagliato dei metadati di ogni singolo profilo (inclusa la personalizzazione cromatica dell'interfaccia).

### 3.2. Dashboard Freelancer (`/dashboard/freelancer`)

Interfaccia dedicata ai professionisti. Implementa una navigazione asincrona a schede (Tabs) per evitare ricaricamenti di pagina:

* **Il Mio Profilo:** Riepilogo anagrafico e professionale. Tramite finestra modale, l'utente può aggiornare la propria biografia, caricare la foto profilo e il Curriculum Vitae in formato PDF (con storicizzazione su cloud object storage).
* **Portfolio:** Sezione in cui il professionista può caricare fino a un massimo di 5 progetti espositivi. Le immagini caricate usufruiscono dell'ottimizzazione dinamica del framework per massimizzare le prestazioni (Core Web Vitals).
* **Progetti e Incarichi:** Visualizzazione in sola lettura degli incarichi assegnati dal Manager, comprensiva di calcolo algoritmico della quota di compenso netto spettante al singolo collaboratore.

### 3.3. Dashboard Company (`/dashboard/company`)

Interfaccia dedicata alle aziende clienti:

* **Profilo Aziendale:** Gestione delle informazioni istituzionali (Partita IVA, Settore, Contatti) e upload del logo aziendale per la personalizzazione del brand.
* **Progetti:** Dashboard di monitoraggio dello stato di avanzamento delle commesse, con metriche su budget totale e cronologia delle fasi progettuali (proposta, accettazione, chiusura).
* **Freelancers:** Griglia interattiva dei professionisti attualmente associati ai progetti dell'azienda, con la possibilità di accedere al profilo pubblico di ciascun collaboratore per visionarne il portfolio.