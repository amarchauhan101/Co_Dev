import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

const UserGuide = ({ steps, onComplete, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [placement, setPlacement] = useState("Top");
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const tooltipRef = useRef(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (!steps || steps.length === 0) return;

    const positionTooltip = () => {
      // Remove existing highlights
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });

      const step = steps[currentStep];
      if (!step) return;

      const element = document.querySelector(step.selector);
      if (!element) {
        console.warn(`UserGuide: Element not found for selector: ${step.selector}`);
        return;
      }

      // Wait for any animations to complete
      const waitForElement = () => {
        return new Promise((resolve) => {
          const checkElement = () => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              resolve();
            } else {
              setTimeout(checkElement, 50);
            }
          };
          checkElement();
        });
      };

      waitForElement().then(() => {
        // Scroll element into view with offset for fixed header
        const scrollElement = () => {
          const rect = element.getBoundingClientRect();
          const headerHeight = 80; // Fixed header height
          
          // Check if sidebar is open by looking for the sidebar element
          const sidebarElement = document.querySelector('[class*="menu-slide-in"]');
          const sidebarWidth = sidebarElement && window.innerWidth >= 1024 ? 320 : 0;
          
          // Check if element is visible in viewport
          const isVisible = rect.top >= headerHeight && 
                            rect.bottom <= window.innerHeight - 20 && 
                            rect.left >= sidebarWidth && 
                            rect.right <= window.innerWidth - 20;

          if (!isVisible) {
            // Calculate scroll position to center element in visible area
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = (window.innerHeight - headerHeight) / 2 + headerHeight;
            const scrollOffset = elementCenter - viewportCenter;
            
            window.scrollBy({
              top: scrollOffset,
              behavior: 'smooth'
            });
            
            // Wait for scroll to complete
            return new Promise((resolve) => setTimeout(resolve, 300));
          }
          return Promise.resolve();
        };

        // Scroll first, then position tooltip
        scrollElement().then(() => {
          setTimeout(() => {
            element.classList.add("tour-highlight");
            const rect = element.getBoundingClientRect();
            
            // Responsive tooltip dimensions
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            
            let tooltipWidth, tooltipHeight;
            if (isMobile) {
              tooltipWidth = Math.min(320, window.innerWidth - 20);
              tooltipHeight = 220;
            } else if (isTablet) {
              tooltipWidth = 360;
              tooltipHeight = 200;
            } else {
              tooltipWidth = 400;
              tooltipHeight = 200;
            }

            // Enhanced positioning calculation that respects content flow
            const headerHeight = 80;
            const sidebarElement = document.querySelector('[class*="menu-slide-in"]');
            const sidebarWidth = sidebarElement && window.innerWidth >= 1024 ? 320 : 0;
            const padding = isMobile ? 15 : 25;
            
            // Get preferred position from step definition
            const preferredPosition = step.position || "auto";
            
            const spaceBelow = window.innerHeight - rect.bottom - padding;
            const spaceAbove = rect.top - headerHeight - padding;
            const spaceLeft = rect.left - sidebarWidth - padding;
            const spaceRight = window.innerWidth - rect.right - padding;

            let top, left;
            let newPlacement = "bottom";

            // Position based on preferred direction or best fit
            switch (preferredPosition) {
              case "top-center":
                if (spaceAbove >= tooltipHeight) {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                } else {
                  // Fallback to bottom
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                }
                break;

              case "bottom-center":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  // Fallback to top
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              case "bottom-left":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              case "bottom-right":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              default: // "auto" - smart positioning with priority order
                if (spaceBelow >= tooltipHeight) {
                  // Position below (preferred)
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else if (spaceAbove >= tooltipHeight) {
                  // Position above
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                } else if (spaceRight >= tooltipWidth && !isMobile) {
                  // Position to the right (desktop only)
                  top = Math.max(headerHeight + padding, rect.top + rect.height / 2 - tooltipHeight / 2);
                  top = Math.min(top, window.innerHeight - tooltipHeight - padding);
                  left = rect.right + 20;
                  newPlacement = "right";
                } else if (spaceLeft >= tooltipWidth && !isMobile) {
                  // Position to the left (desktop only)
                  top = Math.max(headerHeight + padding, rect.top + rect.height / 2 - tooltipHeight / 2);
                  top = Math.min(top, window.innerHeight - tooltipHeight - padding);
                  left = rect.left - tooltipWidth - 20;
                  newPlacement = "left";
                } else {
                  // Fallback: position below with reduced height
                  top = rect.bottom + 20;
                  newPlacement = "bottom-constrained";
                  const maxHeight = Math.max(150, spaceBelow - 20);
                  tooltipHeight = Math.min(tooltipHeight, maxHeight);
                }
                break;
            }
              tooltipHeight = Math.min(tooltipHeight, maxHeight);
                break;
            }

            // Calculate horizontal position for top/bottom placements with position-aware logic
            if (newPlacement === "bottom" || newPlacement === "top" || newPlacement === "bottom-constrained") {
              const minLeft = sidebarWidth + padding;
              const maxLeft = window.innerWidth - tooltipWidth - padding;
              
              // Position based on preferred horizontal alignment
              if (preferredPosition === "bottom-left" || preferredPosition === "top-left") {
                // Align to left side of element
                left = Math.max(minLeft, rect.left - tooltipWidth / 4);
              } else if (preferredPosition === "bottom-right" || preferredPosition === "top-right") {
                // Align to right side of element
                left = Math.min(maxLeft, rect.right - (tooltipWidth * 3/4));
              } else {
                // Center on element (default behavior)
                let preferredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
                left = Math.max(minLeft, Math.min(preferredLeft, maxLeft));
              }
              
              // Special handling for mobile
              if (isMobile) {
                left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
              }
            }

            // Final bounds checking
            if (top < headerHeight + padding) {
              top = headerHeight + padding;
            }
            if (top + tooltipHeight > window.innerHeight - padding) {
              top = Math.max(headerHeight + padding, window.innerHeight - tooltipHeight - padding);
            }
            if (left < sidebarWidth + padding) {
              left = sidebarWidth + padding;
            }
            if (left + tooltipWidth > window.innerWidth - padding) {
              left = window.innerWidth - tooltipWidth - padding;
            }

            setPlacement(newPlacement);
            setTooltipStyle({
              top: `${Math.round(top)}px`,
              left: `${Math.round(left)}px`,
              width: `${tooltipWidth}px`,
              height: newPlacement === "bottom-constrained" ? `${tooltipHeight}px` : "auto",
              opacity: 1,
              zIndex: 10000,
              transform: "translateY(0)",
              maxHeight: newPlacement === "bottom-constrained" ? `${tooltipHeight}px` : "none",
              overflow: newPlacement === "bottom-constrained" ? "auto" : "visible",
              position: "fixed",
            });
          }, isMobile ? 150 : 100);
        });
      });
    };

    // Skip animation on first render for faster startup
    if (isFirstRender.current) {
      positionTooltip();
      isFirstRender.current = false;
    } else {
      // Add slight delay for smoother transitions
      const timer = setTimeout(positionTooltip, 200);
      return () => clearTimeout(timer);
    }

    // Add event listeners with debouncing
    let resizeTimer;
    let scrollTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(positionTooltip, 150);
    };

    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(positionTooltip, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
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
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm">
      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-3">
              Skip Tutorial?
            </h3>
            <p className="text-gray-300 mb-5">
              Are you sure you want to skip the onboarding guide? You can always
              access it later from your profile settings.
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
                {isLoading ? "Skipping..." : "Skip Tutorial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed bg-gray-800 text-white p-4 sm:p-5 rounded-xl shadow-2xl border border-purple-500/30 transition-all duration-300 ${
          placement === "bottom" || placement === "bottom-constrained" 
            ? "tooltip-bottom" 
            : placement === "top"
            ? "tooltip-top"
            : placement === "right"
            ? "tooltip-right"
            : placement === "left"
            ? "tooltip-left"
            : "tooltip-bottom"
        }`}
        style={tooltipStyle}
      >
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 sm:mb-4">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-white transition-colors p-1"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Content */}
        <h3 className="font-bold text-base sm:text-lg mb-2 text-purple-400 pr-8">{step.title}</h3>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{step.content}</p>

        {/* Navigation */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs sm:text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>

          <div className="flex space-x-2 sm:space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
            >
              {currentStep === steps.length - 1
                ? isLoading
                  ? "Finishing..."
                  : "Finish Tour"
                : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Pointer Arrow */}
      <style>{`
        .tooltip-bottom::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 12px 12px 12px;
          border-color: transparent transparent #374151 transparent;
          border-style: solid;
          z-index: 10001;
        }
        
        .tooltip-top::before {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 12px 12px 0 12px;
          border-color: #374151 transparent transparent transparent;
          border-style: solid;
          z-index: 10001;
        }
        
        .tooltip-right::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 12px 12px 12px 0;
          border-color: transparent #374151 transparent transparent;
          border-style: solid;
          z-index: 10001;
        }
        
        .tooltip-left::before {
          content: '';
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 12px 0 12px 12px;
          border-color: transparent transparent transparent #374151;
          border-style: solid;
          z-index: 10001;
        }
        
        .tooltip-bottom-constrained::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 12px 12px 12px;
          border-color: transparent transparent #374151 transparent;
          border-style: solid;
          z-index: 10001;
        }

        /* Enhanced highlight for better visibility */
        .tour-highlight {
          box-shadow: 0 0 0 4px #6366f1, 0 0 25px rgba(99, 102, 241, 0.4) !important;
          border-radius: 12px !important;
          transition: all 0.4s ease !important;
          z-index: 9998 !important;
          position: relative !important;
          background-color: rgba(99, 102, 241, 0.08) !important;
          outline: none !important;
        }

        /* Ensure tooltip is above everything */
        .fixed[style*="z-index: 10000"] {
          z-index: 10001 !important;
        }

        /* Enhanced mobile responsiveness */
        @media (max-width: 768px) {
          .tooltip-bottom::before,
          .tooltip-top::before,
          .tooltip-bottom-constrained::before {
            left: 30px;
            transform: none;
          }
          
          .tooltip-right::before,
          .tooltip-left::before {
            top: 30px;
            transform: none;
          }
          
          .tour-highlight {
            box-shadow: 0 0 0 3px #6366f1, 0 0 20px rgba(99, 102, 241, 0.3) !important;
            border-radius: 8px !important;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .tooltip-bottom::before,
          .tooltip-top::before,
          .tooltip-bottom-constrained::before {
            left: calc(50% - 60px);
          }
        }

        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Prevent tooltip from being clipped */
        body {
          overflow-x: hidden;
        }
        
        /* Animation for tooltip appearance */
        .fixed[style*="opacity: 1"] {
          animation: tooltipFadeIn 0.3s ease-out;
        }
        
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default UserGuide;
