import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import DarchSidebar from "./DarchSidebar";
import TopBar from "./TopBar";
import RecentArchitectures from "./RecentArchitectures";
import ArchitectureTemplates from "./ArchitectureTemplates";

export default function Homepage() {
	return (
		<TooltipProvider>
			<SidebarProvider>
				<div className="flex h-screen  w-full">
					{/* Sidebar */}
					<DarchSidebar />

					{/* Main Content */}
					<SidebarInset className="flex flex-col">
						{/* Top Bar */}
						<TopBar />

						{/* Main Content Area */}
						<div className="flex-1 p-6 overflow-auto">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
								{/* Recent Architectures */}
								<RecentArchitectures />

								{/* Architecture Templates */}
								<ArchitectureTemplates />
							</div>
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</TooltipProvider>
	);
}
