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
}): React.ReactNode {
	return (
		<table className="rz-table">
			<thead>
				<tr>
					{columns.map(c => {
						return <th key={c.key}>{c.label}</th>;
					})}
				</tr>
			</thead>
			<tbody>
				{data.map(d => {
					return (
						<tr key={d[rowIndex] as string}>
							{columns.map(c => {
								if (c.action) {
									const hrefProp = c.action.hrefProp || 'link';
									const href = String(d[hrefProp]);
									if (c.action.type === 'link') {
										return (
											<td key={c.key}>
												<a href={href}>{c.action.label}</a>
											</td>
										);
									}
								}
								return <td key={c.key}>{c.render ? c.render(String(d[c.key]), d) : String(d[c.key])}</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
