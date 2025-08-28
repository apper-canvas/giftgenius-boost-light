import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SocialConnectModal from "@/components/molecules/SocialConnectModal";
import { motion } from "framer-motion";
const Layout = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = React.useState(false);
  const location = useLocation();

const navigation = [
    { name: "Home", href: "/", icon: "Home" },
    { name: "Recipients", href: "/recipients", icon: "Users" },
    { name: "Reminders", href: "/reminders", icon: "Bell" },
    { name: "Saved", href: "/saved", icon: "Bookmark" },
    { name: "Price Alerts", href: "/price-alerts", icon: "TrendingDown" },
    { name: "Group Gifts", href: "/group-gifts", icon: "Users2" },
    { name: "Social", href: "/social", icon: "Share2" },
    { name: "Virtual Wrapping", href: "/virtual-wrapping", icon: "Gift" },
    { name: "Trends", href: "/trends", icon: "TrendingUp" },
    { name: "Stores", href: "/stores", icon: "Store" },
    { name: "Profile", href: "/profile", icon: "UserCircle" }
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface px-6 pb-4 shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="Gift" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold gradient-text">
                GiftGenius
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
{navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 shadow-sm"
                              : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                          )}
                        >
                          <ApperIcon
                            name={item.icon}
                            className={cn(
                              "h-6 w-6 shrink-0 transition-colors duration-200",
                              isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-600"
                            )}
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
{/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200 space-y-3">
            <Button
              variant="accent"
              size="sm"
              icon="Link"
              className="w-full text-xs"
              onClick={() => setIsSocialModalOpen(true)}
            >
              Connect Social Media
            </Button>
            <div className="text-xs text-center text-gray-500">
              AI-Powered Gift Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <ApperIcon name="Menu" className="h-6 w-6" />
          </button>
          
          {/* Mobile Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Gift" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-display font-bold gradient-text">
              GiftGenius
            </h1>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-surface px-6 pb-4 shadow-xl lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Gift" className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-display font-bold gradient-text">
                  GiftGenius
                </h1>
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={closeMobileMenu}
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-5">
<ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 shadow-sm"
                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        )}
                      >
                        <ApperIcon
                          name={item.icon}
                          className={cn(
                            "h-6 w-6 shrink-0 transition-colors duration-200",
                            isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-600"
                          )}
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
{/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Social Connect Modal */}
      <SocialConnectModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />
    </div>
  );
};

export default Layout;