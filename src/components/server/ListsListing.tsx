import { Suspense } from "react";
import { getLists } from '@/repositories/lists';

import Card from "../client/Card";

export default async function ListsListing() {

    const lists = await getLists();

    return (
        <Suspense fallback={<div>Loading lists...</div>}>
            <div className="lists-listing">
                {
                    lists.map( r => {
                        return (
                            <Card
                                key={ r.id }
                                title={ r.name }
                                actions={ [
                                    {
                                        href: `/lists/${ r.id }`,
                                        text: `View`
                                        }
                                ] }
                            />
                        )
                    })
                }
            </div>
        </Suspense>
    );

}