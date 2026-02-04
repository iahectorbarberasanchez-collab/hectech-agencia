import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-[#020202] pt-24 pb-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white">
                        <Image
                            src="/logo.png"
                            alt="HecTechAi Logo"
                            width={32}
                            height={32}
                            className="object-contain transition-all opacity-80 hover:opacity-100"
                            style={{ mixBlendMode: 'screen' }}
                        />
                        <div className="hidden md:flex items-center gap-2 font-display">
                            <span>Hec<span className="text-[#00FF94]">TechAi</span></span>
                        </div>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-400">
                        <Link href="/#servicios" className="hover:text-white transition-colors">Servicios</Link>
                        <Link href="/#sobre-nosotros" className="hover:text-white transition-colors">Sobre nosotros</Link>
                        <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Aviso Legal</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                        <Link href="/dashboard" className="text-[#00FF94] font-bold hover:brightness-125 transition-all">Acceso Clientes</Link>
                    </div>

                    <div className="flex gap-4 text-white">
                        <a
                            href="https://instagram.com/hectechai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00FF94] hover:text-black transition-all cursor-pointer"
                            title="Instagram"
                        >
                            <Instagram size={18} />
                        </a>
                        <a
                            href="mailto:hectechia@gmail.com"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00FF94] hover:text-black transition-all cursor-pointer"
                            title="Email"
                        >
                            <Mail size={18} />
                        </a>
                    </div>
                </div>

                <div className="text-center text-gray-600 text-xs mt-12">
                    © {new Date().getFullYear()} HecTechAi Automation Agency. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};
