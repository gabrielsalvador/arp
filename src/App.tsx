import React, { useEffect, useState } from 'react'
import MainLayout from './layout/MainLayout'
import { Stage, Layer, Rect, Circle } from 'react-konva'
import PianoRoll from './components/PianoRoll';
import "../src/index.css"


export const App = () => {



    return <MainLayout topbar={undefined} leftSidebar={undefined} rightSidebar={undefined} leftFooter={<PianoRoll />} rightFooter={undefined}>


        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                <Circle x={200} y={200} stroke="red" fill="red" radius={5} draggable={true} onDragMove={(e) => {}} />
            </Layer>
        </Stage>
        

            
    </MainLayout>
}