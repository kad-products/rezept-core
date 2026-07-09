'use client';
import styleClasses from './rz-pagination.module.css';

export default function RzPagination({
	currentPage,
	totalCount,
	perPage,
	href,
}: {
	currentPage: number;
	totalCount: number;
	perPage: number;
	href: string;
}): React.ReactNode {
	const pages = Math.ceil(totalCount / perPage);
	if (pages === 1) {
		return null;
	}
	const links = Array.from(Array(pages)).map((_, idx) => idx + 1);
	return (
		<div className={styleClasses.rzPagination}>
			{links.map(pgNum => {
				if (pgNum === currentPage) {
					return <span key={pgNum}>{pgNum}</span>;
				} else {
					return (
						<a key={pgNum} href={`${href}?page=${pgNum}`}>
							{pgNum}
						</a>
					);
				}
			})}
		</div>
	);
}
