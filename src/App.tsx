import React, { useEffect, useState } from 'react'
import MainLayout from './layout/MainLayout'
import { Stage, Layer, Rect, Circle } from 'react-konva'



export const App = () => {

    const [x, setX] = useState(0)
    const [y, setY] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setX(x => x + 1)
        }, 1000)
        return () => clearInterval(interval)
    })

    const [width, setWidth] = useState(window.innerWidth)

    return <MainLayout topbar={undefined} leftSidebar={undefined} rightSidebar={undefined} leftFooter={undefined} rightFooter={undefined}>
        
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                <Circle x={x} y={200} stroke="red" fill="red" radius={5} draggable={true} onDragMove={(e) => {
                    setX(e.target.x())
                    setY(e.target.y())
                }} />
            </Layer>
        </Stage>

    </MainLayout>
}