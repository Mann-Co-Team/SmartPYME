// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, TrendingUp, Shield, Zap, Users, BarChart3, Smartphone, Globe } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import LanguageCurrencySwitcher from '../components/LanguageCurrencySwitcher';

export default function Home() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: t('landing.features.onlineStore'),
      description: t('landing.features.onlineStoreDesc')
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('landing.features.smartManagement'),
      description: t('landing.features.smartManagementDesc')
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('landing.features.securePayments'),
      description: t('landing.features.securePaymentsDesc')
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('landing.features.fastEfficient'),
      description: t('landing.features.fastEfficientDesc')
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('landing.features.multiUser'),
      description: t('landing.features.multiUserDesc')
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: t('landing.features.realtimeReports'),
      description: t('landing.features.realtimeReportsDesc')
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: t('landing.features.responsiveDesign'),
      description: t('landing.features.responsiveDesignDesc')
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('landing.features.multiTenant'),
      description: t('landing.features.multiTenantDesc')
    }
  ];

  const plans = [
    {
      name: t('landing.pricing.basic.name'),
      price: t('landing.pricing.basic.price'),
      description: t('landing.pricing.basic.description'),
      features: [
        t('landing.pricing.basic.feature1'),
        t('landing.pricing.basic.feature2'),
        t('landing.pricing.basic.feature3'),
        t('landing.pricing.basic.feature4'),
        t('landing.pricing.basic.feature5')
      ],
      color: "from-blue-500 to-blue-600",
      buttonColor: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: t('landing.pricing.professional.name'),
      price: t('landing.pricing.professional.price'),
      description: t('landing.pricing.professional.description'),
      features: [
        t('landing.pricing.professional.feature1'),
        t('landing.pricing.professional.feature2'),
        t('landing.pricing.professional.feature3'),
        t('landing.pricing.professional.feature4'),
        t('landing.pricing.professional.feature5'),
        t('landing.pricing.professional.feature6')
      ],
      color: "from-purple-500 to-purple-600",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      featured: true
    },
    {
      name: t('landing.pricing.enterprise.name'),
      price: t('landing.pricing.enterprise.price'),
      description: t('landing.pricing.enterprise.description'),
      features: [
        t('landing.pricing.enterprise.feature1'),
        t('landing.pricing.enterprise.feature2'),
        t('landing.pricing.enterprise.feature3'),
        t('landing.pricing.enterprise.feature4'),
        t('landing.pricing.enterprise.feature5'),
        t('landing.pricing.enterprise.feature6'),
        t('landing.pricing.enterprise.feature7')
      ],
      color: "from-amber-500 to-amber-600",
      buttonColor: "bg-amber-500 hover:bg-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                SmartPYME
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageCurrencySwitcher />
              <DarkModeToggle />
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('landing.nav.login')}
              </Link>
              <Link to="/admin/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                {t('landing.nav.adminPanel')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t('landing.hero.title1')}
              <br />
              {t('landing.hero.title2')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                {t('landing.hero.startFree')}
              </Link>
              <a href="#features" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all">
                {t('landing.hero.viewFeatures')}
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${plan.featured ? 'ring-2 ring-purple-500 dark:ring-purple-400 scale-105' : ''
                  }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                    {t('landing.pricing.popular')}
                  </div>
                )}

                <div className="p-8">
                  <div className={`inline-block px-4 py-2 bg-gradient-to-r ${plan.color} rounded-xl mb-4`}>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 px-6 ${plan.buttonColor} text-white rounded-xl font-semibold transition-all transform hover:scale-105`}>
                    {t('landing.pricing.selectPlan')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('landing.cta.subtitle')}
          </p>
          <Link to="/login" className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl">
            {t('landing.cta.createStore')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">SmartPYME</span>
              </div>
              <p className="text-gray-400">
                {t('landing.footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.successStories')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.aboutUs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.cookies')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartPYME. {t('landing.footer.copyright')}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
