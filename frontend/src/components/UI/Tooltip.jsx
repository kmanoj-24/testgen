import { useState } from 'react';

export const Tooltip = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div className={`absolute z-50 ${positions[position]} px-2 py-1 rounded bg-foreground text-background text-xs font-medium shadow-lg whitespace-nowrap pointer-events-none`}>
          {content}
        </div>
      )}
    </div>
  );
};