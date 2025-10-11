import { Handle } from "@xyflow/react"
import { HandleType, Position } from "@xyflow/system"
import { FC } from "react"

type NodeHandlerProps = {
    id: string
    'data-testid'?: string
    position: Position
    type: HandleType
}

export const NodeHandler: FC<NodeHandlerProps> = ({ id, 'data-testid': dataTestId, position, type }) => {
    return (
        <Handle
            data-testid={dataTestId || `handler-${position}`}
            type={type}
            position={position}
            id={`${id}-${position}`}
            className="opacity-90 group-hover:opacity-100 md:opacity-5 hover:scale-150 transition-all duration-300"
        />
    )
}