import { useEffect, useState } from "react";
import profileApi from "../../api/profileApi";
import Toast from "../../components/common/Toast";
import { getErrorMessage, logError } from "../../utils/errorHandler";

/**
 * ProfilePage - Kurye Profili Wizard (FAZ 14)
 *
 * Multi-step onboarding wizard with:
 * - 4 steps (Temel Bilgiler, Araç & Ekipman, Deneyim, Özet)
 * - Progress bar
 * - Conditional animations
 * - Unsaved changes warning
 */

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    courierTypes: [],
    vehicle: {
      motor: {},
      car: {},
      bicycle: {},
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

  useEffect(() => {
    loadProfile();
  }, []);

  // Warn on unsaved changes
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
    } catch (err) {
      logError("ProfilePage - loadProfile", err);
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await profileApi.updateProfile(formData);
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

  const progressPercentage = (currentStep / 4) * 100;

  // Step configuration
  const steps = [
    { number: 1, title: "Temel Bilgiler", icon: "📋" },
    { number: 2, title: "Araç & Ekipman", icon: "🏍️" },
    { number: 3, title: "Deneyim & Uygunluk", icon: "⭐" },
    { number: 4, title: "Özet & Kaydet", icon: "✅" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profilim</h1>
        <p className="text-slate-600">
          Profilinizi adım adım oluşturarak daha iyi fırsatlara ulaşabilirsiniz.
        </p>
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
              <span className="hidden sm:inline text-sm font-medium">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-center text-sm text-slate-600 mt-2">
          {progressPercentage}% tamamlandı
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Temel Bilgiler */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📋 <strong>Adım 1:</strong> Hangi tür işler yapabilirsiniz ve
                nerede çalışıyorsunuz? Tüm alanları doldurmak zorunda
                değilsiniz, daha sonra da ekleyebilirsiniz.
              </p>
            </div>

            {/* Kurye Tipleri */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Kurye Tipleriniz
              </h2>
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
            </div>

            {/* Lokasyon */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Lokasyon
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={formData.location.city || ""}
                    onChange={(e) =>
                      updateFormData({
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    placeholder="İstanbul"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.location.district || ""}
                    onChange={(e) =>
                      updateFormData({
                        location: {
                          ...formData.location,
                          district: e.target.value,
                        },
                      })
                    }
                    placeholder="Kadıköy"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
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
                🏍️ <strong>Adım 2:</strong> Araç ve ekipman bilgilerinizi
                paylaşın. Bu bilgiler size uygun işleri bulmanıza yardımcı
                olacak. Boş bırakabilirsiniz.
              </p>
            </div>

            {/* Motor Araç Bilgileri */}
            {showMotorFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-slideDown">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Motor Bilgileri
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
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
                      placeholder="örn: Honda PCX 150"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    />
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
                              cc: Number(e.target.value),
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
                      <option value="">Seçiniz</option>
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
                      <option value="">Seçiniz</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A">A</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Araç Bilgileri */}
            {showCarFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-slideDown">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Araç Bilgileri
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value="">Seçiniz</option>
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
                              volumeM3: Number(e.target.value),
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
                      <span className="text-sm font-medium text-slate-700">
                        Soğutmalı araç
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bisiklet Bilgileri */}
            {showBicycleFields && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-slideDown">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Bisiklet Bilgileri
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value="">Seçiniz</option>
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
                              maxKg: Number(e.target.value),
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
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Ekipman
              </h2>

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
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
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
                ⭐ <strong>Adım 3:</strong> Deneyiminiz ve uygunluğunuz hakkında
                bilgi verin. Bu bilgiler size en uygun fırsatları sunmamıza
                yardımcı olacak.
              </p>
            </div>

            {/* Platformlar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Çalıştığınız Platformlar
              </h2>
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
            </div>

            {/* Deneyim & Uygunluk */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Deneyim & Uygunluk
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deneyim (yıl)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears || 0}
                    onChange={(e) =>
                      updateFormData({
                        experienceYears: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
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
                    <option value="">Seçiniz</option>
                    <option value="fulltime">Tam Zamanlı</option>
                    <option value="parttime">Yarı Zamanlı</option>
                    <option value="weekend">Hafta Sonu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Müsait Olduğunuz Günler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt", "Paz"].map(
                      (day) => (
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
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Özet & Kaydet */}
        {currentStep === 4 && (
          <div className="animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ <strong>Son Adım:</strong> Profilinizi gözden geçirin ve
                kaydedin. Daha sonra istediğiniz zaman güncelleyebilirsiniz.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Profil Özeti
              </h2>

              {/* Kurye Tipleri */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">
                  Kurye Tipleri
                </h3>
                {formData.courierTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.courierTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {type.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Belirtilmedi</p>
                )}
              </div>

              {/* Lokasyon */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Lokasyon</h3>
                <p className="text-slate-600">
                  {formData.location.city || "-"} /{" "}
                  {formData.location.district || "-"}
                </p>
              </div>

              {/* Platformlar */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">
                  Platformlar
                </h3>
                {formData.platforms.length > 0 ? (
                  <p className="text-slate-600">
                    {formData.platforms.join(", ")}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">Belirtilmedi</p>
                )}
              </div>

              {/* Deneyim */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Deneyim</h3>
                <p className="text-slate-600">
                  {formData.experienceYears || 0} yıl
                </p>
              </div>

              {/* Uygunluk */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">
                  Uygunluk
                </h3>
                <p className="text-slate-600">
                  {formData.availability.hours
                    ? formData.availability.hours === "fulltime"
                      ? "Tam Zamanlı"
                      : formData.availability.hours === "parttime"
                      ? "Yarı Zamanlı"
                      : "Hafta Sonu"
                    : "-"}
                </p>
                {formData.availability.days.length > 0 && (
                  <p className="text-slate-600 text-sm mt-1">
                    Günler: {formData.availability.days.join(", ")}
                  </p>
                )}
              </div>

              {/* Ekipman */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Ekipman</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.equipment.hasBox && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                      Çanta
                    </span>
                  )}
                  {formData.equipment.hasHelmet && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                      Kask
                    </span>
                  )}
                  {formData.equipment.hasRainGear && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                      Yağmurluk
                    </span>
                  )}
                  {formData.equipment.hasPhoneMount && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                      Telefon tutucu
                    </span>
                  )}
                  {formData.equipment.hasPowerBank && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                      Powerbank
                    </span>
                  )}
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
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
