"use client";

import Link from "next/link";
import Image from "next/image";
import {
	Home,
	FolderOpen,
	FileText,
	Activity,
	Settings,
	User,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/app/_components/ui/sidebar";

export default function DarchSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center space-x-2 p-4">
					<Image
						src="/darch_logo.jpeg"
						alt="Darch Logo"
						width={32}
						height={32}
						className="rounded-lg"
					/>
					<span className="font-semibold text-gray-900">Darch</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs text-gray-500 uppercase tracking-wider">
						MY ORGANIZATION
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="#" className="flex items-center space-x-2">
										<Home className="w-4 h-4" />
										<span>Home</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="#" className="flex items-center space-x-2">
										<FolderOpen className="w-4 h-4" />
										<span>Projects</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="#" className="flex items-center space-x-2">
										<FileText className="w-4 h-4" />
										<span>Templates</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="#" className="flex items-center space-x-2">
										<Activity className="w-4 h-4" />
										<span>Activity</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="#" className="flex items-center space-x-2">
										<Settings className="w-4 h-4" />
										<span>Settings</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupContent></SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
									<User className="w-4 h-4 text-gray-600" />
								</div>
								<span className="text-sm text-gray-700">
									Ayush Singh Kushwah
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
