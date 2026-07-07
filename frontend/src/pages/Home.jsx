import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { getDefaultRoute } from '../App';

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  
  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      navigate(getDefaultRoute(user));
    }
  }, [user, navigate]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeFundacionSlide, setActiveFundacionSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFundacionSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slideTexts = [
    {
      subtitle: "LOGÍSTICA CONTRA EL DESPERDICIO",
      title: "TIEMPO DE DAR",
      desc: "DonApp conecta de forma directa a empresas de alimentos con fundaciones de asistencia social. Facilitamos la transferencia segura de excedentes para combatir el hambre y optimizar recursos alimentarios."
    },
    {
      subtitle: "TRANSPARENCIA Y CONTROL",
      title: "HISTÓRICO Y FACTURA",
      desc: "Cada entrega genera un acta de conformidad digital imprimible. Tanto los donantes como las fundaciones receptoras cuentan con trazabilidad total de los lotes y volúmenes transferidos en tiempo real."
    },
    {
      subtitle: "RED SOLIDARIA DIRECTA",
      title: "SIN INTERMEDIARIOS",
      desc: "Operamos bajo el Escenario A (flujo directo), eliminando bodegas de tránsito centrales. Las donaciones viajan directamente del donante a la fundación asignada, acelerando la entrega de alimentos frescos."
    }
  ];

  const fundacionesList = [
    {
      name: "Banco de Alimentos",
      desc: "Abastecimiento y distribución de raciones nutritivas a familias vulnerables. Canaliza excedentes alimenticios de forma inmediata para comedores comunitarios.",
      tag: "Alimentación Directa",
      color: "border-sky-500/20 text-sky-600 bg-sky-50",
      imagen: "/banco_alimentos.png"
    },
    {
      name: "Hogar del Niño",
      desc: "Brinda refugio seguro, nutrición balanceada y soporte educativo integral para la infancia vulnerable, asegurando su sano desarrollo y aprendizaje.",
      tag: "Infancia y Nutrición",
      color: "border-emerald-500/20 text-emerald-600 bg-emerald-50",
      imagen: "/hogar_nino.png"
    },
    {
      name: "Fundación Esperanza",
      desc: "Lidera programas de desarrollo comunitario, capacitación técnica y soporte educativo para adolescentes, jóvenes y familias en situación de pobreza.",
      tag: "Desarrollo Social",
      color: "border-amber-500/20 text-amber-600 bg-amber-50",
      imagen: "/fundacion_esperanza.png"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-slate-800 font-sans overflow-x-hidden selection:bg-sky-500 selection:text-white scroll-smooth">
      
      {/* ==========================================
         PANEL IZQUIERDO: VECTOR E ILUSTRACIÓN (Fijo en Desktop)
         ========================================== */}
      <div className="hidden lg:flex lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:w-[45%] h-screen bg-gradient-to-b from-[#0e5c9b] to-[#07365c] flex-col justify-between p-16 select-none overflow-hidden text-white z-10">
        
        {/* SVG wave separator on the right edge */}
        <div className="absolute top-0 bottom-0 -right-1 w-24 fill-white text-white pointer-events-none z-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C50,25 50,75 0,100 L100,100 L100,0 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Floating background glowing lights */}
        <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-sky-400/10 blur-3xl pointer-events-none z-10"></div>
        <div className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none z-10"></div>

        {/* Logo DonApp */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Heart size={20} className="text-white fill-white animate-pulse" />
          </div>
          <span className="text-2xl font-black text-white font-display tracking-wide uppercase">
            DonApp
          </span>
        </div>

        {/* Vector Illustration (Cargo Plane & Heart path) */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg viewBox="0 0 600 600" className="w-full max-w-[420px] mx-auto filter drop-shadow-2xl">
            {/* Flight Path dots */}
            <path 
              d="M 80 460 C 130 240, 280 120, 420 280 C 475 350, 360 450, 240 370 C 140 300, 200 150, 480 120" 
              fill="none" 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="3.5" 
              strokeDasharray="8,8" 
            />
            
            {/* Decorative cloud shapes */}
            <path d="M 60 160 C 80 145, 110 145, 130 160 C 145 150, 175 155, 180 170 C 190 190, 170 205, 130 205 C 90 205, 75 195, 60 160 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M 420 440 C 440 425, 470 425, 490 440 C 505 430, 535 435, 540 450 C 550 470, 530 485, 490 485 C 450 485, 435 475, 420 440 Z" fill="rgba(255,255,255,0.04)" />

            {/* Stylized Cargo/Logistic Aircraft */}
            <g transform="translate(290, 240) rotate(-18)">
              {/* Airplane body shadow overlay */}
              <ellipse cx="0" cy="8" rx="130" ry="14" fill="rgba(0,0,0,0.12)" />
              
              {/* Back wing */}
              <path d="M -15 -8 L -45 -85 L -20 -85 L 15 -8 Z" fill="#cbd5e1" />
              
              {/* Front wing */}
              <path d="M -20 8 L -60 105 L -30 105 L 20 8 Z" fill="#ffffff" />
              
              {/* Main Fuselage */}
              <path d="M -115 0 C -115 -14, 80 -14, 115 0 C 115 14, 80 14, -115 0 Z" fill="#f8fafc" />
              
              {/* Nose cone */}
              <path d="M 95 4.5 C 105 4.5, 115 2, 115 0 C 115 -2, 105 -4.5, 95 -4.5 Z" fill="#cbd5e1" />
              
              {/* Windows */}
              <rect x="25" y="-3" width="7" height="3" rx="1.5" fill="#475569" />
              <rect x="40" y="-3" width="7" height="3" rx="1.5" fill="#475569" />
              <rect x="55" y="-3" width="7" height="3" rx="1.5" fill="#475569" />
              <rect x="70" y="-3" width="7" height="3" rx="1.5" fill="#475569" />
              
              {/* Engines */}
              <rect x="-10" y="32" width="20" height="10" rx="2.5" fill="#cbd5e1" />
              <rect x="-38" y="60" width="20" height="10" rx="2.5" fill="#94a3b8" />
              
              {/* Tail fin */}
              <path d="M -85 -8 L -110 -50 L -90 -50 L -70 -8 Z" fill="#cbd5e1" />
            </g>

            {/* Glowing heart representing donation cargo */}
            <g transform="translate(370, 205) scale(0.9)">
              <path 
                d="M 12,5 C 8,1.5 2,1.5 0,6 C -2,1.5 -8,1.5 -12,5 C -17,10 -12,20 0,27 C 12,20 17,10 12,5 Z" 
                fill="#f43f5e" 
                className="animate-pulse" 
              />
            </g>
          </svg>
        </div>

        {/* Footer info izquierdo */}
        <div className="text-white/40 text-xs relative z-10 flex items-center justify-between">
          <span>DonApp Plataforma de Enlace Logístico</span>
          <span>v2.1</span>
        </div>
      </div>

      {/* ==========================================
         PANEL DERECHO: CONTENIDO DESPLAZABLE (55% ancho en Desktop)
         ========================================== */}
      <div className="w-full lg:w-[55%] lg:ml-[45%] flex flex-col min-h-screen text-slate-700">
        
        {/* Cabecera / Navegación - Pegajosa al hacer scroll */}
        <header className="flex justify-between items-center w-full px-8 md:px-16 py-6 bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-50 shadow-sm">
          {/* Logo en Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <Heart size={20} className="text-sky-600 fill-sky-600" />
            <span className="text-xl font-bold text-slate-800 font-display">DonApp</span>
          </div>

          {/* Menú de Navegación */}
          <nav className="hidden sm:flex items-center gap-8 text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            <a href="#inicio" className="hover:text-slate-800 transition-colors pb-1">INICIO</a>
            <a href="#fundaciones" className="hover:text-slate-800 transition-colors pb-1">FUNDACIONES</a>
            <a href="#nosotros" className="hover:text-slate-800 transition-colors pb-1">NOSOTROS</a>
            <a href="#contacto" className="hover:text-slate-800 transition-colors pb-1">CONTACTO</a>
          </nav>

          {/* Botón de Acceso rápido */}
          <Link 
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <LogIn size={13} />
            <span>ACCEDER</span>
          </Link>
        </header>

        {/* Contenedor de Secciones */}
        <div className="flex-1 flex flex-col">
          
          {/* 1. SECCIÓN: INICIO (HERO SLIDES) */}
          <section id="inicio" className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-8 md:px-16 py-12">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>{slideTexts[activeSlide].subtitle}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 font-display tracking-tight leading-[1.05] uppercase">
                {slideTexts[activeSlide].title}
              </h1>

              <p className="text-base text-slate-500 leading-relaxed font-sans">
                {slideTexts[activeSlide].desc}
              </p>

              {/* Botón de Entrada Principal */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Link 
                  to="/login"
                  className="px-8 py-4 bg-[#0e5c9b] hover:bg-[#07365c] text-white font-extrabold text-xs rounded-xl tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-650/15 hover:shadow-sky-650/25 active:scale-[0.98] transition-all"
                >
                  <span>INGRESAR A LA PLATAFORMA</span>
                  <ArrowRight size={14} />
                </Link>
                
                <a 
                  href="#fundaciones"
                  className="px-6 py-4 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 font-bold text-xs rounded-xl tracking-wide flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Conocer más</span>
                </a>
              </div>

              {/* Indicadores de Slide (Dots) */}
              <div className="flex gap-2.5 pt-6">
                {[0, 1, 2].map((idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide ? 'w-8 bg-[#0e5c9b]' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Ver slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 2. SECCIÓN: FUNDACIONES (CON CARRUSEL INLINE) */}
          <section id="fundaciones" className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-8 md:px-16 py-20 border-t border-slate-100 bg-slate-50/50">
            <div className="max-w-xl space-y-6">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest pl-0.5">RED DE APOYO</span>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight uppercase">FUNDACIONES ASOCIADAS</h2>
              <p className="text-sm text-slate-500 leading-relaxed pl-0.5">
                Las donaciones registradas en DonApp se canalizan de forma directa a fundaciones de asistencia social certificadas. Navega por las organizaciones beneficiarias:
              </p>

              {/* Carrusel Interactivo de Fundaciones */}
              <div className="relative bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                
                {/* Contenedor del Slide Activo con Transición de Opacidad (Diseño Vertical para imágenes grandes) */}
                <div className="relative h-[380px] sm:h-[320px] overflow-hidden">
                  {fundacionesList.map((fund, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 p-6 flex flex-col transition-all duration-700 ease-in-out ${
                        idx === activeFundacionSlide 
                          ? 'opacity-100 translate-x-0 z-10' 
                          : 'opacity-0 translate-x-4 z-0 pointer-events-none'
                      }`}
                    >
                      {/* Imagen de la Fundación (Grande en la parte superior) */}
                      <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner shrink-0">
                        <img 
                          src={fund.imagen} 
                          alt={fund.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      
                      {/* Detalles (En la parte inferior) */}
                      <div className="flex flex-col justify-between flex-1 mt-4 gap-2.5">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800 font-display">{fund.name}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${fund.color}`}>
                              {fund.tag}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">{fund.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de Navegación del Carrusel */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
                  {/* Dot selectors */}
                  <div className="flex gap-2">
                    {fundacionesList.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveFundacionSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === activeFundacionSlide ? 'w-6 bg-[#0e5c9b]' : 'w-2 bg-slate-200 hover:bg-slate-350'
                        }`}
                        title={`Fundación ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Flechas de Navegación */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveFundacionSlide((prev) => (prev - 1 + fundacionesList.length) % fundacionesList.length)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 transition-all text-xs font-bold tracking-wider uppercase"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => setActiveFundacionSlide((prev) => (prev + 1) % fundacionesList.length)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 transition-all text-xs font-bold tracking-wider uppercase"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 3. SECCIÓN: NOSOTROS */}
          <section id="nosotros" className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-8 md:px-16 py-20 border-t border-slate-100">
            <div className="max-w-xl space-y-6">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest pl-0.5">SOBRE NOSOTROS</span>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight uppercase">MISIÓN Y VISIÓN</h2>
              <p className="text-sm text-slate-500 leading-relaxed pl-0.5">
                DonApp nació con el propósito de optimizar los recursos excedentes de la industria alimentaria, creando un puente transparente, directo y eficiente hacia las familias vulnerables.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display">Nuestra Misión</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Facilitar y asegurar el traslado de alimentos desde empresas y donantes comprometidos directamente hacia comedores y hogares sociales, combatiendo el desperdicio.
                  </p>
                </div>
                <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display">Nuestra Visión</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Consolidar una red logística nacional transparente, rápida y sin bodegas centrales de almacenamiento (Flujo Directo), multiplicando el volumen de ayuda.
                  </p>
                </div>
              </div>

              {/* Indicadores de Impacto */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center">
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-500/10">
                  <div className="text-3xl font-black text-sky-600 font-display">+10k</div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Raciones</div>
                </div>
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-500/10">
                  <div className="text-3xl font-black text-sky-600 font-display">+3.6k</div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Donaciones</div>
                </div>
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-500/10">
                  <div className="text-3xl font-black text-sky-600 font-display">100%</div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Trazabilidad</div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. SECCIÓN: CONTACTO */}
          <section id="contacto" className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-8 md:px-16 py-20 border-t border-slate-100 bg-slate-50/50">
            <div className="max-w-xl space-y-6">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest pl-0.5">CONTACTO</span>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight uppercase">ÚNETE A LA RED</h2>
              <p className="text-sm text-slate-500 leading-relaxed pl-0.5">
                ¿Eres una empresa productora o distribuidora de alimentos y tienes excedentes? ¿Perteneces a una fundación de asistencia social organizada? Escríbenos para sumarte a la red solidaria de DonApp.
              </p>

              <div className="bg-white border border-slate-150 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-450 uppercase tracking-wider">Correo Electrónico:</span>
                  <span className="text-sm text-slate-700 font-mono font-semibold">a.pilamunga2018@gmail.com</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-450 uppercase tracking-wider">Línea Telefónica:</span>
                  <span className="text-sm text-slate-700 font-mono font-semibold">0959233691</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm font-bold text-slate-450 uppercase tracking-wider">Oficinas Centrales:</span>
                  <span className="text-sm text-slate-700 font-semibold">Ambato, Ecuador</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Derecho */}
        <footer className="w-full text-slate-400 text-[10px] border-t border-slate-100 py-8 px-8 md:px-16 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white z-20">
          <p>© 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
          <div className="flex gap-4">
            <a href="#condiciones" className="hover:text-slate-650 transition-colors">Condiciones</a>
            <a href="#privacidad" className="hover:text-slate-650 transition-colors">Privacidad</a>
          </div>
        </footer>

      </div>

    </div>
  );
}
