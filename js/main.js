// =========================================
// POLYFILLS para Safari / iOS
// =========================================
window.requestIdleCallback = window.requestIdleCallback || function(cb) { return setTimeout(cb, 1); };
window.cancelIdleCallback = window.cancelIdleCallback || function(id) { clearTimeout(id); };

// Scroll lock helper para iOS (overflow:hidden no funciona en body)
let _scrollLockY = 0;
function lockBodyScroll() {
  _scrollLockY = window.scrollY;
  document.body.classList.add('ios-scroll-lock');
  document.body.style.top = `-${_scrollLockY}px`;
}
function unlockBodyScroll() {
  document.body.classList.remove('ios-scroll-lock');
  document.body.style.top = '';
  window.scrollTo(0, _scrollLockY);
}

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

// =========================================
// HOMEPAGE BANNER SLIDESHOW
// =========================================
const bannerImages = [
  { file: 'productos/banner/foto1.jpeg', title: 'Matte Box MKB-V4', link: '#mkb-v4', color: 'text-blue-500', btnText: 'Ver Producto' },
  { file: 'productos/portadaP3.jpeg', title: 'Cocteleria 3D x Gabo3Dprint', link: '#gabo3dprint', color: 'text-yellow-500', btnText: 'Ver Portafolio' },
  { file: 'productos/portada_talleres.jpg', title: 'Talleres', link: '#talleres', color: 'text-green-500', btnText: 'Ver Talleres' },
  { file: 'productos/preview_comparador.jpg', title: 'Comparador de Cámaras', link: 'comparador.html', color: 'text-purple-500', btnText: 'Comparar Ahora' },
  { file: 'productos/banner/foto3.jpeg', title: 'Matte Box MKB-V4', link: '#mkb-v4', color: 'text-blue-500', btnText: 'Ver Producto' },
  { file: 'productos/portadaP3.jpeg', title: 'Cocteleria 3D x Gabo3Dprint', link: '#gabo3dprint', color: 'text-yellow-500', btnText: 'Ver Portafolio' },
  { file: 'productos/portada_talleres.jpg', title: 'Talleres', link: '#talleres', color: 'text-green-500', btnText: 'Ver Talleres' }
];
let currentBannerIndex = 0;
let bannerActiveLayer = 'A';
let bannerInterval = null;

function updateBannerGallery() {
  const item = bannerImages[currentBannerIndex];
  const src = item.file;
  crossfade('bannerLayerA', 'bannerLayerB', bannerActiveLayer, src, (v) => { bannerActiveLayer = v; });
  
  // Actualizar los dots
  const dotsContainer = document.getElementById('bannerDots');
  if (dotsContainer) {
    if (dotsContainer.children.length !== bannerImages.length) {
      dotsContainer.innerHTML = '';
      bannerImages.forEach(() => {
        const dot = document.createElement('div');
        dotsContainer.appendChild(dot);
      });
    }
    const dots = dotsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].className = 'w-2 h-2 rounded-full transition-all duration-300 ' + (i === currentBannerIndex ? 'bg-white w-4' : 'bg-white/30');
    }
  }

  // Actualizar banner de información debajo
  const infoTitle = document.getElementById('bannerInfoTitle');
  const infoLink = document.getElementById('bannerInfoLink');
  const infoDot = document.getElementById('bannerInfoDot');
  
  if (infoTitle) infoTitle.innerText = item.title;
  if (infoLink) {
    infoLink.href = item.link;
    infoLink.innerText = item.btnText;
    
    if (item.link.startsWith('#')) {
      infoLink.onclick = (e) => {
        e.preventDefault();
        window.location.hash = item.link;
      };
    } else {
      infoLink.onclick = null;
    }
  }
  if (infoDot) {
    infoDot.className = 'w-2.5 h-2.5 rounded-full transition-colors duration-300 shadow-[0_0_8px_currentColor] ' + item.color;
  }
}

function nextBannerImage() {
 currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
 updateBannerGallery();
}

function prevBannerImage() {
 currentBannerIndex = (currentBannerIndex - 1 + bannerImages.length) % bannerImages.length;
 updateBannerGallery();
}

function handleBannerGalleryClick(event) {
 const rect = event.currentTarget.getBoundingClientRect();
 const x = event.clientX - rect.left;
 x < rect.width / 2 ? prevBannerImage() : nextBannerImage();
 startBannerInterval();
}

let bannerTouchStartX = 0;
const bannerGallery = document.getElementById('bannerGallery');
if (bannerGallery) {
 bannerGallery.addEventListener('touchstart', (e) => { bannerTouchStartX = e.changedTouches[0].screenX; }, { passive: true });
 bannerGallery.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].screenX - bannerTouchStartX;
  if (Math.abs(diff) > 40) {
   diff > 0 ? prevBannerImage() : nextBannerImage();
   startBannerInterval();
  }
 }, { passive: true });
}

function startBannerInterval() {
 if (bannerInterval) clearInterval(bannerInterval);
 bannerInterval = setInterval(nextBannerImage, 5000);
}

function stopBannerInterval() {
 if (bannerInterval) {
  clearInterval(bannerInterval);
  bannerInterval = null;
 }
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
   dot.className='w-2 h-2 rounded-full transition-all duration-300 '+(i===currentRigIndex?'bg-white/90 w-4':'bg-white/30')
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
   dot.className='w-2 h-2 rounded-full transition-all duration-300 '+(i===currentProductIndex?'bg-white/90 w-4':'bg-white/30')
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

const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'true';

let activeProduct = 'MATTEBOX'; // Puede ser 'MATTEBOX' o 'TP1'

const selectedExtras={reducers:false,adapter:false,engraving:false,customAdapter:false}
const basePrice = isTestMode ? 100 : 74990;
let needsInvoice=false
let shippingPrice = isTestMode ? 1 : 5990;
let shippingMethod='Bluexpress'

function updateFinalPrice(){
 if (activeProduct === 'TP1') {
  const finalPriceEl=document.getElementById('finalPrice')
  if(finalPriceEl) finalPriceEl.innerText='$100'

  const popupPrice=document.getElementById('popupFinalPrice')
  if(popupPrice){
   popupPrice.innerText='$100'
  }

  const summaryColor=document.getElementById('summaryColor')
  if(summaryColor) summaryColor.innerText='Estándar'

  const summaryExtras=document.getElementById('summaryExtras')
  if(summaryExtras) summaryExtras.innerHTML='Ninguno'

  const summaryEngraving=document.getElementById('summaryEngraving')
  if(summaryEngraving) summaryEngraving.innerText='No aplica'

  const summaryShipping=document.getElementById('summaryShipping')
  if(summaryShipping) summaryShipping.innerText='Coordinación directa (Gratis)'
  
  return;
 }

 let total=basePrice
 if(selectedExtras.reducers)total+= (isTestMode ? 1 : 20000)
 if(selectedExtras.adapter)total+= (isTestMode ? 1 : 15000)
 if(selectedExtras.customAdapter)total+= (isTestMode ? 1 : 8000)

 const engravingFree = !isTestMode && (selectedExtras.reducers && selectedExtras.adapter);

 if(selectedExtras.engraving&&!engravingFree){
  total+= (isTestMode ? 1 : 8000)
 }

 const engravingPrice=document.getElementById('engravingPrice')
 if(engravingPrice){
  engravingPrice.innerText=engravingFree?'Gratis':(isTestMode ? '+$1' : '+$8.000')
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
 shippingPrice=isTestMode ? (price === 0 ? 0 : 1) : price

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
  },
  testMode: isTestMode,
  activeProduct: activeProduct
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
  // Si estamos en entorno local, simular el proceso de pago para probar el flujo completo offline sin consumir créditos ni dar error
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')) {
    console.log('Entorno local detectado. Simulando flujo de pago offline...');
    setTimeout(() => {
      window.location.href = '/pago-exitoso.html';
    }, 1500);
    return;
  }

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
 activeProduct = 'MATTEBOX';
 const titleEl = document.getElementById('popupProductTitle');
 if (titleEl) titleEl.innerText = 'MATTE BOX MKB-V4';
 document.getElementById('popup').classList.remove('hidden')
 lockBodyScroll();
 updateFinalPrice()
 validatePurchaseForm()
}

function openPurchasePopupForTP1(){
 activeProduct = 'TP1';
 const titleEl = document.getElementById('popupProductTitle');
 if (titleEl) titleEl.innerText = 'FOOT RIG TP1';
 document.getElementById('popup').classList.remove('hidden')
 lockBodyScroll();
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
 unlockBodyScroll();
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

function openMatteboxPage(fromHash = false){
 if(!fromHash){
  window.location.hash = 'mkb-v4';
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const product=document.getElementById('productPage')
 const gabo3d=document.getElementById('gabo3dprintPage')
 const talleres=document.getElementById('talleresPage')
 
 stopBannerInterval()
 
 if(overlay){
  overlay.classList.add('active')
 }

 ;[home,catalog,gabo3d,talleres].forEach(el=>{
  if(el){el.classList.remove('page-visible');el.classList.add('page-hidden')}
 })

 setTimeout(()=>{
  if(home) home.classList.add('hidden')
  if(catalog) catalog.classList.add('hidden')
  if(gabo3d) gabo3d.classList.add('hidden')
  if(talleres) talleres.classList.add('hidden')

  product.classList.remove('hidden')
  product.offsetHeight; // Force reflow for Safari

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

function goHome(fromHash = false){
 if(!fromHash){
  window.location.hash = 'inicio';
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const product=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 const gabo3d=document.getElementById('gabo3dprintPage')
 const talleres=document.getElementById('talleresPage')

 stopRigInterval()
 stopBannerInterval()

 if(overlay) overlay.classList.add('active')

 ;[catalog,product,tp1,gabo3d,talleres].forEach(el=>{
  if(el){el.classList.remove('page-visible');el.classList.add('page-hidden')}
 })

 setTimeout(()=>{
  if(catalog) catalog.classList.add('hidden')
  if(product) product.classList.add('hidden')
  if(tp1) tp1.classList.add('hidden')
  if(gabo3d) gabo3d.classList.add('hidden')
  if(talleres) talleres.classList.add('hidden')
  
  home.classList.remove('hidden')
  home.offsetHeight; // Force reflow for Safari
  requestAnimationFrame(()=>{
   home.classList.remove('page-hidden')
   home.classList.add('page-visible')
  })
  
  currentBannerIndex = 0
  updateBannerGallery()
  startBannerInterval()
  
  window.scrollTo({top:0,behavior:'smooth'})
 },170)

 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

function openCatalogPage(fromHash = false){
 if(!fromHash){
  window.location.hash = 'productos';
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const product=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 const gabo3d=document.getElementById('gabo3dprintPage')
 const talleres=document.getElementById('talleresPage')

 stopBannerInterval()

 if(overlay) overlay.classList.add('active')

 ;[home,product,tp1,gabo3d,talleres].forEach(el=>{
  if(el){el.classList.remove('page-visible');el.classList.add('page-hidden')}
 })

 setTimeout(()=>{
  if(home) home.classList.add('hidden')
  if(product) product.classList.add('hidden')
  if(tp1) tp1.classList.add('hidden')
  if(gabo3d) gabo3d.classList.add('hidden')
  if(talleres) talleres.classList.add('hidden')
  
  catalog.classList.remove('hidden')
  catalog.offsetHeight; // Force reflow for Safari
  requestAnimationFrame(()=>{
   catalog.classList.remove('page-hidden')
   catalog.classList.add('page-visible')
  })
  window.scrollTo({top:0,behavior:'smooth'})
 },170)

 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

function openGabo3DprintPage(fromHash = false){
 if(!fromHash){
  window.location.hash = 'gabo3dprint';
  return;
 }
 const gabo3d=document.getElementById('gabo3dprintPage')
 if(gabo3d && !gabo3d.classList.contains('hidden')){
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const product=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 const talleres=document.getElementById('talleresPage')

 stopBannerInterval()

 if(overlay) overlay.classList.add('active')

 ;[home,catalog,product,tp1,talleres].forEach(el=>{
  if(el){el.classList.remove('page-visible');el.classList.add('page-hidden')}
 })

 setTimeout(()=>{
  if(home) home.classList.add('hidden')
  if(catalog) catalog.classList.add('hidden')
  if(product) product.classList.add('hidden')
  if(tp1) tp1.classList.add('hidden')
  if(talleres) talleres.classList.add('hidden')
  
  if(gabo3d) {
   gabo3d.classList.remove('hidden')
   gabo3d.offsetHeight; // Force reflow for Safari
   requestAnimationFrame(()=>{
    gabo3d.classList.remove('page-hidden')
    gabo3d.classList.add('page-visible')
    initGabo3dScrollReveal()
   })
  }
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

 // Primeras imágenes de ambas galerías y banner — prioritarias
 bannerImages.forEach(f=>cache(f.file))
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

const tp1RigImages=['portada.jpeg']
let currentTp1RigIndex=0
let tp1RigActiveLayer='A'

function updateTp1RigGallery(){
 const src='productos/tp1/Rig TP/'+tp1RigImages[currentTp1RigIndex]
 crossfade('tp1RigLayerA','tp1RigLayerB',tp1RigActiveLayer,src,(v)=>{tp1RigActiveLayer=v})
  const dots=document.querySelectorAll('#tp1RigDots div')
  dots.forEach((dot,i)=>{dot.className='w-2 h-2 rounded-full transition-all duration-300 '+(i===currentTp1RigIndex?'bg-white/90 w-4':'bg-white/30')})
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
  dots.forEach((dot,i)=>{dot.className='w-2 h-2 rounded-full transition-all duration-300 '+(i===currentTp1ProductIndex?'bg-white/90 w-4':'bg-white/30')})
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

function openTp1Page(fromHash = false){
 if(!fromHash){
  window.location.hash = 'tp1';
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const mattebox=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 const gabo3d=document.getElementById('gabo3dprintPage')
 const talleres=document.getElementById('talleresPage')
 
 stopBannerInterval()
 
 if(overlay) overlay.classList.add('active')
 ;[home,catalog,mattebox,gabo3d,talleres].forEach(el=>{
  if(el){
   el.classList.remove('page-visible')
   el.classList.add('page-hidden','hidden')
  }
 })
 setTimeout(()=>{
   tp1.classList.remove('hidden')
   tp1.offsetHeight; // Force reflow for Safari
   requestAnimationFrame(()=>{tp1.classList.remove('page-hidden');tp1.classList.add('page-visible')})
  window.scrollTo({top:0,behavior:'smooth'})
 },170)
 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

function openTalleresPage(fromHash = false){
 if(!fromHash){
  window.location.hash = 'talleres';
  return;
 }
 const overlay=document.getElementById('transitionOverlay')
 const home=document.getElementById('homePage')
 const catalog=document.getElementById('catalogPage')
 const product=document.getElementById('productPage')
 const tp1=document.getElementById('tp1Page')
 const gabo3d=document.getElementById('gabo3dprintPage')
 const talleres=document.getElementById('talleresPage')
 
 stopBannerInterval()
 
 if(overlay) overlay.classList.add('active')
 ;[home,catalog,product,tp1,gabo3d].forEach(el=>{
  if(el){
   el.classList.remove('page-visible')
   el.classList.add('page-hidden','hidden')
  }
 })
 setTimeout(()=>{
  talleres.classList.remove('hidden')
  talleres.offsetHeight;
  requestAnimationFrame(()=>{talleres.classList.remove('page-hidden');talleres.classList.add('page-visible')})
  window.scrollTo({top:0,behavior:'smooth'})
 },170)
 setTimeout(()=>{if(overlay) overlay.classList.remove('active')},560)
}

// Inicializa la primera imagen del rig al cargar la página
updateRigGallery()
updateProductGallery()
updateFinalPrice()
updateBannerGallery()
startBannerInterval()

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

function checkTp1Password(){
 const input = document.getElementById('tp1PasswordInput');
 const errorMsg = document.getElementById('tp1ErrorMsg');
 const lockState = document.getElementById('tp1LockState');
 const unlockState = document.getElementById('tp1UnlockState');
 
 if (input && input.value === 'testtest100pesos') {
  if (errorMsg) errorMsg.classList.add('hidden');
  if (lockState) lockState.classList.add('hidden');
  if (unlockState) unlockState.classList.remove('hidden');
 } else {
  if (errorMsg) errorMsg.classList.remove('hidden');
  if (input) {
   input.value = '';
   input.focus();
  }
 }
}

// Bind Enter key
document.getElementById('tp1PasswordInput')?.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') checkTp1Password();
});

if (isTestMode) {
 const banner = document.createElement('div');
 banner.className = 'fixed bottom-6 left-6 z-[100] bg-yellow-500 text-black font-black px-6 py-4 rounded-3xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] flex items-center gap-3 text-xs uppercase tracking-wider border border-yellow-400 animate-pulse';
 banner.innerHTML = `
  <div class="w-3 h-3 rounded-full bg-black animate-ping"></div>
  <span>Modo de Prueba Activo (Base: $100 / Extras: $1)</span>
 `;
 document.body.appendChild(banner);
}

async function fetchAndApplyStock(){
  // Si estamos en entorno local, omitir consulta a la API para no gastar créditos de base de datos
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')) {
    console.log('Entorno local detectado. Omitiendo consulta de stock para ahorrar créditos de base de datos.');
    return;
  }
  try {
    const response = await fetch('/api/get-stock');
    if (!response.ok) throw new Error('Error al consultar stock');
    const data = await response.json();
    const stock = data.stock;

  const buyBtn = document.getElementById('matteboxBuyBtn');
  if (buyBtn) {
   if (stock <= 0) {
    buyBtn.disabled = true;
    buyBtn.innerText = 'Agotado';
    buyBtn.className = 'px-8 py-5 rounded-2xl bg-white/30 text-white/40 font-semibold cursor-not-allowed';
   } else if (stock <= 3) {
    let stockNotice = document.getElementById('stockNotice');
    if (!stockNotice) {
     stockNotice = document.createElement('p');
     stockNotice.id = 'stockNotice';
     stockNotice.className = 'text-xs text-yellow-400 font-semibold mt-2 text-right uppercase tracking-wider animate-pulse';
     buyBtn.parentNode.insertBefore(stockNotice, buyBtn.nextSibling);
    }
    stockNotice.innerText = `¡Solo quedan ${stock} unidades!`;
   }
  }
 } catch (err) {
  console.error('Error cargando stock:', err);
 }
}

fetchAndApplyStock();

// =========================================
// GABO3DPRINT PORTFOLIO & MODAL LOGIC
// =========================================

const bartenderAvatars = {
  "Yefry Avilera": "productos/avatars/yefry.png",
  "Yefri Avilera": "productos/avatars/yefry.png",
  "Luis Gajardo": "productos/avatars/luis.png",
  "Edgar Martinez": "productos/avatars/edgar.png",
  "Yerson López": "productos/avatars/yerson.png",
  "Pablo Prüfer": "productos/avatars/pablo.png",
  "Pablo Prufer": "productos/avatars/pablo.png",
  "Brian Rey": "productos/avatars/brian.png",
  "Yeni Uribe": "productos/avatars/yeni.png"
}

let gabo3dPortfolio = [];
let workshopsList = [];

let currentGabo3dItemsList = [];
let currentGabo3dItemId = null;
let currentGabo3dImgIndex = 0;
let gabo3dActiveLayer = 'A';
let gabo3dObserver = null;

// Resuelve la URL de la imagen (usa la local si existe, sino el fallback)
function getGabo3dImageSrc(item, index, callback) {
  const localSrc = item.images[index];
  const fallbackSrc = item.fallbacks[index] || item.fallbacks[0];
  
  if (!localSrc) {
    callback(fallbackSrc);
    return;
  }
  
  const img = new Image();
  img.onload = () => callback(localSrc);
  img.onerror = () => callback(fallbackSrc);
  img.src = localSrc;
}

let gabo3dActiveFilter = 'all';
let gabo3dActiveBartender = null;

// Obtener bartenders únicos de la base de datos
function getUniqueGabo3dBartenders() {
  const bartenders = new Set();
  gabo3dPortfolio.forEach(item => {
    if (item.bartender && item.bartender.trim()) {
      bartenders.add(item.bartender.trim());
    }
  });
  return Array.from(bartenders).sort((a, b) => a.localeCompare(b));
}

// Poblar dinámicamente el contenedor de sub-filtros de bartender
function populateGabo3dBartenderFilters() {
  const container = document.getElementById('gabo3dBartenderContainer');
  if (!container) return;
  
  container.innerHTML = '';
  const bartenders = getUniqueGabo3dBartenders();
  
  bartenders.forEach(name => {
    const btn = document.createElement('button');
    btn.onclick = (e) => filterGabo3dByBartender(name, btn);
    btn.className = 'gabo3d-bartender-subbtn px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-zinc-400 text-[11px] md:text-xs font-semibold transition-all duration-300 hover:bg-white/10 hover:text-white cursor-pointer';
    btn.innerText = name;
    container.appendChild(btn);
  });
}

// Expandir / colapsar contenedor de sub-filtros con animación
function toggleGabo3dBartenderFilter(btnElement) {
  const container = document.getElementById('gabo3dBartenderContainer');
  const arrow = document.getElementById('gabo3dBartenderArrow');
  if (!container) return;
  
  const isHidden = container.classList.contains('hidden');
  
  if (isHidden) {
    // Abrir
    container.classList.remove('hidden');
    const targetHeight = container.scrollHeight;
    container.style.height = '0px';
    container.style.opacity = '0';
    container.offsetHeight; // Forzar reflow
    container.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    container.style.height = targetHeight + 'px';
    container.style.opacity = '1';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    // Cerrar
    container.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    container.style.height = '0px';
    container.style.opacity = '0';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    setTimeout(() => {
      container.classList.add('hidden');
    }, 300);
  }
}

// Colapsar contenedor de sub-filtros de forma segura
function collapseGabo3dBartenderFilter() {
  const container = document.getElementById('gabo3dBartenderContainer');
  const arrow = document.getElementById('gabo3dBartenderArrow');
  if (!container || container.classList.contains('hidden')) return;
  
  container.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)';
  container.style.height = '0px';
  container.style.opacity = '0';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  setTimeout(() => {
    container.classList.add('hidden');
  }, 300);
}

// Mezcla determinista basada en una semilla (LCG PRNG)
function seededShuffle(array, seed) {
  let m = array.length, t, i;
  let rand = function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  let shuffled = [...array];
  while (m) {
    i = Math.floor(rand() * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

// Renderiza la grilla de portafolio en index.html
function renderGabo3dPortfolio() {
  const grid = document.getElementById('gabo3dGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // 1. Filtrar los items de acuerdo a si el ID contiene la letra 'c' o por bartender activo
  const filteredItems = gabo3dPortfolio.filter(item => {
    if (gabo3dActiveFilter === 'all') return true;
    if (gabo3dActiveFilter === 'bartender') {
      return item.bartender && item.bartender.trim() === gabo3dActiveBartender;
    }
    
    // Si la ID contiene la letra 'c' (por ejemplo, item3d1c), la categoría es 'consumo'
    // En caso contrario, es 'competencias'
    const itemCategory = /c/i.test(item.id) ? 'consumo' : 'competencias';
    return itemCategory === gabo3dActiveFilter;
  });

  // 2. Mezclar de manera determinista basándonos en la hora actual (rota cada 12 horas)
  const hoursSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60));
  const rotationSeed = Math.floor(hoursSinceEpoch / 12);
  const shuffledItems = seededShuffle(filteredItems, rotationSeed);
  
  currentGabo3dItemsList = shuffledItems;

  shuffledItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'group cursor-pointer rounded-[30px] border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden hover:scale-[1.02] hover:border-white/20 transition-all duration-300 flex flex-col shadow-lg';
    card.onclick = () => {
      window.location.hash = 'gabo3dprint-' + item.id;
    };
    
    // Contenedor de imagen
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'aspect-square w-full bg-zinc-950 overflow-hidden relative border-b border-white/10';
    
    // Imagen Principal
    const img1 = document.createElement('img');
    img1.className = 'absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out';
    img1.src = item.images[0];
    img1.alt = item.title;
    img1.onerror = () => {
      img1.onerror = null;
      img1.src = item.fallbacks[0];
    };
    
    // Imagen Secundaria (Hover/Touch)
    const img2 = document.createElement('img');
    img2.className = 'absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out';
    img2.src = item.images[1] || item.images[0];
    img2.alt = item.title + ' hover';
    img2.onerror = () => {
      img2.onerror = null;
      img2.src = item.fallbacks[1] || item.fallbacks[0];
    };
    
    imgWrapper.appendChild(img1);
    imgWrapper.appendChild(img2);
    
    // Contenedor del título (abajo)
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'p-4 flex items-center justify-center flex-grow bg-black/20';
    
    const title = document.createElement('h3');
    title.className = 'text-center text-xs md:text-sm font-bold text-zinc-300 group-hover:text-white transition-colors duration-300 uppercase';
    title.innerText = item.title;
    
    titleWrapper.appendChild(title);
    
    card.appendChild(imgWrapper);
    card.appendChild(titleWrapper);
    grid.appendChild(card);
  });

  // Inicializar animación de revelado con scroll
  initGabo3dScrollReveal();
}

// Función para filtrar y actualizar los botones
function filterGabo3d(category, btnElement) {
  gabo3dActiveFilter = category;
  gabo3dActiveBartender = null;
  
  // Colapsar bartender container
  collapseGabo3dBartenderFilter();
  
  // Actualizar clases activas de los botones de filtro
  const buttons = document.querySelectorAll('.gabo3d-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-white', 'text-black', 'border-white/20');
    btn.classList.add('bg-white/5', 'text-zinc-400', 'border-white/10');
  });
  
  if (btnElement) {
    btnElement.classList.remove('bg-white/5', 'text-zinc-400', 'border-white/10');
    btnElement.classList.add('bg-white', 'text-black', 'border-white/20');
  }
  
  // Limpiar clases activas de los sub-botones de bartender
  const subBtns = document.querySelectorAll('.gabo3d-bartender-subbtn');
  subBtns.forEach(btn => {
    btn.classList.remove('bg-white/15', 'text-white', 'border-white/30');
    btn.classList.add('bg-white/5', 'text-zinc-400', 'border-white/5');
  });
  
  renderGabo3dPortfolio();
}

// Función para filtrar por un bartender específico
function filterGabo3dByBartender(bartenderName, btnElement) {
  gabo3dActiveFilter = 'bartender';
  gabo3dActiveBartender = bartenderName;
  
  // Destacar el botón principal "Bartender" y apagar el resto
  const mainBtn = document.getElementById('gabo3dBartenderBtn');
  const buttons = document.querySelectorAll('.gabo3d-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-white', 'text-black', 'border-white/20');
    btn.classList.add('bg-white/5', 'text-zinc-400', 'border-white/10');
  });
  
  if (mainBtn) {
    mainBtn.classList.remove('bg-white/5', 'text-zinc-400', 'border-white/10');
    mainBtn.classList.add('bg-white', 'text-black', 'border-white/20');
  }
  
  // Actualizar los sub-botones de bartenders
  const subBtns = document.querySelectorAll('.gabo3d-bartender-subbtn');
  subBtns.forEach(btn => {
    btn.classList.remove('bg-white/15', 'text-white', 'border-white/30');
    btn.classList.add('bg-white/5', 'text-zinc-400', 'border-white/5');
  });
  
  if (btnElement) {
    btnElement.classList.remove('bg-white/5', 'text-zinc-400', 'border-white/5');
    btnElement.classList.add('bg-white/15', 'text-white', 'border-white/30');
  }
  
  renderGabo3dPortfolio();
}

// Inicializador de animación de revelado con desfase
function initGabo3dScrollReveal() {
  const cards = document.querySelectorAll('#gabo3dGrid > div');
  if (!cards.length) return;
  
  if (gabo3dObserver) {
    gabo3dObserver.disconnect();
  }
  
  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => card.classList.add('revealed'));
    return;
  }
  
  // Si la página del portafolio está oculta, no configurar observador aún (se re-inicializará al mostrar la página)
  const page = document.getElementById('gabo3dprintPage');
  if (page && page.classList.contains('hidden')) {
    cards.forEach(card => {
      if (!card.classList.contains('revealed')) {
        card.classList.add('reveal-card');
      }
    });
    return;
  }
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.01
  };
  
  gabo3dObserver = new IntersectionObserver((entries, obs) => {
    const visibleEntries = entries.filter(e => e.isIntersecting);
    
    visibleEntries.forEach((entry, index) => {
      const card = entry.target;
      const delay = index * 120;
      
      setTimeout(() => {
        card.classList.add('revealed');
      }, delay);
      
      obs.unobserve(card);
    });
  }, observerOptions);
  
  cards.forEach(card => {
    if (!card.classList.contains('revealed')) {
      card.classList.add('reveal-card');
      gabo3dObserver.observe(card);
    }
  });

  // Para asegurar de que en iOS/Safari no queden ocultos por fallos de scroll,
  // forzamos la revelación de las primeras 4 tarjetas después de 100ms si no se han revelado.
  setTimeout(() => {
    cards.forEach((card, index) => {
      if (index < 4 && !card.classList.contains('revealed')) {
        card.classList.add('revealed');
      }
    });
  }, 100);
}


// Abre un ítem de portafolio y muestra el modal
function openGabo3dItem(itemId, fromHash = false) {
  const item = gabo3dPortfolio.find(p => p.id === itemId);
  if (!item) return;
  
  currentGabo3dItemId = itemId;
  currentGabo3dImgIndex = 0;
  
  // Setear títulos y descripción
  document.getElementById('gabo3dPopupTitle').innerText = item.title.toUpperCase();
  
  // Construir descripción y metadatos dinámicamente
  let descHtml = '';
  const isConsumo = /c/i.test(item.id);
  const interventionText = isConsumo ? "Para Público" : (item.intervencion || "");
  const hasMeta = item.coctel || item.bartender || interventionText || item.competencia || item.ubicacion || item.anio;
  if (hasMeta) {
    descHtml += `<div class="flex items-start justify-between gap-6 border-t border-white/10 pt-4 mt-4">`;
    
    // Grilla de metadatos (izquierda)
    descHtml += `<div class="grid grid-cols-2 gap-x-6 gap-y-4 text-xs md:text-sm flex-grow">`;
    if (item.coctel) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Cóctel</span><span class="text-zinc-200 font-medium">${item.coctel}</span></div>`;
    }
    if (item.bartender) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Bartender</span><span class="text-zinc-200 font-medium">${item.bartender}</span></div>`;
    }
    if (interventionText) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Intervención</span><span class="text-zinc-200 font-medium">${interventionText}</span></div>`;
    }
    if (item.competencia) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Competencia</span><span class="text-zinc-200 font-medium">${item.competencia}</span></div>`;
    }
    if (item.ubicacion) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Ubicación</span><span class="text-zinc-200 font-medium">${item.ubicacion}</span></div>`;
    }
    if (item.anio) {
      descHtml += `<div><span class="text-zinc-500 block uppercase tracking-wider text-[10px] mb-0.5">Año</span><span class="text-zinc-200 font-medium">${item.anio}</span></div>`;
    }
    descHtml += `</div>`;
    
    // Avatar circular del creador (derecha)
    if (item.bartender) {
      const avatarSrc = bartenderAvatars[item.bartender] || '';
      const initials = item.bartender.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      descHtml += `
      <div class="flex flex-col items-center shrink-0">
        <div class="w-[70px] h-[70px] rounded-full border border-white/10 bg-zinc-800/80 overflow-hidden flex items-center justify-center shadow-lg relative">
          ${avatarSrc ? `
            <img src="${avatarSrc}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <span class="text-sm font-bold text-zinc-400 uppercase hidden">${initials}</span>
          ` : `
            <span class="text-sm font-bold text-zinc-400 uppercase">${initials}</span>
          `}
        </div>
        <span class="text-[9px] text-zinc-500 uppercase tracking-widest mt-2">Bartender</span>
      </div>`;
    }
    
    descHtml += `</div>`;
  }
  
  const mainText = item.concepto || item.description || '';
  if (mainText) {
    descHtml += `<div class="${hasMeta ? 'border-t border-white/10 pt-4 mt-4' : ''} text-zinc-400 leading-relaxed text-sm md:text-base">${mainText}</div>`;
  }
  
  document.getElementById('gabo3dPopupDesc').innerHTML = descHtml;
  
  // WhatsApp link de consulta específico
  const waBtn = document.getElementById('gabo3dPopupWaBtn');
  if (waBtn) {
    const textMsg = encodeURIComponent(`Hola Gabo3Dprint, me interesa el diseño "${item.title}" de tu portafolio y me gustaría consultar por él.`);
    waBtn.href = `https://wa.me/56950870076?text=${textMsg}`;
  }
  
  // Renderizar dots
  const dotsContainer = document.getElementById('gabo3dPopupDots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    item.images.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' + (i === 0 ? 'bg-white/90 w-4' : 'bg-white/30');
      dotsContainer.appendChild(dot);
    });
  }
  
  // Inicializar imágenes de capas A y B
  getGabo3dImageSrc(item, 0, (resolvedSrc) => {
    const layerAImg = document.getElementById('gabo3dPopupLayerA').querySelector('img');
    const layerBImg = document.getElementById('gabo3dPopupLayerB').querySelector('img');
    if (layerAImg) layerAImg.src = resolvedSrc;
    if (layerBImg) layerBImg.src = resolvedSrc;
    
    // Ajustar relación de aspecto del contenedor según dimensiones originales
    const img = new Image();
    img.onload = () => {
      const sliderContainer = document.getElementById('gabo3dPopupGallery').parentNode;
      if (sliderContainer) {
        sliderContainer.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      }
    };
    img.src = resolvedSrc;
    
    gabo3dActiveLayer = 'A';
    document.getElementById('gabo3dPopupLayerA').style.opacity = '1';
    document.getElementById('gabo3dPopupLayerA').style.zIndex = '2';
    document.getElementById('gabo3dPopupLayerB').style.opacity = '0';
    document.getElementById('gabo3dPopupLayerB').style.zIndex = '1';
  });
  
  // Mostrar modal y bloquear scroll de body
  const modal = document.getElementById('gabo3dPopup');
  if (modal) {
    modal.classList.remove('hidden');
    lockBodyScroll();
  }
  
  if (!fromHash) {
    window.location.hash = 'gabo3dprint-' + itemId;
  }
}

// Cierra el modal de portafolio
function closeGabo3dPopup(fromHashChange = false) {
  const modal = document.getElementById('gabo3dPopup');
  if (modal) {
    modal.classList.add('hidden');
    unlockBodyScroll();
  }
  
  currentGabo3dItemId = null;
  
  if (!fromHashChange) {
    window.location.hash = 'gabo3dprint';
  }
}

// Navega entre ítems de portafolio contiguos (anterior / siguiente)
function navigateGabo3dItem(direction, event) {
  if (event) event.stopPropagation();
  if (!currentGabo3dItemsList.length || !currentGabo3dItemId) return;
  
  const currentIndex = currentGabo3dItemsList.findIndex(item => item.id === currentGabo3dItemId);
  if (currentIndex === -1) return;
  
  let nextIndex = currentIndex + direction;
  if (nextIndex < 0) {
    nextIndex = currentGabo3dItemsList.length - 1; // bucle al final
  } else if (nextIndex >= currentGabo3dItemsList.length) {
    nextIndex = 0; // bucle al inicio
  }
  
  const nextItem = currentGabo3dItemsList[nextIndex];
  openGabo3dItem(nextItem.id);
}

// Actualiza la imagen mostrada en la galería del popup con fundido
function updateGabo3dPopupGallery() {
  const item = gabo3dPortfolio.find(p => p.id === currentGabo3dItemId);
  if (!item) return;
  
  getGabo3dImageSrc(item, currentGabo3dImgIndex, (resolvedSrc) => {
    // Ajustar relación de aspecto del contenedor para la nueva imagen antes del crossfade
    const img = new Image();
    img.onload = () => {
      const sliderContainer = document.getElementById('gabo3dPopupGallery').parentNode;
      if (sliderContainer) {
        sliderContainer.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      }
      crossfade('gabo3dPopupLayerA', 'gabo3dPopupLayerB', gabo3dActiveLayer, resolvedSrc, (v) => { gabo3dActiveLayer = v; });
    };
    img.src = resolvedSrc;
    
    // Actualizar dots
    const dots = document.querySelectorAll('#gabo3dPopupDots div');
    dots.forEach((dot, i) => {
      dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' + (i === currentGabo3dImgIndex ? 'bg-white/90 w-4' : 'bg-white/30');
    });
  });
}

function nextGabo3dImg(event) {
  if (event) event.stopPropagation();
  const item = gabo3dPortfolio.find(p => p.id === currentGabo3dItemId);
  if (!item) return;
  
  currentGabo3dImgIndex = (currentGabo3dImgIndex + 1) % item.images.length;
  updateGabo3dPopupGallery();
}

function prevGabo3dImg(event) {
  if (event) event.stopPropagation();
  const item = gabo3dPortfolio.find(p => p.id === currentGabo3dItemId);
  if (!item) return;
  
  currentGabo3dImgIndex = (currentGabo3dImgIndex - 1 + item.images.length) % item.images.length;
  updateGabo3dPopupGallery();
}

function handleGabo3dPopupGalleryClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  if (clickX < rect.width / 2) {
    prevGabo3dImg();
  } else {
    nextGabo3dImg();
  }
}

// Touch gesture listeners para el popup de Gabo3Dprint con prevención de scroll vertical durante swipe
let gabo3dTouchStartX = 0;
let gabo3dTouchStartY = 0;
let gabo3dIsSwiping = false;

const gabo3dEl = document.getElementById('gabo3dPopupGallery');
if (gabo3dEl) {
  gabo3dEl.addEventListener('touchstart', (e) => {
    gabo3dTouchStartX = e.touches[0].clientX;
    gabo3dTouchStartY = e.touches[0].clientY;
    gabo3dIsSwiping = true;
  }, {passive: true});

  gabo3dEl.addEventListener('touchmove', (e) => {
    if (!gabo3dIsSwiping) return;
    
    const diffX = e.touches[0].clientX - gabo3dTouchStartX;
    const diffY = e.touches[0].clientY - gabo3dTouchStartY;
    
    // Si el movimiento es predominantemente horizontal, prevenimos el scroll de fondo
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) e.preventDefault();
    }
  }, {passive: false});

  gabo3dEl.addEventListener('touchend', (e) => {
    if (!gabo3dIsSwiping) return;
    gabo3dIsSwiping = false;
    
    const diffX = e.changedTouches[0].clientX - gabo3dTouchStartX;
    if (Math.abs(diffX) > 40) {
      diffX > 0 ? prevGabo3dImg() : nextGabo3dImg();
    }
  }, {passive: true});
}

// Click fuera de la tarjeta para cerrar el modal
const gabo3dPopup = document.getElementById('gabo3dPopup');
if (gabo3dPopup) {
  gabo3dPopup.addEventListener('click', (event) => {
    const popupCard = event.target.closest('.max-w-2xl');
    if (!popupCard) {
      closeGabo3dPopup();
    }
  });
}

// Genera de forma dinámica datos estructurados (JSON-LD) para SEO de todos los ítems
function generateGabo3dSEO() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": gabo3dPortfolio.map((item) => ({
      "@type": "CreativeWork",
      "name": item.title,
      "headline": item.coctel,
      "creator": {
        "@type": "Person",
        "name": item.bartender
      },
      "description": item.concepto,
      "contentLocation": item.ubicacion,
      "temporalCoverage": item.anio,
      "image": item.images[0] ? window.location.origin + '/' + item.images[0] : undefined
    }))
  };
  
  let script = document.getElementById('gabo3dSchema');
  if (!script) {
    script = document.createElement('script');
    script.id = 'gabo3dSchema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schema);
}

// Carga asíncrona de los datos del portafolio y talleres para el CMS
async function loadStaticData() {
  try {
    const portfolioRes = await fetch('/data/portfolio.json');
    if (portfolioRes.ok) {
      const data = await portfolioRes.json();
      gabo3dPortfolio = data.portfolio || [];
    }
  } catch (e) {
    console.error('Error cargando portafolio:', e);
  }

  try {
    const workshopsRes = await fetch('/data/workshops.json');
    if (workshopsRes.ok) {
      const data = await workshopsRes.json();
      workshopsList = data.workshops || [];
    }
  } catch (e) {
    console.error('Error cargando talleres:', e);
  }

  // Inicializar UI con los datos cargados
  populateGabo3dBartenderFilters();
  renderGabo3dPortfolio();
  generateGabo3dSEO();
  renderWorkshops();
  handleInitialRouting();
}

function renderWorkshops() {
  const grid = document.getElementById('workshopsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  workshopsList.forEach(ws => {
    const card = document.createElement('div');
    card.className = "rounded-[30px] border border-white/10 bg-zinc-900/80 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col justify-between";
    
    let teachersHtml = '';
    if (ws.profesores && ws.profesores.length > 0) {
      ws.profesores.forEach(prof => {
        teachersHtml += `
          <div class="flex items-center gap-3 mb-2 bg-white/5 rounded-2xl p-2.5 border border-white/5">
            <div class="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
              <img src="${prof.avatar}" class="w-full h-full object-cover" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold leading-none mb-1">Profesor</p>
              <a href="${prof.instagram}" target="_blank" class="text-xs font-bold text-zinc-300 hover:text-white hover:underline transition-all duration-300">
                ${prof.name}
              </a>
            </div>
          </div>
        `;
      });
    }

    let detailsHtml = '';
    if (ws.temario && ws.temario.length > 0) {
      detailsHtml += `
        <div class="space-y-2 text-xs text-zinc-500 border-t border-white/5 pt-4">
          <p class="text-zinc-400 font-semibold mb-1">Veremos:</p>
          ${ws.temario.map(item => `<div class="flex gap-2"><span>•</span> <span>${item}</span></div>`).join('')}
        </div>
      `;
    }

    if (ws.incluye) {
      detailsHtml += `
        <div class="mt-3 text-zinc-500 text-xs leading-relaxed border-t border-white/5 pt-3">
          <span class="text-zinc-400 font-semibold">Incluye:</span> ${ws.incluye}
        </div>
      `;
    }

    if (ws.clases && ws.clases.length > 0) {
      detailsHtml += `
        <div class="space-y-3 text-xs text-zinc-500 border-t border-white/5 pt-4">
          ${ws.clases.map((clase) => {
            const parts = clase.split(':');
            const title = parts[0] + ':';
            const desc = parts.slice(1).join(':');
            return `
              <div class="flex gap-2">
                <span class="text-zinc-300 font-semibold shrink-0">${title}</span>
                <span>${desc}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    let actionButton = '';
    if (ws.type === 'free') {
      const btnText = ws.buttonText || 'Inscribirse';
      actionButton = `
        <a href="${ws.url}" target="_blank" class="mt-5 w-full text-center px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md block">
          ${btnText}
        </a>
      `;
    } else {
      actionButton = `
        <div class="mt-4 flex items-baseline gap-2">
          <span class="text-2xl font-black text-white">$${ws.price.toLocaleString('es-CL')}</span>
        </div>
        <button onclick="openWorkshopPopup('${ws.id}')" class="mt-5 w-full text-center px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md block">
          Inscribirse
        </button>
      `;
    }

    let badgeHtml = '';
    if (ws.status === 'no_disponible') {
      badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">No disponible</span>';
    } else if (ws.type === 'free') {
      badgeHtml = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">Gratis</span>';
    }

    card.innerHTML = `
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-lg">${ws.icon}</div>
              <h2 class="text-xl font-bold text-white">${ws.title}</h2>
            </div>
            ${badgeHtml}
          </div>

          <!-- Profesores -->
          ${teachersHtml}

          <!-- Horario y Duración -->
          <div class="mt-1 mb-4 flex flex-wrap gap-2 text-[11px] text-zinc-400">
            <span class="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">📅 ${ws.schedule}</span>
            <span class="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">⏱️ ${ws.duration}</span>
          </div>

          <p class="text-zinc-400 text-sm leading-relaxed mb-4">
            ${ws.description}
          </p>

          ${detailsHtml}
        </div>
        
        <div>
          ${actionButton}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// =========================================
// HASH-BASED ROUTING
// =========================================

window.addEventListener('hashchange', () => {
 const hash = window.location.hash;
 if (hash === '#productos') {
  closeGabo3dPopup(true);
  openCatalogPage(true);
 } else if (hash === '#mkb-v4') {
  closeGabo3dPopup(true);
  openMatteboxPage(true);
 } else if (hash === '#tp1') {
  closeGabo3dPopup(true);
  openTp1Page(true);
 } else if (hash === '#gabo3dprint') {
  closeGabo3dPopup(true);
  openGabo3DprintPage(true);
 } else if (hash.startsWith('#gabo3dprint-')) {
  const itemId = hash.replace('#gabo3dprint-', '');
  openGabo3DprintPage(true);
  openGabo3dItem(itemId, true);
 } else if (hash === '#talleres') {
  closeGabo3dPopup(true);
  openTalleresPage(true);
 } else {
  closeGabo3dPopup(true);
  goHome(true);
 }
});

function handleInitialRouting() {
 const hash = window.location.hash;
 if (hash === '#productos') {
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('catalogPage').classList.remove('hidden', 'page-hidden');
  document.getElementById('catalogPage').classList.add('page-visible');
  stopBannerInterval();
 } else if (hash === '#mkb-v4') {
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('productPage').classList.remove('hidden', 'page-hidden');
  document.getElementById('productPage').classList.add('page-visible');
  stopBannerInterval();
  currentRigIndex = 0;
  updateRigGallery();
  startRigInterval();
 } else if (hash === '#tp1') {
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('tp1Page').classList.remove('hidden', 'page-hidden');
  document.getElementById('tp1Page').classList.add('page-visible');
  stopBannerInterval();
 } else if (hash === '#gabo3dprint') {
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('gabo3dprintPage').classList.remove('hidden', 'page-hidden');
  document.getElementById('gabo3dprintPage').classList.add('page-visible');
  stopBannerInterval();
  initGabo3dScrollReveal();
 } else if (hash.startsWith('#gabo3dprint-')) {
  const itemId = hash.replace('#gabo3dprint-', '');
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('gabo3dprintPage').classList.remove('hidden', 'page-hidden');
  document.getElementById('gabo3dprintPage').classList.add('page-visible');
  stopBannerInterval();
  openGabo3dItem(itemId, true);
  initGabo3dScrollReveal();
 } else if (hash === '#talleres') {
  document.getElementById('homePage').classList.add('hidden', 'page-hidden');
  document.getElementById('homePage').classList.remove('page-visible');
  document.getElementById('talleresPage').classList.remove('hidden', 'page-hidden');
  document.getElementById('talleresPage').classList.add('page-visible');
  stopBannerInterval();
 }
}

loadStaticData();

// WORKSHOP PURCHASE FLOW
let workshopActiveProduct = '';

function openWorkshopPopup(productId) {
  workshopActiveProduct = productId;
  
  const titleEl = document.getElementById('workshopPopupTitle');
  const priceEl = document.getElementById('workshopPopupPrice');
  
  const ws = workshopsList.find(w => w.id === productId);
  if (ws) {
    if (titleEl) titleEl.innerText = ws.title;
    if (priceEl) priceEl.innerText = `$${ws.price.toLocaleString('es-CL')}`;
  }

  const popup = document.getElementById('workshopPopup');
  if (popup) {
    popup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  
  // Limpiar campos anteriores
  const nameInput = document.getElementById('workshopCustomerName');
  const instagramInput = document.getElementById('workshopCustomerInstagram');
  const emailInput = document.getElementById('workshopCustomerEmail');
  if (nameInput) nameInput.value = '';
  if (instagramInput) instagramInput.value = '';
  if (emailInput) emailInput.value = '';
  
  validateWorkshopForm();
}

function closeWorkshopPopup() {
  const popup = document.getElementById('workshopPopup');
  if (popup) {
    popup.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function validateWorkshopForm() {
  const name = document.getElementById('workshopCustomerName')?.value.trim() || '';
  const instagram = document.getElementById('workshopCustomerInstagram')?.value.trim() || '';
  const email = document.getElementById('workshopCustomerEmail')?.value.trim() || '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = name.length > 0 && instagram.length > 0 && emailRegex.test(email);
  
  const btn = document.getElementById('workshopPurchaseButton');
  if (btn) {
    if (isValid) {
      btn.disabled = false;
      btn.innerText = 'Pagar con Mercado Pago';
      btn.className = 'w-full py-5 rounded-2xl bg-white text-black font-semibold hover:scale-[1.01] transition-all duration-300 cursor-pointer';
    } else {
      btn.disabled = true;
      btn.innerText = 'Completar datos';
      btn.className = 'w-full py-5 rounded-2xl bg-white/10 text-white/30 font-semibold cursor-not-allowed transition-all duration-300';
    }
  }
}

async function startWorkshopCheckout() {
  const name = document.getElementById('workshopCustomerName')?.value.trim() || '';
  const instagram = document.getElementById('workshopCustomerInstagram')?.value.trim() || '';
  const email = document.getElementById('workshopCustomerEmail')?.value.trim() || '';

  const orderDetails = {
    name: name,
    instagram: instagram,
    email: email,
    activeProduct: workshopActiveProduct,
    testMode: isTestMode
  };

  try {
    localStorage.setItem('last_order_details', JSON.stringify(orderDetails));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }

  const btn = document.getElementById('workshopPurchaseButton');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Procesando pago...';
    btn.className = 'w-full py-5 rounded-2xl bg-white/30 text-white/40 font-semibold cursor-not-allowed transition-all duration-300';
  }

  try {
    // Si estamos en entorno local, simular el proceso de pago
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')) {
      console.log('Entorno local detectado para talleres. Simulando flujo de pago offline...');
      setTimeout(() => {
        window.location.href = '/pago-exitoso.html';
      }, 1500);
      return;
    }

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
    const redirectUrl = result.init_point;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error('No se recibió la URL de redirección.');
    }
  } catch (error) {
    console.error('Error en el proceso de pago de talleres:', error);
    alert('Hubo un problema al procesar tu solicitud: ' + error.message + '\n\nPor favor, inténtalo de nuevo.');
    validateWorkshopForm(); // Restaura el botón
  }
}

