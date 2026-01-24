import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import RecipeListing from '@/components/server/RecipeListing';

export default function Pages__recipes__listing({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
        <RecipeListing />
    </StandardLayout>
  );
}
