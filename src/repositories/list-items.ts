import { eq } from "drizzle-orm";
import db from "@/db";
import { type ListItem, listItems } from "@/models/schema";

// pull this out here so we can use the type in the return type of getListItemsByListId
const getListItemsQuery = (listId: string) => 
  db.query.listItems.findMany({
    where: eq(listItems.listId, listId),
    with: {
      ingredient: true,
      unit: true,
    },
  });

type ListItemWithRelations = Awaited<ReturnType<typeof getListItemsQuery>>[number];

export async function getListItemsByListId(
  listId: string,
): Promise<ListItemWithRelations[]> {

  return await getListItemsQuery(listId);

}
