import { UserCircle } from "lucide-react";

type Props = {
  userRole: string | null;
  profileMedal?: string | null;
  profileColor: string;
  size?: "sm" | "md";
};

export default function ProfileAvatar({
  userRole,
  profileMedal,
  profileColor,
  size = "md",
}: Props) {
  const baseSize = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = size === "sm" ? 22 : 28;

  if (userRole === "vendor" && profileMedal) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full border-2 border-white 
        ${size === "sm" ? "px-2 py-1" : "px-3 py-2"}
        shadow-lg transition-transform hover:scale-110`}
        style={{
          backgroundColor: "#000",
          boxShadow: `0 0 18px ${profileColor}80`,
        }}
        title="Vendor Rank"
      >
        <span className="text-xs font-black text-white">
          {profileMedal}
        </span>
        <div className="absolute inset-0 rounded-full border border-yellow-400 opacity-40 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`${baseSize} rounded-full flex items-center justify-center border-2`}
      style={{
        backgroundColor: profileColor,
        borderColor: "rgba(255,255,255,0.9)",
        boxShadow: `0 0 18px ${profileColor}80`,
      }}
    >
      <UserCircle size={iconSize} className="text-white" />
    </div>
  );
}
