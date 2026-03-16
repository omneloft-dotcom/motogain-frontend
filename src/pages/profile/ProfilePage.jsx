import { useEffect, useState } from "react";
import profileApi from "../../api/profileApi";
import brandsApi from "../../api/brandsApi";
import Toast from "../../components/common/Toast";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import { calculateProfileScore, getProfileCompletionMessage } from "../../utils/profileScore";
import { TURKISH_CITIES, CITY_DISTRICTS } from "../../constants/turkishCities";
import {
  MOTOR_BRANDS,
  MOTOR_MODELS,
  CAR_BRANDS,
  CAR_MODELS,
  BICYCLE_BRANDS,
  BICYCLE_MODELS,
} from "../../constants/vehicleBrands";
import { useAuth } from "../../context/AuthProvider";

/**
 * ProfilePage - Kurye Profili Wizard (FAZ 14.1 FIXED)
 *
 * FIXES:
 * - City/District: Dropdown selection (not free text)
 * - Vehicle Brand/Model: Dropdown with "Bulamadım" option
 * - Photo Upload: Cloudinary integration
 * - Phone Number: Added to Step 4
 * - Profile Scoring: Locked formula implementation
 * - Empty States: "Yok/Bilinmiyor" options
 */

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    courierTypes: [],
    vehicle: {
      motor: { brand: "", model: "", cc: null, type: "", licenseType: "" },
      car: { brand: "", model: "", type: "", volumeM3: null, refrigerated: false },
      bicycle: { brand: "", model: "", type: "", maxKg: null },
    },
    equipment: {
      hasBox: false,
      hasHelmet: false,
      hasRainGear: false,
      hasPhoneMount: false,
      hasPowerBank: false,
    },
    platforms: [],
    experienceYears: 0,
    availability: {
      days: [],
      hours: "",
    },
    location: {
      city: "",
      district: "",
    },
  });

  const [userPhone, setUserPhone] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [brandOptions, setBrandOptions] = useState(MOTOR_BRANDS);
  const [brandModels, setBrandModels] = useState(MOTOR_MODELS);

  useEffect(() => {
    loadProfile();
    loadBrands();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getMyProfile();

      if (data.profile) {
        setFormData(data.profile);
      }

      if (user?.phone) setUserPhone(user.phone);
      if (user?.photo) setUserPhoto(user.photo);
    } catch (err) {
      logError("ProfilePage - loadProfile", err);
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandsApi.getBrands();
      if (Array.isArray(data) && data.length > 0) {
        const options = data.map((b) => ({
          value: b.brand,
          label: b.brand,
        }));
        const modelsMap = {};
        data.forEach((b) => {
          modelsMap[b.brand] =
            b.models?.map((m) => ({ value: m.name, label: m.name, active: m.active })) || [];
        });

        // Add fallback "Bulamadım / Diğer"
        options.push({ value: "Bulamadim", label: "Bulamadım / Diğer" });
        modelsMap.Bulamadim = [{ value: "Diğer", label: "Diğer / Bulamadım" }];

        setBrandOptions(options);
        setBrandModels(modelsMap);
      }
    } catch (err) {
      // fallback to static constants on failure
      console.error("Brand list load failed, using static list.", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await profileApi.updateProfile(formData);

      // Update user phone/photo if changed
      if (userPhone !== user?.phone || userPhoto !== user?.photo) {
        await profileApi.updateUserInfo({ phone: userPhone, photo: userPhoto });
        await refreshUser();
      }

      setToast({ message: "Profil kaydedildi! 🎉", type: "success" });
      setHasUnsavedChanges(false);
    } catch (err) {
      logError("ProfilePage - handleSubmit", err);
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const toggleCourierType = (type) => {
    updateFormData({
      courierTypes: formData.courierTypes.includes(type)
        ? formData.courierTypes.filter((t) => t !== type)
        : [...formData.courierTypes, type],
    });
  };

  const togglePlatform = (platform) => {
    updateFormData({
      platforms: formData.platforms.includes(platform)
        ? formData.platforms.filter((p) => p !== platform)
        : [...formData.platforms, platform],
    });
  };

  const toggleDay = (day) => {
    updateFormData({
      availability: {
        ...formData.availability,
        days: formData.availability.days.includes(day)
          ? formData.availability.days.filter((d) => d !== day)
          : [...formData.availability.days, day],
      },
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      // Get Cloudinary signature
      const { signature, timestamp, cloudName, apiKey, folder } =
        await profileApi.getCloudinarySignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUserPhoto(data.secure_url);
      setHasUnsavedChanges(true);
    } catch (err) {
      logError("ProfilePage - handlePhotoUpload", err);
      setToast({ message: "Fotoğraf yüklenemedi", type: "error" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  const showMotorFields = formData.courierTypes.includes("motor_kurye");
  const showCarFields = formData.courierTypes.includes("aracli_kurye");
  const showBicycleFields = formData.courierTypes.includes("bisikletli_kurye");

  const availableDistricts = formData.location.city
    ? CITY_DISTRICTS[formData.location.city] || []
    : [];

  const motorModels = formData.vehicle.motor.brand
    ? brandModels[formData.vehicle.motor.brand] || []
    : [];

  const carModels = formData.vehicle.car.brand ? CAR_MODELS[formData.vehicle.car.brand] || [] : [];

  const bicycleModels = formData.vehicle.bicycle.brand
    ? BICYCLE_MODELS[formData.vehicle.bicycle.brand] || []
    : [];

  const scoreData = calculateProfileScore(formData, userPhoto);
  const scoreMessage = getProfileCompletionMessage(scoreData.score);

  const steps = [
    { number: 1, title: "Temel Bilgiler", icon: "📋" },
    { number: 2, title: "Araç & Ekipman", icon: "🏍️" },
    { number: 3, title: "Deneyim & Uygunluk", icon: "⭐" },
    { number: 4, title: "Kişisel Bilgiler", icon: "📸" },
  ];

  const progressColors = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profilim</h1>
        <p className="text-slate-600">
          Profilinizi tamamlayarak size en uygun fırsatlara ulaşabilirsiniz.
        </p>
      </div>

      {/* İş Alanı Yakında Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🚧</div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              İş Fırsatları Yakında!
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Kurye profili oluşturarak gelecekte size özel iş fırsatlarından yararlanabilirsiniz.
              Şu anda platform sadece <strong>ürün alım-satım</strong> hizmetine açıktır.
            </p>
            <div className="flex gap-2 text-xs text-amber-700">
              <span className="bg-amber-100 px-2 py-1 rounded">📦 Ürün satışı aktif</span>
              <span className="bg-amber-100 px-2 py-1 rounded">💼 İş eşleştirme yakında</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-2 ${
                currentStep >= step.number ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep >= step.number
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressColors[scoreMessage.color]}`}
            style={{ width: `${scoreData.score}%` }}
          />
        </div>
        <p className="text-center text-sm mt-2" style={{ color: scoreMessage.color }}>
          {scoreData.score}% - {scoreMessage.text}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Temel Bilgiler */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📋 <strong>Adım 1:</strong> Hangi tür işler yapabilirsiniz ve nerede çalışıyorsunuz?
              </p>
            </div>

            {/* Kurye Tipleri */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Kurye Tipleriniz</h2>
              <p className="text-sm text-slate-600 mb-4">
                Hangi şekillerde çalışabilirsiniz? (Birden fazla seçebilirsiniz)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: "motor_kurye", label: "Motor Kurye 🏍️" },
                  { value: "aracli_kurye", label: "Araçlı Kurye 🚗" },
                  { value: "bisikletli_kurye", label: "Bisikletli Kurye 🚴" },
                  { value: "yaya_kurye", label: "Yaya Kurye 🚶" },
                  { value: "warehouse_picker", label: "Depo Picker 📦" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleCourierType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.courierTypes.includes(type.value)
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              {formData.courierTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Kurye tipi seçmeniz önerilir (+20 puan)
                </p>
              )}
            </div>

            {/* Lokasyon */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Lokasyon</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şehir <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location.city || ""}
                    onChange={(e) =>
                      updateFormData({
                        location: { city: e.target.value, district: "" },
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Seçiniz</option>
                    {TURKISH_CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {!formData.location.city && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Şehir seçmeniz önerilir (+15 puan)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İlçe</label>
                  <select
                    value={formData.location.district || ""}
                    onChange={(e) =>
                      updateFormData({
                        location: { ...formData.location, district: e.target.value },
                      })
                    }
                    disabled={!formData.location.city}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 disabled:bg-slate-100"
                  >
                    <option value="">Seçiniz</option>
                    {availableDistricts.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                  {formData.location.city && !formData.location.district && (
                    <p className="text-xs text-slate-500 mt-1">İlçe opsiyoneldir (+5 puan)</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Araç & Ekipman */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                🏍️ <strong>Adım 2:</strong> Araç ve ekipman bilgilerinizi paylaşın. Tüm alanlar opsiyoneldir.
              </p>
            </div>

            {/* Motor */}
            {showMotorFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Motor Bilgileri</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Marka</label>
                    <select
                      value={formData.vehicle.motor.brand || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            motor: {
                              ...formData.vehicle.motor,
                              brand: e.target.value,
                              model: "",
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {brandOptions.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                    <select
                      value={formData.vehicle.motor.model || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            motor: {
                              ...formData.vehicle.motor,
                              model: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={!formData.vehicle.motor.brand}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 disabled:bg-slate-100"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {motorModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Motor Hacmi (cc)
                    </label>
                    <input
                      type="number"
                      value={formData.vehicle.motor.cc || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            motor: {
                              ...formData.vehicle.motor,
                              cc: e.target.value ? Number(e.target.value) : null,
                            },
                          },
                        })
                      }
                      placeholder="150"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Motor Tipi
                    </label>
                    <select
                      value={formData.vehicle.motor.type || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            motor: {
                              ...formData.vehicle.motor,
                              type: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      <option value="scooter">Scooter</option>
                      <option value="cub">Cub</option>
                      <option value="naked">Naked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ehliyet Sınıfı
                    </label>
                    <select
                      value={formData.vehicle.motor.licenseType || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            motor: {
                              ...formData.vehicle.motor,
                              licenseType: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A">A</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Car */}
            {showCarFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Araç Bilgileri</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Marka</label>
                    <select
                      value={formData.vehicle.car.brand || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            car: {
                              ...formData.vehicle.car,
                              brand: e.target.value,
                              model: "",
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {CAR_BRANDS.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                    <select
                      value={formData.vehicle.car.model || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            car: {
                              ...formData.vehicle.car,
                              model: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={!formData.vehicle.car.brand}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 disabled:bg-slate-100"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {carModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Araç Tipi
                    </label>
                    <select
                      value={formData.vehicle.car.type || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            car: {
                              ...formData.vehicle.car,
                              type: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      <option value="otomobil">Otomobil</option>
                      <option value="panelvan">Panelvan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bagaj Hacmi (m³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vehicle.car.volumeM3 || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            car: {
                              ...formData.vehicle.car,
                              volumeM3: e.target.value ? Number(e.target.value) : null,
                            },
                          },
                        })
                      }
                      placeholder="2.5"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.vehicle.car.refrigerated || false}
                        onChange={(e) =>
                          updateFormData({
                            vehicle: {
                              ...formData.vehicle,
                              car: {
                                ...formData.vehicle.car,
                                refrigerated: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-slate-700">Soğutmalı araç</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bicycle */}
            {showBicycleFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Bisiklet Bilgileri</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Marka</label>
                    <select
                      value={formData.vehicle.bicycle.brand || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            bicycle: {
                              ...formData.vehicle.bicycle,
                              brand: e.target.value,
                              model: "",
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {BICYCLE_BRANDS.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                    <select
                      value={formData.vehicle.bicycle.model || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            bicycle: {
                              ...formData.vehicle.bicycle,
                              model: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={!formData.vehicle.bicycle.brand}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 disabled:bg-slate-100"
                    >
                      <option value="">Seçiniz / Yok</option>
                      {bicycleModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bisiklet Tipi
                    </label>
                    <select
                      value={formData.vehicle.bicycle.type || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            bicycle: {
                              ...formData.vehicle.bicycle,
                              type: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Seçiniz / Yok</option>
                      <option value="normal">Normal</option>
                      <option value="elektrikli">Elektrikli</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Maks. Taşıma (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.vehicle.bicycle.maxKg || ""}
                      onChange={(e) =>
                        updateFormData({
                          vehicle: {
                            ...formData.vehicle,
                            bicycle: {
                              ...formData.vehicle.bicycle,
                              maxKg: e.target.value ? Number(e.target.value) : null,
                            },
                          },
                        })
                      }
                      placeholder="15"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Ekipman */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Ekipman</h2>
              <p className="text-sm text-slate-600 mb-4">Sahip olduğunuz ekipmanları seçin</p>

              <div className="space-y-3">
                {[
                  { key: "hasBox", label: "Çanta var" },
                  { key: "hasHelmet", label: "Kask var" },
                  { key: "hasRainGear", label: "Yağmurluk var" },
                  { key: "hasPhoneMount", label: "Telefon tutucu var" },
                  { key: "hasPowerBank", label: "Powerbank var" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.equipment[item.key]}
                      onChange={(e) =>
                        updateFormData({
                          equipment: {
                            ...formData.equipment,
                            [item.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Deneyim & Uygunluk */}
        {currentStep === 3 && (
          <div className="animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ⭐ <strong>Adım 3:</strong> Deneyiminiz ve uygunluğunuz hakkında bilgi verin.
              </p>
            </div>

            {/* Platformlar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Çalıştığınız Platformlar</h2>
              <p className="text-sm text-slate-600 mb-4">
                Hangi platformlarda deneyiminiz var?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Yemeksepeti",
                  "Getir",
                  "TrendyolGo",
                  "Migros Hemen",
                  "Hepsijet",
                  "Amazon Flex",
                  "Freelance",
                ].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.platforms.includes(platform)
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              {formData.platforms.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">⚠️ Platform seçmeniz önerilir (+10 puan)</p>
              )}
            </div>

            {/* Deneyim & Uygunluk */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Deneyim & Uygunluk</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deneyim (yıl)
                  </label>
                  <select
                    value={formData.experienceYears || 0}
                    onChange={(e) =>
                      updateFormData({
                        experienceYears: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  >
                    <option value={0}>Yeni başlıyorum</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                      <option key={year} value={year}>
                        {year} yıl
                      </option>
                    ))}
                    <option value={11}>10+ yıl</option>
                  </select>
                  {formData.experienceYears < 1 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ En az 1 yıl deneyim seçmeniz önerilir (+10 puan)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Çalışma Saatleri
                  </label>
                  <select
                    value={formData.availability.hours || ""}
                    onChange={(e) =>
                      updateFormData({
                        availability: {
                          ...formData.availability,
                          hours: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Seçiniz / Bilinmiyor</option>
                    <option value="fulltime">Tam Zamanlı</option>
                    <option value="parttime">Yarı Zamanlı</option>
                    <option value="weekend">Hafta Sonu</option>
                  </select>
                  {!formData.availability.hours && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Çalışma saati seçmeniz önerilir (+5 puan)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Müsait Olduğunuz Günler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.availability.days.includes(day)
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {formData.availability.days.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ En az 1 gün seçmeniz önerilir (+5 puan)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Kişisel Bilgiler */}
        {currentStep === 4 && (
          <div className="animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                📸 <strong>Son Adım:</strong> İletişim bilgilerinizi ve profil fotoğrafınızı ekleyin.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Kişisel Bilgiler</h2>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profil Fotoğrafı (15 puan)
                </label>
                <div className="flex items-center gap-4">
                  {userPhoto && (
                    <img
                      src={userPhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadingPhoto && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                    {!userPhoto && !uploadingPhoto && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Fotoğraf eklemeniz önerilir (+15 puan)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="5XX XXX XX XX"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  İletişim için telefon numaranızı ekleyin (opsiyonel)
                </p>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  E-posta adresiniz değiştirilemez
                </p>
              </div>

              {/* Summary Score */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Profil Tamamlanma: {scoreData.score}%
                </h3>
                <p className="text-sm text-blue-800 mb-3">{scoreMessage.text}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Adım 1:</span> {scoreData.breakdown.step1}/40
                  </div>
                  <div>
                    <span className="font-medium">Adım 2:</span> {scoreData.breakdown.step2}/20
                  </div>
                  <div>
                    <span className="font-medium">Adım 3:</span> {scoreData.breakdown.step3}/30
                  </div>
                  <div>
                    <span className="font-medium">Adım 4:</span> {scoreData.breakdown.step4}/15
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Geri
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              İleri →
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
          )}
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
