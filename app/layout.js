import './globals.css';

export const metadata = {
  title: 'RakshaSetu — Crisis Alert Prototype',
  description: 'Live area map, crisis reporting, and rescue-team dashboard.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
