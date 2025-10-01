import { motion } from "framer-motion";
import useWindowWidth from "./useWindowWidth";
import { Menu } from "lucide-react";

export default function MenuButton({ isOpen, onClick }) {
  const windowWidth = useWindowWidth();

  if (windowWidth >= 1024) {
    return (
      <button
        onClick={onClick}
        className="relative w-6 h-4 flex flex-col justify-between items-center cursor-pointer"
      >
        {/* Top line */}
        <motion.span className="block w-6 h-0.5 bg-black" />
        {/* Middle line */}
        <motion.span className="block w-6 h-0.5 bg-black" />
        {/* Bottom line */}
        <motion.span className="block w-6 h-0.5 bg-black" />
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="relative w-6 h-4 flex flex-col justify-between items-center cursor-pointer"
    >
      {/* Top line */}
      <motion.span
        className="block w-6 h-0.5 bg-black"
        animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3 }}
      />
      {/* Middle line */}
      <motion.span
        className="block w-6 h-0.5 bg-black"
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {/* Bottom line */}
      <motion.span
        className="block w-6 h-0.5 bg-black"
        animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3 }}
      />
    </button>
  );
}
