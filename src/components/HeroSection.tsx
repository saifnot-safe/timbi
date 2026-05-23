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
      </div>

      <div className="pr-12">
        <Timbi size={420} className="scale-x-[-1]" />
      </div>
    </section>
  );
}