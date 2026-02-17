import type { DefaultAppContext } from 'rwsdk/worker';
import PasskeyLogin from '@/components/client/PasskeyLogin';
import PasskeyRegistration from '@/components/client/PasskeyRegistration';
import StandardLayout from '@/layouts/standard';

export default function Pages__auth__login({ ctx }: { ctx: DefaultAppContext }) {
	return (
		<StandardLayout currentBasePage="auth" pageTitle="Login" ctx={ctx}>
			{ctx.user ? (
				<div>
					<div>
						<h2>User</h2>
						<pre>{JSON.stringify(ctx.user, null, 4)}</pre>
					</div>
					<div>
						<h2>Session</h2>
						<pre>{JSON.stringify(ctx.session, null, 4)}</pre>
					</div>
				</div>
			) : (
				<>
					<h2>Passkeys</h2>
					<p>
						We only support passkey login right now as it is a smooth user experience and much more secure than standard username
						and password. If you're not familiar with passkeys, take a look at our quick explanation here or dive into the
						technical details here.
					</p>
					<div className="login-options">
						<PasskeyLogin />
						<div className="login-divider" />
						<PasskeyRegistration />
					</div>
					<div>
						<pre>{JSON.stringify(ctx, null, 4)}</pre>
					</div>
				</>
			)}
		</StandardLayout>
	);
}
