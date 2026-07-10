import { ReactNode } from "react";

interface FeedWrapperProps {
  children: ReactNode;
}

export const FeedWrapper = ({ children }: FeedWrapperProps) => {
  return <div className="feed-wrapper">{children}</div>;
};
