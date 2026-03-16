import ListingRow from "./ListingRow";

const ListingList = ({ listings }) => {
  return (
    <div className="flex flex-col bg-card rounded-xl border border-primary/10 overflow-hidden">
      {listings.map((listing) => (
        <ListingRow key={listing._id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingList;
