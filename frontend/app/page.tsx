'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Vineyard landscape"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            In Vino Veritas
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Investissez dans le foncier agricole et viticole via la blockchain
          </p>
          <Link 
            href="/projects" 
            className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Découvrir nos parcelles
          </Link>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Points Forts</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold mb-4">Soutien aux Exploitants Agricoles</h3>
              <p className="text-gray-600">
                Nous facilitons l&lsquo;accès au foncier pour les viticulteurs et agriculteurs, 
                leur permettant de démarrer ou développer leur activité sans l&lsquo;obstacle 
                financier initial. Notre plateforme crée un lien direct entre exploitants 
                et investisseurs, favorisant le développement durable du secteur agricole.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-4">Finance Démocratisée</h3>
              <p className="text-gray-600">
                Grâce à la tokenisation, nous ouvrons l&lsquo;investissement dans le foncier 
                agricole à tous. Les petits investisseurs peuvent maintenant participer 
                au développement du secteur agricole et bénéficier des rendements 
                associés, tout en contribuant à l&lsquo;économie réelle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}