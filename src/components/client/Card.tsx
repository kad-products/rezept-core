export default async function Card({ title, body, actions }: { title: string, body?: string, actions: any[] }){
    return <div className="rezept-card">
        <div className="rezept-card-title">{ title }</div>
        {
            body &&
            <div className="rezept-card-body">{ body }</div>
        }
        <div className="rezept-card-actions">
            {
                actions.map( ( a, idx ) => {
                    return <a key={ idx } href={ a.href }>{ a.text }</a>
                })
            }
        </div>
    </div>
}