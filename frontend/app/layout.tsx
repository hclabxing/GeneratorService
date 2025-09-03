import "./globals.css";

export const metadata = { title: "Generator", description: "Random number & quote" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<main className="container">{children}</main>
			</body>
		</html>
	);
}
