type CardAction = {
	href: string;
	text: string;
};

export default async function Card({ title, body, actions }: { title: string; body?: string; actions: CardAction[] }) {
	return (
		<div className="rezept-card">
			<div className="rezept-card-title">{title}</div>
			{body && <div className="rezept-card-body">{body}</div>}
			<div className="rezept-card-actions">
				{actions.map(a => {
					return (
						<a key={a.href} href={a.href}>
							{a.text}
						</a>
					);
				})}
			</div>
		</div>
	);
}
