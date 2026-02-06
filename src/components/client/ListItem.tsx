'use client';
import type { ListItemWithRelations } from '@/repositories/list-items';

export default function ListItem({
	item,
	handleRemove,
}: {
	item: ListItemWithRelations;
	handleRemove?: (itemId: string) => void;
}) {
	return (
		<div key={item.id}>
			{handleRemove && (
				<button type="button" onClick={() => handleRemove(item.id)}>
					Remove
				</button>
			)}
			<div>
				({item.quantity} {item.unit?.abbreviation}) {item.ingredient?.name}
			</div>
			<div>{item.ingredient?.description}</div>
			{item.notes && <div>{item.notes}</div>}
			<hr />
		</div>
	);
}
