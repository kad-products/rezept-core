'use client';

export default function DownloadCSVButton({ data }: { data: string[] }): React.ReactNode {
	const download = (): void => {
		const dummyData = `ingredient\n${data.join('\n')}`;
		const csvContent = `data:text/csv;charset=utf-8,${dummyData}`;
		const encodedURI = encodeURI(csvContent);
		window.open(encodedURI);
	};

	return (
		<button type="button" onClick={download}>
			Download CSV
		</button>
	);
}
