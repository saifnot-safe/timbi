import Timbi from "./Timbi";
import TimbiTitle from "./TimbiTitle";

export default function HeroSection() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-between px-16">
      <div>
        <h1 className="text-6xl font-bold leading-tight text-[#ff9d00]">
          Let <span className="text-[#DA7625]">Timbi</span> find
          <br />
          your next meal
        </h1>

        <div className="mt-8 flex gap-4">
  <button className="rounded-2xl bg-[#ff9d00] px-8 py-5 w-48 text-xl font-semibold text-white shadow-md transition hover:scale-105">
    Find Food
  </button>

  <button className="rounded-2xl border-4 border-[#DA7625] px-8 py-5 text-xl font-semibold text-[#DA7625] transition hover:bg-[#fff4e6]">
    Report Food
  </button>
</div>


      </div>

      <div className="pr-12">
        <Timbi size={420} className="scale-x-[-1]" />
      </div>
    </section>
  );
}