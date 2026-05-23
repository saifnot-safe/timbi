import Image from "next/image";

type TimbiProps = {
    size?: number;
    className?: string;
};

export default function Timbi({size=100, className = ""}: TimbiProps) {
    return(<Image src="/timbi/timbi.png" alt="Timbi logo" width={size} height={size} className={className}
 unoptimized/>);
    
}