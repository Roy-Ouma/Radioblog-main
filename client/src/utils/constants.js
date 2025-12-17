import { MdCastForEducation, MdOutlineSportsHandball } from "react-icons/md";
import { BsCodeSlash, BsNewspaper } from "react-icons/bs";
import { GiClothes, GiAtom, GiDramaMasks } from "react-icons/gi";
import { FaSpa, FaHeartbeat, FaStar, FaMicrochip, FaBriefcase, FaFilm, FaPlane, FaCommentAlt, FaUtensils, FaPalette, FaBalanceScale } from "react-icons/fa";

export const CATEGORIES = [
  { label: "NEWS", color: "bg-[#e11d48]", icon: <BsNewspaper /> },
  { label: "SPORTS", color: "bg-[#2563eb]", icon: <MdOutlineSportsHandball /> },
  { label: "CODING", color: "bg-[#000000]", icon: <BsCodeSlash /> },
  { label: "EDUCATION", color: "bg-[#ca8a04]", icon: <MdCastForEducation /> },
  { label: "FASHION", color: "bg-[#9333ea]", icon: <GiClothes /> },

  // Additional categories (consistent style/colors/icons)
  { label: "LIFESTYLE", color: "bg-[#fb923c]", icon: <FaSpa /> },
  { label: "HEALTH", color: "bg-[#ef4444]", icon: <FaHeartbeat /> },
  { label: "SCIENCE", color: "bg-[#06b6d4]", icon: <GiAtom /> },
  { label: "POLITICS", color: "bg-[#7c3aed]", icon: <FaBalanceScale /> },
  { label: "FEATURES", color: "bg-[#f59e0b]", icon: <FaStar /> },
  { label: "TECHNOLOGY", color: "bg-[#374151]", icon: <FaMicrochip /> },
  { label: "BUSINESS", color: "bg-[#2563eb]", icon: <FaBriefcase /> },
  { label: "ENTERTAINMENT", color: "bg-[#f97316]", icon: <FaFilm /> },
  { label: "TRAVEL", color: "bg-[#06b6d4]", icon: <FaPlane /> },
  { label: "OPINION", color: "bg-[#64748b]", icon: <FaCommentAlt /> },
  { label: "FOOD", color: "bg-[#f43f5e]", icon: <FaUtensils /> },
  { label: "CULTURE", color: "bg-[#db2777]", icon: <GiDramaMasks /> },
  { label: "ART", color: "bg-[#ec4899]", icon: <FaPalette /> },
];

