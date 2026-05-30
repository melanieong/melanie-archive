import { Inter, Literata, Karla } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-literata',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  display: 'swap',
});

export const metadata = {
  title: "MELANIE'S ARCHIVE | Learning Journeys & Archives",
  description: "A digital workspace built with absolute intention, presenting dynamic portfolio projects and monographs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`light ${inter.variable} ${literata.variable} ${karla.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-canvas-warm text-on-surface font-body-md overflow-hidden h-screen selection:bg-green-light">
        {children}
      </body>
    </html>
  );
}
