import Image from "next/image";

type TimbiTitleProps = {
  width?: number;
  height?: number;
};

export default function TimbiTitle({
  width = 160,
  height = 60,
}: TimbiTitleProps) {
  return (
    <Image
      src="/timbi/timbi-title.png"
      alt="Timbi Title"
      width={width}
      height={height}
    />
  );
}