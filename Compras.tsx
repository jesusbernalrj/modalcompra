import { useEffect, useState } from "react";
import useEcuaciones from "../../hooks/useEcuaciones";
import './compras.css'
import { usePosConfiguracionContext } from "../../context/PosConfiguracion";
import useScreenSize from "../../hooks/useScreenSize";
import { usePosContext } from "../../hooks/usePosContext";
import { useObtenerFecha } from "../../hooks/useFormato";
import products from '../../data/data.json'

interface ComprasProps {
  setModalOpen: React.Dispatch<React.SetStateAction<string>>
}
const Compras = ({setModalOpen}: ComprasProps) => {
  const {width} = useScreenSize()
   const {formato} = useObtenerFecha()
   const { crearNewProducto,ventas, usersByIndex, setCartItems, cartItems, indice, setVentas, getName} = usePosContext()
   const {subTotalProducto, subTotalProductoIva, totalArticulos, precioPuntos, IvaProducto} =  useEcuaciones()
   const {tools, toolsMonedas, puntosValor, setpuntosValor} = usePosConfiguracionContext()
   const tipoDeCambio = (moneda:number) => {
   const dollar = 16.76 
   const dolares = dollar * moneda
    return dolares
   }
   const currentCartItems = cartItems && cartItems[indice]

   const [inputsCompras, setInputsCompras] = useState({
    count: '',
    transferencia: '',
    tarjeta: '',
    countUSD: '',
    transferenciaUSD: '',
    tarjetaUSD: '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputsCompras((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };
   const quantityCartIitems = cartItems[indice]

   const countDolar = tipoDeCambio(Number(inputsCompras?.countUSD))
   const tranferenciaDolar = tipoDeCambio(Number(inputsCompras?.transferenciaUSD))
   const tarjetaDolar = tipoDeCambio(Number(inputsCompras?.tarjetaUSD))

   
    const recibo = Number(inputsCompras?.count) + Number(inputsCompras?.tarjeta) + Number(inputsCompras?.transferencia) + Number(countDolar || '') + Number(tranferenciaDolar || '') + Number(tarjetaDolar || '')
    const cambio =  Number(recibo) > subTotalProductoIva ? Number(recibo) - subTotalProductoIva : 0
    const combinedProducts = [ ...crearNewProducto, ...products,];

    const totalSinDescuento = combinedProducts?.map(item => {
        const find = quantityCartIitems?.find(car => car.id === item.img)
        const sumImpuesto = ((find?.quantity || 0) * Number(item.img)) * (.16)
        return (find?.quantity || 0) * Number(item.img) + sumImpuesto
      })
     const sum = totalSinDescuento?.reduce((a,c) => a+=c , 0)
     const ahorrar = sum - subTotalProductoIva
     console.log(ahorrar)
     const disableCompra = subTotalProductoIva >= recibo ? true : false
     const currentUsers = usersByIndex && usersByIndex[indice]
   const userId = currentUsers?.find(item => item.identificador)
    const usuarios = currentUsers?.find(item => item.identificador === userId?.identificador)
     const calcularPuntos = () => {
      const findVenta = ventas?.filter(item => item.idUser === usuarios?.identificador)
     
         if(findVenta){
           const regalo = findVenta?.map(item => item.puntos).reduce((a,c) => a  += (c || 0)  ,0)
           
           return regalo
           
         }else {
           return 0
         }
      }
      const [folio, setFolio] = useState(() => {
        const storedCount = localStorage.getItem("folio");
        return storedCount ? Number(storedCount) : 1;
      })

      useEffect(() => {
        localStorage.setItem("folio", folio.toString());
      }, [folio]);
      const folios = () => setFolio(folio + 1)
      const [checkMetodo, setCheckMetodo] = useState< { [key: number]: boolean }>({})

      const toogleCheckMetodo = (key: number) => {
       setCheckMetodo(prevCheck => ({
         ...prevCheck,
         [key]: !prevCheck[key]
       }) )
      }
      const  handleCloseModal = () => {
        setModalOpen('')
        }
        
        const metodoDePago = Number(inputsCompras.count) > 0 ? 'Efectivo' : Number(inputsCompras.countUSD) > 0  ? 'Dollar' 
        : Number(inputsCompras.transferencia )> 0 ? 'Tranferencia' :  Number(inputsCompras.transferenciaUSD) > 0 ? 'TranferenciaUSD' : Number(inputsCompras.tarjeta) > 0 ? 'Tarjeta' : Number(inputsCompras.tarjetaUSD) > 0 ? 'TarjetaUSD' : null
        const addItemsToVentas = () => {
          const ventaId = Date.now();
          setFolio(folio +1)
          const itemsToAdd = {
            id: ventaId,
            nameEmpleado: getName || 'Admin',
            name:usuarios?.cliente_nombre || 'Publico General',
            idUser:usuarios?.identificador,
            currentCartItems,
            folio,
            subTotalProductoIva,
            totalArticulos,
            formato,
            puntos: precioPuntos,
            metodoDePago:metodoDePago
          }
          setVentas((prevVentas) => [ itemsToAdd, ...prevVentas ]);
         
        };
         
        const onBuy = (e: React.FormEvent) => {
          e.preventDefault()
          folios()
          addItemsToVentas()
          setCartItems((prevCart) => ({
            ...prevCart,
            [indice] : prevCart[indice] = []
          }))
          window.open('http://127.0.0.1:5173/venta', '_blank')
          setInputsCompras({count:'', countUSD: '', tarjeta: '', tarjetaUSD: '', transferencia: '', transferenciaUSD: ''})
          setModalOpen('')

         }
     const widthScreen = width < 768 ? '90%' : '70%'

     

  return (
    <>
  <div
           className="modal fade show d-flex justify-content-center align-items-center"
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             width: '100%',
             height: '100%',
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             backgroundColor: 'rgba(0, 0, 0, 0.5)',
            
           }}
        >
          <div className="modal-dialog d-flex justify-content-center align-items-center " style={{width: '100%'}}>
            <div className="modal-content "     style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: widthScreen,
      height: "90vh",
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "5px",
      overflow: "hidden",
    }}>
              <div className="modal-header p-2">
                <h5 className="modal-title" id="exampleModalLabel">
                  Compra
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="row">
            { width > 1200 &&  <div className="col-6 compras">
              <div className="resumen-orden">
        <h1 className="text-dark">Resumen de Orden</h1>
        <div className="cliente">
            <p className="text-dark"><strong>Nombre:</strong> {usuarios?.cliente_nombre}</p>
            <p className="text-dark"><strong>Estado:</strong> {usuarios?.cliente_estado}</p>
            <p className="text-dark"><strong>Código Postal:</strong> {usuarios?.cliente_numero_clave}</p>
            <p className="text-dark"><strong>Teléfono:</strong>{usuarios?.cliente_telefonos}</p>
        </div>
       
        <div className="detalle-orden">
            <h1 className="text-dark">Detalle de la Orden</h1>
            
           <div className="d-flex justify-content-between">
           <strong className="text-dark">No. Pedido:</strong> <p className="text-dark">{totalArticulos}</p>
           </div>
           <div className="d-flex justify-content-between">
           <strong className="text-dark">SubTotal:</strong> <p className="text-dark">${subTotalProducto.toFixed(2)}</p>
           </div>
           <div className="d-flex justify-content-between">
           <strong className="text-dark">Ahorrando:</strong> <p className="text-dark">${0}</p>
           </div>
           <div className="d-flex justify-content-between">
           <strong className="text-dark">Impuesto:</strong> <p className="text-dark">${IvaProducto.toFixed(2)}</p>
           </div>
            <p className="text-dark"><strong>Total de la Orden:</strong> ${subTotalProductoIva.toFixed(2)}</p>
            <div className="d-flex justify-content-end">
            <button onClick={onBuy} className="btn btn-primary  buttonCompras " disabled={disableCompra}>Confirmar Compra</button>
            </div>
        </div>
      
    </div>
   
        </div>}
        <div className={width < 1200 ? 'col-12' : 'col-6' }>
        <div className="resumen-orden">
        <h1 className="text-dark">Opciones de Pago</h1>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex justify-content-between align-items-center">
        <label className="text-dark">Efectivo:</label>
        { toolsMonedas && toolsMonedas[0]?.boolean && <span><input className="mb-0 mt-0" onClick={() => toogleCheckMetodo(1)} type="checkbox"/>$</span>} 
        </div>
        <div className="d-flex justify-content-between align-items-center gap-2">
        {checkMetodo[0] ?  <input name="countUSD" value={inputsCompras?.countUSD} onChange={handleChange} className="form-control"/> :
        !checkMetodo[0]   && <input name="count" value={inputsCompras?.count} onChange={handleChange} className="form-control"/>               }
      </div>
      {
      tools &&  tools[0]?.boolean &&
        <>
      <div className="d-flex justify-content-between align-items-center">
        <label className="text-dark">Tranferencia:</label>
      
        { toolsMonedas &&  toolsMonedas[0]?.boolean && <span><input onClick={() => toogleCheckMetodo(2)} type="checkbox"/>$</span>}      </div>
      <div className="d-flex justify-content-between align-items-center gap-2">
      {!checkMetodo[1] ?  <input  name="tranferencia" value={inputsCompras?.transferencia} onChange={handleChange}  className="form-control"/>
                    : checkMetodo[1] && <input name="tranferenciaUSD" type="text" value={inputsCompras?.transferenciaUSD} onChange={handleChange} className="form-control"  /> }
      </div>
      </>
    }
      {
       tools&&  tools[1]?.boolean &&
        <>
        <div className="d-flex justify-content-between align-items-center">
        <label className="text-dark">Tarjeta:</label>
      
        { toolsMonedas[0]?.boolean && <span><input onClick={() => toogleCheckMetodo(3)} type="checkbox"/>$</span>}      </div>
      <div className="d-flex justify-content-between align-items-center gap-2">
      {!checkMetodo[2] ? <input name="tarjeta" value={inputsCompras?.tarjeta} onChange={handleChange}  className="form-control"/> 
       : checkMetodo[2] && <input  name="tarjetaUSD" type="text" value={inputsCompras?.transferenciaUSD} onChange={handleChange} className="form-control" />}
      </div>
      </>
      }
      { toolsMonedas && toolsMonedas[1]?.boolean &&
      <>
       <div className="d-flex justify-content-between align-items-center">
        <label className="text-dark">Puntos de Regalo:</label>  
      </div>
      <div className="d-flex justify-content-between align-items-center gap-2">
       <input className="form-control" value={puntosValor} onChange={e => setpuntosValor(Number(e.target.value))}/>
      </div>
      {calcularPuntos() && puntosValor > calcularPuntos() && <p>No tiene todo esos puntos</p>}
      </>
      }
     
      </div>
      <div>
      <div className="detalle-orden mt-5">
            <h1>Dinero Recibido</h1>
      <div className="d-flex justify-content-between">
           <strong className="text-dark">Recibo:</strong> <p className="text-dark">${recibo.toFixed()}</p>
           </div>
           <div className="d-flex justify-content-between">
           <strong className="text-dark">Cambio:</strong> <p className="text-dark">${cambio.toFixed()}</p>
           </div>
           <div className="d-flex justify-content-between">
           <strong className="text-dark">Puntos:</strong> <p className="text-dark">${calcularPuntos() - puntosValor}</p>
           </div>

           </div>
{  width < 1200 &&  <button onClick={onBuy} className="btn btn-primary w-100 " disabled={disableCompra}>Confirmar Compra</button>
}
      </div>
        </div>
        </div>
        </div>

              </div>

            </div>
          </div>
        </div>
    </>
  )
}

export default Compras