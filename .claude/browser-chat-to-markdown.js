// biome-ignore-all lint: because this is a hack script and not part of the application
// // HTML to Markdown Converter
// Finds header with data-testid="page-header" and converts sibling div content

function htmlToMarkdown(html) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	function processNode(node, indent = '') {
		let result = '';

		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent.trim();
			return text ? text : '';
		}

		if (node.nodeType !== Node.ELEMENT_NODE) {
			return '';
		}

		const tag = node.tagName.toLowerCase();

		switch (tag) {
			case 'h1':
				result = `# ${node.textContent.trim()}\n\n`;
				break;
			case 'h2':
				result = `## ${node.textContent.trim()}\n\n`;
				break;
			case 'h3':
				result = `### ${node.textContent.trim()}\n\n`;
				break;
			case 'h4':
				result = `#### ${node.textContent.trim()}\n\n`;
				break;
			case 'h5':
				result = `##### ${node.textContent.trim()}\n\n`;
				break;
			case 'h6':
				result = `###### ${node.textContent.trim()}\n\n`;
				break;
			case 'p':
				result = `${processChildren(node)}\n\n`;
				break;
			case 'strong':
			case 'b':
				result = `**${node.textContent.trim()}**`;
				break;
			case 'em':
			case 'i':
				result = `*${node.textContent.trim()}*`;
				break;
			case 'code':
				result = `\`${node.textContent.trim()}\``;
				break;
			case 'pre': {
				const codeBlock = node.querySelector('code');
				const code = codeBlock ? codeBlock.textContent : node.textContent;
				result = `\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
				break;
			}
			case 'a': {
				const href = node.getAttribute('href') || '';
				result = `[${node.textContent.trim()}](${href})`;
				break;
			}
			case 'img': {
				const src = node.getAttribute('src') || '';
				const alt = node.getAttribute('alt') || '';
				result = `![${alt}](${src})\n\n`;
				break;
			}
			case 'ul':
				result = processChildren(node, indent) + '\n';
				break;
			case 'ol':
				result = processChildren(node, indent, true) + '\n';
				break;
			case 'li': {
				const isOrdered = node.parentElement.tagName.toLowerCase() === 'ol';
				const siblings = Array.from(node.parentElement.children);
				const index = siblings.indexOf(node) + 1;
				const bullet = isOrdered ? `${index}.` : '-';
				result = `${indent}${bullet} ${processChildren(node, indent + '  ')}\n`;
				break;
			}
			case 'blockquote': {
				const lines = processChildren(node).split('\n');
				result = lines.map(line => (line.trim() ? `> ${line}` : '>')).join('\n') + '\n\n';
				break;
			}
			case 'hr':
				result = '---\n\n';
				break;
			case 'br':
				result = '  \n';
				break;
			case 'div':
			case 'section':
			case 'article':
			case 'span':
				result = processChildren(node, indent);
				break;
			default:
				result = processChildren(node, indent);
		}

		return result;
	}

	function processChildren(node, indent = '', isOrdered = false) {
		let result = '';
		for (const child of node.childNodes) {
			result += processNode(child, indent);
		}
		return result;
	}

	return processNode(doc.body).trim();
}

function convertPageToMarkdown() {
	// Find the header with data-testid="page-header"
	const header = document.querySelector('header[data-testid="page-header"]');

	if (!header) {
		console.error('Header with data-testid="page-header" not found');
		return null;
	}

	// Get the next sibling div
	let sibling = header.nextElementSibling;

	if (!sibling) {
		console.error('No sibling element found after header');
		return null;
	}

	// If the sibling isn't a div, look for the next div
	if (sibling.tagName.toLowerCase() !== 'div') {
		console.warn('Next sibling is not a div, searching for next div...');
		while (sibling && sibling.tagName.toLowerCase() !== 'div') {
			sibling = sibling.nextElementSibling;
		}

		if (!sibling) {
			console.error('No div sibling found after header');
			return null;
		}
	}

	// Get the HTML content
	const htmlContent = sibling.innerHTML;

	// Convert to Markdown
	const markdown = htmlToMarkdown(htmlContent);

	return {
		header: header,
		contentDiv: sibling,
		html: htmlContent,
		markdown: markdown,
	};
}

// Auto-run when pasted in console
(() => {
	const result = convertPageToMarkdown();

	if (result) {
		console.log('%c=== MARKDOWN OUTPUT ===', 'color: #0066cc; font-weight: bold; font-size: 14px;');
		console.log(result.markdown);
		console.log('\n%c=== Original HTML ===', 'color: #666; font-weight: bold; font-size: 12px;');
		console.log(result.html);

		// Also copy markdown to clipboard if available
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(result.markdown)
				.then(() => {
					console.log('%c✓ Markdown copied to clipboard!', 'color: #00aa00; font-weight: bold;');
				})
				.catch(err => {
					console.log('%cClipboard copy failed (may need secure context)', 'color: #aa6600;');
				});
		}

		// Make result available globally for further manipulation
		window.markdownResult = result;
		console.log('\n%cResult saved to window.markdownResult', 'color: #6600cc; font-style: italic;');
	}
})();
