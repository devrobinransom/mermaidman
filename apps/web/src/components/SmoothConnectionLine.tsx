import React from 'react';
import { getBezierPath, type ConnectionLineComponentProps } from 'reactflow';

/**
 * Apple-smooth connector preview shown while dragging from a handle.
 * A soft bezier with a glowing endpoint dot — FigJam-style affordance.
 */
export function SmoothConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
    fromPosition,
    toPosition,
}: ConnectionLineComponentProps) {
    const [path] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
    });

    return (
        <g>
            <path
                d={path}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={2}
                strokeLinecap="round"
                className="mm-connection-line"
            />
            <circle
                cx={toX}
                cy={toY}
                r={4}
                fill="var(--color-primary)"
                stroke="#ffffff"
                strokeWidth={1.5}
            />
        </g>
    );
}
