import { MetadataRoute } from 'next'

//come da slide, modificato ad hoc per le esigenze del progetto, [seguita pure la documentazione di ducanhNextPwa]
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RAW Talent',
    short_name: 'RAW',
    description: 'Un portale per giovani e aziende, con risorse, eventi e opportunità per crescere.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffffff',
    theme_color: '#310606',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}