// Per-page computed data: UI strings for the page language and its JSON-LD blocks.
// Organization, breadcrumb and site-navigation schema are shared; pages add their own in `schema`.
module.exports = {
  t: (data) => data.i18n[data.lang],
  ld: (data) => {
    const { key, lang, routes, site } = data;
    if (!key) return [];
    const t = data.i18n[lang];
    const abs = (k) => site.url + routes[k][lang];
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.nav.home, item: abs('home') },
        { '@type': 'ListItem', position: 2, name: t.nav[key], item: abs(key) },
      ],
    };
    const navigation = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t.navListName,
      itemListElement: ['home', ...site.nav].map((k, i) => (
        { '@type': 'SiteNavigationElement', position: i + 1, name: t.nav[k], url: abs(k) })),
    };
    const faqPage = data.faq && {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((item) => (
        { '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a.join(' ') } })),
    };
    return [data.organization[lang], ...(data.schema || []), ...(faqPage ? [faqPage] : []), ...(key === 'home' ? [] : [breadcrumb]), navigation];
  },
};
