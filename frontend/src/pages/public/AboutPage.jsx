import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Users, Target, History, Phone } from "lucide-react";

// Import images
import aboutUs from "../../img/about-page/about-us.png";
import tools from "../../img/about-page/tools.jpg";
import team from "../../img/about-page/team.jpeg";
import worker from "../../img/about-page/worker.png";
import vision from "../../img/about-page/vision.jpeg";
import { useNavigate } from "react-router";
import { Progress } from "@/components/ui/progress";

export default function AboutPage() {
  const [experience, setExperience] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const counterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      let count = 0;
      const interval = setInterval(() => {
        if (count < 25) count++ && setExperience(count);
        else clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const sections = [
    {
      icon: <Target className="w-12 h-full text-indigo-400" />,
      title: "Our Vision",
      text: "We are committed to making repair accessible, affordable, and a seamless part of everyday life.",
    },
    {
      icon: <Users className="w-12 h-full text-indigo-400" />,
      title: "Our Mission",
      text: "Trust us to repair, restore, and renew because every item deserves a second chance.",
    },
    {
      icon: <History className="w-12 h-full text-indigo-400" />,
      title: "Our History",
      text: "As we look to the future, we remain committed to innovation, sustainability, and delivering the exceptional service our customers have come to expect.",
    },
  ];

  const statistics = [
    { title: "Expert Technicians", percentage: 94 },
    { title: "Fast Service", percentage: 98 },
    { title: "Quality Work", percentage: 95 },
    { title: "Fair Pricing", percentage: 93 },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <img
          src={aboutUs}
          alt="About Us"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white md:text-5xl"
          >
            About FixItHub
          </motion.h1>
        </div>
      </motion.div>

      {/* Experience Section */}
      <section className="max-w-6xl px-6 py-16 mx-auto overflow-hidden">
        <div className="grid items-center justify-between gap-8 md:grid-cols-2">
          {/* Image Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <img
              src={team}
              alt="Team"
              className="object-cover h-full shadow-lg rounded-xl"
            />
            <div className="mx-auto space-y-4">
              <img
                src={tools}
                alt="Tools"
                className="object-cover w-64 shadow-lg rounded-xl"
              />
              <div
                ref={counterRef}
                className="w-64 p-6 text-center bg-indigo-600 shadow-lg rounded-xl text-gray-50"
              >
                <h2 className="text-5xl font-bold">{experience}+</h2>
                <p className="mt-2 text-xl">Years of Experience</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            ref={sectionRef}
            className="h-full space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-col h-full p-8 bg-white shadow-lg justify-evenly rounded-xl dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-indigo-600">Our Story</h2>
              <p className="mt-4 text-2xl font-semibold text-gray-600 dark:text-gray-300">
                Buy, Sell, Or Repair used products effortlessly with FixItHub.
                Join our Sustainable Platform Today!
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Quality-first approach",
                  "Sustainable practices",
                  "Customer-centric service",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span className="dark:text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 mt-6 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700"
                onClick={() => navigate("services")}
              >
                Explore Services <ArrowRight className="inline w-4 h-4 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="grid md:grid-cols-[3fr_1fr] items-center max-w-6xl gap-8 px-6 mx-auto">
          <div className="space-y-8">
            {sections.map((item, i) => (
              <motion.div
                key={i}
                className="p-6 bg-gray-50 rounded-xl dark:bg-gray-700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
              >
                <div className="flex gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-gray-600">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="relative overflow-hidden rounded-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <img src={vision} alt="Our Vision" className="object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end p-6 bg-gradient-to-t from-black/60">
              <h3 className="text-xl font-bold text-center text-white">
                Our plan makes you feel more comfortable in FixItHub.
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-6 py-2 mt-4 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                onClick={() => navigate("/contact")}
              >
                <Phone className="w-5 h-5" /> Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-600 dark:bg-gray-800">
        <div className="grid max-w-6xl gap-8 px-6 mx-auto md:grid-cols-2">
          <div className="flex justify-center">
            <img
              src={worker}
              alt="Expert"
              className="object-cover rounded-xl h-96"
            />
          </div>

          <div className="space-y-8 text-gray-50">
            <h2 className="text-3xl font-bold">Why Choose Us</h2>
            <p className="text-gray-200 dark:text-gray-300">
              Excellence in every repair, commitment in every service
            </p>

            <div className="space-y-6">
              {statistics.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{item.title}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
