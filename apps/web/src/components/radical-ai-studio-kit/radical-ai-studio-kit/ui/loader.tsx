"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type LoaderVariant = "speeder" | "hand" | "noodle";

type LoaderCycleMode = "random" | "sequential";

const DEFAULT_VARIANTS: LoaderVariant[] = ["speeder", "hand", "noodle"];

const pickNextVariant = (
    variants: LoaderVariant[],
    current: LoaderVariant,
    mode: LoaderCycleMode,
) => {
    if (variants.length === 0) {
        return current;
    }
    if (variants.length === 1) {
        return variants[0];
    }
    if (mode === "sequential") {
        const index = variants.indexOf(current);
        const nextIndex = index === -1 ? 0 : (index + 1) % variants.length;
        return variants[nextIndex];
    }
    let next = current;
    while (next === current) {
        next = variants[Math.floor(Math.random() * variants.length)];
    }
    return next;
};

export const Loader = ({
    variant = "speeder",
    variants = DEFAULT_VARIANTS,
    cycle = false,
    cycleIntervalMs = 2600,
    cycleMode = "random",
    scale = 1,
    className,
    label = "Loading",
}: {
    variant?: LoaderVariant;
    variants?: LoaderVariant[];
    cycle?: boolean;
    cycleIntervalMs?: number;
    cycleMode?: LoaderCycleMode;
    scale?: number;
    className?: string;
    label?: string;
}) => {
    const normalizedVariants = useMemo(() => {
        const unique = Array.from(
            new Set(variants.length ? variants : [variant]),
        );
        return unique.length ? unique : [variant];
    }, [variant, variants]);

    const [activeVariant, setActiveVariant] = useState<LoaderVariant>(variant);

    useEffect(() => {
        setActiveVariant(variant);
    }, [variant]);

    useEffect(() => {
        if (!cycle) return;
        const interval = setInterval(() => {
            setActiveVariant((current) =>
                pickNextVariant(normalizedVariants, current, cycleMode),
            );
        }, cycleIntervalMs);
        return () => clearInterval(interval);
    }, [cycle, cycleIntervalMs, cycleMode, normalizedVariants]);

    return (
        <div
            className={cn("ui-loader", `ui-loader--${activeVariant}`, className)}
            style={
                {
                    ["--ui-loader-scale" as string]: Math.max(0.1, scale),
                } as React.CSSProperties
            }
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <span className="sr-only">{label}</span>
            {activeVariant === "speeder" && <SpeederLoader />}
            {activeVariant === "hand" && <HandLoader />}
            {activeVariant === "noodle" && <NoodleLoader />}
        </div>
    );
};

export const SpeederLoader = () => (
    <div className="ui-speeder">
        <div className="ui-speeder__body">
            <span className="ui-speeder__handle">
                <span />
                <span />
                <span />
                <span />
            </span>
            <div className="ui-speeder__base">
                <span />
                <div className="ui-speeder__face" />
            </div>
        </div>
        <div className="ui-speeder__longfazers">
            <span />
            <span />
            <span />
            <span />
        </div>
    </div>
);

export const HandLoader = () => (
    <div className="ui-hand">
        <div className="ui-hand__finger" />
        <div className="ui-hand__finger" />
        <div className="ui-hand__finger" />
        <div className="ui-hand__finger" />
        <div className="ui-hand__palm" />
        <div className="ui-hand__thumb" />
    </div>
);

export const NoodleLoader = () => (
    <div className="ui-noodle">
        <div className="ui-noodle-frame">
            <div className="ui-noodle-scene1">
                <div className="ui-noodle-boy">
                    <div className="ui-noodle-boy-head">
                        <div className="ui-noodle-boy-hair" />
                        <div className="ui-noodle-boy-eyes" />
                        <div className="ui-noodle-boy-mouth" />
                        <div className="ui-noodle-boy-cheeks" />
                    </div>
                    <div className="ui-noodle-noodle" />
                    <div className="ui-noodle-boy-left-arm">
                        <div className="ui-noodle-chopsticks" />
                    </div>
                </div>
                <div className="ui-noodle-plate" />
                <div className="ui-noodle-right-arm" />
            </div>
            <div className="ui-noodle-scene2">5 minutes later</div>
        </div>
    </div>
);
