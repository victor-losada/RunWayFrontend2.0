import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { useAuth } from "../../AuthContext";
import Header from "./Header";
import { API_URL } from '../config';
const LogsActividad = () => {
  const BASEURL = `${API_URL}/logsActividad/getLogs`;
  const BASEURL2 = `${API_URL}/logsActividad/getLogsFecha`;
  const BASEURL3 = `${API_URL}/logsActividad/postLogsActividad`;

  const { auth } = useAuth();
  const { getApi, response: logs, loading } = UseCrud(BASEURL);
  const { postApi: getLogsFecha } = UseCrud(BASEURL2);
  const { postApiById: crearLog } = UseCrud(BASEURL3);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [logsActuales, setLogsActuales] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getApi();
  }, []);

  useEffect(() => {
    if (logs) {
      setLogsActuales(logs);
    }
  }, [logs]);

  const handleFiltrarPorFecha = async (e) => {
    e.preventDefault();
    if (fechaInicio && fechaFin) {
      try {
        console.log("Fechas seleccionadas:", { fechaInicio, fechaFin });

        const result = await getLogsFecha({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        });

        console.log("Respuesta del servidor:", result);

        if (result) {
          setLogsActuales(result);
        }
      } catch (error) {
        console.error("Error al filtrar por fecha:", error);
      }
    }
  };

  const handleCrearLog = async (e) => {
    e.preventDefault();
    try {
      if (!auth.user || !auth.user.id_usuario) {
        console.log("Auth state:", auth);
        alert("Error: No se pudo obtener la información del usuario");
        return;
      }

      const response = await crearLog({ descripcion }, auth.user.id_usuario);
      if (response) {
        setDescripcion("");
        setIsModalOpen(false);
        getApi();
      }
    } catch (error) {
      console.error("Error al crear log:", error);
      alert("Error al crear el log. Por favor, intente nuevamente.");
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    getApi();
  };

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          No hay información del usuario disponible
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 mt-32 lg:ml-60 max-w-[calc(100%-1rem)] lg:max-w-[calc(100%-16rem)]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold">Logs de Actividad</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Crear Log
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
            <button
              onClick={handleFiltrarPorFecha}
              className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Filtrar por Fecha
            </button>
            <button
              onClick={limpiarFiltros}
              className="w-full sm:w-auto bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-3">Crear Nuevo Log</h3>
              <form onSubmit={handleCrearLog}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-3 text-center">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Usuario
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsActuales.map((log) => (
                    <tr key={`${log.id_usuario}-${log.fecha_hora}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {log.id_usuario}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl break-words">
                          {log.descripcion}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {new Date(log.fecha_hora).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LogsActividad;
