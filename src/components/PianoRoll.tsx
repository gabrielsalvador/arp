import React, { useCallback, useEffect, useRef } from 'react';

type Dragging = {
    action: string,
    start: number[],
    current?: number[],
    startTime?: number,
    startNote?: number,
    startPos?: number[],
}

export type Note = {
    selected: boolean,
    time: {
        start: number,
        end: number,
    }
    pitch?: number,
}

interface PianoRollProps {
    // Dimensions
    width?: number;              // Default: 840
    height?: number;             // Default: 320
    xRulerSize?: number;         // Default: 24
    maxRangeX?: number           // Default: 480
    yRulerSize?: number;         // Default: 24
    keyboardWidth?: number;      // Default: 40

    // Layout and Ranges
    pulsesPerQuarterNote?: number;     // Default: 480

    // Editing and Interaction
    editMode?: "edit" | "snap" | "free";        // Default: "dragpoly"
    gridQuantize?: number;                      // Default: `pulsesPerQuarterNote`
    defaultVelocity?: number;                   // Default: 100
    enabled?: boolean;                          // Default: true


    // Playback
    timeCursorPosition?: number;        // Default: 0
    markStart?: number;                 // Default: 0
    markEnd?: number;                   // Default: 16
    loop?: number;                      // Default: 0
    preload?: number;                   // Default: 1.0
    tempo?: number;                     // Default: 120

    // Colors
    colorLightKeys?: string;             // Default: "#ccc"
    colorDarkKeys?: string;              // Default: "#aaa"
    colorGridLines?: string;             // Default: "#666"
    colorGridSection?: string;           // Default: "#999"
    colorNote?: string;                  // Default: "#f22"
    colorNoteSelected?: string;          // Default: "#0f0"
    colorNoteBorder?: string;            // Default: "#000"
    colorNoteSelectedBorder?: string;    // Default: "#fff"
    colorRulerBackground?: string;       // Default: "#666"
    colorRulerForeground?: string;       // Default: "#fff"
    colorRulerBorder?: string;           // Default: "#000"
    colorSelectionArea?: string;         // Default: "rgba(0,0,0,0.3)"

    // Sources and Offsets
    backgroundSource?: string | null;    // Default: null
    cursorSource?: string;               // Default: "data:image/svg+xml;base64,..."
    cursorOffset?: number;               // Default: 0
    markStartSource?: string;            // Default: "data:image/svg+xml;base64,..."
    markStartOffset?: number;            // Default: 0
    markEndSource?: string;              // Default: "data:image/svg+xml;base64,..."
    markEndOffset?: number;              // Default: -24
    keyboardSource?: string;             // Default: "data:image/svg+xml;base64,..."
}

/*
    flags for drawing
    6 = draw 'C'
    2 = draw white key (F)
    1 = draw normal black key
*/
const halfTones = [6, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0];




export const PianoRoll: React.FC<PianoRollProps> = ({
    // Dimensions
    width = 84,
    height = 320,

    // Layout and Ranges
    pulsesPerQuarterNote: timeBase = 480,
    xRulerSize = 24,
    yRulerSize = 24,
    keyboardWidth = 80,
    maxRangeX = 480 * 4 * 8,

    // Editing and Interaction
    editMode = "dragpoly",
    gridQuantize = timeBase,
    defaultVelocity = 100,
    enabled = true,

    // Playback
    timeCursorPosition: cursorPosition = 0,
    markStart = 0,
    markEnd = 16,
    loop = 0,
    preload = 1.0,
    tempo = 120,

    // Colors
    colorLightKeys = "#ccc",
    colorDarkKeys = "#aaa",
    colorGridLines = "#666",
    colorGridSection = "#999",
    colorNote = "#f22",
    colorNoteSelected = "#0f0",
    colorNoteBorder = "#555",
    colorNoteSelectedBorder = "#fff",
    colorRulerBackground = "#666",
    colorRulerForeground = "#fff",
    colorRulerBorder = "#000",
    colorSelectionArea = "rgba(0,0,0,0.3)",

    // Sources and Offsets
    backgroundSource = null,
    cursorSource = "data:image/svg+xml;base64,...",
    cursorOffset = 0,
    markStartSource = "data:image/svg+xml;base64,...",
    markStartOffset = 0,
    markEndSource = "data:image/svg+xml;base64,...",
    markEndOffset = -24,
    keyboardSource = "data:image/svg+xml;base64,...",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keyboardRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const [dragging, setDragging] = React.useState<Dragging | null>(null);
    const [midiNotes, setMidiNotes] = React.useState<{}>();

    const [yRange, setYRange] = React.useState<number[]>([32, 44]);
    const [xRange, setXRange] = React.useState<number[]>([0, timeBase * 4 * 8]);
    const [selectionRect, setSelectionRect] = React.useState<number[] | null>(null);


    //redraw effect
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        const keyboardCtx = keyboardRef.current?.getContext('2d');
        if (!ctx || !keyboardCtx) return;

        ctx.clearRect(0, 0, width, height);
        keyboardCtx.clearRect(0, 0, keyboardWidth, height)

        console.log(midiNotes)
        drawGrid(ctx);
        drawKeyboard(keyboardCtx);


    }, [width, dragging, midiNotes, keyboardWidth, yRulerSize, xRange, yRange]);


    //redraw overlay effect (selection area, cursor)
    useEffect(() => {
        const ctx = overlayCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        document.addEventListener('mousemove', handleMouseMoveOnSequencer);
        document.addEventListener('mouseup', () => {
            setDragging(null);
            document.removeEventListener('mousemove', handleMouseMoveOnSequencer);
        });

        drawTimeCursor(ctx);
        drawSelectionArea(ctx);
    }, [cursorPosition, selectionRect, dragging]);


    const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
        const ySpan = yRange[1] - yRange[0]; // range from min to max note ( can be float )
        if (ySpan <= 0) return; // invalid range

        const stepHeight = height / ySpan;
        let pitch = Math.floor(yRange[1]) + 1

        ctx.globalAlpha = 1;
        const startY = -(Math.ceil(yRange[1]) - yRange[1]) * stepHeight; // start y coordinate for drawing grid ( can be negative if yRange[1] is not integer )
        for (let y = startY; pitch >= 0; y += stepHeight, pitch--) {
            const _y = Math.round(y);
            if (halfTones[(pitch) % 12] & 1) {
                ctx.fillStyle = colorDarkKeys;
            } else {
                ctx.fillStyle = colorLightKeys;
            }
            ctx.fillRect(0, _y, width, -stepHeight);
            ctx.fillStyle = colorGridLines;
            ctx.fillRect(0, _y, width, -1); //crisp lines

            ctx.globalAlpha = 1;
            drawNote(ctx, pitch, _y, stepHeight, xRange, midiNotes);
        }

        //draw vertical grid lines
        ctx.strokeStyle = "black";
        ctx.fillStyle = colorGridSection;

        const xSpan = xRange[1] - xRange[0];
        const startX = -(xRange[0] % (timeBase*4)) / xSpan * width; //Xcoord of the start of the first bar
        const stepWidth = width / (xSpan / timeBase);
        var bar = Math.floor(xRange[0] / (timeBase*4));
        var beat = 0;
        ctx.font = '20px Arial';
        for (let x = startX; x <= width; x += stepWidth) {
            if (beat % 4 === 0) {
                bar++;
            }
                
            if( (beat % 4 === 0)){
                ctx.globalAlpha = 1;
                ctx.fillStyle = colorGridSection;
                ctx.fillRect(x, 0, 1, height);
                ctx.fillText((bar).toString(), x + 5, 20);
            }
            if (bar % 4 === 3 || bar % 4 === 0) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = colorGridSection;
                ctx.fillRect(x, 0, stepWidth, height);
            }

            
            ctx.globalAlpha = 0.2;
            ctx.fillRect(Math.round(x), 0, 1, height);
            beat++;
        }



    }, [width, height, xRange, yRange, colorGridLines, midiNotes]);


    const drawNote = useCallback((ctx, pitch, y, stepHeight, rangeX, midiNotes) => {

        if (!midiNotes || !midiNotes[pitch]) return;
        const notes = midiNotes[pitch];

        notes.forEach((note: Note) => {
            const xStart = (note.time.start - xRange[0]) / (xRange[1] - xRange[0]) * width;
            const xEnd = (note.time.end - xRange[0]) / (xRange[1] - xRange[0]) * width;
            const noteHeight = Math.round(stepHeight)

            if (note.selected) {
                ctx.fillStyle = colorNoteSelected;
                ctx.strokeStyle = colorNoteSelectedBorder;
            } else {
                ctx.fillStyle = colorNote;
                ctx.strokeStyle = colorNoteBorder;
            }

            ctx.globalAlpha = 1;
            ctx.fillRect(xStart, y - 1, xEnd - xStart, -noteHeight + 1);
            ctx.strokeRect(xStart, y - 1, xEnd - xStart, -noteHeight + 1);

        })


    }, [
        width,
        height,
        xRange,
        yRange,
        colorNote,
        colorNoteSelected,
        colorNoteBorder,
        colorNoteSelectedBorder,
        midiNotes,

    ]);

    const drawKeyboard = useCallback((ctx) => {

        const ySpan = yRange[1] - yRange[0]; // Range from min to max note
        if (ySpan <= 0) return; // Invalid range

        const stepHeight = height / ySpan;
        let startNote = Math.floor(yRange[1]) + 1; // Start note for drawing keys
        const startY = -(Math.ceil(yRange[1]) - yRange[1]) * stepHeight; // Start Y coordinate for drawing keys

        for (let y = startY; y <= height + stepHeight; y += stepHeight, startNote--) {
            const halfTone = halfTones[(startNote) % 12];
            if (halfTone & 1) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, y, keyboardWidth / 2, -stepHeight);
                ctx.fillRect(0, Math.round(y - stepHeight / 2), keyboardWidth, -1);
            }
            if (halfTone & 2) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, Math.round(y), keyboardWidth, -1);
            }
            if (halfTone & 4) {
                ctx.fillStyle = colorDarkKeys
                ctx.font = '20px Arial';
                ctx.fillText('C', keyboardWidth - 25, y - 10);
            }

        }
    }, [height, yRange, keyboardWidth, halfTones, colorLightKeys, colorDarkKeys]);

    const drawTimeCursor = useCallback((ctx) => {

        const position = (cursorPosition - xRange[0]);
        ctx.fillStyle = colorNoteSelected;
        ctx.fillRect(position, 0, 1, height);
    }, [cursorPosition, xRange, yRulerSize, colorNoteSelected]);

    const drawSelectionArea = useCallback((ctx) => {
        if (!selectionRect) return;
        ctx.fillStyle = colorSelectionArea;
        ctx.fillRect(selectionRect[0], selectionRect[1], selectionRect[2], selectionRect[3]);
    }, [selectionRect]);

    const handleMouseDownOnSequencer = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relativeY = e.clientY - rect.top;
        const relativeX = e.clientX - rect.left;

        setDragging({
            action: "drag",
            start: [e.clientX, e.clientY],
            startTime: Date.now(),
            startNote: cursorPosition,
            startPos: [relativeX, relativeY],
        });


        
    };

    const handlDoubleClickOnSequencer = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const range = yRange[1] - yRange[0];
        var startTime = xRange[0] + x / width * (xRange[1] - xRange[0]);
        startTime = Math.floor(startTime / timeBase) * timeBase;
        const pitch = Math.floor(yRange[1] - y / height * range);

        setMidiNotes(prevMidiNotes => {
            const newMidiNotes = { ...prevMidiNotes };
            if (!newMidiNotes[pitch]) {
                newMidiNotes[pitch] = [];
            }
            newMidiNotes[pitch] = [
                ...newMidiNotes[pitch],
                { time: { start: startTime, end: startTime + timeBase }, selected: false, pitch: pitch }
            ];
            return newMidiNotes;
        });
    }

    const handleMouseMoveOnSequencer = (e: MouseEvent) => {


        if (!dragging || !dragging.startPos) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSelectionRect([dragging.startPos[0], dragging.startPos[1], x - dragging.startPos[0], y - dragging.startPos[1]]);

    }



    //drag left to increase yRange. drag right to decrease yRange
    const mouseDownOnKeyboard = (e: React.MouseEvent) => {

        document.addEventListener('mousemove', mouseMoveOnKeyboard);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', mouseMoveOnKeyboard);
        });
    }
    const mouseMoveOnKeyboard = (e: MouseEvent) => {
        let deltaX = e.movementX;
        let deltaY = e.movementY / 20;

        setYRange((yRange: number[]) => {
            deltaX = deltaX / 10;
            var top = yRange[0] + deltaX + deltaY;
            var bottom = yRange[1] - deltaX + deltaY;

            return [top < 0 ? 0 : top, bottom > 128 ? 128 : bottom];
        });


    }

    const mouseUpOnKeyboard = (e: React.MouseEvent) => {
        console.log('mouseUpOnKeyboard');
        document.removeEventListener('mousemove', mouseMoveOnKeyboard);
    }

    const handleMouseDownOnRuler = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        document.addEventListener('mousemove', mouseMoveOnRuler);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', mouseMoveOnRuler);
        });
    }

    const mouseMoveOnRuler = (e: MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const deltaX = e.movementX;
        const zoom = e.movementY * -10;

        setXRange((xRange: number[]) => {
            const span = xRange[1] - xRange[0];
            const newStart = -zoom + xRange[0] - deltaX / width * span;
            const newEnd = zoom + xRange[1] - deltaX / width * span;

            return [newStart >= 0 ? newStart : 0, newEnd + zoom];

        });

    }

    return (
        <div className='relative'>
            <div id="ruler" style={{ width: width + keyboardWidth, height: yRulerSize, backgroundColor: colorRulerBackground, color: colorRulerForeground, display: "flex" }} onMouseDown={handleMouseDownOnRuler}>
            </div>
            <div style={{ display: 'flex' }}>
                <canvas id="keyboard"
                    style={{ backgroundColor: "fff" }}
                    onMouseDown={mouseDownOnKeyboard}
                    onMouseUp={mouseUpOnKeyboard}
                    ref={keyboardRef}
                    width={keyboardWidth}
                    height={height}
                >
                </canvas>
                <div id="pianoroll-container" style={{ width: width, height: height }}>
                    <canvas className='absolute'
                        ref={canvasRef}
                        width={width}
                        height={height}
                        style={{ display: 'block' }}
                        onMouseDown={handleMouseDownOnSequencer}
                        data-testid="canvas"
                        data-midi-notes={JSON.stringify(midiNotes)}
                    >
                    </canvas>
                    <canvas className='absolute'
                        ref={overlayCanvasRef}
                        width={width}
                        height={height}
                        style={{ display: 'block' }}
                        onMouseDown={handleMouseDownOnSequencer}
                        onDoubleClick={handlDoubleClickOnSequencer}
                    ></canvas>

                </div>
            </div>
        </div >
    );
};

export default PianoRoll;