import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import ListsListing from '@/components/server/ListsListing';

export default function Pages__lists__listing({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
        <ListsListing />
    </StandardLayout>
  );
}
