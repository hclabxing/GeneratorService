import "./globals.css";

export const metadata = { title: "生成器", description: "随机数与名言" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN">
			<body>
				<main className="container">{children}</main>
			</body>
		</html>
	);
}
