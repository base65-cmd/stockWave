import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Check } from "lucide-react";
import useWindowWidth from "../useWindowWidth";
import { Tooltip } from "antd";

export default function StageProgressBar({
  stages = [],
  currentStep = 0,
  className = "",
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [trackStyle, setTrackStyle] = useState({ left: 0, width: 0 });

  // Recalculate track boundaries whenever stages change or on resize
  const calcTrack = () => {
    if (!containerRef.current || itemRefs.current.length < 2) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const firstRect = itemRefs.current[0].getBoundingClientRect();
    const lastRect =
      itemRefs.current[itemRefs.current.length - 1].getBoundingClientRect();

    const left = firstRect.left + firstRect.width / 2 - containerRect.left;
    const width =
      lastRect.left + lastRect.width / 2 - containerRect.left - left;

    setTrackStyle({ left, width });
  };

  useEffect(() => {
    calcTrack();
    window.addEventListener("resize", calcTrack);
    return () => window.removeEventListener("resize", calcTrack);
  }, [stages]);

  // percent [0‒1]
  const percent = stages.length > 1 ? currentStep / (stages.length - 1) : 0;
  const windowWidth = useWindowWidth();

  return (
    <div className={clsx("w-full px-4 py-7", className)}>
      <div className="relative" ref={containerRef}>
        {/* 1. Track (only between first & last node) */}
        <div
          className="absolute top-1/2 h-1 bg-gray-200 rounded-full"
          style={{
            left: trackStyle.left,
            width: trackStyle.width,
          }}
        />

        {/* 2. Fill */}
        <motion.div
          className="absolute top-1/2 h-1 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
          style={{ left: trackStyle.left }}
          initial={{ width: 0 }}
          animate={{ width: trackStyle.width * percent }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />

        {/* 3. Nodes */}
        <div className="flex justify-between">
          {stages.map(([label, Icon], idx) => {
            // completed when idx <= currentStep
            const completed = idx <= currentStep;
            // active only if it's the currentStep and not the last step
            const active =
              idx === currentStep && currentStep < stages.length - 1;

            return (
              <div
                key={idx}
                className="relative flex-1 flex justify-center"
                ref={(el) => (itemRefs.current[idx] = el)}
              >
                <motion.div
                  className={clsx(
                    "z-10 flex items-center justify-center rounded-full border-2",
                    completed
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  )}
                  style={{ width: 23, height: 23 }}
                  animate={active ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: active ? Infinity : 0,
                  }}
                >
                  {completed ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className={clsx(
                        "font-medium text-sm",
                        active ? "text-green-500" : "text-gray-500"
                      )}
                    >
                      {idx + 1}
                    </span>
                  )}
                </motion.div>

                {/* Label */}
                <div className="absolute top-full mt-2 w-24 text-center text-xs font-medium">
                  <span
                    className={completed ? "text-gray-900" : "text-gray-800"}
                  >
                    {windowWidth >= 750 && label}
                  </span>
                </div>

                <div className="absolute left-1/2 mt-2  -translate-x-1/2 top-full">
                  {windowWidth < 750 && (
                    <Tooltip title={label} trigger={"hover"}>
                      <Icon
                        strokeWidth={1.3}
                        size={windowWidth < 450 ? 17 : 20}
                        className="flex items-center justify-center"
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
