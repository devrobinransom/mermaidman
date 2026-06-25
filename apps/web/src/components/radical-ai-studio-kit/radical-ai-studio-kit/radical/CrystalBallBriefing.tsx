'use client';

import React from 'react';
import { CardBody, CardContainer, CardItem } from '@frappe-ui/neobrutalism';
import { SparklesCore } from '@frappe-ui/neobrutalism';
import Link from 'next/link';
import { IconArrowRight, IconTrendingUp, IconActivity, IconBrain } from '@tabler/icons-react';

interface CrystalBallBriefingProps {
    dealName: string;
    winProbability: number;
    sentiment: "Excited" | "Neutral" | "Concerned";
    engagement: "High" | "Medium" | "Low";
}

export function CrystalBallBriefing({
    dealName = "TechCorp Deal",
    winProbability = 85,
    sentiment = "Excited",
    engagement = "High"
}: CrystalBallBriefingProps) {
    return (
        <CardContainer className="inter-var">
            <CardBody className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black relative group/card  dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.1] border-black/[0.1] w-auto sm:w-[32rem] h-auto rounded-xl p-8 border  ">

                {/* Magic Background Effect */}
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20 group-hover/card:opacity-40 transition-opacity">
                    <SparklesCore
                        minSize={0.5}
                        maxSize={2}
                        particleDensity={100}
                        className="w-full h-full"
                        background="transparent"
                        particleColor="#a855f7" // Purple magic
                    />
                </div>

                {/* Floating Header */}
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full text-purple-300 border border-white/5">
                            <IconBrain size={18} />
                        </div>
                        <span className="tracking-tight drop-shadow-glow">Crystal Ball Insight</span>
                    </div>
                </CardItem>

                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                    Predicting outcome for <span className="font-bold text-white">{dealName}</span>
                </CardItem>

                {/* The Central "Orb" Prediction */}
                <CardItem translateZ="100" className="w-full mt-8 mb-8 flex items-center justify-center relative">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Holographic Scanlines Overlay */}
                        <div className="absolute inset-0 z-20 rounded-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

                        {/* Complex Glowing Rings */}
                        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-indigo-400/20 border-t-transparent animate-[spin_8s_linear_infinite_reverse]" />
                        <div className="absolute inset-6 rounded-full border-2 border-dashed border-white/10 animate-[spin_12s_linear_infinite]" />

                        {/* Core Glow */}
                        <div className="absolute inset-8 rounded-full bg-purple-600 opacity-40 blur-3xl animate-pulse"></div>
                        <div className="absolute inset-10 rounded-full bg-indigo-500 opacity-30 blur-2xl"></div>

                        {/* Score */}
                        <div className="z-30 text-center relative">
                            <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] tracking-tighter">
                                {winProbability}%
                            </div>
                            <div className="text-[10px] font-bold text-purple-200 uppercase tracking-[0.2em] mt-2 border-t border-purple-500/30 pt-1">
                                Win Probability
                            </div>
                        </div>
                    </div>
                </CardItem>

                {/* Floating Insights */}
                <div className="flex justify-between items-center mt-4 gap-4">
                    <CardItem
                        translateZ={40}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold text-white flex-1"
                    >
                        <div className="text-emerald-400 mb-1 flex items-center gap-1"><IconTrendingUp size={12} /> Momentum</div>
                        {engagement} Engagement
                    </CardItem>
                    <CardItem
                        translateZ={40}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold text-white flex-1"
                    >
                        <div className="text-orange-400 mb-1 flex items-center gap-1"><IconActivity size={12} /> Sentiment</div>
                        {sentiment}
                    </CardItem>
                </div>

                {/* Action Button */}
                <div className="flex justify-between items-center mt-8">
                    <CardItem
                        translateZ={20}
                        as={Link}
                        href="#"
                        target="__blank"
                        className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                    >
                        View raw data →
                    </CardItem>
                    <CardItem
                        translateZ={20}
                        as="button"
                        className="px-4 py-2 rounded-xl bg-white dark:bg-white dark:text-black text-black text-xs font-bold flex items-center gap-1 hover:bg-neutral-200 transition-colors"
                    >
                        Nudge to Close <IconArrowRight size={14} />
                    </CardItem>
                </div>
            </CardBody>
        </CardContainer>
    );
}
