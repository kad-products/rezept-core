import { Suspense } from "react";
import StandardLayout from '@/layouts/standard';

import { getCredentialsByUserId } from '@/repositories/credentials';

export default function Pages__profile__root({ ctx }: { ctx: any }) {

    return (
        <StandardLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx}>
            Credentials, email, etc
            <Suspense fallback={<div>Loading credentials...</div>}>
                <UserCredentials userId={ctx.user.id} />
            </Suspense>
        </StandardLayout>
    );
}

export async function UserCredentials({ userId }: { userId: string }) {

    const userCredentials = await getCredentialsByUserId(userId);

    return (

        <ol>
            {userCredentials.map((credential) => (
                <li key={credential.id}>{credential.credentialId}</li>
            ))}
        </ol>

    );

}