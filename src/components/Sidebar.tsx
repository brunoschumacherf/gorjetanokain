export function FooterLinks() {
  const links = [
    { nome: 'YouTube', url: 'https://www.youtube.com/@Nokainbets', icon: '▶️' },
    { nome: 'LivePix', url: 'https://livepix.gg/nokainlive', icon: '💰' },
    { nome: 'Twitch', url: 'https://www.twitch.tv/nokainlive?lang=pt-br', icon: '🎮' },
    { nome: 'Instagram', url: 'https://www.instagram.com/nokainlives/', icon: '📷' }
  ];

  return (
    <footer className="bg-slate-800 border-t-4 border-amber-400/50 py-12 mt-16 relative">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-black text-center mb-8 text-white">Siga-nos nas redes sociais</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <a
              key={link.nome}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2 border-amber-400/60"
            >
              <span className="text-3xl">{link.icon}</span>
              <span className="text-lg">{link.nome}</span>
            </a>
          ))}
        </div>
        <p className="text-center text-white/90 mt-8 text-lg font-semibold">
          ✨ Participe e ganhe gorjetas incríveis! ✨
        </p>
      </div>
    </footer>
  );
}
