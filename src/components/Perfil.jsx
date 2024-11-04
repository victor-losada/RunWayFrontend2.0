import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { useAuth } from "../../AuthContext";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Perfil = () => {
  const { auth } = useAuth();
  const [perfilData, setPerfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASEURL_USUARIO = `${API_URL}/users/getPerfilUsuario`;
  const BASEURL_NEGOCIO = `${API_URL}/negocios/getPerfilNegocio`;
  const BASEURL_DOMICILIARIO = `${API_URL}/domiciliarios/getPerfilDomiciliario`;
  const BASEURL_IMAGENES = `${API_URL}/public/banner/`;

  const { getApiById: getPerfilUsuario } = UseCrud(BASEURL_USUARIO);
  const { getApiById: getPerfilNegocio } = UseCrud(BASEURL_NEGOCIO);
  const { getApiById: getPerfilDomiciliario } = UseCrud(BASEURL_DOMICILIARIO);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoading(true);
        const userId = auth.user?.id_usuario;
        let resultado;

        switch (auth.user?.tipo_usuario) {
          case 'negocio':
            resultado = await getPerfilNegocio(`/${userId}`);
            break;
          case 'domiciliario':
            resultado = await getPerfilDomiciliario(`/${userId}`);
            break;
          default: 
            resultado = await getPerfilUsuario(`/${userId}`);
            break;
        }

        if (resultado) {
          setPerfilData(resultado[0]);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.id_usuario) {
      cargarPerfil();
    }
  }, [auth.user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
    <Header/> 
    <div className="lg:ml-64 pt-12 min-h-screen mt-10 bg-gray-200">
      <div className="container mx-auto px-3 py-2">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden text-gray-100">
            {auth.user?.tipo_usuario === 'negocio' && perfilData?.banner && (
              <div className="w-full h-24 relative overflow-hidden">
                <img
                  src={`${BASEURL_IMAGENES}${perfilData.banner}`}
                  alt="Banner del negocio"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-banner.jpg';
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent text-white p-1.5">
                  <p className="text-sm font-semibold">{perfilData.nombre_negocio}</p>
                </div>
              </div>
            )}

            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-lg font-bold text-gray-100">Mi Perfil</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/edit-domiciliario')}
                    className="p-1.5 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                    title="Editar perfil"
                  >
                    <svg 
                      className="w-3.5 h-3.5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </button>
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium capitalize">
                    {auth.user?.tipo_usuario}
                  </span>
                </div>
              </div>
              
              {perfilData && (
                <div className="space-y-2">
                  <div className="bg-gray-900/50 rounded-lg p-2 shadow border border-gray-700">
                    <h2 className="text-xs font-semibold mb-1.5 text-gray-100 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Información Personal
                    </h2>
                    <div className="space-y-1.5">
                      <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                        <label className="block text-xs font-medium text-gray-400">Nombre</label>
                        <p className="text-xs text-gray-100">{perfilData.nombre}</p>
                      </div>
                      <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                        <label className="block text-xs font-medium text-gray-400">Email</label>
                        <p className="text-xs text-gray-100">{perfilData.email}</p>
                      </div>
                      <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                        <label className="block text-xs font-medium text-gray-400">Teléfono</label>
                        <p className="text-xs text-gray-100">{perfilData.telefono}</p>
                      </div>
                    </div>
                  </div>

                  {auth.user?.tipo_usuario === 'negocio' && (
                    <div className="bg-gray-900/50 rounded-lg p-2 shadow border border-gray-700">
                      <h2 className="text-xs font-semibold mb-1.5 text-gray-100 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Información del Negocio
                      </h2>
                      <div className="space-y-1.5">
                        <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                          <label className="block text-xs font-medium text-gray-400">Nombre Negocio</label>
                          <p className="text-xs text-gray-100">{perfilData.nombre_negocio}</p>
                        </div>
                        <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                          <label className="block text-xs font-medium text-gray-400">Dirección</label>
                          <p className="text-xs text-gray-100">{perfilData.direccion}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {auth.user?.tipo_usuario === 'domiciliario' && (
                    <div className="bg-gray-900/50 rounded-lg p-2 shadow border border-gray-700">
                      <h2 className="text-xs font-semibold mb-1.5 text-gray-100 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                        Información del Domiciliario
                      </h2>
                      <div className="bg-gray-700/50 p-1.5 rounded shadow-sm border border-gray-600">
                        <label className="block text-xs font-medium text-gray-400">Licencia</label>
                        <p className="text-xs text-gray-100">{perfilData.licencia_vehiculo}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => navigate('/contraseña')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg 
                  className="w-3.5 h-3.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Cambiar Contraseña
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Perfil;