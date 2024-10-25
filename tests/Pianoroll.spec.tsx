// PianoRoll.test.tsx
import React from 'react';
import { render, fireEvent, getByTestId } from '@testing-library/react';
import { beforeAll, describe, expect, it, vitest } from 'vitest';
import PianoRoll from '../src/components/Pianoroll';

beforeAll(() => {
    // @ts-ignore
    HTMLCanvasElement.prototype.getContext = vitest.fn(() => ({
        fillRect: vitest.fn(),
        strokeRect: vitest.fn(),
        clearRect: vitest.fn(),
        getImageData: vitest.fn(),
        putImageData: vitest.fn(),
        createImageData: vitest.fn(),
        setTransform: vitest.fn(),
        drawImage: vitest.fn(),
        save: vitest.fn(),
        fillText: vitest.fn(),
        restore: vitest.fn(),
        beginPath: vitest.fn(),
        moveTo: vitest.fn(),
        lineTo: vitest.fn(),
        closePath: vitest.fn(),
        stroke: vitest.fn(),
        translate: vitest.fn(),
        scale: vitest.fn(),
        rotate: vitest.fn(),
        arc: vitest.fn(),
        fill: vitest.fn(),
        measureText: vitest.fn(),
        transform: vitest.fn(),
        rect: vitest.fn(),
        clip: vitest.fn(),
    }));
});

describe('PianoRoll Component', () => {


    it('should create a new note on mouse down', () => {
        const { getByRole } = render(
            <PianoRoll
                width={800}
                height={600}
                _yRange={[62,74]}
                gridQuantize={10}
                xRulerSize={50}
                yRulerSize={50}
                keyboardWidth={100}
            />
        );



        //find <canvas> element by tag name
        const canvas = getByTestId(document.body, 'canvas');

        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });

        //get notes from state
        const notes = JSON.parse(canvas.getAttribute('data-midi-notes') || '[]');
        console.log(notes);
        expect(notes[88]).toHaveLength(3);
        debugger
        // expect(notes[0]).toEqual({ start: 0, grid: 1, selected: false, pitch: 88 });


    });

    // it('should drag a note on mouse move', () => {
    //     it('should drag a note', () => {
    //         render(
    //           <PianoRoll
    //             width={800}
    //             height={600}
    //             xRange={100}
    //             yRange={88}
    //             gridSize={10}
    //             xScroll={0}
    //             yScroll={0}
    //             xRulerSize={50}
    //             yRulerSize={50}
    //             keyboardWidth={100}
    //             xOffset={60}
    //           />
    //         );
        
    //         //find <canvas> element by tag name
    //         const canvas = getByTestId(document.body, 'canvas');
            
    //         //simulate mouse click and drag
    //         fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    //         fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    //         fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });
    
    
        
        
    //       });
    // });
});