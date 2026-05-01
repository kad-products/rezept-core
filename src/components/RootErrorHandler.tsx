export default function RootErrorHandler({ error }: { error: Error }): React.ReactNode {
	return (
		<div style={{ padding: '2rem', backgroundColor: '#ffe6e6' }}>
			<h1>Something went wrong</h1>
			<p>{error.message}</p>
			<ul>
				{Object.entries(error).map(([key, value]) => (
					<li key={key}>
						<strong>{key}:</strong> {value}
					</li>
				))}
			</ul>
		</div>
	);
}
