import { RequestInfo } from "rwsdk/worker";
import StandardLayout from '@/layouts/standard';
import GetUserCredentials from '@/components/server/GetUserCredentials';

export default function Pages__profile__root({ ctx }: RequestInfo) {

    return (
        <StandardLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx}>
            Credentials, email, etc
            <GetUserCredentials userId={ctx.user?.id} />
        </StandardLayout>
    );
}

