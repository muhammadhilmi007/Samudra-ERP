/**
 * Samudra Paket ERP - Frontend
 * Home page component
 */

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Samudra Paket ERP
        </h1>
        <p className="text-center text-xl mb-4">
          PT. Sarana Mudah Raya
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-secondary">
            Enterprise Resource Planning System
          </h2>
          <p className="mb-4">
            Integrated system for managing logistics, delivery, and business operations.
          </p>
        </div>
      </div>
    </main>
  );
}
