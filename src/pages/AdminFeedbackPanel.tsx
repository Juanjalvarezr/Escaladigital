import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface Feedback {
  id: string;
  user_id: string;
  module: string;
  checked: any;
  created_at: string;
}

const AdminFeedbackPanel: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_platform_feedback');
      if (!error && data) {
        setFeedbacks(data as Feedback[]);
      }
      setLoading(false);
    };
    fetchFeedbacks();
  }, []);

  // Gráfico de barras: feedback por módulo
  const moduleCounts = feedbacks.reduce((acc, fb) => {
    acc[fb.module] = (acc[fb.module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = {
    labels: Object.keys(moduleCounts),
    datasets: [{
      label: 'Feedback por módulo',
      data: Object.values(moduleCounts),
      backgroundColor: 'rgba(59,130,246,0.7)',
    }],
  };

  // Filtros
  const filteredFeedbacks = feedbacks.filter(fb =>
    (moduleFilter ? fb.module === moduleFilter : true) &&
    (userFilter ? fb.user_id === userFilter : true)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Panel de Feedback Profesional</h2>
      <div className="mb-8">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="mb-6 flex gap-4">
        <select className="border rounded px-3 py-2" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
          <option value="">Todos los módulos</option>
          {Object.keys(moduleCounts).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Filtrar por usuario"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-600">Cargando feedback...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Módulo</th>
                <th className="px-4 py-2 text-left">Checklist</th>
                <th className="px-4 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map(fb => (
                <tr key={fb.id} className="border-b">
                  <td className="px-4 py-2 text-blue-700">{fb.user_id}</td>
                  <td className="px-4 py-2">{fb.module}</td>
                  <td className="px-4 py-2">
                    {Array.isArray(fb.checked) ? fb.checked.map((c, idx) => (
                      <span key={idx} className={`inline-block px-2 py-1 rounded text-xs mr-1 ${c ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{c ? '✔️' : '❌'}</span>
                    )) : JSON.stringify(fb.checked)}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(fb.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPanel;
