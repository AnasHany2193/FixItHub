import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  User,
  Headphones,
  Wallet,
  Clock,
  ArrowRight,
} from "lucide-react";

// Import your images
import buy from "../../img/home-page/buy.jpg";
import hand from "../../img/home-page/hand.jpg";
import sell from "../../img/home-page/sell.jpg";
import repair from "../../img/home-page/repair.jpg";
import man from "../../img/home-page/man-bg-non.png";
import maintenance from "../../img/home-page/maintenance.jpg";
import qualityService from "../../img/home-page/qualityService.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const HomePage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "50k+", description: "Satisfied Customers" },
    { value: "30k+", description: "Items Sold" },
    { value: "4.8", description: "Reviews" },
  ];

  const services = [
    {
      img: repair,
      title: "Repair",
      description: "Expert repairs",
    },
    {
      img: sell,
      title: "Sell",
      description: "Professional selling",
    },
    {
      img: buy,
      title: "Buy",
      description: "Quality buying",
    },
    {
      img: maintenance,
      title: "Maintenance",
      description: "Equipment upkeep",
    },
  ];

  const features = [
    {
      icon: <User className="w-12 h-12 text-indigo-600" />,
      title: "Experienced Technicians",
      description: "Skilled professionals",
    },
    {
      icon: <Wallet className="w-12 h-12 text-indigo-600" />,
      title: "Affordable Pricing",
      description: "Fair pricing",
    },
    {
      icon: <Clock className="w-12 h-12 text-indigo-600" />,
      title: "On Time Guarantee",
      description: "Timely service",
    },
    {
      icon: <Headphones className="w-12 h-12 text-indigo-600" />,
      title: "24/7 Support",
      description: "Always available",
    },
  ];

  const testimonials = [
    {
      name: "Ahmed Mohamed",
      avatar: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg",
      feedback:
        "FixItHub made fixing my laptop a breeze! The worker was professional, and the process was so smooth. Highly recommend! 😊",
      role: "Customer",
      context: "Electronics Repair",
    },
    {
      name: "Fatima Hassan",
      avatar: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg",
      feedback:
        "I bought tools from the marketplace and got them delivered fast. Affordable and reliable service! 🌟",
      role: "Customer",
      context: "Marketplace Purchase",
    },
    {
      name: "Anas Hany",
      avatar:
        "http://localhost:5000/uploads/713d2b3b-09ca-4bfa-aadb-51f1494a069f.jpg",
      feedback:
        "The repair request form was easy to use, and the worker fixed my AC in no time. FixItHub is a lifesaver! 🔧",
      role: "Customer",
      context: "Home Appliance Repair",
    },
  ];

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 font-JosefinSans">
      {/* Hero Section */}
      <motion.header
        className="grid items-center grid-cols-1 gap-8 px-6 py-10 md:grid-cols-2 md:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-left">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-indigo-600 md:text-5xl dark:text-indigo-400">
            Revive, Repair, Reuse - FixItHub
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Buy, Sell, Or Repair used products effortlessly with FixItHub.
            <br />
            Join our Sustainable Platform Today!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 mt-6 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => navigate("/signup")}
          >
            Join Now <ArrowRight className="inline w-5 h-5 ml-2" />
          </motion.button>
        </div>

        <motion.div
          className="relative flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={man}
            alt="Handyman"
            className="w-full max-w-[400px] rounded-lg transition-opacity duration-1000"
          />
        </motion.div>
      </motion.header>

      {/* Stats Section */}
      <section className="flex justify-center bg-white dark:bg-gray-800">
        <div className="-mt-12 w-[90%] bg-indigo-600 dark:bg-gray-800 text-white rounded-2xl shadow-xl grid grid-cols-3 py-8 px-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 border-r last:border-0 border-indigo-400/30"
            >
              <h3 className="mb-2 text-5xl font-bold">{stat.value}</h3>
              <p className="text-3xl text-center">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="grid items-center grid-cols-1 px-6 py-16 bg-white md:grid-cols-2 md:px-12 dark:bg-gray-800">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src={hand}
            alt="Hand"
            className="w-full max-w-[400px] rounded-3xl shadow-xl"
          />
        </motion.div>

        <div className="text-left">
          <h2 className="mb-4 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Who we are
          </h2>
          <h1 className="mb-6 text-3xl font-bold md:text-4xl">
            Reliable Repairs, Reuse
            <br />
            Trusted Services
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            At FixItHub, we provide expert repair solutions with a focus on
            quality and reliability.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => navigate("/how-it-works")}
          >
            Learn More
          </motion.button>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Our Services
          </h2>
          <h1 className="mb-12 text-3xl font-bold md:text-4xl">
            Explore Our Comprehensive Solutions
          </h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                className="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-xl"
                whileHover={{ y: -5 }}
              >
                <img
                  src={service.img}
                  alt={service.title}
                  className="object-cover w-full h-48 mb-4 rounded-lg"
                />
                <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800 md:px-12">
        <div className="grid items-center max-w-6xl gap-12 mx-auto md:grid-cols-2">
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <img
              src={qualityService}
              alt="Team"
              className="shadow-xl rounded-xl"
            />
          </motion.div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              Why Choose Us
            </h2>
            <h1 className="mb-8 text-3xl font-bold">
              Quality Service Guaranteed
            </h1>
            <div className="space-y-8">
              {features.map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="p-3 bg-indigo-100 rounded-lg dark:bg-gray-700">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Testimonials
          </h2>
          <h1 className="mb-12 text-3xl font-bold">What Our Clients Say</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="flex flex-col justify-between p-6 bg-white border shadow-lg dark:bg-gray-800 rounded-xl border-indigo-100/50 dark:border-gray-700"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ThumbsUp className="w-10 h-10 mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
                <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
                  {testimonial.feedback}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-12 h-12 border-2 border-indigo-600 dark:border-indigo-400">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
                      {testimonial.name.split(" ")[0][0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {testimonial.name}
                    </span>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      {testimonial.role} • {testimonial.context}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
