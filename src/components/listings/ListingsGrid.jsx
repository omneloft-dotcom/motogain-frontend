// src/components/listings/ListingsGrid.jsx
import ListingCard from "./ListingCard";

export default function ListingsGrid({ listings = [], favorites = [], onToggle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} favorites={favorites} onToggle={onToggle} />
      ))}
    </div>
  );
}
