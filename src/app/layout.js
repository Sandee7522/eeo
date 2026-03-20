import '../../styles/globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export const metadata = {
  title: 'MapScrape — Google Maps Data Scraping for Lead Generation',
  description:
    'Extract business data from Google Maps. Filter by country, state, city. Export to CSV/Excel. Fast, scalable scraping for sales and lead gen.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
