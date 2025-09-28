import { cn } from "@/lib/utils";
import { SketchyPanel } from "../sketchy/SketchyPanel";
import { HomeSketch } from "./HomeSketch";
import { ReactFlowProvider } from "@xyflow/react";
import { HomeGithub } from "./HomeGithub";
import { HomeAskAi } from "./HomeAskAi";

export function Steps() {
    return (
        <section className="container mt-12 md:mt-16">
            <div className="grid grid-cols-1 gap-6">
                {steps.map((s, index) => (
                    <SketchyPanel key={s.step} className="p-5">
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-10 md:h-52 justify-between w-full">
                                <div className={cn("md:w-1/2", index % 2 === 0 ? "md:order-1" : "md:order-2")}>
                                    <div className="text-lg opacity-70">Step {s.step}</div>
                                    <h3 className="text-2xl font-semibold">{s.title}</h3>
                                    <p className="text-xl opacity-80">{s.copy}</p>
                                </div>
                                <div className={cn("md:w-1/2 mt-2 w-full md:h-32", index % 2 === 0 ? "md:order-2" : "md:order-1")}>
                                    {s.Component &&
                                        <SketchyPanel className="w-full">
                                            <ReactFlowProvider>
                                                {s.Component}
                                            </ReactFlowProvider>
                                        </SketchyPanel>
                                    }
                                </div>
                            </div>
                        </div>
                    </SketchyPanel>
                ))}
            </div>
        </section >
    )
}

const steps = [{
    step: 1,
    title: "Sketch your system",
    copy: "Create nodes and edges. Organize by domains and go multi‑level.",
    Component: <HomeSketch />,
}, {
    step: 2,
    title: "Link your code",
    copy: "Connect GitHub to browse files alongside your diagrams.",
    Component: <HomeGithub />,
}, {
    step: 3,
    title: "Ask about impact",
    copy: "Use ASK AI to explore change effects across your system and get suggestions.",
    Component: <HomeAskAi />
}]