import { Menu } from "@headlessui/react";
import { motion } from "framer-motion";

const ThreeDotsMenu = () => {
  return (
    <Menu.Button className="p-2 rounded-full hover:bg-[#252627] transition">
      <motion.div
        className="flex space-x-1"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            variants={{
              hover: {
                y: [-3, 0], // Moves up then returns
                transition: { duration: 0.4, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 },
              },
              rest: { y: 0, transition: { duration: 0.3 } }, // Returns smoothly to the original position
            }}
          />
        ))}
      </motion.div>
    </Menu.Button>
  );
};

export default ThreeDotsMenu;
