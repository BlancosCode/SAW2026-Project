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
5. **Avvio in Modalità Sviluppo (Standard):**
Per ispezionare il codice e navigare l'interfaccia in modalità sviluppo, eseguire:
```bash
npm run dev

```


L'applicazione sarà accessibile all'indirizzo: `http://localhost:3000`.

---

## 2. Modalità di Collaudo PWA e Notifiche Push (Importante)

Per valutare correttamente i requisiti avanzati del progetto (Installabilità della PWA, funzionamento del Service Worker, caching offline e Notifiche Push), è **strettamente necessario** simulare l'ambiente di produzione. In modalità sviluppo (`npm run dev`), le librerie PWA disabilitano i Service Worker per prevenire conflitti di caching.

**Procedura per il collaudo della PWA:**

1. Interrompere l'eventuale server di sviluppo in esecuzione.
2. Compilare l'applicazione generando la build di produzione e il file `sw.js`:
```bash
npm run build

```


3. Avviare il server di produzione:
```bash
npm run start

```



**Test delle Funzionalità:**

* **Installazione PWA:** Accedendo all'indirizzo `http://localhost:3000` con un browser compatibile (es. Chrome), comparirà l'icona di installazione nativa nella barra degli indirizzi. In alternativa, è possibile verificarne l'attivazione tramite i *Developer Tools -> Application -> Manifest / Service Workers*.
* **Notifiche Push:** 1. Effettuare l'accesso con un account Freelancer o Azienda e cliccare su "Attiva Ora" nel pannello delle Notifiche Push, fornendo il consenso al browser.
2. Per simulare la ricezione reale, è possibile accedere con l'account Manager da una finestra in incognito e assegnare un nuovo progetto a quell'utente: la notifica verrà triggerata automaticamente dal server e recapitata al dispositivo.

---

## 3. Credenziali per la Valutazione (Dati di Test)

Per consentire l'ispezione integrale delle funzionalità dell'applicativo e del sistema di autorizzazione (Role-Based Access Control), sono stati preconfigurati i seguenti account di test:

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

## 4. Architettura e Navigazione per Ruolo

La piattaforma instrada automaticamente l'utente verso una dashboard dedicata in base ai privilegi associati al suo token di sessione.

### 4.1. Dashboard Manager (`/dashboard/manager`)

Interfaccia di amministrazione globale. Utilizza una navigazione ancorata per gestire flussi di dati ad alta densità:

* **Progetti Interni:** Tabella interattiva (dotata di filtri di ricerca e ordinamento client-side) per il monitoraggio dei progetti. Consente la creazione di nuove commesse, l'assegnazione alle aziende clienti e la selezione dei team di freelancer.
* **Creazione Utenti:** Modulo per la registrazione autorizzata di nuovi account (Freelancer, Aziende o Manager). L'operazione sincronizza in tempo reale il provider di identità e il database non relazionale.
* **Database Utenti:** Componente a lista virtualizzata per l'ispezione completa dell'utenza. Consente l'eliminazione dei record e l'aggiornamento dettagliato dei metadati di ogni singolo profilo (inclusa la personalizzazione cromatica dell'interfaccia).

### 4.2. Dashboard Freelancer (`/dashboard/freelancer`)

Interfaccia dedicata ai professionisti. Implementa una navigazione asincrona a schede (Tabs) per evitare ricaricamenti di pagina:

* **Il Mio Profilo:** Riepilogo anagrafico e professionale. Tramite finestra modale, l'utente può aggiornare la propria biografia, caricare la foto profilo e il Curriculum Vitae in formato PDF (con storicizzazione su cloud object storage).
* **Portfolio:** Sezione in cui il professionista può caricare fino a un massimo di 5 progetti espositivi. Le immagini caricate usufruiscono dell'ottimizzazione dinamica del framework per massimizzare le prestazioni (Core Web Vitals).
* **Progetti e Incarichi:** Visualizzazione in sola lettura degli incarichi assegnati dal Manager, comprensiva di calcolo algoritmico della quota di compenso netto spettante al singolo collaboratore.

### 4.3. Dashboard Company (`/dashboard/company`)

Interfaccia dedicata alle aziende clienti:

* **Profilo Aziendale:** Gestione delle informazioni istituzionali (Partita IVA, Settore, Contatti) e upload del logo aziendale per la personalizzazione del brand.
* **Progetti:** Dashboard di monitoraggio dello stato di avanzamento delle commesse, con metriche su budget totale e cronologia delle fasi progettuali (proposta, accettazione, chiusura).
* **Freelancers:** Griglia interattiva dei professionisti attualmente associati ai progetti dell'azienda, con la possibilità di accedere al profilo pubblico di ciascun collaboratore per visionarne il portfolio.