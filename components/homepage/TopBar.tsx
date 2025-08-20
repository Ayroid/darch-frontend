import { SidebarTrigger } from '@/components/ui/sidebar';

export default function TopBar() {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <span className="text-lg font-medium text-gray-900">Good afternoon, Ayush!</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search or go to..."
              className="bg-gray-100 border border-gray-200 rounded-md px-4 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-80"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              ⌘ K
            </div>
          </div>

          {/* Help */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <span className="text-sm">❓</span>
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <span className="text-sm">📧</span>
          </button>
        </div>
      </div>
    </div>
  );
}
