import { useEffect, useRef } from 'react';

type OverlayCloser = () => void;

interface RegisteredOverlay {
  id: string;
  close: OverlayCloser;
  priority: number;
}

class OverlayRegistryManager {
  private stack: RegisteredOverlay[] = [];

  public register(id: string, close: OverlayCloser, priority = 0) {
    this.stack = this.stack.filter((o) => o.id !== id);
    this.stack.push({ id, close, priority });

    return () => {
      this.unregister(id);
    };
  }

  public unregister(id: string) {
    this.stack = this.stack.filter((o) => o.id !== id);
  }

  public hasActiveOverlay(): boolean {
    return this.stack.length > 0;
  }

  public popAndClose(): boolean {
    if (this.stack.length > 0) {
      const top = this.stack.pop();
      if (top) {
        top.close();
        return true;
      }
    }
    return false;
  }
}

export const overlayRegistry = new OverlayRegistryManager();

export function useOverlayRegistration(id: string, isOpen: boolean, onClose: () => void, priority = 0) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (isOpen) {
      const cleanup = overlayRegistry.register(id, () => onCloseRef.current(), priority);
      return cleanup;
    } else {
      overlayRegistry.unregister(id);
    }
  }, [id, isOpen, priority]);
}
