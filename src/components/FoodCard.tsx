type FoodCardProps = {
  title: string;
  location: string;
  time: string;
};

export default function FoodCard({
  title,
  location,
  time,
}: FoodCardProps) {
  return (
    <div className="w-72 h-32 shrink-0 bg-[#ffebd0]
rounded-3xl p-4 shadow-[0_4px_10px_rgba(120,80,40,0.08)]">
      <h2 className="text-2xl text-[#6b4f3a] font-semibold">{title}</h2>
      <p className="text-xl text-[#6b4f3a]">{location}</p>
      <p className="text-lg text-[#ff9d00]">{time}</p>
    </div>
  );
}