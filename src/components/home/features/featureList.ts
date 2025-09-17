import { Feature } from "./types";

export const features: Feature[] = [
    {
        id: "free",
        tag: "Free to use",
        headline: "All the power. Zero price.",
        description: "Start building instantly—no credit card, no trial limits. Create, explore, and share freely.",
        text: [
            {
                type: "string",
                value: "We believe great tools should be free and accessible to everyone. That’s why ArkT is built with a minimal approach, allowing us to offer a powerful diagramming tool at no cost. There are no hidden fees, no paywalls, and no surprises—just pure creative freedom."
            },
            {
                type: "string",
                value: "By keeping our platform lightweight, we can focus on what matters most: empowering you to visualize, organize, and share your ideas without barriers. Whether you're a student, a professional, or a hobbyist, ArkT is here for you—free, forever."
            },
            {
                type: "string",
                value: "To enable the powerful 'Ask AI' feature, you can choose to enter your own OpenAI API key. This gives you full control and ensures your usage is tied directly to your account."
            }
        ],
        icon: "hand-coins",
        iconBgColor: "emerald"
    },
    {
        id: "multilevel",
        tag: "Multi‑level diagrams",
        headline: "Go deep without getting lost.",
        description: "Drill into infinite layers to model systems from bird’s‑eye to bolt‑level detail.",
        text: [
            {
                type: "string",
                value: "Complex systems demand more than a surface-level view. With ArkT’s multi-level diagrams, you can zoom in and out, exploring every layer of your project without losing context. Our efficient, minimal design ensures smooth navigation and fast performance, even as your diagrams grow."
            },
            {
                type: "string",
                value: "Model everything from high-level architectures to the smallest components, all in one place. ArkT keeps your work organized and easy to navigate so you can focus on understanding and communicating complexity—not getting bogged down."
            }
        ],
        icon: "layers",
        iconBgColor: "pink"
    },
    {
        id: "templates",
        tag: "Custom templates",
        headline: "Make it look like your system.",
        description: "Tailor shapes, icons, styles, and defaults so every diagram speaks your language.",
        text: [
            {
                type: "string",
                value: "Every team and project has its own way of doing things. With ArkT’s custom templates, you can create diagrams that fit your specific workflows and standards. Our lightweight approach lets you quickly adapt templates to your needs without waiting for heavy updates or wrestling with complicated settings."
            },
            {
                type: "string",
                value: "Personalize your workspace, save your favorite styles, and ensure consistency across your diagrams. ArkT gives you the flexibility to make every project truly yours."
            }
        ],
        icon: "notepad-text-dashed",
        iconBgColor: "teal"
    },
    {
        id: "palette",
        tag: "Command palette (⌘/Ctrl + K)",
        headline: "Command as an artist.",
        description: "Create nodes, search, jump, and edit—one shortcut that keeps you in flow.",
        text: [
            {
                type: "string",
                value: "Speed and focus are key for creative work. ArkT’s command palette puts every action at your fingertips, letting you build, edit, and navigate with a single shortcut. Our minimal design ensures the palette is always fast and responsive, so you never lose momentum."
            },
            {
                type: "string",
                value: "Stay in your creative zone—no menus, no clutter, just instant access to the tools you need."
            }
        ],
        icon: "terminal",
        iconBgColor: "purple"
    },
    {
        id: "virtual",
        tag: "Virtual links",
        headline: "Connect the dots across diagrams.",
        description: "Reference nodes anywhere to show relationships without duplicating work.",
        text: [
            {
                type: "string",
                value: "Systems don't exist in a vacuum, and neither should your diagrams. With ArkT’s virtual links, you can connect ideas and components across different diagrams, making relationships clear without the extra work. Our streamlined backend makes these connections seamless and reliable."
            },
            {
                type: "string",
                value: "This feature empowers you to build a true network of knowledge, keeping everything connected and up to date—without redundancy."
            }
        ],
        icon: "link",
        iconBgColor: "orange"
    },
    {
        id: "github",
        tag: "GitHub integration",
        headline: "Bring your code into the picture.",
        description: "Browse files: Keep architecture, decisions, and code side‑by‑side.",
        text: [
            {
                type: "string",
                value: "ArkT bridges the gap between diagrams and code with direct GitHub integration. You can browse repositories, link code files, and keep your documentation and architecture in sync. Our minimal design ensures this integration is fast and secure, without any unnecessary overhead."
            },
            {
                type: "string",
                value: "Now, developers and teams can visualize their systems and codebase together, making collaboration and decision-making easier than ever."
            }
        ],
        icon: "github",
        iconBgColor: "indigo"
    },
    {
        id: "export",
        tag: "Import / Export",
        headline: "Own your data. Move freely.",
        description: "Export your work to save progress and import later—no lock‑in, no surprises.",
        text: [
            {
                type: "string",
                value: "Your diagrams belong to you. ArkT’s import/export feature lets you back up, share, and migrate your work with ease. Because our platform is built to be lightweight and open, there’s no vendor lock-in or complicated export processes."
            },
            {
                type: "string",
                value: "Move your data wherever you need it—your creativity and information are always in your hands."
            }
        ],
        icon: "upload",
        iconBgColor: "gray"
    },
    {
        id: "ai",
        tag: "ASK AI — Change management",
        headline: "Anticipate impact before it hits prod.",
        description: "Ask how a change ripples across systems. Spot risk and hidden dependencies early.",
        text: [
            {
                type: "string",
                value: "Change is constant, but surprises don't have to be. With ArkT’s AI-powered change management, you can simulate the impact of changes before they go live. Our efficient design means AI insights are delivered quickly, helping you identify risks and dependencies in real time."
            },
            {
                type: "string",
                value: "Stay ahead of issues, make informed decisions, and keep your systems resilient with the power of AI—built right into your diagramming workflow."
            }
        ],
        icon: "bot",
        iconBgColor: "lime"
    },
    {
        id: "privacy",
        tag: "Local‑first privacy",
        headline: "Your data stays in your browser.",
        description: "Nothing leaves your device unless you export it. Simple, private, and safe.",
        text: [
            {
                type: "string",
                value: "Privacy is a core value at ArkT. By adopting a local-first approach, we ensure your data never leaves your device unless you choose to share it. Our minimal design means there are no unnecessary servers or third-party storage—just you and your work."
            },
            {
                type: "string",
                value: "Enjoy peace of mind knowing your information is private, secure, and fully under your control."
            }
        ],
        icon: "globe-lock",
        iconBgColor: "blue"
    }
];