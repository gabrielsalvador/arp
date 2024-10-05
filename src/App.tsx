import React from 'react'
import MainLayout from './layout/MainLayout'

export const App = () => {

    return <MainLayout topbar={undefined} leftSidebar={undefined} rightSidebar={undefined} leftFooter={undefined} rightFooter={undefined}>
        <h1>Hello, World!</h1>
    </MainLayout>
}