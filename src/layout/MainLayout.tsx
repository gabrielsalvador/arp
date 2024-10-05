import React, { ReactNode } from 'react';
import '../styles/MainLayout.css';


interface MainLayoutProps {
    topbar: React.ReactNode;
    children: React.ReactNode;
    leftSidebar: React.ReactNode;
    rightSidebar: React.ReactNode;
    leftFooter: React.ReactNode;
    rightFooter: React.ReactNode;
}

export default function MainLayout({ children, topbar, leftSidebar, rightSidebar, leftFooter, rightFooter }: MainLayoutProps) {
    return (
        <div id='main-layout' className='grid'>
            <div className='grid-item' style={{ gridArea: 'topbar' }}>
                {topbar}
            </div>
            <div className='grid-item' style={{ gridArea: 'left-sidebar' }}>
                {leftSidebar}
            </div>
            <div className='grid-item ' style={{ gridArea: 'main' }}>
                {children}
            </div>
            <div className='grid-item' style={{ gridArea: 'right-sidebar' }}>
                {rightSidebar}
            </div>
            <div className='grid-item' style={{ gridArea: 'left-footer' }}>
                {leftFooter}
            </div>
            <div className='grid-item' style={{ gridArea: 'right-footer' }}>
                {rightFooter}
            </div>
            </div>
    );
};
