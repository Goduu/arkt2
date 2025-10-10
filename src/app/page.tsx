"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { JSX } from "react";
import { FeaturesCarousel } from "@/components/home/features/FeaturesCarousel";
import { StartNowButton } from "@/components/home/StartNowButton";
import { Shield } from "lucide-react";
import Footer from "./Footer";
import { Steps } from "@/components/home/Steps";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ModeToggle";
import { useMounted } from "./useMounted";
import { HomeExample } from "@/components/home/HomeExample";
import { ReactFlowProvider } from "@xyflow/react";
import GithubFileDialog from "@/components/controls/node-controls/GithubFileDialog";
import DotGrid from "@/components/ui/dot-grid";
import Link from "next/link";

export default function HomeLanding(): JSX.Element {
    const { resolvedTheme, theme } = useTheme();
    const mounted = useMounted();

    return (
        <>
            <div className="min-h-screen w-full flex flex-col items-center">
                {/* Hero */}
                <div className="w-screen h-screen fixed top-0 left-0 -z-10">
                    <DotGrid
                        dotSize={1.5}
                        gap={30}
                        baseColor="#435164"
                        activeColor="#aaa"
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={0.5}
                    />
                </div>
                <ModeToggle className="absolute top-4 right-4" />
                <section className="container pt-12 md:pt-16 lg:pt-20 w-full max-w-9xl">
                    <div className="h-52 items-start flex">
                        {mounted && resolvedTheme && (
                            <Image src={`/logo-h-${resolvedTheme || theme}.svg`} alt="ArkT" width={550} height={208} className="h-full" />
                        )}
                    </div>
                    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                        <div className="flex flex-col gap-5">
                            <SketchyPanel className="p-5">
                                <div className="flex flex-col gap-4 py-1">
                                    <p className="text-xs uppercase tracking-widest opacity-70">
                                        Sketch your architecture. Think in systems.
                                    </p>
                                    <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                                        Your ArkTect for multi-level system diagrams
                                    </h1>
                                    <p className="text-sm md:text-base text-accent-foreground">
                                        Map complex architectures, explore deep links, and reason about change—fast.
                                    </p>
                                    <div className="flex gap-3 sm:flex-row">
                                        <StartNowButton aria-label="(top CTA)" />
                                        <Link href="#features" className="w-full sm:w-auto">
                                            <Button variant="outline" className="sm:w-auto" aria-label="See features">
                                                See features
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SketchyPanel>
                        </div>
                        <div className="relative">
                            <SketchyPanel className="w-full">
                                <div className="flex h-full items-center justify-center p-2">
                                    <ReactFlowProvider>
                                        <HomeExample />
                                    </ReactFlowProvider>
                                </div>
                            </SketchyPanel>
                        </div>
                    </div>
                </section>

                {/* Trust/Privacy Ribbon */}
                <section className="container mt-10 w-full max-w-9xl">
                    <SketchyPanel className="p-4">
                        <p className="group text-center text-xs md:text-base flex items-center justify-center gap-2">
                            <Shield className="hidden md:block size-4 group-hover:scale-150 transition-transform duration-300" />
                            <span className="font-semibold">Local‑first:</span> your data is stored in your browser. Export anytime to keep full control.
                        </p>
                    </SketchyPanel>
                </section>

                {/* Features */}
                <section id="features" className="container mt-12 md:mt-16 w-full max-w-9xl">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-semibold md:text-3xl">Why builders love ArkT</h2>
                        <StartNowButton aria-label="(features)" />
                    </div>
                    <FeaturesCarousel />
                </section>

                {/* How it works */}
                <Steps />

                {/* CTA Banner */}
                <section className="container my-12 md:my-16 w-full max-w-9xl">
                    <SketchyPanel className="p-6">
                        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left overflow-hidden h-36 md:h-full">
                            <div>
                                <h3 className="text-xl font-semibold md:text-2xl">Build your first diagram in minutes</h3>
                                <p className="text-sm opacity-80">Stay fast, stay focused, stay in control.</p>
                            </div>
                            <StartNowButton aria-label="(bottom CTA)" />
                        </div>
                    </SketchyPanel>
                </section>
                <Footer />
            </div >
            <GithubFileDialog />
        </>

    );
}


