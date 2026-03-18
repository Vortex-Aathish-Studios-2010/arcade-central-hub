import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export type DeviceType = "laptop" | "phone" | "tablet";

const DEVICE_KEY = "arcade_device_type";

export const getDeviceType = (): DeviceType | null => {
  return localStorage.getItem(DEVICE_KEY) as DeviceType | null;
};

export const setDeviceType = (device: DeviceType) => {
  localStorage.setItem(DEVICE_KEY, device);
};

interface DeviceSelectorProps {
  onSelect: (device: DeviceType) => void;
}

export const DeviceSelector = ({ onSelect }: DeviceSelectorProps) => {
  const devices = [
    { type: "phone" as DeviceType, icon: Smartphone, label: "Phone", desc: "Touch controls" },
    { type: "tablet" as DeviceType, icon: Tablet, label: "Tablet", desc: "Touch + larger screen" },
    { type: "laptop" as DeviceType, icon: Monitor, label: "Laptop", desc: "Mouse & keyboard" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-10 px-6"
      style={{ background: "radial-gradient(ellipse at center, hsl(230 25% 12%), hsl(230 25% 4%))" }}
    >
      <motion.h2
        className="font-display text-3xl sm:text-4xl font-bold tracking-wider"
        style={{ color: "hsl(185 100% 50%)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        What are you playing on?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        We'll optimize controls for your device
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
        {devices.map((d, i) => (
          <motion.button
            key={d.type}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.15, duration: 0.6 }}
            onClick={() => {
              setDeviceType(d.type);
              onSelect(d.type);
            }}
            className="rounded-2xl border-2 border-primary/30 bg-card p-8 text-center hover:border-primary hover:glow-primary transition-all min-h-[160px] flex flex-col items-center justify-center gap-4"
          >
            <d.icon className="w-12 h-12" style={{ color: "hsl(185 100% 50%)" }} />
            <h3 className="font-display text-xl font-bold text-foreground">{d.label}</h3>
            <p className="text-muted-foreground text-sm">{d.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
