// PianoRoll.test.tsx
import React from 'react';
import { render, fireEvent, getByTestId } from '@testing-library/react';
import { beforeAll, describe, expect, it, vitest } from 'vitest';
import PianoRoll,{Note} from '../src/components/Pianoroll';

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
        render(
            <PianoRoll
                width={1000}
                height={100}
                // yRange[32,44]
            />
        );

        const canvas = getByTestId(document.body, 'canvas');//canvas its the actual note editor part
        let notes:{key:number, notes:Note[]}

        
        fireEvent.doubleClick(canvas, { clientX: 1, clientY: 1 });
        notes = JSON.parse(canvas.getAttribute('data-midi-notes') || '[]');
        // debugger
        expect(notes[43][0]).toBeDefined();
        expect(notes[43][0].time.start).toBe(0);

        fireEvent.doubleClick(canvas, { clientX: 1000, clientY: 1 });
        
        notes = JSON.parse(canvas.getAttribute('data-midi-notes') || '[]');
        expect(notes[43][1]).toBeDefined();
        expect(notes[43][1].time.start).toBe(15360);

        fireEvent.doubleClick(canvas, { clientX: 1, clientY: 100 });
        
        notes = JSON.parse(canvas.getAttribute('data-midi-notes') || '[]');
        expect(notes[32][0]).toBeDefined();
        expect(notes[32][0].time.start).toBe(0);
        

    });



  
});