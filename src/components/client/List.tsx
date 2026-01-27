// basing at least the signature here off rc-listy which is scheduled to come to Ant in v7
export default async function List({ items, itemRender }: { items: any[], itemRender: ( item: any ) => React.ReactNode }){
    return <div className="rezept-list">
        {
            items.map( ( item, idx ) => {
                return <div key={ idx } className="rezept-list-item">
                    { itemRender( item ) }
                </div>
            })
        }
    </div>
}