import React, { useCallback, useEffect, useRef } from 'react';

type Dragging = {
    action: string,
    start: number[],
    current?: number[],
    startTime?: number,
    startNote?: number,
    startPos?: number[],
}

type Note = {
    grid: number,
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
    yRulerSize?: number;         // Default: 24
    keyboardWidth?: number;      // Default: 40

    // Layout and Ranges
    pulsesPerQuarterNote?: number;              // Default: 480
    _xRange?: number[];                // Default: 16
    _yRange?: number[];                // Default: 16

    // Editing and Interaction
    editMode?: "edit" | "snap" | "free";        // Default: "dragpoly"
    gridQuantize?: number;                      // Default: 4
    snapValue?: number;                         // Default: 1
    gridNoteRatio?: number;                     // Default: 0.5
    octaveAdjustment?: number;                  // Default: -1
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
    _xRange = [1.5, 40],
    _yRange = [60, 64],
    xRulerSize = 24,
    yRulerSize = 24,
    keyboardWidth = 80,

    // Editing and Interaction
    editMode = "dragpoly",
    snapValue = 1,
    gridNoteRatio = 0.5,
    octaveAdjustment = -1,
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
    const [midiNotes, setMidiNotes] = React.useState<{}>(
        {
            63: { time: { start: 3, end: 4 }, grid: 1, selected: false },
            62: { time: { start: 2, end: 3 }, grid: 1, selected: false },
            61: { time: { start: 1, end: 2 }, grid: 1, selected: false },
        }
    );

    const [yRange, setYRange] = React.useState<number[]>(_yRange);
    const [xRange, setXRange] = React.useState<number[]>(_xRange);
    const [selectionRect, setSelectionRect] = React.useState<number[] | null>(null);


    //redraw effect
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        const keyboardCtx = keyboardRef.current?.getContext('2d');
        if (!ctx || !keyboardCtx) return;

        ctx.clearRect(0, 0, width, height);
        keyboardCtx.clearRect(0, 0, keyboardWidth, height)

        drawGrid(ctx);
        drawKeyboard(keyboardCtx);


    }, [ width, dragging, midiNotes, keyboardWidth, yRulerSize, xRange,_xRange, yRange, _yRange]);


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

            drawNote(ctx, pitch, _y, stepHeight,xRange);
        }

        //draw vertical grid lines
        ctx.strokeStyle = "black";
        ctx.fillStyle = colorGridSection;
        var index = 0;
        var span
        for (let i = xRange[0]; i <= xRange[1]; i += timeBase) {
            if (index % 2 == 0) {
                ctx.globalAlpha = 0.4
            }
            else {
                ctx.globalAlpha = 0.25
            }
            ctx.fillRect(i, 0, i + timeBase, height);
            ctx.strokeRect(i, 0, i + timeBase, height);
            index++;
        }


    }, [width, height, xRange, yRange, colorGridLines]);


    const drawNote = useCallback((ctx, pitch, y, stepHeight,rangeX) => {
        const note = midiNotes[pitch];
        if (!note) return;

        const xStart = (note.time.start - xRange[0]) / (xRange[1] - xRange[0]) * width;
        const xEnd = (note.time.end - xRange[0]) / (xRange[1] - xRange[0]) * width;
        const noteHeight = Math.round(stepHeight * note.grid)

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
    }, [height, yRange, keyboardWidth, halfTones, colorLightKeys, colorDarkKeys, octaveAdjustment]);

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
        console.log('relativeX', relativeX);
        const pitch = Math.floor((height - relativeY) / (height / 128));
        const time = Math.floor((relativeX - yRulerSize - keyboardWidth) / (width / xRange[1] - xRange[0]));

        setDragging({
            action: "drag",
            start: [e.clientX, e.clientY],
            startTime: Date.now(),
            startNote: cursorPosition,
            startPos: [relativeX, relativeY],
        });


        setMidiNotes(prevMidiNotes => {
            const newMidiNotes = { ...prevMidiNotes };
            if (!newMidiNotes[pitch]) {
                newMidiNotes[pitch] = [];
            }
            newMidiNotes[pitch] = [
                ...newMidiNotes[pitch],
                { time: { start: time, end: time + 1 }, grid: 1, selected: false, pitch: pitch }
            ];
            return newMidiNotes;
        });
    };

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

    return (
        <div className='relative'>
            <div id="ruler" style={{ width: width + keyboardWidth, height: yRulerSize, backgroundColor: colorRulerBackground, color: colorRulerForeground, display: "flex" }}>
                <div style={{ width: keyboardWidth, height: yRulerSize, backgroundColor: colorRulerBackground, color: colorRulerForeground, borderRight: `1px solid ${colorRulerForeground}` }}></div>
                <div style={{ width: "100%", height: yRulerSize, backgroundColor: colorRulerBackground, color: colorRulerForeground, display: "flex", flex: 1 }}>
                    <div style={{ flex: 1, borderLeft: `1px solid ${colorRulerForeground}` }}></div>
                    <div style={{ flex: 1, borderLeft: `1px solid ${colorRulerForeground}` }}></div>
                    <div style={{ flex: 1, borderLeft: `1px solid ${colorRulerForeground}` }}></div>
                    <div style={{ flex: 1, borderLeft: `1px solid ${colorRulerForeground}` }}></div>
                </div>

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
                    ></canvas>

                </div>
            </div>
        </div >
    );
};

export default PianoRoll;