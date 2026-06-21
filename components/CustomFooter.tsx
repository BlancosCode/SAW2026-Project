export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 px-4 md:px-8 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Sezione Copyright */}
        <div className="text-center md:text-left">
          <p className="text-sm font-medium">
            &copy; {currentYear} RAW. Tutti i diritti riservati.
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-200 italic">
            Spazio per futuri sponsor [WIP]
          </p>
        </div>
        {/* Link di navigazione */}
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm font-medium">
          <p>
            Contattaci su: info@rawtalent.it
          </p>
        </nav>
      </div>
    </footer>
  );
}