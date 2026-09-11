import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PassportPro Studio - Free Passport Photo Maker, No Watermark, No Signup',
  description:
    'Create perfect passport size photos free. India, USA, UK sizes, auto white background, A4 print sheet. No watermark, no sign-in, no subscription. 100% free.',
  keywords: [
    'passport photo maker',
    'free passport photo',
    'passport size photo',
    'passport photo online',
    'no watermark passport photo',
    'india passport photo',
    'usa passport photo',
    'uk passport photo',
    'a4 passport photo sheet',
  ],
  authors: [{ name: 'PassportPro Studio' }],
  openGraph: {
    title: 'PassportPro Studio - Free Passport Photo Maker, No Watermark, No Signup',
    description:
      'Create perfect passport size photos free. India, USA, UK sizes, auto white background, A4 print sheet. No watermark, no sign-in, no subscription. 100% free.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PassportPro Studio - Free Passport Photo Maker',
    description:
      'Create perfect passport size photos free. No watermark, no sign-in, no subscription. 100% free.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'PassportPro Studio - Free Passport Photo Maker',
              description:
                'Create perfect passport size photos free. India, USA, UK sizes, auto white background, A4 print sheet. No watermark, no sign-in, no subscription. 100% free.',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                '100% Free',
                'No Sign-In Required',
                'No Watermark',
                'No Subscription',
                '10+ Country Sizes',
                'Auto White Background',
                'A4 Print Sheet',
                'Offline Processing',
                'Mobile Friendly',
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
