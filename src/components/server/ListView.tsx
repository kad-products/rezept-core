import { Fragment, Suspense } from "react";

import { getListById } from '@/repositories/lists';
import { getListItemsByListId } from '@/repositories/list-items';

export default async function ListView({ listId }: { listId: string }) {

    const list = await getListById( listId );

    if( !list ) {
        return null;
    }

    const listItems = await getListItemsByListId( listId );

    return (
        <Suspense fallback={<div>Loading recipe...</div>}>
            <h3>{ list.name }</h3>
            {
                listItems.map( item => {
                    return <div key={ item.id }>
                        <div>Ing ID: { item.ingredientId }</div>
                        <div>Ing Name: { item.ingredient?.name }</div>
                        <div>Ing Desc: { item.ingredient?.description }</div>
                        <div>Notes: { item.notes }</div>
                        <div>Qty: { item.quantity }</div>
                        <div>Status: { item.status }</div>
                        <div>Unit ID: { item.unitId }</div>
                        <div>Unit Name: { item.unit?.name }</div>
                        <div>Unit Abbr: { item.unit?.abbreviation }</div>
                        <div>Unit Type: { item.unit?.type }</div>
                        <hr />
                    </div>
                })
            }
        </Suspense>
    );

}