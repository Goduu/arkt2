"use client";

import Image from "next/image";
import { JSX } from "react";
import { buildFeatureId, FeaturesCarousel } from "@/components/home/features/FeaturesCarousel";
import { StartNowButton } from "@/components/home/StartNowButton";
import { features } from "@/components/home/features/featureList";
import { FeatureIcon } from "@/components/home/features/FeatureIcon";
import Link from "next/link";
import Footer from "../Footer";
import { useTheme } from "next-themes";
import { useMounted } from "../useMounted";


export default function HomeLanding(): JSX.Element {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();

    return (
            <div className="min-h-screen">
                {/* Hero */}
                <section className="container pt-12 md:pt-16 lg:pt-20">
                    <Link href="/" className="h-24 items-start flex">
                        {mounted && (
                            <Image src={`/logo-h-${resolvedTheme}.svg`} alt="ArkT" width={180} height={96} className="h-full" />
                        )}
                    </Link>
                </section >
                {/* Features */}
                <section id="features" className="container mt-12 md:mt-16" >
                    <div className="mb-6 flex items-end justify-between">
                        <h1 className="text-2xl font-semibold md:text-4xl">Features</h1>
                        <StartNowButton aria-label="start now" size="xs" />
                    </div>
                    <FeaturesCarousel withLink />
                </section >

                <div className="flex flex-col gap-12">
                    {features.map((f) => (
                        <section
                            key={f.id}
                            id={buildFeatureId(f.headline)}
                            className="relative flex flex-col gap-4 container mt-12 md:mt-16"
                        >
                            <div className="flex flex-col gap-1 z-10">
                                <h2 className="text-2xl font-semibold md:text-3xl">{f.headline}</h2>
                                <p className="text-sm opacity-80">{f.description}</p>
                            </div>
                            {f.text.map((t, index) => (
                                <p key={index} className="z-10">{t.value}</p>
                            ))}
                            <div className="absolute right-2 bottom-0 flex items-center gap-2 z-0 opacity-20">
                                <FeatureIcon
                                    icon={f.icon}
                                    iconSize={96}
                                    iconBgColor={f.iconBgColor} />
                            </div>
                        </section>
                    ))}
                    <div className="flex justify-center">
                        <StartNowButton aria-label="(features)" size="lg" />
                    </div>
                </div>
                <Footer />
            </div >
    );
}

