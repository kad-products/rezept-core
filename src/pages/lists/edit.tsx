import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import ListEdit from '@/components/server/ListEdit';

export default function Pages__lists__edit({ ctx, params }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
        <ListEdit listId={ params.listId } />
    </StandardLayout>
  );
}
