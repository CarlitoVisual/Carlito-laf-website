/**
 * Données structurées schema.org (lues par Google, non exécutées par le navigateur).
 * Les « < » sont échappés pour qu'un texte venant du CMS ne puisse pas fermer la balise.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
