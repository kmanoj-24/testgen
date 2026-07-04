import { useState, useRef, useEffect } from 'react';

export const Tooltip = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={triggerRef}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 px-2.5 py-1 text-xs font-medium rounded-md bg-foreground text-background shadow-elevated whitespace-nowrap pointer-events-none ${positions[position]}`}>
          {content}
          <div className={`absolute w-2 h-2 bg-foreground rotate-45 ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : 'right-full top-1/2 -translate-y-1/2 -mr-1'}`} />
        </div>
      )}
    </div>
  );
};