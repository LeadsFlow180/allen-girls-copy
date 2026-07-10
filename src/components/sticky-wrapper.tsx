import { ReactNode } from "react";

interface StickyWrapperProps {
  children: ReactNode;
}

export const StickyWrapper = ({ children }: StickyWrapperProps) => {
  return <div className="sticky-wrapper">{children}</div>;
};
