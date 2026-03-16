/**
 * Profile Completion Score Calculator
 * FAZ 14.1 - Locked Scoring Rules
 *
 * TOTAL: 105 points (normalized to 100%)
 *
 * Step 1 – 40 points
 * - City: 15
 * - District: 5
 * - Courier Type: 20
 *
 * Step 2 – 20 points
 * - Vehicle: 5–8
 * - Equipments: 7–12
 *
 * Step 3 – 30 points
 * - Platform: 10
 * - Experience: 10
 * - Working Hours: 5
 * - Available Days: 5
 *
 * Step 4 – 15 points
 * - Profile Photo: 15
 */

export function calculateProfileScore(formData, userPhoto = null) {
  let score = 0;
  const breakdown = {
    step1: 0,
    step2: 0,
    step3: 0,
    step4: 0,
  };

  // ========================================
  // STEP 1: Location & Courier Type (40 pts)
  // ========================================

  // City: 15 points
  if (formData.location?.city && formData.location.city !== "") {
    score += 15;
    breakdown.step1 += 15;
  }

  // District: 5 points
  if (
    formData.location?.district &&
    formData.location.district !== "" &&
    formData.location.district !== "Farketmez"
  ) {
    score += 5;
    breakdown.step1 += 5;
  }

  // Courier Type: 20 points
  if (formData.courierTypes && formData.courierTypes.length > 0) {
    score += 20;
    breakdown.step1 += 20;
  }

  // ========================================
  // STEP 2: Vehicle & Equipment (20 pts)
  // ========================================

  // Vehicle: 5-8 points (dynamic based on courier type)
  const hasMotorCourier = formData.courierTypes?.includes("motor_kurye");
  const hasCarCourier = formData.courierTypes?.includes("aracli_kurye");
  const hasBicycleCourier = formData.courierTypes?.includes("bisikletli_kurye");

  let vehicleScore = 0;

  // Motor: brand OR model OR cc = 5pts, all three = 8pts
  if (hasMotorCourier) {
    const motorFilled =
      [
        formData.vehicle?.motor?.brand,
        formData.vehicle?.motor?.model,
        formData.vehicle?.motor?.cc,
      ].filter(Boolean).length;

    if (motorFilled >= 3) vehicleScore = Math.max(vehicleScore, 8);
    else if (motorFilled > 0) vehicleScore = Math.max(vehicleScore, 5);
  }

  // Car: type OR volumeM3 = 5pts, both = 8pts
  if (hasCarCourier) {
    const carFilled = [
      formData.vehicle?.car?.type,
      formData.vehicle?.car?.volumeM3,
    ].filter(Boolean).length;

    if (carFilled >= 2) vehicleScore = Math.max(vehicleScore, 8);
    else if (carFilled > 0) vehicleScore = Math.max(vehicleScore, 5);
  }

  // Bicycle: type OR maxKg = 5pts, both = 8pts
  if (hasBicycleCourier) {
    const bicycleFilled = [
      formData.vehicle?.bicycle?.type,
      formData.vehicle?.bicycle?.maxKg,
    ].filter(Boolean).length;

    if (bicycleFilled >= 2) vehicleScore = Math.max(vehicleScore, 8);
    else if (bicycleFilled > 0) vehicleScore = Math.max(vehicleScore, 5);
  }

  score += vehicleScore;
  breakdown.step2 += vehicleScore;

  // Equipment: 7-12 points
  // Each equipment = +2.4 points (5 items = 12 pts max)
  const equipmentCount = [
    formData.equipment?.hasBox,
    formData.equipment?.hasHelmet,
    formData.equipment?.hasRainGear,
    formData.equipment?.hasPhoneMount,
    formData.equipment?.hasPowerBank,
  ].filter(Boolean).length;

  const equipmentScore = Math.min(Math.round(equipmentCount * 2.4), 12);
  score += equipmentScore;
  breakdown.step2 += equipmentScore;

  // ========================================
  // STEP 3: Experience & Availability (30 pts)
  // ========================================

  // Platform: 10 points (any platform selected)
  if (formData.platforms && formData.platforms.length > 0) {
    score += 10;
    breakdown.step3 += 10;
  }

  // Experience: 10 points (>= 1 year)
  if (formData.experienceYears && formData.experienceYears >= 1) {
    score += 10;
    breakdown.step3 += 10;
  }

  // Working Hours: 5 points
  if (formData.availability?.hours && formData.availability.hours !== "") {
    score += 5;
    breakdown.step3 += 5;
  }

  // Available Days: 5 points (at least 1 day)
  if (formData.availability?.days && formData.availability.days.length > 0) {
    score += 5;
    breakdown.step3 += 5;
  }

  // ========================================
  // STEP 4: Profile Photo (15 pts)
  // ========================================

  if (userPhoto) {
    score += 15;
    breakdown.step4 += 15;
  }

  // ========================================
  // Normalize to 100
  // ========================================
  // Max = 105 points, normalize to 100
  const percentage = Math.min(Math.round((score / 105) * 100), 100);

  return {
    score: percentage,
    breakdown,
    rawScore: score,
    maxScore: 105,
  };
}

export function getProfileCompletionMessage(score) {
  if (score >= 86) return { text: "Profiliniz mükemmel! 🎉", color: "green" };
  if (score >= 70) return { text: "Profiliniz çok iyi! 👍", color: "blue" };
  if (score >= 40)
    return { text: "İyi başlangıç, tamamlamaya devam edin! 💪", color: "yellow" };
  return { text: "Profilinizi tamamlayın, daha fazla fırsat yakalayın! 🚀", color: "red" };
}
