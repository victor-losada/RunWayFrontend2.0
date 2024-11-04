import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaClipboardList, FaHistory, FaExclamationTriangle, 
  FaMotorcycle, FaShoppingBag, FaBell
} from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import UseCrud from '../../hook/UseCrud';
import Header from './Header';
import { API_URL } from '../config';

const Home = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const userRole = auth?.user?.tipo_usuario;

  const [stats, setStats] = useState({
    solicitudes: '0',
    reportes: '0',
    novedades: '0'
  });

  // URLs según las rutas existentes
  const BASEURL_SOLICITUDES = `${API_URL}/solicitudes/getSolicitudes`;
  const BASEURL_REPORTES = `${API_URL}/reporteIncidentes/getReporteIncidente`;
  const BASEURL_NOVEDADES = `${API_URL}/novedades/getNovedadesPendientes`;

  // Hooks para las estadísticas
  const { getApi: getSolicitudes, response: solicitudesResponse } = UseCrud(BASEURL_SOLICITUDES);
  const { getApi: getReportes, response: reportesResponse } = UseCrud(BASEURL_REPORTES);
  const { getApi: getNovedades, response: novedadesResponse } = UseCrud(BASEURL_NOVEDADES);

  useEffect(() => {
    const loadStats = async () => {
      try {
        switch(userRole) {
          case 'administrador':
            await Promise.all([getSolicitudes(), getReportes(), getNovedades()]);
            break;
          case 'domiciliario':
            await Promise.all([getSolicitudes(), getNovedades()]);
            break;
          default:
            await Promise.all([getSolicitudes(), getReportes()]);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };
    loadStats();
  }, [userRole]);

  // Módulos según el rol
  const getModulesByRole = () => {
    switch(userRole) {
      case 'particular':
      case 'negocio':
        return [
          {
            title: "Mis Solicitudes",
            description: "Ver el estado de tus solicitudes",
            icon: FaClipboardList,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes activas"
            }
          },
          {
            title: "Reportar Incidencia",
            description: "Reportar problemas con las solicitudes",
            icon: FaExclamationTriangle,
            path: "/reportes",
            stats: {
              value: reportesResponse?.length || '0',
              label: "reportes activos"
            }
          }
        ];

      case 'domiciliario':
        return [
          {
            title: "Solicitudes Asignadas",
            description: "Ver y gestionar solicitudes",
            icon: FaMotorcycle,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes pendientes"
            }
          },
          {
            title: "Reportar Novedad",
            description: "Reportar novedades en las entregas",
            icon: FaBell,
            path: "/novedades",
            stats: {
              value: novedadesResponse?.length || '0',
              label: "novedades pendientes"
            }
          }
        ];

      case 'administrador':
        return [
          {
            title: "Gestión de Usuarios",
            description: "Administra usuarios del sistema",
            icon: FaUsers,
            path: "/usuarios",
            stats: {
              value: stats.usuarios,
              label: "usuarios activos"
            }
          },
          {
            title: "Registro de Domiciliarios",
            description: "Gestiona el registro de nuevos domiciliarios",
            icon: FaMotorcycle,
            path: "/registro-domiciliarios",
            stats: {
              label: "registro domiciliarios"
            },
            highlight: true
          },
          {
            title: "Registro de Negocios",
            description: "Gestiona el registro de nuevos negocios",
            icon: FaShoppingBag,
            path: "/registro-negocios",
            stats: {
              label: "registro negocios"
            },
            highlight: true
          },
          {
            title: "Solicitudes",
            description: "Gestiona las solicitudes",
            icon: FaClipboardList,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes activas"
            }
          },
          {
            title: "Reportes de Incidencias",
            description: "Gestiona los reportes de incidencias",
            icon: FaExclamationTriangle,
            path: "/reportes",
            stats: {
              value: reportesResponse?.length || '0',
              label: "reportes pendientes"
            }
          },
          {
            title: "Novedades",
            description: "Gestiona las novedades del sistema",
            icon: FaBell,
            path: "/novedades",
            stats: {
              value: novedadesResponse?.length || '0',
              label: "novedades pendientes"
            }
          }
        ];

      default:
        return [];
    }
  };

  return (
    <div className="mt-11 bg-white">
      <Header/>
      <div className="lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pt-20">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 
              border border-gray-200/80
              shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
              hover:shadow-[rgba(17,_17,_26,_0.1)_0px_4px_16px,_rgba(17,_17,_26,_0.05)_0px_8px_32px]
              transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Bienvenido, {auth?.user?.nombre}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Accede a tus funciones disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {getModulesByRole().map((module, index) => (
              <div
                key={index}
                onClick={() => navigate(module.path)}
                className={`
                  relative overflow-hidden
                  bg-gradient-to-br from-gray-400 to-blue-50/30
                  rounded-xl p-4 md:p-6 
                  transform transition-all duration-300 
                  hover:-translate-y-1 cursor-pointer
                  border border-gray-200/80
                  shadow-[rgba(17,_17,_26,_0.1)_0px_4px_16px,_rgba(17,_17,_26,_0.05)_0px_8px_32px]
                  hover:shadow-[rgba(17,_17,_26,_0.1)_0px_8px_24px,_rgba(17,_17,_26,_0.1)_0px_16px_56px]
                  ${module.highlight ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    p-3 rounded-lg shadow-sm
                    ${module.highlight 
                      ? 'bg-blue-500 text-white shadow-blue-200' 
                      : 'bg-blue-100 text-blue-600'}
                  `}>
                    <module.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-500">
                    {module.stats.label}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  {module.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">
                    {module.stats.value}
                  </span>
                  <span className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-colors shadow-sm
                    ${module.highlight 
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}
                  `}>
                    Ver más
                  </span>
                </div>

              
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;