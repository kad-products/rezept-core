export default function PrintLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }): React.ReactNode {
	return (
		<main>
			<h1>{pageTitle}</h1>
			{children}
		</main>
	);
}
