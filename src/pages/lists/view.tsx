import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import ListView from '@/components/server/ListView';

export default function Pages__lists__view({ ctx, params }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
        <ListView listId={ params.listId } />
    </StandardLayout>
  );
}
