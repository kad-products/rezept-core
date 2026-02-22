import type { DocumentProps } from 'rwsdk/router';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import styles from './styles/global.css?url';

export const Document: React.FC<DocumentProps<RequestInfo<any, DefaultAppContext>>> = ({ children }) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Rezept</title>
			<link rel="modulepreload" href="/src/client.tsx" />
			<link rel="stylesheet" href={styles} />
		</head>
		<body>
			<div id="root">{children}</div>
			<script>import("/src/client.tsx")</script>
		</body>
	</html>
);
