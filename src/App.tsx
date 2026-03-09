/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Wifi, 
  Zap, 
  Activity, 
  Globe, 
  Server, 
  Cable, 
  AlertTriangle,
  RefreshCw,
  Power,
  Info,
  MousePointer2,
  ArrowRightLeft,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusLed } from './components/StatusLed';
import { cn } from './lib/utils';

type FiberType = 'standard' | 'attenuated';
type ConnectionState = 'normal' | 'low_signal' | 'no_signal' | 'auth_error';

export default function App() {
  const [onuPower, setOnuPower] = useState(true);
  const [routerPower, setRouterPower] = useState(true);
  const [fiberConnected, setFiberConnected] = useState(true);
  const [ethernetConnected, setEthernetConnected] = useState(true);
  const [fiberType, setFiberType] = useState<FiberType>('standard');
  const [isBooting, setIsBooting] = useState(false);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'warn' | 'error'}[]>([]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 10));
  };

  // Initial log
  useEffect(() => {
    addLog("Sistema NetSim Pro iniciado. Aguardando interação física.");
  }, []);

  // Simulation logic derived from physical state
  const signalLevel = !fiberConnected ? -99 : (fiberType === 'attenuated' ? -28.5 : -19.2);
  
  const onuStatus = {
    power: onuPower ? 'on' : 'off',
    pon: (onuPower && fiberConnected && signalLevel > -27) ? 'on' : 
         (onuPower && fiberConnected && signalLevel <= -27) ? 'blinking' : 'off',
    los: (onuPower && !fiberConnected) ? 'error' : 'off',
    lan: (onuPower && ethernetConnected && routerPower) ? 'on' : 'off'
  };

  const routerStatus = {
    power: routerPower ? 'on' : 'off',
    wan: (routerPower && ethernetConnected && onuStatus.lan === 'on') ? 'on' : 'off',
    internet: (routerPower && ethernetConnected && onuStatus.pon === 'on') ? 'on' : 'off',
    wlan: routerPower ? 'on' : 'off'
  };

  const handleFiberToggle = () => {
    const newState = !fiberConnected;
    setFiberConnected(newState);
    addLog(newState ? "Fibra óptica conectada ao bocal SC/APC." : "Fibra óptica desconectada. Alarme LOS iminente.", newState ? 'info' : 'warn');
  };

  const handleEthernetToggle = () => {
    const newState = !ethernetConnected;
    setEthernetConnected(newState);
    addLog(newState ? "Cabo Ethernet RJ45 travado na porta LAN1/WAN." : "Cabo Ethernet removido.", newState ? 'info' : 'warn');
  };

  const handleFiberTypeToggle = () => {
    const newType = fiberType === 'standard' ? 'attenuated' : 'standard';
    setFiberType(newType);
    addLog(`Patch cord alterado para: ${newType === 'attenuated' ? 'ATENUADO (Alta Perda)' : 'PADRÃO'}`);
  };

  const handleRouterPowerToggle = () => {
    const newState = !routerPower;
    setRouterPower(newState);
    addLog(newState ? "Roteador ligado. Iniciando boot do sistema..." : "Roteador desligado.", newState ? 'info' : 'warn');
  };

  const handleOnuPowerToggle = () => {
    const newState = !onuPower;
    setOnuPower(newState);
    addLog(newState ? "ONU ligada. Iniciando sincronização óptica..." : "ONU desligada.", newState ? 'info' : 'warn');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Server className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase italic">NetSim <span className="text-emerald-500">Physical</span></h1>
              <p className="text-[9px] text-zinc-500 font-mono tracking-tighter uppercase">Laboratório de Interação de Hardware</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", fiberConnected ? "bg-emerald-500" : "bg-zinc-700")} />
                FIBRA
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", ethernetConnected ? "bg-emerald-500" : "bg-zinc-700")} />
                LAN
              </div>
            </div>
            <button 
              onClick={() => {
                setIsBooting(true);
                addLog("Reiniciando equipamentos...");
                setTimeout(() => setIsBooting(false), 2000);
              }}
              className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all text-zinc-400 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", isBooting && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Physical Interaction Area */}
          <div className="lg:col-span-9 space-y-10">
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] p-12 relative overflow-hidden min-h-[600px] flex flex-col justify-center shadow-inner">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

              <div className="relative flex flex-col xl:flex-row items-center justify-between gap-20">
                
                {/* ONU Section */}
                <div className="flex flex-col items-center gap-8">
                  <motion.div 
                    layout
                    className={cn(
                      "relative w-52 h-72 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl border-2 border-zinc-700/50 shadow-2xl flex flex-col p-5 transition-all duration-700",
                      !onuPower && "brightness-50 grayscale-[0.5]"
                    )}
                  >
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-zinc-700 rounded-md text-[9px] font-black text-zinc-400 border border-zinc-600 uppercase tracking-widest">
                      ONU GPON v2
                    </div>
                    
                    {/* Front Panel */}
                    <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-5 flex flex-col gap-8">
                      <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                        <StatusLed label="PWR" status={onuStatus.power as any} />
                        <StatusLed label="PON" status={onuStatus.pon as any} />
                        <StatusLed label="LOS" status={onuStatus.los === 'error' ? 'on' : 'off'} color="red" />
                        <StatusLed label="LAN" status={onuStatus.lan as any} />
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">Optical Port</span>
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", fiberConnected ? "bg-blue-500" : "bg-zinc-800")} />
                        </div>
                        <div className="w-full h-10 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                           <div className="w-5 h-5 bg-emerald-900/20 border border-emerald-500/30 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Power Switch */}
                    <button 
                      onClick={handleOnuPowerToggle}
                      className={cn(
                        "absolute -left-4 top-12 w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-lg z-30 group",
                        onuPower ? "bg-emerald-500 border-emerald-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                      )}
                    >
                      <Power className="w-4 h-4" />
                      <div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-zinc-800 text-[8px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 whitespace-nowrap uppercase font-black">
                          Power ONU
                        </div>
                      </div>
                    </button>
                  </motion.div>

                  {/* Fiber Cable Interaction */}
                  <div className="relative h-32 flex flex-col items-center">
                    <div className="absolute top-0 w-0.5 h-full bg-zinc-800/50 dashed" />
                    <motion.div 
                      animate={{ y: fiberConnected ? -40 : 40 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="relative z-10 cursor-pointer group"
                      onClick={handleFiberToggle}
                    >
                      {/* Connector Head */}
                      <div className={cn(
                        "w-8 h-12 rounded-t-sm rounded-b-md border-x-2 border-b-2 transition-all flex flex-col items-center justify-end pb-1",
                        fiberType === 'standard' ? "bg-blue-600 border-blue-500" : "bg-yellow-600 border-yellow-500"
                      )}>
                        <div className="w-1 h-4 bg-white/20 rounded-full mb-1" />
                        <div className="text-[7px] font-black text-white/80 uppercase tracking-tighter">SC/APC</div>
                      </div>
                      {/* Cable Body */}
                      <div className={cn(
                        "w-1.5 h-24 mx-auto rounded-b-full shadow-lg transition-colors",
                        fiberType === 'standard' ? "bg-blue-500/80" : "bg-yellow-500/80"
                      )} />
                      
                      {/* Interaction Tooltip */}
                      <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-zinc-800 text-[9px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 whitespace-nowrap flex items-center gap-2">
                          <MousePointer2 className="w-3 h-3 text-emerald-500" />
                          {fiberConnected ? "CLIQUE PARA DESENCAIXAR" : "CLIQUE PARA ENCAIXAR"}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Ethernet Cable Interaction (Horizontal) */}
                <div className="flex-1 flex items-center justify-center relative h-40">
                  <div className="absolute inset-x-0 h-0.5 bg-zinc-800/30" />
                  
                  <motion.div 
                    animate={{ 
                      x: ethernetConnected ? 0 : 80,
                      opacity: 1
                    }}
                    transition={{ type: 'spring', stiffness: 150, damping: 25 }}
                    className="relative z-20 flex items-center group cursor-pointer"
                    onClick={handleEthernetToggle}
                  >
                    {/* RJ45 Connector */}
                    <div className="w-10 h-7 bg-zinc-700 rounded-l-md border-y border-l border-zinc-600 flex items-center justify-center gap-0.5 px-1">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-0.5 h-4 bg-yellow-500/50 rounded-full" />
                      ))}
                    </div>
                    {/* Cable Body */}
                    <div className={cn(
                      "h-2 w-48 transition-all duration-500",
                      (routerStatus.wan === 'on') ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-zinc-700"
                    )} />
                    
                    {/* Interaction Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-zinc-800 text-[9px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 whitespace-nowrap">
                        {ethernetConnected ? "DESCONECTAR RJ45" : "CONECTAR RJ45"}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Router Section */}
                <div className="flex flex-col items-center gap-8">
                  <motion.div 
                    layout
                    className={cn(
                      "relative w-72 h-60 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl border-2 border-zinc-700/50 shadow-2xl flex flex-col p-5 transition-all duration-700",
                      !routerPower && "brightness-50 grayscale-[0.5]"
                    )}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-700 rounded-md text-[9px] font-black text-zinc-400 border border-zinc-600 uppercase tracking-widest">
                      ROUTER AX3000
                    </div>

                    {/* Antennas */}
                    <div className="absolute -top-16 left-6 w-1.5 h-16 bg-zinc-700 rounded-t-full origin-bottom -rotate-12" />
                    <div className="absolute -top-16 right-6 w-1.5 h-16 bg-zinc-700 rounded-t-full origin-bottom rotate-12" />

                    {/* Front Panel */}
                    <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-5 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <div className="text-[9px] font-black text-zinc-600 tracking-widest uppercase italic">Giga-Stream Pro</div>
                        <Wifi className={cn("w-4 h-4 transition-colors", routerStatus.wlan === 'on' ? "text-emerald-500 animate-pulse" : "text-zinc-800")} />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <StatusLed label="PWR" status={routerStatus.power as any} />
                        <StatusLed label="WAN" status={routerStatus.wan as any} />
                        <StatusLed label="INT" status={routerStatus.internet as any} color={routerStatus.internet === 'error' ? 'red' : 'green'} />
                        <StatusLed label="WIFI" status={routerStatus.wlan as any} />
                      </div>
                    </div>

                    {/* Power Switch */}
                    <button 
                      onClick={handleRouterPowerToggle}
                      className={cn(
                        "absolute -right-4 top-12 w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-lg z-30 group",
                        routerPower ? "bg-emerald-500 border-emerald-400 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                      )}
                    >
                      <Power className="w-4 h-4" />
                      <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-zinc-800 text-[8px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 whitespace-nowrap uppercase font-black">
                          Power Router
                        </div>
                      </div>
                    </button>
                  </motion.div>
                </div>

              </div>
            </div>

            {/* Telemetry & Logs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/60">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Console de Eventos</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="p-6 font-mono text-[10px] space-y-2.5 h-48 overflow-y-auto scrollbar-hide">
                  <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => (
                      <motion.div 
                        key={log.time + i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 group"
                      >
                        <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                        <span className={cn(
                          "transition-colors",
                          log.type === 'error' ? "text-red-400" : log.type === 'warn' ? "text-orange-400" : "text-zinc-400 group-hover:text-emerald-400"
                        )}>
                          {log.msg}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Métricas de Sinal</div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-zinc-500">POTÊNCIA ÓPTICA</span>
                        <span className={cn("font-bold", signalLevel < -27 ? "text-red-400" : "text-emerald-400")}>
                          {signalLevel === -99 ? "OFFLINE" : `${signalLevel} dBm`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: signalLevel === -99 ? 0 : (Math.max(0, (signalLevel + 40) / 30) * 100) + '%' }}
                          className={cn("h-full transition-colors", signalLevel < -27 ? "bg-red-500" : "bg-emerald-500")}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-zinc-500">LATÊNCIA (PING)</span>
                        <span className="text-zinc-300 font-bold">{routerStatus.internet === 'on' ? '12ms' : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase font-bold">
                    <Globe className="w-3 h-3" />
                    IP: {routerStatus.internet === 'on' ? '187.45.122.9' : '0.0.0.0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 shadow-xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 flex items-center gap-3">
                <Layers className="w-4 h-4 text-emerald-500" />
                Config. Física
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tipo de Patch Cord</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => { setFiberType('standard'); addLog("Patch cord padrão selecionado."); }}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all flex items-center justify-between",
                        fiberType === 'standard' ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/5" : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <span>Padrão (SC/APC)</span>
                      {fiberType === 'standard' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </button>
                    <button 
                      onClick={() => { setFiberType('attenuated'); addLog("Patch cord atenuado conectado. Sinal sofrerá perda.", 'warn'); }}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all flex items-center justify-between",
                        fiberType === 'attenuated' ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400 shadow-lg shadow-yellow-500/5" : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <span>Atenuado (-10dB)</span>
                      {fiberType === 'attenuated' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Auto-Diagnóstico</span>
                      <div className="w-8 h-4 bg-emerald-500/20 rounded-full flex items-center px-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                   </div>
                   <p className="text-[9px] text-zinc-600 leading-relaxed italic">
                     Interaja diretamente com os cabos no painel central para simular desconexões físicas.
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Info className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Dicas de Campo</h3>
              </div>
              <ul className="text-[10px] space-y-4 text-zinc-400 leading-relaxed font-medium">
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-black">01</span>
                  <span>O cabo atenuado simula uma fibra com curvatura excessiva ou sujeira no conector.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-black">02</span>
                  <span>Sem o cabo Ethernet, o roteador não recebe o sinal da ONU, impossibilitando a discagem PPPoE.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-black">03</span>
                  <span>O LED LOS acende instantaneamente ao remover a fibra, indicando interrupção total da luz.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">NetSim Physical Engine v2.4</div>
             <div className="h-4 w-px bg-zinc-800" />
             <div className="text-[9px] font-mono text-zinc-600">STABLE_BUILD_2026_03_09</div>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[9px] font-black text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">Hardware Specs</a>
            <a href="#" className="text-[9px] font-black text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">API Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
