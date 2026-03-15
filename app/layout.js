// app/layout.js
import './globals.css';

export const metadata = {
  title: 'TaskFlow — Task Management',
  description: 'A secure, full-stack task management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 antialiased">{children}</body>
    </html>
  );
}
