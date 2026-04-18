import "./globals.css";

export const metadata = {
  title: "FlowTune",
  description: "Music App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
