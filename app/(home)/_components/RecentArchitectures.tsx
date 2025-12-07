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
        <div className="grid grid-cols-2 gap-6">
          {/* Architecture Card 1 */}
          <Link href="/designer" className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Architecture Diagram Preview */}
              <div className="bg-gray-50 rounded-md h-40 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded border border-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">VPC</span>
                    </div>
                    <div className="w-3 h-0.5 bg-gray-300"></div>
                    <div className="w-10 h-10 bg-orange-100 rounded border border-orange-200 flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-medium">EC2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded border border-green-200 flex items-center justify-center">
                      <span className="text-green-600 text-sm font-medium">RDS</span>
                    </div>
                    <div className="w-3 h-0.5 bg-gray-300"></div>
                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <span className="text-black text-sm font-medium">S3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-black text-lg">🌐</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-black transition-colors">Web Application</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                      Project 1
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                      🔧 Dev
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">⏰ Edited 1 hour ago</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Empty state or placeholder cards can go here for a 2x2 grid */}
        </div>
      </div>
    </div>
  );
}
