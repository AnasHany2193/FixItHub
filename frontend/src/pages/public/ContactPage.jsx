import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

import contact from "../../img/contact-page/contact.jpg";

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Email",
      content: "fixithub.app@gmail.com",
    },
    {
      icon: <Phone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Phone",
      content: "+20 10 40045159",
    },
    {
      icon: <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Address",
      content: "Saqiyat Abu Sharah, Ashmoun, Menofia Governorate",
    },
  ];

  const socialMedia = [
    {
      icon: <Instagram className="w-6 h-6" />,
      color: "text-pink-600",
    },
    {
      icon: <Facebook className="w-6 h-6" />,
      color: "text-blue-600",
    },
    {
      icon: <Twitter className="w-6 h-6" />,
      color: "text-sky-500",
    },
  ];

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service",
    },
    {
      icon: <ArrowRight className="w-8 h-8" />,
      title: "Fast Response",
      description: "Quick resolution of your queries",
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Direct Contact",
      description: "Immediate access to our team",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Nationwide",
      description: "Services available across the country",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-JosefinSans">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative flex items-center justify-center bg-center bg-cover h-96"
        style={{ backgroundImage: `url(${contact})` }}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/60" />
        <div className="relative z-10 text-center">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-2 text-lg font-light text-indigo-200 md:text-xl"
          >
            Let&apos;s connect
          </motion.p>
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-white md:text-5xl"
          >
            Get in Touch
          </motion.h1>
        </div>
      </motion.section>

      {/* Contact Content */}
      <section className="px-4 py-16 mx-auto max-w-7xl md:px-8">
        <motion.div
          className="grid gap-12 md:grid-cols-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              className="p-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl"
              initial={{ x: -50 }}
              whileInView={{ x: 0 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg dark:bg-gray-700">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  {socialMedia.map((social, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      className={`${social.color} hover:opacity-80`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            className="p-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl"
            initial={{ x: 50 }}
            whileInView={{ x: 0 }}
          >
            <h2 className="mb-8 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Send us a Message
            </h2>

            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-3 bg-transparent border border-gray-200 rounded-lg dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <input
                    type="text"
                    placeholder="Phone"
                    className="w-full p-3 bg-transparent border border-gray-200 rounded-lg dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 bg-transparent border border-gray-200 rounded-lg dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <textarea
                  placeholder="Message"
                  rows="4"
                  className="w-full p-3 bg-transparent border border-gray-200 rounded-lg dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </motion.div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center w-full gap-2 p-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Send className="w-5 h-5" /> Send Message
              </motion.button>
            </form>

            {/* Map */}
            <div className="mt-12">
              <h3 className="mb-4 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                Our Location
              </h3>
              <div className="overflow-hidden border border-gray-200 shadow-lg rounded-xl dark:border-gray-700">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11355.148596063491!2d31.077952191147514!3d30.316382220099513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14586ffb1f471ba1%3A0xf71d280077e19b8e!2sSaqiyat%20Abu%20Sharah%2C%20Shanway%20WA%20Kafr%20Al%20Badranah%2C%20Ashmoun%2C%20Menofia%20Governorate!5e1!3m2!1sen!2seg!4v1744854299740!5m2!1sen!2seg"
                  loading="lazy"
                  className="w-full h-64"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-6 px-4 mx-auto max-w-7xl md:px-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 bg-white shadow-sm dark:bg-gray-800 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
