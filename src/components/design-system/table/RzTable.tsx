'use client';
import type { Permission, RzTableColumn } from '@/types';
import RzLink from '../link/RzLink';

export default function RzTable<T extends Record<string, unknown>>({
	columns,
	data,
	rowIndex = 'id',
	userPermissions,
}: {
	columns: RzTableColumn[];
	data: T[];
	rowIndex?: keyof T;
	userPermissions: Permission[];
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
								if (c.actions) {
									return (
										<td key={c.key}>
											{c.actions.map(a => {
												if (a.type === 'link') {
													const hrefProp = a.hrefProp || 'link';
													const href = String(d[hrefProp]);
													return <RzLink userPermissions={userPermissions} key={href} href={href} {...a} />;
												} else {
													return (
														<button key={String(a.handler)} type="button" onClick={(): void => a.handler?.(String(d[c.key]), d)}>
															{a.label}
														</button>
													);
												}
											})}
										</td>
									);
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
