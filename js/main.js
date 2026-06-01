// =========================================
// CROSSFADE GALLERY — sistema de dos capas
// =========================================

let rigActiveLayer='A'
let prodActiveLayer='A'

function crossfade(layerAId,layerBId,activeRef,newSrc,setActive){
 const layerA=document.getElementById(layerAId)
 const layerB=document.getElementById(layerBId)
 if(!layerA||!layerB)return

 const active=activeRef==='A'?layerA:layerB
 const inactive=activeRef==='A'?layerB:layerA

 // Precarga la nueva imagen antes de mostrarla
 const img=new Image()
 img.onload=()=>{
  inactive.querySelector('img').src=newSrc
  inactive.style.zIndex='3'
  active.style.zIndex='2'
  inactive.style.opacity='1'
  active.style.opacity='0'
  setActive(activeRef==='A'?'B':'A')
 }
 img.src=newSrc
}

const rigImages=[
 '00001.jpeg',
 '00002.jpeg',
 '00003.jpeg',
 '00004.jpeg',
 '00005.jpeg',
 '00006.jpeg'
]
let currentRigIndex=0

function updateRigGallery(){
 const src='productos/mattebox/rig M/'+rigImages[currentRigIndex]
 crossfade('rigLayerA','rigLayerB',rigActiveLayer,src,(v)=>{rigActiveLayer=v})
 const dots=document.querySelectorAll('#rigDots div')
 dots.forEach((dot,i)=>{
  dot.className='w-2 h-2 rounded-full '+(i===currentRigIndex?'bg-white/90':'bg-white/30')
 })
}

function nextRigImage(){
 currentRigIndex=(currentRigIndex+1)%rigImages.length
 updateRigGallery()
}

function prevRigImage(){
 currentRigIndex=(currentRigIndex-1+rigImages.length)%rigImages.length
 updateRigGallery()
}

function handleRigGalleryClick(event){
 const rect=event.currentTarget.getBoundingClientRect()
 const x=event.clientX-rect.left
 x<rect.width/2?prevRigImage():nextRigImage()
 startRigInterval()
}

let rigTouchStartX=0
const rigGallery=document.getElementById('rigGallery')
if(rigGallery){
 rigGallery.addEventListener('touchstart',(e)=>{rigTouchStartX=e.changedTouches[0].screenX},{passive:true})
 rigGallery.addEventListener('touchend',(e)=>{
  const diff=e.changedTouches[0].screenX-rigTouchStartX
  if(Math.abs(diff)>40){diff>0?prevRigImage():nextRigImage();startRigInterval()}
 },{passive:true})
}

let rigInterval=null

function startRigInterval(){
 if(rigInterval) clearInterval(rigInterval)
 rigInterval=setInterval(nextRigImage,5000)
}

// Inicializamos el auto-slide de la galería de rig al cargar
startRigInterval()

function stopRigInterval(){
 if(rigInterval){clearInterval(rigInterval);rigInterval=null}
}

const productImages={
 OBSIDIAN:['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg'],
 SAND:['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg'],
 OLIVE:['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg'],
 LAVA:['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg'],
 ARCTIC:['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg']
}

let currentColor='OBSIDIAN'
let currentProductIndex=0

function updateProductGallery(){
 const src='productos/mattebox/Colores M/'+currentColor.toLowerCase()+'/'+productImages[currentColor][currentProductIndex]
 crossfade('prodLayerA','prodLayerB',prodActiveLayer,src,(v)=>{prodActiveLayer=v})
 const dots=document.querySelectorAll('#productDots div')
 dots.forEach((dot,i)=>{
  dot.className='w-2 h-2 rounded-full '+(i===currentProductIndex?'bg-white/90':'bg-white/30')
 })
}

function nextProductImage(){
 currentProductIndex=(currentProductIndex+1)%5
 updateProductGallery()
}

function prevProductImage(){
 currentProductIndex=(currentProductIndex-1+5)%5
 updateProductGallery()
}

function handleProductGalleryClick(event){
 const rect=event.currentTarget.getBoundingClientRect()
 const x=event.clientX-rect.left
 x<rect.width/2?prevProductImage():nextProductImage()
}

let productTouchStartX=0
const productGallery=document.getElementById('productGallery')
if(productGallery){
 productGallery.addEventListener('touchstart',(e)=>{productTouchStartX=e.changedTouches[0].screenX},{passive:true})
 productGallery.addEventListener('touchend',(e)=>{
  const diff=e.changedTouches[0].screenX-productTouchStartX
  if(Math.abs(diff)>40){diff>0?prevProductImage():nextProductImage()}
 },{passive:true})
}

function selectColor(button){
 document.querySelectorAll('.color-button').forEach(btn=>btn.classList.remove('active-color'))
 button.classList.add('active-color')
 currentColor=button.querySelector('div').innerText.trim().toUpperCase()
 updateProductGallery()
}

const selectedExtras={reducers:false,adapter:false,engraving:false,customAdapter:false}
const basePrice=89990
let needsInvoice=false
let shippingPrice=5990
let shippingMethod='Bluexpress'

function updateFinalPrice(){
 let total=basePrice
 if(selectedExtras.reducers)total+=20000
 if(selectedExtras.adapter)total+=15000
 if(selectedExtras.customAdapter)total+=8000

 const engravingFree=selectedExtras.reducers&&selectedExtras.adapter

 if(selectedExtras.engraving&&!engravingFree){
  total+=8000
 }

 const engravingPrice=document.getElementById('engravingPrice')
 if(engravingPrice){
  engravingPrice.innerText=engravingFree?'Gratis':'+$8.000'
 }

 const finalPriceEl=document.getElementById('finalPrice')
 if(finalPriceEl) finalPriceEl.innerText='$'+total.toLocaleString('es-CL')

 const popupPrice=document.getElementById('popupFinalPrice')
 if(popupPrice){
  popupPrice.innerText='$'+(total+shippingPrice).toLocaleString('es-CL')
 }

 const extras=[]
 if(selectedExtras.reducers)extras.push('Kit reductores de filtros desde 77mm a 37mm')
 if(selectedExtras.adapter)extras.push('Adaptador 4x5 a filtros redondos de 77mm')
 if(selectedExtras.customAdapter){
  const customValue=document.getElementById('customAdapterInput')?.value?.trim()||''
  const customLens=document.getElementById('customLensInput')?.value?.trim()||''
  const parts=[]
  if(customValue) parts.push(customValue+'mm')
  if(customLens) parts.push(customLens)
  extras.push('Adaptador personalizado'+(parts.length ? ': '+parts.join(' — ') : ''))
 }

 const summaryExtras=document.getElementById('summaryExtras')
 if(summaryExtras){
  summaryExtras.innerHTML=extras.length?extras.map(e=>`<div>${e}</div>`).join(''):'Sin extras'
 }

 const summaryEngraving=document.getElementById('summaryEngraving')
 if(summaryEngraving){
  if(selectedExtras.engraving){
   const val=document.getElementById('engravingInput')?.value?.trim()||''
   summaryEngraving.innerText=val||'Pendiente'
  } else {
   summaryEngraving.innerText='No agregado'
  }
 }

 const summaryColor=document.getElementById('summaryColor')
 if(summaryColor) summaryColor.innerText=currentColor

 const summaryShipping=document.getElementById('summaryShipping')
 if(summaryShipping) summaryShipping.innerText=shippingMethod
}

function toggleExtra(type,button){
 selectedExtras[type]=!selectedExtras[type]
 button.classList.toggle('active-color')
 updateFinalPrice()
}

function toggleCustomAdapter(button){
 selectedExtras.customAdapter=!selectedExtras.customAdapter

 if(button){
  if(selectedExtras.customAdapter){
   button.classList.add('active-color')
  } else {
   button.classList.remove('active-color')
  }
 }

 const expanded=document.getElementById('customAdapterExpanded')
 if(expanded){
  if(selectedExtras.customAdapter){
   expanded.classList.remove('hidden')
  } else {
   expanded.classList.add('hidden')
  }
 }

 const inputIds=['customAdapterInput','customLensInput']
 for(let i=0;i<inputIds.length;i++){
  const el=document.getElementById(inputIds[i])
  if(el&&!el.dataset.bound){
   el.dataset.bound='true'
   el.addEventListener('input',updateFinalPrice)
  }
 }

 updateFinalPrice()
}

function toggleEngraving(button){
 selectedExtras.engraving=!selectedExtras.engraving
 button.classList.toggle('active-color',selectedExtras.engraving)
 const expanded=document.getElementById('engravingExpanded')
 if(expanded) expanded.classList.toggle('hidden',!selectedExtras.engraving)

 // Bind input en tiempo real la primera vez
 const input=document.getElementById('engravingInput')
 if(input&&!input.dataset.bound){
  input.dataset.bound='true'
  input.addEventListener('input',()=>updateFinalPrice())
 }

 updateFinalPrice()
}

function selectShipping(name,price,button){
 shippingMethod=name
 shippingPrice=price

 document.querySelectorAll('.shipping-button').forEach(btn=>btn.classList.remove('active-color'))
 button.classList.add('active-color')

 updateFinalPrice()
 validatePurchaseForm()
}

async function startCheckout(){
 const name=document.getElementById('customerName')?.value.trim()||''
 const phone=document.getElementById('customerPhone')?.value.trim()||''

 const orderDetails={
  name: name,
  phone: phone,
  color: currentColor,
  reducers: selectedExtras.reducers,
  adapter: selectedExtras.adapter,
  customAdapter: selectedExtras.customAdapter,
  customAdapterDetails: {
   mm: document.getElementById('customAdapterInput')?.value.trim()||'',
   lens: document.getElementById('customLensInput')?.value.trim()||''
  },
  engraving: selectedExtras.engraving,
  engravingText: document.getElementById('engravingInput')?.value.trim()||'',
  shippingMethod: shippingMethod,
  invoice: needsInvoice,
  invoiceDetails: {
   company: document.getElementById('invoiceCompany')?.value.trim()||'',
   rut: document.getElementById('invoiceRut')?.value.trim()||'',
   business: document.getElementById('invoiceBusiness')?.value.trim()||'',
   address: document.getElementById('invoiceAddress')?.value.trim()||''
  }
 }

 // Guardar en localStorage para recuperarlo en la página de éxito o error
 try {
  localStorage.setItem('last_order_details', JSON.stringify(orderDetails));
 } catch (e) {
  console.error('Error guardando en localStorage:', e);
 }

 const purchaseButton=document.getElementById('purchaseButton')
 if(purchaseButton){
  purchaseButton.disabled=true
  purchaseButton.innerText='Procesando pago...'
  purchaseButton.className='w-full py-5 rounded-2xl bg-white/30 text-white/40 font-semibold cursor-not-allowed transition-all duration-300'
 }

 try {
  const response = await fetch('/api/create-preference', {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json'
   },
   body: JSON.stringify(orderDetails)
  });

  if (!response.ok) {
   const errData = await response.json();
   throw new Error(errData.error || 'Error al generar la preferencia de pago.');
  }

  const result = await response.json();
  
  // Redirigir a Mercado Pago
  const redirectUrl = result.init_point;
  if (redirectUrl) {
   window.location.href = redirectUrl;
  } else {
   throw new Error('No se recibió la URL de redirección.');
  }

 } catch (error) {
  console.error('Error en el proceso de pago:', error);
  alert('Hubo un problema al procesar tu solicitud: ' + error.message + '\n\nPor favor, inténtalo de nuevo.');
  
  // Restaurar botón
  if(purchaseButton){
   purchaseButton.disabled=false
   purchaseButton.innerText='Pagar con Mercado Pago'
   purchaseButton.className='w-full py-5 rounded-2xl bg-white text-black font-semibold hover:scale-[1.01] transition-all duration-300'
  }
 }
}

function formatChilePhone(input){
 let value=input.value.replace(/\D/g,'')

 if(value.startsWith('56')){
  value=value.slice(2)
 }

 if(value.startsWith('9')){
  value=value.slice(1)
 }

 value=value.slice(0,8)

 let formatted='+56 9 '

 if(value.length>0){
  if(value.length<=4){
   formatted+=value
  }else{
   formatted+=value.slice(0,4)+' '+value.slice(4)
  }
 }

 input.value=formatted
}

function validatePurchaseForm(){
 const name=document.getElementById('customerName')?.value.trim()||''
 const phone=document.getElementById('customerPhone')?.value.trim()||''
 const purchaseButton=document.getElementById('purchaseButton')

 const phoneDigits=phone.replace(/\D/g,'').replace(/^569/,'')
 const validPhone=phone.startsWith('+56 9 ') && phoneDigits.length===8
 const validName=name.length>1
 const validShipping=shippingMethod.length>0

 if(purchaseButton){
  if(validName && validPhone && validShipping){
   purchaseButton.disabled=false
   purchaseButton.classList.remove('bg-white/30','text-white/40','cursor-not-allowed')
   purchaseButton.classList.add('bg-white','text-black','hover:scale-[1.01]')
  }else{
   purchaseButton.disabled=true
   purchaseButton.classList.add('bg-white/30','text-white/40','cursor-not-allowed')
   purchaseButton.classList.remove('bg-white','text-black','hover:scale-[1.01]')
  }
 }
}

function openPopup(){
 document.getElementById('popup').classList.remove('hidden')
 updateFinalPrice()
 validatePurchaseForm()
}

function toggleInvoice(button){
 needsInvoice=!needsInvoice

 const fields=document.getElementById('invoiceFields')

 if(fields){
  fields.classList.toggle('hidden',!needsInvoice)
 }

 if(button){
  button.innerText=needsInvoice?'Sí':'No'
  button.classList.toggle('active-color',needsInvoice)
 }
}

function closePopup(){
 document.getElementById('popup').classList.add('hidden')
}

const popup=document.getElementById('popup')

if(popup){
 popup.addEventListener('click',(event)=>{
  const popupCard=event.target.closest('.max-w-2xl')

  if(!popupCard){
   closePopup()
  }
 })
}

function openMatteboxPage(){
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const product=document.getElementById('productPage')
 
 if(overlay){
  overlay.classList.add('active')
 }

 home.classList.remove('page-visible')
 home.classList.add('page-hidden')

 setTimeout(()=>{
  home.classList.add('hidden')

  product.classList.remove('hidden')

  requestAnimationFrame(()=>{
   product.classList.remove('page-hidden')
   product.classList.add('page-visible')
  })

  // Arranca desde foto 1 y resetea el contador
  currentRigIndex=0
  updateRigGallery()
  startRigInterval()

  window.scrollTo({top:0,behavior:'smooth'})
 },170)

 setTimeout(()=>{
  if(overlay){
   overlay.classList.remove('active')
  }
 },560)
}

function goHome(){
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const product=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')

 stopRigInterval()

 if(overlay) overlay.classList.add('active')

 ;[product,tp1].forEach(el=>{
  if(el){el.classList.remove('page-visible');el.classList.add('page-hidden')}
 })

 setTimeout(()=>{
  if(product) product.classList.add('hidden')
  if(tp1) tp1.classList.add('hidden')
  home.classList.remove('hidden')
  requestAnimationFrame(()=>{
   home.classList.remove('page-hidden')
   home.classList.add('page-visible')
  })
  window.scrollTo({top:0,behavior:'smooth'})
 },170)

 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

function toggleMenu(){
 const menu=document.getElementById('dropdownMenu')
 if(menu){
  menu.classList.toggle('hidden')
 }
}

const phoneInput=document.getElementById('customerPhone')

if(phoneInput){
 phoneInput.addEventListener('focus',()=>{
  if(phoneInput.value.trim()===''){
   phoneInput.value='+56 9 '
  }
 })

 phoneInput.addEventListener('keydown',(e)=>{
  const protectedLength=6

  if((e.key==='Backspace' || e.key==='Delete') && phoneInput.selectionStart<=protectedLength){
   e.preventDefault()
  }
 })
}

// =========================================
// IMAGE PRELOAD
// Precarga imágenes para que los cambios
// entre galerías sean casi instantáneos
// =========================================

function preloadImages(){
 window.preloadedImages=window.preloadedImages||{}

 function cache(src){
  if(window.preloadedImages[src])return
  const img=new Image()
  img.src=src
  window.preloadedImages[src]=img
 }

 // Primeras imágenes de ambas galerías — prioritarias
 cache('productos/mattebox/rig M/'+rigImages[0])
 cache('productos/mattebox/rig M/'+rigImages[1])
 cache('productos/mattebox/Colores M/obsidian/'+productImages['OBSIDIAN'][0])
 cache('productos/mattebox/Colores M/obsidian/'+productImages['OBSIDIAN'][1])

 // Resto en idle
 requestIdleCallback(()=>{
  rigImages.forEach(f=>cache('productos/mattebox/rig M/'+f))
  Object.keys(productImages).forEach(color=>{
   productImages[color].forEach(f=>cache('productos/mattebox/Colores M/'+color.toLowerCase()+'/'+f))
  })
 },{timeout:3000})
}

preloadImages()

// =========================================
// TP1 GALLERIES
// =========================================

const tp1RigImages=['00001.jpeg','00002.jpeg','00003.jpeg','00004.jpeg','00005.jpeg','00006.jpeg']
let currentTp1RigIndex=0
let tp1RigActiveLayer='A'

function updateTp1RigGallery(){
 const src='productos/tp1/Rig TP/'+tp1RigImages[currentTp1RigIndex]
 crossfade('tp1RigLayerA','tp1RigLayerB',tp1RigActiveLayer,src,(v)=>{tp1RigActiveLayer=v})
 const dots=document.querySelectorAll('#tp1RigDots div')
 dots.forEach((dot,i)=>{dot.className='w-2 h-2 rounded-full '+(i===currentTp1RigIndex?'bg-white/90':'bg-white/30')})
}

function nextTp1RigImage(){currentTp1RigIndex=(currentTp1RigIndex+1)%tp1RigImages.length;updateTp1RigGallery()}
function prevTp1RigImage(){currentTp1RigIndex=(currentTp1RigIndex-1+tp1RigImages.length)%tp1RigImages.length;updateTp1RigGallery()}
function handleTp1RigGalleryClick(event){
 const rect=event.currentTarget.getBoundingClientRect()
 event.clientX-rect.left<rect.width/2?prevTp1RigImage():nextTp1RigImage()
}

let tp1RigTouchX=0
const tp1RigEl=document.getElementById('tp1RigGallery')
if(tp1RigEl){
 tp1RigEl.addEventListener('touchstart',(e)=>{tp1RigTouchX=e.changedTouches[0].screenX},{passive:true})
 tp1RigEl.addEventListener('touchend',(e)=>{
  const diff=e.changedTouches[0].screenX-tp1RigTouchX
  if(Math.abs(diff)>40){diff>0?prevTp1RigImage():nextTp1RigImage()}
 },{passive:true})
}

const tp1ProductImages=['00001.jpeg','00002.jpeg','00003.jpeg']
let currentTp1ProductIndex=0
let tp1ProdActiveLayer='A'

function updateTp1ProductGallery(){
 const src='productos/tp1/Colores TP/'+tp1ProductImages[currentTp1ProductIndex]
 crossfade('tp1ProdLayerA','tp1ProdLayerB',tp1ProdActiveLayer,src,(v)=>{tp1ProdActiveLayer=v})
 const dots=document.querySelectorAll('#tp1ProductDots div')
 dots.forEach((dot,i)=>{dot.className='w-2 h-2 rounded-full '+(i===currentTp1ProductIndex?'bg-white/90':'bg-white/30')})
}

function nextTp1ProductImage(){currentTp1ProductIndex=(currentTp1ProductIndex+1)%tp1ProductImages.length;updateTp1ProductGallery()}
function prevTp1ProductImage(){currentTp1ProductIndex=(currentTp1ProductIndex-1+tp1ProductImages.length)%tp1ProductImages.length;updateTp1ProductGallery()}
function handleTp1ProductGalleryClick(event){
 const rect=event.currentTarget.getBoundingClientRect()
 event.clientX-rect.left<rect.width/2?prevTp1ProductImage():nextTp1ProductImage()
}

let tp1ProdTouchX=0
const tp1ProdEl=document.getElementById('tp1ProductGallery')
if(tp1ProdEl){
 tp1ProdEl.addEventListener('touchstart',(e)=>{tp1ProdTouchX=e.changedTouches[0].screenX},{passive:true})
 tp1ProdEl.addEventListener('touchend',(e)=>{
  const diff=e.changedTouches[0].screenX-tp1ProdTouchX
  if(Math.abs(diff)>40){diff>0?prevTp1ProductImage():nextTp1ProductImage()}
 },{passive:true})
}

function openTp1Page(){
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const mattebox=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 if(overlay) overlay.classList.add('active')
 ;[home,mattebox].forEach(el=>{el.classList.remove('page-visible');el.classList.add('page-hidden','hidden')})
 setTimeout(()=>{
  tp1.classList.remove('hidden')
  requestAnimationFrame(()=>{tp1.classList.remove('page-hidden');tp1.classList.add('page-visible')})
  window.scrollTo({top:0,behavior:'smooth'})
 },170)
 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

// Inicializa la primera imagen del rig al cargar la página
updateRigGallery()
updateProductGallery()
updateFinalPrice()

window.addEventListener('click',(event)=>{
 const menu=document.getElementById('dropdownMenu')
 const menuButton=event.target.closest('button[onclick="toggleMenu()"]')
 const insideMenu=event.target.closest('#dropdownMenu')

 if(menu && !menu.classList.contains('hidden') && !insideMenu && !menuButton){
  menu.classList.add('hidden')
 }
})

// Protección de imágenes y video
document.addEventListener('contextmenu',(e)=>{
 if(e.target.tagName==='IMG'||e.target.tagName==='VIDEO'||e.target.closest('.gallery-wrap')){
  e.preventDefault()
 }
})

document.addEventListener('keydown',(e)=>{
 if((e.ctrlKey||e.metaKey)&&e.key==='s') e.preventDefault()
 if((e.ctrlKey||e.metaKey)&&e.key==='u') e.preventDefault()
})

document.addEventListener('dragstart',(e)=>{
 if(e.target.tagName==='IMG'||e.target.tagName==='VIDEO') e.preventDefault()
})
