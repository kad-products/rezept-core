'use client';
import { Form } from 'radix-ui';
import { useRef, useState } from 'react';

export default function IngredientLoadForm(): React.ReactNode {
	const [preview, setPreview] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		const selected = e.target.files?.[0];
		if (!selected) return;

		if (preview) URL.revokeObjectURL(preview); // revoke previous before replacing

		setFile(selected);

		// Generate preview URL from the local file — no upload yet
		const objectUrl = URL.createObjectURL(selected);
		console.log(`ObjectURL: ${objectUrl}`);
		setPreview(objectUrl);
	}

	async function handleSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!file) return;

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/ingredients/upload', {
				method: 'POST',
				body: formData,
			});

			console.log(res);

			if (!res.ok) throw new Error('Upload failed');

			const apiResponse: { success: boolean; data: { key: string } } = await res.json();
			console.log(apiResponse);
			if (!apiResponse.data.key) {
				throw new Error(`No key returned`);
			}

			// Reset form
			if (preview) URL.revokeObjectURL(preview);
			setFile(null);
			setPreview(null);
			if (inputRef.current) inputRef.current.value = '';
		} finally {
			setUploading(false);
		}
	}

	return (
		<Form.Root className="rz-form" onSubmit={handleSubmit}>
			<input ref={inputRef} type="file" onChange={handleChange} />

			{preview && <img src={preview} alt="Preview" style={{ maxWidth: 300, marginTop: 8 }} />}

			<button type="submit" disabled={!file || uploading}>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
		</Form.Root>
	);
}
