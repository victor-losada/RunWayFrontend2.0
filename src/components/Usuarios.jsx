import React, { useState, useEffect } from 'react';
import UseCrud from '../../hook/UseCrud';
import Header from './Header';
import { API_URL } from '../config';

const Usuarios = () => {
    const BASEURL = `${API_URL}/users/getUser`;
    const BASEURL2 = `${API_URL}/users/getUserByid`;
    const BASEURL3 = `${API_URL}/users/patchUser`;
    const BASEURL4 = `${API_URL}/users/postUser`;
    const BASEURL5 = `${API_URL}/users/putUser`;
    const BASEURL6 = `${API_URL}/users/getUserTipeUser`;
    const BASEURL7 = `${API_URL}/users/getUserInactivo`;
    const BASEURL8 = `${API_URL}/users/patchActivoUser`;

    const { getApi, response: usuarios, error, loading } = UseCrud(BASEURL);
    const { getApiById, responseById, error: error2, loading: loading2 } = UseCrud(BASEURL2);
    const { updateApi } = UseCrud(BASEURL3);
    const { postApi } = UseCrud(BASEURL4);
    const { updateApi: putApi } = UseCrud(BASEURL5);
    const { getApiById: getByTipo, response: usuariosPorTipo } = UseCrud(BASEURL6);
    const { getApi: getUsuariosInactivos, response: usuariosInactivos } = UseCrud(BASEURL7);
    const { updateApi: activarUsuario } = UseCrud(BASEURL8);

    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        nombre: '',
        tipo_usuario: '',
        email: '',
        telefono: '',
        password: ''
    });

    useEffect(() => {
        console.log('Iniciando carga de usuarios');
        getApi();
    }, []);

    useEffect(() => {
        if (filtroTipo === 'todos') {
            getApi();
        } else {
            handleFiltroTipo(filtroTipo);
        }
    }, []);

    useEffect(() => {
        console.log('usuariosPorTipo actualizado:', usuariosPorTipo);
        if (usuariosPorTipo) {
            setUsuariosFiltrados(usuariosPorTipo);
        }
    }, [usuariosPorTipo]);

    useEffect(() => {
        const cargarDatos = async () => {
            if (filtroTipo === 'todos') {
                await getApi();
            } else {
                await handleFiltroTipo(filtroTipo);
            }
        };
        cargarDatos();
    }, [filtroTipo]);

    useEffect(() => {
        if (searchId) {
            handleSearch();
        } else {
            if (mostrarInactivos) {
                getUsuariosInactivos();
            } else if (filtroTipo === 'todos') {
                getApi();
            } else {
                handleFiltroTipo(filtroTipo);
            }
        }
    }, [searchId]);

    const handleFiltroTipo = async (tipo) => {
        setFiltroTipo(tipo);
        setMostrarInactivos(false);
        try {
            if (tipo === 'todos') {
                await getApi();
            } else {
                const response = await getByTipo(tipo);
                if (response) {
                    setUsuariosFiltrados(response);
                }
            }
        } catch (error) {
            console.error('Error al filtrar:', error);
        }
    };

    const handleDetailsClick = (usuario) => {
        setSelectedUsuario(usuario);
    };

    const closeDetails = () => {
        setSelectedUsuario(null);
    };

    const handleSearch = async () => {
        try {
            if (searchId.trim()) {
                await getApiById(`/${searchId}`);
                if (responseById) {
                    const resultados = Array.isArray(responseById) ? responseById : [responseById];
                    setUsuariosFiltrados(resultados);
                } else {
                    setUsuariosFiltrados([]);
                }
            }
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            setUsuariosFiltrados([]);
        }
    };

    const handleEditClick = (usuario) => {
        setEditFormData({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            tipo_usuario: usuario.tipo_usuario,
            email: usuario.email,
            telefono: usuario.telefono,
            estado: usuario.estado
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await putApi(editFormData, `/${editFormData.id_usuario}`);
            if (response) {
                alert('Usuario actualizado correctamente');
                setIsEditModalOpen(false);
                await getApi();
                setEditFormData(null);
            }
        } catch (error) {
            alert('Error al actualizar usuario');
            console.error('Error al actualizar:', error);
        }
    };

    const confirmarDesactivacion = async (id_usuario) => {
        if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

        try {
            setIsLoading(true);
            console.log('Iniciando desactivación del usuario:', id_usuario);
            
            const response = await updateApi(null, `/${id_usuario}`);
            
            if (response) {
                console.log('Usuario desactivado exitosamente');
                alert('Usuario desactivado correctamente');
                
                if (filtroTipo === 'todos') {
                    await getApi();
                } else {
                    await handleFiltroTipo(filtroTipo);
                }
            }
        } catch (error) {
            console.error('Error al desactivar:', error);
            alert('Error al desactivar usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMostrarInactivos = async () => {
        console.log('Toggle mostrar inactivos:', !mostrarInactivos);
        setMostrarInactivos(!mostrarInactivos);
        
        try {
            if (!mostrarInactivos) {
                console.log('Obteniendo usuarios inactivos...');
                await getUsuariosInactivos();
                console.log('Usuarios inactivos cargados:', usuariosInactivos);
            } else {
                console.log('Volviendo a usuarios activos');
                await getApi();
                console.log('Usuarios activos cargados:', usuarios);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const confirmarActivacion = async (id_usuario) => {
        if (!window.confirm('¿Estás seguro de activar este usuario?')) return;

        try {
            setIsLoading(true);
            console.log('Iniciando activación del usuario:', id_usuario);
            
            const response = await activarUsuario(null, `/${id_usuario}`);
            
            if (response) {
                console.log('Usuario activado exitosamente');
                alert('Usuario activado correctamente');
                
                if (mostrarInactivos) {
                    await getUsuariosInactivos();
                } else {
                    await getApi();
                }
            }
        } catch (error) {
            console.error('Error al activar:', error);
            alert('Error al activar usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await postApi(createFormData);
            if (response) {
                alert('Usuario creado correctamente');
                setIsCreateModalOpen(false);
                setCreateFormData({
                    nombre: '',
                    tipo_usuario: '',
                    email: '',
                    telefono: '',
                    password: ''
                });
                await getApi();
            }
        } catch (error) {
            alert('Error al crear usuario');
            console.error('Error al crear:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="Gestión de Usuarios" />
                    <div className="lg:ml-64 pt-16">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID..."
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                    >
                                        Buscar
                                    </button>
                                </div>
                                <select 
                                    className="px-4 py-2 border rounded-lg text-sm bg-white w-full sm:w-auto"
                                    value={filtroTipo}
                                    onChange={(e) => handleFiltroTipo(e.target.value)}
                                >
                                    <option value="todos">Todos los tipos</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="particular">Particular</option>
                                    <option value="negocio">Negocio</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleMostrarInactivos}
                                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-semibold text-sm ${
                                        mostrarInactivos 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                    {mostrarInactivos ? 'Mostrar Activos' : 'Mostrar Inactivos'}
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Crear Usuario</span>
                                    <span className="sm:hidden">Crear</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">ID</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Nombre</th>
                                        <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Tipo</th>
                                        <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Estado</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Detalles</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {console.log('Renderizando con:', {
                                        mostrarInactivos,
                                        usuariosInactivos,
                                        usuarios,
                                        filtroTipo
                                    })}
                                    
                                    {searchId ? (
                                        responseById && Array.isArray(responseById) && responseById.length > 0 ? (
                                            <tr key={`search-${responseById[0].id_usuario || 'no-id'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{responseById[0].id_usuario}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{responseById[0].nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{responseById[0].tipo_usuario}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{responseById[0].email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        responseById[0].estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {responseById[0].estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <button 
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                        onClick={() => handleDetailsClick(responseById[0])}
                                                    >
                                                        Ver detalles
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <button 
                                                        key={`edit-${responseById[0].id_usuario}`}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md mr-2"
                                                        onClick={() => handleEditClick(responseById[0])}
                                                    >
                                                        Editar
                                                    </button>
                                                    {responseById[0].estado === 'activo' ? (
                                                        <button 
                                                            key={`deactivate-${responseById[0].id_usuario}`}
                                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                            onClick={() => confirmarDesactivacion(responseById[0].id_usuario)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? 'Procesando...' : 'Desactivar'}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            key={`activate-${responseById[0].id_usuario}`}
                                                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                            onClick={() => confirmarActivacion(responseById[0].id_usuario)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? 'Procesando...' : 'Activar'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key="no-results-search">
                                                <td colSpan="7" className="px-4 py-2 text-center">
                                                    No se encontró ningún usuario con ese ID
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        <>
                                            {mostrarInactivos 
                                                ? usuariosInactivos?.map((usuario, index) => (
                                                    <tr key={`inactivo-${usuario.id_usuario || index}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id_usuario}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.tipo_usuario}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                {usuario.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button 
                                                                onClick={() => handleDetailsClick(usuario)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                            >
                                                                Ver detalles
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button 
                                                                onClick={() => handleEditClick(usuario)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md mr-2"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => confirmarActivacion(usuario.id_usuario)}
                                                                disabled={isLoading}
                                                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                            >
                                                                {isLoading ? 'Procesando...' : 'Activar'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                                : (filtroTipo === 'todos' ? usuarios : usuariosFiltrados)?.map((usuario, index) => (
                                                    <tr key={`usuario-${usuario.id_usuario || index}-${usuario.estado || 'estado-desconocido'}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id_usuario}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.tipo_usuario}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                usuario.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {usuario.estado || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button 
                                                                onClick={() => handleDetailsClick(usuario)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                            >
                                                                Ver detalles
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button 
                                                                onClick={() => handleEditClick(usuario)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md mr-2"
                                                            >
                                                                Editar
                                                            </button>
                                                            {usuario.estado === 'activo' ? (
                                                                <button 
                                                                    onClick={() => confirmarDesactivacion(usuario.id_usuario)}
                                                                    disabled={isLoading}
                                                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                                >
                                                                    {isLoading ? 'Procesando...' : 'Desactivar'}
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => confirmarActivacion(usuario.id_usuario)}
                                                                    disabled={isLoading}
                                                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-colors duration-200 shadow-sm hover:shadow-md"
                                                                >
                                                                    {isLoading ? 'Procesando...' : 'Activar'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            
                                            {((mostrarInactivos && (!usuariosInactivos || usuariosInactivos.length === 0)) ||
                                              (!mostrarInactivos && (!usuarios || usuarios.length === 0))) && (
                                                <tr key="no-data">
                                                    <td colSpan="7" className="px-4 py-2 text-center">
                                                        {loading 
                                                            ? 'Cargando...' 
                                                            : `No hay usuarios ${mostrarInactivos ? 'inactivos' : ''} para mostrar`
                                                        }
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalles del Usuario */}
            {selectedUsuario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Detalles del Usuario</h2>
                            <button 
                                onClick={closeDetails}
                                className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-600">ID:</p>
                                <p className="text-base">{selectedUsuario.id_usuario}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Nombre:</p>
                                <p className="text-base">{selectedUsuario.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Tipo de Usuario:</p>
                                <p className="text-base">{selectedUsuario.tipo_usuario}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Email:</p>
                                <p className="text-base">{selectedUsuario.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Teléfono:</p>
                                <p className="text-base">{selectedUsuario.telefono}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Estado:</p>
                                <p className="text-base">{selectedUsuario.estado}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Creación - Actualizar el formulario */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Crear Usuario</h2>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={createFormData.nombre}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        nombre: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Tipo de Usuario
                                </label>
                                <select
                                    value={createFormData.tipo_usuario}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        tipo_usuario: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                >
                                    <option value="">Seleccione un tipo</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="particular">Particular</option>
                                    <option value="negocio">Negocio</option>
                                    <option value="domiciliario">Domiciliario</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={createFormData.email}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        email: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={createFormData.telefono}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        telefono: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={createFormData.password}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        password: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm md:text-base"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm md:text-base"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Editar Usuario</h2>
                            <button 
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditFormData(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={editFormData?.nombre || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        nombre: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Tipo de Usuario
                                </label>
                                <select
                                    name="tipo_usuario"
                                    value={editFormData?.tipo_usuario || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        tipo_usuario: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                >
                                    <option value="">Seleccione un tipo</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="particular">Particular</option>
                                    <option value="negocio">Negocio</option>
                                    <option value="domiciliario">Domiciliario</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData?.email || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        email: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm md:text-base font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={editFormData?.telefono || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        telefono: e.target.value
                                    })}
                                    className="w-full px-3 py-2 text-sm md:text-base border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditFormData(null);
                                    }}
                                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm md:text-base"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg text-sm md:text-base"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;    