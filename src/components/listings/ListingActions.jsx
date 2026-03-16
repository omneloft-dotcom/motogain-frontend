import { useAuth } from "../../context/AuthProvider";
import TargetFavoriteIcon from "../icons/TargetFavoriteIcon";

export default function ListingActions({ listing }) {
  const { user, favorites, toggleFavorite } = useAuth();

  if (!user || !listing?._id) return null;

  const isFavorite = favorites.includes(listing._id);

  const handleFavoriteClick = async () => {
    await toggleFavorite(listing._id);
  };

  return (
    <div className="mt-3 flex justify-end">
      <button
        onClick={handleFavoriteClick}
        className="p-2.5 rounded-full bg-black/30 hover:bg-black/35 transition-opacity duration-150"
      >
        <TargetFavoriteIcon isActive={isFavorite} size={18} />
      </button>
    </div>
  );
}
