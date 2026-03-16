import React, { useState } from "react";
import ImageCropper from "./ImageCropper";
import axiosClient from "../../api/axiosClient";

const ImageUploader = ({ images = [], onChange, token }) => {
  const [cropFile, setCropFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = React.useRef(null);

  const MAX_IMAGES = 3;

  // ------------------------------
  // 📌 Button ile dosya seçim penceresini aç
  // ------------------------------
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // ------------------------------
  // 📌 Dosya seçildiğinde önce Crop açılır
  // ------------------------------
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // önce crop modal açıyoruz
    setCropFile(file);

    // Input'u reset et (aynı dosyayı tekrar seçebilmek için)
    e.target.value = '';
  };

  // ------------------------------
  // 📌 Kırpılmış görüntüyü Cloudinary'e yükle
  // ------------------------------
  const uploadToCloudinary = async (fileBlob) => {
    try {
      setUploading(true);
      setError("");

      // 1) Signature al
      const sigRes = await axiosClient.get("/upload/signature", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const signaturePayload = sigRes?.data?.data || sigRes?.data || {};
      const { timestamp, signature, apiKey, cloudName, folder } = signaturePayload;

      if (!timestamp || !signature || !apiKey || !cloudName || !folder) {
        throw new Error("İmza bilgisi alınamadı");
      }

      const formData = new FormData();
      formData.append("file", fileBlob);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      // 2) Cloudinary upload
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await cloudRes.json();

      if (!data.secure_url) {
        throw new Error("Yükleme başarısız");
      }

      const newImages = [...images, data.secure_url].slice(0, MAX_IMAGES);
      onChange(newImages);
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Cloudinary upload hatası");
    } finally {
      setUploading(false);
    }
  };

  // ------------------------------
  // 📌 Cropper tamamlandığında tetiklenir
  // ------------------------------
  const handleCropped = async (blob) => {
    setCropFile(null);
    await uploadToCloudinary(blob);
  };

  // ------------------------------
  // 📌 Fotoğraf Sil
  // ------------------------------
  const removeImage = (url) => {
    const filtered = images.filter((img) => img !== url);
    onChange(filtered);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Fotoğraflar (max 3)
      </label>

      {/* Gizli Dosya Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
      />

      {/* Dosya Seç Butonu */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={images.length >= MAX_IMAGES || uploading}
        className="w-full border border-border/60 rounded-lg p-2 bg-background text-text-primary hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {images.length >= MAX_IMAGES
          ? `Maksimum ${MAX_IMAGES} fotoğraf yüklendi`
          : '📷 Fotoğraf Seç'}
      </button>

      {/* Hata */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Loading */}
      {uploading && <p className="text-blue-600 text-sm">Yükleniyor...</p>}

      {/* Yüklenen Fotoğraflar */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                className="h-24 w-full object-cover rounded"
                alt="uploaded-img"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 px-1 bg-red-500 text-white text-xs rounded opacity-90"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Crop Modal */}
      {cropFile && (
        <ImageCropper
          file={cropFile}
          onClose={() => setCropFile(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
};

export default ImageUploader;
