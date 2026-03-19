import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — RÉCUPÉO',
  description: 'Mentions légales du site recupeo.fr — Éditeur, hébergeur, directeur de publication.',
  alternates: { canonical: 'https://recupeo.fr/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <div className="bg-slate-bg min-h-screen">
      <section className="hero-gradient py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">Mentions légales</h1>
          <p className="text-white/50 mt-3 text-sm">Dernière mise à jour : mars 2026</p>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-slate-border p-8 sm:p-12 space-y-10">

          <Article title="1. Éditeur du site">
            <p><strong>RÉCUPÉO</strong></p>
            <p>Micro-entreprise — Romain EUSTATHIADES</p>
            <p>SIRET : <span className="text-slate-muted italic">[en cours d&apos;attribution — immatriculation déposée le 16/03/2026]</span></p>
            <p>Code APE : 6311Z — Traitement de données, hébergement et activités connexes</p>
            <p>Adresse : Riom (63), France</p>
            <p>Email : <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
          </Article>

          <Article title="2. Directeur de la publication">
            <p>Romain EUSTATHIADES, en qualité de dirigeant de la micro-entreprise RÉCUPÉO.</p>
          </Article>

          <Article title="3. Hébergement">
            <p><strong>OVH SAS</strong></p>
            <p>2, rue Kellermann — 59100 Roubaix, France</p>
            <p>RCS Lille Métropole 424 761 419 00045</p>
            <p>Téléphone : 1007 (depuis la France)</p>
            <p>Site : <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline">www.ovhcloud.com</a></p>
          </Article>

          <Article title="4. Propriété intellectuelle">
            <p>L&apos;ensemble du contenu du site recupeo.fr (textes, images, graphismes, logo, icônes, logiciels, base de données) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification ou exploitation, même partielle, est interdite sans autorisation écrite préalable de RÉCUPÉO.</p>
          </Article>

          <Article title="5. Données personnelles">
            <p>RÉCUPÉO collecte et traite des données personnelles dans le cadre de ses services. Pour en savoir plus, consultez notre <Link href="/confidentialite" className="text-emerald hover:underline">politique de confidentialité</Link>.</p>
          </Article>

          <Article title="6. Cookies">
            <p>Le site utilise Google Analytics 4 à des fins statistiques. Aucun cookie publicitaire n&apos;est déposé. Vous pouvez configurer votre navigateur pour refuser les cookies.</p>
          </Article>

          <Article title="7. Limitation de responsabilité">
            <p>RÉCUPÉO propose un service d&apos;aide à la vérification de documents administratifs et fiscaux par intelligence artificielle. Les pré-diagnostics, rapports et courriers générés constituent une <strong>aide indicative</strong> et ne sauraient se substituer à un avis juridique, fiscal ou comptable professionnel.</p>
            <p>RÉCUPÉO ne peut être tenu responsable des décisions prises sur la base des résultats fournis.</p>
          </Article>

          <Article title="8. Loi applicable">
            <p>Les présentes mentions légales sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux de Riom.</p>
          </Article>

          <div className="pt-6 border-t border-slate-border">
            <p className="text-sm text-slate-muted">Pour toute question, contactez-nous à <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="font-heading text-xl font-bold text-navy mb-4">{title}</h2>
      <div className="text-[15px] text-slate-text/80 leading-relaxed space-y-2">{children}</div>
    </article>
  )
}
