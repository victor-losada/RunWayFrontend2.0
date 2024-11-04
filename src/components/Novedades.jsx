import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { API_URL } from "../config";

const Novedades = () => {
  const navigate = useNavigate();

  const BASEURL = `${API_URL}/novedades/getNovedadesPendientes`;
  const BASEURL2 = `${API_URL}/novedades/getDetalleNovedad`;
  const BASEURL3 = `${API_URL}/novedades/putEstadoNovedad`;
  const BASEURL4 = `${API_URL}/novedades/getNovedades`;

  const { getApi, response: novedadesPendientes, loading } = UseCrud(BASEURL);
  const { getApiById, responseById: detalleNovedad } = UseCrud(BASEURL2);
  const { updateApi } = UseCrud(BASEURL3);
  const { getApi: getNovedadesResueltas, response: novedadesResueltas } =
    UseCrud(BASEURL4);
  const [selectedNovedad, setSelectedNovedad] = useState(null);
  const [mostrarResueltas, setMostrarResueltas] = useState(false);

  useEffect(() => {
    getApi();
  }, []);

  const obtenerNovedadesActuales = () => {
    if (mostrarResueltas) {
      if (novedadesResueltas && !Array.isArray(novedadesResueltas)) {
        return [novedadesResueltas];
      }
      return Array.isArray(novedadesResueltas) ? novedadesResueltas : [];
    }
    return Array.isArray(novedadesPendientes) ? novedadesPendientes : [];
  };

  const handleVerDetalle = async (id_novedad) => {
    try {
      await getApiById(`/${id_novedad}`);
      setSelectedNovedad(id_novedad);
    } catch (error) {
      alert("Error al obtener detalles de la novedad");
    }
  };

  const handleMarcarResuelta = async (id_novedad) => {
    if (!window.confirm("¿Estás seguro de marcar esta novedad como resuelta?"))
      return;

    try {
      const response = await updateApi(null, `/${id_novedad}`);
      if (response) {
        alert("Novedad marcada como resuelta");
        getApi();
        setSelectedNovedad(null);
      }
    } catch (error) {
      alert("Error al actualizar el estado de la novedad");
    }
  };

  const handleVerSolicitud = (id_solicitud) => {
    navigate(`/solicitudes?id=${id_solicitud}`);
  };

  const toggleTipoNovedades = async () => {
    setMostrarResueltas(!mostrarResueltas);
    setSelectedNovedad(null);

    try {
      if (!mostrarResueltas) {
        await getNovedadesResueltas();
      } else {
        await getApi();
      }
    } catch (error) {
      alert("Error al obtener novedades");
    }
  };

  return (
    <>
      <Header title="Novedades" />
      <div className="min-h-screen bg-gray-100">
        <div className="lg:ml-64 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {mostrarResueltas ? "Novedades Resueltas" : "Novedades Pendientes"}
                </h2>
                <button
                  onClick={toggleTipoNovedades}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm w-full sm:w-auto ${
                    mostrarResueltas
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {mostrarResueltas ? "Ver Pendientes" : "Ver Resueltas"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Lista de Novedades</h3>
                {loading ? (
                  <p className="text-center">Cargando novedades...</p>
                ) : (
                  <div className="space-y-4">
                    {obtenerNovedadesActuales().length > 0 ? (
                      obtenerNovedadesActuales().map((novedad) => (
                        <div
                          key={novedad.id_novedad}
                          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedNovedad === novedad.id_novedad
                              ? "bg-blue-50 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleVerDetalle(novedad.id_novedad)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                Solicitud #{novedad.id_solicitud}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Fecha: {new Date(novedad.fecha_reporte).toLocaleString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                                mostrarResueltas
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {mostrarResueltas ? "Resuelta" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 text-sm sm:text-base">
                        No hay novedades {mostrarResueltas ? "resueltas" : "pendientes"}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedNovedad && detalleNovedad && (
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">
                    Detalles de la Novedad
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between sm:px-8 gap-4">
                      <div className="flex-1 text-center">
                        <p className="font-semibold text-sm sm:text-base">ID Novedad:</p>
                        <p className="text-sm sm:text-base">{detalleNovedad[0]?.id_novedad}</p>
                      </div>
                      <button
                        onClick={() => handleVerSolicitud(detalleNovedad[0]?.id_solicitud)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-1 w-full sm:w-auto justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Ver Solicitud
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">ID Solicitud:</p>
                        <p className="text-sm sm:text-base">{detalleNovedad[0]?.id_solicitud}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Domiciliario:</p>
                        <p className="text-sm sm:text-base">{detalleNovedad[0]?.nombre_domiciliario}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Descripción:</p>
                        <p className="text-sm sm:text-base text-gray-700">
                          {detalleNovedad[0]?.descripcion}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Fecha de Reporte:</p>
                        <p className="text-sm sm:text-base">
                          {new Date(detalleNovedad[0]?.fecha_reporte).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!mostrarResueltas && (
                      <button
                        onClick={() => handleMarcarResuelta(detalleNovedad[0]?.id_novedad)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base mt-4"
                      >
                        Marcar como Resuelta
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Novedades;
