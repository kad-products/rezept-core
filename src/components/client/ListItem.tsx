"use client";
import { ListItemWithRelations } from '@/repositories/list-items';

export default async function ListItem( { item, handleRemove }: { item: ListItemWithRelations, handleRemove: (itemId: string) => void; } ){

    return <div key={ item.id }>
        <button type="button" onClick={ () => handleRemove( item.id ) }>Remove</button>
        <div>Item ID: { item.id }</div>
        <div>List ID: { item.listId }</div>
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
}