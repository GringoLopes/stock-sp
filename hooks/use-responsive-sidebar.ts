import { useBreakpoint } from './use-breakpoint';
import { useEffect, useState } from 'react';

type SidebarState = {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
};

export const useSidebarResponsive = (defaultState: Partial<SidebarState> = {}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  const [state, setState] = useState<SidebarState>({
    isOpen: defaultState.isOpen ?? true,
    isCollapsed: defaultState.isCollapsed ?? false,
    isMobileOpen: defaultState.isMobileOpen ?? false,
  });

  // Ajusta o estado do sidebar baseado no breakpoint
  useEffect(() => {
    if (isMobile) {
      setState(prev => ({
        ...prev,
        isOpen: false,
        isCollapsed: true,
      }));
    } else if (isTablet) {
      setState(prev => ({
        ...prev,
        isOpen: true,
        isCollapsed: true,
      }));
    } else if (isDesktop) {
      setState(prev => ({
        ...prev,
        isOpen: true,
        isCollapsed: false,
      }));
    }
  }, [isMobile, isTablet, isDesktop]);

  const toggleSidebar = () => {
    if (isMobile) {
      setState(prev => ({
        ...prev,
        isMobileOpen: !prev.isMobileOpen,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isCollapsed: !prev.isCollapsed,
      }));
    }
  };

  const closeMobileSidebar = () => {
    setState(prev => ({
      ...prev,
      isMobileOpen: false,
    }));
  };

  return {
    ...state,
    toggleSidebar,
    closeMobileSidebar,
    isMobile,
    isTablet,
    isDesktop,
  };
}; 