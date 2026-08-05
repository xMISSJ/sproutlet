/**
 * Image helpers for plant cutouts (transparent PNG) stored in localStorage.
 */

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image."))),
      type,
      quality,
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image data."));
    reader.readAsDataURL(blob);
  });
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = url;
  });
}

/**
 * Resize any image source to a PNG data URL (keeps alpha).
 */
export async function resizeToPngDataUrl(source, { maxSize = 720 } = {}) {
  let objectUrl = null;
  try {
    let url;
    if (typeof source === "string") {
      url = source;
    } else if (source instanceof Blob) {
      objectUrl = URL.createObjectURL(source);
      url = objectUrl;
    } else {
      throw new Error("Unsupported image source.");
    }

    const image = await loadImageFromUrl(url);
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process that image.");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, "image/png");
    return blobToDataUrl(blob);
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Read an image file, remove the background, return a transparent PNG data URL.
 */
export async function fileToPlantCutoutDataUrl(file, { maxSize = 720 } = {}) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const { removeBackground } = await import("@imgly/background-removal");
  const cutoutBlob = await removeBackground(file, {
    output: { format: "image/png", quality: 0.9 },
  });
  return resizeToPngDataUrl(cutoutBlob, { maxSize });
}

/**
 * Legacy helper — prefer fileToPlantCutoutDataUrl for plant photos.
 */
export async function fileToResizedDataUrl(file, options = {}) {
  try {
    return await fileToPlantCutoutDataUrl(file, options);
  } catch {
    // Fallback if background removal fails (offline / model load)
    const objectUrl = URL.createObjectURL(file);
    try {
      return await resizeToPngDataUrl(objectUrl, { maxSize: options.maxSize ?? 720 });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
