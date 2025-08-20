import Link from 'next/link';

export default function RecentArchitectures() {
  return (
    <div className="rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900">Recent architectures</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/designer"
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Create architecture</span>
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <span className="text-sm">☰</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <span className="text-sm">⊞</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Architecture Card */}
          <Link href="/designer" className="group">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Architecture Diagram Preview */}
              <div className="bg-gray-50 rounded-md h-32 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded border border-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">VPC</span>
                    </div>
                    <div className="w-2 h-0.5 bg-gray-300"></div>
                    <div className="w-8 h-8 bg-orange-100 rounded border border-orange-200 flex items-center justify-center">
                      <span className="text-orange-600 text-xs">EC2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded border border-green-200 flex items-center justify-center">
                      <span className="text-green-600 text-xs">RDS</span>
                    </div>
                    <div className="w-2 h-0.5 bg-gray-300"></div>
                    <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <span className="text-black text-xs">S3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="flex items-start space-x-2 mb-2">
                <span className="text-black text-sm">🌐</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">Test</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Project 1
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      🔧 Dev
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">⏰ Edited 1 hour ago</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
