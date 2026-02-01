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
	ChevronRight,
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
import { Badge } from "@/app/_components/ui/badge";

const menuItems = [
	{ icon: Home, label: "Home", href: "/", active: true },
	{ icon: FolderOpen, label: "Projects", href: "#", badge: "3" },
	{ icon: FileText, label: "Templates", href: "#" },
	{ icon: Activity, label: "Activity", href: "#" },
	{ icon: Settings, label: "Settings", href: "#" },
];

export default function DarchSidebar() {
	return (
		<Sidebar className="border-r border-sidebar-border">
			<SidebarHeader className="border-b border-sidebar-border">
				<div className="flex items-center gap-3 px-2 py-3">
					<div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
						<Image
							src="/darch_logo.jpeg"
							alt="Darch Logo"
							width={36}
							height={36}
							className="rounded-lg object-cover"
						/>
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-sidebar-foreground">Darch</span>
						<span className="text-xs text-sidebar-foreground/60">Cloud Architect</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider font-medium">
						My Organization
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										asChild
										isActive={item.active}
										className="group"
									>
										<Link href={item.href} className="flex items-center gap-3">
											<item.icon className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground group-data-[active=true]:text-primary" />
											<span className="flex-1">{item.label}</span>
											{item.badge && (
												<Badge variant="secondary" className="h-5 px-1.5 text-xs bg-sidebar-accent">
													{item.badge}
												</Badge>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider font-medium">
						Recent
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild className="group">
									<Link href="/designer" className="flex items-center gap-3">
										<div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center">
											<span className="text-[10px] font-semibold text-blue-600">W</span>
										</div>
										<span className="flex-1 truncate text-sm">Web Application</span>
										<ChevronRight className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70 transition-colors" />
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="group">
							<div className="flex items-center gap-3 cursor-pointer">
								<div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ring-2 ring-sidebar-border">
									<User className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-sidebar-foreground truncate">
										Ayush Singh Kushwah
									</p>
									<p className="text-xs text-sidebar-foreground/50 truncate">
										Free Plan
									</p>
								</div>
								<ChevronRight className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70 transition-colors" />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
