/**
 * Landing layout: full-width content. No sidebar when visiting /landing (see LayoutShell).
 */
export const metadata = {
  title: 'MapScrape — Google Maps Data Scraping for Lead Generation',
  description:
    'Extract business data from Google Maps. Filter by country, state, city. Export to CSV/Excel. Fast, scalable scraping for sales and lead gen.',
};

export default function LandingLayout({ children }) {
  return <div className="min-h-screen w-full">{children}</div>;
}
