import { useState } from "react"
const ButtonNew = ({nuevoProceso=null, titulo=null,toggleClientes=null,toggleProductos=null}) => {
    const [mostrarMenuFAB, setMostrarMenuFAB] = useState(false)
    // Función para alternar el menú FAB
    const toggleMenuFAB = () => {
        setMostrarMenuFAB(!mostrarMenuFAB)
    }
    // Funciones para manejar cada opción
    const handleNuevo = () => {
        nuevoProceso('')
        setMostrarMenuFAB(false)
    }

    const handleClientes = () => {
        toggleClientes()
        setMostrarMenuFAB(false)
    }

    const handleProductos = () => {
        toggleProductos()
        setMostrarMenuFAB(false)
    }

    return (
        <>
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            {mostrarMenuFAB && (
                <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMostrarMenuFAB(false)}
                ></div>
            )}

            {/* Botones secundarios del FAB */}
            <div className={`fixed bottom-36 right-5 z-50 transition-all duration-300 ${
                mostrarMenuFAB ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
                {/* Botón Productos */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Productos
                </span>
                <button
                    onClick={handleProductos}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-icon lucide-package"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>

                </button>
                </div>

                {/* Botón Clientes */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Clientes
                </span>
                <button
                    onClick={handleClientes}
                    className="p-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>

                {/* Botón Nuevo */}
                <div className="flex items-center mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm mr-3 shadow-lg whitespace-nowrap">
                    Nuevo {(titulo === 'Pedidos') ? 'pedido':'cotización'}
                </span>
                <button
                    onClick={handleNuevo}
                    className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
            </div>

            {/* Botón principal FAB */}
            <button 
                onClick={toggleMenuFAB}
                className={`fixed bottom-20 p-4 cursor-pointer rounded-full right-5 z-50 bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-300 botonAgregaNueva ${
                mostrarMenuFAB ? 'rotate-45' : 'rotate-0'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-10">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
            </button>
        </>
    )
}

export default ButtonNew;