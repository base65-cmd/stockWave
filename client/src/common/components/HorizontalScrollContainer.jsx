import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { animate } from "framer-motion";

const HorizontalScrollContainer = forwardRef(
  ({ children, className = "", activeIndex = null }, externalRef) => {
    const scrollRef = useRef(null);
    const childrenRefs = useRef([]);

    // Expose scrollRef to parent via externalRef
    useImperativeHandle(externalRef, () => ({
      scrollToStart: () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        }
      },
      scrollToIndex: (index) => {
        const el = scrollRef.current;
        const target = childrenRefs.current[index];
        if (el && target) {
          const offset = target.offsetLeft - el.offsetLeft;
          animate(el.scrollLeft, offset, {
            duration: 0.5,
            onUpdate: (v) => (el.scrollLeft = v),
          });
        }
      },
      scrollEl: scrollRef.current, // for direct access if needed
    }));

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const mouseDown = (e) => {
        isDown = true;
        el.classList.add("cursor-grabbing");
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      };

      const mouseUp = () => {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      };

      const mouseLeave = () => {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      };

      const mouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
      };

      el.addEventListener("mousedown", mouseDown);
      el.addEventListener("mouseup", mouseUp);
      el.addEventListener("mouseleave", mouseLeave);
      el.addEventListener("mousemove", mouseMove);

      return () => {
        el.removeEventListener("mousedown", mouseDown);
        el.removeEventListener("mouseup", mouseUp);
        el.removeEventListener("mouseleave", mouseLeave);
        el.removeEventListener("mousemove", mouseMove);
      };
    }, []);

    useEffect(() => {
      if (activeIndex === null || !childrenRefs.current[activeIndex]) return;

      const el = scrollRef.current;
      const target = childrenRefs.current[activeIndex];

      if (el && target) {
        const targetOffset = target.offsetLeft - el.offsetLeft;
        animate(el.scrollLeft, targetOffset, {
          duration: 0.5,
          onUpdate: (v) => (el.scrollLeft = v),
        });
      }
    }, [activeIndex]);

    return (
      <div className="overflow-hidden max-w-full">
        <div
          ref={scrollRef}
          className={`grid grid-flow-col auto-cols-max space-x-4 select-none cursor-grab scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-white pb-2 ${className}`}
        >
          {React.Children.map(children, (child, index) =>
            React.cloneElement(child, {
              ref: (el) => (childrenRefs.current[index] = el),
            })
          )}
        </div>
      </div>
    );
  }
);

export default HorizontalScrollContainer;
