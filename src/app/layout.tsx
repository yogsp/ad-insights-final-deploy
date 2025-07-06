import { Metadata } from 'next';
import * as React from 'react';

import '@/styles/globals.css';

// This is the correct place to set the page title and favicon for a Next.js app.
export const metadata: Metadata = {
  title: 'AdInsight', // Sets the browser tab title
  description: 'AI-powered ad analysis by Stratuscast Phils., Inc.',
  icons: {
    icon: 'https://i.imgur.com/u8y10AV.png', // URL for the new favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}