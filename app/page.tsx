export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Your App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Built with Busibox App Template
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
            <li>
              1. Update <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/layout.tsx</code> with your app name
            </li>
            <li>
              2. Update <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/providers.tsx</code> with your branding
            </li>
            <li>
              3. Add your routes in the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/</code> directory
            </li>
            <li>
              4. Add navigation links in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">app/app-shell.tsx</code>
            </li>
            <li>
              5. Configure your environment in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
