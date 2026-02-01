"use client";

import Link from 'next/link';
import { Plus, LayoutGrid, List, Globe, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';

export default function RecentArchitectures() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-lg">Recent Architectures</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button asChild>
            <Link href="/designer" className="gap-2">
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </Button>
          <div className="flex items-center border border-border rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none bg-muted">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 pt-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Architecture Card 1 */}
          <Link href="/designer" className="group">
            <div className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card">
              {/* Architecture Diagram Preview */}
              <div className="bg-muted/50 rounded-lg h-36 mb-4 flex items-center justify-center border border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">VPC</span>
                    </div>
                    <div className="w-8 h-0.5 bg-border rounded-full"></div>
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg border border-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-semibold">EC2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center justify-center">
                      <span className="text-green-600 text-xs font-semibold">RDS</span>
                    </div>
                    <div className="w-8 h-0.5 bg-border rounded-full"></div>
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-600 text-xs font-semibold">S3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Web Application
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">
                      Project 1
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      Dev
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Edited 1 hour ago
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Empty State Card */}
          <Link href="/designer" className="group">
            <div className="border border-dashed border-border rounded-lg p-5 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 h-full min-h-[280px] flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Create new architecture
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start from scratch
              </p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
