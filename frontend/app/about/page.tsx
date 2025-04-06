import Image from 'next/image';

export default function About() {
  const teamMembers = [
    {
      name: 'Kévin',
      role: 'DeFi Consultant',
      avatar: '/images/team/defi.jpg'
    },
    {
      name: 'Benoist',
      role: 'DeFi Consultant',
      avatar: '/images/team/defi.jpg'
    },
    {
      name: 'Frédéric',
      role: 'DeFi Consultant',
      avatar: '/images/team/defi.jpg' 
    },
    {
      name: 'Franck',
      role: 'Web3 Developer',
      avatar: '/images/team/dev.jpg'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-center mb-8">À propos d&lsquo;In Vino Veritas</h1>
        <div className="prose prose-lg mx-auto">
          <p className="text-xl text-gray-700 mb-6">
            In Vino Veritas est un projet innovant de tokenisation d&lsquo;actifs réels (RWA) dans le domaine agricole et viticole. Notre mission est de démocratiser l&lsquo;accès à l&lsquo;investissement foncier agricole en utilisant la technologie blockchain.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Notre Vision</h2>
            <p className="text-gray-700 mb-4">
              Nous croyons en un avenir où l&lsquo;investissement dans le foncier agricole et viticole est accessible à tous. Notre plateforme permet aux nouveaux exploitants d&lsquo;accéder à du foncier et de démarrer leur activité tout en offrant aux investisseurs la possibilité de participer au développement du secteur agricole.
            </p>
            <h2 className="text-2xl font-semibold mb-4">Comment ça marche ?</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Tokenisation de parcelles agricoles et viticoles</li>
              <li>Accès facilité pour les nouveaux exploitants qui souhaitent louer du foncier</li>
              <li>Investissement possible pour les petits investisseurs qui souhaitent participer au développement du secteur agricole et profiter de parts de revenus associés à la location du foncier auprès d&lsquo;exploitants ainsi que de rendements associés à la finance décentralisée</li>
              <li>Onboarding, support et accompagnement tout au long du projet</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-12">Notre Équipe</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={member.avatar}
                alt={`${member.name}'s avatar`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
            <p className="text-gray-600 text-center">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
