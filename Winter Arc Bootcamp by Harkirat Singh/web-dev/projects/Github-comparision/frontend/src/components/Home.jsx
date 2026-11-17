import { motion } from "motion/react";
import { GiArtificialHive } from "react-icons/gi";

import SearchForm from "./SearchForm.jsx";

const Home = () => {
  return (
    <div className="bg-white text-[#0A0A0A] font-sans min-h-screen overflow-x-hidden">
      {/* navbar */}

      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-5 bg-white/70 backdrop-blur-xl border-b border-black/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0A0A0A] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <GiArtificialHive size={15} color="white" />
          </div>

          <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
            GitCompare
          </span>
        </div>

        {/* <motion.button
          onClick={() => setShowLogin(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#0A0A0A]/80 backdrop-blur-2xl text-white font-semibold border border-white/10 rounded-md px-3 py-1.5 text-xs cursor-pointer transition-all hover:border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center gap-2"
        >
          Log In <FaArrowRight />
        </motion.button> */}
      </motion.nav>

      {/* main content */}
      <div className="mx-60 mt-20">
        <SearchForm />
      </div>
    </div>
  );
};

export default Home;
