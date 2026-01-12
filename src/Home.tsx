import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';

export default function Home({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="home" ctx={ctx}>
			<h2 className="page-title">
				Home
			</h2>
    </StandardLayout>
  );
}
