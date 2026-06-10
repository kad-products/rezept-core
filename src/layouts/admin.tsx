import AdminMenubar from '../components/navs/AdminMenubar';

export default function AdminLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }): React.ReactNode {
	return (
		<div>
			<header>
				<a href="/admin">Rezept Admin</a>
				<AdminMenubar />
			</header>
			<main>
				<h2 className="page-title">{pageTitle}</h2>
				{children}
			</main>
		</div>
	);
}
