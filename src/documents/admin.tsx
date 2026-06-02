import type { DocumentProps } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';
import styles from '../styles/admin.css?url';

const AdminDocument: React.FC<DocumentProps<RequestInfo>> = ({ children }: DocumentProps<RequestInfo>) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Rezept Admin</title>
			<link rel="modulepreload" href="/src/client-admin.tsx" />
			<link rel="stylesheet" href={styles} />
		</head>
		<body className="rz-document-admin">
			<div id="root">{children}</div>
			<script>import("/src/client-admin.tsx")</script>
		</body>
	</html>
);

export default AdminDocument;
