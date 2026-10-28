import Image from "next/image";
import { appConfig } from "@/config/app";
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <Image src={appConfig.logo} width={size} height={size} alt="" unoptimized />
  );
}
