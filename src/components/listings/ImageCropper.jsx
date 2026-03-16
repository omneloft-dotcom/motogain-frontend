import React, { useState } from "react";
import Cropper from "react-easy-crop";

/**
 * Kırpılmış görüntüyü Blob olarak oluşturan yardımcı fonksiyon
 */
const getCroppedImage = (imageSrc, crop, zoom) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const { naturalWidth, naturalHeight } = image;

      const cropX = (crop.x * naturalWidth) / 100;
      const cropY = (crop.y * naturalHeight) / 100;

      const size = Math.min(naturalWidth, naturalHeight);

      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        size / zoom,
        size / zoom,
        0,
        0,
        size,
        size
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Blob oluşturulamadı");
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    };

    image.onerror = () => reject("Görüntü yüklenemedi");
  });
};

const ImageCropper = ({ file, onClose, onCropped }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const imageURL = URL.createObjectURL(file);

  const handleCrop = async () => {
    try {
      const blob = await getCroppedImage(imageURL, crop, zoom);
      onCropped(blob);
    } catch (err) {
      console.error("Kırpma hatası:", err);
      alert("Kırpma sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[90%] max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-semibold text-center">Fotoğrafı Kırp</h2>

        {/* Cropper Alanı */}
        <div className="relative w-full h-72 bg-gray-200 rounded overflow-hidden">
          <Cropper
            image={imageURL}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            showGrid={false}
          />
        </div>

        {/* Zoom Kontrolü */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            İptal
          </button>

          <button
            type="button"
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
