"use client"

import * as React from "react"
import { Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent, DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer"

export function ControlDrawer({ children }: { children: React.ReactNode }) {

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="absolute top-2 right-2">
                    <Edit />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Controls</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0 flex flex-col gap-2">
                        {children}
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
