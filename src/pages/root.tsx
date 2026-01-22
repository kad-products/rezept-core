import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';

export default function Pages__root({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="home" pageTitle="Home" ctx={ctx}>
      oh hai
    </StandardLayout>
  );
}