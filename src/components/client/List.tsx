// basing at least the signature here off rc-listy which is scheduled to come to Ant in v7
export default async function List<T extends { id: string }>({
	items,
	itemRender,
}: {
	items: T[];
	itemRender: (item: T) => React.ReactNode;
}) {
	return (
		<div className="rezept-list">
			{items.map(item => {
				return (
					<div key={item.id} className="rezept-list-item">
						{itemRender(item)}
					</div>
				);
			})}
		</div>
	);
}
