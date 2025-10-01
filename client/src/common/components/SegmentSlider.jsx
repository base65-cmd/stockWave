import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const SegmentSlider = ({
  items = [],
  className = "",
  className2,
  className3,
  onChange,
  onClick,
  vendorDirectory = false,
  selected,
  setSelected,
}) => {
  const [sliderStyle, setSliderStyle] = useState({ x: 0, width: 0 });

  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (itemRefs.current[selected]) {
      const el = itemRefs.current[selected];
      setSliderStyle({ x: el.offsetLeft, width: el.offsetWidth });
    }
  }, [selected, items]);

  const handleSelect = (index) => {
    setSelected(index);
    onChange?.(items[index], index);
    onClick && onClick(index);
  };

  return (
    <div className={clsx("flex justify-center", className)}>
      <div
        ref={containerRef}
        className={clsx(
          "relative flex w-full items-center justify-start bg-gray-200 ",
          { "rounded-lg": vendorDirectory !== true }
        )}
      >
        <motion.div
          className={clsx("absolute top-1 bottom-1 z-0", className2)}
          initial={false}
          animate={{ x: sliderStyle.x, width: sliderStyle.width }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />

        {items.map((item, index) => (
          <button
            key={item}
            ref={(el) => (itemRefs.current[index] = el)}
            onClick={() => handleSelect(index)}
            className={clsx(
              "relative  z-10 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-300 whitespace-nowrap flex justify-center",
              selected === index ? "text-black" : "text-gray-500",
              { "mr-1": index === items.length - 1, "ml-1": index === 0 },
              className3
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentSlider;
