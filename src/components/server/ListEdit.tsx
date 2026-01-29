import { Suspense } from 'react';
import ListItemForm from '@/forms/list-item';
import { removeListItem } from '@/functions/list-items';
import { getListItemsByListId } from '@/repositories/list-items';
import { getListById } from '@/repositories/lists';
import List from '../client/List';
import ListItem from '../client/ListItem';

export default async function ListEdit({ listId }: { listId: string }) {
	const list = await getListById(listId);

	if (!list) {
		return null;
	}

	const listItems = await getListItemsByListId(listId);

	return (
		<Suspense fallback={<div>Loading recipe...</div>}>
			<h3>Edit {list.name}</h3>
			<nav className="in-page-nav">
				<a href={`/lists/${list.id}`}>View</a>
			</nav>
			<List
				items={listItems}
				itemRender={item => <ListItem item={item} handleRemove={removeListItem} />}
			/>
			<ListItemForm listId={listId} />
		</Suspense>
	);
}
