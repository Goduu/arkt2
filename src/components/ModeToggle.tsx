"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function ModeToggle({ className }: { className?: string }) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={className} data-testid="mode-toggle">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                    Toggle theme
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" side="right">
                <DropdownMenuItem onClick={() => setTheme("light")} data-testid="mode-toggle-light">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} data-testid="mode-toggle-dark">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} data-testid="mode-toggle-system">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}
