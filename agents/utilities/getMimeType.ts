export const getMimeType = (fileName: string) => {
	const ext = fileName.split('.').pop()?.toLowerCase()
	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg'
		case 'png':
			return 'image/png'
		case 'webp':
			return 'image/webp'
		case 'gif':
			return 'image/gif'
		default:
			return 'image/png'
	}
}
