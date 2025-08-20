export default function RecentDeployments() {
  return (
    <div className="rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900">Recent deployments</h2>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <span className="text-sm">📊</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-gray-400">🚀</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent deployments</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            This area will light up with items once you start deploying your architectures.
            You will also need to connect Darch to your cloud provider.
          </p>
          <button className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2">
            <span>➕</span>
            <span>Create cloud provider credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
