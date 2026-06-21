// Sviluppato da Gemini,assistito e controllato passo dopo passo da me per la gestione delle notifiche push 
// Questo listener cattura l'evento push lanciato dal nostro backend (tramite i server Google/Apple)
self.addEventListener('push', function (event) {
    if (event.data) {
        let data;
        try {
            data = event.data.json();
        } catch (e) {
            // Se non è JSON valido, usiamo il testo grezzo come corpo della notifica
            data = {
                title: 'Nuova Notifica',
                body: event.data.text(),
                url: '/'
            };
        }

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
        event.waitUntil(self.registration.showNotification(data.title || 'Nuova Notifica', options));
    }
});

// Questo listener reagisce al "tap" dell'utente sulla notifica
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    // Aggiungiamo un controllo per verificare che ci siano client attivi
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se non trova una tab aperta, ne apre una nuova
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});