import React from 'react';
import { cn } from '../../utils/classNames';
import { motion } from 'motion/react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps, labels, className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center gap-1.5 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
              <motion.div
                initial={false}
                animate={{
                  width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                  backgroundColor: isCompleted || isActive ? 'var(--color-teal-500)' : 'transparent'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-0 top-0 bottom-0 rounded-full bg-teal-500"
              />
            </div>
          );
        })}
      </div>
      {labels && labels.length === totalSteps && (
         <div className="flex justify-between items-center px-1">
           <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
             {labels[currentStep - 1]}
           </span>
           <span className="text-[11px] font-bold font-mono text-slate-400 tracking-wider">
             STEP {currentStep} OF {totalSteps}
           </span>
         </div>
      )}
    </div>
  );
};
