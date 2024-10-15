import { ReactNode } from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TooltipWithTriggerProps {
    trigger: ReactNode;
    content: string;
}

const TooltipWithTrigger: React.FC<TooltipWithTriggerProps> = ({ trigger, content }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {trigger}
                </TooltipTrigger>
                <TooltipContent>
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default TooltipWithTrigger;
