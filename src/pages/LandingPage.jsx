import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  LayoutDashboard, 
  ChevronRight, 
  Star,
  CheckCircle2,
  Stethoscope,
  Users,
  Settings,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="layout-container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 relative z-50">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Medi<span className="text-blue-600">Help</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-primary py-2 px-5 text-sm h-10 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
              Get Started
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2 relative z-50">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 md:hidden shadow-xl"
            >
              <div className="flex flex-col gap-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 text-center font-semibold text-slate-600 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-800 rounded-xl"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary py-4 text-center rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-5%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-[100px] opacity-60"></div>
        </div>
        
        <div className="layout-container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-8"
            >
              <Star className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-500" />
              <span>Smart Healthcare Solutions</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]"
            >
              Smart Healthcare <br className="hidden sm:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Unified Ecosystem
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              The most efficient way to manage clinical appointments across patients, doctors, and healthcare administrators.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
            >
              <Link 
                to="/signup" 
                className="btn-primary w-full sm:w-auto px-10 py-5 text-lg shadow-2xl shadow-blue-200 dark:shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Now <ChevronRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary w-full sm:w-auto px-10 py-5 text-lg bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
              >
                Patient Login
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors relative overflow-hidden">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        {/* Large Background Motif Icon */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Stethoscope className="w-[500px] h-[500px] text-blue-600" strokeWidth={0.5} />
        </div>

        {/* Floating Medical Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-32 h-32 bg-blue-400 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ y: [0, 30, 0], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 right-[15%] w-48 h-48 bg-indigo-400 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ x: [0, 15, 0], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-[30%] w-24 h-24 bg-cyan-400 rounded-full blur-[60px]"
          />
        </div>

        <div className="layout-container px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Enterprise Ecosystem</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Dedicated Portals
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
              Experience zero-friction healthcare management with specialized dashboards engineered <br className="hidden md:block" />
              for every unique role in the medical ecosystem. Efficiency, redefined.
            </p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Patient Card */}
            <motion.div variants={fadeInUp} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Patient Access</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Book top specialists in seconds</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>View clinical history & records</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Manage family profiles easily</span>
                </li>
              </ul>
            </motion.div>

            {/* Doctor Card */}
            <motion.div variants={fadeInUp} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Clinician OS</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Optimize clinical shift schedules</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Instant appointment verification</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Track clinical growth metrics</span>
                </li>
              </ul>
            </motion.div>

            {/* Admin Card */}
            <motion.div variants={fadeInUp} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all duration-300">
                <Settings className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Admin Hub</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Complete clinician governance</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <span>System-wide operational audits</span>
                </li>
                <li className="flex items-start gap-3 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Real-time health reporting</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="layout-container px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Care Protocol</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">Frictionless integration between every stage of the medical process.</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-20">
              <motion.div {...fadeInUp} className="relative z-10 text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 ring-8 ring-white dark:ring-slate-950 transition-transform hover:scale-110 duration-300">
                  <span className="text-2xl font-black">01</span>
                </div>
                <h4 className="text-xl font-bold mb-3 dark:text-white">Book</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">Search specialized clinicians and secure time slots instantly.</p>
              </motion.div>
              
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="relative z-10 text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 ring-8 ring-white dark:ring-slate-950 transition-transform hover:scale-110 duration-300">
                  <span className="text-2xl font-black">02</span>
                </div>
                <h4 className="text-xl font-bold mb-3 dark:text-white">Verify</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">Doctors authorize clinical Shift and Manage requests in real-time.</p>
              </motion.div>
              
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="relative z-10 text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 ring-8 ring-white dark:ring-slate-950 transition-transform hover:scale-110 duration-300">
                  <span className="text-2xl font-black">03</span>
                </div>
                <h4 className="text-xl font-bold mb-3 dark:text-white">Health</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">Experience seamless care delivery with optimized hospital node monitoring.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-blue-600 dark:bg-blue-700 text-white transition-colors overflow-hidden relative">
        <div className="layout-container px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Built for Next-Gen <br className="hidden sm:block" /> Healthcare Performance</h2>
              <p className="text-blue-100 mb-10 text-xl leading-relaxed font-medium">
                MediHelp removes the friction of healthcare scheduling, empowering 
                clinical nodes and patient-doctor connectivity.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Scale Logic</h5>
                    <p className="text-sm text-blue-100">Save hours weekly on admin operations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Core Security</h5>
                    <p className="text-sm text-blue-100">Enterprise patient data protection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Unified UI</h5>
                    <p className="text-sm text-blue-100">Custom hubs for every healthcare role.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Cloud Sync</h5>
                    <p className="text-sm text-blue-100">Real-time collaboration across nodes.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-[40px] border border-white/20 shadow-3xl">
                <div className="bg-white dark:bg-slate-900 rounded-[30px] p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                           <User className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                        </div>
                        <div>
                           <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-full mb-3"></div>
                           <div className="h-2 w-48 bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
                        </div>
                     </div>
                     <div className="w-24 h-10 bg-blue-600 rounded-xl"></div>
                  </div>
                  <div className="space-y-6">
                     <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
                     <div className="h-3 w-5/6 bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
                     <div className="h-40 w-full bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-center">
                        <Calendar className="text-blue-200 dark:text-blue-800 w-16 h-16 opacity-40 capitalize" />
                     </div>
                  </div>
                </div>
              </div>
              {/* Decorative Glows */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400 rounded-full blur-[80px] opacity-40 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-indigo-500 rounded-full blur-[100px] opacity-30 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-40 relative">
        <div className="layout-container px-6">
          <div className="relative rounded-[50px] overflow-hidden p-10 sm:p-24 text-center border border-blue-100 dark:border-slate-800 shadow-2xl transition-colors bg-blue-50 dark:bg-slate-950">
             {/* Background Decorative Elements */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>
             
             {/* Floating Icons for Density */}
             <div className="hidden lg:block absolute top-10 left-10 opacity-20 dark:opacity-10 animate-bounce transition-all">
                <Stethoscope className="w-12 h-12 text-blue-600 dark:text-white" />
             </div>
             <div className="hidden lg:block absolute bottom-10 right-20 opacity-20 dark:opacity-10 animate-pulse transition-all" style={{ animationDelay: '1s' }}>
                <Calendar className="w-16 h-16 text-indigo-600 dark:text-white" />
             </div>

             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold mb-8 relative z-10"
             >
                <Users className="w-3 h-3" />
                <span>Join 5,000+ trusted clinicians</span>
             </motion.div>
             
             <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.9] relative z-10"
             >
               Start Managing <br className="hidden sm:block" /> Healthcare Better
             </motion.h2>
             <p className="text-slate-600 dark:text-slate-300 text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
               Join thousands of medical practitioners already using the MediHelp Network to optimize patient care and clinical delivery cycles.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <Link 
                  to="/signup" 
                  className="btn-primary w-full sm:w-auto px-12 py-6 text-xl rounded-2xl transform hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20"
                >
                  Join the Network
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 border-t border-slate-100 dark:border-slate-800 transition-colors dark:bg-slate-950">
        <div className="layout-container px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/30">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                  Medi<span className="text-blue-600 tracking-normal not-italic">Help</span>
                </span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg leading-relaxed font-medium">
                Cloud infrastructure for next-generation clinical management and high-performance hospital automation.
              </p>
            </div>
            
            <div>
              <h6 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-8">Protocols</h6>
              <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Client Directory</Link></li>
                <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Clinician Access</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Admin Governance</Link></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-8">Ecosystem</h6>
              <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Network Terms</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Safety Standard</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status Map</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:row items-center justify-between pt-12 border-t border-slate-50 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400">
            <p>© {new Date().getFullYear()} MediHelp Systems Lab. All Rights Reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
               <a href="#" className="hover:text-blue-600 transition-colors">Twitter (X)</a>
               <a href="#" className="hover:text-blue-600 transition-colors">LinkedIn Node</a>
               <a href="#" className="hover:text-blue-600 transition-colors">Github Lab</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
