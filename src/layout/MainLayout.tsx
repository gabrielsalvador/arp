import React, { ReactNode, useEffect, useState } from "react";
import "../styles/MainLayout.css";

interface MainLayoutProps {
  topbar: React.ReactNode;
  children: React.ReactNode;
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
  leftFooter: React.ReactNode;
  rightFooter: React.ReactNode;
}

export default function MainLayout({
  children,
  topbar,
  leftSidebar,
  rightSidebar,
  leftFooter,
  rightFooter,
}: MainLayoutProps) {
  const topBarRef = React.useRef<HTMLDivElement>(null);
  const leftSidebarRef = React.useRef<HTMLDivElement>(null);
  const rightSidebarRef = React.useRef<HTMLDivElement>(null);
  const leftFooterRef = React.useRef<HTMLDivElement>(null);
  const rightFooterRef = React.useRef<HTMLDivElement>(null);

  const [leftFooterWidth, setLeftFooterWidth] = useState<number>(0);
  
  useEffect(() => {
    if (leftFooterRef.current) {
      setLeftFooterWidth(leftFooterRef.current.offsetWidth);
    }
  }, [leftFooterRef.current]);

  return (
    <div id="main-layout" className="grid">
      <div className="grid-item" style={{ gridArea: "topbar" }} ref={topBarRef}>
        {topbar}
      </div>
      <div
        className="grid-item"
        style={{ gridArea: "left-sidebar" }}
        ref={leftSidebarRef}
      >
        {leftSidebar}
      </div>
      <div
        className="grid-item "
        style={{ gridArea: "main" }}
        ref={leftSidebarRef}
      >
        {children}
      </div>
      <div
        className="grid-item"
        style={{ gridArea: "right-sidebar" }}
        ref={rightFooterRef}
      >
        {rightSidebar}
      </div>
      <div
        className="grid-item"
        style={{ gridArea: "left-footer" }}
        ref={leftFooterRef}
      >
        {React.cloneElement(leftFooter as React.ReactElement<any>, {
          width: leftFooterWidth,
        })}
      </div>
      <div
        className="grid-item"
        style={{ gridArea: "right-footer" }}
        ref={rightFooterRef}
      >
        {rightFooter}
      </div>
    </div>
  );
}
