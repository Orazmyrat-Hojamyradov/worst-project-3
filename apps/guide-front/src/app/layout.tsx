import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Metadata } from 'next';
import "./globals.css";
import ClientProviders from '@/components/Providers/ClientProviders';
import { NextIntlClientProvider } from 'next-intl';

export const metadata: Metadata = {
  title: 'Smart Device Instructor',
  description: 'Explore!',
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <ClientProviders>
          <Header />
          {children}
          <Footer />
        </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}