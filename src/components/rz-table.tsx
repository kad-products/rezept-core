'use client';
import type { RzTableColumn } from '@/types';

export default function RzTable<T extends Record<string, unknown>>({
	columns,
	data,
	rowIndex = 'id',
}: {
	columns: RzTableColumn[];
	data: T[];
	rowIndex?: keyof T;
}) {
	return (
		<table className="rz-table">
			<thead>
				{columns.map(c => {
					return <th key={c.key}>{c.label}</th>;
				})}
			</thead>
			<tbody>
				{data.map(d => {
					return (
						<tr key={d[rowIndex] as string}>
							{columns.map(c => {
								return <td key={c.key}>{c.render ? c.render(String(d[c.key])) : String(d[c.key])}</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
