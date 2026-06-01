import type { DocumentProps } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';
import styles from '../styles/global.css?url';

const NoJSDocument: React.FC<DocumentProps<RequestInfo>> = ({ children }: DocumentProps<RequestInfo>) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Rezept</title>
			<link rel="stylesheet" href={styles} />
		</head>
		<body>
			<div id="root">{children}</div>
		</body>
	</html>
);
export default NoJSDocument;
