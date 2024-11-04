import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import Header from './Header';
import UseCrud from '../../hook/UseCrud';
import { FaMotorcycle } from 'react-icons/fa';
import { API_URL } from '../config';

const Domiciliarios = () => {
  const { auth } = useAuth();
  const BASEURL = `${API_URL}/domiciliarios/postDomiciliario`;
  const BASEURL_USUARIOS = `${API_URL}/users/getUserTipeUser/domiciliario`;
  const { postApi, loading } = UseCrud(BASEURL);
  const { getApi: getUsuarios, response: usuariosResponse } = UseCrud(BASEURL_USUARIOS);

  const [formData, setFormData] = useState({
    id_usuario: '',
    licencia_vehiculo: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      await getUsuarios();
    };
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (usuariosResponse) {
      setUsuarios(Array.isArray(usuariosResponse) ? usuariosResponse : [usuariosResponse]);
    }
  }, [usuariosResponse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postApi(formData);
      
      if (response) {
        setMessage({ 
          type: 'success', 
          text: 'Domiciliario registrado exitosamente' 
        });
        setFormData({
          id_usuario: '',
          licencia_vehiculo: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error al registrar el domiciliario' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Registro de Domiciliario" />
      <div className="lg:ml-64 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <FaMotorcycle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Registro de Nuevo Domiciliario
              </h2>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Usuario Domiciliario
                </label>
                <select
                  name="id_usuario"
                  value={formData.id_usuario}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-colors duration-200"
                  required
                >
                  <option value="">Seleccione un usuario</option>
                  {usuarios && usuarios.length > 0 && usuarios.map(usuario => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {usuario.nombre} - {usuario.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  name="licencia_vehiculo"
                  value={formData.licencia_vehiculo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-colors duration-200"
                  required
                  placeholder="Ej: ABC123456"
                />
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 border border-transparent rounded-lg
                    text-white font-medium transition-colors duration-200
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Registrar Domiciliario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domiciliarios;