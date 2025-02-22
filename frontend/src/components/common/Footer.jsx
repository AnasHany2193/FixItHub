import { Link } from "react-router-dom";
import { Info, HelpCircle, Shield, User } from "lucide-react";

const FooterLink = ({ to, children, icon }) => {
  return (
    <li className="flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      <Link
        to={to}
        className="text-sm text-gray-500 transition-colors link-underline hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              Company
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/about" icon={<Info size={16} />}>
                About Us
              </FooterLink>
              <FooterLink to="/careers" icon={<User size={16} />}>
                Careers
              </FooterLink>
              <FooterLink to="/blog" icon={<HelpCircle size={16} />}>
                Blog
              </FooterLink>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              Support
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/help" icon={<HelpCircle size={16} />}>
                Help Center
              </FooterLink>
              <FooterLink to="/contact" icon={<User size={16} />}>
                Contact Us
              </FooterLink>
              <FooterLink to="/faq" icon={<HelpCircle size={16} />}>
                FAQs
              </FooterLink>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              Legal
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/privacy" icon={<Shield size={16} />}>
                Privacy
              </FooterLink>
              <FooterLink to="/terms" icon={<Shield size={16} />}>
                Terms
              </FooterLink>
              <FooterLink to="/security" icon={<Shield size={16} />}>
                Security
              </FooterLink>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              Connect
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/twitter" icon={<User size={16} />}>
                Twitter
              </FooterLink>
              <FooterLink to="/facebook" icon={<User size={16} />}>
                Facebook
              </FooterLink>
              <FooterLink to="/linkedin" icon={<User size={16} />}>
                LinkedIn
              </FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-sm text-center text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} FixItHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
