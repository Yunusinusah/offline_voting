import { useState } from "react"

// Voter Management Component

export function VoterManagement() {
  const [voters] = useState([
    {
      id: 1,
      studentId: "STU001",
      name: "John Doe",
      email: "john@university.edu",
      level: "300",
      hostel: "Hostel A",
      gender: "male",
      department: "Computer Science",
      voted: true,
    },
    {
      id: 2,
      studentId: "STU002",
      name: "Jane Smith",
      email: "jane@university.edu",
      level: "200",
      hostel: "Hostel B",
      gender: "female",
      department: "Engineering",
      voted: false,
    },
    {
      id: 3,
      studentId: "STU003",
      name: "Mike Johnson",
      email: "mike@university.edu",
      level: "400",
      hostel: "Hostel C",
      gender: "male",
      department: "Mathematics",
      voted: true,
    },
  ])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Simulate file processing
      alert(`File "${file.name}" uploaded successfully! Processing voters...`)
      // In real app, you would parse the CSV/Excel file here
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Voter Management</h2>
        <div className="flex space-x-3">
          <label className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500 cursor-pointer">
            Upload Voter List
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-500">
            Export List
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voting Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {voters.map((voter) => (
              <tr key={voter.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{voter.studentId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.hostel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{voter.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      voter.voted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {voter.voted ? "Voted" : "Not Voted"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Voting Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{voters.length}</div>
            <div className="text-sm text-blue-800">Total Voters</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{voters.filter((v) => v.voted).length}</div>
            <div className="text-sm text-green-800">Votes Cast</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{voters.filter((v) => !v.voted).length}</div>
            <div className="text-sm text-yellow-800">Pending Votes</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((voters.filter((v) => v.voted).length / voters.length) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-purple-800">Participation Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoterManagement;