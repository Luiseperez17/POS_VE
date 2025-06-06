import { useParams, useNavigate } from "react-router"
import TopBarProceso from "../../components/global/TopBarProceso"
import { useState, useEffect } from "react"
import defaultImage  from '../../assets/img/default.png'
import Cantidades from "../../components/ventaExterna/Cantidades"
import ModalClientes from "../../components/global/modal/ModalClientes"
import ModalProductos from "../../components/global/modal/ModalProductos"
import ModalIA from "../../components/global/modal/ModalAI"
import ModalTodosProductos from "../../components/global/modal/ModalTodosProductos"
import { useAuth } from "../../context/AuthContext"
import CardProducto from "../../components/ventaExterna/CardProducto"
import Funciones from "../../helpers/Funciones"
import { useTourContext } from '../../context/TourContext';
import { db } from "../../db/db"
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';


const Proceso = () => {
    
    const {isAuthenticated, isLoading, currentUser }              = useAuth()
    const navigate                                                  = useNavigate()
    const {tipoProceso, idProceso}                                  = useParams()
    const [cargando, setCargando]                                   = useState(false)
    const [idPedidoActual, setPedidoActual]                         = useState(0)
    const [showModalTodosProductos, setShowModalTodosProductos]     = useState(false);
    const [showClientes, setShowClientes]                           = useState(false);
    const [showProductos, setShowProductos]                         = useState(false);
    const [showIA, setShowIA]                                       = useState(false);
    const [clienteSel, setClienteSel]                               = useState({})   
    const [cabezaPedido, setCabezaPedido]                           = useState({})
    const [listaCarrito, setListaCarrito]                           = useState({})
    const [totalSolicitadas, setTotalSolicitadas]                   = useState(0)
    const [totalBonificadas, setTotalBonificadas]                   = useState(0)
    // Nuevo estado para controlar el colapso del panel de totales
    const [showDetails, setShowDetails]                             = useState(false);
    const { startTour}                                              = useTourContext();
    const agregadoCarrito                                           = () => toast("✅ Agregado al carrito!");

    const [totales, setTotales]                                     = useState({
        total:0,
        subTotal:0,
        totalImpuestos:0
    })

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tourProceso');
        if (!hasSeenTour) {
            startTour('proceso');
            localStorage.setItem('tourProceso', 'true');
        }
    }, [startTour]);

    useEffect(() => {
        if(!isLoading){
            if(!isAuthenticated){
            navigate('/login')
        }
    }
    },[isAuthenticated])


    useEffect(() => {
        initializeProcess();
    }, [tipoProceso, idProceso]); // Agregar dependencias correctas

    useEffect(() => {
        // Actualizar cabeza cuando cambie el cliente seleccionado
        if (clienteSel && Object.keys(clienteSel).length > 0 && idPedidoActual) {
            updateCabezaConCliente();
        }
    }, [clienteSel, idPedidoActual]);
    
    useEffect(() => {
        // Actualizar cabeza cuando cambie el cliente seleccionado
        if (cabezaPedido && Object.keys(cabezaPedido).length > 0 && idPedidoActual) {
            getListaItems();
        }
    }, [cabezaPedido]);
    
    useEffect(() => {
        // Actualizar cabeza cuando cambie el cliente seleccionado
        if (cabezaPedido && Object.keys(cabezaPedido).length > 0 && idPedidoActual) {
            calculaCantidades()
        }

        if (listaCarrito && Object.keys(listaCarrito).length > 0) {
            capturaTotales()
        }
    }, [listaCarrito]);


    async function initializeProcess() {
        setCargando(true);
        
        try {
            // Cuando el pedido no existe lo creo
            if(idProceso === undefined){
                const nuevaCabeza = {
                    id_consec:uuidv4(),
                    DocNum:0,
                    DocEntry:0,
                    in_tipo:tipoProceso,
                    num_doc:0,
                    num_fac:0,
                    tx_cod_sn:'',
                    tx_nom_sn_nombre:'',
                    tx_dir_cli_pos:'',
                    tx_tel_cli_pos:"",
                    tx_cod_alm_pos:"",
                    in_subtot_pos:0,
                    in_vlr_total:0,
                    in_vlr_total_imp:0,
                    in_estado:0,
                    dt_fecha_reg:new Date(),
                    tx_usua:currentUser ? currentUser.id_usuario : '',
                    tx_comentarios:"",
                    tx_nom_emp:'-Ningún empleado del departamento de ventas-',
                    in_cod_emp:0,
                    resp_api:'',
                    in_lst_precio:0,
                    tx_usuario_logueado:currentUser ? currentUser.id_usuario : '',
                    es_cotizacion:0,
                    sync:0,
                };
                
                // Inserto una nueva cabeza para obtener el id
                const id = await db.cabeza.add(nuevaCabeza);
                
                // Pongo el id del pedido en localStorage
                localStorage.setItem('idPedidoActual', id);
                localStorage.setItem('tipoProceso', tipoProceso);
                setPedidoActual(id);
                
                // Establezco la cabeza del pedido
                setCabezaPedido({...nuevaCabeza, id});
                
                // Redirecciono al usuario a la pagina con el idDelPedido
                navigate(`/proceso/${tipoProceso}/${id}`);
            } else {
                // Pongo el id del pedido en localStorage
                localStorage.setItem('idPedidoActual', idProceso);
                localStorage.setItem('tipoProceso', tipoProceso);
                setPedidoActual(idProceso);
                
                // Consulto la data del pedido actual para persistir
                const infoCabeza = await db.cabeza.get(parseInt(idProceso));
                
                if (infoCabeza) {
                    setCabezaPedido(infoCabeza);
                } else {
                    console.error('No se encontró la cabeza del pedido con ID:', idProceso);
                }
            }
        } catch (error) {
            console.error('Error al inicializar el proceso:', error);
        } finally {
            setCargando(false);
        }
    }

    const updateCabezaConCliente = async () => {
        try {
            const cabezaActualizada = {
                ...cabezaPedido,
                tx_cod_sn: clienteSel.Codigo || '',
                tx_nom_sn_nombre: clienteSel.Nombre || '',
                tx_dir_cli_pos: clienteSel.Direccion || '',
                tx_tel_cli_pos: clienteSel.Telefono || '',
            };
            
            await db.cabeza.update(parseInt(idPedidoActual), cabezaActualizada);
            setCabezaPedido(cabezaActualizada);
        } catch (error) {
            console.error('Error al actualizar cabeza con cliente:', error);
        }
    };

    const toggleModalTodosProductos = () => {
        setShowModalTodosProductos(!showModalTodosProductos);
    };

    const toggleClientes = () => {
        setShowClientes(!showClientes);
    }; 
    
    const toggleProductos= () => {
        setShowProductos(!showProductos);
    };
    
    const toggleIA = () => {
        setShowIA(!showIA);
    };

    // Nueva función para toggle del panel de detalles
    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const handleCantidad = (tipo, item, cantidad) => {
        // Implementar lógica para manejar cantidades
    }

    const items = Array(2).fill().map((_, index) => ({
        id: 1234 + index,
        nombre: 'ABONADORA SEMBRADORA X 12 KILOS '+index,
        cantidad:0,
        codigoItem:'ACCGRAE35N',
        sync: (index % 4 === 0)? false: true
    }));

    // Función para obtener el título
    const getTitulo = () => {
        if (cargando) return 'Cargando...';
        
        if (!cabezaPedido || !cabezaPedido.id_consec) return 'Cargando...';
        
        const ultimosDigitos = String(cabezaPedido.id_consec).slice(-5);
        
        if (tipoProceso?.toLowerCase() === 'pedidos') {
            return `Pedido ****${ultimosDigitos}`;
        } else {
            return `Cotización ****${ultimosDigitos}`;
        }
    };

    //funcion que agrega al acarrito las lineas
    const handleAddToCar = async (item)=>{
        if(parseInt(item.CantSolicitada) === 0 && parseInt(item.CantBonificada) === 0){
            Funciones.alerta("Atención","Debe seleccionar una cantidad para agregar al carrito, ya sea cantidad normal o bonificada","info",()=>{})
        }
        else{
            const dataGuardarLinea = {
                in_id_cabeza:cabezaPedido.id,
                ItemCode:item.ItemCode,
                Articulo:item.Articulo,
                Precio:item.Precio,
                CantSolicitada:item.CantSolicitada,
                CantBonificada:item.CantBonificada,
                Cantidad:item.Cantidad,
                CodigoBarras:item.CodigoBarras,
                in_dto_pos:0,
                Impuesto:item.Impuesto,
                PorcImpto:item.PorcImpto,
                in_estado_lin_pos:0,
                dt_fecha_reg: new Date(),
                tx_usua_reg:currentUser ? currentUser.id_usuario : '',
                CodAlmacen:item.CodAlmacen,
                sync:0,
            }
            await db.lineas.add(dataGuardarLinea);
            getListaItems()
            agregadoCarrito()
            
        }

    }

    const getListaItems = async () => {
        console.log(cabezaPedido.id)
        const lista = await db.lineas.where('in_id_cabeza').equals(cabezaPedido.id).toArray()
        setListaCarrito(lista)
    }
    const calculaCantidades = (lista) => {
        let totalCantidad = 0;
        let totalCantidadBonificada = 0;

        listaCarrito.forEach(item => {
            totalCantidad += parseInt(item.CantSolicitada) || 0;
            totalCantidadBonificada += parseInt(item.CantBonificada) || 0;
        });
        setTotalSolicitadas(totalCantidad)
        setTotalBonificadas(totalCantidadBonificada)
    }

    const capturaTotales = async () => {
        let descuento = 0;
        let subtotal  = 0;
        let impuestosBon  = 0;
        let totalNoImp  = 0;
        let impuestos  = 0;
        let total  = 0;
        let cantTotal  = 0;
        let cantTotalBon  = 0;
        for(let a in listaCarrito){
            let descAplicar = 0;
            subtotal    = listaCarrito[a].Precio * listaCarrito[a].CantSolicitada;
            let descto  = 0;
            if(descAplicar > 0){
              descto     = ((subtotal * descAplicar) / 100);
              descuento += descto;
            }
            impuestosBon =  0;

            if(listaCarrito[a].CantBonificada > 0){
              impuestosBon = ((parseFloat(listaCarrito[a].PorcImpto) / 100) * (listaCarrito[a].Precio * listaCarrito[a].CantBonificada));
            }
            //calculo los totales
            totalNoImp += subtotal;
            impuestos  += ((parseFloat(listaCarrito[a].PorcImpto) / 100) * (parseFloat(subtotal) - parseFloat(descto)));
            impuestos  += impuestosBon;
            
            total       = (totalNoImp + impuestos) - descuento;
            cantTotal += listaCarrito[a].in_cantidad_pos;
            cantTotalBon += listaCarrito[a].in_cantbonif_pos;

            const dataUpdate = {
                in_vlr_total:total,
                in_subtot_pos:totalNoImp,
                in_vlr_total_imp:impuestos
             }
             await db.cabeza.update(cabezaPedido.id, dataUpdate);
             
          }
    }

    return (
        <>
            <TopBarProceso titulo={getTitulo()} toggleIA={toggleIA} listaCarrito={listaCarrito} tipoProceso={tipoProceso} idProceso={idProceso} startTour={startTour}/>
            
            <div className="w-full lg:w-[54%] md:p-10 m-auto  mt-[22%] lg:mt-[3%] md:mt-[5%] flex flex-wrap text-gray-700 relative">
                <div className="shadow-lg w-full">
                    <div className="w-full px-[5%] lg:px-[3%] mb-4 font-bold">
                        <div className="w-full flex items-center justify-between text-gray-500">
                            <small>Escoge un cliente</small>
                        </div>
                        <div className="flex items-center justify-between clienteSeleccionado">
                            {
                                (cabezaPedido.tx_nom_sn_nombre && cabezaPedido.tx_nom_sn_nombre !== "") ? cabezaPedido.tx_nom_sn_nombre : "SELECCIONA UN CLIENTE"
                            }
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 cursor-pointer agregaCliente" onClick={toggleClientes}>
                                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                            </svg>

                        </div>
                    </div>
                    <div className="w-full grid grid-cols-12 px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 items-center justify-between ">
                        <h2 className="col-span-11 grid items-center uppercase">
                            Productos agregados
                            <small className="font-normal cantidadesPedido">
                                Solicitadas: {totalSolicitadas} | Bonificadas: {totalBonificadas}
                            </small>
                            {/* <span className="bg-red-700 p-2 rounded-full text-white w-[30px] h-[30px] flex items-center justify-center ml-2">{listaCarrito.length}</span> */}
                        </h2>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"  className=" col-span-1 size-8 cursor-pointer agregaProductos" onClick={toggleProductos}>
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                        </svg>

                    </div>
                </div>

                {/* productos */}
                <div className="w-full px-[5%] lg:px-[3%] font-bold border-t-1 py-4 border-gray-300 h-auto mb-30 carrito">

                        {listaCarrito && listaCarrito.length > 0 ? (
                            listaCarrito.map((item, index) => (
                                <CardProducto item={item} key={index} index={index} buttonAdd={false} buttonDel={true} initializeProcess={initializeProcess} modificaDb={true}/>
                        ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-6xl mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-30">
                                        <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tu carrito está vacío
                                </h3>
                                <p className="text-gray-500 text-center">
                                    No hay productos agregados al {tipoProceso} aún
                                </p>
                            </div>
                        )}

                       
                </div>
            </div>
            
            {/* Panel de Totales Colapsable */}
            <div className="w-full bg-black text-white fixed bottom-0 totales">
                <div className="p-4">
                    {/* Botón de toggle con flecha */}
                    <div className="flex justify-center mb-0 relative">
                        <button 
                            onClick={toggleDetails}
                            className="flex items-center justify-center transition-colors duration-100 absolute bg-black top-[-30px] rounded-t-lg py-1 px-10"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                className={`w-6 h-6 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                            >
                                <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Detalles colapsables */}
                    <div className={`overflow-hidden transition-all duration-75 ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="space-y-3 mb-4">
                            {/* Subtotal */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="font-normal">Subtotal:</span>
                                <span className="font-normal">
                                    ${cabezaPedido.in_subtot_pos ? cabezaPedido.in_subtot_pos.toLocaleString('es-CO') : '0'}
                                </span>
                            </div>
                            
                            {/* Impuestos */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="font-normal">Impuestos (IVA):</span>
                                <span className="font-normal">
                                    ${cabezaPedido.in_vlr_total_imp ? cabezaPedido.in_vlr_total_imp.toLocaleString('es-CO') : '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Total - siempre visible */}
                    <div className="flex justify-between items-center py-3">
                        <span className="text-lg font-bold">TOTAL:</span>
                        <span className="text-xl font-bold">
                            ${cabezaPedido.in_vlr_total ? cabezaPedido.in_vlr_total.toLocaleString('es-CO') : '0'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal clientes*/}
            <ModalClientes showClientes={showClientes} toggleClientes={toggleClientes} setClienteSel={setClienteSel} />
            {/* fin del modal clientes */}

            {/* Modal productos*/}
            <ModalProductos showProductos={showProductos} toggleProductos={toggleProductos} handleAddToCar={handleAddToCar}/>
            {/* fin del modal productos */}

            {/* Modal IA*/}
            <ModalIA showIA={showIA} toggleIA={toggleIA}/>
            {/* fin del modal IA */}

            {/* modal todos lo productos */}
            <ModalTodosProductos toggleModalTodosProductos={toggleModalTodosProductos} items={items} showModalTodosProductos={showModalTodosProductos}/>
            {/* fin modal todos lo productos */}
        </>
    )
}

export default Proceso