import Header from "@/components/Header";

// app/page.js (Home)
export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Material Flow Management Dashboard</h2>
          <p className="mb-4">
            Welcome to the Material Flow Management System. This application helps track the flow of materials from raw inputs to finished goods, with proper accounting for recycled scrap.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2">Process Flow</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Enter new Jumbo details with associated scrap</li>
                <li>Record raw material and recycled scrap input per jumbo</li>
                <li>Record finish goods and output scrap per jumbo</li>
                <li>View reports to analyze material flow efficiency</li>
              </ol>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Automatic Jumbo ID generation</li>
                <li>Jumbo-wise traceability</li>
                <li>Scrap recycling tracking</li>
                <li>Material balance analysis</li>
                <li>Difference reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}