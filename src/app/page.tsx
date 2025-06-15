import SearchPage from "./page_utils/Search";

export default function Learn() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Research Search</h1>
          <p className="text-sm text-gray-600">
            Thank you to arXiv for use of its open access interoperability.
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <SearchPage />
      </div>
    </div>
  );
};