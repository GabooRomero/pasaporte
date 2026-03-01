import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, WalletCards, Compass, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const { data: attractions } = await supabase.from('attractions').select('*').order('created_at', { ascending: false });
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center bg-slate-950 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-3xl space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-indigo-500/10 p-5 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-[0_0_30px_-5px_theme(colors.indigo.500/0.3)]">
                    <Compass className="h-12 w-12 text-indigo-400" />
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                    Pasaporte Digital <br />
                    <span className="text-gradient-indigo">Turístico</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6">
                    Una experiencia premium para promover el turismo local mediante identificaciones digitales y coleccionables. Fricción cero, recompensas reales.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
                    <Link href="/claim?lugar=glaciar" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full h-14 px-8 text-base gap-3 rounded-xl shadow-[0_0_20px_-5px_theme(colors.indigo.500/0.5)]">
                            Explorar Atracción Demo <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/passport" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-md">
                            <WalletCards className="h-5 w-5 mr-3 text-slate-400" /> Ver Mi Pasaporte
                        </Button>
                    </Link>
                </div>

                <div className="mt-20 pt-10 border-t border-white/10 max-w-md mx-auto">
                    <p className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest mb-6">
                        Infraestructura Invisible
                    </p>
                    <div className="grid gap-4 text-left">
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-indigo-500/20 p-2 rounded-lg"><span className="h-2 w-2 rounded-full bg-indigo-400 block" /></div>
                            <div>
                                <h4 className="text-slate-200 font-semibold text-sm">B2G White Label</h4>
                                <p className="text-slate-500 text-xs mt-1">Marca blanca para gobiernos</p>
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-indigo-500/20 p-2 rounded-lg"><span className="h-2 w-2 rounded-full bg-indigo-400 block" /></div>
                            <div>
                                <h4 className="text-slate-200 font-semibold text-sm">Sin Instalaciones</h4>
                                <p className="text-slate-500 text-xs mt-1">Web App progresiva inmediata</p>
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-indigo-500/20 p-2 rounded-lg"><span className="h-2 w-2 rounded-full bg-indigo-400 block" /></div>
                            <div>
                                <h4 className="text-slate-200 font-semibold text-sm">Identity & Wallet Abstraidas</h4>
                                <p className="text-slate-500 text-xs mt-1">Social login impulsado por Web3</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-10 border-t border-white/10 w-full max-w-4xl mx-auto z-10 pb-20">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 text-center flex items-center justify-center gap-2">
                        <MapPin className="h-6 w-6 text-indigo-400" /> Directorio de Atracciones
                    </h2>
                    <p className="text-slate-400 text-center mb-10 text-sm">Escanea el código QR físico en estos lugares para reclamar tu insignia oficial.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {attractions?.length ? attractions.map(attr => (
                            <div key={attr.id} className="glass-panel p-4 rounded-2xl flex gap-4 items-center transition-all hover:bg-slate-900/80 border border-white/5 hover:border-indigo-500/30">
                                <div className="h-24 w-24 rounded-xl overflow-hidden shrink-0 relative bg-slate-900">
                                    {attr.image_url && <img src={attr.image_url} alt={attr.name} className="object-cover w-full h-full" />}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-lg leading-tight truncate">{attr.name}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 mt-1 pr-2">{attr.description}</p>
                                    <div className="mt-3 flex items-center gap-1 text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 font-medium rounded-md w-fit border border-indigo-500/20">
                                        Escanea QR in-situ
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center text-slate-500">
                                No hay atracciones registradas todavía. Pronto habrán novedades.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
