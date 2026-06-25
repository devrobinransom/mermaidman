'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CanvasRevealEffect, cn } from '@frappe-ui/neobrutalism'
import { Award, Sparkles, Check, MousePointerClick } from 'lucide-react'

interface DealStatusScratchCardProps {
    currentStatus: string
    nextStatus: string
    value: string
    onReveal?: () => void
}

export const DealStatusScratchCard = ({
    currentStatus,
    nextStatus,
    value,
    onReveal,
}: DealStatusScratchCardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)
    const lastCheckTime = useRef<number>(0)

    // Accessibility: Allow focusing and enter key to reveal
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            reveal()
        }
    }

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        // Explicitly set memory size to match render size * DPI
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr

        // Scale all drawing operations by dpr
        ctx.scale(dpr, dpr)

        // Silver Foil Texture
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
        gradient.addColorStop(0, '#D1D5DB')
        gradient.addColorStop(0.5, '#9CA3AF')
        gradient.addColorStop(1, '#D1D5DB')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, rect.width, rect.height)

        // Add explicit noise for texture
        ctx.fillStyle = '#4B5563'
        for (let i = 0; i < 2000; i++) {
            ctx.fillRect(
                Math.random() * rect.width,
                Math.random() * rect.height,
                Math.random() * 2,
                Math.random() * 2
            )
        }

        // Status Text Stamped on Top
        ctx.font = '900 28px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.save()
        ctx.translate(rect.width / 2, rect.height / 2)
        ctx.rotate(-0.08) // Slight jaunty angle

        // Shadow for depth
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.fillText(currentStatus.toUpperCase(), 2, 2)

        // Main text
        ctx.fillStyle = '#374151'
        ctx.fillText(currentStatus.toUpperCase(), 0, 0)

        // Subtitle
        ctx.font = '600 14px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#6B7280'
        ctx.fillText('SCRATCH TO REVEAL', 0, 30)

        ctx.restore()
    }, [currentStatus])

    useEffect(() => {
        // Initial setup
        initCanvas()

        // Use ResizeObserver for robust sizing
        const container = canvasRef.current?.parentElement
        if (!container) return

        const resizeObserver = new ResizeObserver(() => {
            initCanvas()
        })

        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
        }
    }, [initCanvas])

    const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
        if (isRevealed) return
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

        const x = clientX - rect.left
        const y = clientY - rect.top

        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (lastPoint.current) {
            // Calculate speed for dynamic line width
            const dx = x - lastPoint.current.x
            const dy = y - lastPoint.current.y
            const speed = Math.sqrt(dx * dx + dy * dy)
            const lineWidth = Math.max(30, Math.min(60, speed * 2)) // Faster = wider scratch

            ctx.lineWidth = lineWidth
            ctx.beginPath()
            ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
            ctx.lineTo(x, y)
            ctx.stroke()
        } else {
            ctx.beginPath()
            ctx.arc(x, y, 20, 0, Math.PI * 2)
            ctx.fill()
        }

        lastPoint.current = { x, y }

        // Throttle the expensive pixel check
        const now = Date.now()
        if (now - lastCheckTime.current > 200) { // Check every 200ms
            checkRevealProgress()
            lastCheckTime.current = now
        }
    }

    const checkRevealProgress = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Sample pixels (optimization: check 10% of pixels)
        const w = canvas.width
        const h = canvas.height
        const imageData = ctx.getImageData(0, 0, w, h)
        const pixels = imageData.data
        let transparentPixels = 0
        // Check every 32nd pixel (stride of 8 = 32 bytes) for extreme performance
        const stride = 32

        for (let i = 3; i < pixels.length; i += stride) {
            if (pixels[i] === 0) transparentPixels++
        }

        const totalSampled = pixels.length / stride

        if (transparentPixels / totalSampled > 0.4) { // 40% cleared
            reveal()
        }
    }

    const reveal = () => {
        if (isRevealed) return
        setIsRevealed(true)
        if (onReveal) onReveal()
    }

    const stopScratching = () => {
        lastPoint.current = null
    }

    return (
        <div
            className="relative h-[300px] w-full max-w-md overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white group focus-within:ring-4 focus-within:ring-purple-500 focus-within:ring-offset-4"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Scratch card. Rub to reveal deal status."
        >

            {/* 
        Layer 1: The Prize (Holographic Reveal) 
        We use CanvasRevealEffect BEHIND the content but clearly visible when scratched
      */}
            <div className="absolute inset-0">
                <CanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-black"
                    colors={[
                        [168, 85, 247], // Purple
                        [236, 72, 153], // Pink
                    ]}
                    opacities={[0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1]}
                    dotSize={2}
                />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="bg-white/95 p-8 rounded-xl border-3 border-black shadow-lg backdrop-blur-md">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500 text-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Award size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-black text-purple-600 tracking-tight">
                        {nextStatus}
                    </h2>
                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        {value}
                    </p>

                    <AnimatePresence>
                        {isRevealed && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                                className="mt-6 flex justify-center"
                            >
                                <span className="inline-flex items-center rounded-full border-2 border-black bg-green-400 px-4 py-1 text-sm font-bold text-black">
                                    <Check size={16} className="mr-2" />
                                    DEAL SECURED
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Confetti / Sparkles Overlay when revealed - The "Joy" Layer */}
                {isRevealed && (
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Using CSS grid for distributed sparkles instead of a single icon */}
                            <div className="absolute top-10 left-10"><Sparkles className="text-yellow-400 animate-pulse" size={40} /></div>
                            <div className="absolute bottom-20 right-10"><Sparkles className="text-pink-400 animate-bounce" size={30} /></div>
                            <div className="absolute top-1/2 right-1/4"><Sparkles className="text-cyan-400 animate-pulse" size={50} /></div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Layer 2: The Scratch Surface */}
            <AnimatePresence>
                {!isRevealed && (
                    <motion.canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: '100%' }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.8 } }}
                        className="absolute inset-0 z-20 cursor-crosshair touch-none"
                        onMouseMove={handleScratch}
                        onTouchMove={handleScratch}
                        onMouseLeave={stopScratching}
                        onMouseUp={stopScratching}
                        onTouchEnd={stopScratching}
                    />
                )}
            </AnimatePresence>

            {/* Accessibility Hint / Fallback Trigger */}
            {!isRevealed && (
                <div className="absolute bottom-4 right-4 z-30 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button
                        onClick={reveal}
                        className="flex items-center gap-2 rounded-lg bg-black/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-black"
                    >
                        <MousePointerClick size={12} />
                        Quick Reveal
                    </button>
                </div>
            )}
        </div>
    )
}
