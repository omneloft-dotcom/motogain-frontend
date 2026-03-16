/**
 * TargetFavoriteIcon – Classic 4-leaf clover ("yonca") icon
 *
 * Design   : Traditional clover with 4 rounded heart-shaped leaves
 * Inactive : Silver/gray outline (#888888), hollow
 * Active   : Full Cordy green fill (#1FAF73), no stroke
 *
 * High contrast between states for clear visual distinction
 * Matches mobile app design exactly
 */
export default function TargetFavoriteIcon({
  isActive = false,
  size = 24,
  className = "",
  onClick,
}) {
  const activeColor = '#1FAF73'; // Cordy Primary Green
  const inactiveColor = '#888888'; // Silver/Gray for outline

  // 4-leaf clover with heart-shaped petals
  // Hearts flow smoothly into center creating unified clover shape
  const cloverPath =
    // Continuous path forming 4 heart petals connected at center
    "M 12 10 " + // Start at top center

    // Top heart petal (pointing up)
    "C 10.5 10 9 8.5 9 7 C 9 5.5 10 4.5 11 4.5 C 11.5 4.5 12 4.8 12 5.5 " +
    "C 12 4.8 12.5 4.5 13 4.5 C 14 4.5 15 5.5 15 7 C 15 8.5 13.5 10 12 10 Z " +

    // Right heart petal (pointing right)
    "M 14 12 " +
    "C 14 10.5 15.5 9 17 9 C 18.5 9 19.5 10 19.5 11 C 19.5 11.5 19.2 12 18.5 12 " +
    "C 19.2 12 19.5 12.5 19.5 13 C 19.5 14 18.5 15 17 15 C 15.5 15 14 13.5 14 12 Z " +

    // Bottom heart petal (pointing down)
    "M 12 14 " +
    "C 13.5 14 15 15.5 15 17 C 15 18.5 14 19.5 13 19.5 C 12.5 19.5 12 19.2 12 18.5 " +
    "C 12 19.2 11.5 19.5 11 19.5 C 10 19.5 9 18.5 9 17 C 9 15.5 10.5 14 12 14 Z " +

    // Left heart petal (pointing left)
    "M 10 12 " +
    "C 10 13.5 8.5 15 7 15 C 5.5 15 4.5 14 4.5 13 C 4.5 12.5 4.8 12 5.5 12 " +
    "C 4.8 12 4.5 11.5 4.5 11 C 4.5 10 5.5 9 7 9 C 8.5 9 10 10.5 10 12 Z";

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        transition: "opacity 120ms ease-out",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.opacity = "1";
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path
          d={cloverPath}
          fill={isActive ? activeColor : "transparent"}
          stroke={isActive ? "none" : inactiveColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ transition: "fill 120ms ease-out, stroke 120ms ease-out" }}
        />
      </svg>
    </div>
  );
}
