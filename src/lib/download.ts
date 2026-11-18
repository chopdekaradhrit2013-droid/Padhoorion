/**
 * PadhoOrion Universal File Download Utility
 * Handles downloads using Blob Object URLs so browsers reliably trigger
 * the native download manager without opening preview tabs or blocking popups.
 */

export async function downloadResource(
  resourceId: string,
  fileName: string,
  fallbackFileUrl?: string
): Promise<boolean> {
  const downloadApiUrl = `/api/resources/${resourceId}/download`;

  try {
    // 1. Fetch from the direct attachment download endpoint
    const response = await fetch(downloadApiUrl);

    if (!response.ok) {
      // If download endpoint returned error, attempt fallback fileUrl if present
      if (fallbackFileUrl) {
        return await downloadFromUrl(fallbackFileUrl, fileName);
      }
      throw new Error(`Download response status: ${response.status}`);
    }

    const blob = await response.blob();
    triggerBlobDownload(blob, fileName);
    return true;
  } catch (err) {
    console.warn("Direct blob download failed, falling back to direct anchor:", err);

    if (fallbackFileUrl) {
      try {
        return await downloadFromUrl(fallbackFileUrl, fileName);
      } catch (fallbackErr) {
        console.warn("Fallback download failed:", fallbackErr);
      }
    }

    // Ultimate fallback: direct anchor to API endpoint
    const link = document.createElement("a");
    link.href = downloadApiUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 300);
    return true;
  }
}

export async function downloadFromUrl(url: string, fileName: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);
    const blob = await res.blob();
    triggerBlobDownload(blob, fileName);
    return true;
  } catch (err) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 300);
    return true;
  }
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = fileName || "study_resource.pdf";
  document.body.appendChild(link);
  link.click();

  // Revoke object URL after download has started
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

