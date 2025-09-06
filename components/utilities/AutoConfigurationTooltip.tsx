import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdAutoFixHigh } from "react-icons/md";

type AutoConfigurationTooltipProps = {
	parentContainer: string;
};

const AutoConfigurationTooltip = ({
	parentContainer,
}: AutoConfigurationTooltipProps) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<MdAutoFixHigh />
			</TooltipTrigger>
			<TooltipContent>
				This value is auto-picked from the {parentContainer}.
			</TooltipContent>
		</Tooltip>
	);
};

export default AutoConfigurationTooltip;
