import JSZip from 'jszip';

export async function downloadZipArchive(
  files: Record<string, string>,
  zipFileName = 'worker-qr-system-production.zip'
): Promise<void> {
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(files)) {
    const cleanPath = filePath.replace(/^\/?worker-qr-system\//, '');
    zip.file(cleanPath, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
