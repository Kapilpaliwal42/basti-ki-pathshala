import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('adminUser')) || null);
  const [interns, setInterns] = useState([]);

  // Form data states
  const [internForm, setInternForm] = useState({
    name: '', email: '', phoneNumber: '', college: '', course: '', yearOfStudy: '',
    skills: '', resumeUrl: '', linkedInProfile: '', githubProfile: ''
  });
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' });

  // Handle API calls
  const api = {
    submitInternDetails: async (data) => {
      const response = await fetch(`${API_BASE_URL}/getIntern`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    },

    loginAdmin: async (data) => {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    },

    getInterns: async (authToken) => {
      const response = await fetch(`${API_BASE_URL}/admin/getInterns`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return await response.json();
    },
  };

  // Effect to fetch interns when admin is logged in
  useEffect(() => {
    const fetchInterns = async () => {
      if (token) {
        setLoading(true);
        setError('');
        try {
          const result = await api.getInterns(token);
          if (Array.isArray(result)) { // API response is an array of interns
            setInterns(result);
          } else if (result.interns && Array.isArray(result.interns)) { // If it's wrapped in an object
            setInterns(result.interns);
          } else {
            setError('Failed to fetch interns. Data format is incorrect.');
            console.error('API response error:', result);
          }
        } catch (err) {
          console.error('Fetch interns error:', err);
          setError('Failed to load intern applicants.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInterns();
  }, [token]);

  const handleInternSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formattedData = {
      ...internForm,
      yearOfStudy: Number(internForm.yearOfStudy),
      skills: internForm.skills.split(',').map(s => s.trim()),
    };

    try {
      const result = await api.submitInternDetails(formattedData);
      if (result.message && result.message.includes("success")) {
        setMessage(result.message);
        setInternForm({
          name: '', email: '', phoneNumber: '', college: '', course: '', yearOfStudy: '',
          skills: '', resumeUrl: '', linkedInProfile: '', githubProfile: ''
        }); // Clear form
      } else {
        setError(result.message || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await api.loginAdmin(adminLoginForm);
      if (result.token) {
        setToken(result.token);
        setAdminUser(result.user);
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        setMessage('Login successful!');
        setCurrentPage('admin-dashboard');
      } else {
        setError(result.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setInterns([]);
    setCurrentPage('home');
    setMessage('You have been logged out.');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-lg animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 text-center">Welcome to the Intern Portal</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
              Are you an aspiring intern looking to apply, or an admin ready to review applications? Select an option below.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => setCurrentPage('register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                Register as an Intern
              </button>
              <button
                onClick={() => setCurrentPage('admin-login')}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50"
              >
                Admin Login
              </button>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-4xl animate-fade-in">
            <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Intern & Volunteer Registration</h2>
            <form onSubmit={handleInternSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={internForm.name}
                    onChange={(e) => setInternForm({ ...internForm, name: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={internForm.email}
                    onChange={(e) => setInternForm({ ...internForm, email: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={internForm.phoneNumber}
                    onChange={(e) => setInternForm({ ...internForm, phoneNumber: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700">College Name</label>
                  <input
                    type="text"
                    id="college"
                    value={internForm.college}
                    onChange={(e) => setInternForm({ ...internForm, college: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                  <input
                    type="text"
                    id="course"
                    value={internForm.course}
                    onChange={(e) => setInternForm({ ...internForm, course: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700">Year of Study</label>
                  <input
                    type="number"
                    id="yearOfStudy"
                    value={internForm.yearOfStudy}
                    onChange={(e) => setInternForm({ ...internForm, yearOfStudy: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <textarea
                  id="skills"
                  rows="3"
                  value={internForm.skills}
                  onChange={(e) => setInternForm({ ...internForm, skills: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                ></textarea>
              </div>
              <div>
                <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">Resume URL</label>
                <input
                  type="url"
                  id="resumeUrl"
                  value={internForm.resumeUrl}
                  onChange={(e) => setInternForm({ ...internForm, resumeUrl: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="linkedInProfile" className="block text-sm font-medium text-gray-700">LinkedIn Profile URL (Optional)</label>
                  <input
                    type="url"
                    id="linkedInProfile"
                    value={internForm.linkedInProfile}
                    onChange={(e) => setInternForm({ ...internForm, linkedInProfile: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="githubProfile" className="block text-sm font-medium text-gray-700">GitHub Profile URL (Optional)</label>
                  <input
                    type="url"
                    id="githubProfile"
                    value={internForm.githubProfile}
                    onChange={(e) => setInternForm({ ...internForm, githubProfile: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  Back to Home
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'admin-login':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="w-full space-y-6">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="admin-email"
                  value={adminLoginForm.email}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  Back to Home
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging In...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'admin-dashboard':
        return (
          <div className="p-8 bg-gray-50 rounded-xl shadow-lg w-full max-w-6xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-150"
              >
                Logout
              </button>
            </div>
            <p className="text-lg text-gray-600 mb-4">Welcome, {adminUser?.name || 'Admin'}!</p>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-medium">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">College</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interns.length > 0 ? (
                      interns.map((intern, index) => (
                        <tr key={intern._id} className="hover:bg-gray-100 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intern.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intern.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intern.college}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {intern.skills?.join(', ') || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a href={intern.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                              View
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No applicants found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-7xl mx-auto">
        {/* Global Message and Error Displays */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-center animate-fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center animate-fade-in">
            {error}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default App;

