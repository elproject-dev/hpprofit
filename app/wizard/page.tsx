"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Selesai wizard, arahkan ke beranda
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[430px] mx-auto bg-[#56311F] relative overflow-hidden">
      {/* Background and Images (clickable to advance as fallback) */}
      <div className="absolute inset-0 cursor-pointer z-0" onClick={handleNext}>
        {[1, 2, 3, 4].map((step) => (
          <Image
            key={step}
            src={`/wizard/wizard-${step}.png`}
            alt={`Wizard Step ${step}`}
            fill
            className={`object-contain transition-opacity duration-300 ease-out ${
              currentStep === step ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            priority={step === 1}
          />
        ))}
      </div>

      {/* Button - Liquid Glass - Text */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute z-10 flex justify-center items-center w-[250px] h-[50px] left-1/2 -translate-x-1/2 top-[80%] rounded-full shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-transform active:scale-95"
      >
        {/* Fill + Shadow */}
        <div 
          className="absolute rounded-full" 
          style={{ left: '0px', right: '0px', top: '0px', bottom: '0px' }} 
        />

        {/* Glass Effect */}
        <div className="absolute inset-0 rounded-full backdrop-blur-xl" />
        
        {/* White Backing */}
        <div 
          className="absolute bg-[#FFFFFF] rounded-full" 
          style={{ left: '-0.5px', right: '-0.5px', top: '-0.5px', bottom: '-0.5px', opacity: 0.94 }} 
        />

        {/* Tint (menyesuaikan warna dari desain awal) */}
        <div 
          className="absolute bg-[#AC7F5E] rounded-full" 
          style={{ left: '-0.5px', right: '-0.5px', top: '-0.5px', bottom: '-0.5px', mixBlendMode: 'multiply' }} 
        />
        
        {/* Text */}
        <span className="relative z-10 text-white font-[510] text-[17px] tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {currentStep === totalSteps ? "Selesai" : "Lanjut"}
        </span>
      </button>
    </div>
  );
}
