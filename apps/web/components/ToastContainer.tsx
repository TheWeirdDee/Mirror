"use client";

import { useToastStore } from "@/lib/toast";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          let icon = <Info size={16} className="text-blue-400" />;
          let borderClass = "border-[var(--border-default)]";
          let bgClass = "bg-[var(--bg-surface)]";

          if (isSuccess) {
            icon = <CheckCircle2 size={16} className="text-green-400" />;
            borderClass = "border-green-500/30";
          } else if (isError) {
            icon = <AlertCircle size={16} className="text-red-400" />;
            borderClass = "border-red-500/30";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgClass} ${borderClass} overflow-hidden`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-medium text-[var(--text-primary)] leading-normal">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
