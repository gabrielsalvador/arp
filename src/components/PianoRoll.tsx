import React, { useCallback, useEffect, useRef } from 'react'; 

// Define the props interface (same as before)
interface PianoRollProps {
    // Dimensions
    width?: number;              // Default: 840
    height?: number;             // Default: 320

    // Layout and Ranges
    timeBase?: number;           // Default: 480
    xRange?: number;             // Default: 16
    yRange?: number;             // Default: 16
    xOffset?: number;            // Default: 0
    yOffset?: number;            // Default: 60
    xScroll?: number;            // Default: 0
    yScroll?: number;            // Default: 0
    xRulerSize?: number;         // Default: 24
    yRulerSize?: number;         // Default: 24
    keyboardWidth?: number;      // Default: 40

    // Editing and Interaction
    editMode?: "edit" | "create"  ;             // Default: "dragpoly"
    gridSize?: number;                          // Default: 4
    snapValue?: number;                         // Default: 1
    wheelZoom?: number;                         // Default: 0
    wheelZoomX?: number;                        // Default: 0
    wheelZoomY?: number;                        // Default: 0
    gridNoteRatio?: number;                     // Default: 0.5
    octaveAdjustment?: number;                  // Default: -1
    defaultVelocity?: number;                   // Default: 100
    enabled?: boolean;                          // Default: true

    // Playback
    cursorPosition?: number;     // Default: 0
    markStart?: number;          // Default: 0
    markEnd?: number;            // Default: 16
    loop?: number;               // Default: 0
    preload?: number;            // Default: 1.0
    tempo?: number;              // Default: 120

    // Colors
    colorLightKeys?: string;             // Default: "#ccc"
    colorDarkKeys?: string;              // Default: "#aaa"
    colorGridLines?: string;             // Default: "#666"
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

const halfTones = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];


const PianoRoll: React.FC<PianoRollProps> = ({
    // Dimensions
    width = 840,
    height = 320,

    // Layout and Ranges
    timeBase = 480,
    xRange = 16,
    yRange = 16,
    xOffset = 0,
    yOffset = 60,
    xScroll = 0,
    yScroll = 0,
    xRulerSize = 24,
    yRulerSize = 24,
    keyboardWidth = 40,

    // Editing and Interaction
    editMode = "dragpoly",
    gridSize = 4,
    snapValue = 1,
    wheelZoom = 0,
    wheelZoomX = 0,
    wheelZoomY = 0,
    gridNoteRatio = 0.5,
    octaveAdjustment = -1,
    defaultVelocity = 100,
    enabled = true,

    // Playback
    cursorPosition = 0,
    markStart = 0,
    markEnd = 16,
    loop = 0,
    preload = 1.0,
    tempo = 120,

    // Colors
    colorLightKeys = "#ccc",
    colorDarkKeys = "#aaa",
    colorGridLines = "#666",
    colorNote = "#f22",
    colorNoteSelected = "#0f0",
    colorNoteBorder = "#000",
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

    useEffect(() => {

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        drawGrid(ctx,20);
        drawCursor(ctx,20);

        console.log("PianoRoll rendered");
    }, [cursorPosition,width]);
    

    const drawGrid = useCallback((ctx, step_y) => {
        
        for(let y = 0; y < 128; y++) {
            if(halfTones[y % 12] === 0) {
                ctx.fillStyle = colorLightKeys;
            } else {
                ctx.fillStyle = colorDarkKeys;
            }
            //draw horizontal lines
            let Y = height - (y - yOffset) * step_y
            ctx.fillRect(0, Y, width, step_y);
            ctx.fillStyle = colorGridLines;
            ctx.fillRect(0, Y, width, 1);

        }        

    }, [width, height, colorLightKeys, colorDarkKeys,,colorGridLines,yOffset]);

    const drawNotes = useCallback((ctx, notes) => {

    }, []);


    const drawCursor = useCallback((ctx,step_x) => {
        const position = (cursorPosition - xOffset) * step_x + yRulerSize + keyboardWidth;
        ctx.fillStyle = colorNoteSelected;
        ctx.fillRect(position, 0, 1, height);
    }, [cursorPosition, xOffset, yRulerSize, keyboardWidth, colorNoteSelected]);
       
    
    return (
        <>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ display: 'block' }}
            >
                

            </canvas>
        </>
    );
};

export default PianoRoll;