// Sviluppato da Gemini,assistito e controllato passo dopo passo da me per la gestione delle notifiche push 
// Questo listener cattura l'evento push lanciato dal nostro backend (tramite i server Google/Apple)
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/img/logotipoTag.png', // Icona visibile nella notifica (usa il tuo logo!)
            badge: '/img/logotipoTag.png', // Icona piccola monocromatica per la barra di stato Android
            vibrate: [100, 50, 100], // Pattern di vibrazione (bzz-pausa-bzz)
            data: {
                url: data.url || '/' // Salviamo l'url a cui reindirizzare l'utente al click
            },
        };

        // Mostra la tendina nativa di notifica del sistema operativo
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

// Questo listener reagisce al "tap" dell'utente sulla notifica
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    // Apre la finestra del browser (o l'app PWA se installata) portando l'utente alla schermata corretta
    event.waitUntil(clients.openWindow(urlToOpen));
});