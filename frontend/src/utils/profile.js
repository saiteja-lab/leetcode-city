const MAX_INPUT_FILE_SIZE = 5 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 256;
const OUTPUT_IMAGE_TYPE = "image/jpeg";
const OUTPUT_IMAGE_QUALITY = 0.82;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("We couldn't read that image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We couldn't process that image."));
    image.src = source;
  });
}

export async function normalizeAvatarFile(file) {
  if (!file) {
    throw new Error("Please choose an image to upload.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Profile photos need to be image files.");
  }

  if (file.size > MAX_INPUT_FILE_SIZE) {
    throw new Error("Please upload an image smaller than 5 MB.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(image.width, image.height));

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser couldn't prepare that image.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(OUTPUT_IMAGE_TYPE, OUTPUT_IMAGE_QUALITY);
}
