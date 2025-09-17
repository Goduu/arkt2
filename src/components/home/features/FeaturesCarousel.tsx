import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ArrowUpRight, Link } from "lucide-react";
import { features } from "./featureList";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { FeatureIcon } from "./FeatureIcon";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";

type FeaturesCarouselProps = {
    withLink?: boolean
}

export function FeaturesCarousel({ withLink = false }: FeaturesCarouselProps) {

    // https://www.embla-carousel.com/api/options/
    const options = {
        loop: true,
    }

    return (
        <Carousel
            opts={options}
            plugins={[
                Autoplay({
                    delay: 4000,
                }),
            ]}
        >
            <CarouselContent>
                {features.map((f) => (
                    <CarouselItem key={f.id} className="group md:basis-1/2 lg:basis-1/3 select-none">
                        <SketchyPanel key={f.id} className="group p-5 h-full" hoverEffect>
                            <div className="hidden md:flex absolute top-0 right-0 items-center gap-3">
                                <FeatureIcon icon={f.icon} className="group-hover:scale-110 transition-transform duration-200" iconBgColor={f.iconBgColor} />
                            </div>
                            <div className="flex h-full flex-col gap-3">
                                <h4 className="text-xs uppercase tracking-widest opacity-70">{f.tag}</h4>
                                <h3 className="text-lg font-semibold md:text-xl">{f.headline}</h3>
                                <p className="text-sm opacity-80">{f.description}</p>
                                <div className="mt-auto flex items-center gap-3 pt-1 justify-between h-full">
                                    {f.cta ? (
                                        <Link href={f.cta.href}>
                                            <Button size="sm" aria-label={f.cta.label}>{f.cta.label}</Button>
                                        </Link>
                                    ) : null}
                                    {withLink ? (
                                        <a
                                            href={`/features#${buildFeatureId(f.headline)}`}
                                            className="w-full sm:w-auto">
                                            <Button size="sm" aria-label={f.headline}>
                                                <ArrowUpRight className="size-4" />
                                            </Button>
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </SketchyPanel>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}


export const buildFeatureId = (headline: string) => headline.replaceAll(".", "").toLowerCase().split(" ").join("-")
