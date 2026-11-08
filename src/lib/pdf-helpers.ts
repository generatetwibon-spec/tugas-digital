export async function loadImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number; format: string } | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          const maxW = 900;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const format = url.toLowerCase().includes(".png") ? "PNG" : "JPEG";
          const dataUrl = canvas.toDataURL(
            format === "PNG" ? "image/png" : "image/jpeg",
            0.85
          );
          resolve({ dataUrl, width: w, height: h, format });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}
