import React, { useState, useEffect } from 'react';
import { FaBell, FaCog, FaSignOutAlt, FaHome, FaClipboard, FaExclamationCircle, FaMotorcycle, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { data } from 'autoprefixer';

const Header = ({ title = "Panel de Control", title2 = "RunWayDomicilios" }) => {
  const { auth, logout } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(null);
  const BASEURL_IMAGENES = "http://localhost:3000/public/banner/";

  const baseMenuItems = [
    {
      title: 'Inicio',
      icon: FaHome,
      path: auth?.user?.tipo_usuario === 'negocio' ? '/negocio-home' : '/home',
    },
    {
      title: 'Solicitudes',
      icon: FaClipboard,
      path: '/solicitudes',
    },
    {
      title: 'Reportes',
      icon: FaMotorcycle,
      path: '/reportes',
    },
    {
      title: 'Perfil',
      icon: FaUserCircle,
      path: '/perfil',
    },
    {
      title: 'Configuración',
      icon: FaCog,
      path: '/contraseña',
    }
  ];

  const adminMenuItems = [
    {
      title: 'Novedades',
      icon: FaExclamationCircle,
      path: '/novedades',
    },
    {
      title: 'Logs de Actividad',
      icon: FaClipboard,
      path: '/logs',
    }
  ];

  const domiciliarioMenuItems = [
    {
      title: 'Inicio',
      icon: FaHome,
      path: auth.user.tipo_usuario === 'domiciliario' ? '/domiciliario' : 
           auth.user.tipo_usuario === 'negocio' ? '/negocio-home' : '/home',
    },
    {
      title: 'Perfil',
      icon: FaUserCircle,
      path: '/perfil',
    },
    {
      title: 'Configuración',
      icon: FaCog,
      path: '/configuracion',
    }
  ];

  const menuItems = auth?.user?.tipo_usuario === 'domiciliario'
    ? domiciliarioMenuItems
    : auth?.user?.tipo_usuario === 'administrador'
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

  useEffect(() => {
    if (socket && auth?.user) {
      console.log('Socket configurado para usuario:', auth.user);
      
      const handlePedidoAsignado = (data) => {
        console.log('Notificación de pedido asignado:', data);
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'pedido'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      const handleEstadoPedido = (data) => {
        console.log('Notificación de estado:', data);
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'estado'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      const handlePedidoCancelado = (data) => {
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'cancelacion'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
      const handleSinDomiciliariosDisponibles = (data) => {
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'alerta'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      const handlePedidoReasignado = (data) => {
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'pedido'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      const handleNovedadReportada = (data) => {
        console.log('Notificación de novedad recibida:', data);
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'novedad'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
      
      const handleNuevaActividad = (data) =>{
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'actividad'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
    

      socket.on('pedidoAsignado', handlePedidoAsignado);
      socket.on('EstadoPedido', handleEstadoPedido);
      socket.on('pedidoCancelado', handlePedidoCancelado);
      socket.on('sinDomiciliariosDisponibles', handleSinDomiciliariosDisponibles);
      socket.on('pedidoReasignado', handlePedidoReasignado);
      socket.on('novedadReportada', handleNovedadReportada);
      socket.on('nuevaActividad', handleNuevaActividad);
      socket.onAny((eventName, ...args) => {
        console.log('Evento Socket.IO recibido:', eventName, args);
      });

      return () => {
        socket.off('pedidoAsignado');
        socket.off('EstadoPedido');
        socket.off('pedidoCancelado');
        socket.off('sinDomiciliariosDisponibles');
        socket.off('pedidoReasignado');
        socket.off('novedadReportada');
        socket.off('nuevaActividad');
        socket.offAny();
      };
    }
  }, [socket, auth]);

  useEffect(() => {
    if (auth?.user?.tipo_usuario === 'negocio' && auth?.user?.banner) {
      const url = `${BASEURL_IMAGENES}${auth.user.banner}`;
      console.log('URL completa del banner:', url);
      fetch(url)
        .then(response => {
          if (!response.ok) {
            console.error('Error al cargar la imagen:', response.status);
          } else {
            console.log('Imagen encontrada correctamente');
          }
        })
        .catch(error => console.error('Error al verificar la imagen:', error));
      
      setBannerUrl(url);
    }
  }, [auth?.user]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'pedido':
        return (
          <>
            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
            {notification.direccion_recogida && (
              <p className="text-xs text-gray-600 mt-1">
                Recogida: {notification.direccion_recogida}
              </p>
            )}
            {notification.direccion_entrega && (  
              <p className="text-xs text-gray-600">
                Entrega: {notification.direccion_entrega}
              </p>
            )}
          </>
        );
      case 'estado':
        return (
          <p className="text-sm font-medium text-gray-800">
            {notification.message}
          </p>
        );
      case 'cancelacion':
        return (
          <p className="text-sm font-medium text-red-600">
            {notification.message}
          </p>
        );
      case 'alerta':
        return (
          <p className="text-sm font-medium text-red-600">
            {notification.message}
          </p>
        );
      case 'novedad':
        return (
          <p className="text-sm font-medium text-gray-800">
            {notification.message}
          </p>
        );
      case 'actividad':
        return (
          <p className="text-sm font-medium text-gray-800">
            {notification.message}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg z-40">
        <div className="lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-slate-600 transition-colors lg:hidden"
                >
                  <FaBars className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-2xl font-bold absolute left-20 text-white font-serif italic tracking-wide">{title2}</h1>

                <h1 className="text-2xl font-bold ml-80 text-white">{title}</h1>
              </div>
              <div className="flex items-center gap-4">
                {auth?.user?.tipo_usuario === 'negocio' && (
                  <>
                    {bannerUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                        <img 
                          src={bannerUrl}
                          alt="Banner del negocio"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Error cargando imagen, URL intentada:', bannerUrl);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">👨‍💼</span>
                      </div>
                    )}
                  </>
                )}
                <div className="relative">
                  <button 
                    className="p-2 rounded-full hover:bg-blue-700 relative"
                    onClick={handleNotificationClick}
                  >
                    <FaBell className="w-5 h-5 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div 
                              key={notification.id}
                              className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                            >
                              {renderNotificationContent(notification)}
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No hay notificaciones
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button className="p-2 rounded-full hover:bg-blue-700">
                  <FaCog className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-blue-500">
                  <span className="text-sm font-medium text-white">
                    {auth?.user?.nombre || 'Usuario'}
                  </span>
                  <button 
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-blue-700 text-white"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 
        bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-50 lg:z-30
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-4 bg-slate-900/50">
          <span 
            className="text-xl font-bold text-white cursor-pointer hover:text-slate-200" 
            onClick={() => {
              const homeRoute = auth?.user?.tipo_usuario === 'domiciliario' 
                ? '/domiciliario' 
                : auth?.user?.tipo_usuario === 'negocio'
                ? '/negocio-home'
                : '/home';
              navigate(homeRoute);
              setIsSidebarOpen(false);
            }}
          >
            RunWay
          </span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <FaTimes className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mb-2
                rounded-lg transition-colors
                ${location.pathname === item.path 
                  ? 'bg-slate-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-700'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {auth?.user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {auth?.user?.tipo_usuario || 'Rol'}
              </p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-blue-700 text-white transition-colors"
              title="Cerrar sesión"
            >
              <FaSignOutAlt className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header; 