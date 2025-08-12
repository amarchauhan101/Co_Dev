// import React, { useState, useEffect, useLayoutEffect } from 'react';

// // This is the new, separate component for the interactive tour.
// const UserGuide = ({ steps, onComplete }) => {
//   // Add a guard clause to prevent crashes if steps are not provided.
//   // If the steps prop is missing or empty, the component will simply render nothing.
//   if (!steps || steps.length === 0) {
//     return null;
//   }

//   const [currentStep, setCurrentStep] = useState(0);

//   const [tooltipStyle, setTooltipStyle] = useState({});

//   useLayoutEffect(() => {
//     // This function positions the tooltip next to the highlighted element.
//     const positionTooltip = () => {
//         // Clear previous highlights first
//         document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        
//         const step = steps[currentStep];
//         // This check is now safer because we've already verified the `steps` array exists.
//         if (!step) return;

//         const element = document.querySelector(step.selector);
//         if (element) {
//             // Add highlight to the new element
//             element.classList.add('tour-highlight');
//             const rect = element.getBoundingClientRect();
//             const tooltipWidth = 300;
//             let top = rect.bottom + 10;
//             let left = rect.left + rect.width / 2 - tooltipWidth / 2;

//             // Adjust if tooltip goes off-screen
//             if (left < 10) left = 10;
//             if (left + tooltipWidth > window.innerWidth - 10) {
//                 left = window.innerWidth - tooltipWidth - 10;
//             }
//             if (top + 150 > window.innerHeight) { // 150 is approx tooltip height
//                 top = rect.top - 150;
//             }

//             setTooltipStyle({ top: `${top}px`, left: `${left}px`, width: `${tooltipWidth}px` });
//         }
//     };
    
//     // Position the tooltip as soon as the step changes
//     positionTooltip();

//     // Add a listener to reposition on window resize for responsiveness
//     window.addEventListener('resize', positionTooltip);
    
//     // Cleanup function to remove the highlight and listener
//     return () => {
//         document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
//         window.removeEventListener('resize', positionTooltip);
//     };
//   }, [currentStep, steps]);

//   const handleNext = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       handleComplete();
//     }
//   };

//   const handleComplete = () => onComplete();

//   const step = steps[currentStep];
//   // This check is slightly redundant now but provides an extra layer of safety.
//   if (!step) return null;

//   return (
//     <div className="fixed inset-0 z-[100] bg-black/60">
//       <div className="absolute bg-gray-800 text-white p-4 rounded-lg shadow-xl transition-all duration-300" style={tooltipStyle}>
//         <h3 className="font-bold text-md mb-2 text-indigo-400">{step.title}</h3>
//         <p className="text-sm text-gray-300 mb-4">{step.content}</p>
//         <div className="flex justify-between items-center">
//           <span className="text-xs text-gray-500">{currentStep + 1} / {steps.length}</span>
//           <div>
//             <button onClick={handleComplete} className="text-sm py-1 px-3 mr-2 hover:bg-gray-700 rounded-md">Skip</button>
//             <button onClick={handleNext} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-4 rounded-md">
//               {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserGuide;



import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

const UserGuide = ({ steps, onComplete, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [placement, setPlacement] = useState('bottom');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const tooltipRef = useRef(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (!steps || steps.length === 0) return;

    const positionTooltip = () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });

      const step = steps[currentStep];
      if (!step) return;

      const element = document.querySelector(step.selector);
      if (!element) return;

      // Add highlight with slight delay to ensure element is ready
      setTimeout(() => {
        element.classList.add('tour-highlight');
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 180;

        // Calculate available space
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let top, left;
        let newPlacement = 'bottom';
        
        if (spaceBelow > tooltipHeight || spaceBelow > spaceAbove) {
          // Position below
          top = rect.bottom + 15;
          newPlacement = 'bottom';
        } else {
          // Position above
          top = rect.top - tooltipHeight - 15;
          newPlacement = 'top';
        }
        
        left = Math.max(10, Math.min(
          rect.left + rect.width/2 - tooltipWidth/2,
          window.innerWidth - tooltipWidth - 10
        ));
        
        setPlacement(newPlacement);
        setTooltipStyle({ 
          top: `${top}px`, 
          left: `${left}px`, 
          width: `${tooltipWidth}px`,
          opacity: 1,
          transform: 'translateY(0)'
        });
      }, 50);
    };

    // Skip animation on first render for faster startup
    if (isFirstRender.current) {
      positionTooltip();
      isFirstRender.current = false;
    } else {
      // Add slight delay for smoother transitions
      const timer = setTimeout(positionTooltip, 150);
      return () => clearTimeout(timer);
    }

    window.addEventListener('resize', positionTooltip);
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (isLoading) return;
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    setShowSkipConfirm(false);
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!steps || steps.length === 0) return null;
  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm">
      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-purple-500/30 shadow-xl">
            <h3 className="text-xl font-bold text-purple-400 mb-3">Skip Tutorial?</h3>
            <p className="text-gray-300 mb-5">
              Are you sure you want to skip the onboarding guide? You can always access it later from your profile.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSkip}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Skipping...' : 'Skip Tutorial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className={`fixed bg-gray-800 text-white p-5 rounded-xl shadow-2xl border border-purple-500/30 transition-all duration-300 ${
          placement === 'bottom' ? 'tooltip-bottom' : 'tooltip-top'
        }`}
        style={tooltipStyle}
      >
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-700 rounded-full mb-4">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Content */}
        <h3 className="font-bold text-lg mb-2 text-purple-400">{step.title}</h3>
        <p className="text-gray-300 mb-6">{step.content}</p>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
            >
              {currentStep === steps.length - 1 
                ? (isLoading ? 'Finishing...' : 'Finish Tour') 
                : 'Next'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Pointer Arrow */}
      <style>{`
        .tooltip-bottom::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 10px 10px 10px;
          border-color: transparent transparent #374151 transparent;
          border-style: solid;
        }
        
        .tooltip-top::before {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 10px 10px 0 10px;
          border-color: #374151 transparent transparent transparent;
          border-style: solid;
        }
      `}</style>
    </div>
  );
};

export default UserGuide;


