'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const properties = [
    {
      title: 'Domaine Viticole en Bourgogne',
      location: 'Côte de Beaune',
      size: '5 hectares',
      type: 'Vignoble',
      image: '/images/properties/vineyard1.jpg',
      description: 'Parcelle de vigne en AOC, idéale pour la production de vins de qualité',
      price: '750 000 €'
    },
    {
      title: 'Ferme Agricole en Normandie',
      location: 'Pays d\'Auge',
      size: '12 hectares',
      type: 'Polyculture',
      image: '/images/properties/farm1.jpg',
      description: 'Terres fertiles adaptées à la polyculture et à l\'élevage',
      price: '950 000 €'
    },
    {
      title: 'Vignoble en Vallée du Rhône',
      location: 'Côtes du Rhône',
      size: '8 hectares',
      type: 'Vignoble',
      image: '/images/properties/vineyard2.jpg',
      description: 'Parcelle de vigne en appellation contrôlée, parfaite pour les vins rouges',
      price: '450 000 €'
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
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
            href="/properties" 
            className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Découvrir nos parcelles
          </Link>
        </div>
      </section>

      {/* Key Strengths Section */}
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

      {/* Properties Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Parcelles Disponibles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-2">{property.location}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{property.size}</span>
                    <span>{property.type}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{property.price}</p>
                  <p className="text-gray-700 mb-4">{property.description}</p>
                  <Link 
                    href={`/projets/${index + 1}`}
                    className="block text-center bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à Investir dans l&lsquo;Agriculture de Demain ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez notre plateforme et participez au développement durable du secteur agricole
          </p>
          <Link 
            href="/register" 
            className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Commencer à Investir
          </Link>
        </div>
      </section>
    </main>
  );
}