import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import listingsApi from "../../api/listingsApi";
import ImageUploader from "../../components/listings/ImageUploader";
import { useAuth } from "../../context/AuthProvider";
import brandsApi from "../../api/brandsApi";
import equipmentBrandsApi from "../../api/equipmentBrandsApi";
import {
  VEHICLE_BRANDS,
  EQUIPMENT_BRANDS,
  PART_BRANDS,
  TIRE_BRANDS,
} from "../../constants/brandData";
import { PART_SUBCATEGORY_MAP } from "../../constants/partCategories";
import {
  MAINTENANCE_PARENT,
  VISCOSITY_OPTIONS,
  STANDARD_OPTIONS,
  VOLUME_OPTIONS,
  CHEMICAL_BRANDS,
} from "../../constants/maintenance";
import {
  getDefaultSizeMetaForCategory,
  getSizeOptions,
  normalizeGender,
  normalizeSystem,
} from "../../constants/sizeTables";
import { PARENT_CATEGORY_OPTIONS } from "../../constants/listingCategories";

// Telefon formatlama
const formatPhone = (val) => {
  if (!val) return "";
  val = val.replace(/\D/g, "");

  if (val.startsWith("90")) val = val.substring(2);
  if (val.startsWith("0")) val = val.substring(1);

  let f = "+90 ";
  if (val.length > 0) f += val.substring(0, 3);
  if (val.length >= 4) f += " " + val.substring(3, 6);
  if (val.length >= 7) f += " " + val.substring(6, 8);
  if (val.length >= 9) f += " " + val.substring(8, 10);
  return f.trim();
};

// Şehir listesi
const cities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Konya",
  "Kocaeli",
  "Adana",
  "Gaziantep",
  "Mersin",
  "Samsun",
  "Kayseri",
  "Trabzon",
  "Eskişehir",
  "Denizli",
];

// Kategori ağacı (Ana kategori -> Alt kategori)
const CATEGORY_TREE = {
  "Taşıtlar": ["Motosiklet", "Scooter"],
  "Ekipman": [
    "Ayakkabı & Bot",
    "Kask",
    "Mont",
    "Pantolon",
    "Sweatshirt",
    "Tişört",
    "Tulum",
    "Yağmurluk",
    "Eldiven",
  ],
  "Yedek Parça": [
    "Debriyaj",
    "Egzoz",
    "Elektrik",
    "Fren",
    "Grenaj",
    "Havalandırma",
    "Motor",
    "Süspansiyon",
    "Şanzıman",
    "Yağlama",
    "Yakıt Sistemi",
    "Yönlendirme",
    "Jant",
    "Lastik",
    "Diğer",
  ],
  [MAINTENANCE_PARENT]: [
    "Motor Yağları",
    "Antifriz & Soğutma",
    "Fren Hidroliği",
    "Zincir Yağları & Spreyler",
    "Temizlik & Koruma",
    "Katkılar",
    "Diğer",
  ],
  "Aksesuar": ["Görünüm", "Koruma", "Bakım Ürünleri", "Elektronik Aksesuar"],
};

// Ekipman kategori -> slug eşlemesi (seed ile uyumlu)
const EQUIPMENT_CATEGORY_SLUGS = {
  "Ayakkabı & Bot": "ayakkabi-bot",
  Kask: "kask",
  Mont: "mont",
  Eldiven: "eldiven",
  Pantolon: "pantolon",
  Tulum: "tulum",
  Yağmurluk: "yagmurluk",
};

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  // 🔄 GELİŞTİRME 3: İlan tipi state'leri
  const [listingType, setListingType] = useState("sale");
  const [rentalPeriod, setRentalPeriod] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [deposit, setDeposit] = useState("");
  const [includesHelmet, setIncludesHelmet] = useState(false);
  const [includesInsurance, setIncludesInsurance] = useState(false);

  const [phone, setPhone] = useState("+90 ");
  const [city, setCity] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [condition, setCondition] = useState("");
  const [brandType, setBrandType] = useState("");
  const [brandOtherText, setBrandOtherText] = useState("");
  const [compatibleVehicleBrands, setCompatibleVehicleBrands] = useState([]);
  const [compatibleVehicleModels, setCompatibleVehicleModels] = useState([]);
  const [compatibleVehicleBrandsOther, setCompatibleVehicleBrandsOther] = useState("");
  const [compatibleVehicleModelsOther, setCompatibleVehicleModelsOther] = useState("");
  const [compatibleEngineMin, setCompatibleEngineMin] = useState("");
  const [compatibleEngineMax, setCompatibleEngineMax] = useState("");
  const [compatibleYearFrom, setCompatibleYearFrom] = useState("");
  const [compatibleYearTo, setCompatibleYearTo] = useState("");
  const [maintenanceCategory, setMaintenanceCategory] = useState("");
  const [maintenanceCategoryOther, setMaintenanceCategoryOther] = useState("");
  const [viscosity, setViscosity] = useState("");
  const [viscosityOther, setViscosityOther] = useState("");
  const [standard, setStandard] = useState("");
  const [standardOther, setStandardOther] = useState("");
  const [volume, setVolume] = useState("");
  const [volumeOther, setVolumeOther] = useState("");
  const [tireSize, setTireSize] = useState("");
  const [sizeType, setSizeType] = useState("");
  const [sizeValue, setSizeValue] = useState("");
  const [partSubCategory, setPartSubCategory] = useState("");
  const [partSubCategoryOther, setPartSubCategoryOther] = useState("");
  const [partCategoryOther, setPartCategoryOther] = useState("");
  const [sizeGender, setSizeGender] = useState("");
  const [sizeSystem, setSizeSystem] = useState("");
  const [sizeOtherText, setSizeOtherText] = useState("");
  const [sizeOptions, setSizeOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [vehicleBrandOptions, setVehicleBrandOptions] = useState([]);
  const [images, setImages] = useState([]);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const isVehicleCategory = parentCategory === "Taşıtlar";
  const isEquipmentCategory = parentCategory === "Ekipman";
  const isPartCategory = parentCategory === "Yedek Parça";
  const isMaintenanceCategory = parentCategory === MAINTENANCE_PARENT;
  const isTire = isPartCategory && category && category.toLowerCase().includes("lastik");
  const normalizedPartCategory =
    isPartCategory && category ? (category === "Diğer" ? "OTHER" : category) : "";
  const partSubCategoryOptions =
    PART_SUBCATEGORY_MAP[normalizedPartCategory] || (isPartCategory ? ["OTHER"] : []);
  const showViscosity = isMaintenanceCategory && maintenanceCategory === "Motor Yağları";
  const showStandard =
    isMaintenanceCategory &&
    (maintenanceCategory === "Motor Yağları" || maintenanceCategory === "Fren Hidroliği");
  const showVolume = isMaintenanceCategory && Boolean(maintenanceCategory);
  const standardOptionsForCategory =
    STANDARD_OPTIONS[maintenanceCategory] && STANDARD_OPTIONS[maintenanceCategory].length
      ? STANDARD_OPTIONS[maintenanceCategory]
      : ["Diğer"];
  const compatibleBrandOptions = [
    ...vehicleBrandOptions.map((b) => ({ value: b.value, label: b.label, models: b.models || [] })),
    { value: "OTHER", label: "Diğer" },
  ];
  const compatibleModelOptions = (() => {
    const selectedModels = compatibleVehicleBrands.flatMap((brand) => {
      const found = vehicleBrandOptions.find((b) => b.value === brand);
      return found ? found.models || [] : [];
    });
    const flattened = selectedModels.map((m) => m.name || m.value || m).filter(Boolean);
    const unique = Array.from(new Set(flattened)).map((v) => ({ value: v, label: v }));
    return [...unique, { value: "OTHER", label: "Diğer" }];
  })();

  const equipmentCategorySlug = isEquipmentCategory
    ? EQUIPMENT_CATEGORY_SLUGS[category] ||
      category
        ?.toString()
        .toLowerCase()
        .replace(/&/g, "ve")
        .replace(/\s+/g, "-")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
    : null;

  // Load brands/models
  useEffect(() => {
    const loadBrands = async () => {
      try {
        if (isVehicleCategory) {
          const data = await brandsApi.getBrands();
          setBrandOptions(
            data.map((b) => ({
              value: b.brand,
              label: b.brand,
              models: b.models || [],
            }))
          );
          setVehicleBrandOptions(
            data.map((b) => ({
              value: b.brand,
              label: b.brand,
              models: b.models || [],
            }))
          );
        } else if (isEquipmentCategory) {
          if (!equipmentCategorySlug) {
            setBrandOptions([]);
            return;
          }
          const data = await equipmentBrandsApi.getEquipmentBrands(
            equipmentCategorySlug || undefined
          );
          setBrandOptions(
            (data || EQUIPMENT_BRANDS).map((b) => {
              const name = b.name || b;
              return {
                value: name,
                label: name,
                models: b.models || [],
              };
            })
          );
        } else {
          if (isTire) {
            setBrandOptions(TIRE_BRANDS.map((b) => ({ value: b, label: b, models: [] })));
          } else if (isPartCategory) {
            setBrandOptions([
              ...PART_BRANDS.map((b) => ({ value: b, label: b, models: [] })),
              { value: "OTHER", label: "Diğer" },
            ]);
            if (!vehicleBrandOptions.length) {
              const data = await brandsApi.getBrands();
              setVehicleBrandOptions(
                data.map((b) => ({
                  value: b.brand,
                  label: b.brand,
                  models: b.models || [],
                }))
              );
            }
          } else {
            if (isMaintenanceCategory) {
              setBrandOptions(
                CHEMICAL_BRANDS.map((b) => ({
                  value: b,
                  label: b === "OTHER" ? "Diğer" : b,
                  models: [],
                }))
              );
            } else {
              setBrandOptions([]);
            }
          }
        }
      } catch (err) {
        console.error("Brand list load failed", err);
      }
    };
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isVehicleCategory,
    isEquipmentCategory,
    isPartCategory,
    isMaintenanceCategory,
    isTire,
    equipmentCategorySlug,
  ]);

  // Alt kategori değişince marka/modeli sıfırla (sadece initial load bittikten sonra)
  useEffect(() => {
    // Initial load sırasında bu reset'i atla
    if (loading) return;

    setBrand("");
    setModel("");
    setModelOptions([]);
    setSizeValue("");
    setSizeGender("");
    setSizeSystem("");
    setSizeOtherText("");
    setPartSubCategory("");
    setPartSubCategoryOther("");
    setPartCategoryOther("");
    setCompatibleVehicleBrands([]);
    setCompatibleVehicleModels([]);
    setCompatibleVehicleBrandsOther("");
    setCompatibleVehicleModelsOther("");
    setCompatibleEngineMin("");
    setCompatibleEngineMax("");
    setCompatibleYearFrom("");
    setCompatibleYearTo("");
    setBrandOtherText("");
    setMaintenanceCategory("");
    setMaintenanceCategoryOther("");
    setViscosity("");
    setViscosityOther("");
    setStandard("");
    setStandardOther("");
    setVolume("");
    setVolumeOther("");
  }, [category, parentCategory, loading]);

  useEffect(() => {
    // Initial load sırasında bu reset'i atla
    if (loading) return;

    if (isMaintenanceCategory) {
      setMaintenanceCategory(category);
      if (category !== "Diğer") {
        setMaintenanceCategoryOther("");
      }
      setBrand("");
      setBrandOtherText("");
      setViscosity("");
      setViscosityOther("");
      setStandard("");
      setStandardOther("");
      setVolume("");
      setVolumeOther("");
    }
  }, [category, isMaintenanceCategory, loading]);

  // brandType auto select by category
  useEffect(() => {
    if (isVehicleCategory) {
      setBrandType("VEHICLE_BRAND");
    } else if (isTire) {
      setBrandType("TIRE_BRAND");
    } else if (isEquipmentCategory) {
      setBrandType("EQUIPMENT_BRAND");
    } else if (isPartCategory) {
      setBrandType("PART_BRAND");
    } else if (isMaintenanceCategory) {
      setBrandType("CHEMICAL_BRAND");
    } else {
      setBrandType("");
    }
  }, [isVehicleCategory, isEquipmentCategory, isPartCategory, isMaintenanceCategory, isTire]);

  useEffect(() => {
    const current = brandOptions.find((b) => b.value === brand);
    if (current) {
      setModelOptions(current.models || []);
    } else {
      setModelOptions([]);
    }
    setModel((prev) =>
      current && current.models.some((m) => (m.name || m.value) === prev)
        ? prev
        : ""
    );
  }, [brand, brandOptions]);

  // Size options by category (equipment only)
  useEffect(() => {
    if (!isEquipmentCategory || !category) {
      setSizeType("");
      setSizeOptions([]);
      setSizeValue("");
      setSizeGender("");
      setSizeSystem("");
      setSizeOtherText("");
      return;
    }

    const defaults = getDefaultSizeMetaForCategory(category);
    const effectiveGender = normalizeGender(sizeGender, defaults.sizeGender);
    const effectiveSystem = normalizeSystem(sizeSystem, defaults.sizeSystem);

    setSizeType(defaults.sizeType || "");
    setSizeGender(effectiveGender);
    setSizeSystem(effectiveSystem);

    const opts = getSizeOptions(category, effectiveGender, effectiveSystem);
    const withOther = [
      ...opts,
      { value: "OTHER", label: "Diğer (liste dışı beden)" },
    ];

    if (sizeValue && !withOther.some((o) => o.value === sizeValue)) {
      withOther.unshift({ value: sizeValue, label: `Mevcut: ${sizeValue}` });
    }

    setSizeOptions(withOther);
  }, [category, isEquipmentCategory, sizeGender, sizeSystem, sizeValue]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingsApi.getListingById(id);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(data.price || "");
        // 🔄 GELİŞTİRME 3: İlan tipi state'lerini doldur
        setListingType(data.listingType || "sale");
        setRentalPeriod(data.rentalDetails?.period || "");
        setMinDuration(data.rentalDetails?.minDuration || "");
        setMaxDuration(data.rentalDetails?.maxDuration || "");
        setDeposit(data.rentalDetails?.deposit || "");
        setIncludesHelmet(data.rentalDetails?.includesHelmet || false);
        setIncludesInsurance(data.rentalDetails?.includesInsurance || false);

        setPhone(data.phone || "+90 ");
        setCity(data.city || "");
        setCategory(data.category || "");
        setParentCategory(data.parentCategory || "");
        const isMaint = (data.parentCategory || "") === MAINTENANCE_PARENT;
        const isKnownChemical =
          isMaint && CHEMICAL_BRANDS.includes(data.brand) && data.brand !== "OTHER";
        if (isMaint) {
          if (data.brand === "OTHER") {
            setBrand("OTHER");
            setBrandOtherText(data.brandOtherText || "");
          } else if (isKnownChemical) {
            setBrand(data.brand);
            setBrandOtherText("");
          } else if (data.brand) {
            setBrand("OTHER");
            setBrandOtherText(data.brand);
          } else {
            setBrand("");
            setBrandOtherText("");
          }
        } else {
          setBrand(data.brand || "");
        }
        setModel(data.model || "");
        setModelYear(data.modelYear || "");
        setCondition(data.condition || "");
        setBrandType(data.brandType || "");
        setSizeType(data.sizeType || "");
        setSizeValue(data.sizeValue || "");
        setPartSubCategory(data.partSubCategory || "");
        setPartSubCategoryOther(data.partSubCategoryOther || "");
        setPartCategoryOther(data.partCategoryOther || "");
        setSizeGender(data.sizeGender || "");
        setSizeSystem(data.sizeSystem || "");
        setSizeOtherText(data.sizeOtherText || "");
        setCompatibleVehicleBrands(data.compatibleVehicleBrands || []);
        setCompatibleVehicleModels(data.compatibleVehicleModels || []);
        setCompatibleVehicleBrandsOther(data.compatibleVehicleBrandsOther || "");
        setCompatibleVehicleModelsOther(data.compatibleVehicleModelsOther || "");
        setCompatibleEngineMin(
          data.compatibleEngineRange?.min !== null && data.compatibleEngineRange?.min !== undefined
            ? data.compatibleEngineRange.min
            : ""
        );
        setCompatibleEngineMax(
          data.compatibleEngineRange?.max !== null && data.compatibleEngineRange?.max !== undefined
            ? data.compatibleEngineRange.max
            : ""
        );
        setCompatibleYearFrom(
          data.compatibleYearRange?.from !== null && data.compatibleYearRange?.from !== undefined
            ? data.compatibleYearRange.from
            : ""
        );
        setCompatibleYearTo(
          data.compatibleYearRange?.to !== null && data.compatibleYearRange?.to !== undefined
            ? data.compatibleYearRange.to
            : ""
        );
        const maintenanceCat =
          data.maintenanceCategory === "OTHER" ? "Diğer" : data.maintenanceCategory || "";
        setMaintenanceCategory(maintenanceCat);
        setMaintenanceCategoryOther(data.maintenanceCategoryOther || "");
        setViscosity(data.viscosity === "OTHER" ? "Diğer" : data.viscosity || "");
        setViscosityOther(data.viscosityOther || "");
        setStandard(data.standard === "OTHER" ? "Diğer" : data.standard || "");
        setStandardOther(data.standardOther || "");
        setVolume(data.volume === "OTHER" ? "Diğer" : data.volume || "");
        setVolumeOther(data.volumeOther || "");
        setTireSize(data.tireSize || "");
        setImages(data.images || []);
      } catch (err) {
        setErrors({ backend: "İlan yüklenemedi" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!title || title.trim().length < 3)
      e.title = "Başlık en az 3 karakter olmalıdır.";
    if (!description || description.trim().length < 20)
      e.description = "Açıklama en az 20 karakter olmalıdır.";
    if (!price || Number(price) < 1) e.price = "Geçerli bir fiyat girin.";
    if (!phone || phone.length < 17)
      e.phone = "Geçerli bir telefon numarası girin.";
    if (!city) e.city = "Şehir seçin.";
    if (!parentCategory) e.parentCategory = "Ana kategori seçin.";
    if (!category) e.category = "Alt kategori seçin.";
    // 🔄 GELİŞTİRME 3: Kiralık ilan validasyonu
    if (listingType === 'rent' && !rentalPeriod) {
      e.rentalPeriod = "Kiralık ilanlar için kiralama periyodu zorunludur.";
    }
    if (isVehicleCategory) {
      if (!brand) e.brand = "Marka seçin.";
      if (!model) e.model = "Model seçin.";
      if (!modelYear) e.modelYear = "Model yılı girin.";
    }
    if (isEquipmentCategory && !brand) {
      e.brand = "Marka seçin.";
    }
    if (isEquipmentCategory) {
      if (sizeOptions.length > 0 && !sizeValue) {
        e.sizeValue = "Beden seçin.";
      }
      if (sizeValue === "OTHER") {
        if (!sizeOtherText.trim()) {
          e.sizeOtherText = "Diğer beden açıklaması zorunlu.";
        }
      } else if (sizeOtherText.trim()) {
        e.sizeOtherText = "Diğer açıklaması sadece 'Diğer' seçildiğinde girilebilir.";
      }
    }
    if (isPartCategory) {
      if (!normalizedPartCategory) e.category = "Parça kategorisi seçin.";
      if (normalizedPartCategory === "OTHER" && !partCategoryOther.trim()) {
        e.partCategoryOther = "Diğer kategori açıklaması zorunlu.";
      }
      if (!partSubCategory) e.partSubCategory = "Alt parça seçin.";
      if (partSubCategory === "OTHER" && !partSubCategoryOther.trim()) {
        e.partSubCategoryOther = "Diğer alt parça açıklaması zorunlu.";
      }
      if (compatibleVehicleBrands.length < 1) {
        e.compatibleVehicleBrands = "En az bir uyumlu marka seçin.";
      }
      if (compatibleVehicleBrands.includes("OTHER") && !compatibleVehicleBrandsOther.trim()) {
        e.compatibleVehicleBrandsOther = "Diğer uyumlu marka açıklaması zorunlu.";
      }
      if (compatibleVehicleModels.includes("OTHER") && !compatibleVehicleModelsOther.trim()) {
        e.compatibleVehicleModelsOther = "Diğer uyumlu model açıklaması zorunlu.";
      }
    }
    if (isMaintenanceCategory) {
      if (!brand) {
        e.brand = "Marka seçin.";
      }
      if (brand === "OTHER") {
        const trimmed = brandOtherText.trim();
        if (trimmed.length < 2 || trimmed.length > 50) {
          e.brandOtherText = "Diğer marka 2-50 karakter olmalı.";
        }
      } else if (brandOtherText.trim()) {
        e.brandOtherText = "Diğer açıklaması sadece 'Diğer' seçildiğinde girilebilir.";
      }
      if (!maintenanceCategory) {
        e.maintenanceCategory = "Alt kategori seçin.";
      }
      if (maintenanceCategory === "Diğer" && !maintenanceCategoryOther.trim()) {
        e.maintenanceCategoryOther = "Diğer kategori açıklaması zorunlu.";
      }
      if (showViscosity && viscosity === "Diğer" && !viscosityOther.trim()) {
        e.viscosityOther = "Diğer viskozite açıklaması zorunlu.";
      }
      if (showStandard && standard === "Diğer" && !standardOther.trim()) {
        e.standardOther = "Diğer standart açıklaması zorunlu.";
      }
      if (showVolume && volume === "Diğer" && !volumeOther.trim()) {
        e.volumeOther = "Diğer hacim açıklaması zorunlu.";
      }
    }
    if (isTire) {
      if (!brand) e.brand = "Lastik markası zorunlu";
      if (!tireSize) e.tireSize = "Lastik ölçüsü zorunlu";
    }
    if (!condition) e.condition = "Durum seçin.";
    if (images.length < 1) e.images = "En az 1 fotoğraf yüklenmelidir.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validate()) return;

    const normalizedOther = sizeValue === "OTHER" ? sizeOtherText.trim() : "";
    const partCategoryValue = isPartCategory ? normalizedPartCategory : "";
    const maintenanceCategoryValue = isMaintenanceCategory
      ? maintenanceCategory === "Diğer"
        ? "OTHER"
        : maintenanceCategory
      : "";
    const viscosityValue = viscosity === "Diğer" ? "OTHER" : viscosity;
    const standardValue = standard === "Diğer" ? "OTHER" : standard;
    const volumeValue = volume === "Diğer" ? "OTHER" : volume;

    const payload = {
      title,
      description,
      price,
      // 🔄 GELİŞTİRME 3: İlan tipi ve kiralama detayları
      listingType,
      rentalDetails: listingType === 'rent' ? {
        period: rentalPeriod || null,
        minDuration: minDuration ? Number(minDuration) : null,
        maxDuration: maxDuration ? Number(maxDuration) : null,
        deposit: deposit ? Number(deposit) : null,
        includesHelmet,
        includesInsurance,
      } : {
        period: null,
        minDuration: null,
        maxDuration: null,
        deposit: null,
        includesHelmet: false,
        includesInsurance: false,
      },
      phone,
      city,
      parentCategory,
      category,
      partCategory: partCategoryValue,
      partCategoryOther: partCategoryValue === "OTHER" ? partCategoryOther.trim() : "",
      partSubCategory,
      partSubCategoryOther: partSubCategory === "OTHER" ? partSubCategoryOther.trim() : "",
      maintenanceCategory: maintenanceCategoryValue,
      maintenanceCategoryOther:
        maintenanceCategoryValue === "OTHER" ? maintenanceCategoryOther.trim() : "",
      viscosity: showViscosity ? viscosityValue : "",
      viscosityOther: viscosityValue === "OTHER" ? viscosityOther.trim() : "",
      standard: showStandard ? standardValue : "",
      standardOther: standardValue === "OTHER" ? standardOther.trim() : "",
      volume: showVolume ? volumeValue : "",
      volumeOther: volumeValue === "OTHER" ? volumeOther.trim() : "",
      sizeType,
      sizeValue,
      sizeGender,
      sizeSystem,
      sizeOtherText: normalizedOther,
      brandType,
      brand: brand === "OTHER" ? "OTHER" : brand,
      brandOtherText: brand === "OTHER" ? brandOtherText.trim() : "",
      model,
      modelYear: modelYear ? Number(modelYear) : null,
      condition,
      compatibleVehicleBrands,
      compatibleVehicleBrandsOther: compatibleVehicleBrands.includes("OTHER")
        ? compatibleVehicleBrandsOther.trim()
        : "",
      compatibleVehicleModels,
      compatibleVehicleModelsOther: compatibleVehicleModels.includes("OTHER")
        ? compatibleVehicleModelsOther.trim()
        : "",
      compatibleEngineRange: {
        min: compatibleEngineMin ? Number(compatibleEngineMin) : null,
        max: compatibleEngineMax ? Number(compatibleEngineMax) : null,
      },
      compatibleYearRange: {
        from: compatibleYearFrom ? Number(compatibleYearFrom) : null,
        to: compatibleYearTo ? Number(compatibleYearTo) : null,
      },
      tireSize,
      images,
    };

    if (!isEquipmentCategory) {
      payload.sizeType = "";
      payload.sizeValue = "";
      payload.sizeGender = "";
      payload.sizeSystem = "";
      payload.sizeOtherText = "";
    }
    if (!isPartCategory) {
      payload.partCategory = "";
      payload.partCategoryOther = "";
      payload.partSubCategory = "";
      payload.partSubCategoryOther = "";
      payload.compatibleVehicleBrands = [];
      payload.compatibleVehicleBrandsOther = "";
      payload.compatibleVehicleModels = [];
      payload.compatibleVehicleModelsOther = "";
      payload.compatibleEngineRange = { min: null, max: null };
      payload.compatibleYearRange = { from: null, to: null };
    }
    if (!isMaintenanceCategory) {
      payload.maintenanceCategory = "";
      payload.maintenanceCategoryOther = "";
      payload.viscosity = "";
      payload.viscosityOther = "";
      payload.standard = "";
      payload.standardOther = "";
      payload.volume = "";
      payload.volumeOther = "";
      payload.brandOtherText = "";
    }

    try {
      await listingsApi.updateListing(id, payload);
      setSuccess("✅ İlanınız başarıyla güncellendi! Değişiklikler incelemeye alındı.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setErrors({
        backend: err.response?.data?.message || "Bir hata oluştu.",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold">İlan Düzenle</h1>

      {success && (
        <p className="p-2 bg-green-200 text-green-800 rounded">{success}</p>
      )}
      {errors.backend && (
        <p className="p-2 bg-red-200 text-red-800 rounded">{errors.backend}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            className="w-full p-2 border rounded"
            placeholder="Başlık (min 3 karakter)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <p className="text-red-600 text-sm">{errors.title}</p>
          )}
        </div>

        <div>
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Açıklama (min 20 karakter)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="text-red-600 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-2 top-2 text-gray-500">₺</span>
          <input
            className="w-full p-2 pl-6 border rounded"
            type="number"
            placeholder="Fiyat"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {errors.price && (
            <p className="text-red-600 text-sm">{errors.price}</p>
          )}
        </div>

        {/* 🔄 GELİŞTİRME 3: İlan Tipi Seçimi */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <label className="block text-sm font-medium text-text-primary mb-3">
            İlan Tipi *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="sale"
                checked={listingType === 'sale'}
                onChange={(e) => setListingType(e.target.value)}
                className="mr-2"
              />
              <span className="text-text-primary">Satılık</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="rent"
                checked={listingType === 'rent'}
                onChange={(e) => setListingType(e.target.value)}
                className="mr-2"
              />
              <span className="text-text-primary">Kiralık</span>
            </label>
          </div>
        </div>

        {/* 🔄 GELİŞTİRME 3: Kiralık İlan Detayları */}
        {listingType === 'rent' && (
          <div className="bg-card-hover p-4 rounded-lg border border-primary/30 space-y-3">
            <h3 className="text-sm font-medium text-text-primary mb-2">
              📋 Kiralama Detayları
            </h3>

            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Kiralama Periyodu *
              </label>
              <select
                className="w-full p-2 bg-background border border-border/60 rounded-lg text-text-primary focus:outline-none focus:border-primary/60"
                value={rentalPeriod}
                onChange={(e) => setRentalPeriod(e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
              {errors.rentalPeriod && <p className="text-error text-sm">{errors.rentalPeriod}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Min. Süre
                </label>
                <input
                  type="number"
                  className="w-full p-2 bg-background border border-border/60 rounded-lg text-text-primary focus:outline-none focus:border-primary/60"
                  placeholder="Örn: 3"
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Maks. Süre
                </label>
                <input
                  type="number"
                  className="w-full p-2 bg-background border border-border/60 rounded-lg text-text-primary focus:outline-none focus:border-primary/60"
                  placeholder="Örn: 30"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Depozito (₺)
              </label>
              <input
                type="number"
                className="w-full p-2 bg-background border border-border/60 rounded-lg text-text-primary focus:outline-none focus:border-primary/60"
                placeholder="Örn: 500"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesHelmet}
                  onChange={(e) => setIncludesHelmet(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-text-primary">🪖 Kask dahil</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesInsurance}
                  onChange={(e) => setIncludesInsurance(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-text-primary">🛡️ Sigorta dahil</span>
              </label>
            </div>
          </div>
        )}

        <div>
          <input
            className="w-full p-2 border rounded"
            placeholder="+90 5xx xxx xx xx"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            maxLength={18}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm">{errors.phone}</p>
          )}
        </div>

        <div>
          <select
            className="w-full p-2 border rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Şehir seç</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <select
              className="w-full p-2 border rounded"
              value={parentCategory}
              onChange={(e) => {
                setParentCategory(e.target.value);
                setCategory("");
              }}
            >
              <option value="">Ana kategori seç</option>
              {PARENT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.parentCategory && (
              <p className="text-red-600 text-sm">{errors.parentCategory}</p>
            )}
          </div>

          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (isMaintenanceCategory) {
                setMaintenanceCategory(e.target.value);
              }
            }}
            disabled={!parentCategory}
          >
            <option value="">Alt kategori seç</option>
            {(CATEGORY_TREE[parentCategory] || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm">{errors.category}</p>
          )}
        </div>

        {isPartCategory && (
          <div className="space-y-3">
            {category === "Diğer" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer parça kategorisi
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Kategori açıklaması"
                  value={partCategoryOther}
                  onChange={(e) => setPartCategoryOther(e.target.value)}
                />
                {errors.partCategoryOther && (
                  <p className="text-red-600 text-sm">{errors.partCategoryOther}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alt Parça
              </label>
              <select
                className="w-full p-2 border rounded"
                value={partSubCategory}
                onChange={(e) => {
                  setPartSubCategory(e.target.value);
                  if (e.target.value !== "OTHER") setPartSubCategoryOther("");
                }}
              >
                <option value="">Alt parça seç</option>
                {partSubCategoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "OTHER" ? "Diğer" : opt}
                  </option>
                ))}
              </select>
              {errors.partSubCategory && (
                <p className="text-red-600 text-sm">{errors.partSubCategory}</p>
              )}
            </div>

            {partSubCategory === "OTHER" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer alt parça açıklaması
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Alt parça açıklaması"
                  value={partSubCategoryOther}
                  onChange={(e) => setPartSubCategoryOther(e.target.value)}
                />
                {errors.partSubCategoryOther && (
                  <p className="text-red-600 text-sm">{errors.partSubCategoryOther}</p>
                )}
              </div>
            )}
          </div>
        )}

        {isMaintenanceCategory && (
          <div className="space-y-3">
            {maintenanceCategory === "Diğer" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer bakım kategorisi
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Kategori açıklaması"
                  value={maintenanceCategoryOther}
                  onChange={(e) => setMaintenanceCategoryOther(e.target.value)}
                />
                {errors.maintenanceCategoryOther && (
                  <p className="text-red-600 text-sm">{errors.maintenanceCategoryOther}</p>
                )}
              </div>
            )}

            {showViscosity && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Viskozite (opsiyonel)
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={viscosity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setViscosity(value);
                    if (value !== "Diğer") setViscosityOther("");
                  }}
                >
                  <option value="">Seçiniz</option>
                  {VISCOSITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {viscosity === "Diğer" && (
                  <input
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Diğer viskozite"
                    value={viscosityOther}
                    onChange={(e) => setViscosityOther(e.target.value)}
                  />
                )}
                {errors.viscosityOther && (
                  <p className="text-red-600 text-sm">{errors.viscosityOther}</p>
                )}
              </div>
            )}

            {showStandard && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Standart (opsiyonel)
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={standard}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStandard(value);
                    if (value !== "Diğer") setStandardOther("");
                  }}
                >
                  <option value="">Seçiniz</option>
                  {standardOptionsForCategory.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {standard === "Diğer" && (
                  <input
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Diğer standart"
                    value={standardOther}
                    onChange={(e) => setStandardOther(e.target.value)}
                  />
                )}
                {errors.standardOther && (
                  <p className="text-red-600 text-sm">{errors.standardOther}</p>
                )}
              </div>
            )}

            {showVolume && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hacim (opsiyonel)
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={volume}
                  onChange={(e) => {
                    const value = e.target.value;
                    setVolume(value);
                    if (value !== "Diğer") setVolumeOther("");
                  }}
                >
                  <option value="">Seçiniz</option>
                  {VOLUME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {volume === "Diğer" && (
                  <input
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Diğer hacim (örn: 750 ml)"
                    value={volumeOther}
                    onChange={(e) => setVolumeOther(e.target.value)}
                  />
                )}
                {errors.volumeOther && (
                  <p className="text-red-600 text-sm">{errors.volumeOther}</p>
                )}
              </div>
            )}
          </div>
        )}

        {!isMaintenanceCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <select
                className="w-full p-2 border rounded"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={!(isVehicleCategory || isEquipmentCategory || isPartCategory)}
              >
                <option value="">Marka seç</option>
                {brandOptions.map((b, idx) => (
                  <option
                    key={`${b.value}-${isEquipmentCategory ? equipmentCategorySlug : "vehicle"}-${idx}`}
                    value={b.value}
                  >
                    {b.label}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="text-red-600 text-sm">{errors.brand}</p>}
            </div>

            <select
              className="w-full p-2 border rounded"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={
                (!isVehicleCategory && !isEquipmentCategory && !isPartCategory) || !brand
              }
            >
              <option value="">Model seç</option>
              {modelOptions.map((m, idx) => {
                const label = m.name || m.value;
                const slug = m.slug || m.value || m.name;
                return (
                  <option key={`${slug}-${brand || "model"}-${idx}`} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.model && <p className="text-red-600 text-sm">{errors.model}</p>}
          </div>
        )}
        {isMaintenanceCategory && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
              <select
                className="w-full p-2 border rounded"
                value={brand}
                onChange={(e) => {
                  const val = e.target.value;
                  setBrand(val);
                  if (val !== "OTHER") setBrandOtherText("");
                }}
              >
                <option value="">Marka seç</option>
                {CHEMICAL_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b === "OTHER" ? "Diğer" : b}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="text-red-600 text-sm">{errors.brand}</p>}
            </div>
            {brand === "OTHER" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer marka
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Marka adı"
                  value={brandOtherText}
                  onChange={(e) => setBrandOtherText(e.target.value)}
                  maxLength={50}
                />
                {errors.brandOtherText && (
                  <p className="text-red-600 text-sm">{errors.brandOtherText}</p>
                )}
              </div>
            )}
          </div>
        )}

        {isPartCategory && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Uyumlu Marka(lar)
              </label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={compatibleVehicleBrands}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setCompatibleVehicleBrands(vals);
                  if (!vals.includes("OTHER")) setCompatibleVehicleBrandsOther("");
                }}
              >
                {compatibleBrandOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Birden fazla seçim için Ctrl/Cmd basılı tutun.
              </p>
              {errors.compatibleVehicleBrands && (
                <p className="text-red-600 text-sm">{errors.compatibleVehicleBrands}</p>
              )}
            </div>

            {compatibleVehicleBrands.includes("OTHER") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer uyumlu marka
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Marka açıklaması"
                  value={compatibleVehicleBrandsOther}
                  onChange={(e) => setCompatibleVehicleBrandsOther(e.target.value)}
                />
                {errors.compatibleVehicleBrandsOther && (
                  <p className="text-red-600 text-sm">{errors.compatibleVehicleBrandsOther}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Uyumlu Model(ler)
              </label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={compatibleVehicleModels}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setCompatibleVehicleModels(vals);
                  if (!vals.includes("OTHER")) setCompatibleVehicleModelsOther("");
                }}
              >
                {compatibleModelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Seçili markalara göre modeller listelenir; gerekirse Diğer seçin.
              </p>
              {errors.compatibleVehicleModels && (
                <p className="text-red-600 text-sm">{errors.compatibleVehicleModels}</p>
              )}
            </div>

            {compatibleVehicleModels.includes("OTHER") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diğer uyumlu model
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Model açıklaması"
                  value={compatibleVehicleModelsOther}
                  onChange={(e) => setCompatibleVehicleModelsOther(e.target.value)}
                />
                {errors.compatibleVehicleModelsOther && (
                  <p className="text-red-600 text-sm">{errors.compatibleVehicleModelsOther}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Uyumlu motor hacmi (cc)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    placeholder="Min"
                    value={compatibleEngineMin}
                    onChange={(e) => setCompatibleEngineMin(e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    placeholder="Max"
                    value={compatibleEngineMax}
                    onChange={(e) => setCompatibleEngineMax(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Uyumlu model yılları
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    placeholder="Başlangıç"
                    value={compatibleYearFrom}
                    onChange={(e) => setCompatibleYearFrom(e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    placeholder="Bitiş"
                    value={compatibleYearTo}
                    onChange={(e) => setCompatibleYearTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Yılı (Taşıtlar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              className="w-full p-2 border rounded"
              type="number"
              placeholder="Model yılı (örn: 2022)"
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
              disabled={parentCategory !== "Taşıtlar"}
            />
            {errors.modelYear && (
              <p className="text-red-600 text-sm">{errors.modelYear}</p>
            )}
          </div>

          <select
            className="w-full p-2 border rounded"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Durum seç</option>
            <option value="sifir">Sıfır</option>
            <option value="ikinci_el">İkinci El</option>
          </select>
          {errors.condition && (
            <p className="text-red-600 text-sm">{errors.condition}</p>
          )}
        </div>

        {/* Beden (Ekipman) */}
        {isEquipmentCategory && sizeOptions.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cinsiyet</label>
                <select
                  className="w-full p-2 border rounded"
                  value={sizeGender}
                  onChange={(e) => setSizeGender(e.target.value)}
                >
                  <option value="MALE">Erkek</option>
                  <option value="FEMALE">Kadın</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ölçü sistemi</label>
                <select
                  className="w-full p-2 border rounded"
                  value={sizeSystem}
                  onChange={(e) => setSizeSystem(e.target.value)}
                >
                  {getDefaultSizeMetaForCategory(category).systems.map((sys) => (
                    <option key={sys} value={sys}>
                      {sys}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beden
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={sizeValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSizeValue(value);
                    if (value !== "OTHER") setSizeOtherText("");
                  }}
                >
                  <option value="">Beden seç</option>
                  {sizeOptions.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                      {opt.label || opt}
                    </option>
                  ))}
                </select>
                {errors.sizeValue && (
                  <p className="text-red-600 text-sm">{errors.sizeValue}</p>
                )}
              </div>

              {sizeValue === "OTHER" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Diğer beden açıklaması
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    placeholder="Örn: Kadın US 6.5, 55-56 cm vb."
                    value={sizeOtherText}
                    onChange={(e) => setSizeOtherText(e.target.value)}
                  />
                  {errors.sizeOtherText && (
                    <p className="text-red-600 text-sm">{errors.sizeOtherText}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <ImageUploader token={token} images={images} onChange={setImages} />
          {errors.images && (
            <p className="text-red-600 text-sm">{errors.images}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-300 text-gray-800 p-2 rounded"
          >
            İptal
          </button>
          <button
            type="submit"
            className="flex-1 bg-slate-900 text-white p-2 rounded"
          >
            Güncelle
          </button>
        </div>
      </form>
    </div>
  );
}
