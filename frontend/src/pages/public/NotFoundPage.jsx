import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Star component for background
const StarField = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(100)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          width: Math.random() * 3 + 1 + "px",
          height: Math.random() * 3 + 1 + "px",
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          opacity: Math.random() * 0.5 + 0.2,
          animation: `twinkle ${Math.random() * 5 + 2}s infinite`,
        }}
      />
    ))}
  </div>
);

// Floating astronaut component
const Astronaut = () => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    }}
    className="absolute w-24 h-24 bottom-10 right-10 md:w-32 md:h-32"
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="30" fill="#e2e8f0" />
      <circle cx="50" cy="40" r="15" fill="#1e293b" />
      <rect x="35" y="55" width="30" height="20" fill="#e2e8f0" />
      <path
        d="M45 35 A10 10 0 0 1 55 35"
        stroke="#1e293b"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  </motion.div>
);

// Spinning planet component
const Planet = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    className="absolute w-32 h-32 top-20 left-10 md:w-48 md:h-48"
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="#4b0082" />
      <circle cx="40" cy="30" r="10" fill="#6b7280" />
      <circle cx="60" cy="60" r="8" fill="#6b7280" />
      <path d="M20 50 H80" stroke="#6b7280" strokeWidth="2" />
    </svg>
  </motion.div>
);

// Rocket animation for distress signal
const RocketAnimation = () => (
  <motion.div
    initial={{ x: "-100%", y: "50%" }}
    animate={{ x: "100%", y: "-50%" }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="absolute w-16 h-16"
  >
    <Rocket className="w-full h-full text-indigo-400" />
  </motion.div>
);

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [showRocket, setShowRocket] = useState(false);

  const handleDistressSignal = () => {
    setShowRocket(true);
    setTimeout(() => setShowRocket(false), 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-gradient-to-b from-gray-900 to-gray-800">
      <Helmet>
        <title>Not Found | FixItHub</title>
      </Helmet>
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
        `}
      </style>

      {/* Starry Background */}
      <StarField />

      {/* Planet */}
      <Planet />

      {/* Astronaut */}
      <Astronaut />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center"
      >
        <motion.h1
          animate={{ animation: "glitch 0.3s infinite" }}
          className="mb-4 font-bold text-indigo-400 text-8xl md:text-9xl"
        >
          404
        </motion.h1>
        <h2 className="mb-4 text-2xl font-semibold md:text-4xl">
          Oops! You’ve Drifted into a Black Hole!
        </h2>
        <p className="max-w-md mb-8 text-lg text-gray-300 md:text-xl">
          This page is light-years away. Maybe it’s hiding behind a supernova or
          got sucked into a wormhole. Try heading back to base!
        </p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-3 p-4 border border-gray-700 bg-gray-800/50 backdrop-blur-sm rounded-xl">
            <Alien className="w-12 h-12 text-green-400 animate-pulse" />
            <p className="text-lg italic">
              &quot;I swear I didn&apos;t eat this page! Maybe try another
              galaxy?&quot;
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => navigate("/")}
            className="px-6 py-3 font-semibold text-white transition-transform transform bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105"
          >
            Return to Home
          </Button>
          <Button
            onClick={handleDistressSignal}
            variant="outline"
            className="px-6 py-3 font-semibold text-indigo-400 border-indigo-400 rounded-full hover:bg-indigo-400 hover:text-gray-900"
          >
            Send Distress Signal
          </Button>
        </div>
        <AnimatePresence>{showRocket && <RocketAnimation />}</AnimatePresence>
      </motion.div>

      {/* Warning Icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 2 },
        }}
        className="absolute text-yellow-400 top-10 right-10"
      >
        <AlertTriangle className="w-12 h-12" />
      </motion.div>
    </div>
  );
}

export const Alien = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 0 0-10 10c0 5.5 5 10 10 10s10-4.5 10-10a10 10 0 0 0-10-10z" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <circle cx="15.5" cy="9.5" r="1.5" />
    <path d="M8 15a4 4 0 0 0 8 0" />
  </svg>
);
