export default async function getCroppedImg(imageSrc, crop, zoom = 1) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height } = image;

  const croppedAreaPixels = {
    x: (crop.x * width) / 100,
    y: (crop.y * height) / 100,
    width: (crop.width * width) / 100,
    height: (crop.height * height) / 100,
  };

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

function createImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.src = url;
  });
}
