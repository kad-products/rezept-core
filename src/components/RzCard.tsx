type CardAction = {
	href: string;
	text: string;
};

export default function RzCard({
	title,
	body,
	actions,
}: {
	title: string;
	body?: string;
	actions: CardAction[];
}): React.ReactNode {
	return (
		<div className="rz-card">
			<div className="rz-card-title">{title}</div>
			{body && <div className="rz-card-body">{body}</div>}
			<div className="rz-card-actions">
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
