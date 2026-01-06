(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}})();const sf="modulepreload",nf=function(t){return"/"+t},Tl={},of=function(e,i,r){let s=Promise.resolve();if(i&&i.length>0){let c=function(h){return Promise.all(h.map(f=>Promise.resolve(f).then(a=>({status:"fulfilled",value:a}),a=>({status:"rejected",reason:a}))))};var o=c;document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),u=l?.nonce||l?.getAttribute("nonce");s=c(i.map(h=>{if(h=nf(h),h in Tl)return;Tl[h]=!0;const f=h.endsWith(".css"),a=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${a}`))return;const d=document.createElement("link");if(d.rel=f?"stylesheet":sf,f||(d.as="script"),d.crossOrigin="",d.href=h,u&&d.setAttribute("nonce",u),document.head.appendChild(d),f)return new Promise((p,b)=>{d.addEventListener("load",p),d.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${h}`)))})}))}function n(l){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=l,window.dispatchEvent(u),!u.defaultPrevented)throw l}return s.then(l=>{for(const u of l||[])u.status==="rejected"&&n(u.reason);return e().catch(n)})};var Rc=Object.defineProperty,af=Object.defineProperties,lf=Object.getOwnPropertyDescriptor,uf=Object.getOwnPropertyDescriptors,Ol=Object.getOwnPropertySymbols,cf=Object.prototype.hasOwnProperty,df=Object.prototype.propertyIsEnumerable,Yn=(t,e)=>(e=Symbol[t])?e:Symbol.for("Symbol."+t),Sa=t=>{throw TypeError(t)},$l=(t,e,i)=>e in t?Rc(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i,Yt=(t,e)=>{for(var i in e||(e={}))cf.call(e,i)&&$l(t,i,e[i]);if(Ol)for(var i of Ol(e))df.call(e,i)&&$l(t,i,e[i]);return t},es=(t,e)=>af(t,uf(e)),m=(t,e,i,r)=>{for(var s=r>1?void 0:r?lf(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(s=(r?o(e,i,s):o(s))||s);return r&&s&&Rc(e,i,s),s},Bc=(t,e,i)=>e.has(t)||Sa("Cannot "+i),hf=(t,e,i)=>(Bc(t,e,"read from private field"),e.get(t)),ff=(t,e,i)=>e.has(t)?Sa("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,i),pf=(t,e,i,r)=>(Bc(t,e,"write to private field"),e.set(t,i),i),mf=function(t,e){this[0]=t,this[1]=e},bf=t=>{var e=t[Yn("asyncIterator")],i=!1,r,s={};return e==null?(e=t[Yn("iterator")](),r=n=>s[n]=o=>e[n](o)):(e=e.call(t),r=n=>s[n]=o=>{if(i){if(i=!1,n==="throw")throw o;return o}return i=!0,{done:!1,value:new mf(new Promise(l=>{var u=e[n](o);u instanceof Object||Sa("Object expected"),l(u)}),1)}}),s[Yn("iterator")]=()=>s,r("next"),"throw"in e?r("throw"):s.throw=n=>{throw n},"return"in e&&r("return"),s},Cr=new WeakMap,Ar=new WeakMap,Er=new WeakMap,Xn=new WeakSet,vs=new WeakMap,Xt=class{constructor(t,e){this.handleFormData=i=>{const r=this.options.disabled(this.host),s=this.options.name(this.host),n=this.options.value(this.host),o=this.host.tagName.toLowerCase()==="sl-button";this.host.isConnected&&!r&&!o&&typeof s=="string"&&s.length>0&&typeof n<"u"&&(Array.isArray(n)?n.forEach(l=>{i.formData.append(s,l.toString())}):i.formData.append(s,n.toString()))},this.handleFormSubmit=i=>{var r;const s=this.options.disabled(this.host),n=this.options.reportValidity;this.form&&!this.form.noValidate&&((r=Cr.get(this.form))==null||r.forEach(o=>{this.setUserInteracted(o,!0)})),this.form&&!this.form.noValidate&&!s&&!n(this.host)&&(i.preventDefault(),i.stopImmediatePropagation())},this.handleFormReset=()=>{this.options.setValue(this.host,this.options.defaultValue(this.host)),this.setUserInteracted(this.host,!1),vs.set(this.host,[])},this.handleInteraction=i=>{const r=vs.get(this.host);r.includes(i.type)||r.push(i.type),r.length===this.options.assumeInteractionOn.length&&this.setUserInteracted(this.host,!0)},this.checkFormValidity=()=>{if(this.form&&!this.form.noValidate){const i=this.form.querySelectorAll("*");for(const r of i)if(typeof r.checkValidity=="function"&&!r.checkValidity())return!1}return!0},this.reportFormValidity=()=>{if(this.form&&!this.form.noValidate){const i=this.form.querySelectorAll("*");for(const r of i)if(typeof r.reportValidity=="function"&&!r.reportValidity())return!1}return!0},(this.host=t).addController(this),this.options=Yt({form:i=>{const r=i.form;if(r){const n=i.getRootNode().querySelector(`#${r}`);if(n)return n}return i.closest("form")},name:i=>i.name,value:i=>i.value,defaultValue:i=>i.defaultValue,disabled:i=>{var r;return(r=i.disabled)!=null?r:!1},reportValidity:i=>typeof i.reportValidity=="function"?i.reportValidity():!0,checkValidity:i=>typeof i.checkValidity=="function"?i.checkValidity():!0,setValue:(i,r)=>i.value=r,assumeInteractionOn:["sl-input"]},e)}hostConnected(){const t=this.options.form(this.host);t&&this.attachForm(t),vs.set(this.host,[]),this.options.assumeInteractionOn.forEach(e=>{this.host.addEventListener(e,this.handleInteraction)})}hostDisconnected(){this.detachForm(),vs.delete(this.host),this.options.assumeInteractionOn.forEach(t=>{this.host.removeEventListener(t,this.handleInteraction)})}hostUpdated(){const t=this.options.form(this.host);t||this.detachForm(),t&&this.form!==t&&(this.detachForm(),this.attachForm(t)),this.host.hasUpdated&&this.setValidity(this.host.validity.valid)}attachForm(t){t?(this.form=t,Cr.has(this.form)?Cr.get(this.form).add(this.host):Cr.set(this.form,new Set([this.host])),this.form.addEventListener("formdata",this.handleFormData),this.form.addEventListener("submit",this.handleFormSubmit),this.form.addEventListener("reset",this.handleFormReset),Ar.has(this.form)||(Ar.set(this.form,this.form.reportValidity),this.form.reportValidity=()=>this.reportFormValidity()),Er.has(this.form)||(Er.set(this.form,this.form.checkValidity),this.form.checkValidity=()=>this.checkFormValidity())):this.form=void 0}detachForm(){if(!this.form)return;const t=Cr.get(this.form);t&&(t.delete(this.host),t.size<=0&&(this.form.removeEventListener("formdata",this.handleFormData),this.form.removeEventListener("submit",this.handleFormSubmit),this.form.removeEventListener("reset",this.handleFormReset),Ar.has(this.form)&&(this.form.reportValidity=Ar.get(this.form),Ar.delete(this.form)),Er.has(this.form)&&(this.form.checkValidity=Er.get(this.form),Er.delete(this.form)),this.form=void 0))}setUserInteracted(t,e){e?Xn.add(t):Xn.delete(t),t.requestUpdate()}doAction(t,e){if(this.form){const i=document.createElement("button");i.type=t,i.style.position="absolute",i.style.width="0",i.style.height="0",i.style.clipPath="inset(50%)",i.style.overflow="hidden",i.style.whiteSpace="nowrap",e&&(i.name=e.name,i.value=e.value,["formaction","formenctype","formmethod","formnovalidate","formtarget"].forEach(r=>{e.hasAttribute(r)&&i.setAttribute(r,e.getAttribute(r))})),this.form.append(i),i.click(),i.remove()}}getForm(){var t;return(t=this.form)!=null?t:null}reset(t){this.doAction("reset",t)}submit(t){this.doAction("submit",t)}setValidity(t){const e=this.host,i=!!Xn.has(e),r=!!e.required;e.toggleAttribute("data-required",r),e.toggleAttribute("data-optional",!r),e.toggleAttribute("data-invalid",!t),e.toggleAttribute("data-valid",t),e.toggleAttribute("data-user-invalid",!t&&i),e.toggleAttribute("data-user-valid",t&&i)}updateValidity(){const t=this.host;this.setValidity(t.validity.valid)}emitInvalidEvent(t){const e=new CustomEvent("sl-invalid",{bubbles:!1,composed:!1,cancelable:!0,detail:{}});t||e.preventDefault(),this.host.dispatchEvent(e)||t?.preventDefault()}},hn=Object.freeze({badInput:!1,customError:!1,patternMismatch:!1,rangeOverflow:!1,rangeUnderflow:!1,stepMismatch:!1,tooLong:!1,tooShort:!1,typeMismatch:!1,valid:!0,valueMissing:!1}),gf=Object.freeze(es(Yt({},hn),{valid:!1,valueMissing:!0})),yf=Object.freeze(es(Yt({},hn),{valid:!1,customError:!0}));/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qs=globalThis,Ca=qs.ShadowRoot&&(qs.ShadyCSS===void 0||qs.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Aa=Symbol(),Il=new WeakMap;let Fc=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==Aa)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(Ca&&e===void 0){const r=i!==void 0&&i.length===1;r&&(e=Il.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Il.set(i,e))}return e}toString(){return this.cssText}};const vf=t=>new Fc(typeof t=="string"?t:t+"",void 0,Aa),U=(t,...e)=>{const i=t.length===1?t[0]:e.reduce(((r,s,n)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new Fc(i,t,Aa)},wf=(t,e)=>{if(Ca)t.adoptedStyleSheets=e.map((i=>i instanceof CSSStyleSheet?i:i.styleSheet));else for(const i of e){const r=document.createElement("style"),s=qs.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}},Ll=Ca?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const r of e.cssRules)i+=r.cssText;return vf(i)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:xf,defineProperty:_f,getOwnPropertyDescriptor:kf,getOwnPropertyNames:Sf,getOwnPropertySymbols:Cf,getPrototypeOf:Af}=Object,fn=globalThis,Nl=fn.trustedTypes,Ef=Nl?Nl.emptyScript:"",Tf=fn.reactiveElementPolyfillSupport,zr=(t,e)=>t,ir={toAttribute(t,e){switch(e){case Boolean:t=t?Ef:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},Ea=(t,e)=>!xf(t,e),Dl={attribute:!0,type:String,converter:ir,reflect:!1,useDefault:!1,hasChanged:Ea};Symbol.metadata??=Symbol("metadata"),fn.litPropertyMetadata??=new WeakMap;let Ki=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=Dl){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(e,r,i);s!==void 0&&_f(this.prototype,e,s)}}static getPropertyDescriptor(e,i,r){const{get:s,set:n}=kf(this.prototype,e)??{get(){return this[i]},set(o){this[i]=o}};return{get:s,set(o){const l=s?.call(this);n?.call(this,o),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Dl}static _$Ei(){if(this.hasOwnProperty(zr("elementProperties")))return;const e=Af(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(zr("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(zr("properties"))){const i=this.properties,r=[...Sf(i),...Cf(i)];for(const s of r)this.createProperty(s,i[s])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[r,s]of i)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[i,r]of this.elementProperties){const s=this._$Eu(i,r);s!==void 0&&this._$Eh.set(s,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const s of r)i.unshift(Ll(s))}else e!==void 0&&i.push(Ll(e));return i}static _$Eu(e,i){const r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return wf(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){const r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){const n=(r.converter?.toAttribute!==void 0?r.converter:ir).toAttribute(i,r.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,i){const r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const n=r.getPropertyOptions(s),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:ir;this._$Em=s;const l=o.fromAttribute(i,n.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,i,r){if(e!==void 0){const s=this.constructor,n=this[e];if(r??=s.getPropertyOptions(e),!((r.hasChanged??Ea)(n,i)||r.useDefault&&r.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:s,wrapped:n},o){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??i??this[e]),n!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[s,n]of r){const{wrapped:o}=n,l=this[s];o!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,n,l)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach((r=>r.hostUpdate?.())),this.update(i)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach((i=>i.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((i=>this._$ET(i,this[i]))),this._$EM()}updated(e){}firstUpdated(e){}};Ki.elementStyles=[],Ki.shadowRootOptions={mode:"open"},Ki[zr("elementProperties")]=new Map,Ki[zr("finalized")]=new Map,Tf?.({ReactiveElement:Ki}),(fn.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ta=globalThis,Qs=Ta.trustedTypes,Pl=Qs?Qs.createPolicy("lit-html",{createHTML:t=>t}):void 0,qc="$lit$",Zt=`lit$${Math.random().toFixed(9).slice(2)}$`,Uc="?"+Zt,Of=`<${Uc}>`,Oi=document,Wr=()=>Oi.createComment(""),Gr=t=>t===null||typeof t!="object"&&typeof t!="function",Oa=Array.isArray,$f=t=>Oa(t)||typeof t?.[Symbol.iterator]=="function",Jn=`[ 	
\f\r]`,Tr=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ml=/-->/g,zl=/>/g,fi=RegExp(`>|${Jn}(?:([^\\s"'>=/]+)(${Jn}*=${Jn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Rl=/'/g,Bl=/"/g,Vc=/^(?:script|style|textarea|title)$/i,If=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),N=If(1),Je=Symbol.for("lit-noChange"),pe=Symbol.for("lit-nothing"),Fl=new WeakMap,vi=Oi.createTreeWalker(Oi,129);function jc(t,e){if(!Oa(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pl!==void 0?Pl.createHTML(e):e}const Lf=(t,e)=>{const i=t.length-1,r=[];let s,n=e===2?"<svg>":e===3?"<math>":"",o=Tr;for(let l=0;l<i;l++){const u=t[l];let c,h,f=-1,a=0;for(;a<u.length&&(o.lastIndex=a,h=o.exec(u),h!==null);)a=o.lastIndex,o===Tr?h[1]==="!--"?o=Ml:h[1]!==void 0?o=zl:h[2]!==void 0?(Vc.test(h[2])&&(s=RegExp("</"+h[2],"g")),o=fi):h[3]!==void 0&&(o=fi):o===fi?h[0]===">"?(o=s??Tr,f=-1):h[1]===void 0?f=-2:(f=o.lastIndex-h[2].length,c=h[1],o=h[3]===void 0?fi:h[3]==='"'?Bl:Rl):o===Bl||o===Rl?o=fi:o===Ml||o===zl?o=Tr:(o=fi,s=void 0);const d=o===fi&&t[l+1].startsWith("/>")?" ":"";n+=o===Tr?u+Of:f>=0?(r.push(c),u.slice(0,f)+qc+u.slice(f)+Zt+d):u+Zt+(f===-2?l:d)}return[jc(t,n+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class Yr{constructor({strings:e,_$litType$:i},r){let s;this.parts=[];let n=0,o=0;const l=e.length-1,u=this.parts,[c,h]=Lf(e,i);if(this.el=Yr.createElement(c,r),vi.currentNode=this.el.content,i===2||i===3){const f=this.el.content.firstChild;f.replaceWith(...f.childNodes)}for(;(s=vi.nextNode())!==null&&u.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const f of s.getAttributeNames())if(f.endsWith(qc)){const a=h[o++],d=s.getAttribute(f).split(Zt),p=/([.?@])?(.*)/.exec(a);u.push({type:1,index:n,name:p[2],strings:d,ctor:p[1]==="."?Df:p[1]==="?"?Pf:p[1]==="@"?Mf:pn}),s.removeAttribute(f)}else f.startsWith(Zt)&&(u.push({type:6,index:n}),s.removeAttribute(f));if(Vc.test(s.tagName)){const f=s.textContent.split(Zt),a=f.length-1;if(a>0){s.textContent=Qs?Qs.emptyScript:"";for(let d=0;d<a;d++)s.append(f[d],Wr()),vi.nextNode(),u.push({type:2,index:++n});s.append(f[a],Wr())}}}else if(s.nodeType===8)if(s.data===Uc)u.push({type:2,index:n});else{let f=-1;for(;(f=s.data.indexOf(Zt,f+1))!==-1;)u.push({type:7,index:n}),f+=Zt.length-1}n++}}static createElement(e,i){const r=Oi.createElement("template");return r.innerHTML=e,r}}function rr(t,e,i=t,r){if(e===Je)return e;let s=r!==void 0?i._$Co?.[r]:i._$Cl;const n=Gr(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(t),s._$AT(t,i,r)),r!==void 0?(i._$Co??=[])[r]=s:i._$Cl=s),s!==void 0&&(e=rr(t,s._$AS(t,e.values),s,r)),e}class Nf{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:r}=this._$AD,s=(e?.creationScope??Oi).importNode(i,!0);vi.currentNode=s;let n=vi.nextNode(),o=0,l=0,u=r[0];for(;u!==void 0;){if(o===u.index){let c;u.type===2?c=new ts(n,n.nextSibling,this,e):u.type===1?c=new u.ctor(n,u.name,u.strings,this,e):u.type===6&&(c=new zf(n,this,e)),this._$AV.push(c),u=r[++l]}o!==u?.index&&(n=vi.nextNode(),o++)}return vi.currentNode=Oi,s}p(e){let i=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}}class ts{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,r,s){this.type=2,this._$AH=pe,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=rr(this,e,i),Gr(e)?e===pe||e==null||e===""?(this._$AH!==pe&&this._$AR(),this._$AH=pe):e!==this._$AH&&e!==Je&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$f(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==pe&&Gr(this._$AH)?this._$AA.nextSibling.data=e:this.T(Oi.createTextNode(e)),this._$AH=e}$(e){const{values:i,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=Yr.createElement(jc(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(i);else{const n=new Nf(s,this),o=n.u(this.options);n.p(i),this.T(o),this._$AH=n}}_$AC(e){let i=Fl.get(e.strings);return i===void 0&&Fl.set(e.strings,i=new Yr(e)),i}k(e){Oa(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let r,s=0;for(const n of e)s===i.length?i.push(r=new ts(this.O(Wr()),this.O(Wr()),this,this.options)):r=i[s],r._$AI(n),s++;s<i.length&&(this._$AR(r&&r._$AB.nextSibling,s),i.length=s)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class pn{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,s,n){this.type=1,this._$AH=pe,this._$AN=void 0,this.element=e,this.name=i,this._$AM=s,this.options=n,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=pe}_$AI(e,i=this,r,s){const n=this.strings;let o=!1;if(n===void 0)e=rr(this,e,i,0),o=!Gr(e)||e!==this._$AH&&e!==Je,o&&(this._$AH=e);else{const l=e;let u,c;for(e=n[0],u=0;u<n.length-1;u++)c=rr(this,l[r+u],i,u),c===Je&&(c=this._$AH[u]),o||=!Gr(c)||c!==this._$AH[u],c===pe?e=pe:e!==pe&&(e+=(c??"")+n[u+1]),this._$AH[u]=c}o&&!s&&this.j(e)}j(e){e===pe?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}let Df=class extends pn{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===pe?void 0:e}};class Pf extends pn{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==pe)}}let Mf=class extends pn{constructor(e,i,r,s,n){super(e,i,r,s,n),this.type=5}_$AI(e,i=this){if((e=rr(this,e,i,0)??pe)===Je)return;const r=this._$AH,s=e===pe&&r!==pe||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,n=e!==pe&&(r===pe||s);s&&this.element.removeEventListener(this.name,this,r),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}};class zf{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){rr(this,e)}}const Rf=Ta.litHtmlPolyfillSupport;Rf?.(Yr,ts),(Ta.litHtmlVersions??=[]).push("3.3.1");const Bf=(t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(s===void 0){const n=i?.renderBefore??null;r._$litPart$=s=new ts(e.insertBefore(Wr(),n),n,void 0,i??{})}return s._$AI(t),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $a=globalThis;let Rr=class extends Ki{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Bf(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Je}};Rr._$litElement$=!0,Rr.finalized=!0,$a.litElementHydrateSupport?.({LitElement:Rr});const Ff=$a.litElementPolyfillSupport;Ff?.({LitElement:Rr});($a.litElementVersions??=[]).push("4.2.1");var qf=U`
  :host {
    display: block;
    outline: 0;
    z-index: 0;
  }

  :host(:focus) {
    outline: none;
  }

  slot:not([name])::slotted(sl-icon) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .tree-item {
    position: relative;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    color: var(--sl-color-neutral-700);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  .tree-item__checkbox {
    pointer-events: none;
  }

  .tree-item__expand-button,
  .tree-item__checkbox,
  .tree-item__label {
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    line-height: var(--sl-line-height-dense);
    letter-spacing: var(--sl-letter-spacing-normal);
  }

  .tree-item__checkbox::part(base) {
    display: flex;
    align-items: center;
  }

  .tree-item__indentation {
    display: block;
    width: 1em;
    flex-shrink: 0;
  }

  .tree-item__expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: content-box;
    color: var(--sl-color-neutral-500);
    padding: var(--sl-spacing-x-small);
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    cursor: pointer;
  }

  .tree-item__expand-button {
    transition: var(--sl-transition-medium) rotate ease;
  }

  .tree-item--expanded .tree-item__expand-button {
    rotate: 90deg;
  }

  .tree-item--expanded.tree-item--rtl .tree-item__expand-button {
    rotate: -90deg;
  }

  .tree-item--expanded slot[name='expand-icon'],
  .tree-item:not(.tree-item--expanded) slot[name='collapse-icon'] {
    display: none;
  }

  .tree-item:not(.tree-item--has-expand-button) .tree-item__expand-icon-slot {
    display: none;
  }

  .tree-item__expand-button--visible {
    cursor: pointer;
  }

  .tree-item__item {
    display: flex;
    align-items: center;
    border-inline-start: solid 3px transparent;
  }

  .tree-item--disabled .tree-item__item {
    opacity: 0.5;
    outline: none;
    cursor: not-allowed;
  }

  :host(:focus-visible) .tree-item__item {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
    z-index: 2;
  }

  :host(:not([aria-disabled='true'])) .tree-item--selected .tree-item__item {
    background-color: var(--sl-color-neutral-100);
    border-inline-start-color: var(--sl-color-primary-600);
  }

  :host(:not([aria-disabled='true'])) .tree-item__expand-button {
    color: var(--sl-color-neutral-600);
  }

  .tree-item__label {
    display: flex;
    align-items: center;
    transition: var(--sl-transition-fast) color;
  }

  .tree-item__children {
    display: block;
    font-size: calc(1em + var(--indent-size, var(--sl-spacing-medium)));
  }

  /* Indentation lines */
  .tree-item__children {
    position: relative;
  }

  .tree-item__children::before {
    content: '';
    position: absolute;
    top: var(--indent-guide-offset);
    bottom: var(--indent-guide-offset);
    left: calc(1em - (var(--indent-guide-width) / 2) - 1px);
    border-inline-end: var(--indent-guide-width) var(--indent-guide-style) var(--indent-guide-color);
    z-index: 1;
  }

  .tree-item--rtl .tree-item__children::before {
    left: auto;
    right: 1em;
  }

  @media (forced-colors: active) {
    :host(:not([aria-disabled='true'])) .tree-item--selected .tree-item__item {
      outline: dashed 1px SelectedItem;
    }
  }
`,Uf=U`
  :host {
    display: inline-block;
  }

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .checkbox--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .checkbox--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .checkbox--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .checkbox__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 2px;
    background-color: var(--sl-input-background-color);
    color: var(--sl-color-neutral-0);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .checkbox__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .checkbox__checked-icon,
  .checkbox__indeterminate-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  /* Hover */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Focus */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked/indeterminate */
  .checkbox--checked .checkbox__control,
  .checkbox--indeterminate .checkbox__control {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked/indeterminate + hover */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__control:hover,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked/indeterminate + focus */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .checkbox--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .checkbox__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }
`,ur=(t="value")=>(e,i)=>{const r=e.constructor,s=r.prototype.attributeChangedCallback;r.prototype.attributeChangedCallback=function(n,o,l){var u;const c=r.getPropertyOptions(t),h=typeof c.attribute=="string"?c.attribute:t;if(n===h){const f=c.converter||ir,d=(typeof f=="function"?f:(u=f?.fromAttribute)!=null?u:ir.fromAttribute)(l,c.type);this[t]!==d&&(this[i]=d)}s.call(this,n,o,l)}},Ni=U`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`,Ve=class{constructor(t,...e){this.slotNames=[],this.handleSlotChange=i=>{const r=i.target;(this.slotNames.includes("[default]")&&!r.name||r.name&&this.slotNames.includes(r.name))&&this.host.requestUpdate()},(this.host=t).addController(this),this.slotNames=e}hasDefaultSlot(){return[...this.host.childNodes].some(t=>{if(t.nodeType===t.TEXT_NODE&&t.textContent.trim()!=="")return!0;if(t.nodeType===t.ELEMENT_NODE){const e=t;if(e.tagName.toLowerCase()==="sl-visually-hidden")return!1;if(!e.hasAttribute("slot"))return!0}return!1})}hasNamedSlot(t){return this.host.querySelector(`:scope > [slot="${t}"]`)!==null}test(t){return t==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(t)}hostConnected(){this.host.shadowRoot.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){this.host.shadowRoot.removeEventListener("slotchange",this.handleSlotChange)}};function Vf(t){if(!t)return"";const e=t.assignedNodes({flatten:!0});let i="";return[...e].forEach(r=>{r.nodeType===Node.TEXT_NODE&&(i+=r.textContent)}),i}var ta="";function ia(t){ta=t}function jf(t=""){if(!ta){const e=[...document.getElementsByTagName("script")],i=e.find(r=>r.hasAttribute("data-shoelace"));if(i)ia(i.getAttribute("data-shoelace"));else{const r=e.find(n=>/shoelace(\.min)?\.js($|\?)/.test(n.src)||/shoelace-autoloader(\.min)?\.js($|\?)/.test(n.src));let s="";r&&(s=r.getAttribute("src")),ia(s.split("/").slice(0,-1).join("/"))}}return ta.replace(/\/$/,"")+(t?`/${t.replace(/^\//,"")}`:"")}var Hf={name:"default",resolver:t=>jf(`assets/icons/${t}.svg`)},Kf=Hf,ql={caret:`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,check:`
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"chevron-down":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,"chevron-left":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,"chevron-right":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,copy:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,eye:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,"eye-slash":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,eyedropper:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,"grip-vertical":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,indeterminate:`
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"person-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,"play-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,"pause-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,radio:`
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,"star-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,"x-lg":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,"x-circle-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `},Wf={name:"system",resolver:t=>t in ql?`data:image/svg+xml,${encodeURIComponent(ql[t])}`:""},Gf=Wf,Yf=[Kf,Gf],ra=[];function Xf(t){ra.push(t)}function Jf(t){ra=ra.filter(e=>e!==t)}function Ul(t){return Yf.find(e=>e.name===t)}var Qf=U`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;function M(t,e){const i=Yt({waitUntilFirstUpdate:!1},e);return(r,s)=>{const{update:n}=r,o=Array.isArray(t)?t:[t];r.update=function(l){o.forEach(u=>{const c=u;if(l.has(c)){const h=l.get(c),f=this[c];h!==f&&(!i.waitUntilFirstUpdate||this.hasUpdated)&&this[s](h,f)}}),n.call(this,l)}}}var H=U`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zf={attribute:!0,type:String,converter:ir,reflect:!1,hasChanged:Ea},e0=(t=Zf,e,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),r==="accessor"){const{name:o}=i;return{set(l){const u=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,u,t)},init(l){return l!==void 0&&this.C(o,void 0,t,l),l}}}if(r==="setter"){const{name:o}=i;return function(l){const u=this[o];e.call(this,l),this.requestUpdate(o,u,t)}}throw Error("Unsupported decorator location: "+r)};function k(t){return(e,i)=>typeof i=="object"?e0(t,e,i):((r,s,n)=>{const o=s.hasOwnProperty(n);return s.constructor.createProperty(n,r),o?Object.getOwnPropertyDescriptor(s,n):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function V(t){return k({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function is(t){return(e,i)=>{const r=typeof e=="function"?e:e[i];Object.assign(r,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Hc=(t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(t,e,i),i);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function R(t,e){return(i,r,s)=>{const n=o=>o.renderRoot?.querySelector(t)??null;return Hc(i,r,{get(){return n(this)}})}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function t0(t){return(e,i)=>Hc(e,i,{async get(){return await this.updateComplete,this.renderRoot?.querySelector(t)??null}})}var Us,q=class extends Rr{constructor(){super(),ff(this,Us,!1),this.initialReflectedProperties=new Map,Object.entries(this.constructor.dependencies).forEach(([t,e])=>{this.constructor.define(t,e)})}emit(t,e){const i=new CustomEvent(t,Yt({bubbles:!0,cancelable:!1,composed:!0,detail:{}},e));return this.dispatchEvent(i),i}static define(t,e=this,i={}){const r=customElements.get(t);if(!r){try{customElements.define(t,e,i)}catch{customElements.define(t,class extends e{},i)}return}let s=" (unknown version)",n=s;"version"in e&&e.version&&(s=" v"+e.version),"version"in r&&r.version&&(n=" v"+r.version),!(s&&n&&s===n)&&console.warn(`Attempted to register <${t}>${s}, but <${t}>${n} has already been registered.`)}attributeChangedCallback(t,e,i){hf(this,Us)||(this.constructor.elementProperties.forEach((r,s)=>{r.reflect&&this[s]!=null&&this.initialReflectedProperties.set(s,this[s])}),pf(this,Us,!0)),super.attributeChangedCallback(t,e,i)}willUpdate(t){super.willUpdate(t),this.initialReflectedProperties.forEach((e,i)=>{t.has(i)&&this[i]==null&&(this[i]=e)})}};Us=new WeakMap;q.version="2.20.1";q.dependencies={};m([k()],q.prototype,"dir",2);m([k()],q.prototype,"lang",2);/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const i0=(t,e)=>t?._$litType$!==void 0,Kc=t=>t.strings===void 0,r0={},s0=(t,e=r0)=>t._$AH=e;var Or=Symbol(),ws=Symbol(),Qn,Zn=new Map,fe=class extends q{constructor(){super(...arguments),this.initialRender=!1,this.svg=null,this.label="",this.library="default"}async resolveIcon(t,e){var i;let r;if(e?.spriteSheet)return this.svg=N`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`,this.svg;try{if(r=await fetch(t,{mode:"cors"}),!r.ok)return r.status===410?Or:ws}catch{return ws}try{const s=document.createElement("div");s.innerHTML=await r.text();const n=s.firstElementChild;if(((i=n?.tagName)==null?void 0:i.toLowerCase())!=="svg")return Or;Qn||(Qn=new DOMParser);const l=Qn.parseFromString(n.outerHTML,"text/html").body.querySelector("svg");return l?(l.part.add("svg"),document.adoptNode(l)):Or}catch{return Or}}connectedCallback(){super.connectedCallback(),Xf(this)}firstUpdated(){this.initialRender=!0,this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),Jf(this)}getIconSource(){const t=Ul(this.library);return this.name&&t?{url:t.resolver(this.name),fromLibrary:!0}:{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){var t;const{url:e,fromLibrary:i}=this.getIconSource(),r=i?Ul(this.library):void 0;if(!e){this.svg=null;return}let s=Zn.get(e);if(s||(s=this.resolveIcon(e,r),Zn.set(e,s)),!this.initialRender)return;const n=await s;if(n===ws&&Zn.delete(e),e===this.getIconSource().url){if(i0(n)){if(this.svg=n,r){await this.updateComplete;const o=this.shadowRoot.querySelector("[part='svg']");typeof r.mutator=="function"&&o&&r.mutator(o)}return}switch(n){case ws:case Or:this.svg=null,this.emit("sl-error");break;default:this.svg=n.cloneNode(!0),(t=r?.mutator)==null||t.call(r,this.svg),this.emit("sl-load")}}}render(){return this.svg}};fe.styles=[H,Qf];m([V()],fe.prototype,"svg",2);m([k({reflect:!0})],fe.prototype,"name",2);m([k()],fe.prototype,"src",2);m([k()],fe.prototype,"label",2);m([k({reflect:!0})],fe.prototype,"library",2);m([M("label")],fe.prototype,"handleLabelChange",1);m([M(["name","src","library"])],fe.prototype,"setIcon",1);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},rs=t=>(...e)=>({_$litDirective$:t,values:e});let ss=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=rs(class extends ss{constructor(t){if(super(t),t.type!==$t.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter((r=>r!==""))));for(const r in e)e[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(e)}const i=t.element.classList;for(const r of this.st)r in e||(i.remove(r),this.st.delete(r));for(const r in e){const s=!!e[r];s===this.st.has(r)||this.nt?.has(r)||(s?(i.add(r),this.st.add(r)):(i.remove(r),this.st.delete(r)))}return Je}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const F=t=>t??pe;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $i=rs(class extends ss{constructor(t){if(super(t),t.type!==$t.PROPERTY&&t.type!==$t.ATTRIBUTE&&t.type!==$t.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Kc(t))throw Error("`live` bindings can only contain a single expression")}render(t){return t}update(t,[e]){if(e===Je||e===pe)return e;const i=t.element,r=t.name;if(t.type===$t.PROPERTY){if(e===i[r])return Je}else if(t.type===$t.BOOLEAN_ATTRIBUTE){if(!!e===i.hasAttribute(r))return Je}else if(t.type===$t.ATTRIBUTE&&i.getAttribute(r)===e+"")return Je;return s0(t),e}});var Ee=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{value:t=>t.checked?t.value||"on":void 0,defaultValue:t=>t.defaultChecked,setValue:(t,e)=>t.checked=e}),this.hasSlotController=new Ve(this,"help-text"),this.hasFocus=!1,this.title="",this.name="",this.size="medium",this.disabled=!1,this.checked=!1,this.indeterminate=!1,this.defaultChecked=!1,this.form="",this.required=!1,this.helpText=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleClick(){this.checked=!this.checked,this.indeterminate=!1,this.emit("sl-change")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleInput(){this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleStateChange(){this.input.checked=this.checked,this.input.indeterminate=this.indeterminate,this.formControlController.updateValidity()}click(){this.input.click()}focus(t){this.input.focus(t)}blur(){this.input.blur()}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("help-text"),e=this.helpText?!0:!!t;return N`
      <div
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-help-text":e})}
      >
        <label
          part="base"
          class=${j({checkbox:!0,"checkbox--checked":this.checked,"checkbox--disabled":this.disabled,"checkbox--focused":this.hasFocus,"checkbox--indeterminate":this.indeterminate,"checkbox--small":this.size==="small","checkbox--medium":this.size==="medium","checkbox--large":this.size==="large"})}
        >
          <input
            class="checkbox__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${F(this.value)}
            .indeterminate=${$i(this.indeterminate)}
            .checked=${$i(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked?"true":"false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />

          <span
            part="control${this.checked?" control--checked":""}${this.indeterminate?" control--indeterminate":""}"
            class="checkbox__control"
          >
            ${this.checked?N`
                  <sl-icon part="checked-icon" class="checkbox__checked-icon" library="system" name="check"></sl-icon>
                `:""}
            ${!this.checked&&this.indeterminate?N`
                  <sl-icon
                    part="indeterminate-icon"
                    class="checkbox__indeterminate-icon"
                    library="system"
                    name="indeterminate"
                  ></sl-icon>
                `:""}
          </span>

          <div part="label" class="checkbox__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${e?"false":"true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};Ee.styles=[H,Ni,Uf];Ee.dependencies={"sl-icon":fe};m([R('input[type="checkbox"]')],Ee.prototype,"input",2);m([V()],Ee.prototype,"hasFocus",2);m([k()],Ee.prototype,"title",2);m([k()],Ee.prototype,"name",2);m([k()],Ee.prototype,"value",2);m([k({reflect:!0})],Ee.prototype,"size",2);m([k({type:Boolean,reflect:!0})],Ee.prototype,"disabled",2);m([k({type:Boolean,reflect:!0})],Ee.prototype,"checked",2);m([k({type:Boolean,reflect:!0})],Ee.prototype,"indeterminate",2);m([ur("checked")],Ee.prototype,"defaultChecked",2);m([k({reflect:!0})],Ee.prototype,"form",2);m([k({type:Boolean,reflect:!0})],Ee.prototype,"required",2);m([k({attribute:"help-text"})],Ee.prototype,"helpText",2);m([M("disabled",{waitUntilFirstUpdate:!0})],Ee.prototype,"handleDisabledChange",1);m([M(["checked","indeterminate"],{waitUntilFirstUpdate:!0})],Ee.prototype,"handleStateChange",1);var n0=U`
  :host {
    --track-width: 2px;
    --track-color: rgb(128 128 128 / 25%);
    --indicator-color: var(--sl-color-primary-600);
    --speed: 2s;

    display: inline-flex;
    width: 1em;
    height: 1em;
    flex: none;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.05em, 3em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.05em, 3em;
    }
  }
`;const sa=new Set,Wi=new Map;let yi,Ia="ltr",La="en";const Wc=typeof MutationObserver<"u"&&typeof document<"u"&&typeof document.documentElement<"u";if(Wc){const t=new MutationObserver(Yc);Ia=document.documentElement.dir||"ltr",La=document.documentElement.lang||navigator.language,t.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]})}function Gc(...t){t.map(e=>{const i=e.$code.toLowerCase();Wi.has(i)?Wi.set(i,Object.assign(Object.assign({},Wi.get(i)),e)):Wi.set(i,e),yi||(yi=e)}),Yc()}function Yc(){Wc&&(Ia=document.documentElement.dir||"ltr",La=document.documentElement.lang||navigator.language),[...sa.keys()].map(t=>{typeof t.requestUpdate=="function"&&t.requestUpdate()})}let o0=class{constructor(e){this.host=e,this.host.addController(this)}hostConnected(){sa.add(this.host)}hostDisconnected(){sa.delete(this.host)}dir(){return`${this.host.dir||Ia}`.toLowerCase()}lang(){return`${this.host.lang||La}`.toLowerCase()}getTranslationData(e){var i,r;const s=new Intl.Locale(e.replace(/_/g,"-")),n=s?.language.toLowerCase(),o=(r=(i=s?.region)===null||i===void 0?void 0:i.toLowerCase())!==null&&r!==void 0?r:"",l=Wi.get(`${n}-${o}`),u=Wi.get(n);return{locale:s,language:n,region:o,primary:l,secondary:u}}exists(e,i){var r;const{primary:s,secondary:n}=this.getTranslationData((r=i.lang)!==null&&r!==void 0?r:this.lang());return i=Object.assign({includeFallback:!1},i),!!(s&&s[e]||n&&n[e]||i.includeFallback&&yi&&yi[e])}term(e,...i){const{primary:r,secondary:s}=this.getTranslationData(this.lang());let n;if(r&&r[e])n=r[e];else if(s&&s[e])n=s[e];else if(yi&&yi[e])n=yi[e];else return console.error(`No translation found for: ${String(e)}`),String(e);return typeof n=="function"?n(...i):n}date(e,i){return e=new Date(e),new Intl.DateTimeFormat(this.lang(),i).format(e)}number(e,i){return e=Number(e),isNaN(e)?"":new Intl.NumberFormat(this.lang(),i).format(e)}relativeTime(e,i,r){return new Intl.RelativeTimeFormat(this.lang(),r).format(e,i)}};var Xc={$code:"en",$name:"English",$dir:"ltr",carousel:"Carousel",clearEntry:"Clear entry",close:"Close",copied:"Copied",copy:"Copy",currentValue:"Current value",error:"Error",goToSlide:(t,e)=>`Go to slide ${t} of ${e}`,hidePassword:"Hide password",loading:"Loading",nextSlide:"Next slide",numOptionsSelected:t=>t===0?"No options selected":t===1?"1 option selected":`${t} options selected`,previousSlide:"Previous slide",progress:"Progress",remove:"Remove",resize:"Resize",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",selectAColorFromTheScreen:"Select a color from the screen",showPassword:"Show password",slideNum:t=>`Slide ${t}`,toggleColorFormat:"Toggle color format"};Gc(Xc);var a0=Xc,ie=class extends o0{};Gc(a0);var ns=class extends q{constructor(){super(...arguments),this.localize=new ie(this)}render(){return N`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `}};ns.styles=[H,n0];var Jc=new Map,l0=new WeakMap;function u0(t){return t??{keyframes:[],options:{duration:0}}}function Vl(t,e){return e.toLowerCase()==="rtl"?{keyframes:t.rtlKeyframes||t.keyframes,options:t.options}:t}function oe(t,e){Jc.set(t,u0(e))}function me(t,e,i){const r=l0.get(t);if(r?.[e])return Vl(r[e],i.dir);const s=Jc.get(e);return s?Vl(s,i.dir):{keyframes:[],options:{duration:0}}}function _e(t,e,i){return new Promise(r=>{if(i?.duration===1/0)throw new Error("Promise-based animations must be finite.");const s=t.animate(e,es(Yt({},i),{duration:na()?0:i.duration}));s.addEventListener("cancel",r,{once:!0}),s.addEventListener("finish",r,{once:!0})})}function jl(t){return t=t.toString().toLowerCase(),t.indexOf("ms")>-1?parseFloat(t):t.indexOf("s")>-1?parseFloat(t)*1e3:parseFloat(t)}function na(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}function Ae(t){return Promise.all(t.getAnimations().map(e=>new Promise(i=>{e.cancel(),requestAnimationFrame(i)})))}function Zs(t,e){return t.map(i=>es(Yt({},i),{height:i.height==="auto"?`${e}px`:i.height}))}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Hl(t,e,i){return t?e(t):i?.(t)}var ke=class oa extends q{constructor(){super(...arguments),this.localize=new ie(this),this.indeterminate=!1,this.isLeaf=!1,this.loading=!1,this.selectable=!1,this.expanded=!1,this.selected=!1,this.disabled=!1,this.lazy=!1}static isTreeItem(e){return e instanceof Element&&e.getAttribute("role")==="treeitem"}connectedCallback(){super.connectedCallback(),this.setAttribute("role","treeitem"),this.setAttribute("tabindex","-1"),this.isNestedItem()&&(this.slot="children")}firstUpdated(){this.childrenContainer.hidden=!this.expanded,this.childrenContainer.style.height=this.expanded?"auto":"0",this.isLeaf=!this.lazy&&this.getChildrenItems().length===0,this.handleExpandedChange()}async animateCollapse(){this.emit("sl-collapse"),await Ae(this.childrenContainer);const{keyframes:e,options:i}=me(this,"tree-item.collapse",{dir:this.localize.dir()});await _e(this.childrenContainer,Zs(e,this.childrenContainer.scrollHeight),i),this.childrenContainer.hidden=!0,this.emit("sl-after-collapse")}isNestedItem(){const e=this.parentElement;return!!e&&oa.isTreeItem(e)}handleChildrenSlotChange(){this.loading=!1,this.isLeaf=!this.lazy&&this.getChildrenItems().length===0}willUpdate(e){e.has("selected")&&!e.has("indeterminate")&&(this.indeterminate=!1)}async animateExpand(){this.emit("sl-expand"),await Ae(this.childrenContainer),this.childrenContainer.hidden=!1;const{keyframes:e,options:i}=me(this,"tree-item.expand",{dir:this.localize.dir()});await _e(this.childrenContainer,Zs(e,this.childrenContainer.scrollHeight),i),this.childrenContainer.style.height="auto",this.emit("sl-after-expand")}handleLoadingChange(){this.setAttribute("aria-busy",this.loading?"true":"false"),this.loading||this.animateExpand()}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}handleSelectedChange(){this.setAttribute("aria-selected",this.selected?"true":"false")}handleExpandedChange(){this.isLeaf?this.removeAttribute("aria-expanded"):this.setAttribute("aria-expanded",this.expanded?"true":"false")}handleExpandAnimation(){this.expanded?this.lazy?(this.loading=!0,this.emit("sl-lazy-load")):this.animateExpand():this.animateCollapse()}handleLazyChange(){this.emit("sl-lazy-change")}getChildrenItems({includeDisabled:e=!0}={}){return this.childrenSlot?[...this.childrenSlot.assignedElements({flatten:!0})].filter(i=>oa.isTreeItem(i)&&(e||!i.disabled)):[]}render(){const e=this.localize.dir()==="rtl",i=!this.loading&&(!this.isLeaf||this.lazy);return N`
      <div
        part="base"
        class="${j({"tree-item":!0,"tree-item--expanded":this.expanded,"tree-item--selected":this.selected,"tree-item--disabled":this.disabled,"tree-item--leaf":this.isLeaf,"tree-item--has-expand-button":i,"tree-item--rtl":this.localize.dir()==="rtl"})}"
      >
        <div
          class="tree-item__item"
          part="
            item
            ${this.disabled?"item--disabled":""}
            ${this.expanded?"item--expanded":""}
            ${this.indeterminate?"item--indeterminate":""}
            ${this.selected?"item--selected":""}
          "
        >
          <div class="tree-item__indentation" part="indentation"></div>

          <div
            part="expand-button"
            class=${j({"tree-item__expand-button":!0,"tree-item__expand-button--visible":i})}
            aria-hidden="true"
          >
            ${Hl(this.loading,()=>N` <sl-spinner part="spinner" exportparts="base:spinner__base"></sl-spinner> `)}
            <slot class="tree-item__expand-icon-slot" name="expand-icon">
              <sl-icon library="system" name=${e?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
            <slot class="tree-item__expand-icon-slot" name="collapse-icon">
              <sl-icon library="system" name=${e?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
          </div>

          ${Hl(this.selectable,()=>N`
              <sl-checkbox
                part="checkbox"
                exportparts="
                    base:checkbox__base,
                    control:checkbox__control,
                    control--checked:checkbox__control--checked,
                    control--indeterminate:checkbox__control--indeterminate,
                    checked-icon:checkbox__checked-icon,
                    indeterminate-icon:checkbox__indeterminate-icon,
                    label:checkbox__label
                  "
                class="tree-item__checkbox"
                ?disabled="${this.disabled}"
                ?checked="${$i(this.selected)}"
                ?indeterminate="${this.indeterminate}"
                tabindex="-1"
              ></sl-checkbox>
            `)}

          <slot class="tree-item__label" part="label"></slot>
        </div>

        <div class="tree-item__children" part="children" role="group">
          <slot name="children" @slotchange="${this.handleChildrenSlotChange}"></slot>
        </div>
      </div>
    `}};ke.styles=[H,qf];ke.dependencies={"sl-checkbox":Ee,"sl-icon":fe,"sl-spinner":ns};m([V()],ke.prototype,"indeterminate",2);m([V()],ke.prototype,"isLeaf",2);m([V()],ke.prototype,"loading",2);m([V()],ke.prototype,"selectable",2);m([k({type:Boolean,reflect:!0})],ke.prototype,"expanded",2);m([k({type:Boolean,reflect:!0})],ke.prototype,"selected",2);m([k({type:Boolean,reflect:!0})],ke.prototype,"disabled",2);m([k({type:Boolean,reflect:!0})],ke.prototype,"lazy",2);m([R("slot:not([name])")],ke.prototype,"defaultSlot",2);m([R("slot[name=children]")],ke.prototype,"childrenSlot",2);m([R(".tree-item__item")],ke.prototype,"itemElement",2);m([R(".tree-item__children")],ke.prototype,"childrenContainer",2);m([R(".tree-item__expand-button slot")],ke.prototype,"expandButtonSlot",2);m([M("loading",{waitUntilFirstUpdate:!0})],ke.prototype,"handleLoadingChange",1);m([M("disabled")],ke.prototype,"handleDisabledChange",1);m([M("selected")],ke.prototype,"handleSelectedChange",1);m([M("expanded",{waitUntilFirstUpdate:!0})],ke.prototype,"handleExpandedChange",1);m([M("expanded",{waitUntilFirstUpdate:!0})],ke.prototype,"handleExpandAnimation",1);m([M("lazy",{waitUntilFirstUpdate:!0})],ke.prototype,"handleLazyChange",1);var Br=ke;oe("tree-item.expand",{keyframes:[{height:"0",opacity:"0",overflow:"hidden"},{height:"auto",opacity:"1",overflow:"hidden"}],options:{duration:250,easing:"cubic-bezier(0.4, 0.0, 0.2, 1)"}});oe("tree-item.collapse",{keyframes:[{height:"auto",opacity:"1",overflow:"hidden"},{height:"0",opacity:"0",overflow:"hidden"}],options:{duration:200,easing:"cubic-bezier(0.4, 0.0, 0.2, 1)"}});Br.define("sl-tree-item");var c0=U`
  :host {
    --max-width: 20rem;
    --hide-delay: 0ms;
    --show-delay: 150ms;

    display: contents;
  }

  .tooltip {
    --arrow-size: var(--sl-tooltip-arrow-size);
    --arrow-color: var(--sl-tooltip-background-color);
  }

  .tooltip::part(popup) {
    z-index: var(--sl-z-index-tooltip);
  }

  .tooltip[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .tooltip[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[placement^='right']::part(popup) {
    transform-origin: left;
  }

  .tooltip__body {
    display: block;
    width: max-content;
    max-width: var(--max-width);
    border-radius: var(--sl-tooltip-border-radius);
    background-color: var(--sl-tooltip-background-color);
    font-family: var(--sl-tooltip-font-family);
    font-size: var(--sl-tooltip-font-size);
    font-weight: var(--sl-tooltip-font-weight);
    line-height: var(--sl-tooltip-line-height);
    text-align: start;
    white-space: normal;
    color: var(--sl-tooltip-color);
    padding: var(--sl-tooltip-padding);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
`,d0=U`
  :host {
    --arrow-color: var(--sl-color-neutral-1000);
    --arrow-size: 6px;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --arrow-size-diagonal: calc(var(--arrow-size) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);
  }

  .popup--fixed {
    position: fixed;
  }

  .popup:not(.popup--active) {
    display: none;
  }

  .popup__arrow {
    position: absolute;
    width: calc(var(--arrow-size-diagonal) * 2);
    height: calc(var(--arrow-size-diagonal) * 2);
    rotate: 45deg;
    background: var(--arrow-color);
    z-index: -1;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge--visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;const ri=Math.min,Ye=Math.max,en=Math.round,xs=Math.floor,It=t=>({x:t,y:t}),h0={left:"right",right:"left",bottom:"top",top:"bottom"},f0={start:"end",end:"start"};function aa(t,e,i){return Ye(t,ri(e,i))}function cr(t,e){return typeof t=="function"?t(e):t}function si(t){return t.split("-")[0]}function dr(t){return t.split("-")[1]}function Qc(t){return t==="x"?"y":"x"}function Na(t){return t==="y"?"height":"width"}const p0=new Set(["top","bottom"]);function Kt(t){return p0.has(si(t))?"y":"x"}function Da(t){return Qc(Kt(t))}function m0(t,e,i){i===void 0&&(i=!1);const r=dr(t),s=Da(t),n=Na(s);let o=s==="x"?r===(i?"end":"start")?"right":"left":r==="start"?"bottom":"top";return e.reference[n]>e.floating[n]&&(o=tn(o)),[o,tn(o)]}function b0(t){const e=tn(t);return[la(t),e,la(e)]}function la(t){return t.replace(/start|end/g,e=>f0[e])}const Kl=["left","right"],Wl=["right","left"],g0=["top","bottom"],y0=["bottom","top"];function v0(t,e,i){switch(t){case"top":case"bottom":return i?e?Wl:Kl:e?Kl:Wl;case"left":case"right":return e?g0:y0;default:return[]}}function w0(t,e,i,r){const s=dr(t);let n=v0(si(t),i==="start",r);return s&&(n=n.map(o=>o+"-"+s),e&&(n=n.concat(n.map(la)))),n}function tn(t){return t.replace(/left|right|bottom|top/g,e=>h0[e])}function x0(t){return{top:0,right:0,bottom:0,left:0,...t}}function Zc(t){return typeof t!="number"?x0(t):{top:t,right:t,bottom:t,left:t}}function rn(t){const{x:e,y:i,width:r,height:s}=t;return{width:r,height:s,top:i,left:e,right:e+r,bottom:i+s,x:e,y:i}}function Gl(t,e,i){let{reference:r,floating:s}=t;const n=Kt(e),o=Da(e),l=Na(o),u=si(e),c=n==="y",h=r.x+r.width/2-s.width/2,f=r.y+r.height/2-s.height/2,a=r[l]/2-s[l]/2;let d;switch(u){case"top":d={x:h,y:r.y-s.height};break;case"bottom":d={x:h,y:r.y+r.height};break;case"right":d={x:r.x+r.width,y:f};break;case"left":d={x:r.x-s.width,y:f};break;default:d={x:r.x,y:r.y}}switch(dr(e)){case"start":d[o]-=a*(i&&c?-1:1);break;case"end":d[o]+=a*(i&&c?-1:1);break}return d}const _0=async(t,e,i)=>{const{placement:r="bottom",strategy:s="absolute",middleware:n=[],platform:o}=i,l=n.filter(Boolean),u=await(o.isRTL==null?void 0:o.isRTL(e));let c=await o.getElementRects({reference:t,floating:e,strategy:s}),{x:h,y:f}=Gl(c,r,u),a=r,d={},p=0;for(let b=0;b<l.length;b++){const{name:w,fn:g}=l[b],{x,y:_,data:v,reset:y}=await g({x:h,y:f,initialPlacement:r,placement:a,strategy:s,middlewareData:d,rects:c,platform:o,elements:{reference:t,floating:e}});h=x??h,f=_??f,d={...d,[w]:{...d[w],...v}},y&&p<=50&&(p++,typeof y=="object"&&(y.placement&&(a=y.placement),y.rects&&(c=y.rects===!0?await o.getElementRects({reference:t,floating:e,strategy:s}):y.rects),{x:h,y:f}=Gl(c,a,u)),b=-1)}return{x:h,y:f,placement:a,strategy:s,middlewareData:d}};async function Pa(t,e){var i;e===void 0&&(e={});const{x:r,y:s,platform:n,rects:o,elements:l,strategy:u}=t,{boundary:c="clippingAncestors",rootBoundary:h="viewport",elementContext:f="floating",altBoundary:a=!1,padding:d=0}=cr(e,t),p=Zc(d),w=l[a?f==="floating"?"reference":"floating":f],g=rn(await n.getClippingRect({element:(i=await(n.isElement==null?void 0:n.isElement(w)))==null||i?w:w.contextElement||await(n.getDocumentElement==null?void 0:n.getDocumentElement(l.floating)),boundary:c,rootBoundary:h,strategy:u})),x=f==="floating"?{x:r,y:s,width:o.floating.width,height:o.floating.height}:o.reference,_=await(n.getOffsetParent==null?void 0:n.getOffsetParent(l.floating)),v=await(n.isElement==null?void 0:n.isElement(_))?await(n.getScale==null?void 0:n.getScale(_))||{x:1,y:1}:{x:1,y:1},y=rn(n.convertOffsetParentRelativeRectToViewportRelativeRect?await n.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:x,offsetParent:_,strategy:u}):x);return{top:(g.top-y.top+p.top)/v.y,bottom:(y.bottom-g.bottom+p.bottom)/v.y,left:(g.left-y.left+p.left)/v.x,right:(y.right-g.right+p.right)/v.x}}const k0=t=>({name:"arrow",options:t,async fn(e){const{x:i,y:r,placement:s,rects:n,platform:o,elements:l,middlewareData:u}=e,{element:c,padding:h=0}=cr(t,e)||{};if(c==null)return{};const f=Zc(h),a={x:i,y:r},d=Da(s),p=Na(d),b=await o.getDimensions(c),w=d==="y",g=w?"top":"left",x=w?"bottom":"right",_=w?"clientHeight":"clientWidth",v=n.reference[p]+n.reference[d]-a[d]-n.floating[p],y=a[d]-n.reference[d],S=await(o.getOffsetParent==null?void 0:o.getOffsetParent(c));let C=S?S[_]:0;(!C||!await(o.isElement==null?void 0:o.isElement(S)))&&(C=l.floating[_]||n.floating[p]);const A=v/2-y/2,T=C/2-b[p]/2-1,$=ri(f[g],T),E=ri(f[x],T),O=$,D=C-b[p]-E,z=C/2-b[p]/2+A,I=aa(O,z,D),K=!u.arrow&&dr(s)!=null&&z!==I&&n.reference[p]/2-(z<O?$:E)-b[p]/2<0,G=K?z<O?z-O:z-D:0;return{[d]:a[d]+G,data:{[d]:I,centerOffset:z-I-G,...K&&{alignmentOffset:G}},reset:K}}}),S0=function(t){return t===void 0&&(t={}),{name:"flip",options:t,async fn(e){var i,r;const{placement:s,middlewareData:n,rects:o,initialPlacement:l,platform:u,elements:c}=e,{mainAxis:h=!0,crossAxis:f=!0,fallbackPlacements:a,fallbackStrategy:d="bestFit",fallbackAxisSideDirection:p="none",flipAlignment:b=!0,...w}=cr(t,e);if((i=n.arrow)!=null&&i.alignmentOffset)return{};const g=si(s),x=Kt(l),_=si(l)===l,v=await(u.isRTL==null?void 0:u.isRTL(c.floating)),y=a||(_||!b?[tn(l)]:b0(l)),S=p!=="none";!a&&S&&y.push(...w0(l,b,p,v));const C=[l,...y],A=await Pa(e,w),T=[];let $=((r=n.flip)==null?void 0:r.overflows)||[];if(h&&T.push(A[g]),f){const z=m0(s,o,v);T.push(A[z[0]],A[z[1]])}if($=[...$,{placement:s,overflows:T}],!T.every(z=>z<=0)){var E,O;const z=(((E=n.flip)==null?void 0:E.index)||0)+1,I=C[z];if(I&&(!(f==="alignment"?x!==Kt(I):!1)||$.every(Z=>Kt(Z.placement)===x?Z.overflows[0]>0:!0)))return{data:{index:z,overflows:$},reset:{placement:I}};let K=(O=$.filter(G=>G.overflows[0]<=0).sort((G,Z)=>G.overflows[1]-Z.overflows[1])[0])==null?void 0:O.placement;if(!K)switch(d){case"bestFit":{var D;const G=(D=$.filter(Z=>{if(S){const se=Kt(Z.placement);return se===x||se==="y"}return!0}).map(Z=>[Z.placement,Z.overflows.filter(se=>se>0).reduce((se,ge)=>se+ge,0)]).sort((Z,se)=>Z[1]-se[1])[0])==null?void 0:D[0];G&&(K=G);break}case"initialPlacement":K=l;break}if(s!==K)return{reset:{placement:K}}}return{}}}},C0=new Set(["left","top"]);async function A0(t,e){const{placement:i,platform:r,elements:s}=t,n=await(r.isRTL==null?void 0:r.isRTL(s.floating)),o=si(i),l=dr(i),u=Kt(i)==="y",c=C0.has(o)?-1:1,h=n&&u?-1:1,f=cr(e,t);let{mainAxis:a,crossAxis:d,alignmentAxis:p}=typeof f=="number"?{mainAxis:f,crossAxis:0,alignmentAxis:null}:{mainAxis:f.mainAxis||0,crossAxis:f.crossAxis||0,alignmentAxis:f.alignmentAxis};return l&&typeof p=="number"&&(d=l==="end"?p*-1:p),u?{x:d*h,y:a*c}:{x:a*c,y:d*h}}const E0=function(t){return t===void 0&&(t=0),{name:"offset",options:t,async fn(e){var i,r;const{x:s,y:n,placement:o,middlewareData:l}=e,u=await A0(e,t);return o===((i=l.offset)==null?void 0:i.placement)&&(r=l.arrow)!=null&&r.alignmentOffset?{}:{x:s+u.x,y:n+u.y,data:{...u,placement:o}}}}},T0=function(t){return t===void 0&&(t={}),{name:"shift",options:t,async fn(e){const{x:i,y:r,placement:s}=e,{mainAxis:n=!0,crossAxis:o=!1,limiter:l={fn:w=>{let{x:g,y:x}=w;return{x:g,y:x}}},...u}=cr(t,e),c={x:i,y:r},h=await Pa(e,u),f=Kt(si(s)),a=Qc(f);let d=c[a],p=c[f];if(n){const w=a==="y"?"top":"left",g=a==="y"?"bottom":"right",x=d+h[w],_=d-h[g];d=aa(x,d,_)}if(o){const w=f==="y"?"top":"left",g=f==="y"?"bottom":"right",x=p+h[w],_=p-h[g];p=aa(x,p,_)}const b=l.fn({...e,[a]:d,[f]:p});return{...b,data:{x:b.x-i,y:b.y-r,enabled:{[a]:n,[f]:o}}}}}},O0=function(t){return t===void 0&&(t={}),{name:"size",options:t,async fn(e){var i,r;const{placement:s,rects:n,platform:o,elements:l}=e,{apply:u=()=>{},...c}=cr(t,e),h=await Pa(e,c),f=si(s),a=dr(s),d=Kt(s)==="y",{width:p,height:b}=n.floating;let w,g;f==="top"||f==="bottom"?(w=f,g=a===(await(o.isRTL==null?void 0:o.isRTL(l.floating))?"start":"end")?"left":"right"):(g=f,w=a==="end"?"top":"bottom");const x=b-h.top-h.bottom,_=p-h.left-h.right,v=ri(b-h[w],x),y=ri(p-h[g],_),S=!e.middlewareData.shift;let C=v,A=y;if((i=e.middlewareData.shift)!=null&&i.enabled.x&&(A=_),(r=e.middlewareData.shift)!=null&&r.enabled.y&&(C=x),S&&!a){const $=Ye(h.left,0),E=Ye(h.right,0),O=Ye(h.top,0),D=Ye(h.bottom,0);d?A=p-2*($!==0||E!==0?$+E:Ye(h.left,h.right)):C=b-2*(O!==0||D!==0?O+D:Ye(h.top,h.bottom))}await u({...e,availableWidth:A,availableHeight:C});const T=await o.getDimensions(l.floating);return p!==T.width||b!==T.height?{reset:{rects:!0}}:{}}}};function mn(){return typeof window<"u"}function hr(t){return ed(t)?(t.nodeName||"").toLowerCase():"#document"}function Qe(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function Mt(t){var e;return(e=(ed(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function ed(t){return mn()?t instanceof Node||t instanceof Qe(t).Node:!1}function vt(t){return mn()?t instanceof Element||t instanceof Qe(t).Element:!1}function Nt(t){return mn()?t instanceof HTMLElement||t instanceof Qe(t).HTMLElement:!1}function Yl(t){return!mn()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof Qe(t).ShadowRoot}const $0=new Set(["inline","contents"]);function os(t){const{overflow:e,overflowX:i,overflowY:r,display:s}=wt(t);return/auto|scroll|overlay|hidden|clip/.test(e+r+i)&&!$0.has(s)}const I0=new Set(["table","td","th"]);function L0(t){return I0.has(hr(t))}const N0=[":popover-open",":modal"];function bn(t){return N0.some(e=>{try{return t.matches(e)}catch{return!1}})}const D0=["transform","translate","scale","rotate","perspective"],P0=["transform","translate","scale","rotate","perspective","filter"],M0=["paint","layout","strict","content"];function gn(t){const e=Ma(),i=vt(t)?wt(t):t;return D0.some(r=>i[r]?i[r]!=="none":!1)||(i.containerType?i.containerType!=="normal":!1)||!e&&(i.backdropFilter?i.backdropFilter!=="none":!1)||!e&&(i.filter?i.filter!=="none":!1)||P0.some(r=>(i.willChange||"").includes(r))||M0.some(r=>(i.contain||"").includes(r))}function z0(t){let e=ni(t);for(;Nt(e)&&!sr(e);){if(gn(e))return e;if(bn(e))return null;e=ni(e)}return null}function Ma(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}const R0=new Set(["html","body","#document"]);function sr(t){return R0.has(hr(t))}function wt(t){return Qe(t).getComputedStyle(t)}function yn(t){return vt(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function ni(t){if(hr(t)==="html")return t;const e=t.assignedSlot||t.parentNode||Yl(t)&&t.host||Mt(t);return Yl(e)?e.host:e}function td(t){const e=ni(t);return sr(e)?t.ownerDocument?t.ownerDocument.body:t.body:Nt(e)&&os(e)?e:td(e)}function Xr(t,e,i){var r;e===void 0&&(e=[]),i===void 0&&(i=!0);const s=td(t),n=s===((r=t.ownerDocument)==null?void 0:r.body),o=Qe(s);if(n){const l=ua(o);return e.concat(o,o.visualViewport||[],os(s)?s:[],l&&i?Xr(l):[])}return e.concat(s,Xr(s,[],i))}function ua(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function id(t){const e=wt(t);let i=parseFloat(e.width)||0,r=parseFloat(e.height)||0;const s=Nt(t),n=s?t.offsetWidth:i,o=s?t.offsetHeight:r,l=en(i)!==n||en(r)!==o;return l&&(i=n,r=o),{width:i,height:r,$:l}}function za(t){return vt(t)?t:t.contextElement}function Zi(t){const e=za(t);if(!Nt(e))return It(1);const i=e.getBoundingClientRect(),{width:r,height:s,$:n}=id(e);let o=(n?en(i.width):i.width)/r,l=(n?en(i.height):i.height)/s;return(!o||!Number.isFinite(o))&&(o=1),(!l||!Number.isFinite(l))&&(l=1),{x:o,y:l}}const B0=It(0);function rd(t){const e=Qe(t);return!Ma()||!e.visualViewport?B0:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function F0(t,e,i){return e===void 0&&(e=!1),!i||e&&i!==Qe(t)?!1:e}function Ii(t,e,i,r){e===void 0&&(e=!1),i===void 0&&(i=!1);const s=t.getBoundingClientRect(),n=za(t);let o=It(1);e&&(r?vt(r)&&(o=Zi(r)):o=Zi(t));const l=F0(n,i,r)?rd(n):It(0);let u=(s.left+l.x)/o.x,c=(s.top+l.y)/o.y,h=s.width/o.x,f=s.height/o.y;if(n){const a=Qe(n),d=r&&vt(r)?Qe(r):r;let p=a,b=ua(p);for(;b&&r&&d!==p;){const w=Zi(b),g=b.getBoundingClientRect(),x=wt(b),_=g.left+(b.clientLeft+parseFloat(x.paddingLeft))*w.x,v=g.top+(b.clientTop+parseFloat(x.paddingTop))*w.y;u*=w.x,c*=w.y,h*=w.x,f*=w.y,u+=_,c+=v,p=Qe(b),b=ua(p)}}return rn({width:h,height:f,x:u,y:c})}function vn(t,e){const i=yn(t).scrollLeft;return e?e.left+i:Ii(Mt(t)).left+i}function sd(t,e){const i=t.getBoundingClientRect(),r=i.left+e.scrollLeft-vn(t,i),s=i.top+e.scrollTop;return{x:r,y:s}}function q0(t){let{elements:e,rect:i,offsetParent:r,strategy:s}=t;const n=s==="fixed",o=Mt(r),l=e?bn(e.floating):!1;if(r===o||l&&n)return i;let u={scrollLeft:0,scrollTop:0},c=It(1);const h=It(0),f=Nt(r);if((f||!f&&!n)&&((hr(r)!=="body"||os(o))&&(u=yn(r)),Nt(r))){const d=Ii(r);c=Zi(r),h.x=d.x+r.clientLeft,h.y=d.y+r.clientTop}const a=o&&!f&&!n?sd(o,u):It(0);return{width:i.width*c.x,height:i.height*c.y,x:i.x*c.x-u.scrollLeft*c.x+h.x+a.x,y:i.y*c.y-u.scrollTop*c.y+h.y+a.y}}function U0(t){return Array.from(t.getClientRects())}function V0(t){const e=Mt(t),i=yn(t),r=t.ownerDocument.body,s=Ye(e.scrollWidth,e.clientWidth,r.scrollWidth,r.clientWidth),n=Ye(e.scrollHeight,e.clientHeight,r.scrollHeight,r.clientHeight);let o=-i.scrollLeft+vn(t);const l=-i.scrollTop;return wt(r).direction==="rtl"&&(o+=Ye(e.clientWidth,r.clientWidth)-s),{width:s,height:n,x:o,y:l}}const Xl=25;function j0(t,e){const i=Qe(t),r=Mt(t),s=i.visualViewport;let n=r.clientWidth,o=r.clientHeight,l=0,u=0;if(s){n=s.width,o=s.height;const h=Ma();(!h||h&&e==="fixed")&&(l=s.offsetLeft,u=s.offsetTop)}const c=vn(r);if(c<=0){const h=r.ownerDocument,f=h.body,a=getComputedStyle(f),d=h.compatMode==="CSS1Compat"&&parseFloat(a.marginLeft)+parseFloat(a.marginRight)||0,p=Math.abs(r.clientWidth-f.clientWidth-d);p<=Xl&&(n-=p)}else c<=Xl&&(n+=c);return{width:n,height:o,x:l,y:u}}const H0=new Set(["absolute","fixed"]);function K0(t,e){const i=Ii(t,!0,e==="fixed"),r=i.top+t.clientTop,s=i.left+t.clientLeft,n=Nt(t)?Zi(t):It(1),o=t.clientWidth*n.x,l=t.clientHeight*n.y,u=s*n.x,c=r*n.y;return{width:o,height:l,x:u,y:c}}function Jl(t,e,i){let r;if(e==="viewport")r=j0(t,i);else if(e==="document")r=V0(Mt(t));else if(vt(e))r=K0(e,i);else{const s=rd(t);r={x:e.x-s.x,y:e.y-s.y,width:e.width,height:e.height}}return rn(r)}function nd(t,e){const i=ni(t);return i===e||!vt(i)||sr(i)?!1:wt(i).position==="fixed"||nd(i,e)}function W0(t,e){const i=e.get(t);if(i)return i;let r=Xr(t,[],!1).filter(l=>vt(l)&&hr(l)!=="body"),s=null;const n=wt(t).position==="fixed";let o=n?ni(t):t;for(;vt(o)&&!sr(o);){const l=wt(o),u=gn(o);!u&&l.position==="fixed"&&(s=null),(n?!u&&!s:!u&&l.position==="static"&&!!s&&H0.has(s.position)||os(o)&&!u&&nd(t,o))?r=r.filter(h=>h!==o):s=l,o=ni(o)}return e.set(t,r),r}function G0(t){let{element:e,boundary:i,rootBoundary:r,strategy:s}=t;const o=[...i==="clippingAncestors"?bn(e)?[]:W0(e,this._c):[].concat(i),r],l=o[0],u=o.reduce((c,h)=>{const f=Jl(e,h,s);return c.top=Ye(f.top,c.top),c.right=ri(f.right,c.right),c.bottom=ri(f.bottom,c.bottom),c.left=Ye(f.left,c.left),c},Jl(e,l,s));return{width:u.right-u.left,height:u.bottom-u.top,x:u.left,y:u.top}}function Y0(t){const{width:e,height:i}=id(t);return{width:e,height:i}}function X0(t,e,i){const r=Nt(e),s=Mt(e),n=i==="fixed",o=Ii(t,!0,n,e);let l={scrollLeft:0,scrollTop:0};const u=It(0);function c(){u.x=vn(s)}if(r||!r&&!n)if((hr(e)!=="body"||os(s))&&(l=yn(e)),r){const d=Ii(e,!0,n,e);u.x=d.x+e.clientLeft,u.y=d.y+e.clientTop}else s&&c();n&&!r&&s&&c();const h=s&&!r&&!n?sd(s,l):It(0),f=o.left+l.scrollLeft-u.x-h.x,a=o.top+l.scrollTop-u.y-h.y;return{x:f,y:a,width:o.width,height:o.height}}function eo(t){return wt(t).position==="static"}function Ql(t,e){if(!Nt(t)||wt(t).position==="fixed")return null;if(e)return e(t);let i=t.offsetParent;return Mt(t)===i&&(i=i.ownerDocument.body),i}function od(t,e){const i=Qe(t);if(bn(t))return i;if(!Nt(t)){let s=ni(t);for(;s&&!sr(s);){if(vt(s)&&!eo(s))return s;s=ni(s)}return i}let r=Ql(t,e);for(;r&&L0(r)&&eo(r);)r=Ql(r,e);return r&&sr(r)&&eo(r)&&!gn(r)?i:r||z0(t)||i}const J0=async function(t){const e=this.getOffsetParent||od,i=this.getDimensions,r=await i(t.floating);return{reference:X0(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function Q0(t){return wt(t).direction==="rtl"}const Vs={convertOffsetParentRelativeRectToViewportRelativeRect:q0,getDocumentElement:Mt,getClippingRect:G0,getOffsetParent:od,getElementRects:J0,getClientRects:U0,getDimensions:Y0,getScale:Zi,isElement:vt,isRTL:Q0};function ad(t,e){return t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height}function Z0(t,e){let i=null,r;const s=Mt(t);function n(){var l;clearTimeout(r),(l=i)==null||l.disconnect(),i=null}function o(l,u){l===void 0&&(l=!1),u===void 0&&(u=1),n();const c=t.getBoundingClientRect(),{left:h,top:f,width:a,height:d}=c;if(l||e(),!a||!d)return;const p=xs(f),b=xs(s.clientWidth-(h+a)),w=xs(s.clientHeight-(f+d)),g=xs(h),_={rootMargin:-p+"px "+-b+"px "+-w+"px "+-g+"px",threshold:Ye(0,ri(1,u))||1};let v=!0;function y(S){const C=S[0].intersectionRatio;if(C!==u){if(!v)return o();C?o(!1,C):r=setTimeout(()=>{o(!1,1e-7)},1e3)}C===1&&!ad(c,t.getBoundingClientRect())&&o(),v=!1}try{i=new IntersectionObserver(y,{..._,root:s.ownerDocument})}catch{i=new IntersectionObserver(y,_)}i.observe(t)}return o(!0),n}function ep(t,e,i,r){r===void 0&&(r={});const{ancestorScroll:s=!0,ancestorResize:n=!0,elementResize:o=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:u=!1}=r,c=za(t),h=s||n?[...c?Xr(c):[],...Xr(e)]:[];h.forEach(g=>{s&&g.addEventListener("scroll",i,{passive:!0}),n&&g.addEventListener("resize",i)});const f=c&&l?Z0(c,i):null;let a=-1,d=null;o&&(d=new ResizeObserver(g=>{let[x]=g;x&&x.target===c&&d&&(d.unobserve(e),cancelAnimationFrame(a),a=requestAnimationFrame(()=>{var _;(_=d)==null||_.observe(e)})),i()}),c&&!u&&d.observe(c),d.observe(e));let p,b=u?Ii(t):null;u&&w();function w(){const g=Ii(t);b&&!ad(b,g)&&i(),b=g,p=requestAnimationFrame(w)}return i(),()=>{var g;h.forEach(x=>{s&&x.removeEventListener("scroll",i),n&&x.removeEventListener("resize",i)}),f?.(),(g=d)==null||g.disconnect(),d=null,u&&cancelAnimationFrame(p)}}const tp=E0,ip=T0,rp=S0,Zl=O0,sp=k0,np=(t,e,i)=>{const r=new Map,s={platform:Vs,...i},n={...s.platform,_c:r};return _0(t,e,{...s,platform:n})};function op(t){return ap(t)}function to(t){return t.assignedSlot?t.assignedSlot:t.parentNode instanceof ShadowRoot?t.parentNode.host:t.parentNode}function ap(t){for(let e=t;e;e=to(e))if(e instanceof Element&&getComputedStyle(e).display==="none")return null;for(let e=to(t);e;e=to(e)){if(!(e instanceof Element))continue;const i=getComputedStyle(e);if(i.display!=="contents"&&(i.position!=="static"||gn(i)||e.tagName==="BODY"))return e}return null}function lp(t){return t!==null&&typeof t=="object"&&"getBoundingClientRect"in t&&("contextElement"in t?t.contextElement instanceof Element:!0)}var ae=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.active=!1,this.placement="top",this.strategy="absolute",this.distance=0,this.skidding=0,this.arrow=!1,this.arrowPlacement="anchor",this.arrowPadding=10,this.flip=!1,this.flipFallbackPlacements="",this.flipFallbackStrategy="best-fit",this.flipPadding=0,this.shift=!1,this.shiftPadding=0,this.autoSizePadding=0,this.hoverBridge=!1,this.updateHoverBridge=()=>{if(this.hoverBridge&&this.anchorEl){const t=this.anchorEl.getBoundingClientRect(),e=this.popup.getBoundingClientRect(),i=this.placement.includes("top")||this.placement.includes("bottom");let r=0,s=0,n=0,o=0,l=0,u=0,c=0,h=0;i?t.top<e.top?(r=t.left,s=t.bottom,n=t.right,o=t.bottom,l=e.left,u=e.top,c=e.right,h=e.top):(r=e.left,s=e.bottom,n=e.right,o=e.bottom,l=t.left,u=t.top,c=t.right,h=t.top):t.left<e.left?(r=t.right,s=t.top,n=e.left,o=e.top,l=t.right,u=t.bottom,c=e.left,h=e.bottom):(r=e.right,s=e.top,n=t.left,o=t.top,l=e.right,u=e.bottom,c=t.left,h=t.bottom),this.style.setProperty("--hover-bridge-top-left-x",`${r}px`),this.style.setProperty("--hover-bridge-top-left-y",`${s}px`),this.style.setProperty("--hover-bridge-top-right-x",`${n}px`),this.style.setProperty("--hover-bridge-top-right-y",`${o}px`),this.style.setProperty("--hover-bridge-bottom-left-x",`${l}px`),this.style.setProperty("--hover-bridge-bottom-left-y",`${u}px`),this.style.setProperty("--hover-bridge-bottom-right-x",`${c}px`),this.style.setProperty("--hover-bridge-bottom-right-y",`${h}px`)}}}async connectedCallback(){super.connectedCallback(),await this.updateComplete,this.start()}disconnectedCallback(){super.disconnectedCallback(),this.stop()}async updated(t){super.updated(t),t.has("active")&&(this.active?this.start():this.stop()),t.has("anchor")&&this.handleAnchorChange(),this.active&&(await this.updateComplete,this.reposition())}async handleAnchorChange(){if(await this.stop(),this.anchor&&typeof this.anchor=="string"){const t=this.getRootNode();this.anchorEl=t.getElementById(this.anchor)}else this.anchor instanceof Element||lp(this.anchor)?this.anchorEl=this.anchor:this.anchorEl=this.querySelector('[slot="anchor"]');this.anchorEl instanceof HTMLSlotElement&&(this.anchorEl=this.anchorEl.assignedElements({flatten:!0})[0]),this.anchorEl&&this.active&&this.start()}start(){!this.anchorEl||!this.active||(this.cleanup=ep(this.anchorEl,this.popup,()=>{this.reposition()}))}async stop(){return new Promise(t=>{this.cleanup?(this.cleanup(),this.cleanup=void 0,this.removeAttribute("data-current-placement"),this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height"),requestAnimationFrame(()=>t())):t()})}reposition(){if(!this.active||!this.anchorEl)return;const t=[tp({mainAxis:this.distance,crossAxis:this.skidding})];this.sync?t.push(Zl({apply:({rects:i})=>{const r=this.sync==="width"||this.sync==="both",s=this.sync==="height"||this.sync==="both";this.popup.style.width=r?`${i.reference.width}px`:"",this.popup.style.height=s?`${i.reference.height}px`:""}})):(this.popup.style.width="",this.popup.style.height=""),this.flip&&t.push(rp({boundary:this.flipBoundary,fallbackPlacements:this.flipFallbackPlacements,fallbackStrategy:this.flipFallbackStrategy==="best-fit"?"bestFit":"initialPlacement",padding:this.flipPadding})),this.shift&&t.push(ip({boundary:this.shiftBoundary,padding:this.shiftPadding})),this.autoSize?t.push(Zl({boundary:this.autoSizeBoundary,padding:this.autoSizePadding,apply:({availableWidth:i,availableHeight:r})=>{this.autoSize==="vertical"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-height",`${r}px`):this.style.removeProperty("--auto-size-available-height"),this.autoSize==="horizontal"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-width",`${i}px`):this.style.removeProperty("--auto-size-available-width")}})):(this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height")),this.arrow&&t.push(sp({element:this.arrowEl,padding:this.arrowPadding}));const e=this.strategy==="absolute"?i=>Vs.getOffsetParent(i,op):Vs.getOffsetParent;np(this.anchorEl,this.popup,{placement:this.placement,middleware:t,strategy:this.strategy,platform:es(Yt({},Vs),{getOffsetParent:e})}).then(({x:i,y:r,middlewareData:s,placement:n})=>{const o=this.localize.dir()==="rtl",l={top:"bottom",right:"left",bottom:"top",left:"right"}[n.split("-")[0]];if(this.setAttribute("data-current-placement",n),Object.assign(this.popup.style,{left:`${i}px`,top:`${r}px`}),this.arrow){const u=s.arrow.x,c=s.arrow.y;let h="",f="",a="",d="";if(this.arrowPlacement==="start"){const p=typeof u=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";h=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"",f=o?p:"",d=o?"":p}else if(this.arrowPlacement==="end"){const p=typeof u=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";f=o?"":p,d=o?p:"",a=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:""}else this.arrowPlacement==="center"?(d=typeof u=="number"?"calc(50% - var(--arrow-size-diagonal))":"",h=typeof c=="number"?"calc(50% - var(--arrow-size-diagonal))":""):(d=typeof u=="number"?`${u}px`:"",h=typeof c=="number"?`${c}px`:"");Object.assign(this.arrowEl.style,{top:h,right:f,bottom:a,left:d,[l]:"calc(var(--arrow-size-diagonal) * -1)"})}}),requestAnimationFrame(()=>this.updateHoverBridge()),this.emit("sl-reposition")}render(){return N`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${j({"popup-hover-bridge":!0,"popup-hover-bridge--visible":this.hoverBridge&&this.active})}
      ></span>

      <div
        part="popup"
        class=${j({popup:!0,"popup--active":this.active,"popup--fixed":this.strategy==="fixed","popup--has-arrow":this.arrow})}
      >
        <slot></slot>
        ${this.arrow?N`<div part="arrow" class="popup__arrow" role="presentation"></div>`:""}
      </div>
    `}};ae.styles=[H,d0];m([R(".popup")],ae.prototype,"popup",2);m([R(".popup__arrow")],ae.prototype,"arrowEl",2);m([k()],ae.prototype,"anchor",2);m([k({type:Boolean,reflect:!0})],ae.prototype,"active",2);m([k({reflect:!0})],ae.prototype,"placement",2);m([k({reflect:!0})],ae.prototype,"strategy",2);m([k({type:Number})],ae.prototype,"distance",2);m([k({type:Number})],ae.prototype,"skidding",2);m([k({type:Boolean})],ae.prototype,"arrow",2);m([k({attribute:"arrow-placement"})],ae.prototype,"arrowPlacement",2);m([k({attribute:"arrow-padding",type:Number})],ae.prototype,"arrowPadding",2);m([k({type:Boolean})],ae.prototype,"flip",2);m([k({attribute:"flip-fallback-placements",converter:{fromAttribute:t=>t.split(" ").map(e=>e.trim()).filter(e=>e!==""),toAttribute:t=>t.join(" ")}})],ae.prototype,"flipFallbackPlacements",2);m([k({attribute:"flip-fallback-strategy"})],ae.prototype,"flipFallbackStrategy",2);m([k({type:Object})],ae.prototype,"flipBoundary",2);m([k({attribute:"flip-padding",type:Number})],ae.prototype,"flipPadding",2);m([k({type:Boolean})],ae.prototype,"shift",2);m([k({type:Object})],ae.prototype,"shiftBoundary",2);m([k({attribute:"shift-padding",type:Number})],ae.prototype,"shiftPadding",2);m([k({attribute:"auto-size"})],ae.prototype,"autoSize",2);m([k()],ae.prototype,"sync",2);m([k({type:Object})],ae.prototype,"autoSizeBoundary",2);m([k({attribute:"auto-size-padding",type:Number})],ae.prototype,"autoSizePadding",2);m([k({attribute:"hover-bridge",type:Boolean})],ae.prototype,"hoverBridge",2);function Ue(t,e){return new Promise(i=>{function r(s){s.target===t&&(t.removeEventListener(e,r),i())}t.addEventListener(e,r)})}var Oe=class extends q{constructor(){super(),this.localize=new ie(this),this.content="",this.placement="top",this.disabled=!1,this.distance=8,this.open=!1,this.skidding=0,this.trigger="hover focus",this.hoist=!1,this.handleBlur=()=>{this.hasTrigger("focus")&&this.hide()},this.handleClick=()=>{this.hasTrigger("click")&&(this.open?this.hide():this.show())},this.handleFocus=()=>{this.hasTrigger("focus")&&this.show()},this.handleDocumentKeyDown=t=>{t.key==="Escape"&&(t.stopPropagation(),this.hide())},this.handleMouseOver=()=>{if(this.hasTrigger("hover")){const t=jl(getComputedStyle(this).getPropertyValue("--show-delay"));clearTimeout(this.hoverTimeout),this.hoverTimeout=window.setTimeout(()=>this.show(),t)}},this.handleMouseOut=()=>{if(this.hasTrigger("hover")){const t=jl(getComputedStyle(this).getPropertyValue("--hide-delay"));clearTimeout(this.hoverTimeout),this.hoverTimeout=window.setTimeout(()=>this.hide(),t)}},this.addEventListener("blur",this.handleBlur,!0),this.addEventListener("focus",this.handleFocus,!0),this.addEventListener("click",this.handleClick),this.addEventListener("mouseover",this.handleMouseOver),this.addEventListener("mouseout",this.handleMouseOut)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.closeWatcher)==null||t.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown)}firstUpdated(){this.body.hidden=!this.open,this.open&&(this.popup.active=!0,this.popup.reposition())}hasTrigger(t){return this.trigger.split(" ").includes(t)}async handleOpenChange(){var t,e;if(this.open){if(this.disabled)return;this.emit("sl-show"),"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>{this.hide()}):document.addEventListener("keydown",this.handleDocumentKeyDown),await Ae(this.body),this.body.hidden=!1,this.popup.active=!0;const{keyframes:i,options:r}=me(this,"tooltip.show",{dir:this.localize.dir()});await _e(this.popup.popup,i,r),this.popup.reposition(),this.emit("sl-after-show")}else{this.emit("sl-hide"),(e=this.closeWatcher)==null||e.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown),await Ae(this.body);const{keyframes:i,options:r}=me(this,"tooltip.hide",{dir:this.localize.dir()});await _e(this.popup.popup,i,r),this.popup.active=!1,this.body.hidden=!0,this.emit("sl-after-hide")}}async handleOptionsChange(){this.hasUpdated&&(await this.updateComplete,this.popup.reposition())}handleDisabledChange(){this.disabled&&this.open&&this.hide()}async show(){if(!this.open)return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,Ue(this,"sl-after-hide")}render(){return N`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${j({tooltip:!0,"tooltip--open":this.open})}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist?"fixed":"absolute"}
        flip
        shift
        arrow
        hover-bridge
      >
        ${""}
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        ${""}
        <div part="body" id="tooltip" class="tooltip__body" role="tooltip" aria-live=${this.open?"polite":"off"}>
          <slot name="content">${this.content}</slot>
        </div>
      </sl-popup>
    `}};Oe.styles=[H,c0];Oe.dependencies={"sl-popup":ae};m([R("slot:not([name])")],Oe.prototype,"defaultSlot",2);m([R(".tooltip__body")],Oe.prototype,"body",2);m([R("sl-popup")],Oe.prototype,"popup",2);m([k()],Oe.prototype,"content",2);m([k()],Oe.prototype,"placement",2);m([k({type:Boolean,reflect:!0})],Oe.prototype,"disabled",2);m([k({type:Number})],Oe.prototype,"distance",2);m([k({type:Boolean,reflect:!0})],Oe.prototype,"open",2);m([k({type:Number})],Oe.prototype,"skidding",2);m([k()],Oe.prototype,"trigger",2);m([k({type:Boolean})],Oe.prototype,"hoist",2);m([M("open",{waitUntilFirstUpdate:!0})],Oe.prototype,"handleOpenChange",1);m([M(["content","distance","hoist","placement","skidding"])],Oe.prototype,"handleOptionsChange",1);m([M("disabled")],Oe.prototype,"handleDisabledChange",1);oe("tooltip.show",{keyframes:[{opacity:0,scale:.8},{opacity:1,scale:1}],options:{duration:150,easing:"ease"}});oe("tooltip.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.8}],options:{duration:150,easing:"ease"}});Oe.define("sl-tooltip");var up=U`
  :host {
    /*
     * These are actually used by tree item, but we define them here so they can more easily be set and all tree items
     * stay consistent.
     */
    --indent-guide-color: var(--sl-color-neutral-200);
    --indent-guide-offset: 0;
    --indent-guide-style: solid;
    --indent-guide-width: 0;
    --indent-size: var(--sl-spacing-large);

    display: block;

    /*
     * Tree item indentation uses the "em" unit to increment its width on each level, so setting the font size to zero
     * here removes the indentation for all the nodes on the first level.
     */
    font-size: 0;
  }
`;function Ce(t,e,i){const r=s=>Object.is(s,-0)?0:s;return t<e?r(e):t>i?r(i):r(t)}function eu(t,e=!1){function i(n){const o=n.getChildrenItems({includeDisabled:!1});if(o.length){const l=o.every(c=>c.selected),u=o.every(c=>!c.selected&&!c.indeterminate);n.selected=l,n.indeterminate=!l&&!u}}function r(n){const o=n.parentElement;Br.isTreeItem(o)&&(i(o),r(o))}function s(n){for(const o of n.getChildrenItems())o.selected=e?n.selected||o.selected:!o.disabled&&n.selected,s(o);e&&i(n)}s(t),r(t)}var Di=class extends q{constructor(){super(),this.selection="single",this.clickTarget=null,this.localize=new ie(this),this.initTreeItem=t=>{t.selectable=this.selection==="multiple",["expand","collapse"].filter(e=>!!this.querySelector(`[slot="${e}-icon"]`)).forEach(e=>{const i=t.querySelector(`[slot="${e}-icon"]`),r=this.getExpandButtonIcon(e);r&&(i===null?t.append(r):i.hasAttribute("data-default")&&i.replaceWith(r))})},this.handleTreeChanged=t=>{for(const e of t){const i=[...e.addedNodes].filter(Br.isTreeItem),r=[...e.removedNodes].filter(Br.isTreeItem);i.forEach(this.initTreeItem),this.lastFocusedItem&&r.includes(this.lastFocusedItem)&&(this.lastFocusedItem=null)}},this.handleFocusOut=t=>{const e=t.relatedTarget;(!e||!this.contains(e))&&(this.tabIndex=0)},this.handleFocusIn=t=>{const e=t.target;t.target===this&&this.focusItem(this.lastFocusedItem||this.getAllTreeItems()[0]),Br.isTreeItem(e)&&!e.disabled&&(this.lastFocusedItem&&(this.lastFocusedItem.tabIndex=-1),this.lastFocusedItem=e,this.tabIndex=-1,e.tabIndex=0)},this.addEventListener("focusin",this.handleFocusIn),this.addEventListener("focusout",this.handleFocusOut),this.addEventListener("sl-lazy-change",this.handleSlotChange)}async connectedCallback(){super.connectedCallback(),this.setAttribute("role","tree"),this.setAttribute("tabindex","0"),await this.updateComplete,this.mutationObserver=new MutationObserver(this.handleTreeChanged),this.mutationObserver.observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.mutationObserver)==null||t.disconnect()}getExpandButtonIcon(t){const i=(t==="expand"?this.expandedIconSlot:this.collapsedIconSlot).assignedElements({flatten:!0})[0];if(i){const r=i.cloneNode(!0);return[r,...r.querySelectorAll("[id]")].forEach(s=>s.removeAttribute("id")),r.setAttribute("data-default",""),r.slot=`${t}-icon`,r}return null}selectItem(t){const e=[...this.selectedItems];if(this.selection==="multiple")t.selected=!t.selected,t.lazy&&(t.expanded=!0),eu(t);else if(this.selection==="single"||t.isLeaf){const r=this.getAllTreeItems();for(const s of r)s.selected=s===t}else this.selection==="leaf"&&(t.expanded=!t.expanded);const i=this.selectedItems;(e.length!==i.length||i.some(r=>!e.includes(r)))&&Promise.all(i.map(r=>r.updateComplete)).then(()=>{this.emit("sl-selection-change",{detail:{selection:i}})})}getAllTreeItems(){return[...this.querySelectorAll("sl-tree-item")]}focusItem(t){t?.focus()}handleKeyDown(t){if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End","Enter"," "].includes(t.key)||t.composedPath().some(s=>{var n;return["input","textarea"].includes((n=s?.tagName)==null?void 0:n.toLowerCase())}))return;const e=this.getFocusableItems(),i=this.localize.dir()==="ltr",r=this.localize.dir()==="rtl";if(e.length>0){t.preventDefault();const s=e.findIndex(u=>u.matches(":focus")),n=e[s],o=u=>{const c=e[Ce(u,0,e.length-1)];this.focusItem(c)},l=u=>{n.expanded=u};t.key==="ArrowDown"?o(s+1):t.key==="ArrowUp"?o(s-1):i&&t.key==="ArrowRight"||r&&t.key==="ArrowLeft"?!n||n.disabled||n.expanded||n.isLeaf&&!n.lazy?o(s+1):l(!0):i&&t.key==="ArrowLeft"||r&&t.key==="ArrowRight"?!n||n.disabled||n.isLeaf||!n.expanded?o(s-1):l(!1):t.key==="Home"?o(0):t.key==="End"?o(e.length-1):(t.key==="Enter"||t.key===" ")&&(n.disabled||this.selectItem(n))}}handleClick(t){const e=t.target,i=e.closest("sl-tree-item"),r=t.composedPath().some(s=>{var n;return(n=s?.classList)==null?void 0:n.contains("tree-item__expand-button")});!i||i.disabled||e!==this.clickTarget||(r?i.expanded=!i.expanded:this.selectItem(i))}handleMouseDown(t){this.clickTarget=t.target}handleSlotChange(){this.getAllTreeItems().forEach(this.initTreeItem)}async handleSelectionChange(){const t=this.selection==="multiple",e=this.getAllTreeItems();this.setAttribute("aria-multiselectable",t?"true":"false");for(const i of e)i.selectable=t;t&&(await this.updateComplete,[...this.querySelectorAll(":scope > sl-tree-item")].forEach(i=>eu(i,!0)))}get selectedItems(){const t=this.getAllTreeItems(),e=i=>i.selected;return t.filter(e)}getFocusableItems(){const t=this.getAllTreeItems(),e=new Set;return t.filter(i=>{var r;if(i.disabled)return!1;const s=(r=i.parentElement)==null?void 0:r.closest("[role=treeitem]");return s&&(!s.expanded||s.loading||e.has(s))&&e.add(i),!e.has(i)})}render(){return N`
      <div
        part="base"
        class="tree"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
        <span hidden aria-hidden="true"><slot name="expand-icon"></slot></span>
        <span hidden aria-hidden="true"><slot name="collapse-icon"></slot></span>
      </div>
    `}};Di.styles=[H,up];m([R("slot:not([name])")],Di.prototype,"defaultSlot",2);m([R("slot[name=expand-icon]")],Di.prototype,"expandedIconSlot",2);m([R("slot[name=collapse-icon]")],Di.prototype,"collapsedIconSlot",2);m([k()],Di.prototype,"selection",2);m([M("selection")],Di.prototype,"handleSelectionChange",1);Di.define("sl-tree");var cp=U`
  :host(:not(:focus-within)) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    clip: rect(0 0 0 0) !important;
    clip-path: inset(50%) !important;
    border: none !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    padding: 0 !important;
  }
`,Ra=class extends q{render(){return N` <slot></slot> `}};Ra.styles=[H,cp];Ra.define("sl-visually-hidden");var dp=U`
  :host {
    --padding: 0;

    display: none;
  }

  :host([active]) {
    display: block;
  }

  .tab-panel {
    display: block;
    padding: var(--padding);
  }
`,hp=0,as=class extends q{constructor(){super(...arguments),this.attrId=++hp,this.componentId=`sl-tab-panel-${this.attrId}`,this.name="",this.active=!1}connectedCallback(){super.connectedCallback(),this.id=this.id.length>0?this.id:this.componentId,this.setAttribute("role","tabpanel")}handleActiveChange(){this.setAttribute("aria-hidden",this.active?"false":"true")}render(){return N`
      <slot
        part="base"
        class=${j({"tab-panel":!0,"tab-panel--active":this.active})}
      ></slot>
    `}};as.styles=[H,dp];m([k({reflect:!0})],as.prototype,"name",2);m([k({type:Boolean,reflect:!0})],as.prototype,"active",2);m([M("active")],as.prototype,"handleActiveChange",1);as.define("sl-tab-panel");var fp=U`
  :host {
    display: inline-block;
  }

  .tag {
    display: flex;
    align-items: center;
    border: solid 1px;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
  }

  .tag__remove::part(base) {
    color: inherit;
    padding: 0;
  }

  /*
   * Variant modifiers
   */

  .tag--primary {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-200);
    color: var(--sl-color-primary-800);
  }

  .tag--primary:active > sl-icon-button {
    color: var(--sl-color-primary-600);
  }

  .tag--success {
    background-color: var(--sl-color-success-50);
    border-color: var(--sl-color-success-200);
    color: var(--sl-color-success-800);
  }

  .tag--success:active > sl-icon-button {
    color: var(--sl-color-success-600);
  }

  .tag--neutral {
    background-color: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-800);
  }

  .tag--neutral:active > sl-icon-button {
    color: var(--sl-color-neutral-600);
  }

  .tag--warning {
    background-color: var(--sl-color-warning-50);
    border-color: var(--sl-color-warning-200);
    color: var(--sl-color-warning-800);
  }

  .tag--warning:active > sl-icon-button {
    color: var(--sl-color-warning-600);
  }

  .tag--danger {
    background-color: var(--sl-color-danger-50);
    border-color: var(--sl-color-danger-200);
    color: var(--sl-color-danger-800);
  }

  .tag--danger:active > sl-icon-button {
    color: var(--sl-color-danger-600);
  }

  /*
   * Size modifiers
   */

  .tag--small {
    font-size: var(--sl-button-font-size-small);
    height: calc(var(--sl-input-height-small) * 0.8);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
    padding: 0 var(--sl-spacing-x-small);
  }

  .tag--medium {
    font-size: var(--sl-button-font-size-medium);
    height: calc(var(--sl-input-height-medium) * 0.8);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
    padding: 0 var(--sl-spacing-small);
  }

  .tag--large {
    font-size: var(--sl-button-font-size-large);
    height: calc(var(--sl-input-height-large) * 0.8);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
    padding: 0 var(--sl-spacing-medium);
  }

  .tag__remove {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  /*
   * Pill modifier
   */

  .tag--pill {
    border-radius: var(--sl-border-radius-pill);
  }
`,pp=U`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ld=Symbol.for(""),mp=t=>{if(t?.r===ld)return t?._$litStatic$},sn=(t,...e)=>({_$litStatic$:e.reduce(((i,r,s)=>i+(n=>{if(n._$litStatic$!==void 0)return n._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${n}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(r)+t[s+1]),t[0]),r:ld}),tu=new Map,bp=t=>(e,...i)=>{const r=i.length;let s,n;const o=[],l=[];let u,c=0,h=!1;for(;c<r;){for(u=e[c];c<r&&(n=i[c],(s=mp(n))!==void 0);)u+=s+e[++c],h=!0;c!==r&&l.push(n),o.push(u),c++}if(c===r&&o.push(e[r]),h){const f=o.join("$$lit$$");(e=tu.get(f))===void 0&&(o.raw=o,tu.set(f,e=o)),i=l}return t(e,...i)},Fr=bp(N);var Te=class extends q{constructor(){super(...arguments),this.hasFocus=!1,this.label="",this.disabled=!1}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(t){this.disabled&&(t.preventDefault(),t.stopPropagation())}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}render(){const t=!!this.href,e=t?sn`a`:sn`button`;return Fr`
      <${e}
        part="base"
        class=${j({"icon-button":!0,"icon-button--disabled":!t&&this.disabled,"icon-button--focused":this.hasFocus})}
        ?disabled=${F(t?void 0:this.disabled)}
        type=${F(t?void 0:"button")}
        href=${F(t?this.href:void 0)}
        target=${F(t?this.target:void 0)}
        download=${F(t?this.download:void 0)}
        rel=${F(t&&this.target?"noreferrer noopener":void 0)}
        role=${F(t?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        aria-label="${this.label}"
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${F(this.name)}
          library=${F(this.library)}
          src=${F(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `}};Te.styles=[H,pp];Te.dependencies={"sl-icon":fe};m([R(".icon-button")],Te.prototype,"button",2);m([V()],Te.prototype,"hasFocus",2);m([k()],Te.prototype,"name",2);m([k()],Te.prototype,"library",2);m([k()],Te.prototype,"src",2);m([k()],Te.prototype,"href",2);m([k()],Te.prototype,"target",2);m([k()],Te.prototype,"download",2);m([k()],Te.prototype,"label",2);m([k({type:Boolean,reflect:!0})],Te.prototype,"disabled",2);var li=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.variant="neutral",this.size="medium",this.pill=!1,this.removable=!1}handleRemoveClick(){this.emit("sl-remove")}render(){return N`
      <span
        part="base"
        class=${j({tag:!0,"tag--primary":this.variant==="primary","tag--success":this.variant==="success","tag--neutral":this.variant==="neutral","tag--warning":this.variant==="warning","tag--danger":this.variant==="danger","tag--text":this.variant==="text","tag--small":this.size==="small","tag--medium":this.size==="medium","tag--large":this.size==="large","tag--pill":this.pill,"tag--removable":this.removable})}
      >
        <slot part="content" class="tag__content"></slot>

        ${this.removable?N`
              <sl-icon-button
                part="remove-button"
                exportparts="base:remove-button__base"
                name="x-lg"
                library="system"
                label=${this.localize.term("remove")}
                class="tag__remove"
                @click=${this.handleRemoveClick}
                tabindex="-1"
              ></sl-icon-button>
            `:""}
      </span>
    `}};li.styles=[H,fp];li.dependencies={"sl-icon-button":Te};m([k({reflect:!0})],li.prototype,"variant",2);m([k({reflect:!0})],li.prototype,"size",2);m([k({type:Boolean,reflect:!0})],li.prototype,"pill",2);m([k({type:Boolean})],li.prototype,"removable",2);li.define("sl-tag");var gp=U`
  :host {
    display: block;
  }

  .textarea {
    display: grid;
    align-items: center;
    position: relative;
    width: 100%;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
    cursor: text;
  }

  /* Standard textareas */
  .textarea--standard {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .textarea--standard:hover:not(.textarea--disabled) {
    background-color: var(--sl-input-background-color-hover);
    border-color: var(--sl-input-border-color-hover);
  }
  .textarea--standard:hover:not(.textarea--disabled) .textarea__control {
    color: var(--sl-input-color-hover);
  }

  .textarea--standard.textarea--focused:not(.textarea--disabled) {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    color: var(--sl-input-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  .textarea--standard.textarea--focused:not(.textarea--disabled) .textarea__control {
    color: var(--sl-input-color-focus);
  }

  .textarea--standard.textarea--disabled {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .textarea__control,
  .textarea__size-adjuster {
    grid-area: 1 / 1 / 2 / 2;
  }

  .textarea__size-adjuster {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
  }

  .textarea--standard.textarea--disabled .textarea__control {
    color: var(--sl-input-color-disabled);
  }

  .textarea--standard.textarea--disabled .textarea__control::placeholder {
    color: var(--sl-input-placeholder-color-disabled);
  }

  /* Filled textareas */
  .textarea--filled {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .textarea--filled:hover:not(.textarea--disabled) {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .textarea--filled.textarea--focused:not(.textarea--disabled) {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .textarea--filled.textarea--disabled {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .textarea__control {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: 1.4;
    color: var(--sl-input-color);
    border: none;
    background: none;
    box-shadow: none;
    cursor: inherit;
    -webkit-appearance: none;
  }

  .textarea__control::-webkit-search-decoration,
  .textarea__control::-webkit-search-cancel-button,
  .textarea__control::-webkit-search-results-button,
  .textarea__control::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  .textarea__control::placeholder {
    color: var(--sl-input-placeholder-color);
    user-select: none;
    -webkit-user-select: none;
  }

  .textarea__control:focus {
    outline: none;
  }

  /*
   * Size modifiers
   */

  .textarea--small {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
  }

  .textarea--small .textarea__control {
    padding: 0.5em var(--sl-input-spacing-small);
  }

  .textarea--medium {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .textarea--medium .textarea__control {
    padding: 0.5em var(--sl-input-spacing-medium);
  }

  .textarea--large {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
  }

  .textarea--large .textarea__control {
    padding: 0.5em var(--sl-input-spacing-large);
  }

  /*
   * Resize types
   */

  .textarea--resize-none .textarea__control {
    resize: none;
  }

  .textarea--resize-vertical .textarea__control {
    resize: vertical;
  }

  .textarea--resize-auto .textarea__control {
    height: auto;
    resize: none;
    overflow-y: hidden;
  }
`,re=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new Ve(this,"help-text","label"),this.hasFocus=!1,this.title="",this.name="",this.value="",this.size="medium",this.filled=!1,this.label="",this.helpText="",this.placeholder="",this.rows=4,this.resize="vertical",this.disabled=!1,this.readonly=!1,this.form="",this.required=!1,this.spellcheck=!0,this.defaultValue=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>this.setTextareaHeight()),this.updateComplete.then(()=>{this.setTextareaHeight(),this.resizeObserver.observe(this.input)})}firstUpdated(){this.formControlController.updateValidity()}disconnectedCallback(){var t;super.disconnectedCallback(),this.input&&((t=this.resizeObserver)==null||t.unobserve(this.input))}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleChange(){this.value=this.input.value,this.setTextareaHeight(),this.emit("sl-change")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleInput(){this.value=this.input.value,this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}setTextareaHeight(){this.resize==="auto"?(this.sizeAdjuster.style.height=`${this.input.clientHeight}px`,this.input.style.height="auto",this.input.style.height=`${this.input.scrollHeight}px`):this.input.style.height=""}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleRowsChange(){this.setTextareaHeight()}async handleValueChange(){await this.updateComplete,this.formControlController.updateValidity(),this.setTextareaHeight()}focus(t){this.input.focus(t)}blur(){this.input.blur()}select(){this.input.select()}scrollPosition(t){if(t){typeof t.top=="number"&&(this.input.scrollTop=t.top),typeof t.left=="number"&&(this.input.scrollLeft=t.left);return}return{top:this.input.scrollTop,left:this.input.scrollTop}}setSelectionRange(t,e,i="none"){this.input.setSelectionRange(t,e,i)}setRangeText(t,e,i,r="preserve"){const s=e??this.input.selectionStart,n=i??this.input.selectionEnd;this.input.setRangeText(t,s,n,r),this.value!==this.input.value&&(this.value=this.input.value,this.setTextareaHeight())}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),i=this.label?!0:!!t,r=this.helpText?!0:!!e;return N`
      <div
        part="form-control"
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":i,"form-control--has-help-text":r})}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${i?"false":"true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${j({textarea:!0,"textarea--small":this.size==="small","textarea--medium":this.size==="medium","textarea--large":this.size==="large","textarea--standard":!this.filled,"textarea--filled":this.filled,"textarea--disabled":this.disabled,"textarea--focused":this.hasFocus,"textarea--empty":!this.value,"textarea--resize-none":this.resize==="none","textarea--resize-vertical":this.resize==="vertical","textarea--resize-auto":this.resize==="auto"})}
          >
            <textarea
              part="textarea"
              id="input"
              class="textarea__control"
              title=${this.title}
              name=${F(this.name)}
              .value=${$i(this.value)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${F(this.placeholder)}
              rows=${F(this.rows)}
              minlength=${F(this.minlength)}
              maxlength=${F(this.maxlength)}
              autocapitalize=${F(this.autocapitalize)}
              autocorrect=${F(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${F(this.spellcheck)}
              enterkeyhint=${F(this.enterkeyhint)}
              inputmode=${F(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            ></textarea>
            <!-- This "adjuster" exists to prevent layout shifting. https://github.com/shoelace-style/shoelace/issues/2180 -->
            <div part="textarea-adjuster" class="textarea__size-adjuster" ?hidden=${this.resize!=="auto"}></div>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};re.styles=[H,Ni,gp];m([R(".textarea__control")],re.prototype,"input",2);m([R(".textarea__size-adjuster")],re.prototype,"sizeAdjuster",2);m([V()],re.prototype,"hasFocus",2);m([k()],re.prototype,"title",2);m([k()],re.prototype,"name",2);m([k()],re.prototype,"value",2);m([k({reflect:!0})],re.prototype,"size",2);m([k({type:Boolean,reflect:!0})],re.prototype,"filled",2);m([k()],re.prototype,"label",2);m([k({attribute:"help-text"})],re.prototype,"helpText",2);m([k()],re.prototype,"placeholder",2);m([k({type:Number})],re.prototype,"rows",2);m([k()],re.prototype,"resize",2);m([k({type:Boolean,reflect:!0})],re.prototype,"disabled",2);m([k({type:Boolean,reflect:!0})],re.prototype,"readonly",2);m([k({reflect:!0})],re.prototype,"form",2);m([k({type:Boolean,reflect:!0})],re.prototype,"required",2);m([k({type:Number})],re.prototype,"minlength",2);m([k({type:Number})],re.prototype,"maxlength",2);m([k()],re.prototype,"autocapitalize",2);m([k()],re.prototype,"autocorrect",2);m([k()],re.prototype,"autocomplete",2);m([k({type:Boolean})],re.prototype,"autofocus",2);m([k()],re.prototype,"enterkeyhint",2);m([k({type:Boolean,converter:{fromAttribute:t=>!(!t||t==="false"),toAttribute:t=>t?"true":"false"}})],re.prototype,"spellcheck",2);m([k()],re.prototype,"inputmode",2);m([ur()],re.prototype,"defaultValue",2);m([M("disabled",{waitUntilFirstUpdate:!0})],re.prototype,"handleDisabledChange",1);m([M("rows",{waitUntilFirstUpdate:!0})],re.prototype,"handleRowsChange",1);m([M("value",{waitUntilFirstUpdate:!0})],re.prototype,"handleValueChange",1);re.define("sl-textarea");var yp=U`
  :host {
    display: inline-block;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    border-radius: var(--sl-border-radius-medium);
    color: var(--sl-color-neutral-600);
    padding: var(--sl-spacing-medium) var(--sl-spacing-large);
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
    transition:
      var(--transition-speed) box-shadow,
      var(--transition-speed) color;
  }

  .tab:hover:not(.tab--disabled) {
    color: var(--sl-color-primary-600);
  }

  :host(:focus) {
    outline: transparent;
  }

  :host(:focus-visible) {
    color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: calc(-1 * var(--sl-focus-ring-width) - var(--sl-focus-ring-offset));
  }

  .tab.tab--active:not(.tab--disabled) {
    color: var(--sl-color-primary-600);
  }

  .tab.tab--closable {
    padding-inline-end: var(--sl-spacing-small);
  }

  .tab.tab--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab__close-button {
    font-size: var(--sl-font-size-small);
    margin-inline-start: var(--sl-spacing-small);
  }

  .tab__close-button::part(base) {
    padding: var(--sl-spacing-3x-small);
  }

  @media (forced-colors: active) {
    .tab.tab--active:not(.tab--disabled) {
      outline: solid 1px transparent;
      outline-offset: -3px;
    }
  }
`,vp=0,xt=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.attrId=++vp,this.componentId=`sl-tab-${this.attrId}`,this.panel="",this.active=!1,this.closable=!1,this.disabled=!1,this.tabIndex=0}connectedCallback(){super.connectedCallback(),this.setAttribute("role","tab")}handleCloseClick(t){t.stopPropagation(),this.emit("sl-close")}handleActiveChange(){this.setAttribute("aria-selected",this.active?"true":"false")}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false"),this.disabled&&!this.active?this.tabIndex=-1:this.tabIndex=0}render(){return this.id=this.id.length>0?this.id:this.componentId,N`
      <div
        part="base"
        class=${j({tab:!0,"tab--active":this.active,"tab--closable":this.closable,"tab--disabled":this.disabled})}
      >
        <slot></slot>
        ${this.closable?N`
              <sl-icon-button
                part="close-button"
                exportparts="base:close-button__base"
                name="x-lg"
                library="system"
                label=${this.localize.term("close")}
                class="tab__close-button"
                @click=${this.handleCloseClick}
                tabindex="-1"
              ></sl-icon-button>
            `:""}
      </div>
    `}};xt.styles=[H,yp];xt.dependencies={"sl-icon-button":Te};m([R(".tab")],xt.prototype,"tab",2);m([k({reflect:!0})],xt.prototype,"panel",2);m([k({type:Boolean,reflect:!0})],xt.prototype,"active",2);m([k({type:Boolean,reflect:!0})],xt.prototype,"closable",2);m([k({type:Boolean,reflect:!0})],xt.prototype,"disabled",2);m([k({type:Number,reflect:!0})],xt.prototype,"tabIndex",2);m([M("active")],xt.prototype,"handleActiveChange",1);m([M("disabled")],xt.prototype,"handleDisabledChange",1);xt.define("sl-tab");var wp=U`
  :host {
    --indicator-color: var(--sl-color-primary-600);
    --track-color: var(--sl-color-neutral-200);
    --track-width: 2px;

    display: block;
  }

  .tab-group {
    display: flex;
    border-radius: 0;
  }

  .tab-group__tabs {
    display: flex;
    position: relative;
  }

  .tab-group__indicator {
    position: absolute;
    transition:
      var(--sl-transition-fast) translate ease,
      var(--sl-transition-fast) width ease;
  }

  .tab-group--has-scroll-controls .tab-group__nav-container {
    position: relative;
    padding: 0 var(--sl-spacing-x-large);
  }

  .tab-group--has-scroll-controls .tab-group__scroll-button--start--hidden,
  .tab-group--has-scroll-controls .tab-group__scroll-button--end--hidden {
    visibility: hidden;
  }

  .tab-group__body {
    display: block;
    overflow: auto;
  }

  .tab-group__scroll-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--sl-spacing-x-large);
  }

  .tab-group__scroll-button--start {
    left: 0;
  }

  .tab-group__scroll-button--end {
    right: 0;
  }

  .tab-group--rtl .tab-group__scroll-button--start {
    left: auto;
    right: 0;
  }

  .tab-group--rtl .tab-group__scroll-button--end {
    left: 0;
    right: auto;
  }

  /*
   * Top
   */

  .tab-group--top {
    flex-direction: column;
  }

  .tab-group--top .tab-group__nav-container {
    order: 1;
  }

  .tab-group--top .tab-group__nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group--top .tab-group__nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group--top .tab-group__tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-bottom: solid var(--track-width) var(--track-color);
  }

  .tab-group--top .tab-group__indicator {
    bottom: calc(-1 * var(--track-width));
    border-bottom: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--top .tab-group__body {
    order: 2;
  }

  .tab-group--top ::slotted(sl-tab-panel) {
    --padding: var(--sl-spacing-medium) 0;
  }

  /*
   * Bottom
   */

  .tab-group--bottom {
    flex-direction: column;
  }

  .tab-group--bottom .tab-group__nav-container {
    order: 2;
  }

  .tab-group--bottom .tab-group__nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group--bottom .tab-group__nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group--bottom .tab-group__tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-top: solid var(--track-width) var(--track-color);
  }

  .tab-group--bottom .tab-group__indicator {
    top: calc(-1 * var(--track-width));
    border-top: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--bottom .tab-group__body {
    order: 1;
  }

  .tab-group--bottom ::slotted(sl-tab-panel) {
    --padding: var(--sl-spacing-medium) 0;
  }

  /*
   * Start
   */

  .tab-group--start {
    flex-direction: row;
  }

  .tab-group--start .tab-group__nav-container {
    order: 1;
  }

  .tab-group--start .tab-group__tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-inline-end: solid var(--track-width) var(--track-color);
  }

  .tab-group--start .tab-group__indicator {
    right: calc(-1 * var(--track-width));
    border-right: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--start.tab-group--rtl .tab-group__indicator {
    right: auto;
    left: calc(-1 * var(--track-width));
  }

  .tab-group--start .tab-group__body {
    flex: 1 1 auto;
    order: 2;
  }

  .tab-group--start ::slotted(sl-tab-panel) {
    --padding: 0 var(--sl-spacing-medium);
  }

  /*
   * End
   */

  .tab-group--end {
    flex-direction: row;
  }

  .tab-group--end .tab-group__nav-container {
    order: 2;
  }

  .tab-group--end .tab-group__tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-left: solid var(--track-width) var(--track-color);
  }

  .tab-group--end .tab-group__indicator {
    left: calc(-1 * var(--track-width));
    border-inline-start: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--end.tab-group--rtl .tab-group__indicator {
    right: calc(-1 * var(--track-width));
    left: auto;
  }

  .tab-group--end .tab-group__body {
    flex: 1 1 auto;
    order: 1;
  }

  .tab-group--end ::slotted(sl-tab-panel) {
    --padding: 0 var(--sl-spacing-medium);
  }
`,xp=U`
  :host {
    display: contents;
  }
`,ls=class extends q{constructor(){super(...arguments),this.observedElements=[],this.disabled=!1}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(t=>{this.emit("sl-resize",{detail:{entries:t}})}),this.disabled||this.startObserver()}disconnectedCallback(){super.disconnectedCallback(),this.stopObserver()}handleSlotChange(){this.disabled||this.startObserver()}startObserver(){const t=this.shadowRoot.querySelector("slot");if(t!==null){const e=t.assignedElements({flatten:!0});this.observedElements.forEach(i=>this.resizeObserver.unobserve(i)),this.observedElements=[],e.forEach(i=>{this.resizeObserver.observe(i),this.observedElements.push(i)})}}stopObserver(){this.resizeObserver.disconnect()}handleDisabledChange(){this.disabled?this.stopObserver():this.startObserver()}render(){return N` <slot @slotchange=${this.handleSlotChange}></slot> `}};ls.styles=[H,xp];m([k({type:Boolean,reflect:!0})],ls.prototype,"disabled",2);m([M("disabled",{waitUntilFirstUpdate:!0})],ls.prototype,"handleDisabledChange",1);function _p(t,e){return{top:Math.round(t.getBoundingClientRect().top-e.getBoundingClientRect().top),left:Math.round(t.getBoundingClientRect().left-e.getBoundingClientRect().left)}}var ca=new Set;function kp(){const t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}function Sp(){const t=Number(getComputedStyle(document.body).paddingRight.replace(/px/,""));return isNaN(t)||!t?0:t}function qr(t){if(ca.add(t),!document.documentElement.classList.contains("sl-scroll-lock")){const e=kp()+Sp();let i=getComputedStyle(document.documentElement).scrollbarGutter;(!i||i==="auto")&&(i="stable"),e<2&&(i=""),document.documentElement.style.setProperty("--sl-scroll-lock-gutter",i),document.documentElement.classList.add("sl-scroll-lock"),document.documentElement.style.setProperty("--sl-scroll-lock-size",`${e}px`)}}function Ur(t){ca.delete(t),ca.size===0&&(document.documentElement.classList.remove("sl-scroll-lock"),document.documentElement.style.removeProperty("--sl-scroll-lock-size"))}function da(t,e,i="vertical",r="smooth"){const s=_p(t,e),n=s.top+e.scrollTop,o=s.left+e.scrollLeft,l=e.scrollLeft,u=e.scrollLeft+e.offsetWidth,c=e.scrollTop,h=e.scrollTop+e.offsetHeight;(i==="horizontal"||i==="both")&&(o<l?e.scrollTo({left:o,behavior:r}):o+t.clientWidth>u&&e.scrollTo({left:o-e.offsetWidth+t.clientWidth,behavior:r})),(i==="vertical"||i==="both")&&(n<c?e.scrollTo({top:n,behavior:r}):n+t.clientHeight>h&&e.scrollTo({top:n-e.offsetHeight+t.clientHeight,behavior:r}))}var De=class extends q{constructor(){super(...arguments),this.tabs=[],this.focusableTabs=[],this.panels=[],this.localize=new ie(this),this.hasScrollControls=!1,this.shouldHideScrollStartButton=!1,this.shouldHideScrollEndButton=!1,this.placement="top",this.activation="auto",this.noScrollControls=!1,this.fixedScrollControls=!1,this.scrollOffset=1}connectedCallback(){const t=Promise.all([customElements.whenDefined("sl-tab"),customElements.whenDefined("sl-tab-panel")]);super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>{this.repositionIndicator(),this.updateScrollControls()}),this.mutationObserver=new MutationObserver(e=>{const i=e.filter(({target:r})=>{if(r===this)return!0;if(r.closest("sl-tab-group")!==this)return!1;const s=r.tagName.toLowerCase();return s==="sl-tab"||s==="sl-tab-panel"});if(i.length!==0){if(i.some(r=>!["aria-labelledby","aria-controls"].includes(r.attributeName))&&setTimeout(()=>this.setAriaLabels()),i.some(r=>r.attributeName==="disabled"))this.syncTabsAndPanels();else if(i.some(r=>r.attributeName==="active")){const s=i.filter(n=>n.attributeName==="active"&&n.target.tagName.toLowerCase()==="sl-tab").map(n=>n.target).find(n=>n.active);s&&this.setActiveTab(s)}}}),this.updateComplete.then(()=>{this.syncTabsAndPanels(),this.mutationObserver.observe(this,{attributes:!0,attributeFilter:["active","disabled","name","panel"],childList:!0,subtree:!0}),this.resizeObserver.observe(this.nav),t.then(()=>{new IntersectionObserver((i,r)=>{var s;i[0].intersectionRatio>0&&(this.setAriaLabels(),this.setActiveTab((s=this.getActiveTab())!=null?s:this.tabs[0],{emitEvents:!1}),r.unobserve(i[0].target))}).observe(this.tabGroup)})})}disconnectedCallback(){var t,e;super.disconnectedCallback(),(t=this.mutationObserver)==null||t.disconnect(),this.nav&&((e=this.resizeObserver)==null||e.unobserve(this.nav))}getAllTabs(){return this.shadowRoot.querySelector('slot[name="nav"]').assignedElements()}getAllPanels(){return[...this.body.assignedElements()].filter(t=>t.tagName.toLowerCase()==="sl-tab-panel")}getActiveTab(){return this.tabs.find(t=>t.active)}handleClick(t){const i=t.target.closest("sl-tab");i?.closest("sl-tab-group")===this&&i!==null&&this.setActiveTab(i,{scrollBehavior:"smooth"})}handleKeyDown(t){const i=t.target.closest("sl-tab");if(i?.closest("sl-tab-group")===this&&(["Enter"," "].includes(t.key)&&i!==null&&(this.setActiveTab(i,{scrollBehavior:"smooth"}),t.preventDefault()),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(t.key))){const s=this.tabs.find(l=>l.matches(":focus")),n=this.localize.dir()==="rtl";let o=null;if(s?.tagName.toLowerCase()==="sl-tab"){if(t.key==="Home")o=this.focusableTabs[0];else if(t.key==="End")o=this.focusableTabs[this.focusableTabs.length-1];else if(["top","bottom"].includes(this.placement)&&t.key===(n?"ArrowRight":"ArrowLeft")||["start","end"].includes(this.placement)&&t.key==="ArrowUp"){const l=this.tabs.findIndex(u=>u===s);o=this.findNextFocusableTab(l,"backward")}else if(["top","bottom"].includes(this.placement)&&t.key===(n?"ArrowLeft":"ArrowRight")||["start","end"].includes(this.placement)&&t.key==="ArrowDown"){const l=this.tabs.findIndex(u=>u===s);o=this.findNextFocusableTab(l,"forward")}if(!o)return;o.tabIndex=0,o.focus({preventScroll:!0}),this.activation==="auto"?this.setActiveTab(o,{scrollBehavior:"smooth"}):this.tabs.forEach(l=>{l.tabIndex=l===o?0:-1}),["top","bottom"].includes(this.placement)&&da(o,this.nav,"horizontal"),t.preventDefault()}}}handleScrollToStart(){this.nav.scroll({left:this.localize.dir()==="rtl"?this.nav.scrollLeft+this.nav.clientWidth:this.nav.scrollLeft-this.nav.clientWidth,behavior:"smooth"})}handleScrollToEnd(){this.nav.scroll({left:this.localize.dir()==="rtl"?this.nav.scrollLeft-this.nav.clientWidth:this.nav.scrollLeft+this.nav.clientWidth,behavior:"smooth"})}setActiveTab(t,e){if(e=Yt({emitEvents:!0,scrollBehavior:"auto"},e),t!==this.activeTab&&!t.disabled){const i=this.activeTab;this.activeTab=t,this.tabs.forEach(r=>{r.active=r===this.activeTab,r.tabIndex=r===this.activeTab?0:-1}),this.panels.forEach(r=>{var s;return r.active=r.name===((s=this.activeTab)==null?void 0:s.panel)}),this.syncIndicator(),["top","bottom"].includes(this.placement)&&da(this.activeTab,this.nav,"horizontal",e.scrollBehavior),e.emitEvents&&(i&&this.emit("sl-tab-hide",{detail:{name:i.panel}}),this.emit("sl-tab-show",{detail:{name:this.activeTab.panel}}))}}setAriaLabels(){this.tabs.forEach(t=>{const e=this.panels.find(i=>i.name===t.panel);e&&(t.setAttribute("aria-controls",e.getAttribute("id")),e.setAttribute("aria-labelledby",t.getAttribute("id")))})}repositionIndicator(){const t=this.getActiveTab();if(!t)return;const e=t.clientWidth,i=t.clientHeight,r=this.localize.dir()==="rtl",s=this.getAllTabs(),o=s.slice(0,s.indexOf(t)).reduce((l,u)=>({left:l.left+u.clientWidth,top:l.top+u.clientHeight}),{left:0,top:0});switch(this.placement){case"top":case"bottom":this.indicator.style.width=`${e}px`,this.indicator.style.height="auto",this.indicator.style.translate=r?`${-1*o.left}px`:`${o.left}px`;break;case"start":case"end":this.indicator.style.width="auto",this.indicator.style.height=`${i}px`,this.indicator.style.translate=`0 ${o.top}px`;break}}syncTabsAndPanels(){this.tabs=this.getAllTabs(),this.focusableTabs=this.tabs.filter(t=>!t.disabled),this.panels=this.getAllPanels(),this.syncIndicator(),this.updateComplete.then(()=>this.updateScrollControls())}findNextFocusableTab(t,e){let i=null;const r=e==="forward"?1:-1;let s=t+r;for(;t<this.tabs.length;){if(i=this.tabs[s]||null,i===null){e==="forward"?i=this.focusableTabs[0]:i=this.focusableTabs[this.focusableTabs.length-1];break}if(!i.disabled)break;s+=r}return i}updateScrollButtons(){this.hasScrollControls&&!this.fixedScrollControls&&(this.shouldHideScrollStartButton=this.scrollFromStart()<=this.scrollOffset,this.shouldHideScrollEndButton=this.isScrolledToEnd())}isScrolledToEnd(){return this.scrollFromStart()+this.nav.clientWidth>=this.nav.scrollWidth-this.scrollOffset}scrollFromStart(){return this.localize.dir()==="rtl"?-this.nav.scrollLeft:this.nav.scrollLeft}updateScrollControls(){this.noScrollControls?this.hasScrollControls=!1:this.hasScrollControls=["top","bottom"].includes(this.placement)&&this.nav.scrollWidth>this.nav.clientWidth+1,this.updateScrollButtons()}syncIndicator(){this.getActiveTab()?(this.indicator.style.display="block",this.repositionIndicator()):this.indicator.style.display="none"}show(t){const e=this.tabs.find(i=>i.panel===t);e&&this.setActiveTab(e,{scrollBehavior:"smooth"})}render(){const t=this.localize.dir()==="rtl";return N`
      <div
        part="base"
        class=${j({"tab-group":!0,"tab-group--top":this.placement==="top","tab-group--bottom":this.placement==="bottom","tab-group--start":this.placement==="start","tab-group--end":this.placement==="end","tab-group--rtl":this.localize.dir()==="rtl","tab-group--has-scroll-controls":this.hasScrollControls})}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <div class="tab-group__nav-container" part="nav">
          ${this.hasScrollControls?N`
                <sl-icon-button
                  part="scroll-button scroll-button--start"
                  exportparts="base:scroll-button__base"
                  class=${j({"tab-group__scroll-button":!0,"tab-group__scroll-button--start":!0,"tab-group__scroll-button--start--hidden":this.shouldHideScrollStartButton})}
                  name=${t?"chevron-right":"chevron-left"}
                  library="system"
                  tabindex="-1"
                  aria-hidden="true"
                  label=${this.localize.term("scrollToStart")}
                  @click=${this.handleScrollToStart}
                ></sl-icon-button>
              `:""}

          <div class="tab-group__nav" @scrollend=${this.updateScrollButtons}>
            <div part="tabs" class="tab-group__tabs" role="tablist">
              <div part="active-tab-indicator" class="tab-group__indicator"></div>
              <sl-resize-observer @sl-resize=${this.syncIndicator}>
                <slot name="nav" @slotchange=${this.syncTabsAndPanels}></slot>
              </sl-resize-observer>
            </div>
          </div>

          ${this.hasScrollControls?N`
                <sl-icon-button
                  part="scroll-button scroll-button--end"
                  exportparts="base:scroll-button__base"
                  class=${j({"tab-group__scroll-button":!0,"tab-group__scroll-button--end":!0,"tab-group__scroll-button--end--hidden":this.shouldHideScrollEndButton})}
                  name=${t?"chevron-left":"chevron-right"}
                  library="system"
                  tabindex="-1"
                  aria-hidden="true"
                  label=${this.localize.term("scrollToEnd")}
                  @click=${this.handleScrollToEnd}
                ></sl-icon-button>
              `:""}
        </div>

        <slot part="body" class="tab-group__body" @slotchange=${this.syncTabsAndPanels}></slot>
      </div>
    `}};De.styles=[H,wp];De.dependencies={"sl-icon-button":Te,"sl-resize-observer":ls};m([R(".tab-group")],De.prototype,"tabGroup",2);m([R(".tab-group__body")],De.prototype,"body",2);m([R(".tab-group__nav")],De.prototype,"nav",2);m([R(".tab-group__indicator")],De.prototype,"indicator",2);m([V()],De.prototype,"hasScrollControls",2);m([V()],De.prototype,"shouldHideScrollStartButton",2);m([V()],De.prototype,"shouldHideScrollEndButton",2);m([k()],De.prototype,"placement",2);m([k()],De.prototype,"activation",2);m([k({attribute:"no-scroll-controls",type:Boolean})],De.prototype,"noScrollControls",2);m([k({attribute:"fixed-scroll-controls",type:Boolean})],De.prototype,"fixedScrollControls",2);m([is({passive:!0})],De.prototype,"updateScrollButtons",1);m([M("noScrollControls",{waitUntilFirstUpdate:!0})],De.prototype,"updateScrollControls",1);m([M("placement",{waitUntilFirstUpdate:!0})],De.prototype,"syncIndicator",1);De.define("sl-tab-group");var Cp=U`
  :host {
    --border-radius: var(--sl-border-radius-pill);
    --color: var(--sl-color-neutral-200);
    --sheen-color: var(--sl-color-neutral-300);

    display: block;
    position: relative;
  }

  .skeleton {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 1rem;
  }

  .skeleton__indicator {
    flex: 1 1 auto;
    background: var(--color);
    border-radius: var(--border-radius);
  }

  .skeleton--sheen .skeleton__indicator {
    background: linear-gradient(270deg, var(--sheen-color), var(--color), var(--color), var(--sheen-color));
    background-size: 400% 100%;
    animation: sheen 8s ease-in-out infinite;
  }

  .skeleton--pulse .skeleton__indicator {
    animation: pulse 2s ease-in-out 0.5s infinite;
  }

  /* Forced colors mode */
  @media (forced-colors: active) {
    :host {
      --color: GrayText;
    }
  }

  @keyframes sheen {
    0% {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`,Ba=class extends q{constructor(){super(...arguments),this.effect="none"}render(){return N`
      <div
        part="base"
        class=${j({skeleton:!0,"skeleton--pulse":this.effect==="pulse","skeleton--sheen":this.effect==="sheen"})}
      >
        <div part="indicator" class="skeleton__indicator"></div>
      </div>
    `}};Ba.styles=[H,Cp];m([k()],Ba.prototype,"effect",2);Ba.define("sl-skeleton");var Ap=U`
  :host {
    --divider-width: 4px;
    --divider-hit-area: 12px;
    --min: 0%;
    --max: 100%;

    display: grid;
  }

  .start,
  .end {
    overflow: hidden;
  }

  .divider {
    flex: 0 0 var(--divider-width);
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    background-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-900);
    z-index: 1;
  }

  .divider:focus {
    outline: none;
  }

  :host(:not([disabled])) .divider:focus-visible {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  :host([disabled]) .divider {
    cursor: not-allowed;
  }

  /* Horizontal */
  :host(:not([vertical], [disabled])) .divider {
    cursor: col-resize;
  }

  :host(:not([vertical])) .divider::after {
    display: flex;
    content: '';
    position: absolute;
    height: 100%;
    left: calc(var(--divider-hit-area) / -2 + var(--divider-width) / 2);
    width: var(--divider-hit-area);
  }

  /* Vertical */
  :host([vertical]) {
    flex-direction: column;
  }

  :host([vertical]:not([disabled])) .divider {
    cursor: row-resize;
  }

  :host([vertical]) .divider::after {
    content: '';
    position: absolute;
    width: 100%;
    top: calc(var(--divider-hit-area) / -2 + var(--divider-width) / 2);
    height: var(--divider-hit-area);
  }

  @media (forced-colors: active) {
    .divider {
      outline: solid 1px transparent;
    }
  }
`;function Vr(t,e){function i(s){const n=t.getBoundingClientRect(),o=t.ownerDocument.defaultView,l=n.left+o.scrollX,u=n.top+o.scrollY,c=s.pageX-l,h=s.pageY-u;e?.onMove&&e.onMove(c,h)}function r(){document.removeEventListener("pointermove",i),document.removeEventListener("pointerup",r),e?.onStop&&e.onStop()}document.addEventListener("pointermove",i,{passive:!0}),document.addEventListener("pointerup",r),e?.initialEvent instanceof PointerEvent&&i(e.initialEvent)}var iu=()=>null,Ze=class extends q{constructor(){super(...arguments),this.isCollapsed=!1,this.localize=new ie(this),this.positionBeforeCollapsing=0,this.position=50,this.vertical=!1,this.disabled=!1,this.snapValue="",this.snapFunction=iu,this.snapThreshold=12}toSnapFunction(t){const e=t.split(" ");return({pos:i,size:r,snapThreshold:s,isRtl:n,vertical:o})=>{let l=i,u=Number.POSITIVE_INFINITY;return e.forEach(c=>{let h;if(c.startsWith("repeat(")){const a=t.substring(7,t.length-1),d=a.endsWith("%"),p=Number.parseFloat(a),b=d?r*(p/100):p;h=Math.round((n&&!o?r-i:i)/b)*b}else c.endsWith("%")?h=r*(Number.parseFloat(c)/100):h=Number.parseFloat(c);n&&!o&&(h=r-h);const f=Math.abs(i-h);f<=s&&f<u&&(l=h,u=f)}),l}}set snap(t){this.snapValue=t??"",t?this.snapFunction=typeof t=="string"?this.toSnapFunction(t):t:this.snapFunction=iu}get snap(){return this.snapValue}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(t=>this.handleResize(t)),this.updateComplete.then(()=>this.resizeObserver.observe(this)),this.detectSize(),this.cachedPositionInPixels=this.percentageToPixels(this.position)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.resizeObserver)==null||t.unobserve(this)}detectSize(){const{width:t,height:e}=this.getBoundingClientRect();this.size=this.vertical?e:t}percentageToPixels(t){return this.size*(t/100)}pixelsToPercentage(t){return t/this.size*100}handleDrag(t){const e=this.localize.dir()==="rtl";this.disabled||(t.cancelable&&t.preventDefault(),Vr(this,{onMove:(i,r)=>{var s;let n=this.vertical?r:i;this.primary==="end"&&(n=this.size-n),n=(s=this.snapFunction({pos:n,size:this.size,snapThreshold:this.snapThreshold,isRtl:e,vertical:this.vertical}))!=null?s:n,this.position=Ce(this.pixelsToPercentage(n),0,100)},initialEvent:t}))}handleKeyDown(t){if(!this.disabled&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","Enter"].includes(t.key)){let e=this.position;const i=(t.shiftKey?10:1)*(this.primary==="end"?-1:1);if(t.preventDefault(),(t.key==="ArrowLeft"&&!this.vertical||t.key==="ArrowUp"&&this.vertical)&&(e-=i),(t.key==="ArrowRight"&&!this.vertical||t.key==="ArrowDown"&&this.vertical)&&(e+=i),t.key==="Home"&&(e=this.primary==="end"?100:0),t.key==="End"&&(e=this.primary==="end"?0:100),t.key==="Enter")if(this.isCollapsed)e=this.positionBeforeCollapsing,this.isCollapsed=!1;else{const r=this.position;e=0,requestAnimationFrame(()=>{this.isCollapsed=!0,this.positionBeforeCollapsing=r})}this.position=Ce(e,0,100)}}handleResize(t){const{width:e,height:i}=t[0].contentRect;this.size=this.vertical?i:e,(isNaN(this.cachedPositionInPixels)||this.position===1/0)&&(this.cachedPositionInPixels=Number(this.getAttribute("position-in-pixels")),this.positionInPixels=Number(this.getAttribute("position-in-pixels")),this.position=this.pixelsToPercentage(this.positionInPixels)),this.primary&&(this.position=this.pixelsToPercentage(this.cachedPositionInPixels))}handlePositionChange(){this.cachedPositionInPixels=this.percentageToPixels(this.position),this.isCollapsed=!1,this.positionBeforeCollapsing=0,this.positionInPixels=this.percentageToPixels(this.position),this.emit("sl-reposition")}handlePositionInPixelsChange(){this.position=this.pixelsToPercentage(this.positionInPixels)}handleVerticalChange(){this.detectSize()}render(){const t=this.vertical?"gridTemplateRows":"gridTemplateColumns",e=this.vertical?"gridTemplateColumns":"gridTemplateRows",i=this.localize.dir()==="rtl",r=`
      clamp(
        0%,
        clamp(
          var(--min),
          ${this.position}% - var(--divider-width) / 2,
          var(--max)
        ),
        calc(100% - var(--divider-width))
      )
    `,s="auto";return this.primary==="end"?i&&!this.vertical?this.style[t]=`${r} var(--divider-width) ${s}`:this.style[t]=`${s} var(--divider-width) ${r}`:i&&!this.vertical?this.style[t]=`${s} var(--divider-width) ${r}`:this.style[t]=`${r} var(--divider-width) ${s}`,this.style[e]="",N`
      <slot name="start" part="panel start" class="start"></slot>

      <div
        part="divider"
        class="divider"
        tabindex=${F(this.disabled?void 0:"0")}
        role="separator"
        aria-valuenow=${this.position}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label=${this.localize.term("resize")}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleDrag}
        @touchstart=${this.handleDrag}
      >
        <slot name="divider"></slot>
      </div>

      <slot name="end" part="panel end" class="end"></slot>
    `}};Ze.styles=[H,Ap];m([R(".divider")],Ze.prototype,"divider",2);m([k({type:Number,reflect:!0})],Ze.prototype,"position",2);m([k({attribute:"position-in-pixels",type:Number})],Ze.prototype,"positionInPixels",2);m([k({type:Boolean,reflect:!0})],Ze.prototype,"vertical",2);m([k({type:Boolean,reflect:!0})],Ze.prototype,"disabled",2);m([k()],Ze.prototype,"primary",2);m([k({reflect:!0})],Ze.prototype,"snap",1);m([k({type:Number,attribute:"snap-threshold"})],Ze.prototype,"snapThreshold",2);m([M("position")],Ze.prototype,"handlePositionChange",1);m([M("positionInPixels")],Ze.prototype,"handlePositionInPixelsChange",1);m([M("vertical")],Ze.prototype,"handleVerticalChange",1);Ze.define("sl-split-panel");var Ep=U`
  :host {
    display: inline-block;
  }

  :host([size='small']) {
    --height: var(--sl-toggle-size-small);
    --thumb-size: calc(var(--sl-toggle-size-small) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-small);
  }

  :host([size='medium']) {
    --height: var(--sl-toggle-size-medium);
    --thumb-size: calc(var(--sl-toggle-size-medium) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-medium);
  }

  :host([size='large']) {
    --height: var(--sl-toggle-size-large);
    --thumb-size: calc(var(--sl-toggle-size-large) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-large);
  }

  .switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-input-font-family);
    font-size: inherit;
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .switch__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--width);
    height: var(--height);
    background-color: var(--sl-color-neutral-400);
    border: solid var(--sl-input-border-width) var(--sl-color-neutral-400);
    border-radius: var(--height);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color;
  }

  .switch__control .switch__thumb {
    width: var(--thumb-size);
    height: var(--thumb-size);
    background-color: var(--sl-color-neutral-0);
    border-radius: 50%;
    border: solid var(--sl-input-border-width) var(--sl-color-neutral-400);
    translate: calc((var(--width) - var(--height)) / -2);
    transition:
      var(--sl-transition-fast) translate ease,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) box-shadow;
  }

  .switch__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Hover */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover {
    background-color: var(--sl-color-neutral-400);
    border-color: var(--sl-color-neutral-400);
  }

  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-400);
  }

  /* Focus */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__input:focus-visible ~ .switch__control {
    background-color: var(--sl-color-neutral-400);
    border-color: var(--sl-color-neutral-400);
  }

  .switch:not(.switch--checked):not(.switch--disabled) .switch__input:focus-visible ~ .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked */
  .switch--checked .switch__control {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch--checked .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    translate: calc((var(--width) - var(--height)) / 2);
  }

  /* Checked + hover */
  .switch.switch--checked:not(.switch--disabled) .switch__control:hover {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch.switch--checked:not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
  }

  /* Checked + focus */
  .switch.switch--checked:not(.switch--disabled) .switch__input:focus-visible ~ .switch__control {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch.switch--checked:not(.switch--disabled) .switch__input:focus-visible ~ .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .switch--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch__label {
    display: inline-block;
    line-height: var(--height);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .switch__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }

  @media (forced-colors: active) {
    .switch.switch--checked:not(.switch--disabled) .switch__control:hover .switch__thumb,
    .switch--checked .switch__control .switch__thumb {
      background-color: ButtonText;
    }
  }
`,Re=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{value:t=>t.checked?t.value||"on":void 0,defaultValue:t=>t.defaultChecked,setValue:(t,e)=>t.checked=e}),this.hasSlotController=new Ve(this,"help-text"),this.hasFocus=!1,this.title="",this.name="",this.size="medium",this.disabled=!1,this.checked=!1,this.defaultChecked=!1,this.form="",this.required=!1,this.helpText=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleInput(){this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleClick(){this.checked=!this.checked,this.emit("sl-change")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleKeyDown(t){t.key==="ArrowLeft"&&(t.preventDefault(),this.checked=!1,this.emit("sl-change"),this.emit("sl-input")),t.key==="ArrowRight"&&(t.preventDefault(),this.checked=!0,this.emit("sl-change"),this.emit("sl-input"))}handleCheckedChange(){this.input.checked=this.checked,this.formControlController.updateValidity()}handleDisabledChange(){this.formControlController.setValidity(!0)}click(){this.input.click()}focus(t){this.input.focus(t)}blur(){this.input.blur()}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("help-text"),e=this.helpText?!0:!!t;return N`
      <div
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-help-text":e})}
      >
        <label
          part="base"
          class=${j({switch:!0,"switch--checked":this.checked,"switch--disabled":this.disabled,"switch--focused":this.hasFocus,"switch--small":this.size==="small","switch--medium":this.size==="medium","switch--large":this.size==="large"})}
        >
          <input
            class="switch__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${F(this.value)}
            .checked=${$i(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            role="switch"
            aria-checked=${this.checked?"true":"false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
            @keydown=${this.handleKeyDown}
          />

          <span part="control" class="switch__control">
            <span part="thumb" class="switch__thumb"></span>
          </span>

          <div part="label" class="switch__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${e?"false":"true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};Re.styles=[H,Ni,Ep];m([R('input[type="checkbox"]')],Re.prototype,"input",2);m([V()],Re.prototype,"hasFocus",2);m([k()],Re.prototype,"title",2);m([k()],Re.prototype,"name",2);m([k()],Re.prototype,"value",2);m([k({reflect:!0})],Re.prototype,"size",2);m([k({type:Boolean,reflect:!0})],Re.prototype,"disabled",2);m([k({type:Boolean,reflect:!0})],Re.prototype,"checked",2);m([ur("checked")],Re.prototype,"defaultChecked",2);m([k({reflect:!0})],Re.prototype,"form",2);m([k({type:Boolean,reflect:!0})],Re.prototype,"required",2);m([k({attribute:"help-text"})],Re.prototype,"helpText",2);m([M("checked",{waitUntilFirstUpdate:!0})],Re.prototype,"handleCheckedChange",1);m([M("disabled",{waitUntilFirstUpdate:!0})],Re.prototype,"handleDisabledChange",1);Re.define("sl-switch");ls.define("sl-resize-observer");var Tp=U`
  :host {
    display: block;
  }

  /** The popup */
  .select {
    flex: 1 1 auto;
    display: inline-flex;
    width: 100%;
    position: relative;
    vertical-align: middle;
  }

  .select::part(popup) {
    z-index: var(--sl-z-index-dropdown);
  }

  .select[data-current-placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .select[data-current-placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  /* Combobox */
  .select__combobox {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    position: relative;
    align-items: center;
    justify-content: start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    overflow: hidden;
    cursor: pointer;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
  }

  .select__display-input {
    position: relative;
    width: 100%;
    font: inherit;
    border: none;
    background: none;
    color: var(--sl-input-color);
    cursor: inherit;
    overflow: hidden;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;
  }

  .select__display-input::placeholder {
    color: var(--sl-input-placeholder-color);
  }

  .select:not(.select--disabled):hover .select__display-input {
    color: var(--sl-input-color-hover);
  }

  .select__display-input:focus {
    outline: none;
  }

  /* Visually hide the display input when multiple is enabled */
  .select--multiple:not(.select--placeholder-visible) .select__display-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .select__value-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: -1;
  }

  .select__tags {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    margin-inline-start: var(--sl-spacing-2x-small);
  }

  .select__tags::slotted(sl-tag) {
    cursor: pointer !important;
  }

  .select--disabled .select__tags,
  .select--disabled .select__tags::slotted(sl-tag) {
    cursor: not-allowed !important;
  }

  /* Standard selects */
  .select--standard .select__combobox {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .select--standard.select--disabled .select__combobox {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    color: var(--sl-input-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
    outline: none;
  }

  .select--standard:not(.select--disabled).select--open .select__combobox,
  .select--standard:not(.select--disabled).select--focused .select__combobox {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  /* Filled selects */
  .select--filled .select__combobox {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .select--filled:hover:not(.select--disabled) .select__combobox {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .select--filled.select--disabled .select__combobox {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select--filled:not(.select--disabled).select--open .select__combobox,
  .select--filled:not(.select--disabled).select--focused .select__combobox {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
  }

  /* Sizes */
  .select--small .select__combobox {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
    min-height: var(--sl-input-height-small);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-small);
  }

  .select--small .select__clear {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .select--small .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-small);
  }

  .select--small.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .select--small.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-block: 2px;
    padding-inline-start: 0;
  }

  .select--small .select__tags {
    gap: 2px;
  }

  .select--medium .select__combobox {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
    min-height: var(--sl-input-height-medium);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-medium);
  }

  .select--medium .select__clear {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .select--medium .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-medium);
  }

  .select--medium.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .select--medium.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-inline-start: 0;
    padding-block: 3px;
  }

  .select--medium .select__tags {
    gap: 3px;
  }

  .select--large .select__combobox {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
    min-height: var(--sl-input-height-large);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-large);
  }

  .select--large .select__clear {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .select--large .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-large);
  }

  .select--large.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .select--large.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-inline-start: 0;
    padding-block: 4px;
  }

  .select--large .select__tags {
    gap: 4px;
  }

  /* Pills */
  .select--pill.select--small .select__combobox {
    border-radius: var(--sl-input-height-small);
  }

  .select--pill.select--medium .select__combobox {
    border-radius: var(--sl-input-height-medium);
  }

  .select--pill.select--large .select__combobox {
    border-radius: var(--sl-input-height-large);
  }

  /* Prefix and Suffix */
  .select__prefix,
  .select__suffix {
    flex: 0;
    display: inline-flex;
    align-items: center;
    color: var(--sl-input-placeholder-color);
  }

  .select__suffix::slotted(*) {
    margin-inline-start: var(--sl-spacing-small);
  }

  /* Clear button */
  .select__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--sl-input-icon-color);
    border: none;
    background: none;
    padding: 0;
    transition: var(--sl-transition-fast) color;
    cursor: pointer;
  }

  .select__clear:hover {
    color: var(--sl-input-icon-color-hover);
  }

  .select__clear:focus {
    outline: none;
  }

  /* Expand icon */
  .select__expand-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    transition: var(--sl-transition-medium) rotate ease;
    rotate: 0;
    margin-inline-start: var(--sl-spacing-small);
  }

  .select--open .select__expand-icon {
    rotate: -180deg;
  }

  /* Listbox */
  .select__listbox {
    display: block;
    position: relative;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    box-shadow: var(--sl-shadow-large);
    background: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-radius: var(--sl-border-radius-medium);
    padding-block: var(--sl-spacing-x-small);
    padding-inline: 0;
    overflow: auto;
    overscroll-behavior: none;

    /* Make sure it adheres to the popup's auto size */
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);
  }

  .select__listbox ::slotted(sl-divider) {
    --spacing: var(--sl-spacing-x-small);
  }

  .select__listbox ::slotted(small) {
    display: block;
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    color: var(--sl-color-neutral-500);
    padding-block: var(--sl-spacing-2x-small);
    padding-inline: var(--sl-spacing-x-large);
  }
`;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let ha=class extends ss{constructor(e){if(super(e),this.it=pe,e.type!==$t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===pe||e==null)return this._t=void 0,this.it=e;if(e===Je)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const i=[e];return i.raw=i,this._t={_$litType$:this.constructor.resultType,strings:i,values:[]}}};ha.directiveName="unsafeHTML",ha.resultType=1;const js=rs(ha);var ee=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new Ve(this,"help-text","label"),this.localize=new ie(this),this.typeToSelectString="",this.hasFocus=!1,this.displayLabel="",this.selectedOptions=[],this.valueHasChanged=!1,this.name="",this._value="",this.defaultValue="",this.size="medium",this.placeholder="",this.multiple=!1,this.maxOptionsVisible=3,this.disabled=!1,this.clearable=!1,this.open=!1,this.hoist=!1,this.filled=!1,this.pill=!1,this.label="",this.placement="bottom",this.helpText="",this.form="",this.required=!1,this.getTag=t=>N`
      <sl-tag
        part="tag"
        exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base
            "
        ?pill=${this.pill}
        size=${this.size}
        removable
        @sl-remove=${e=>this.handleTagRemove(e,t)}
      >
        ${t.getTextLabel()}
      </sl-tag>
    `,this.handleDocumentFocusIn=t=>{const e=t.composedPath();this&&!e.includes(this)&&this.hide()},this.handleDocumentKeyDown=t=>{const e=t.target,i=e.closest(".select__clear")!==null,r=e.closest("sl-icon-button")!==null;if(!(i||r)){if(t.key==="Escape"&&this.open&&!this.closeWatcher&&(t.preventDefault(),t.stopPropagation(),this.hide(),this.displayInput.focus({preventScroll:!0})),t.key==="Enter"||t.key===" "&&this.typeToSelectString===""){if(t.preventDefault(),t.stopImmediatePropagation(),!this.open){this.show();return}this.currentOption&&!this.currentOption.disabled&&(this.valueHasChanged=!0,this.multiple?this.toggleOptionSelection(this.currentOption):this.setSelectedOptions(this.currentOption),this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})));return}if(["ArrowUp","ArrowDown","Home","End"].includes(t.key)){const s=this.getAllOptions(),n=s.indexOf(this.currentOption);let o=Math.max(0,n);if(t.preventDefault(),!this.open&&(this.show(),this.currentOption))return;t.key==="ArrowDown"?(o=n+1,o>s.length-1&&(o=0)):t.key==="ArrowUp"?(o=n-1,o<0&&(o=s.length-1)):t.key==="Home"?o=0:t.key==="End"&&(o=s.length-1),this.setCurrentOption(s[o])}if(t.key&&t.key.length===1||t.key==="Backspace"){const s=this.getAllOptions();if(t.metaKey||t.ctrlKey||t.altKey)return;if(!this.open){if(t.key==="Backspace")return;this.show()}t.stopPropagation(),t.preventDefault(),clearTimeout(this.typeToSelectTimeout),this.typeToSelectTimeout=window.setTimeout(()=>this.typeToSelectString="",1e3),t.key==="Backspace"?this.typeToSelectString=this.typeToSelectString.slice(0,-1):this.typeToSelectString+=t.key.toLowerCase();for(const n of s)if(n.getTextLabel().toLowerCase().startsWith(this.typeToSelectString)){this.setCurrentOption(n);break}}}},this.handleDocumentMouseDown=t=>{const e=t.composedPath();this&&!e.includes(this)&&this.hide()}}get value(){return this._value}set value(t){this.multiple?t=Array.isArray(t)?t:t.split(" "):t=Array.isArray(t)?t.join(" "):t,this._value!==t&&(this.valueHasChanged=!0,this._value=t)}get validity(){return this.valueInput.validity}get validationMessage(){return this.valueInput.validationMessage}connectedCallback(){super.connectedCallback(),setTimeout(()=>{this.handleDefaultSlotChange()}),this.open=!1}addOpenListeners(){var t;document.addEventListener("focusin",this.handleDocumentFocusIn),document.addEventListener("keydown",this.handleDocumentKeyDown),document.addEventListener("mousedown",this.handleDocumentMouseDown),this.getRootNode()!==document&&this.getRootNode().addEventListener("focusin",this.handleDocumentFocusIn),"CloseWatcher"in window&&((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>{this.open&&(this.hide(),this.displayInput.focus({preventScroll:!0}))})}removeOpenListeners(){var t;document.removeEventListener("focusin",this.handleDocumentFocusIn),document.removeEventListener("keydown",this.handleDocumentKeyDown),document.removeEventListener("mousedown",this.handleDocumentMouseDown),this.getRootNode()!==document&&this.getRootNode().removeEventListener("focusin",this.handleDocumentFocusIn),(t=this.closeWatcher)==null||t.destroy()}handleFocus(){this.hasFocus=!0,this.displayInput.setSelectionRange(0,0),this.emit("sl-focus")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleLabelClick(){this.displayInput.focus()}handleComboboxMouseDown(t){const i=t.composedPath().some(r=>r instanceof Element&&r.tagName.toLowerCase()==="sl-icon-button");this.disabled||i||(t.preventDefault(),this.displayInput.focus({preventScroll:!0}),this.open=!this.open)}handleComboboxKeyDown(t){t.key!=="Tab"&&(t.stopPropagation(),this.handleDocumentKeyDown(t))}handleClearClick(t){t.stopPropagation(),this.valueHasChanged=!0,this.value!==""&&(this.setSelectedOptions([]),this.displayInput.focus({preventScroll:!0}),this.updateComplete.then(()=>{this.emit("sl-clear"),this.emit("sl-input"),this.emit("sl-change")}))}handleClearMouseDown(t){t.stopPropagation(),t.preventDefault()}handleOptionClick(t){const i=t.target.closest("sl-option"),r=this.value;i&&!i.disabled&&(this.valueHasChanged=!0,this.multiple?this.toggleOptionSelection(i):this.setSelectedOptions(i),this.updateComplete.then(()=>this.displayInput.focus({preventScroll:!0})),this.value!==r&&this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})))}handleDefaultSlotChange(){customElements.get("sl-option")||customElements.whenDefined("sl-option").then(()=>this.handleDefaultSlotChange());const t=this.getAllOptions(),e=this.valueHasChanged?this.value:this.defaultValue,i=Array.isArray(e)?e:[e],r=[];t.forEach(s=>r.push(s.value)),this.setSelectedOptions(t.filter(s=>i.includes(s.value)))}handleTagRemove(t,e){t.stopPropagation(),this.valueHasChanged=!0,this.disabled||(this.toggleOptionSelection(e,!1),this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}))}getAllOptions(){return[...this.querySelectorAll("sl-option")]}getFirstOption(){return this.querySelector("sl-option")}setCurrentOption(t){this.getAllOptions().forEach(i=>{i.current=!1,i.tabIndex=-1}),t&&(this.currentOption=t,t.current=!0,t.tabIndex=0,t.focus())}setSelectedOptions(t){const e=this.getAllOptions(),i=Array.isArray(t)?t:[t];e.forEach(r=>r.selected=!1),i.length&&i.forEach(r=>r.selected=!0),this.selectionChanged()}toggleOptionSelection(t,e){e===!0||e===!1?t.selected=e:t.selected=!t.selected,this.selectionChanged()}selectionChanged(){var t,e,i;const r=this.getAllOptions();this.selectedOptions=r.filter(n=>n.selected);const s=this.valueHasChanged;if(this.multiple)this.value=this.selectedOptions.map(n=>n.value),this.placeholder&&this.value.length===0?this.displayLabel="":this.displayLabel=this.localize.term("numOptionsSelected",this.selectedOptions.length);else{const n=this.selectedOptions[0];this.value=(t=n?.value)!=null?t:"",this.displayLabel=(i=(e=n?.getTextLabel)==null?void 0:e.call(n))!=null?i:""}this.valueHasChanged=s,this.updateComplete.then(()=>{this.formControlController.updateValidity()})}get tags(){return this.selectedOptions.map((t,e)=>{if(e<this.maxOptionsVisible||this.maxOptionsVisible<=0){const i=this.getTag(t,e);return N`<div @sl-remove=${r=>this.handleTagRemove(r,t)}>
          ${typeof i=="string"?js(i):i}
        </div>`}else if(e===this.maxOptionsVisible)return N`<sl-tag size=${this.size}>+${this.selectedOptions.length-e}</sl-tag>`;return N``})}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleDisabledChange(){this.disabled&&(this.open=!1,this.handleOpenChange())}attributeChangedCallback(t,e,i){if(super.attributeChangedCallback(t,e,i),t==="value"){const r=this.valueHasChanged;this.value=this.defaultValue,this.valueHasChanged=r}}handleValueChange(){if(!this.valueHasChanged){const i=this.valueHasChanged;this.value=this.defaultValue,this.valueHasChanged=i}const t=this.getAllOptions(),e=Array.isArray(this.value)?this.value:[this.value];this.setSelectedOptions(t.filter(i=>e.includes(i.value)))}async handleOpenChange(){if(this.open&&!this.disabled){this.setCurrentOption(this.selectedOptions[0]||this.getFirstOption()),this.emit("sl-show"),this.addOpenListeners(),await Ae(this),this.listbox.hidden=!1,this.popup.active=!0,requestAnimationFrame(()=>{this.setCurrentOption(this.currentOption)});const{keyframes:t,options:e}=me(this,"select.show",{dir:this.localize.dir()});await _e(this.popup.popup,t,e),this.currentOption&&da(this.currentOption,this.listbox,"vertical","auto"),this.emit("sl-after-show")}else{this.emit("sl-hide"),this.removeOpenListeners(),await Ae(this);const{keyframes:t,options:e}=me(this,"select.hide",{dir:this.localize.dir()});await _e(this.popup.popup,t,e),this.listbox.hidden=!0,this.popup.active=!1,this.emit("sl-after-hide")}}async show(){if(this.open||this.disabled){this.open=!1;return}return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(!this.open||this.disabled){this.open=!1;return}return this.open=!1,Ue(this,"sl-after-hide")}checkValidity(){return this.valueInput.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.valueInput.reportValidity()}setCustomValidity(t){this.valueInput.setCustomValidity(t),this.formControlController.updateValidity()}focus(t){this.displayInput.focus(t)}blur(){this.displayInput.blur()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),i=this.label?!0:!!t,r=this.helpText?!0:!!e,s=this.clearable&&!this.disabled&&this.value.length>0,n=this.placeholder&&this.value&&this.value.length<=0;return N`
      <div
        part="form-control"
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":i,"form-control--has-help-text":r})}
      >
        <label
          id="label"
          part="form-control-label"
          class="form-control__label"
          aria-hidden=${i?"false":"true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <sl-popup
            class=${j({select:!0,"select--standard":!0,"select--filled":this.filled,"select--pill":this.pill,"select--open":this.open,"select--disabled":this.disabled,"select--multiple":this.multiple,"select--focused":this.hasFocus,"select--placeholder-visible":n,"select--top":this.placement==="top","select--bottom":this.placement==="bottom","select--small":this.size==="small","select--medium":this.size==="medium","select--large":this.size==="large"})}
            placement=${this.placement}
            strategy=${this.hoist?"fixed":"absolute"}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            <div
              part="combobox"
              class="select__combobox"
              slot="anchor"
              @keydown=${this.handleComboboxKeyDown}
              @mousedown=${this.handleComboboxMouseDown}
            >
              <slot part="prefix" name="prefix" class="select__prefix"></slot>

              <input
                part="display-input"
                class="select__display-input"
                type="text"
                placeholder=${this.placeholder}
                .disabled=${this.disabled}
                .value=${this.displayLabel}
                autocomplete="off"
                spellcheck="false"
                autocapitalize="off"
                readonly
                aria-controls="listbox"
                aria-expanded=${this.open?"true":"false"}
                aria-haspopup="listbox"
                aria-labelledby="label"
                aria-disabled=${this.disabled?"true":"false"}
                aria-describedby="help-text"
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
              />

              ${this.multiple?N`<div part="tags" class="select__tags">${this.tags}</div>`:""}

              <input
                class="select__value-input"
                type="text"
                ?disabled=${this.disabled}
                ?required=${this.required}
                .value=${Array.isArray(this.value)?this.value.join(", "):this.value}
                tabindex="-1"
                aria-hidden="true"
                @focus=${()=>this.focus()}
                @invalid=${this.handleInvalid}
              />

              ${s?N`
                    <button
                      part="clear-button"
                      class="select__clear"
                      type="button"
                      aria-label=${this.localize.term("clearEntry")}
                      @mousedown=${this.handleClearMouseDown}
                      @click=${this.handleClearClick}
                      tabindex="-1"
                    >
                      <slot name="clear-icon">
                        <sl-icon name="x-circle-fill" library="system"></sl-icon>
                      </slot>
                    </button>
                  `:""}

              <slot name="suffix" part="suffix" class="select__suffix"></slot>

              <slot name="expand-icon" part="expand-icon" class="select__expand-icon">
                <sl-icon library="system" name="chevron-down"></sl-icon>
              </slot>
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open?"true":"false"}
              aria-multiselectable=${this.multiple?"true":"false"}
              aria-labelledby="label"
              part="listbox"
              class="select__listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}
              @slotchange=${this.handleDefaultSlotChange}
            >
              <slot></slot>
            </div>
          </sl-popup>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};ee.styles=[H,Ni,Tp];ee.dependencies={"sl-icon":fe,"sl-popup":ae,"sl-tag":li};m([R(".select")],ee.prototype,"popup",2);m([R(".select__combobox")],ee.prototype,"combobox",2);m([R(".select__display-input")],ee.prototype,"displayInput",2);m([R(".select__value-input")],ee.prototype,"valueInput",2);m([R(".select__listbox")],ee.prototype,"listbox",2);m([V()],ee.prototype,"hasFocus",2);m([V()],ee.prototype,"displayLabel",2);m([V()],ee.prototype,"currentOption",2);m([V()],ee.prototype,"selectedOptions",2);m([V()],ee.prototype,"valueHasChanged",2);m([k()],ee.prototype,"name",2);m([V()],ee.prototype,"value",1);m([k({attribute:"value"})],ee.prototype,"defaultValue",2);m([k({reflect:!0})],ee.prototype,"size",2);m([k()],ee.prototype,"placeholder",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"multiple",2);m([k({attribute:"max-options-visible",type:Number})],ee.prototype,"maxOptionsVisible",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"disabled",2);m([k({type:Boolean})],ee.prototype,"clearable",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"open",2);m([k({type:Boolean})],ee.prototype,"hoist",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"filled",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"pill",2);m([k()],ee.prototype,"label",2);m([k({reflect:!0})],ee.prototype,"placement",2);m([k({attribute:"help-text"})],ee.prototype,"helpText",2);m([k({reflect:!0})],ee.prototype,"form",2);m([k({type:Boolean,reflect:!0})],ee.prototype,"required",2);m([k()],ee.prototype,"getTag",2);m([M("disabled",{waitUntilFirstUpdate:!0})],ee.prototype,"handleDisabledChange",1);m([M(["defaultValue","value"],{waitUntilFirstUpdate:!0})],ee.prototype,"handleValueChange",1);m([M("open",{waitUntilFirstUpdate:!0})],ee.prototype,"handleOpenChange",1);oe("select.show",{keyframes:[{opacity:0,scale:.9},{opacity:1,scale:1}],options:{duration:100,easing:"ease"}});oe("select.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.9}],options:{duration:100,easing:"ease"}});ee.define("sl-select");ns.define("sl-spinner");var Op=U`
  :host {
    --thumb-size: 20px;
    --tooltip-offset: 10px;
    --track-color-active: var(--sl-color-neutral-200);
    --track-color-inactive: var(--sl-color-neutral-200);
    --track-active-offset: 0%;
    --track-height: 6px;

    display: block;
  }

  .range {
    position: relative;
  }

  .range__control {
    --percent: 0%;
    -webkit-appearance: none;
    border-radius: 3px;
    width: 100%;
    height: var(--track-height);
    background: transparent;
    line-height: var(--sl-input-height-medium);
    vertical-align: middle;
    margin: 0;

    background-image: linear-gradient(
      to right,
      var(--track-color-inactive) 0%,
      var(--track-color-inactive) min(var(--percent), var(--track-active-offset)),
      var(--track-color-active) min(var(--percent), var(--track-active-offset)),
      var(--track-color-active) max(var(--percent), var(--track-active-offset)),
      var(--track-color-inactive) max(var(--percent), var(--track-active-offset)),
      var(--track-color-inactive) 100%
    );
  }

  .range--rtl .range__control {
    background-image: linear-gradient(
      to left,
      var(--track-color-inactive) 0%,
      var(--track-color-inactive) min(var(--percent), var(--track-active-offset)),
      var(--track-color-active) min(var(--percent), var(--track-active-offset)),
      var(--track-color-active) max(var(--percent), var(--track-active-offset)),
      var(--track-color-inactive) max(var(--percent), var(--track-active-offset)),
      var(--track-color-inactive) 100%
    );
  }

  /* Webkit */
  .range__control::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--track-height);
    border-radius: 3px;
    border: none;
  }

  .range__control::-webkit-slider-thumb {
    border: none;
    width: var(--thumb-size);
    height: var(--thumb-size);
    border-radius: 50%;
    background-color: var(--sl-color-primary-600);
    border: solid var(--sl-input-border-width) var(--sl-color-primary-600);
    -webkit-appearance: none;
    margin-top: calc(var(--thumb-size) / -2 + var(--track-height) / 2);
    cursor: pointer;
  }

  .range__control:enabled::-webkit-slider-thumb:hover {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
  }

  .range__control:enabled:focus-visible::-webkit-slider-thumb {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .range__control:enabled::-webkit-slider-thumb:active {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    cursor: grabbing;
  }

  /* Firefox */
  .range__control::-moz-focus-outer {
    border: 0;
  }

  .range__control::-moz-range-progress {
    background-color: var(--track-color-active);
    border-radius: 3px;
    height: var(--track-height);
  }

  .range__control::-moz-range-track {
    width: 100%;
    height: var(--track-height);
    background-color: var(--track-color-inactive);
    border-radius: 3px;
    border: none;
  }

  .range__control::-moz-range-thumb {
    border: none;
    height: var(--thumb-size);
    width: var(--thumb-size);
    border-radius: 50%;
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
    cursor: pointer;
  }

  .range__control:enabled::-moz-range-thumb:hover {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
  }

  .range__control:enabled:focus-visible::-moz-range-thumb {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .range__control:enabled::-moz-range-thumb:active {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    cursor: grabbing;
  }

  /* States */
  .range__control:focus-visible {
    outline: none;
  }

  .range__control:disabled {
    opacity: 0.5;
  }

  .range__control:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  .range__control:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }

  /* Tooltip output */
  .range__tooltip {
    position: absolute;
    z-index: var(--sl-z-index-tooltip);
    left: 0;
    border-radius: var(--sl-tooltip-border-radius);
    background-color: var(--sl-tooltip-background-color);
    font-family: var(--sl-tooltip-font-family);
    font-size: var(--sl-tooltip-font-size);
    font-weight: var(--sl-tooltip-font-weight);
    line-height: var(--sl-tooltip-line-height);
    color: var(--sl-tooltip-color);
    opacity: 0;
    padding: var(--sl-tooltip-padding);
    transition: var(--sl-transition-fast) opacity;
    pointer-events: none;
  }

  .range__tooltip:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    left: 50%;
    translate: calc(-1 * var(--sl-tooltip-arrow-size));
  }

  .range--tooltip-visible .range__tooltip {
    opacity: 1;
  }

  /* Tooltip on top */
  .range--tooltip-top .range__tooltip {
    top: calc(-1 * var(--thumb-size) - var(--tooltip-offset));
  }

  .range--tooltip-top .range__tooltip:after {
    border-top: var(--sl-tooltip-arrow-size) solid var(--sl-tooltip-background-color);
    border-left: var(--sl-tooltip-arrow-size) solid transparent;
    border-right: var(--sl-tooltip-arrow-size) solid transparent;
    top: 100%;
  }

  /* Tooltip on bottom */
  .range--tooltip-bottom .range__tooltip {
    bottom: calc(-1 * var(--thumb-size) - var(--tooltip-offset));
  }

  .range--tooltip-bottom .range__tooltip:after {
    border-bottom: var(--sl-tooltip-arrow-size) solid var(--sl-tooltip-background-color);
    border-left: var(--sl-tooltip-arrow-size) solid transparent;
    border-right: var(--sl-tooltip-arrow-size) solid transparent;
    bottom: 100%;
  }

  @media (forced-colors: active) {
    .range__control,
    .range__tooltip {
      border: solid 1px transparent;
    }

    .range__control::-webkit-slider-thumb {
      border: solid 1px transparent;
    }

    .range__control::-moz-range-thumb {
      border: solid 1px transparent;
    }

    .range__tooltip:after {
      display: none;
    }
  }
`,we=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this),this.hasSlotController=new Ve(this,"help-text","label"),this.localize=new ie(this),this.hasFocus=!1,this.hasTooltip=!1,this.title="",this.name="",this.value=0,this.label="",this.helpText="",this.disabled=!1,this.min=0,this.max=100,this.step=1,this.tooltip="top",this.tooltipFormatter=t=>t.toString(),this.form="",this.defaultValue=0}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>this.syncRange()),this.value<this.min&&(this.value=this.min),this.value>this.max&&(this.value=this.max),this.updateComplete.then(()=>{this.syncRange(),this.resizeObserver.observe(this.input)})}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.resizeObserver)==null||t.unobserve(this.input)}handleChange(){this.emit("sl-change")}handleInput(){this.value=parseFloat(this.input.value),this.emit("sl-input"),this.syncRange()}handleBlur(){this.hasFocus=!1,this.hasTooltip=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.hasTooltip=!0,this.emit("sl-focus")}handleThumbDragStart(){this.hasTooltip=!0}handleThumbDragEnd(){this.hasTooltip=!1}syncProgress(t){this.input.style.setProperty("--percent",`${t*100}%`)}syncTooltip(t){if(this.output!==null){const e=this.input.offsetWidth,i=this.output.offsetWidth,r=getComputedStyle(this.input).getPropertyValue("--thumb-size"),s=this.localize.dir()==="rtl",n=e*t;if(s){const o=`${e-n}px + ${t} * ${r}`;this.output.style.translate=`calc((${o} - ${i/2}px - ${r} / 2))`}else{const o=`${n}px - ${t} * ${r}`;this.output.style.translate=`calc(${o} - ${i/2}px + ${r} / 2)`}}}handleValueChange(){this.formControlController.updateValidity(),this.input.value=this.value.toString(),this.value=parseFloat(this.input.value),this.syncRange()}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}syncRange(){const t=Math.max(0,(this.value-this.min)/(this.max-this.min));this.syncProgress(t),this.tooltip!=="none"&&this.hasTooltip&&this.updateComplete.then(()=>this.syncTooltip(t))}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}focus(t){this.input.focus(t)}blur(){this.input.blur()}stepUp(){this.input.stepUp(),this.value!==Number(this.input.value)&&(this.value=Number(this.input.value))}stepDown(){this.input.stepDown(),this.value!==Number(this.input.value)&&(this.value=Number(this.input.value))}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),i=this.label?!0:!!t,r=this.helpText?!0:!!e;return N`
      <div
        part="form-control"
        class=${j({"form-control":!0,"form-control--medium":!0,"form-control--has-label":i,"form-control--has-help-text":r})}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${i?"false":"true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${j({range:!0,"range--disabled":this.disabled,"range--focused":this.hasFocus,"range--rtl":this.localize.dir()==="rtl","range--tooltip-visible":this.hasTooltip,"range--tooltip-top":this.tooltip==="top","range--tooltip-bottom":this.tooltip==="bottom"})}
            @mousedown=${this.handleThumbDragStart}
            @mouseup=${this.handleThumbDragEnd}
            @touchstart=${this.handleThumbDragStart}
            @touchend=${this.handleThumbDragEnd}
          >
            <input
              part="input"
              id="input"
              class="range__control"
              title=${this.title}
              type="range"
              name=${F(this.name)}
              ?disabled=${this.disabled}
              min=${F(this.min)}
              max=${F(this.max)}
              step=${F(this.step)}
              .value=${$i(this.value.toString())}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @focus=${this.handleFocus}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @blur=${this.handleBlur}
            />
            ${this.tooltip!=="none"&&!this.disabled?N`
                  <output part="tooltip" class="range__tooltip">
                    ${typeof this.tooltipFormatter=="function"?this.tooltipFormatter(this.value):this.value}
                  </output>
                `:""}
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};we.styles=[H,Ni,Op];m([R(".range__control")],we.prototype,"input",2);m([R(".range__tooltip")],we.prototype,"output",2);m([V()],we.prototype,"hasFocus",2);m([V()],we.prototype,"hasTooltip",2);m([k()],we.prototype,"title",2);m([k()],we.prototype,"name",2);m([k({type:Number})],we.prototype,"value",2);m([k()],we.prototype,"label",2);m([k({attribute:"help-text"})],we.prototype,"helpText",2);m([k({type:Boolean,reflect:!0})],we.prototype,"disabled",2);m([k({type:Number})],we.prototype,"min",2);m([k({type:Number})],we.prototype,"max",2);m([k({type:Number})],we.prototype,"step",2);m([k()],we.prototype,"tooltip",2);m([k({attribute:!1})],we.prototype,"tooltipFormatter",2);m([k({reflect:!0})],we.prototype,"form",2);m([ur()],we.prototype,"defaultValue",2);m([is({passive:!0})],we.prototype,"handleThumbDragStart",1);m([M("value",{waitUntilFirstUpdate:!0})],we.prototype,"handleValueChange",1);m([M("disabled",{waitUntilFirstUpdate:!0})],we.prototype,"handleDisabledChange",1);m([M("hasTooltip",{waitUntilFirstUpdate:!0})],we.prototype,"syncRange",1);we.define("sl-range");var $p=U`
  :host {
    --symbol-color: var(--sl-color-neutral-300);
    --symbol-color-active: var(--sl-color-amber-500);
    --symbol-size: 1.2rem;
    --symbol-spacing: var(--sl-spacing-3x-small);

    display: inline-flex;
  }

  .rating {
    position: relative;
    display: inline-flex;
    border-radius: var(--sl-border-radius-medium);
    vertical-align: middle;
  }

  .rating:focus {
    outline: none;
  }

  .rating:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .rating__symbols {
    display: inline-flex;
    position: relative;
    font-size: var(--symbol-size);
    line-height: 0;
    color: var(--symbol-color);
    white-space: nowrap;
    cursor: pointer;
  }

  .rating__symbols > * {
    padding: var(--symbol-spacing);
  }

  .rating__symbol--active,
  .rating__partial--filled {
    color: var(--symbol-color-active);
  }

  .rating__partial-symbol-container {
    position: relative;
  }

  .rating__partial--filled {
    position: absolute;
    top: var(--symbol-spacing);
    left: var(--symbol-spacing);
  }

  .rating__symbol {
    transition: var(--sl-transition-fast) scale;
    pointer-events: none;
  }

  .rating__symbol--hover {
    scale: 1.2;
  }

  .rating--disabled .rating__symbols,
  .rating--readonly .rating__symbols {
    cursor: default;
  }

  .rating--disabled .rating__symbol--hover,
  .rating--readonly .rating__symbol--hover {
    scale: none;
  }

  .rating--disabled {
    opacity: 0.5;
  }

  .rating--disabled .rating__symbols {
    cursor: not-allowed;
  }

  /* Forced colors mode */
  @media (forced-colors: active) {
    .rating__symbol--active {
      color: SelectedItem;
    }
  }
`;/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ud="important",Ip=" !"+ud,He=rs(class extends ss{constructor(t){if(super(t),t.type!==$t.ATTRIBUTE||t.name!=="style"||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,i)=>{const r=t[i];return r==null?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`}),"")}update(t,[e]){const{style:i}=t.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const r of this.ft)e[r]==null&&(this.ft.delete(r),r.includes("-")?i.removeProperty(r):i[r]=null);for(const r in e){const s=e[r];if(s!=null){this.ft.add(r);const n=typeof s=="string"&&s.endsWith(Ip);r.includes("-")||n?i.setProperty(r,n?s.slice(0,-11):s,n?ud:""):i[r]=s}}return Je}});var Be=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.hoverValue=0,this.isHovering=!1,this.label="",this.value=0,this.max=5,this.precision=1,this.readonly=!1,this.disabled=!1,this.getSymbol=()=>'<sl-icon name="star-fill" library="system"></sl-icon>'}getValueFromMousePosition(t){return this.getValueFromXCoordinate(t.clientX)}getValueFromTouchPosition(t){return this.getValueFromXCoordinate(t.touches[0].clientX)}getValueFromXCoordinate(t){const e=this.localize.dir()==="rtl",{left:i,right:r,width:s}=this.rating.getBoundingClientRect(),n=e?this.roundToPrecision((r-t)/s*this.max,this.precision):this.roundToPrecision((t-i)/s*this.max,this.precision);return Ce(n,0,this.max)}handleClick(t){this.disabled||(this.setValue(this.getValueFromMousePosition(t)),this.emit("sl-change"))}setValue(t){this.disabled||this.readonly||(this.value=t===this.value?0:t,this.isHovering=!1)}handleKeyDown(t){const e=this.localize.dir()==="ltr",i=this.localize.dir()==="rtl",r=this.value;if(!(this.disabled||this.readonly)){if(t.key==="ArrowDown"||e&&t.key==="ArrowLeft"||i&&t.key==="ArrowRight"){const s=t.shiftKey?1:this.precision;this.value=Math.max(0,this.value-s),t.preventDefault()}if(t.key==="ArrowUp"||e&&t.key==="ArrowRight"||i&&t.key==="ArrowLeft"){const s=t.shiftKey?1:this.precision;this.value=Math.min(this.max,this.value+s),t.preventDefault()}t.key==="Home"&&(this.value=0,t.preventDefault()),t.key==="End"&&(this.value=this.max,t.preventDefault()),this.value!==r&&this.emit("sl-change")}}handleMouseEnter(t){this.isHovering=!0,this.hoverValue=this.getValueFromMousePosition(t)}handleMouseMove(t){this.hoverValue=this.getValueFromMousePosition(t)}handleMouseLeave(){this.isHovering=!1}handleTouchStart(t){this.isHovering=!0,this.hoverValue=this.getValueFromTouchPosition(t),t.preventDefault()}handleTouchMove(t){this.hoverValue=this.getValueFromTouchPosition(t)}handleTouchEnd(t){this.isHovering=!1,this.setValue(this.hoverValue),this.emit("sl-change"),t.preventDefault()}roundToPrecision(t,e=.5){const i=1/e;return Math.ceil(t*i)/i}handleHoverValueChange(){this.emit("sl-hover",{detail:{phase:"move",value:this.hoverValue}})}handleIsHoveringChange(){this.emit("sl-hover",{detail:{phase:this.isHovering?"start":"end",value:this.hoverValue}})}focus(t){this.rating.focus(t)}blur(){this.rating.blur()}render(){const t=this.localize.dir()==="rtl",e=Array.from(Array(this.max).keys());let i=0;return this.disabled||this.readonly?i=this.value:i=this.isHovering?this.hoverValue:this.value,N`
      <div
        part="base"
        class=${j({rating:!0,"rating--readonly":this.readonly,"rating--disabled":this.disabled,"rating--rtl":t})}
        role="slider"
        aria-label=${this.label}
        aria-disabled=${this.disabled?"true":"false"}
        aria-readonly=${this.readonly?"true":"false"}
        aria-valuenow=${this.value}
        aria-valuemin=${0}
        aria-valuemax=${this.max}
        tabindex=${this.disabled||this.readonly?"-1":"0"}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mouseenter=${this.handleMouseEnter}
        @touchstart=${this.handleTouchStart}
        @mouseleave=${this.handleMouseLeave}
        @touchend=${this.handleTouchEnd}
        @mousemove=${this.handleMouseMove}
        @touchmove=${this.handleTouchMove}
      >
        <span class="rating__symbols">
          ${e.map(r=>i>r&&i<r+1?N`
                <span
                  class=${j({rating__symbol:!0,"rating__partial-symbol-container":!0,"rating__symbol--hover":this.isHovering&&Math.ceil(i)===r+1})}
                  role="presentation"
                >
                  <div
                    style=${He({clipPath:t?`inset(0 ${(i-r)*100}% 0 0)`:`inset(0 0 0 ${(i-r)*100}%)`})}
                  >
                    ${js(this.getSymbol(r+1))}
                  </div>
                  <div
                    class="rating__partial--filled"
                    style=${He({clipPath:t?`inset(0 0 0 ${100-(i-r)*100}%)`:`inset(0 ${100-(i-r)*100}% 0 0)`})}
                  >
                    ${js(this.getSymbol(r+1))}
                  </div>
                </span>
              `:N`
              <span
                class=${j({rating__symbol:!0,"rating__symbol--hover":this.isHovering&&Math.ceil(i)===r+1,"rating__symbol--active":i>=r+1})}
                role="presentation"
              >
                ${js(this.getSymbol(r+1))}
              </span>
            `)}
        </span>
      </div>
    `}};Be.styles=[H,$p];Be.dependencies={"sl-icon":fe};m([R(".rating")],Be.prototype,"rating",2);m([V()],Be.prototype,"hoverValue",2);m([V()],Be.prototype,"isHovering",2);m([k()],Be.prototype,"label",2);m([k({type:Number})],Be.prototype,"value",2);m([k({type:Number})],Be.prototype,"max",2);m([k({type:Number})],Be.prototype,"precision",2);m([k({type:Boolean,reflect:!0})],Be.prototype,"readonly",2);m([k({type:Boolean,reflect:!0})],Be.prototype,"disabled",2);m([k()],Be.prototype,"getSymbol",2);m([is({passive:!0})],Be.prototype,"handleTouchMove",1);m([M("hoverValue")],Be.prototype,"handleHoverValueChange",1);m([M("isHovering")],Be.prototype,"handleIsHoveringChange",1);Be.define("sl-rating");var Lp=[{max:276e4,value:6e4,unit:"minute"},{max:72e6,value:36e5,unit:"hour"},{max:5184e5,value:864e5,unit:"day"},{max:24192e5,value:6048e5,unit:"week"},{max:28512e6,value:2592e6,unit:"month"},{max:1/0,value:31536e6,unit:"year"}],Pi=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.isoTime="",this.relativeTime="",this.date=new Date,this.format="long",this.numeric="auto",this.sync=!1}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.updateTimeout)}render(){const t=new Date,e=new Date(this.date);if(isNaN(e.getMilliseconds()))return this.relativeTime="",this.isoTime="","";const i=e.getTime()-t.getTime(),{unit:r,value:s}=Lp.find(n=>Math.abs(i)<n.max);if(this.isoTime=e.toISOString(),this.relativeTime=this.localize.relativeTime(Math.round(i/s),r,{numeric:this.numeric,style:this.format}),clearTimeout(this.updateTimeout),this.sync){let n;r==="minute"?n=_s("second"):r==="hour"?n=_s("minute"):r==="day"?n=_s("hour"):n=_s("day"),this.updateTimeout=window.setTimeout(()=>this.requestUpdate(),n)}return N` <time datetime=${this.isoTime}>${this.relativeTime}</time> `}};m([V()],Pi.prototype,"isoTime",2);m([V()],Pi.prototype,"relativeTime",2);m([k()],Pi.prototype,"date",2);m([k()],Pi.prototype,"format",2);m([k()],Pi.prototype,"numeric",2);m([k({type:Boolean})],Pi.prototype,"sync",2);function _s(t){const i={second:1e3,minute:6e4,hour:36e5,day:864e5}[t];return i-Date.now()%i}Pi.define("sl-relative-time");var cd=U`
  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }

  .button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition:
      var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
  }

  .button::-moz-focus-inner {
    border: 0;
  }

  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When disabled, prevent mouse events from bubbling up from children */
  .button--disabled * {
    pointer-events: none;
  }

  .button__prefix,
  .button__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .button__label {
    display: inline-block;
  }

  .button__label::slotted(sl-icon) {
    vertical-align: -2px;
  }

  /*
   * Standard buttons
   */

  /* Default */
  .button--standard.button--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--standard.button--default:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-300);
    color: var(--sl-color-primary-700);
  }

  .button--standard.button--default:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  /* Primary */
  .button--standard.button--primary {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--standard.button--success {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:hover:not(.button--disabled) {
    background-color: var(--sl-color-success-500);
    border-color: var(--sl-color-success-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:active:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--standard.button--neutral {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:hover:not(.button--disabled) {
    background-color: var(--sl-color-neutral-500);
    border-color: var(--sl-color-neutral-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:active:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--standard.button--warning {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }
  .button--standard.button--warning:hover:not(.button--disabled) {
    background-color: var(--sl-color-warning-500);
    border-color: var(--sl-color-warning-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--warning:active:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--standard.button--danger {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:hover:not(.button--disabled) {
    background-color: var(--sl-color-danger-500);
    border-color: var(--sl-color-danger-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:active:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /*
   * Outline buttons
   */

  .button--outline {
    background: none;
    border: solid 1px;
  }

  /* Default */
  .button--outline.button--default {
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--outline.button--default:hover:not(.button--disabled),
  .button--outline.button--default.button--checked:not(.button--disabled) {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--default:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Primary */
  .button--outline.button--primary {
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-primary-600);
  }

  .button--outline.button--primary:hover:not(.button--disabled),
  .button--outline.button--primary.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--primary:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--outline.button--success {
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-success-600);
  }

  .button--outline.button--success:hover:not(.button--disabled),
  .button--outline.button--success.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--success:active:not(.button--disabled) {
    border-color: var(--sl-color-success-700);
    background-color: var(--sl-color-success-700);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--outline.button--neutral {
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-600);
  }

  .button--outline.button--neutral:hover:not(.button--disabled),
  .button--outline.button--neutral.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--neutral:active:not(.button--disabled) {
    border-color: var(--sl-color-neutral-700);
    background-color: var(--sl-color-neutral-700);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--outline.button--warning {
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-warning-600);
  }

  .button--outline.button--warning:hover:not(.button--disabled),
  .button--outline.button--warning.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--warning:active:not(.button--disabled) {
    border-color: var(--sl-color-warning-700);
    background-color: var(--sl-color-warning-700);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--outline.button--danger {
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-danger-600);
  }

  .button--outline.button--danger:hover:not(.button--disabled),
  .button--outline.button--danger.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--danger:active:not(.button--disabled) {
    border-color: var(--sl-color-danger-700);
    background-color: var(--sl-color-danger-700);
    color: var(--sl-color-neutral-0);
  }

  @media (forced-colors: active) {
    .button.button--outline.button--checked:not(.button--disabled) {
      outline: solid 2px transparent;
    }
  }

  /*
   * Text buttons
   */

  .button--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-600);
  }

  .button--text:hover:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:focus-visible:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:active:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-700);
  }

  /*
   * Size modifiers
   */

  .button--small {
    height: auto;
    min-height: var(--sl-input-height-small);
    font-size: var(--sl-button-font-size-small);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
  }

  .button--medium {
    height: auto;
    min-height: var(--sl-input-height-medium);
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
  }

  .button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
  }

  /*
   * Pill modifier
   */

  .button--pill.button--small {
    border-radius: var(--sl-input-height-small);
  }

  .button--pill.button--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .button--pill.button--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Circle modifier
   */

  .button--circle {
    padding-left: 0;
    padding-right: 0;
  }

  .button--circle.button--small {
    width: var(--sl-input-height-small);
    border-radius: 50%;
  }

  .button--circle.button--medium {
    width: var(--sl-input-height-medium);
    border-radius: 50%;
  }

  .button--circle.button--large {
    width: var(--sl-input-height-large);
    border-radius: 50%;
  }

  .button--circle .button__prefix,
  .button--circle .button__suffix,
  .button--circle .button__caret {
    display: none;
  }

  /*
   * Caret modifier
   */

  .button--caret .button__suffix {
    display: none;
  }

  .button--caret .button__caret {
    height: auto;
  }

  /*
   * Loading modifier
   */

  .button--loading {
    position: relative;
    cursor: wait;
  }

  .button--loading .button__prefix,
  .button--loading .button__label,
  .button--loading .button__suffix,
  .button--loading .button__caret {
    visibility: hidden;
  }

  .button--loading sl-spinner {
    --indicator-color: currentColor;
    position: absolute;
    font-size: 1em;
    height: 1em;
    width: 1em;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
  }

  /*
   * Badges
   */

  .button ::slotted(sl-badge) {
    position: absolute;
    top: 0;
    right: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  .button--rtl ::slotted(sl-badge) {
    right: auto;
    left: 0;
    translate: -50% -50%;
  }

  /*
   * Button spacing
   */

  .button--has-label.button--small .button__label {
    padding: 0 var(--sl-spacing-small);
  }

  .button--has-label.button--medium .button__label {
    padding: 0 var(--sl-spacing-medium);
  }

  .button--has-label.button--large .button__label {
    padding: 0 var(--sl-spacing-large);
  }

  .button--has-prefix.button--small {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--small .button__label {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--medium {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--medium .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-suffix.button--small,
  .button--caret.button--small {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--small .button__label,
  .button--caret.button--small .button__label {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--medium,
  .button--caret.button--medium {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--medium .button__label,
  .button--caret.button--medium .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large,
  .button--caret.button--large {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large .button__label,
  .button--caret.button--large .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  /*
   * Button groups support a variety of button types (e.g. buttons with tooltips, buttons as dropdown triggers, etc.).
   * This means buttons aren't always direct descendants of the button group, thus we can't target them with the
   * ::slotted selector. To work around this, the button group component does some magic to add these special classes to
   * buttons and we style them here instead.
   */

  :host([data-sl-button-group__button--first]:not([data-sl-button-group__button--last])) .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([data-sl-button-group__button--inner]) .button {
    border-radius: 0;
  }

  :host([data-sl-button-group__button--last]:not([data-sl-button-group__button--first])) .button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* All except the first */
  :host([data-sl-button-group__button]:not([data-sl-button-group__button--first])) {
    margin-inline-start: calc(-1 * var(--sl-input-border-width));
  }

  /* Add a visual separator between solid buttons */
  :host(
      [data-sl-button-group__button]:not(
          [data-sl-button-group__button--first],
          [data-sl-button-group__button--radio],
          [variant='default']
        ):not(:hover)
    )
    .button:after {
    content: '';
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    border-left: solid 1px rgb(128 128 128 / 33%);
    mix-blend-mode: multiply;
  }

  /* Bump hovered, focused, and checked buttons up so their focus ring isn't clipped */
  :host([data-sl-button-group__button--hover]) {
    z-index: 1;
  }

  /* Focus and checked are always on top */
  :host([data-sl-button-group__button--focus]),
  :host([data-sl-button-group__button][checked]) {
    z-index: 2;
  }
`,Np=U`
  ${cd}

  .button__prefix,
  .button__suffix,
  .button__label {
    display: inline-flex;
    position: relative;
    align-items: center;
  }

  /* We use a hidden input so constraint validation errors work, since they don't appear to show when used with buttons.
    We can't actually hide it, though, otherwise the messages will be suppressed by the browser. */
  .hidden-input {
    all: unset;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    outline: dotted 1px red;
    opacity: 0;
    z-index: -1;
  }
`,_t=class extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"[default]","prefix","suffix"),this.hasFocus=!1,this.checked=!1,this.disabled=!1,this.size="medium",this.pill=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","presentation")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleClick(t){if(this.disabled){t.preventDefault(),t.stopPropagation();return}this.checked=!0}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}focus(t){this.input.focus(t)}blur(){this.input.blur()}render(){return Fr`
      <div part="base" role="presentation">
        <button
          part="${`button${this.checked?" button--checked":""}`}"
          role="radio"
          aria-checked="${this.checked}"
          class=${j({button:!0,"button--default":!0,"button--small":this.size==="small","button--medium":this.size==="medium","button--large":this.size==="large","button--checked":this.checked,"button--disabled":this.disabled,"button--focused":this.hasFocus,"button--outline":!0,"button--pill":this.pill,"button--has-label":this.hasSlotController.test("[default]"),"button--has-prefix":this.hasSlotController.test("prefix"),"button--has-suffix":this.hasSlotController.test("suffix")})}
          aria-disabled=${this.disabled}
          type="button"
          value=${F(this.value)}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @click=${this.handleClick}
        >
          <slot name="prefix" part="prefix" class="button__prefix"></slot>
          <slot part="label" class="button__label"></slot>
          <slot name="suffix" part="suffix" class="button__suffix"></slot>
        </button>
      </div>
    `}};_t.styles=[H,Np];m([R(".button")],_t.prototype,"input",2);m([R(".hidden-input")],_t.prototype,"hiddenInput",2);m([V()],_t.prototype,"hasFocus",2);m([k({type:Boolean,reflect:!0})],_t.prototype,"checked",2);m([k()],_t.prototype,"value",2);m([k({type:Boolean,reflect:!0})],_t.prototype,"disabled",2);m([k({reflect:!0})],_t.prototype,"size",2);m([k({type:Boolean,reflect:!0})],_t.prototype,"pill",2);m([M("disabled",{waitUntilFirstUpdate:!0})],_t.prototype,"handleDisabledChange",1);_t.define("sl-radio-button");var Dp=U`
  :host {
    display: block;
  }

  .form-control {
    position: relative;
    border: none;
    padding: 0;
    margin: 0;
  }

  .form-control__label {
    padding: 0;
  }

  .radio-group--required .radio-group__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`,Pp=U`
  :host {
    display: inline-block;
  }

  .button-group {
    display: flex;
    flex-wrap: nowrap;
  }
`,Mi=class extends q{constructor(){super(...arguments),this.disableRole=!1,this.label=""}handleFocus(t){const e=$r(t.target);e?.toggleAttribute("data-sl-button-group__button--focus",!0)}handleBlur(t){const e=$r(t.target);e?.toggleAttribute("data-sl-button-group__button--focus",!1)}handleMouseOver(t){const e=$r(t.target);e?.toggleAttribute("data-sl-button-group__button--hover",!0)}handleMouseOut(t){const e=$r(t.target);e?.toggleAttribute("data-sl-button-group__button--hover",!1)}handleSlotChange(){const t=[...this.defaultSlot.assignedElements({flatten:!0})];t.forEach(e=>{const i=t.indexOf(e),r=$r(e);r&&(r.toggleAttribute("data-sl-button-group__button",!0),r.toggleAttribute("data-sl-button-group__button--first",i===0),r.toggleAttribute("data-sl-button-group__button--inner",i>0&&i<t.length-1),r.toggleAttribute("data-sl-button-group__button--last",i===t.length-1),r.toggleAttribute("data-sl-button-group__button--radio",r.tagName.toLowerCase()==="sl-radio-button"))})}render(){return N`
      <div
        part="base"
        class="button-group"
        role="${this.disableRole?"presentation":"group"}"
        aria-label=${this.label}
        @focusout=${this.handleBlur}
        @focusin=${this.handleFocus}
        @mouseover=${this.handleMouseOver}
        @mouseout=${this.handleMouseOut}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `}};Mi.styles=[H,Pp];m([R("slot")],Mi.prototype,"defaultSlot",2);m([V()],Mi.prototype,"disableRole",2);m([k()],Mi.prototype,"label",2);function $r(t){var e;const i="sl-button, sl-radio-button";return(e=t.closest(i))!=null?e:t.querySelector(i)}var Pe=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this),this.hasSlotController=new Ve(this,"help-text","label"),this.customValidityMessage="",this.hasButtonGroup=!1,this.errorMessage="",this.defaultValue="",this.label="",this.helpText="",this.name="option",this.value="",this.size="medium",this.form="",this.required=!1}get validity(){const t=this.required&&!this.value;return this.customValidityMessage!==""?yf:t?gf:hn}get validationMessage(){const t=this.required&&!this.value;return this.customValidityMessage!==""?this.customValidityMessage:t?this.validationInput.validationMessage:""}connectedCallback(){super.connectedCallback(),this.defaultValue=this.value}firstUpdated(){this.formControlController.updateValidity()}getAllRadios(){return[...this.querySelectorAll("sl-radio, sl-radio-button")]}handleRadioClick(t){const e=t.target.closest("sl-radio, sl-radio-button"),i=this.getAllRadios(),r=this.value;!e||e.disabled||(this.value=e.value,i.forEach(s=>s.checked=s===e),this.value!==r&&(this.emit("sl-change"),this.emit("sl-input")))}handleKeyDown(t){var e;if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(t.key))return;const i=this.getAllRadios().filter(l=>!l.disabled),r=(e=i.find(l=>l.checked))!=null?e:i[0],s=t.key===" "?0:["ArrowUp","ArrowLeft"].includes(t.key)?-1:1,n=this.value;let o=i.indexOf(r)+s;o<0&&(o=i.length-1),o>i.length-1&&(o=0),this.getAllRadios().forEach(l=>{l.checked=!1,this.hasButtonGroup||l.setAttribute("tabindex","-1")}),this.value=i[o].value,i[o].checked=!0,this.hasButtonGroup?i[o].shadowRoot.querySelector("button").focus():(i[o].setAttribute("tabindex","0"),i[o].focus()),this.value!==n&&(this.emit("sl-change"),this.emit("sl-input")),t.preventDefault()}handleLabelClick(){this.focus()}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}async syncRadioElements(){var t,e;const i=this.getAllRadios();if(await Promise.all(i.map(async r=>{await r.updateComplete,r.checked=r.value===this.value,r.size=this.size})),this.hasButtonGroup=i.some(r=>r.tagName.toLowerCase()==="sl-radio-button"),i.length>0&&!i.some(r=>r.checked))if(this.hasButtonGroup){const r=(t=i[0].shadowRoot)==null?void 0:t.querySelector("button");r&&r.setAttribute("tabindex","0")}else i[0].setAttribute("tabindex","0");if(this.hasButtonGroup){const r=(e=this.shadowRoot)==null?void 0:e.querySelector("sl-button-group");r&&(r.disableRole=!0)}}syncRadios(){if(customElements.get("sl-radio")&&customElements.get("sl-radio-button")){this.syncRadioElements();return}customElements.get("sl-radio")?this.syncRadioElements():customElements.whenDefined("sl-radio").then(()=>this.syncRadios()),customElements.get("sl-radio-button")?this.syncRadioElements():customElements.whenDefined("sl-radio-button").then(()=>this.syncRadios())}updateCheckedRadio(){this.getAllRadios().forEach(e=>e.checked=e.value===this.value),this.formControlController.setValidity(this.validity.valid)}handleSizeChange(){this.syncRadios()}handleValueChange(){this.hasUpdated&&this.updateCheckedRadio()}checkValidity(){const t=this.required&&!this.value,e=this.customValidityMessage!=="";return t||e?(this.formControlController.emitInvalidEvent(),!1):!0}getForm(){return this.formControlController.getForm()}reportValidity(){const t=this.validity.valid;return this.errorMessage=this.customValidityMessage||t?"":this.validationInput.validationMessage,this.formControlController.setValidity(t),this.validationInput.hidden=!0,clearTimeout(this.validationTimeout),t||(this.validationInput.hidden=!1,this.validationInput.reportValidity(),this.validationTimeout=setTimeout(()=>this.validationInput.hidden=!0,1e4)),t}setCustomValidity(t=""){this.customValidityMessage=t,this.errorMessage=t,this.validationInput.setCustomValidity(t),this.formControlController.updateValidity()}focus(t){const e=this.getAllRadios(),i=e.find(n=>n.checked),r=e.find(n=>!n.disabled),s=i||r;s&&s.focus(t)}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),i=this.label?!0:!!t,r=this.helpText?!0:!!e,s=N`
      <slot @slotchange=${this.syncRadios} @click=${this.handleRadioClick} @keydown=${this.handleKeyDown}></slot>
    `;return N`
      <fieldset
        part="form-control"
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--radio-group":!0,"form-control--has-label":i,"form-control--has-help-text":r})}
        role="radiogroup"
        aria-labelledby="label"
        aria-describedby="help-text"
        aria-errormessage="error-message"
      >
        <label
          part="form-control-label"
          id="label"
          class="form-control__label"
          aria-hidden=${i?"false":"true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div class="visually-hidden">
            <div id="error-message" aria-live="assertive">${this.errorMessage}</div>
            <label class="radio-group__validation">
              <input
                type="text"
                class="radio-group__validation-input"
                ?required=${this.required}
                tabindex="-1"
                hidden
                @invalid=${this.handleInvalid}
              />
            </label>
          </div>

          ${this.hasButtonGroup?N`
                <sl-button-group part="button-group" exportparts="base:button-group__base" role="presentation">
                  ${s}
                </sl-button-group>
              `:s}
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </fieldset>
    `}};Pe.styles=[H,Ni,Dp];Pe.dependencies={"sl-button-group":Mi};m([R("slot:not([name])")],Pe.prototype,"defaultSlot",2);m([R(".radio-group__validation-input")],Pe.prototype,"validationInput",2);m([V()],Pe.prototype,"hasButtonGroup",2);m([V()],Pe.prototype,"errorMessage",2);m([V()],Pe.prototype,"defaultValue",2);m([k()],Pe.prototype,"label",2);m([k({attribute:"help-text"})],Pe.prototype,"helpText",2);m([k()],Pe.prototype,"name",2);m([k({reflect:!0})],Pe.prototype,"value",2);m([k({reflect:!0})],Pe.prototype,"size",2);m([k({reflect:!0})],Pe.prototype,"form",2);m([k({type:Boolean,reflect:!0})],Pe.prototype,"required",2);m([M("size",{waitUntilFirstUpdate:!0})],Pe.prototype,"handleSizeChange",1);m([M("value")],Pe.prototype,"handleValueChange",1);Pe.define("sl-radio-group");var Mp=U`
  :host {
    --size: 128px;
    --track-width: 4px;
    --track-color: var(--sl-color-neutral-200);
    --indicator-width: var(--track-width);
    --indicator-color: var(--sl-color-primary-600);
    --indicator-transition-duration: 0.35s;

    display: inline-flex;
  }

  .progress-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .progress-ring__image {
    width: var(--size);
    height: var(--size);
    rotate: -90deg;
    transform-origin: 50% 50%;
  }

  .progress-ring__track,
  .progress-ring__indicator {
    --radius: calc(var(--size) / 2 - max(var(--track-width), var(--indicator-width)) * 0.5);
    --circumference: calc(var(--radius) * 2 * 3.141592654);

    fill: none;
    r: var(--radius);
    cx: calc(var(--size) / 2);
    cy: calc(var(--size) / 2);
  }

  .progress-ring__track {
    stroke: var(--track-color);
    stroke-width: var(--track-width);
  }

  .progress-ring__indicator {
    stroke: var(--indicator-color);
    stroke-width: var(--indicator-width);
    stroke-linecap: round;
    transition-property: stroke-dashoffset;
    transition-duration: var(--indicator-transition-duration);
    stroke-dasharray: var(--circumference) var(--circumference);
    stroke-dashoffset: calc(var(--circumference) - var(--percentage) * var(--circumference));
  }

  .progress-ring__label {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    user-select: none;
    -webkit-user-select: none;
  }
`,fr=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.value=0,this.label=""}updated(t){if(super.updated(t),t.has("value")){const e=parseFloat(getComputedStyle(this.indicator).getPropertyValue("r")),i=2*Math.PI*e,r=i-this.value/100*i;this.indicatorOffset=`${r}px`}}render(){return N`
      <div
        part="base"
        class="progress-ring"
        role="progressbar"
        aria-label=${this.label.length>0?this.label:this.localize.term("progress")}
        aria-describedby="label"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${this.value}"
        style="--percentage: ${this.value/100}"
      >
        <svg class="progress-ring__image">
          <circle class="progress-ring__track"></circle>
          <circle class="progress-ring__indicator" style="stroke-dashoffset: ${this.indicatorOffset}"></circle>
        </svg>

        <slot id="label" part="label" class="progress-ring__label"></slot>
      </div>
    `}};fr.styles=[H,Mp];m([R(".progress-ring__indicator")],fr.prototype,"indicator",2);m([V()],fr.prototype,"indicatorOffset",2);m([k({type:Number,reflect:!0})],fr.prototype,"value",2);m([k()],fr.prototype,"label",2);fr.define("sl-progress-ring");var zp=U`
  :host {
    display: inline-block;
  }
`;let dd=null;class hd{}hd.render=function(t,e){dd(t,e)};self.QrCreator=hd;(function(t){function e(l,u,c,h){var f={},a=t(c,u);a.u(l),a.J(),h=h||0;var d=a.h(),p=a.h()+2*h;return f.text=l,f.level=u,f.version=c,f.O=p,f.a=function(b,w){return b-=h,w-=h,0>b||b>=d||0>w||w>=d?!1:a.a(b,w)},f}function i(l,u,c,h,f,a,d,p,b,w){function g(x,_,v,y,S,C,A){x?(l.lineTo(_+C,v+A),l.arcTo(_,v,y,S,a)):l.lineTo(_,v)}d?l.moveTo(u+a,c):l.moveTo(u,c),g(p,h,c,h,f,-a,0),g(b,h,f,u,f,0,-a),g(w,u,f,u,c,a,0),g(d,u,c,h,c,0,a)}function r(l,u,c,h,f,a,d,p,b,w){function g(x,_,v,y){l.moveTo(x+v,_),l.lineTo(x,_),l.lineTo(x,_+y),l.arcTo(x,_,x+v,_,a)}d&&g(u,c,a,a),p&&g(h,c,-a,a),b&&g(h,f,-a,-a),w&&g(u,f,a,-a)}function s(l,u){var c=u.fill;if(typeof c=="string")l.fillStyle=c;else{var h=c.type,f=c.colorStops;if(c=c.position.map(d=>Math.round(d*u.size)),h==="linear-gradient")var a=l.createLinearGradient.apply(l,c);else if(h==="radial-gradient")a=l.createRadialGradient.apply(l,c);else throw Error("Unsupported fill");f.forEach(([d,p])=>{a.addColorStop(d,p)}),l.fillStyle=a}}function n(l,u){e:{var c=u.text,h=u.v,f=u.N,a=u.K,d=u.P;for(f=Math.max(1,f||1),a=Math.min(40,a||40);f<=a;f+=1)try{var p=e(c,h,f,d);break e}catch{}p=void 0}if(!p)return null;for(c=l.getContext("2d"),u.background&&(c.fillStyle=u.background,c.fillRect(u.left,u.top,u.size,u.size)),h=p.O,a=u.size/h,c.beginPath(),d=0;d<h;d+=1)for(f=0;f<h;f+=1){var b=c,w=u.left+f*a,g=u.top+d*a,x=d,_=f,v=p.a,y=w+a,S=g+a,C=x-1,A=x+1,T=_-1,$=_+1,E=Math.floor(Math.min(.5,Math.max(0,u.R))*a),O=v(x,_),D=v(C,T),z=v(C,_);C=v(C,$);var I=v(x,$);$=v(A,$),_=v(A,_),A=v(A,T),x=v(x,T),w=Math.round(w),g=Math.round(g),y=Math.round(y),S=Math.round(S),O?i(b,w,g,y,S,E,!z&&!x,!z&&!I,!_&&!I,!_&&!x):r(b,w,g,y,S,E,z&&x&&D,z&&I&&C,_&&I&&$,_&&x&&A)}return s(c,u),c.fill(),l}var o={minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:.5,quiet:0};dd=function(l,u){var c={};Object.assign(c,o,l),c.N=c.minVersion,c.K=c.maxVersion,c.v=c.ecLevel,c.left=c.left,c.top=c.top,c.size=c.size,c.fill=c.fill,c.background=c.background,c.text=c.text,c.R=c.radius,c.P=c.quiet,u instanceof HTMLCanvasElement?((u.width!==c.size||u.height!==c.size)&&(u.width=c.size,u.height=c.size),u.getContext("2d").clearRect(0,0,u.width,u.height),n(u,c)):(l=document.createElement("canvas"),l.width=c.size,l.height=c.size,c=n(l,c),u.appendChild(c))}})((function(){function t(u){var c=i.s(u);return{S:function(){return 4},b:function(){return c.length},write:function(h){for(var f=0;f<c.length;f+=1)h.put(c[f],8)}}}function e(){var u=[],c=0,h={B:function(){return u},c:function(f){return(u[Math.floor(f/8)]>>>7-f%8&1)==1},put:function(f,a){for(var d=0;d<a;d+=1)h.m((f>>>a-d-1&1)==1)},f:function(){return c},m:function(f){var a=Math.floor(c/8);u.length<=a&&u.push(0),f&&(u[a]|=128>>>c%8),c+=1}};return h}function i(u,c){function h(x,_){for(var v=-1;7>=v;v+=1)if(!(-1>=x+v||p<=x+v))for(var y=-1;7>=y;y+=1)-1>=_+y||p<=_+y||(d[x+v][_+y]=0<=v&&6>=v&&(y==0||y==6)||0<=y&&6>=y&&(v==0||v==6)||2<=v&&4>=v&&2<=y&&4>=y)}function f(x,_){for(var v=p=4*u+17,y=Array(v),S=0;S<v;S+=1){y[S]=Array(v);for(var C=0;C<v;C+=1)y[S][C]=null}for(d=y,h(0,0),h(p-7,0),h(0,p-7),v=n.G(u),y=0;y<v.length;y+=1)for(S=0;S<v.length;S+=1){C=v[y];var A=v[S];if(d[C][A]==null)for(var T=-2;2>=T;T+=1)for(var $=-2;2>=$;$+=1)d[C+T][A+$]=T==-2||T==2||$==-2||$==2||T==0&&$==0}for(v=8;v<p-8;v+=1)d[v][6]==null&&(d[v][6]=v%2==0);for(v=8;v<p-8;v+=1)d[6][v]==null&&(d[6][v]=v%2==0);for(v=n.w(a<<3|_),y=0;15>y;y+=1)S=!x&&(v>>y&1)==1,d[6>y?y:8>y?y+1:p-15+y][8]=S,d[8][8>y?p-y-1:9>y?15-y:14-y]=S;if(d[p-8][8]=!x,7<=u){for(v=n.A(u),y=0;18>y;y+=1)S=!x&&(v>>y&1)==1,d[Math.floor(y/3)][y%3+p-8-3]=S;for(y=0;18>y;y+=1)S=!x&&(v>>y&1)==1,d[y%3+p-8-3][Math.floor(y/3)]=S}if(b==null){for(x=l.I(u,a),v=e(),y=0;y<w.length;y+=1)S=w[y],v.put(4,4),v.put(S.b(),n.f(4,u)),S.write(v);for(y=S=0;y<x.length;y+=1)S+=x[y].j;if(v.f()>8*S)throw Error("code length overflow. ("+v.f()+">"+8*S+")");for(v.f()+4<=8*S&&v.put(0,4);v.f()%8!=0;)v.m(!1);for(;!(v.f()>=8*S)&&(v.put(236,8),!(v.f()>=8*S));)v.put(17,8);var E=0;for(S=y=0,C=Array(x.length),A=Array(x.length),T=0;T<x.length;T+=1){var O=x[T].j,D=x[T].o-O;for(y=Math.max(y,O),S=Math.max(S,D),C[T]=Array(O),$=0;$<C[T].length;$+=1)C[T][$]=255&v.B()[$+E];for(E+=O,$=n.C(D),O=r(C[T],$.b()-1).l($),A[T]=Array($.b()-1),$=0;$<A[T].length;$+=1)D=$+O.b()-A[T].length,A[T][$]=0<=D?O.c(D):0}for($=v=0;$<x.length;$+=1)v+=x[$].o;for(v=Array(v),$=E=0;$<y;$+=1)for(T=0;T<x.length;T+=1)$<C[T].length&&(v[E]=C[T][$],E+=1);for($=0;$<S;$+=1)for(T=0;T<x.length;T+=1)$<A[T].length&&(v[E]=A[T][$],E+=1);b=v}for(x=b,v=-1,y=p-1,S=7,C=0,_=n.F(_),A=p-1;0<A;A-=2)for(A==6&&--A;;){for(T=0;2>T;T+=1)d[y][A-T]==null&&($=!1,C<x.length&&($=(x[C]>>>S&1)==1),_(y,A-T)&&($=!$),d[y][A-T]=$,--S,S==-1&&(C+=1,S=7));if(y+=v,0>y||p<=y){y-=v,v=-v;break}}}var a=s[c],d=null,p=0,b=null,w=[],g={u:function(x){x=t(x),w.push(x),b=null},a:function(x,_){if(0>x||p<=x||0>_||p<=_)throw Error(x+","+_);return d[x][_]},h:function(){return p},J:function(){for(var x=0,_=0,v=0;8>v;v+=1){f(!0,v);var y=n.D(g);(v==0||x>y)&&(x=y,_=v)}f(!1,_)}};return g}function r(u,c){if(typeof u.length>"u")throw Error(u.length+"/"+c);var h=(function(){for(var a=0;a<u.length&&u[a]==0;)a+=1;for(var d=Array(u.length-a+c),p=0;p<u.length-a;p+=1)d[p]=u[p+a];return d})(),f={c:function(a){return h[a]},b:function(){return h.length},multiply:function(a){for(var d=Array(f.b()+a.b()-1),p=0;p<f.b();p+=1)for(var b=0;b<a.b();b+=1)d[p+b]^=o.i(o.g(f.c(p))+o.g(a.c(b)));return r(d,0)},l:function(a){if(0>f.b()-a.b())return f;for(var d=o.g(f.c(0))-o.g(a.c(0)),p=Array(f.b()),b=0;b<f.b();b+=1)p[b]=f.c(b);for(b=0;b<a.b();b+=1)p[b]^=o.i(o.g(a.c(b))+d);return r(p,0).l(a)}};return f}i.s=function(u){for(var c=[],h=0;h<u.length;h++){var f=u.charCodeAt(h);128>f?c.push(f):2048>f?c.push(192|f>>6,128|f&63):55296>f||57344<=f?c.push(224|f>>12,128|f>>6&63,128|f&63):(h++,f=65536+((f&1023)<<10|u.charCodeAt(h)&1023),c.push(240|f>>18,128|f>>12&63,128|f>>6&63,128|f&63))}return c};var s={L:1,M:0,Q:3,H:2},n=(function(){function u(f){for(var a=0;f!=0;)a+=1,f>>>=1;return a}var c=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],h={w:function(f){for(var a=f<<10;0<=u(a)-u(1335);)a^=1335<<u(a)-u(1335);return(f<<10|a)^21522},A:function(f){for(var a=f<<12;0<=u(a)-u(7973);)a^=7973<<u(a)-u(7973);return f<<12|a},G:function(f){return c[f-1]},F:function(f){switch(f){case 0:return function(a,d){return(a+d)%2==0};case 1:return function(a){return a%2==0};case 2:return function(a,d){return d%3==0};case 3:return function(a,d){return(a+d)%3==0};case 4:return function(a,d){return(Math.floor(a/2)+Math.floor(d/3))%2==0};case 5:return function(a,d){return a*d%2+a*d%3==0};case 6:return function(a,d){return(a*d%2+a*d%3)%2==0};case 7:return function(a,d){return(a*d%3+(a+d)%2)%2==0};default:throw Error("bad maskPattern:"+f)}},C:function(f){for(var a=r([1],0),d=0;d<f;d+=1)a=a.multiply(r([1,o.i(d)],0));return a},f:function(f,a){if(f!=4||1>a||40<a)throw Error("mode: "+f+"; type: "+a);return 10>a?8:16},D:function(f){for(var a=f.h(),d=0,p=0;p<a;p+=1)for(var b=0;b<a;b+=1){for(var w=0,g=f.a(p,b),x=-1;1>=x;x+=1)if(!(0>p+x||a<=p+x))for(var _=-1;1>=_;_+=1)0>b+_||a<=b+_||(x!=0||_!=0)&&g==f.a(p+x,b+_)&&(w+=1);5<w&&(d+=3+w-5)}for(p=0;p<a-1;p+=1)for(b=0;b<a-1;b+=1)w=0,f.a(p,b)&&(w+=1),f.a(p+1,b)&&(w+=1),f.a(p,b+1)&&(w+=1),f.a(p+1,b+1)&&(w+=1),(w==0||w==4)&&(d+=3);for(p=0;p<a;p+=1)for(b=0;b<a-6;b+=1)f.a(p,b)&&!f.a(p,b+1)&&f.a(p,b+2)&&f.a(p,b+3)&&f.a(p,b+4)&&!f.a(p,b+5)&&f.a(p,b+6)&&(d+=40);for(b=0;b<a;b+=1)for(p=0;p<a-6;p+=1)f.a(p,b)&&!f.a(p+1,b)&&f.a(p+2,b)&&f.a(p+3,b)&&f.a(p+4,b)&&!f.a(p+5,b)&&f.a(p+6,b)&&(d+=40);for(b=w=0;b<a;b+=1)for(p=0;p<a;p+=1)f.a(p,b)&&(w+=1);return d+=Math.abs(100*w/a/a-50)/5*10}};return h})(),o=(function(){for(var u=Array(256),c=Array(256),h=0;8>h;h+=1)u[h]=1<<h;for(h=8;256>h;h+=1)u[h]=u[h-4]^u[h-5]^u[h-6]^u[h-8];for(h=0;255>h;h+=1)c[u[h]]=h;return{g:function(f){if(1>f)throw Error("glog("+f+")");return c[f]},i:function(f){for(;0>f;)f+=255;for(;256<=f;)f-=255;return u[f]}}})(),l=(function(){function u(f,a){switch(a){case s.L:return c[4*(f-1)];case s.M:return c[4*(f-1)+1];case s.Q:return c[4*(f-1)+2];case s.H:return c[4*(f-1)+3]}}var c=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],h={I:function(f,a){var d=u(f,a);if(typeof d>"u")throw Error("bad rs block @ typeNumber:"+f+"/errorCorrectLevel:"+a);f=d.length/3,a=[];for(var p=0;p<f;p+=1)for(var b=d[3*p],w=d[3*p+1],g=d[3*p+2],x=0;x<b;x+=1){var _=g,v={};v.o=w,v.j=_,a.push(v)}return a}};return h})();return i})());const Rp=QrCreator;var kt=class extends q{constructor(){super(...arguments),this.value="",this.label="",this.size=128,this.fill="black",this.background="white",this.radius=0,this.errorCorrection="H"}firstUpdated(){this.generate()}generate(){this.hasUpdated&&Rp.render({text:this.value,radius:this.radius,ecLevel:this.errorCorrection,fill:this.fill,background:this.background,size:this.size*2},this.canvas)}render(){var t;return N`
      <canvas
        part="base"
        class="qr-code"
        role="img"
        aria-label=${((t=this.label)==null?void 0:t.length)>0?this.label:this.value}
        style=${He({width:`${this.size}px`,height:`${this.size}px`})}
      ></canvas>
    `}};kt.styles=[H,zp];m([R("canvas")],kt.prototype,"canvas",2);m([k()],kt.prototype,"value",2);m([k()],kt.prototype,"label",2);m([k({type:Number})],kt.prototype,"size",2);m([k()],kt.prototype,"fill",2);m([k()],kt.prototype,"background",2);m([k({type:Number})],kt.prototype,"radius",2);m([k({attribute:"error-correction"})],kt.prototype,"errorCorrection",2);m([M(["background","errorCorrection","fill","radius","size","value"])],kt.prototype,"generate",1);kt.define("sl-qr-code");var Bp=U`
  :host {
    display: block;
  }

  :host(:focus-visible) {
    outline: 0px;
  }

  .radio {
    display: inline-flex;
    align-items: top;
    font-family: var(--sl-input-font-family);
    font-size: var(--sl-input-font-size-medium);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .radio--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .radio--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .radio--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .radio__checked-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  .radio__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 50%;
    background-color: var(--sl-input-background-color);
    color: transparent;
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .radio__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Hover */
  .radio:not(.radio--checked):not(.radio--disabled) .radio__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Checked */
  .radio--checked .radio__control {
    color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked + hover */
  .radio.radio--checked:not(.radio--disabled) .radio__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked + focus */
  :host(:focus-visible) .radio__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .radio--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When the control isn't checked, hide the circle for Windows High Contrast mode a11y */
  .radio:not(.radio--checked) svg circle {
    opacity: 0;
  }

  .radio__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }
`,zt=class extends q{constructor(){super(),this.checked=!1,this.hasFocus=!1,this.size="medium",this.disabled=!1,this.handleBlur=()=>{this.hasFocus=!1,this.emit("sl-blur")},this.handleClick=()=>{this.disabled||(this.checked=!0)},this.handleFocus=()=>{this.hasFocus=!0,this.emit("sl-focus")},this.addEventListener("blur",this.handleBlur),this.addEventListener("click",this.handleClick),this.addEventListener("focus",this.handleFocus)}connectedCallback(){super.connectedCallback(),this.setInitialAttributes()}setInitialAttributes(){this.setAttribute("role","radio"),this.setAttribute("tabindex","-1"),this.setAttribute("aria-disabled",this.disabled?"true":"false")}handleCheckedChange(){this.setAttribute("aria-checked",this.checked?"true":"false"),this.setAttribute("tabindex",this.checked?"0":"-1")}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}render(){return N`
      <span
        part="base"
        class=${j({radio:!0,"radio--checked":this.checked,"radio--disabled":this.disabled,"radio--focused":this.hasFocus,"radio--small":this.size==="small","radio--medium":this.size==="medium","radio--large":this.size==="large"})}
      >
        <span part="${`control${this.checked?" control--checked":""}`}" class="radio__control">
          ${this.checked?N` <sl-icon part="checked-icon" class="radio__checked-icon" library="system" name="radio"></sl-icon> `:""}
        </span>

        <slot part="label" class="radio__label"></slot>
      </span>
    `}};zt.styles=[H,Bp];zt.dependencies={"sl-icon":fe};m([V()],zt.prototype,"checked",2);m([V()],zt.prototype,"hasFocus",2);m([k()],zt.prototype,"value",2);m([k({reflect:!0})],zt.prototype,"size",2);m([k({type:Boolean,reflect:!0})],zt.prototype,"disabled",2);m([M("checked")],zt.prototype,"handleCheckedChange",1);m([M("disabled",{waitUntilFirstUpdate:!0})],zt.prototype,"handleDisabledChange",1);zt.define("sl-radio");var Fp=U`
  :host {
    display: block;
    user-select: none;
    -webkit-user-select: none;
  }

  :host(:focus) {
    outline: none;
  }

  .option {
    position: relative;
    display: flex;
    align-items: center;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-letter-spacing-normal);
    color: var(--sl-color-neutral-700);
    padding: var(--sl-spacing-x-small) var(--sl-spacing-medium) var(--sl-spacing-x-small) var(--sl-spacing-x-small);
    transition: var(--sl-transition-fast) fill;
    cursor: pointer;
  }

  .option--hover:not(.option--current):not(.option--disabled) {
    background-color: var(--sl-color-neutral-100);
    color: var(--sl-color-neutral-1000);
  }

  .option--current,
  .option--current.option--disabled {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
    opacity: 1;
  }

  .option--disabled {
    outline: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option__label {
    flex: 1 1 auto;
    display: inline-block;
    line-height: var(--sl-line-height-dense);
  }

  .option .option__check {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    padding-inline-end: var(--sl-spacing-2x-small);
  }

  .option--selected .option__check {
    visibility: visible;
  }

  .option__prefix,
  .option__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .option__prefix::slotted(*) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .option__suffix::slotted(*) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  @media (forced-colors: active) {
    :host(:hover:not([aria-disabled='true'])) .option {
      outline: dashed 1px SelectedItem;
      outline-offset: -1px;
    }
  }
`,ut=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.isInitialized=!1,this.current=!1,this.selected=!1,this.hasHover=!1,this.value="",this.disabled=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","option"),this.setAttribute("aria-selected","false")}handleDefaultSlotChange(){this.isInitialized?customElements.whenDefined("sl-select").then(()=>{const t=this.closest("sl-select");t&&t.handleDefaultSlotChange()}):this.isInitialized=!0}handleMouseEnter(){this.hasHover=!0}handleMouseLeave(){this.hasHover=!1}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}handleSelectedChange(){this.setAttribute("aria-selected",this.selected?"true":"false")}handleValueChange(){typeof this.value!="string"&&(this.value=String(this.value)),this.value.includes(" ")&&(console.error("Option values cannot include a space. All spaces have been replaced with underscores.",this),this.value=this.value.replace(/ /g,"_"))}getTextLabel(){const t=this.childNodes;let e="";return[...t].forEach(i=>{i.nodeType===Node.ELEMENT_NODE&&(i.hasAttribute("slot")||(e+=i.textContent)),i.nodeType===Node.TEXT_NODE&&(e+=i.textContent)}),e.trim()}render(){return N`
      <div
        part="base"
        class=${j({option:!0,"option--current":this.current,"option--disabled":this.disabled,"option--selected":this.selected,"option--hover":this.hasHover})}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <sl-icon part="checked-icon" class="option__check" name="check" library="system" aria-hidden="true"></sl-icon>
        <slot part="prefix" name="prefix" class="option__prefix"></slot>
        <slot part="label" class="option__label" @slotchange=${this.handleDefaultSlotChange}></slot>
        <slot part="suffix" name="suffix" class="option__suffix"></slot>
      </div>
    `}};ut.styles=[H,Fp];ut.dependencies={"sl-icon":fe};m([R(".option__label")],ut.prototype,"defaultSlot",2);m([V()],ut.prototype,"current",2);m([V()],ut.prototype,"selected",2);m([V()],ut.prototype,"hasHover",2);m([k({reflect:!0})],ut.prototype,"value",2);m([k({type:Boolean,reflect:!0})],ut.prototype,"disabled",2);m([M("disabled")],ut.prototype,"handleDisabledChange",1);m([M("selected")],ut.prototype,"handleSelectedChange",1);m([M("value")],ut.prototype,"handleValueChange",1);ut.define("sl-option");ae.define("sl-popup");var qp=U`
  :host {
    --height: 1rem;
    --track-color: var(--sl-color-neutral-200);
    --indicator-color: var(--sl-color-primary-600);
    --label-color: var(--sl-color-neutral-0);

    display: block;
  }

  .progress-bar {
    position: relative;
    background-color: var(--track-color);
    height: var(--height);
    border-radius: var(--sl-border-radius-pill);
    box-shadow: inset var(--sl-shadow-small);
    overflow: hidden;
  }

  .progress-bar__indicator {
    height: 100%;
    font-family: var(--sl-font-sans);
    font-size: 12px;
    font-weight: var(--sl-font-weight-normal);
    background-color: var(--indicator-color);
    color: var(--label-color);
    text-align: center;
    line-height: var(--height);
    white-space: nowrap;
    overflow: hidden;
    transition:
      400ms width,
      400ms background-color;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Indeterminate */
  .progress-bar--indeterminate .progress-bar__indicator {
    position: absolute;
    animation: indeterminate 2.5s infinite cubic-bezier(0.37, 0, 0.63, 1);
  }

  .progress-bar--indeterminate.progress-bar--rtl .progress-bar__indicator {
    animation-name: indeterminate-rtl;
  }

  @media (forced-colors: active) {
    .progress-bar {
      outline: solid 1px SelectedItem;
      background-color: var(--sl-color-neutral-0);
    }

    .progress-bar__indicator {
      outline: solid 1px SelectedItem;
      background-color: SelectedItem;
    }
  }

  @keyframes indeterminate {
    0% {
      left: -50%;
      width: 50%;
    }
    75%,
    100% {
      left: 100%;
      width: 50%;
    }
  }

  @keyframes indeterminate-rtl {
    0% {
      right: -50%;
      width: 50%;
    }
    75%,
    100% {
      right: 100%;
      width: 50%;
    }
  }
`,us=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.value=0,this.indeterminate=!1,this.label=""}render(){return N`
      <div
        part="base"
        class=${j({"progress-bar":!0,"progress-bar--indeterminate":this.indeterminate,"progress-bar--rtl":this.localize.dir()==="rtl"})}
        role="progressbar"
        title=${F(this.title)}
        aria-label=${this.label.length>0?this.label:this.localize.term("progress")}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this.indeterminate?0:this.value}
      >
        <div part="indicator" class="progress-bar__indicator" style=${He({width:`${this.value}%`})}>
          ${this.indeterminate?"":N` <slot part="label" class="progress-bar__label"></slot> `}
        </div>
      </div>
    `}};us.styles=[H,qp];m([k({type:Number,reflect:!0})],us.prototype,"value",2);m([k({type:Boolean,reflect:!0})],us.prototype,"indeterminate",2);m([k()],us.prototype,"label",2);us.define("sl-progress-bar");var Up=U`
  :host {
    display: block;
  }

  .menu-label {
    display: inline-block;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-letter-spacing-normal);
    color: var(--sl-color-neutral-500);
    padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-large);
    user-select: none;
    -webkit-user-select: none;
  }
`,fd=class extends q{render(){return N` <slot part="base" class="menu-label"></slot> `}};fd.styles=[H,Up];fd.define("sl-menu-label");var Vp=U`
  :host {
    display: contents;
  }
`,Rt=class extends q{constructor(){super(...arguments),this.attrOldValue=!1,this.charData=!1,this.charDataOldValue=!1,this.childList=!1,this.disabled=!1,this.handleMutation=t=>{this.emit("sl-mutation",{detail:{mutationList:t}})}}connectedCallback(){super.connectedCallback(),this.mutationObserver=new MutationObserver(this.handleMutation),this.disabled||this.startObserver()}disconnectedCallback(){super.disconnectedCallback(),this.stopObserver()}startObserver(){const t=typeof this.attr=="string"&&this.attr.length>0,e=t&&this.attr!=="*"?this.attr.split(" "):void 0;try{this.mutationObserver.observe(this,{subtree:!0,childList:this.childList,attributes:t,attributeFilter:e,attributeOldValue:this.attrOldValue,characterData:this.charData,characterDataOldValue:this.charDataOldValue})}catch{}}stopObserver(){this.mutationObserver.disconnect()}handleDisabledChange(){this.disabled?this.stopObserver():this.startObserver()}handleChange(){this.stopObserver(),this.startObserver()}render(){return N` <slot></slot> `}};Rt.styles=[H,Vp];m([k({reflect:!0})],Rt.prototype,"attr",2);m([k({attribute:"attr-old-value",type:Boolean,reflect:!0})],Rt.prototype,"attrOldValue",2);m([k({attribute:"char-data",type:Boolean,reflect:!0})],Rt.prototype,"charData",2);m([k({attribute:"char-data-old-value",type:Boolean,reflect:!0})],Rt.prototype,"charDataOldValue",2);m([k({attribute:"child-list",type:Boolean,reflect:!0})],Rt.prototype,"childList",2);m([k({type:Boolean,reflect:!0})],Rt.prototype,"disabled",2);m([M("disabled")],Rt.prototype,"handleDisabledChange",1);m([M("attr",{waitUntilFirstUpdate:!0}),M("attr-old-value",{waitUntilFirstUpdate:!0}),M("char-data",{waitUntilFirstUpdate:!0}),M("char-data-old-value",{waitUntilFirstUpdate:!0}),M("childList",{waitUntilFirstUpdate:!0})],Rt.prototype,"handleChange",1);Rt.define("sl-mutation-observer");var jp=U`
  :host {
    display: block;
  }

  .input {
    flex: 1 1 auto;
    display: inline-flex;
    align-items: stretch;
    justify-content: start;
    position: relative;
    width: 100%;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    overflow: hidden;
    cursor: text;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
  }

  /* Standard inputs */
  .input--standard {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .input--standard:hover:not(.input--disabled) {
    background-color: var(--sl-input-background-color-hover);
    border-color: var(--sl-input-border-color-hover);
  }

  .input--standard.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  .input--standard.input--focused:not(.input--disabled) .input__control {
    color: var(--sl-input-color-focus);
  }

  .input--standard.input--disabled {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input--standard.input--disabled .input__control {
    color: var(--sl-input-color-disabled);
  }

  .input--standard.input--disabled .input__control::placeholder {
    color: var(--sl-input-placeholder-color-disabled);
  }

  /* Filled inputs */
  .input--filled {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .input--filled:hover:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .input--filled.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .input--filled.input--disabled {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input__control {
    flex: 1 1 auto;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    min-width: 0;
    height: 100%;
    color: var(--sl-input-color);
    border: none;
    background: inherit;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: inherit;
    -webkit-appearance: none;
  }

  .input__control::-webkit-search-decoration,
  .input__control::-webkit-search-cancel-button,
  .input__control::-webkit-search-results-button,
  .input__control::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  .input__control:-webkit-autofill,
  .input__control:-webkit-autofill:hover,
  .input__control:-webkit-autofill:focus,
  .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-background-color-hover) inset !important;
    -webkit-text-fill-color: var(--sl-color-primary-500);
    caret-color: var(--sl-input-color);
  }

  .input--filled .input__control:-webkit-autofill,
  .input--filled .input__control:-webkit-autofill:hover,
  .input--filled .input__control:-webkit-autofill:focus,
  .input--filled .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-filled-background-color) inset !important;
  }

  .input__control::placeholder {
    color: var(--sl-input-placeholder-color);
    user-select: none;
    -webkit-user-select: none;
  }

  .input:hover:not(.input--disabled) .input__control {
    color: var(--sl-input-color-hover);
  }

  .input__control:focus {
    outline: none;
  }

  .input__prefix,
  .input__suffix {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    cursor: default;
  }

  .input__prefix ::slotted(sl-icon),
  .input__suffix ::slotted(sl-icon) {
    color: var(--sl-input-icon-color);
  }

  /*
   * Size modifiers
   */

  .input--small {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
    height: var(--sl-input-height-small);
  }

  .input--small .input__control {
    height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-small);
  }

  .input--small .input__clear,
  .input--small .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-small) * 2);
  }

  .input--small .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .input--small .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-small);
  }

  .input--medium {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
    height: var(--sl-input-height-medium);
  }

  .input--medium .input__control {
    height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-medium);
  }

  .input--medium .input__clear,
  .input--medium .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-medium) * 2);
  }

  .input--medium .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .input--medium .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-medium);
  }

  .input--large {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
    height: var(--sl-input-height-large);
  }

  .input--large .input__control {
    height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-large);
  }

  .input--large .input__clear,
  .input--large .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-large) * 2);
  }

  .input--large .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .input--large .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-large);
  }

  /*
   * Pill modifier
   */

  .input--pill.input--small {
    border-radius: var(--sl-input-height-small);
  }

  .input--pill.input--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .input--pill.input--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Clearable + Password Toggle
   */

  .input__clear,
  .input__password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--sl-input-icon-color);
    border: none;
    background: none;
    padding: 0;
    transition: var(--sl-transition-fast) color;
    cursor: pointer;
  }

  .input__clear:hover,
  .input__password-toggle:hover {
    color: var(--sl-input-icon-color-hover);
  }

  .input__clear:focus,
  .input__password-toggle:focus {
    outline: none;
  }

  /* Don't show the browser's password toggle in Edge */
  ::-ms-reveal {
    display: none;
  }

  /* Hide the built-in number spinner */
  .input--no-spin-buttons input[type='number']::-webkit-outer-spin-button,
  .input--no-spin-buttons input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }

  .input--no-spin-buttons input[type='number'] {
    -moz-appearance: textfield;
  }
`,Q=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new Ve(this,"help-text","label"),this.localize=new ie(this),this.hasFocus=!1,this.title="",this.__numberInput=Object.assign(document.createElement("input"),{type:"number"}),this.__dateInput=Object.assign(document.createElement("input"),{type:"date"}),this.type="text",this.name="",this.value="",this.defaultValue="",this.size="medium",this.filled=!1,this.pill=!1,this.label="",this.helpText="",this.clearable=!1,this.disabled=!1,this.placeholder="",this.readonly=!1,this.passwordToggle=!1,this.passwordVisible=!1,this.noSpinButtons=!1,this.form="",this.required=!1,this.spellcheck=!0}get valueAsDate(){var t;return this.__dateInput.type=this.type,this.__dateInput.value=this.value,((t=this.input)==null?void 0:t.valueAsDate)||this.__dateInput.valueAsDate}set valueAsDate(t){this.__dateInput.type=this.type,this.__dateInput.valueAsDate=t,this.value=this.__dateInput.value}get valueAsNumber(){var t;return this.__numberInput.value=this.value,((t=this.input)==null?void 0:t.valueAsNumber)||this.__numberInput.valueAsNumber}set valueAsNumber(t){this.__numberInput.valueAsNumber=t,this.value=this.__numberInput.value}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleChange(){this.value=this.input.value,this.emit("sl-change")}handleClearClick(t){t.preventDefault(),this.value!==""&&(this.value="",this.emit("sl-clear"),this.emit("sl-input"),this.emit("sl-change")),this.input.focus()}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleInput(){this.value=this.input.value,this.formControlController.updateValidity(),this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleKeyDown(t){const e=t.metaKey||t.ctrlKey||t.shiftKey||t.altKey;t.key==="Enter"&&!e&&setTimeout(()=>{!t.defaultPrevented&&!t.isComposing&&this.formControlController.submit()})}handlePasswordToggle(){this.passwordVisible=!this.passwordVisible}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleStepChange(){this.input.step=String(this.step),this.formControlController.updateValidity()}async handleValueChange(){await this.updateComplete,this.formControlController.updateValidity()}focus(t){this.input.focus(t)}blur(){this.input.blur()}select(){this.input.select()}setSelectionRange(t,e,i="none"){this.input.setSelectionRange(t,e,i)}setRangeText(t,e,i,r="preserve"){const s=e??this.input.selectionStart,n=i??this.input.selectionEnd;this.input.setRangeText(t,s,n,r),this.value!==this.input.value&&(this.value=this.input.value)}showPicker(){"showPicker"in HTMLInputElement.prototype&&this.input.showPicker()}stepUp(){this.input.stepUp(),this.value!==this.input.value&&(this.value=this.input.value)}stepDown(){this.input.stepDown(),this.value!==this.input.value&&(this.value=this.input.value)}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),i=this.label?!0:!!t,r=this.helpText?!0:!!e,n=this.clearable&&!this.disabled&&!this.readonly&&(typeof this.value=="number"||this.value.length>0);return N`
      <div
        part="form-control"
        class=${j({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":i,"form-control--has-help-text":r})}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${i?"false":"true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${j({input:!0,"input--small":this.size==="small","input--medium":this.size==="medium","input--large":this.size==="large","input--pill":this.pill,"input--standard":!this.filled,"input--filled":this.filled,"input--disabled":this.disabled,"input--focused":this.hasFocus,"input--empty":!this.value,"input--no-spin-buttons":this.noSpinButtons})}
          >
            <span part="prefix" class="input__prefix">
              <slot name="prefix"></slot>
            </span>

            <input
              part="input"
              id="input"
              class="input__control"
              type=${this.type==="password"&&this.passwordVisible?"text":this.type}
              title=${this.title}
              name=${F(this.name)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${F(this.placeholder)}
              minlength=${F(this.minlength)}
              maxlength=${F(this.maxlength)}
              min=${F(this.min)}
              max=${F(this.max)}
              step=${F(this.step)}
              .value=${$i(this.value)}
              autocapitalize=${F(this.autocapitalize)}
              autocomplete=${F(this.autocomplete)}
              autocorrect=${F(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${this.spellcheck}
              pattern=${F(this.pattern)}
              enterkeyhint=${F(this.enterkeyhint)}
              inputmode=${F(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            />

            ${n?N`
                  <button
                    part="clear-button"
                    class="input__clear"
                    type="button"
                    aria-label=${this.localize.term("clearEntry")}
                    @click=${this.handleClearClick}
                    tabindex="-1"
                  >
                    <slot name="clear-icon">
                      <sl-icon name="x-circle-fill" library="system"></sl-icon>
                    </slot>
                  </button>
                `:""}
            ${this.passwordToggle&&!this.disabled?N`
                  <button
                    part="password-toggle-button"
                    class="input__password-toggle"
                    type="button"
                    aria-label=${this.localize.term(this.passwordVisible?"hidePassword":"showPassword")}
                    @click=${this.handlePasswordToggle}
                    tabindex="-1"
                  >
                    ${this.passwordVisible?N`
                          <slot name="show-password-icon">
                            <sl-icon name="eye-slash" library="system"></sl-icon>
                          </slot>
                        `:N`
                          <slot name="hide-password-icon">
                            <sl-icon name="eye" library="system"></sl-icon>
                          </slot>
                        `}
                  </button>
                `:""}

            <span part="suffix" class="input__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};Q.styles=[H,Ni,jp];Q.dependencies={"sl-icon":fe};m([R(".input__control")],Q.prototype,"input",2);m([V()],Q.prototype,"hasFocus",2);m([k()],Q.prototype,"title",2);m([k({reflect:!0})],Q.prototype,"type",2);m([k()],Q.prototype,"name",2);m([k()],Q.prototype,"value",2);m([ur()],Q.prototype,"defaultValue",2);m([k({reflect:!0})],Q.prototype,"size",2);m([k({type:Boolean,reflect:!0})],Q.prototype,"filled",2);m([k({type:Boolean,reflect:!0})],Q.prototype,"pill",2);m([k()],Q.prototype,"label",2);m([k({attribute:"help-text"})],Q.prototype,"helpText",2);m([k({type:Boolean})],Q.prototype,"clearable",2);m([k({type:Boolean,reflect:!0})],Q.prototype,"disabled",2);m([k()],Q.prototype,"placeholder",2);m([k({type:Boolean,reflect:!0})],Q.prototype,"readonly",2);m([k({attribute:"password-toggle",type:Boolean})],Q.prototype,"passwordToggle",2);m([k({attribute:"password-visible",type:Boolean})],Q.prototype,"passwordVisible",2);m([k({attribute:"no-spin-buttons",type:Boolean})],Q.prototype,"noSpinButtons",2);m([k({reflect:!0})],Q.prototype,"form",2);m([k({type:Boolean,reflect:!0})],Q.prototype,"required",2);m([k()],Q.prototype,"pattern",2);m([k({type:Number})],Q.prototype,"minlength",2);m([k({type:Number})],Q.prototype,"maxlength",2);m([k()],Q.prototype,"min",2);m([k()],Q.prototype,"max",2);m([k()],Q.prototype,"step",2);m([k()],Q.prototype,"autocapitalize",2);m([k()],Q.prototype,"autocorrect",2);m([k()],Q.prototype,"autocomplete",2);m([k({type:Boolean})],Q.prototype,"autofocus",2);m([k()],Q.prototype,"enterkeyhint",2);m([k({type:Boolean,converter:{fromAttribute:t=>!(!t||t==="false"),toAttribute:t=>t?"true":"false"}})],Q.prototype,"spellcheck",2);m([k()],Q.prototype,"inputmode",2);m([M("disabled",{waitUntilFirstUpdate:!0})],Q.prototype,"handleDisabledChange",1);m([M("step",{waitUntilFirstUpdate:!0})],Q.prototype,"handleStepChange",1);m([M("value",{waitUntilFirstUpdate:!0})],Q.prototype,"handleValueChange",1);Q.define("sl-input");var Hp=U`
  :host {
    display: block;
    position: relative;
    background: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-radius: var(--sl-border-radius-medium);
    padding: var(--sl-spacing-x-small) 0;
    overflow: auto;
    overscroll-behavior: none;
  }

  ::slotted(sl-divider) {
    --spacing: var(--sl-spacing-x-small);
  }
`,Fa=class extends q{connectedCallback(){super.connectedCallback(),this.setAttribute("role","menu")}handleClick(t){const e=["menuitem","menuitemcheckbox"],i=t.composedPath(),r=i.find(l=>{var u;return e.includes(((u=l?.getAttribute)==null?void 0:u.call(l,"role"))||"")});if(!r||i.find(l=>{var u;return((u=l?.getAttribute)==null?void 0:u.call(l,"role"))==="menu"})!==this)return;const o=r;o.type==="checkbox"&&(o.checked=!o.checked),this.emit("sl-select",{detail:{item:o}})}handleKeyDown(t){if(t.key==="Enter"||t.key===" "){const e=this.getCurrentItem();t.preventDefault(),t.stopPropagation(),e?.click()}else if(["ArrowDown","ArrowUp","Home","End"].includes(t.key)){const e=this.getAllItems(),i=this.getCurrentItem();let r=i?e.indexOf(i):0;e.length>0&&(t.preventDefault(),t.stopPropagation(),t.key==="ArrowDown"?r++:t.key==="ArrowUp"?r--:t.key==="Home"?r=0:t.key==="End"&&(r=e.length-1),r<0&&(r=e.length-1),r>e.length-1&&(r=0),this.setCurrentItem(e[r]),e[r].focus())}}handleMouseDown(t){const e=t.target;this.isMenuItem(e)&&this.setCurrentItem(e)}handleSlotChange(){const t=this.getAllItems();t.length>0&&this.setCurrentItem(t[0])}isMenuItem(t){var e;return t.tagName.toLowerCase()==="sl-menu-item"||["menuitem","menuitemcheckbox","menuitemradio"].includes((e=t.getAttribute("role"))!=null?e:"")}getAllItems(){return[...this.defaultSlot.assignedElements({flatten:!0})].filter(t=>!(t.inert||!this.isMenuItem(t)))}getCurrentItem(){return this.getAllItems().find(t=>t.getAttribute("tabindex")==="0")}setCurrentItem(t){this.getAllItems().forEach(i=>{i.setAttribute("tabindex",i===t?"0":"-1")})}render(){return N`
      <slot
        @slotchange=${this.handleSlotChange}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
      ></slot>
    `}};Fa.styles=[H,Hp];m([R("slot")],Fa.prototype,"defaultSlot",2);Fa.define("sl-menu");var Kp=U`
  :host {
    --submenu-offset: -2px;

    display: block;
  }

  :host([inert]) {
    display: none;
  }

  .menu-item {
    position: relative;
    display: flex;
    align-items: stretch;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-letter-spacing-normal);
    color: var(--sl-color-neutral-700);
    padding: var(--sl-spacing-2x-small) var(--sl-spacing-2x-small);
    transition: var(--sl-transition-fast) fill;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    cursor: pointer;
  }

  .menu-item.menu-item--disabled {
    outline: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-item.menu-item--loading {
    outline: none;
    cursor: wait;
  }

  .menu-item.menu-item--loading *:not(sl-spinner) {
    opacity: 0.5;
  }

  .menu-item--loading sl-spinner {
    --indicator-color: currentColor;
    --track-width: 1px;
    position: absolute;
    font-size: 0.75em;
    top: calc(50% - 0.5em);
    left: 0.65rem;
    opacity: 1;
  }

  .menu-item .menu-item__label {
    flex: 1 1 auto;
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .menu-item .menu-item__prefix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .menu-item .menu-item__prefix::slotted(*) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .menu-item .menu-item__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .menu-item .menu-item__suffix::slotted(*) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  /* Safe triangle */
  .menu-item--submenu-expanded::after {
    content: '';
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--safe-triangle-cursor-x, 0) var(--safe-triangle-cursor-y, 0),
      var(--safe-triangle-submenu-start-x, 0) var(--safe-triangle-submenu-start-y, 0),
      var(--safe-triangle-submenu-end-x, 0) var(--safe-triangle-submenu-end-y, 0)
    );
  }

  :host(:focus-visible) {
    outline: none;
  }

  :host(:hover:not([aria-disabled='true'], :focus-visible)) .menu-item,
  .menu-item--submenu-expanded {
    background-color: var(--sl-color-neutral-100);
    color: var(--sl-color-neutral-1000);
  }

  :host(:focus-visible) .menu-item {
    outline: none;
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
    opacity: 1;
  }

  .menu-item .menu-item__check,
  .menu-item .menu-item__chevron {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    visibility: hidden;
  }

  .menu-item--checked .menu-item__check,
  .menu-item--has-submenu .menu-item__chevron {
    visibility: visible;
  }

  /* Add elevation and z-index to submenus */
  sl-popup::part(popup) {
    box-shadow: var(--sl-shadow-large);
    z-index: var(--sl-z-index-dropdown);
    margin-left: var(--submenu-offset);
  }

  .menu-item--rtl sl-popup::part(popup) {
    margin-left: calc(-1 * var(--submenu-offset));
  }

  @media (forced-colors: active) {
    :host(:hover:not([aria-disabled='true'])) .menu-item,
    :host(:focus-visible) .menu-item {
      outline: dashed 1px SelectedItem;
      outline-offset: -1px;
    }
  }

  ::slotted(sl-menu) {
    max-width: var(--auto-size-available-width) !important;
    max-height: var(--auto-size-available-height) !important;
  }
`;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const jr=(t,e)=>{const i=t._$AN;if(i===void 0)return!1;for(const r of i)r._$AO?.(e,!1),jr(r,e);return!0},nn=t=>{let e,i;do{if((e=t._$AM)===void 0)break;i=e._$AN,i.delete(t),t=e}while(i?.size===0)},pd=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(i===void 0)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),Yp(e)}};function Wp(t){this._$AN!==void 0?(nn(this),this._$AM=t,pd(this)):this._$AM=t}function Gp(t,e=!1,i=0){const r=this._$AH,s=this._$AN;if(s!==void 0&&s.size!==0)if(e)if(Array.isArray(r))for(let n=i;n<r.length;n++)jr(r[n],!1),nn(r[n]);else r!=null&&(jr(r,!1),nn(r));else jr(this,t)}const Yp=t=>{t.type==$t.CHILD&&(t._$AP??=Gp,t._$AQ??=Wp)};class Xp extends ss{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,i,r){super._$AT(e,i,r),pd(this),this.isConnected=e._$AU}_$AO(e,i=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),i&&(jr(this,e),nn(this))}setValue(e){if(Kc(this._$Ct))this._$Ct._$AI(e,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=e,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Jp=()=>new Qp;class Qp{}const io=new WeakMap,Zp=rs(class extends Xp{render(t){return pe}update(t,[e]){const i=e!==this.G;return i&&this.G!==void 0&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),pe}rt(t){if(this.isConnected||(t=void 0),typeof this.G=="function"){const e=this.ht??globalThis;let i=io.get(e);i===void 0&&(i=new WeakMap,io.set(e,i)),i.get(this.G)!==void 0&&this.G.call(this.ht,void 0),i.set(this.G,t),t!==void 0&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return typeof this.G=="function"?io.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});var em=class{constructor(t,e){this.popupRef=Jp(),this.enableSubmenuTimer=-1,this.isConnected=!1,this.isPopupConnected=!1,this.skidding=0,this.submenuOpenDelay=100,this.handleMouseMove=i=>{this.host.style.setProperty("--safe-triangle-cursor-x",`${i.clientX}px`),this.host.style.setProperty("--safe-triangle-cursor-y",`${i.clientY}px`)},this.handleMouseOver=()=>{this.hasSlotController.test("submenu")&&this.enableSubmenu()},this.handleKeyDown=i=>{switch(i.key){case"Escape":case"Tab":this.disableSubmenu();break;case"ArrowLeft":i.target!==this.host&&(i.preventDefault(),i.stopPropagation(),this.host.focus(),this.disableSubmenu());break;case"ArrowRight":case"Enter":case" ":this.handleSubmenuEntry(i);break}},this.handleClick=i=>{var r;i.target===this.host?(i.preventDefault(),i.stopPropagation()):i.target instanceof Element&&(i.target.tagName==="sl-menu-item"||(r=i.target.role)!=null&&r.startsWith("menuitem"))&&this.disableSubmenu()},this.handleFocusOut=i=>{i.relatedTarget&&i.relatedTarget instanceof Element&&this.host.contains(i.relatedTarget)||this.disableSubmenu()},this.handlePopupMouseover=i=>{i.stopPropagation()},this.handlePopupReposition=()=>{const i=this.host.renderRoot.querySelector("slot[name='submenu']"),r=i?.assignedElements({flatten:!0}).filter(c=>c.localName==="sl-menu")[0],s=getComputedStyle(this.host).direction==="rtl";if(!r)return;const{left:n,top:o,width:l,height:u}=r.getBoundingClientRect();this.host.style.setProperty("--safe-triangle-submenu-start-x",`${s?n+l:n}px`),this.host.style.setProperty("--safe-triangle-submenu-start-y",`${o}px`),this.host.style.setProperty("--safe-triangle-submenu-end-x",`${s?n+l:n}px`),this.host.style.setProperty("--safe-triangle-submenu-end-y",`${o+u}px`)},(this.host=t).addController(this),this.hasSlotController=e}hostConnected(){this.hasSlotController.test("submenu")&&!this.host.disabled&&this.addListeners()}hostDisconnected(){this.removeListeners()}hostUpdated(){this.hasSlotController.test("submenu")&&!this.host.disabled?(this.addListeners(),this.updateSkidding()):this.removeListeners()}addListeners(){this.isConnected||(this.host.addEventListener("mousemove",this.handleMouseMove),this.host.addEventListener("mouseover",this.handleMouseOver),this.host.addEventListener("keydown",this.handleKeyDown),this.host.addEventListener("click",this.handleClick),this.host.addEventListener("focusout",this.handleFocusOut),this.isConnected=!0),this.isPopupConnected||this.popupRef.value&&(this.popupRef.value.addEventListener("mouseover",this.handlePopupMouseover),this.popupRef.value.addEventListener("sl-reposition",this.handlePopupReposition),this.isPopupConnected=!0)}removeListeners(){this.isConnected&&(this.host.removeEventListener("mousemove",this.handleMouseMove),this.host.removeEventListener("mouseover",this.handleMouseOver),this.host.removeEventListener("keydown",this.handleKeyDown),this.host.removeEventListener("click",this.handleClick),this.host.removeEventListener("focusout",this.handleFocusOut),this.isConnected=!1),this.isPopupConnected&&this.popupRef.value&&(this.popupRef.value.removeEventListener("mouseover",this.handlePopupMouseover),this.popupRef.value.removeEventListener("sl-reposition",this.handlePopupReposition),this.isPopupConnected=!1)}handleSubmenuEntry(t){const e=this.host.renderRoot.querySelector("slot[name='submenu']");if(!e){console.error("Cannot activate a submenu if no corresponding menuitem can be found.",this);return}let i=null;for(const r of e.assignedElements())if(i=r.querySelectorAll("sl-menu-item, [role^='menuitem']"),i.length!==0)break;if(!(!i||i.length===0)){i[0].setAttribute("tabindex","0");for(let r=1;r!==i.length;++r)i[r].setAttribute("tabindex","-1");this.popupRef.value&&(t.preventDefault(),t.stopPropagation(),this.popupRef.value.active?i[0]instanceof HTMLElement&&i[0].focus():(this.enableSubmenu(!1),this.host.updateComplete.then(()=>{i[0]instanceof HTMLElement&&i[0].focus()}),this.host.requestUpdate()))}}setSubmenuState(t){this.popupRef.value&&this.popupRef.value.active!==t&&(this.popupRef.value.active=t,this.host.requestUpdate())}enableSubmenu(t=!0){t?(window.clearTimeout(this.enableSubmenuTimer),this.enableSubmenuTimer=window.setTimeout(()=>{this.setSubmenuState(!0)},this.submenuOpenDelay)):this.setSubmenuState(!0)}disableSubmenu(){window.clearTimeout(this.enableSubmenuTimer),this.setSubmenuState(!1)}updateSkidding(){var t;if(!((t=this.host.parentElement)!=null&&t.computedStyleMap))return;const e=this.host.parentElement.computedStyleMap(),r=["padding-top","border-top-width","margin-top"].reduce((s,n)=>{var o;const l=(o=e.get(n))!=null?o:new CSSUnitValue(0,"px"),c=(l instanceof CSSUnitValue?l:new CSSUnitValue(0,"px")).to("px");return s-c.value},0);this.skidding=r}isExpanded(){return this.popupRef.value?this.popupRef.value.active:!1}renderSubmenu(){const t=getComputedStyle(this.host).direction==="rtl";return this.isConnected?N`
      <sl-popup
        ${Zp(this.popupRef)}
        placement=${t?"left-start":"right-start"}
        anchor="anchor"
        flip
        flip-fallback-strategy="best-fit"
        skidding="${this.skidding}"
        strategy="fixed"
        auto-size="vertical"
        auto-size-padding="10"
      >
        <slot name="submenu"></slot>
      </sl-popup>
    `:N` <slot name="submenu" hidden></slot> `}},et=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.type="normal",this.checked=!1,this.value="",this.loading=!1,this.disabled=!1,this.hasSlotController=new Ve(this,"submenu"),this.submenuController=new em(this,this.hasSlotController),this.handleHostClick=t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation())},this.handleMouseOver=t=>{this.focus(),t.stopPropagation()}}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this.handleHostClick),this.addEventListener("mouseover",this.handleMouseOver)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleHostClick),this.removeEventListener("mouseover",this.handleMouseOver)}handleDefaultSlotChange(){const t=this.getTextLabel();if(typeof this.cachedTextLabel>"u"){this.cachedTextLabel=t;return}t!==this.cachedTextLabel&&(this.cachedTextLabel=t,this.emit("slotchange",{bubbles:!0,composed:!1,cancelable:!1}))}handleCheckedChange(){if(this.checked&&this.type!=="checkbox"){this.checked=!1,console.error('The checked attribute can only be used on menu items with type="checkbox"',this);return}this.type==="checkbox"?this.setAttribute("aria-checked",this.checked?"true":"false"):this.removeAttribute("aria-checked")}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}handleTypeChange(){this.type==="checkbox"?(this.setAttribute("role","menuitemcheckbox"),this.setAttribute("aria-checked",this.checked?"true":"false")):(this.setAttribute("role","menuitem"),this.removeAttribute("aria-checked"))}getTextLabel(){return Vf(this.defaultSlot)}isSubmenu(){return this.hasSlotController.test("submenu")}render(){const t=this.localize.dir()==="rtl",e=this.submenuController.isExpanded();return N`
      <div
        id="anchor"
        part="base"
        class=${j({"menu-item":!0,"menu-item--rtl":t,"menu-item--checked":this.checked,"menu-item--disabled":this.disabled,"menu-item--loading":this.loading,"menu-item--has-submenu":this.isSubmenu(),"menu-item--submenu-expanded":e})}
        ?aria-haspopup="${this.isSubmenu()}"
        ?aria-expanded="${!!e}"
      >
        <span part="checked-icon" class="menu-item__check">
          <sl-icon name="check" library="system" aria-hidden="true"></sl-icon>
        </span>

        <slot name="prefix" part="prefix" class="menu-item__prefix"></slot>

        <slot part="label" class="menu-item__label" @slotchange=${this.handleDefaultSlotChange}></slot>

        <slot name="suffix" part="suffix" class="menu-item__suffix"></slot>

        <span part="submenu-icon" class="menu-item__chevron">
          <sl-icon name=${t?"chevron-left":"chevron-right"} library="system" aria-hidden="true"></sl-icon>
        </span>

        ${this.submenuController.renderSubmenu()}
        ${this.loading?N` <sl-spinner part="spinner" exportparts="base:spinner__base"></sl-spinner> `:""}
      </div>
    `}};et.styles=[H,Kp];et.dependencies={"sl-icon":fe,"sl-popup":ae,"sl-spinner":ns};m([R("slot:not([name])")],et.prototype,"defaultSlot",2);m([R(".menu-item")],et.prototype,"menuItem",2);m([k()],et.prototype,"type",2);m([k({type:Boolean,reflect:!0})],et.prototype,"checked",2);m([k()],et.prototype,"value",2);m([k({type:Boolean,reflect:!0})],et.prototype,"loading",2);m([k({type:Boolean,reflect:!0})],et.prototype,"disabled",2);m([M("checked")],et.prototype,"handleCheckedChange",1);m([M("disabled")],et.prototype,"handleDisabledChange",1);m([M("type")],et.prototype,"handleTypeChange",1);et.define("sl-menu-item");var tm=U`
  :host {
    --divider-width: 2px;
    --handle-size: 2.5rem;

    display: inline-block;
    position: relative;
  }

  .image-comparer {
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
  }

  .image-comparer__before,
  .image-comparer__after {
    display: block;
    pointer-events: none;
  }

  .image-comparer__before::slotted(img),
  .image-comparer__after::slotted(img),
  .image-comparer__before::slotted(svg),
  .image-comparer__after::slotted(svg) {
    display: block;
    max-width: 100% !important;
    height: auto;
  }

  .image-comparer__after {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  .image-comparer__divider {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    width: var(--divider-width);
    height: 100%;
    background-color: var(--sl-color-neutral-0);
    translate: calc(var(--divider-width) / -2);
    cursor: ew-resize;
  }

  .image-comparer__handle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: calc(50% - (var(--handle-size) / 2));
    width: var(--handle-size);
    height: var(--handle-size);
    background-color: var(--sl-color-neutral-0);
    border-radius: var(--sl-border-radius-circle);
    font-size: calc(var(--handle-size) * 0.5);
    color: var(--sl-color-neutral-700);
    cursor: inherit;
    z-index: 10;
  }

  .image-comparer__handle:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }
`,zi=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.position=50}handleDrag(t){const{width:e}=this.base.getBoundingClientRect(),i=this.localize.dir()==="rtl";t.preventDefault(),Vr(this.base,{onMove:r=>{this.position=parseFloat(Ce(r/e*100,0,100).toFixed(2)),i&&(this.position=100-this.position)},initialEvent:t})}handleKeyDown(t){const e=this.localize.dir()==="ltr",i=this.localize.dir()==="rtl";if(["ArrowLeft","ArrowRight","Home","End"].includes(t.key)){const r=t.shiftKey?10:1;let s=this.position;t.preventDefault(),(e&&t.key==="ArrowLeft"||i&&t.key==="ArrowRight")&&(s-=r),(e&&t.key==="ArrowRight"||i&&t.key==="ArrowLeft")&&(s+=r),t.key==="Home"&&(s=0),t.key==="End"&&(s=100),s=Ce(s,0,100),this.position=s}}handlePositionChange(){this.emit("sl-change")}render(){const t=this.localize.dir()==="rtl";return N`
      <div
        part="base"
        id="image-comparer"
        class=${j({"image-comparer":!0,"image-comparer--rtl":t})}
        @keydown=${this.handleKeyDown}
      >
        <div class="image-comparer__image">
          <div part="before" class="image-comparer__before">
            <slot name="before"></slot>
          </div>

          <div
            part="after"
            class="image-comparer__after"
            style=${He({clipPath:t?`inset(0 0 0 ${100-this.position}%)`:`inset(0 ${100-this.position}% 0 0)`})}
          >
            <slot name="after"></slot>
          </div>
        </div>

        <div
          part="divider"
          class="image-comparer__divider"
          style=${He({left:t?`${100-this.position}%`:`${this.position}%`})}
          @mousedown=${this.handleDrag}
          @touchstart=${this.handleDrag}
        >
          <div
            part="handle"
            class="image-comparer__handle"
            role="scrollbar"
            aria-valuenow=${this.position}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-controls="image-comparer"
            tabindex="0"
          >
            <slot name="handle">
              <sl-icon library="system" name="grip-vertical"></sl-icon>
            </slot>
          </div>
        </div>
      </div>
    `}};zi.styles=[H,tm];zi.scopedElement={"sl-icon":fe};m([R(".image-comparer")],zi.prototype,"base",2);m([R(".image-comparer__handle")],zi.prototype,"handle",2);m([k({type:Number,reflect:!0})],zi.prototype,"position",2);m([M("position",{waitUntilFirstUpdate:!0})],zi.prototype,"handlePositionChange",1);zi.define("sl-image-comparer");var im=U`
  :host {
    display: block;
  }
`,ro=new Map;function rm(t,e="cors"){const i=ro.get(t);if(i!==void 0)return Promise.resolve(i);const r=fetch(t,{mode:e}).then(async s=>{const n={ok:s.ok,status:s.status,html:await s.text()};return ro.set(t,n),n});return ro.set(t,r),r}var pr=class extends q{constructor(){super(...arguments),this.mode="cors",this.allowScripts=!1}executeScript(t){const e=document.createElement("script");[...t.attributes].forEach(i=>e.setAttribute(i.name,i.value)),e.textContent=t.textContent,t.parentNode.replaceChild(e,t)}async handleSrcChange(){try{const t=this.src,e=await rm(t,this.mode);if(t!==this.src)return;if(!e.ok){this.emit("sl-error",{detail:{status:e.status}});return}this.innerHTML=e.html,this.allowScripts&&[...this.querySelectorAll("script")].forEach(i=>this.executeScript(i)),this.emit("sl-load")}catch{this.emit("sl-error",{detail:{status:-1}})}}render(){return N`<slot></slot>`}};pr.styles=[H,im];m([k()],pr.prototype,"src",2);m([k()],pr.prototype,"mode",2);m([k({attribute:"allow-scripts",type:Boolean})],pr.prototype,"allowScripts",2);m([M("src")],pr.prototype,"handleSrcChange",1);pr.define("sl-include");fe.define("sl-icon");Te.define("sl-icon-button");var wn=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.value=0,this.unit="byte",this.display="short"}render(){if(isNaN(this.value))return"";const t=["","kilo","mega","giga","tera"],e=["","kilo","mega","giga","tera","peta"],i=this.unit==="bit"?t:e,r=Math.max(0,Math.min(Math.floor(Math.log10(this.value)/3),i.length-1)),s=i[r]+this.unit,n=parseFloat((this.value/Math.pow(1e3,r)).toPrecision(3));return this.localize.number(n,{style:"unit",unit:s,unitDisplay:this.display})}};m([k({type:Number})],wn.prototype,"value",2);m([k()],wn.prototype,"unit",2);m([k()],wn.prototype,"display",2);wn.define("sl-format-bytes");var tt=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.date=new Date,this.hourFormat="auto"}render(){const t=new Date(this.date),e=this.hourFormat==="auto"?void 0:this.hourFormat==="12";if(!isNaN(t.getMilliseconds()))return N`
      <time datetime=${t.toISOString()}>
        ${this.localize.date(t,{weekday:this.weekday,era:this.era,year:this.year,month:this.month,day:this.day,hour:this.hour,minute:this.minute,second:this.second,timeZoneName:this.timeZoneName,timeZone:this.timeZone,hour12:e})}
      </time>
    `}};m([k()],tt.prototype,"date",2);m([k()],tt.prototype,"weekday",2);m([k()],tt.prototype,"era",2);m([k()],tt.prototype,"year",2);m([k()],tt.prototype,"month",2);m([k()],tt.prototype,"day",2);m([k()],tt.prototype,"hour",2);m([k()],tt.prototype,"minute",2);m([k()],tt.prototype,"second",2);m([k({attribute:"time-zone-name"})],tt.prototype,"timeZoneName",2);m([k({attribute:"time-zone"})],tt.prototype,"timeZone",2);m([k({attribute:"hour-format"})],tt.prototype,"hourFormat",2);tt.define("sl-format-date");var St=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.value=0,this.type="decimal",this.noGrouping=!1,this.currency="USD",this.currencyDisplay="symbol"}render(){return isNaN(this.value)?"":this.localize.number(this.value,{style:this.type,currency:this.currency,currencyDisplay:this.currencyDisplay,useGrouping:!this.noGrouping,minimumIntegerDigits:this.minimumIntegerDigits,minimumFractionDigits:this.minimumFractionDigits,maximumFractionDigits:this.maximumFractionDigits,minimumSignificantDigits:this.minimumSignificantDigits,maximumSignificantDigits:this.maximumSignificantDigits})}};m([k({type:Number})],St.prototype,"value",2);m([k()],St.prototype,"type",2);m([k({attribute:"no-grouping",type:Boolean})],St.prototype,"noGrouping",2);m([k()],St.prototype,"currency",2);m([k({attribute:"currency-display"})],St.prototype,"currencyDisplay",2);m([k({attribute:"minimum-integer-digits",type:Number})],St.prototype,"minimumIntegerDigits",2);m([k({attribute:"minimum-fraction-digits",type:Number})],St.prototype,"minimumFractionDigits",2);m([k({attribute:"maximum-fraction-digits",type:Number})],St.prototype,"maximumFractionDigits",2);m([k({attribute:"minimum-significant-digits",type:Number})],St.prototype,"minimumSignificantDigits",2);m([k({attribute:"maximum-significant-digits",type:Number})],St.prototype,"maximumSignificantDigits",2);St.define("sl-format-number");var sm=U`
  :host {
    --color: var(--sl-panel-border-color);
    --width: var(--sl-panel-border-width);
    --spacing: var(--sl-spacing-medium);
  }

  :host(:not([vertical])) {
    display: block;
    border-top: solid var(--width) var(--color);
    margin: var(--spacing) 0;
  }

  :host([vertical]) {
    display: inline-block;
    height: 100%;
    border-left: solid var(--width) var(--color);
    margin: 0 var(--spacing);
  }
`,xn=class extends q{constructor(){super(...arguments),this.vertical=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","separator")}handleVerticalChange(){this.setAttribute("aria-orientation",this.vertical?"vertical":"horizontal")}};xn.styles=[H,sm];m([k({type:Boolean,reflect:!0})],xn.prototype,"vertical",2);m([M("vertical")],xn.prototype,"handleVerticalChange",1);xn.define("sl-divider");var nm=U`
  :host {
    --size: 25rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .drawer {
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .drawer--contained {
    position: absolute;
    z-index: initial;
  }

  .drawer--fixed {
    position: fixed;
    z-index: var(--sl-z-index-drawer);
  }

  .drawer__panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 2;
    max-width: 100%;
    max-height: 100%;
    background-color: var(--sl-panel-background-color);
    box-shadow: var(--sl-shadow-x-large);
    overflow: auto;
    pointer-events: all;
  }

  .drawer__panel:focus {
    outline: none;
  }

  .drawer--top .drawer__panel {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: 100%;
    height: var(--size);
  }

  .drawer--end .drawer__panel {
    top: 0;
    inset-inline-end: 0;
    bottom: auto;
    inset-inline-start: auto;
    width: var(--size);
    height: 100%;
  }

  .drawer--bottom .drawer__panel {
    top: auto;
    inset-inline-end: auto;
    bottom: 0;
    inset-inline-start: 0;
    width: 100%;
    height: var(--size);
  }

  .drawer--start .drawer__panel {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: var(--size);
    height: 100%;
  }

  .drawer__header {
    display: flex;
  }

  .drawer__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .drawer__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .drawer__header-actions sl-icon-button,
  .drawer__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .drawer__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .drawer__footer {
    text-align: right;
    padding: var(--footer-spacing);
  }

  .drawer__footer ::slotted(sl-button:not(:last-of-type)) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .drawer:not(.drawer--has-footer) .drawer__footer {
    display: none;
  }

  .drawer__overlay {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
    pointer-events: all;
  }

  .drawer--contained .drawer__overlay {
    display: none;
  }

  @media (forced-colors: active) {
    .drawer__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`;function*qa(t=document.activeElement){t!=null&&(yield t,"shadowRoot"in t&&t.shadowRoot&&t.shadowRoot.mode!=="closed"&&(yield*bf(qa(t.shadowRoot.activeElement))))}function md(){return[...qa()].pop()}var ru=new WeakMap;function bd(t){let e=ru.get(t);return e||(e=window.getComputedStyle(t,null),ru.set(t,e)),e}function om(t){if(typeof t.checkVisibility=="function")return t.checkVisibility({checkOpacity:!1,checkVisibilityCSS:!0});const e=bd(t);return e.visibility!=="hidden"&&e.display!=="none"}function am(t){const e=bd(t),{overflowY:i,overflowX:r}=e;return i==="scroll"||r==="scroll"?!0:i!=="auto"||r!=="auto"?!1:t.scrollHeight>t.clientHeight&&i==="auto"||t.scrollWidth>t.clientWidth&&r==="auto"}function lm(t){const e=t.tagName.toLowerCase(),i=Number(t.getAttribute("tabindex"));if(t.hasAttribute("tabindex")&&(isNaN(i)||i<=-1)||t.hasAttribute("disabled")||t.closest("[inert]"))return!1;if(e==="input"&&t.getAttribute("type")==="radio"){const n=t.getRootNode(),o=`input[type='radio'][name="${t.getAttribute("name")}"]`,l=n.querySelector(`${o}:checked`);return l?l===t:n.querySelector(o)===t}return om(t)?(e==="audio"||e==="video")&&t.hasAttribute("controls")||t.hasAttribute("tabindex")||t.hasAttribute("contenteditable")&&t.getAttribute("contenteditable")!=="false"||["button","input","select","textarea","a","audio","video","summary","iframe"].includes(e)?!0:am(t):!1}function um(t){var e,i;const r=fa(t),s=(e=r[0])!=null?e:null,n=(i=r[r.length-1])!=null?i:null;return{start:s,end:n}}function cm(t,e){var i;return((i=t.getRootNode({composed:!0}))==null?void 0:i.host)!==e}function fa(t){const e=new WeakMap,i=[];function r(s){if(s instanceof Element){if(s.hasAttribute("inert")||s.closest("[inert]")||e.has(s))return;e.set(s,!0),!i.includes(s)&&lm(s)&&i.push(s),s instanceof HTMLSlotElement&&cm(s,t)&&s.assignedElements({flatten:!0}).forEach(n=>{r(n)}),s.shadowRoot!==null&&s.shadowRoot.mode==="open"&&r(s.shadowRoot)}for(const n of s.children)r(n)}return r(t),i.sort((s,n)=>{const o=Number(s.getAttribute("tabindex"))||0;return(Number(n.getAttribute("tabindex"))||0)-o})}var Ir=[],gd=class{constructor(e){this.tabDirection="forward",this.handleFocusIn=()=>{this.isActive()&&this.checkFocus()},this.handleKeyDown=i=>{var r;if(i.key!=="Tab"||this.isExternalActivated||!this.isActive())return;const s=md();if(this.previousFocus=s,this.previousFocus&&this.possiblyHasTabbableChildren(this.previousFocus))return;i.shiftKey?this.tabDirection="backward":this.tabDirection="forward";const n=fa(this.element);let o=n.findIndex(u=>u===s);this.previousFocus=this.currentFocus;const l=this.tabDirection==="forward"?1:-1;for(;;){o+l>=n.length?o=0:o+l<0?o=n.length-1:o+=l,this.previousFocus=this.currentFocus;const u=n[o];if(this.tabDirection==="backward"&&this.previousFocus&&this.possiblyHasTabbableChildren(this.previousFocus)||u&&this.possiblyHasTabbableChildren(u))return;i.preventDefault(),this.currentFocus=u,(r=this.currentFocus)==null||r.focus({preventScroll:!1});const c=[...qa()];if(c.includes(this.currentFocus)||!c.includes(this.previousFocus))break}setTimeout(()=>this.checkFocus())},this.handleKeyUp=()=>{this.tabDirection="forward"},this.element=e,this.elementsWithTabbableControls=["iframe"]}activate(){Ir.push(this.element),document.addEventListener("focusin",this.handleFocusIn),document.addEventListener("keydown",this.handleKeyDown),document.addEventListener("keyup",this.handleKeyUp)}deactivate(){Ir=Ir.filter(e=>e!==this.element),this.currentFocus=null,document.removeEventListener("focusin",this.handleFocusIn),document.removeEventListener("keydown",this.handleKeyDown),document.removeEventListener("keyup",this.handleKeyUp)}isActive(){return Ir[Ir.length-1]===this.element}activateExternal(){this.isExternalActivated=!0}deactivateExternal(){this.isExternalActivated=!1}checkFocus(){if(this.isActive()&&!this.isExternalActivated){const e=fa(this.element);if(!this.element.matches(":focus-within")){const i=e[0],r=e[e.length-1],s=this.tabDirection==="forward"?i:r;typeof s?.focus=="function"&&(this.currentFocus=s,s.focus({preventScroll:!1}))}}}possiblyHasTabbableChildren(e){return this.elementsWithTabbableControls.includes(e.tagName.toLowerCase())||e.hasAttribute("controls")}},Ua=t=>{var e;const{activeElement:i}=document;i&&t.contains(i)&&((e=document.activeElement)==null||e.blur())};function su(t){return t.charAt(0).toUpperCase()+t.slice(1)}var rt=class extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"footer"),this.localize=new ie(this),this.modal=new gd(this),this.open=!1,this.label="",this.placement="end",this.contained=!1,this.noHeader=!1,this.handleDocumentKeyDown=t=>{this.contained||t.key==="Escape"&&this.modal.isActive()&&this.open&&(t.stopImmediatePropagation(),this.requestClose("keyboard"))}}firstUpdated(){this.drawer.hidden=!this.open,this.open&&(this.addOpenListeners(),this.contained||(this.modal.activate(),qr(this)))}disconnectedCallback(){super.disconnectedCallback(),Ur(this),this.removeOpenListeners()}requestClose(t){if(this.emit("sl-request-close",{cancelable:!0,detail:{source:t}}).defaultPrevented){const i=me(this,"drawer.denyClose",{dir:this.localize.dir()});_e(this.panel,i.keyframes,i.options);return}this.hide()}addOpenListeners(){var t;"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.contained||(this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>this.requestClose("keyboard"))):document.addEventListener("keydown",this.handleDocumentKeyDown)}removeOpenListeners(){var t;document.removeEventListener("keydown",this.handleDocumentKeyDown),(t=this.closeWatcher)==null||t.destroy()}async handleOpenChange(){if(this.open){this.emit("sl-show"),this.addOpenListeners(),this.originalTrigger=document.activeElement,this.contained||(this.modal.activate(),qr(this));const t=this.querySelector("[autofocus]");t&&t.removeAttribute("autofocus"),await Promise.all([Ae(this.drawer),Ae(this.overlay)]),this.drawer.hidden=!1,requestAnimationFrame(()=>{this.emit("sl-initial-focus",{cancelable:!0}).defaultPrevented||(t?t.focus({preventScroll:!0}):this.panel.focus({preventScroll:!0})),t&&t.setAttribute("autofocus","")});const e=me(this,`drawer.show${su(this.placement)}`,{dir:this.localize.dir()}),i=me(this,"drawer.overlay.show",{dir:this.localize.dir()});await Promise.all([_e(this.panel,e.keyframes,e.options),_e(this.overlay,i.keyframes,i.options)]),this.emit("sl-after-show")}else{Ua(this),this.emit("sl-hide"),this.removeOpenListeners(),this.contained||(this.modal.deactivate(),Ur(this)),await Promise.all([Ae(this.drawer),Ae(this.overlay)]);const t=me(this,`drawer.hide${su(this.placement)}`,{dir:this.localize.dir()}),e=me(this,"drawer.overlay.hide",{dir:this.localize.dir()});await Promise.all([_e(this.overlay,e.keyframes,e.options).then(()=>{this.overlay.hidden=!0}),_e(this.panel,t.keyframes,t.options).then(()=>{this.panel.hidden=!0})]),this.drawer.hidden=!0,this.overlay.hidden=!1,this.panel.hidden=!1;const i=this.originalTrigger;typeof i?.focus=="function"&&setTimeout(()=>i.focus()),this.emit("sl-after-hide")}}handleNoModalChange(){this.open&&!this.contained&&(this.modal.activate(),qr(this)),this.open&&this.contained&&(this.modal.deactivate(),Ur(this))}async show(){if(!this.open)return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,Ue(this,"sl-after-hide")}render(){return N`
      <div
        part="base"
        class=${j({drawer:!0,"drawer--open":this.open,"drawer--top":this.placement==="top","drawer--end":this.placement==="end","drawer--bottom":this.placement==="bottom","drawer--start":this.placement==="start","drawer--contained":this.contained,"drawer--fixed":!this.contained,"drawer--rtl":this.localize.dir()==="rtl","drawer--has-footer":this.hasSlotController.test("footer")})}
      >
        <div part="overlay" class="drawer__overlay" @click=${()=>this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open?"false":"true"}
          aria-label=${F(this.noHeader?this.label:void 0)}
          aria-labelledby=${F(this.noHeader?void 0:"title")}
          tabindex="0"
        >
          ${this.noHeader?"":N`
                <header part="header" class="drawer__header">
                  <h2 part="title" class="drawer__title" id="title">
                    <!-- If there's no label, use an invisible character to prevent the header from collapsing -->
                    <slot name="label"> ${this.label.length>0?this.label:"\uFEFF"} </slot>
                  </h2>
                  <div part="header-actions" class="drawer__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="drawer__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click=${()=>this.requestClose("close-button")}
                    ></sl-icon-button>
                  </div>
                </header>
              `}

          <slot part="body" class="drawer__body"></slot>

          <footer part="footer" class="drawer__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `}};rt.styles=[H,nm];rt.dependencies={"sl-icon-button":Te};m([R(".drawer")],rt.prototype,"drawer",2);m([R(".drawer__panel")],rt.prototype,"panel",2);m([R(".drawer__overlay")],rt.prototype,"overlay",2);m([k({type:Boolean,reflect:!0})],rt.prototype,"open",2);m([k({reflect:!0})],rt.prototype,"label",2);m([k({reflect:!0})],rt.prototype,"placement",2);m([k({type:Boolean,reflect:!0})],rt.prototype,"contained",2);m([k({attribute:"no-header",type:Boolean,reflect:!0})],rt.prototype,"noHeader",2);m([M("open",{waitUntilFirstUpdate:!0})],rt.prototype,"handleOpenChange",1);m([M("contained",{waitUntilFirstUpdate:!0})],rt.prototype,"handleNoModalChange",1);oe("drawer.showTop",{keyframes:[{opacity:0,translate:"0 -100%"},{opacity:1,translate:"0 0"}],options:{duration:250,easing:"ease"}});oe("drawer.hideTop",{keyframes:[{opacity:1,translate:"0 0"},{opacity:0,translate:"0 -100%"}],options:{duration:250,easing:"ease"}});oe("drawer.showEnd",{keyframes:[{opacity:0,translate:"100%"},{opacity:1,translate:"0"}],rtlKeyframes:[{opacity:0,translate:"-100%"},{opacity:1,translate:"0"}],options:{duration:250,easing:"ease"}});oe("drawer.hideEnd",{keyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"100%"}],rtlKeyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"-100%"}],options:{duration:250,easing:"ease"}});oe("drawer.showBottom",{keyframes:[{opacity:0,translate:"0 100%"},{opacity:1,translate:"0 0"}],options:{duration:250,easing:"ease"}});oe("drawer.hideBottom",{keyframes:[{opacity:1,translate:"0 0"},{opacity:0,translate:"0 100%"}],options:{duration:250,easing:"ease"}});oe("drawer.showStart",{keyframes:[{opacity:0,translate:"-100%"},{opacity:1,translate:"0"}],rtlKeyframes:[{opacity:0,translate:"100%"},{opacity:1,translate:"0"}],options:{duration:250,easing:"ease"}});oe("drawer.hideStart",{keyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"-100%"}],rtlKeyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"100%"}],options:{duration:250,easing:"ease"}});oe("drawer.denyClose",{keyframes:[{scale:1},{scale:1.01},{scale:1}],options:{duration:250}});oe("drawer.overlay.show",{keyframes:[{opacity:0},{opacity:1}],options:{duration:250}});oe("drawer.overlay.hide",{keyframes:[{opacity:1},{opacity:0}],options:{duration:250}});rt.define("sl-drawer");var dm=U`
  :host {
    display: inline-block;
  }

  .dropdown::part(popup) {
    z-index: var(--sl-z-index-dropdown);
  }

  .dropdown[data-current-placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .dropdown[data-current-placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .dropdown[data-current-placement^='left']::part(popup) {
    transform-origin: right;
  }

  .dropdown[data-current-placement^='right']::part(popup) {
    transform-origin: left;
  }

  .dropdown__trigger {
    display: block;
  }

  .dropdown__panel {
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    box-shadow: var(--sl-shadow-large);
    border-radius: var(--sl-border-radius-medium);
    pointer-events: none;
  }

  .dropdown--open .dropdown__panel {
    display: block;
    pointer-events: all;
  }

  /* When users slot a menu, make sure it conforms to the popup's auto-size */
  ::slotted(sl-menu) {
    max-width: var(--auto-size-available-width) !important;
    max-height: var(--auto-size-available-height) !important;
  }
`,Me=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.open=!1,this.placement="bottom-start",this.disabled=!1,this.stayOpenOnSelect=!1,this.distance=0,this.skidding=0,this.hoist=!1,this.sync=void 0,this.handleKeyDown=t=>{this.open&&t.key==="Escape"&&(t.stopPropagation(),this.hide(),this.focusOnTrigger())},this.handleDocumentKeyDown=t=>{var e;if(t.key==="Escape"&&this.open&&!this.closeWatcher){t.stopPropagation(),this.focusOnTrigger(),this.hide();return}if(t.key==="Tab"){if(this.open&&((e=document.activeElement)==null?void 0:e.tagName.toLowerCase())==="sl-menu-item"){t.preventDefault(),this.hide(),this.focusOnTrigger();return}const i=(r,s)=>{if(!r)return null;const n=r.closest(s);if(n)return n;const o=r.getRootNode();return o instanceof ShadowRoot?i(o.host,s):null};setTimeout(()=>{var r;const s=((r=this.containingElement)==null?void 0:r.getRootNode())instanceof ShadowRoot?md():document.activeElement;(!this.containingElement||i(s,this.containingElement.tagName.toLowerCase())!==this.containingElement)&&this.hide()})}},this.handleDocumentMouseDown=t=>{const e=t.composedPath();this.containingElement&&!e.includes(this.containingElement)&&this.hide()},this.handlePanelSelect=t=>{const e=t.target;!this.stayOpenOnSelect&&e.tagName.toLowerCase()==="sl-menu"&&(this.hide(),this.focusOnTrigger())}}connectedCallback(){super.connectedCallback(),this.containingElement||(this.containingElement=this)}firstUpdated(){this.panel.hidden=!this.open,this.open&&(this.addOpenListeners(),this.popup.active=!0)}disconnectedCallback(){super.disconnectedCallback(),this.removeOpenListeners(),this.hide()}focusOnTrigger(){const t=this.trigger.assignedElements({flatten:!0})[0];typeof t?.focus=="function"&&t.focus()}getMenu(){return this.panel.assignedElements({flatten:!0}).find(t=>t.tagName.toLowerCase()==="sl-menu")}handleTriggerClick(){this.open?this.hide():(this.show(),this.focusOnTrigger())}async handleTriggerKeyDown(t){if([" ","Enter"].includes(t.key)){t.preventDefault(),this.handleTriggerClick();return}const e=this.getMenu();if(e){const i=e.getAllItems(),r=i[0],s=i[i.length-1];["ArrowDown","ArrowUp","Home","End"].includes(t.key)&&(t.preventDefault(),this.open||(this.show(),await this.updateComplete),i.length>0&&this.updateComplete.then(()=>{(t.key==="ArrowDown"||t.key==="Home")&&(e.setCurrentItem(r),r.focus()),(t.key==="ArrowUp"||t.key==="End")&&(e.setCurrentItem(s),s.focus())}))}}handleTriggerKeyUp(t){t.key===" "&&t.preventDefault()}handleTriggerSlotChange(){this.updateAccessibleTrigger()}updateAccessibleTrigger(){const e=this.trigger.assignedElements({flatten:!0}).find(r=>um(r).start);let i;if(e){switch(e.tagName.toLowerCase()){case"sl-button":case"sl-icon-button":i=e.button;break;default:i=e}i.setAttribute("aria-haspopup","true"),i.setAttribute("aria-expanded",this.open?"true":"false")}}async show(){if(!this.open)return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,Ue(this,"sl-after-hide")}reposition(){this.popup.reposition()}addOpenListeners(){var t;this.panel.addEventListener("sl-select",this.handlePanelSelect),"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>{this.hide(),this.focusOnTrigger()}):this.panel.addEventListener("keydown",this.handleKeyDown),document.addEventListener("keydown",this.handleDocumentKeyDown),document.addEventListener("mousedown",this.handleDocumentMouseDown)}removeOpenListeners(){var t;this.panel&&(this.panel.removeEventListener("sl-select",this.handlePanelSelect),this.panel.removeEventListener("keydown",this.handleKeyDown)),document.removeEventListener("keydown",this.handleDocumentKeyDown),document.removeEventListener("mousedown",this.handleDocumentMouseDown),(t=this.closeWatcher)==null||t.destroy()}async handleOpenChange(){if(this.disabled){this.open=!1;return}if(this.updateAccessibleTrigger(),this.open){this.emit("sl-show"),this.addOpenListeners(),await Ae(this),this.panel.hidden=!1,this.popup.active=!0;const{keyframes:t,options:e}=me(this,"dropdown.show",{dir:this.localize.dir()});await _e(this.popup.popup,t,e),this.emit("sl-after-show")}else{this.emit("sl-hide"),this.removeOpenListeners(),await Ae(this);const{keyframes:t,options:e}=me(this,"dropdown.hide",{dir:this.localize.dir()});await _e(this.popup.popup,t,e),this.panel.hidden=!0,this.popup.active=!1,this.emit("sl-after-hide")}}render(){return N`
      <sl-popup
        part="base"
        exportparts="popup:base__popup"
        id="dropdown"
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist?"fixed":"absolute"}
        flip
        shift
        auto-size="vertical"
        auto-size-padding="10"
        sync=${F(this.sync?this.sync:void 0)}
        class=${j({dropdown:!0,"dropdown--open":this.open})}
      >
        <slot
          name="trigger"
          slot="anchor"
          part="trigger"
          class="dropdown__trigger"
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeyDown}
          @keyup=${this.handleTriggerKeyUp}
          @slotchange=${this.handleTriggerSlotChange}
        ></slot>

        <div aria-hidden=${this.open?"false":"true"} aria-labelledby="dropdown">
          <slot part="panel" class="dropdown__panel"></slot>
        </div>
      </sl-popup>
    `}};Me.styles=[H,dm];Me.dependencies={"sl-popup":ae};m([R(".dropdown")],Me.prototype,"popup",2);m([R(".dropdown__trigger")],Me.prototype,"trigger",2);m([R(".dropdown__panel")],Me.prototype,"panel",2);m([k({type:Boolean,reflect:!0})],Me.prototype,"open",2);m([k({reflect:!0})],Me.prototype,"placement",2);m([k({type:Boolean,reflect:!0})],Me.prototype,"disabled",2);m([k({attribute:"stay-open-on-select",type:Boolean,reflect:!0})],Me.prototype,"stayOpenOnSelect",2);m([k({attribute:!1})],Me.prototype,"containingElement",2);m([k({type:Number})],Me.prototype,"distance",2);m([k({type:Number})],Me.prototype,"skidding",2);m([k({type:Boolean})],Me.prototype,"hoist",2);m([k({reflect:!0})],Me.prototype,"sync",2);m([M("open",{waitUntilFirstUpdate:!0})],Me.prototype,"handleOpenChange",1);oe("dropdown.show",{keyframes:[{opacity:0,scale:.9},{opacity:1,scale:1}],options:{duration:100,easing:"ease"}});oe("dropdown.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.9}],options:{duration:100,easing:"ease"}});Me.define("sl-dropdown");var hm=U`
  :host {
    --error-color: var(--sl-color-danger-600);
    --success-color: var(--sl-color-success-600);

    display: inline-block;
  }

  .copy-button__button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
  }

  .copy-button--success .copy-button__button {
    color: var(--success-color);
  }

  .copy-button--error .copy-button__button {
    color: var(--error-color);
  }

  .copy-button__button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .copy-button__button[disabled] {
    opacity: 0.5;
    cursor: not-allowed !important;
  }

  slot {
    display: inline-flex;
  }
`,$e=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.isCopying=!1,this.status="rest",this.value="",this.from="",this.disabled=!1,this.copyLabel="",this.successLabel="",this.errorLabel="",this.feedbackDuration=1e3,this.tooltipPlacement="top",this.hoist=!1}async handleCopy(){if(this.disabled||this.isCopying)return;this.isCopying=!0;let t=this.value;if(this.from){const e=this.getRootNode(),i=this.from.includes("."),r=this.from.includes("[")&&this.from.includes("]");let s=this.from,n="";i?[s,n]=this.from.trim().split("."):r&&([s,n]=this.from.trim().replace(/\]$/,"").split("["));const o="getElementById"in e?e.getElementById(s):null;o?r?t=o.getAttribute(n)||"":i?t=o[n]||"":t=o.textContent||"":(this.showStatus("error"),this.emit("sl-error"))}if(!t)this.showStatus("error"),this.emit("sl-error");else try{await navigator.clipboard.writeText(t),this.showStatus("success"),this.emit("sl-copy",{detail:{value:t}})}catch{this.showStatus("error"),this.emit("sl-error")}}async showStatus(t){const e=this.copyLabel||this.localize.term("copy"),i=this.successLabel||this.localize.term("copied"),r=this.errorLabel||this.localize.term("error"),s=t==="success"?this.successIcon:this.errorIcon,n=me(this,"copy.in",{dir:"ltr"}),o=me(this,"copy.out",{dir:"ltr"});this.tooltip.content=t==="success"?i:r,await this.copyIcon.animate(o.keyframes,o.options).finished,this.copyIcon.hidden=!0,this.status=t,s.hidden=!1,await s.animate(n.keyframes,n.options).finished,setTimeout(async()=>{await s.animate(o.keyframes,o.options).finished,s.hidden=!0,this.status="rest",this.copyIcon.hidden=!1,await this.copyIcon.animate(n.keyframes,n.options).finished,this.tooltip.content=e,this.isCopying=!1},this.feedbackDuration)}render(){const t=this.copyLabel||this.localize.term("copy");return N`
      <sl-tooltip
        class=${j({"copy-button":!0,"copy-button--success":this.status==="success","copy-button--error":this.status==="error"})}
        content=${t}
        placement=${this.tooltipPlacement}
        ?disabled=${this.disabled}
        ?hoist=${this.hoist}
        exportparts="
          base:tooltip__base,
          base__popup:tooltip__base__popup,
          base__arrow:tooltip__base__arrow,
          body:tooltip__body
        "
      >
        <button
          class="copy-button__button"
          part="button"
          type="button"
          ?disabled=${this.disabled}
          @click=${this.handleCopy}
        >
          <slot part="copy-icon" name="copy-icon">
            <sl-icon library="system" name="copy"></sl-icon>
          </slot>
          <slot part="success-icon" name="success-icon" hidden>
            <sl-icon library="system" name="check"></sl-icon>
          </slot>
          <slot part="error-icon" name="error-icon" hidden>
            <sl-icon library="system" name="x-lg"></sl-icon>
          </slot>
        </button>
      </sl-tooltip>
    `}};$e.styles=[H,hm];$e.dependencies={"sl-icon":fe,"sl-tooltip":Oe};m([R('slot[name="copy-icon"]')],$e.prototype,"copyIcon",2);m([R('slot[name="success-icon"]')],$e.prototype,"successIcon",2);m([R('slot[name="error-icon"]')],$e.prototype,"errorIcon",2);m([R("sl-tooltip")],$e.prototype,"tooltip",2);m([V()],$e.prototype,"isCopying",2);m([V()],$e.prototype,"status",2);m([k()],$e.prototype,"value",2);m([k()],$e.prototype,"from",2);m([k({type:Boolean,reflect:!0})],$e.prototype,"disabled",2);m([k({attribute:"copy-label"})],$e.prototype,"copyLabel",2);m([k({attribute:"success-label"})],$e.prototype,"successLabel",2);m([k({attribute:"error-label"})],$e.prototype,"errorLabel",2);m([k({attribute:"feedback-duration",type:Number})],$e.prototype,"feedbackDuration",2);m([k({attribute:"tooltip-placement"})],$e.prototype,"tooltipPlacement",2);m([k({type:Boolean})],$e.prototype,"hoist",2);oe("copy.in",{keyframes:[{scale:".25",opacity:".25"},{scale:"1",opacity:"1"}],options:{duration:100}});oe("copy.out",{keyframes:[{scale:"1",opacity:"1"},{scale:".25",opacity:"0"}],options:{duration:100}});$e.define("sl-copy-button");var fm=U`
  :host {
    display: block;
  }

  .details {
    border: solid 1px var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    background-color: var(--sl-color-neutral-0);
    overflow-anchor: none;
  }

  .details--disabled {
    opacity: 0.5;
  }

  .details__header {
    display: flex;
    align-items: center;
    border-radius: inherit;
    padding: var(--sl-spacing-medium);
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .details__header::-webkit-details-marker {
    display: none;
  }

  .details__header:focus {
    outline: none;
  }

  .details__header:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: calc(1px + var(--sl-focus-ring-offset));
  }

  .details--disabled .details__header {
    cursor: not-allowed;
  }

  .details--disabled .details__header:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .details__summary {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }

  .details__summary-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    transition: var(--sl-transition-medium) rotate ease;
  }

  .details--open .details__summary-icon {
    rotate: 90deg;
  }

  .details--open.details--rtl .details__summary-icon {
    rotate: -90deg;
  }

  .details--open slot[name='expand-icon'],
  .details:not(.details--open) slot[name='collapse-icon'] {
    display: none;
  }

  .details__body {
    overflow: hidden;
  }

  .details__content {
    display: block;
    padding: var(--sl-spacing-medium);
  }
`,Ct=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.open=!1,this.disabled=!1}firstUpdated(){this.body.style.height=this.open?"auto":"0",this.open&&(this.details.open=!0),this.detailsObserver=new MutationObserver(t=>{for(const e of t)e.type==="attributes"&&e.attributeName==="open"&&(this.details.open?this.show():this.hide())}),this.detailsObserver.observe(this.details,{attributes:!0})}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.detailsObserver)==null||t.disconnect()}handleSummaryClick(t){t.preventDefault(),this.disabled||(this.open?this.hide():this.show(),this.header.focus())}handleSummaryKeyDown(t){(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.open?this.hide():this.show()),(t.key==="ArrowUp"||t.key==="ArrowLeft")&&(t.preventDefault(),this.hide()),(t.key==="ArrowDown"||t.key==="ArrowRight")&&(t.preventDefault(),this.show())}async handleOpenChange(){if(this.open){if(this.details.open=!0,this.emit("sl-show",{cancelable:!0}).defaultPrevented){this.open=!1,this.details.open=!1;return}await Ae(this.body);const{keyframes:e,options:i}=me(this,"details.show",{dir:this.localize.dir()});await _e(this.body,Zs(e,this.body.scrollHeight),i),this.body.style.height="auto",this.emit("sl-after-show")}else{if(this.emit("sl-hide",{cancelable:!0}).defaultPrevented){this.details.open=!0,this.open=!0;return}await Ae(this.body);const{keyframes:e,options:i}=me(this,"details.hide",{dir:this.localize.dir()});await _e(this.body,Zs(e,this.body.scrollHeight),i),this.body.style.height="auto",this.details.open=!1,this.emit("sl-after-hide")}}async show(){if(!(this.open||this.disabled))return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(!(!this.open||this.disabled))return this.open=!1,Ue(this,"sl-after-hide")}render(){const t=this.localize.dir()==="rtl";return N`
      <details
        part="base"
        class=${j({details:!0,"details--open":this.open,"details--disabled":this.disabled,"details--rtl":t})}
      >
        <summary
          part="header"
          id="header"
          class="details__header"
          role="button"
          aria-expanded=${this.open?"true":"false"}
          aria-controls="content"
          aria-disabled=${this.disabled?"true":"false"}
          tabindex=${this.disabled?"-1":"0"}
          @click=${this.handleSummaryClick}
          @keydown=${this.handleSummaryKeyDown}
        >
          <slot name="summary" part="summary" class="details__summary">${this.summary}</slot>

          <span part="summary-icon" class="details__summary-icon">
            <slot name="expand-icon">
              <sl-icon library="system" name=${t?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
            <slot name="collapse-icon">
              <sl-icon library="system" name=${t?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
          </span>
        </summary>

        <div class="details__body" role="region" aria-labelledby="header">
          <slot part="content" id="content" class="details__content"></slot>
        </div>
      </details>
    `}};Ct.styles=[H,fm];Ct.dependencies={"sl-icon":fe};m([R(".details")],Ct.prototype,"details",2);m([R(".details__header")],Ct.prototype,"header",2);m([R(".details__body")],Ct.prototype,"body",2);m([R(".details__expand-icon-slot")],Ct.prototype,"expandIconSlot",2);m([k({type:Boolean,reflect:!0})],Ct.prototype,"open",2);m([k()],Ct.prototype,"summary",2);m([k({type:Boolean,reflect:!0})],Ct.prototype,"disabled",2);m([M("open",{waitUntilFirstUpdate:!0})],Ct.prototype,"handleOpenChange",1);oe("details.show",{keyframes:[{height:"0",opacity:"0"},{height:"auto",opacity:"1"}],options:{duration:250,easing:"linear"}});oe("details.hide",{keyframes:[{height:"auto",opacity:"1"},{height:"0",opacity:"0"}],options:{duration:250,easing:"linear"}});Ct.define("sl-details");var pm=U`
  :host {
    --width: 31rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--sl-z-index-dialog);
  }

  .dialog__panel {
    display: flex;
    flex-direction: column;
    z-index: 2;
    width: var(--width);
    max-width: calc(100% - var(--sl-spacing-2x-large));
    max-height: calc(100% - var(--sl-spacing-2x-large));
    background-color: var(--sl-panel-background-color);
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-x-large);
  }

  .dialog__panel:focus {
    outline: none;
  }

  /* Ensure there's enough vertical padding for phones that don't update vh when chrome appears (e.g. iPhone) */
  @media screen and (max-width: 420px) {
    .dialog__panel {
      max-height: 80vh;
    }
  }

  .dialog--open .dialog__panel {
    display: flex;
    opacity: 1;
  }

  .dialog__header {
    flex: 0 0 auto;
    display: flex;
  }

  .dialog__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .dialog__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .dialog__header-actions sl-icon-button,
  .dialog__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .dialog__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog__footer {
    flex: 0 0 auto;
    text-align: right;
    padding: var(--footer-spacing);
  }

  .dialog__footer ::slotted(sl-button:not(:first-of-type)) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  .dialog:not(.dialog--has-footer) .dialog__footer {
    display: none;
  }

  .dialog__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
  }

  @media (forced-colors: active) {
    .dialog__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`,Bt=class extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"footer"),this.localize=new ie(this),this.modal=new gd(this),this.open=!1,this.label="",this.noHeader=!1,this.handleDocumentKeyDown=t=>{t.key==="Escape"&&this.modal.isActive()&&this.open&&(t.stopPropagation(),this.requestClose("keyboard"))}}firstUpdated(){this.dialog.hidden=!this.open,this.open&&(this.addOpenListeners(),this.modal.activate(),qr(this))}disconnectedCallback(){super.disconnectedCallback(),this.modal.deactivate(),Ur(this),this.removeOpenListeners()}requestClose(t){if(this.emit("sl-request-close",{cancelable:!0,detail:{source:t}}).defaultPrevented){const i=me(this,"dialog.denyClose",{dir:this.localize.dir()});_e(this.panel,i.keyframes,i.options);return}this.hide()}addOpenListeners(){var t;"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>this.requestClose("keyboard")):document.addEventListener("keydown",this.handleDocumentKeyDown)}removeOpenListeners(){var t;(t=this.closeWatcher)==null||t.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown)}async handleOpenChange(){if(this.open){this.emit("sl-show"),this.addOpenListeners(),this.originalTrigger=document.activeElement,this.modal.activate(),qr(this);const t=this.querySelector("[autofocus]");t&&t.removeAttribute("autofocus"),await Promise.all([Ae(this.dialog),Ae(this.overlay)]),this.dialog.hidden=!1,requestAnimationFrame(()=>{this.emit("sl-initial-focus",{cancelable:!0}).defaultPrevented||(t?t.focus({preventScroll:!0}):this.panel.focus({preventScroll:!0})),t&&t.setAttribute("autofocus","")});const e=me(this,"dialog.show",{dir:this.localize.dir()}),i=me(this,"dialog.overlay.show",{dir:this.localize.dir()});await Promise.all([_e(this.panel,e.keyframes,e.options),_e(this.overlay,i.keyframes,i.options)]),this.emit("sl-after-show")}else{Ua(this),this.emit("sl-hide"),this.removeOpenListeners(),this.modal.deactivate(),await Promise.all([Ae(this.dialog),Ae(this.overlay)]);const t=me(this,"dialog.hide",{dir:this.localize.dir()}),e=me(this,"dialog.overlay.hide",{dir:this.localize.dir()});await Promise.all([_e(this.overlay,e.keyframes,e.options).then(()=>{this.overlay.hidden=!0}),_e(this.panel,t.keyframes,t.options).then(()=>{this.panel.hidden=!0})]),this.dialog.hidden=!0,this.overlay.hidden=!1,this.panel.hidden=!1,Ur(this);const i=this.originalTrigger;typeof i?.focus=="function"&&setTimeout(()=>i.focus()),this.emit("sl-after-hide")}}async show(){if(!this.open)return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,Ue(this,"sl-after-hide")}render(){return N`
      <div
        part="base"
        class=${j({dialog:!0,"dialog--open":this.open,"dialog--has-footer":this.hasSlotController.test("footer")})}
      >
        <div part="overlay" class="dialog__overlay" @click=${()=>this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open?"false":"true"}
          aria-label=${F(this.noHeader?this.label:void 0)}
          aria-labelledby=${F(this.noHeader?void 0:"title")}
          tabindex="-1"
        >
          ${this.noHeader?"":N`
                <header part="header" class="dialog__header">
                  <h2 part="title" class="dialog__title" id="title">
                    <slot name="label"> ${this.label.length>0?this.label:"\uFEFF"} </slot>
                  </h2>
                  <div part="header-actions" class="dialog__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="dialog__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click="${()=>this.requestClose("close-button")}"
                    ></sl-icon-button>
                  </div>
                </header>
              `}
          ${""}
          <div part="body" class="dialog__body" tabindex="-1"><slot></slot></div>

          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `}};Bt.styles=[H,pm];Bt.dependencies={"sl-icon-button":Te};m([R(".dialog")],Bt.prototype,"dialog",2);m([R(".dialog__panel")],Bt.prototype,"panel",2);m([R(".dialog__overlay")],Bt.prototype,"overlay",2);m([k({type:Boolean,reflect:!0})],Bt.prototype,"open",2);m([k({reflect:!0})],Bt.prototype,"label",2);m([k({attribute:"no-header",type:Boolean,reflect:!0})],Bt.prototype,"noHeader",2);m([M("open",{waitUntilFirstUpdate:!0})],Bt.prototype,"handleOpenChange",1);oe("dialog.show",{keyframes:[{opacity:0,scale:.8},{opacity:1,scale:1}],options:{duration:250,easing:"ease"}});oe("dialog.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.8}],options:{duration:250,easing:"ease"}});oe("dialog.denyClose",{keyframes:[{scale:1},{scale:1.02},{scale:1}],options:{duration:250}});oe("dialog.overlay.show",{keyframes:[{opacity:0},{opacity:1}],options:{duration:250}});oe("dialog.overlay.hide",{keyframes:[{opacity:1},{opacity:0}],options:{duration:250}});Bt.define("sl-dialog");Ee.define("sl-checkbox");var mm=U`
  :host {
    --grid-width: 280px;
    --grid-height: 200px;
    --grid-handle-size: 16px;
    --slider-height: 15px;
    --slider-handle-size: 17px;
    --swatch-size: 25px;

    display: inline-block;
  }

  .color-picker {
    width: var(--grid-width);
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    color: var(--color);
    background-color: var(--sl-panel-background-color);
    border-radius: var(--sl-border-radius-medium);
    user-select: none;
    -webkit-user-select: none;
  }

  .color-picker--inline {
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
  }

  .color-picker--inline:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .color-picker__grid {
    position: relative;
    height: var(--grid-height);
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
    border-top-left-radius: var(--sl-border-radius-medium);
    border-top-right-radius: var(--sl-border-radius-medium);
    cursor: crosshair;
    forced-color-adjust: none;
  }

  .color-picker__grid-handle {
    position: absolute;
    width: var(--grid-handle-size);
    height: var(--grid-handle-size);
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
    border: solid 2px white;
    margin-top: calc(var(--grid-handle-size) / -2);
    margin-left: calc(var(--grid-handle-size) / -2);
    transition: var(--sl-transition-fast) scale;
  }

  .color-picker__grid-handle--dragging {
    cursor: none;
    scale: 1.5;
  }

  .color-picker__grid-handle:focus-visible {
    outline: var(--sl-focus-ring);
  }

  .color-picker__controls {
    padding: var(--sl-spacing-small);
    display: flex;
    align-items: center;
  }

  .color-picker__sliders {
    flex: 1 1 auto;
  }

  .color-picker__slider {
    position: relative;
    height: var(--slider-height);
    border-radius: var(--sl-border-radius-pill);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    forced-color-adjust: none;
  }

  .color-picker__slider:not(:last-of-type) {
    margin-bottom: var(--sl-spacing-small);
  }

  .color-picker__slider-handle {
    position: absolute;
    top: calc(50% - var(--slider-handle-size) / 2);
    width: var(--slider-handle-size);
    height: var(--slider-handle-size);
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
    margin-left: calc(var(--slider-handle-size) / -2);
  }

  .color-picker__slider-handle:focus-visible {
    outline: var(--sl-focus-ring);
  }

  .color-picker__hue {
    background-image: linear-gradient(
      to right,
      rgb(255, 0, 0) 0%,
      rgb(255, 255, 0) 17%,
      rgb(0, 255, 0) 33%,
      rgb(0, 255, 255) 50%,
      rgb(0, 0, 255) 67%,
      rgb(255, 0, 255) 83%,
      rgb(255, 0, 0) 100%
    );
  }

  .color-picker__alpha .color-picker__alpha-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .color-picker__preview {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: var(--sl-border-radius-circle);
    background: none;
    margin-left: var(--sl-spacing-small);
    cursor: copy;
    forced-color-adjust: none;
  }

  .color-picker__preview:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);

    /* We use a custom property in lieu of currentColor because of https://bugs.webkit.org/show_bug.cgi?id=216780 */
    background-color: var(--preview-color);
  }

  .color-picker__preview:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .color-picker__preview-color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: solid 1px rgba(0, 0, 0, 0.125);
  }

  .color-picker__preview-color--copied {
    animation: pulse 0.75s;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--sl-color-primary-500);
    }
    70% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  .color-picker__user-input {
    display: flex;
    padding: 0 var(--sl-spacing-small) var(--sl-spacing-small) var(--sl-spacing-small);
  }

  .color-picker__user-input sl-input {
    min-width: 0; /* fix input width in Safari */
    flex: 1 1 auto;
  }

  .color-picker__user-input sl-button-group {
    margin-left: var(--sl-spacing-small);
  }

  .color-picker__user-input sl-button {
    min-width: 3.25rem;
    max-width: 3.25rem;
    font-size: 1rem;
  }

  .color-picker__swatches {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-gap: 0.5rem;
    justify-items: center;
    border-top: solid 1px var(--sl-color-neutral-200);
    padding: var(--sl-spacing-small);
    forced-color-adjust: none;
  }

  .color-picker__swatch {
    position: relative;
    width: var(--swatch-size);
    height: var(--swatch-size);
    border-radius: var(--sl-border-radius-small);
  }

  .color-picker__swatch .color-picker__swatch-color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: solid 1px rgba(0, 0, 0, 0.125);
    border-radius: inherit;
    cursor: pointer;
  }

  .color-picker__swatch:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .color-picker__transparent-bg {
    background-image: linear-gradient(45deg, var(--sl-color-neutral-300) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--sl-color-neutral-300) 75%),
      linear-gradient(45deg, transparent 75%, var(--sl-color-neutral-300) 75%),
      linear-gradient(45deg, var(--sl-color-neutral-300) 25%, transparent 25%);
    background-size: 10px 10px;
    background-position:
      0 0,
      0 0,
      -5px -5px,
      5px 5px;
  }

  .color-picker--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .color-picker--disabled .color-picker__grid,
  .color-picker--disabled .color-picker__grid-handle,
  .color-picker--disabled .color-picker__slider,
  .color-picker--disabled .color-picker__slider-handle,
  .color-picker--disabled .color-picker__preview,
  .color-picker--disabled .color-picker__swatch,
  .color-picker--disabled .color-picker__swatch-color {
    pointer-events: none;
  }

  /*
   * Color dropdown
   */

  .color-dropdown::part(panel) {
    max-height: none;
    background-color: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-radius: var(--sl-border-radius-medium);
    overflow: visible;
  }

  .color-dropdown__trigger {
    display: inline-block;
    position: relative;
    background-color: transparent;
    border: none;
    cursor: pointer;
    forced-color-adjust: none;
  }

  .color-dropdown__trigger.color-dropdown__trigger--small {
    width: var(--sl-input-height-small);
    height: var(--sl-input-height-small);
    border-radius: var(--sl-border-radius-circle);
  }

  .color-dropdown__trigger.color-dropdown__trigger--medium {
    width: var(--sl-input-height-medium);
    height: var(--sl-input-height-medium);
    border-radius: var(--sl-border-radius-circle);
  }

  .color-dropdown__trigger.color-dropdown__trigger--large {
    width: var(--sl-input-height-large);
    height: var(--sl-input-height-large);
    border-radius: var(--sl-border-radius-circle);
  }

  .color-dropdown__trigger:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: currentColor;
    box-shadow:
      inset 0 0 0 2px var(--sl-input-border-color),
      inset 0 0 0 4px var(--sl-color-neutral-0);
  }

  .color-dropdown__trigger--empty:before {
    background-color: transparent;
  }

  .color-dropdown__trigger:focus-visible {
    outline: none;
  }

  .color-dropdown__trigger:focus-visible:not(.color-dropdown__trigger--disabled) {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .color-dropdown__trigger.color-dropdown__trigger--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,le=class extends q{constructor(){super(...arguments),this.formControlController=new Xt(this,{assumeInteractionOn:["click"]}),this.hasSlotController=new Ve(this,"[default]","prefix","suffix"),this.localize=new ie(this),this.hasFocus=!1,this.invalid=!1,this.title="",this.variant="default",this.size="medium",this.caret=!1,this.disabled=!1,this.loading=!1,this.outline=!1,this.pill=!1,this.circle=!1,this.type="button",this.name="",this.value="",this.href="",this.rel="noreferrer noopener"}get validity(){return this.isButton()?this.button.validity:hn}get validationMessage(){return this.isButton()?this.button.validationMessage:""}firstUpdated(){this.isButton()&&this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(){this.type==="submit"&&this.formControlController.submit(this),this.type==="reset"&&this.formControlController.reset(this)}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}isButton(){return!this.href}isLink(){return!!this.href}handleDisabledChange(){this.isButton()&&this.formControlController.setValidity(this.disabled)}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}checkValidity(){return this.isButton()?this.button.checkValidity():!0}getForm(){return this.formControlController.getForm()}reportValidity(){return this.isButton()?this.button.reportValidity():!0}setCustomValidity(t){this.isButton()&&(this.button.setCustomValidity(t),this.formControlController.updateValidity())}render(){const t=this.isLink(),e=t?sn`a`:sn`button`;return Fr`
      <${e}
        part="base"
        class=${j({button:!0,"button--default":this.variant==="default","button--primary":this.variant==="primary","button--success":this.variant==="success","button--neutral":this.variant==="neutral","button--warning":this.variant==="warning","button--danger":this.variant==="danger","button--text":this.variant==="text","button--small":this.size==="small","button--medium":this.size==="medium","button--large":this.size==="large","button--caret":this.caret,"button--circle":this.circle,"button--disabled":this.disabled,"button--focused":this.hasFocus,"button--loading":this.loading,"button--standard":!this.outline,"button--outline":this.outline,"button--pill":this.pill,"button--rtl":this.localize.dir()==="rtl","button--has-label":this.hasSlotController.test("[default]"),"button--has-prefix":this.hasSlotController.test("prefix"),"button--has-suffix":this.hasSlotController.test("suffix")})}
        ?disabled=${F(t?void 0:this.disabled)}
        type=${F(t?void 0:this.type)}
        title=${this.title}
        name=${F(t?void 0:this.name)}
        value=${F(t?void 0:this.value)}
        href=${F(t&&!this.disabled?this.href:void 0)}
        target=${F(t?this.target:void 0)}
        download=${F(t?this.download:void 0)}
        rel=${F(t?this.rel:void 0)}
        role=${F(t?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton()?this.handleInvalid:null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix"></slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${this.caret?Fr` <sl-icon part="caret" class="button__caret" library="system" name="caret"></sl-icon> `:""}
        ${this.loading?Fr`<sl-spinner part="spinner"></sl-spinner>`:""}
      </${e}>
    `}};le.styles=[H,cd];le.dependencies={"sl-icon":fe,"sl-spinner":ns};m([R(".button")],le.prototype,"button",2);m([V()],le.prototype,"hasFocus",2);m([V()],le.prototype,"invalid",2);m([k()],le.prototype,"title",2);m([k({reflect:!0})],le.prototype,"variant",2);m([k({reflect:!0})],le.prototype,"size",2);m([k({type:Boolean,reflect:!0})],le.prototype,"caret",2);m([k({type:Boolean,reflect:!0})],le.prototype,"disabled",2);m([k({type:Boolean,reflect:!0})],le.prototype,"loading",2);m([k({type:Boolean,reflect:!0})],le.prototype,"outline",2);m([k({type:Boolean,reflect:!0})],le.prototype,"pill",2);m([k({type:Boolean,reflect:!0})],le.prototype,"circle",2);m([k()],le.prototype,"type",2);m([k()],le.prototype,"name",2);m([k()],le.prototype,"value",2);m([k()],le.prototype,"href",2);m([k()],le.prototype,"target",2);m([k()],le.prototype,"rel",2);m([k()],le.prototype,"download",2);m([k()],le.prototype,"form",2);m([k({attribute:"formaction"})],le.prototype,"formAction",2);m([k({attribute:"formenctype"})],le.prototype,"formEnctype",2);m([k({attribute:"formmethod"})],le.prototype,"formMethod",2);m([k({attribute:"formnovalidate",type:Boolean})],le.prototype,"formNoValidate",2);m([k({attribute:"formtarget"})],le.prototype,"formTarget",2);m([M("disabled",{waitUntilFirstUpdate:!0})],le.prototype,"handleDisabledChange",1);function Ne(t,e){bm(t)&&(t="100%");const i=gm(t);return t=e===360?t:Math.min(e,Math.max(0,parseFloat(t))),i&&(t=parseInt(String(t*e),10)/100),Math.abs(t-e)<1e-6?1:(e===360?t=(t<0?t%e+e:t%e)/parseFloat(String(e)):t=t%e/parseFloat(String(e)),t)}function ks(t){return Math.min(1,Math.max(0,t))}function bm(t){return typeof t=="string"&&t.indexOf(".")!==-1&&parseFloat(t)===1}function gm(t){return typeof t=="string"&&t.indexOf("%")!==-1}function yd(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function Ss(t){return Number(t)<=1?`${Number(t)*100}%`:t}function wi(t){return t.length===1?"0"+t:String(t)}function ym(t,e,i){return{r:Ne(t,255)*255,g:Ne(e,255)*255,b:Ne(i,255)*255}}function nu(t,e,i){t=Ne(t,255),e=Ne(e,255),i=Ne(i,255);const r=Math.max(t,e,i),s=Math.min(t,e,i);let n=0,o=0;const l=(r+s)/2;if(r===s)o=0,n=0;else{const u=r-s;switch(o=l>.5?u/(2-r-s):u/(r+s),r){case t:n=(e-i)/u+(e<i?6:0);break;case e:n=(i-t)/u+2;break;case i:n=(t-e)/u+4;break}n/=6}return{h:n,s:o,l}}function so(t,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?t+(e-t)*(6*i):i<1/2?e:i<2/3?t+(e-t)*(2/3-i)*6:t}function vm(t,e,i){let r,s,n;if(t=Ne(t,360),e=Ne(e,100),i=Ne(i,100),e===0)s=i,n=i,r=i;else{const o=i<.5?i*(1+e):i+e-i*e,l=2*i-o;r=so(l,o,t+1/3),s=so(l,o,t),n=so(l,o,t-1/3)}return{r:r*255,g:s*255,b:n*255}}function ou(t,e,i){t=Ne(t,255),e=Ne(e,255),i=Ne(i,255);const r=Math.max(t,e,i),s=Math.min(t,e,i);let n=0;const o=r,l=r-s,u=r===0?0:l/r;if(r===s)n=0;else{switch(r){case t:n=(e-i)/l+(e<i?6:0);break;case e:n=(i-t)/l+2;break;case i:n=(t-e)/l+4;break}n/=6}return{h:n,s:u,v:o}}function wm(t,e,i){t=Ne(t,360)*6,e=Ne(e,100),i=Ne(i,100);const r=Math.floor(t),s=t-r,n=i*(1-e),o=i*(1-s*e),l=i*(1-(1-s)*e),u=r%6,c=[i,o,n,n,l,i][u],h=[l,i,i,o,n,n][u],f=[n,n,l,i,i,o][u];return{r:c*255,g:h*255,b:f*255}}function au(t,e,i,r){const s=[wi(Math.round(t).toString(16)),wi(Math.round(e).toString(16)),wi(Math.round(i).toString(16))];return r&&s[0].startsWith(s[0].charAt(1))&&s[1].startsWith(s[1].charAt(1))&&s[2].startsWith(s[2].charAt(1))?s[0].charAt(0)+s[1].charAt(0)+s[2].charAt(0):s.join("")}function xm(t,e,i,r,s){const n=[wi(Math.round(t).toString(16)),wi(Math.round(e).toString(16)),wi(Math.round(i).toString(16)),wi(km(r))];return s&&n[0].startsWith(n[0].charAt(1))&&n[1].startsWith(n[1].charAt(1))&&n[2].startsWith(n[2].charAt(1))&&n[3].startsWith(n[3].charAt(1))?n[0].charAt(0)+n[1].charAt(0)+n[2].charAt(0)+n[3].charAt(0):n.join("")}function _m(t,e,i,r){const s=t/100,n=e/100,o=i/100,l=r/100,u=255*(1-s)*(1-l),c=255*(1-n)*(1-l),h=255*(1-o)*(1-l);return{r:u,g:c,b:h}}function lu(t,e,i){let r=1-t/255,s=1-e/255,n=1-i/255,o=Math.min(r,s,n);return o===1?(r=0,s=0,n=0):(r=(r-o)/(1-o)*100,s=(s-o)/(1-o)*100,n=(n-o)/(1-o)*100),o*=100,{c:Math.round(r),m:Math.round(s),y:Math.round(n),k:Math.round(o)}}function km(t){return Math.round(parseFloat(t)*255).toString(16)}function uu(t){return Ge(t)/255}function Ge(t){return parseInt(t,16)}function Sm(t){return{r:t>>16,g:(t&65280)>>8,b:t&255}}const pa={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",goldenrod:"#daa520",gold:"#ffd700",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavenderblush:"#fff0f5",lavender:"#e6e6fa",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};function Cm(t){let e={r:0,g:0,b:0},i=1,r=null,s=null,n=null,o=!1,l=!1;return typeof t=="string"&&(t=Tm(t)),typeof t=="object"&&(We(t.r)&&We(t.g)&&We(t.b)?(e=ym(t.r,t.g,t.b),o=!0,l=String(t.r).substr(-1)==="%"?"prgb":"rgb"):We(t.h)&&We(t.s)&&We(t.v)?(r=Ss(t.s),s=Ss(t.v),e=wm(t.h,r,s),o=!0,l="hsv"):We(t.h)&&We(t.s)&&We(t.l)?(r=Ss(t.s),n=Ss(t.l),e=vm(t.h,r,n),o=!0,l="hsl"):We(t.c)&&We(t.m)&&We(t.y)&&We(t.k)&&(e=_m(t.c,t.m,t.y,t.k),o=!0,l="cmyk"),Object.prototype.hasOwnProperty.call(t,"a")&&(i=t.a)),i=yd(i),{ok:o,format:t.format||l,r:Math.min(255,Math.max(e.r,0)),g:Math.min(255,Math.max(e.g,0)),b:Math.min(255,Math.max(e.b,0)),a:i}}const Am="[-\\+]?\\d+%?",Em="[-\\+]?\\d*\\.\\d+%?",ei="(?:"+Em+")|(?:"+Am+")",no="[\\s|\\(]+("+ei+")[,|\\s]+("+ei+")[,|\\s]+("+ei+")\\s*\\)?",Cs="[\\s|\\(]+("+ei+")[,|\\s]+("+ei+")[,|\\s]+("+ei+")[,|\\s]+("+ei+")\\s*\\)?",nt={CSS_UNIT:new RegExp(ei),rgb:new RegExp("rgb"+no),rgba:new RegExp("rgba"+Cs),hsl:new RegExp("hsl"+no),hsla:new RegExp("hsla"+Cs),hsv:new RegExp("hsv"+no),hsva:new RegExp("hsva"+Cs),cmyk:new RegExp("cmyk"+Cs),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/};function Tm(t){if(t=t.trim().toLowerCase(),t.length===0)return!1;let e=!1;if(pa[t])t=pa[t],e=!0;else if(t==="transparent")return{r:0,g:0,b:0,a:0,format:"name"};let i=nt.rgb.exec(t);return i?{r:i[1],g:i[2],b:i[3]}:(i=nt.rgba.exec(t),i?{r:i[1],g:i[2],b:i[3],a:i[4]}:(i=nt.hsl.exec(t),i?{h:i[1],s:i[2],l:i[3]}:(i=nt.hsla.exec(t),i?{h:i[1],s:i[2],l:i[3],a:i[4]}:(i=nt.hsv.exec(t),i?{h:i[1],s:i[2],v:i[3]}:(i=nt.hsva.exec(t),i?{h:i[1],s:i[2],v:i[3],a:i[4]}:(i=nt.cmyk.exec(t),i?{c:i[1],m:i[2],y:i[3],k:i[4]}:(i=nt.hex8.exec(t),i?{r:Ge(i[1]),g:Ge(i[2]),b:Ge(i[3]),a:uu(i[4]),format:e?"name":"hex8"}:(i=nt.hex6.exec(t),i?{r:Ge(i[1]),g:Ge(i[2]),b:Ge(i[3]),format:e?"name":"hex"}:(i=nt.hex4.exec(t),i?{r:Ge(i[1]+i[1]),g:Ge(i[2]+i[2]),b:Ge(i[3]+i[3]),a:uu(i[4]+i[4]),format:e?"name":"hex8"}:(i=nt.hex3.exec(t),i?{r:Ge(i[1]+i[1]),g:Ge(i[2]+i[2]),b:Ge(i[3]+i[3]),format:e?"name":"hex"}:!1))))))))))}function We(t){return typeof t=="number"?!Number.isNaN(t):nt.CSS_UNIT.test(t)}class xe{constructor(e="",i={}){if(e instanceof xe)return e;typeof e=="number"&&(e=Sm(e)),this.originalInput=e;const r=Cm(e);this.originalInput=e,this.r=r.r,this.g=r.g,this.b=r.b,this.a=r.a,this.roundA=Math.round(100*this.a)/100,this.format=i.format??r.format,this.gradientType=i.gradientType,this.r<1&&(this.r=Math.round(this.r)),this.g<1&&(this.g=Math.round(this.g)),this.b<1&&(this.b=Math.round(this.b)),this.isValid=r.ok}isDark(){return this.getBrightness()<128}isLight(){return!this.isDark()}getBrightness(){const e=this.toRgb();return(e.r*299+e.g*587+e.b*114)/1e3}getLuminance(){const e=this.toRgb();let i,r,s;const n=e.r/255,o=e.g/255,l=e.b/255;return n<=.03928?i=n/12.92:i=Math.pow((n+.055)/1.055,2.4),o<=.03928?r=o/12.92:r=Math.pow((o+.055)/1.055,2.4),l<=.03928?s=l/12.92:s=Math.pow((l+.055)/1.055,2.4),.2126*i+.7152*r+.0722*s}getAlpha(){return this.a}setAlpha(e){return this.a=yd(e),this.roundA=Math.round(100*this.a)/100,this}isMonochrome(){const{s:e}=this.toHsl();return e===0}toHsv(){const e=ou(this.r,this.g,this.b);return{h:e.h*360,s:e.s,v:e.v,a:this.a}}toHsvString(){const e=ou(this.r,this.g,this.b),i=Math.round(e.h*360),r=Math.round(e.s*100),s=Math.round(e.v*100);return this.a===1?`hsv(${i}, ${r}%, ${s}%)`:`hsva(${i}, ${r}%, ${s}%, ${this.roundA})`}toHsl(){const e=nu(this.r,this.g,this.b);return{h:e.h*360,s:e.s,l:e.l,a:this.a}}toHslString(){const e=nu(this.r,this.g,this.b),i=Math.round(e.h*360),r=Math.round(e.s*100),s=Math.round(e.l*100);return this.a===1?`hsl(${i}, ${r}%, ${s}%)`:`hsla(${i}, ${r}%, ${s}%, ${this.roundA})`}toHex(e=!1){return au(this.r,this.g,this.b,e)}toHexString(e=!1){return"#"+this.toHex(e)}toHex8(e=!1){return xm(this.r,this.g,this.b,this.a,e)}toHex8String(e=!1){return"#"+this.toHex8(e)}toHexShortString(e=!1){return this.a===1?this.toHexString(e):this.toHex8String(e)}toRgb(){return{r:Math.round(this.r),g:Math.round(this.g),b:Math.round(this.b),a:this.a}}toRgbString(){const e=Math.round(this.r),i=Math.round(this.g),r=Math.round(this.b);return this.a===1?`rgb(${e}, ${i}, ${r})`:`rgba(${e}, ${i}, ${r}, ${this.roundA})`}toPercentageRgb(){const e=i=>`${Math.round(Ne(i,255)*100)}%`;return{r:e(this.r),g:e(this.g),b:e(this.b),a:this.a}}toPercentageRgbString(){const e=i=>Math.round(Ne(i,255)*100);return this.a===1?`rgb(${e(this.r)}%, ${e(this.g)}%, ${e(this.b)}%)`:`rgba(${e(this.r)}%, ${e(this.g)}%, ${e(this.b)}%, ${this.roundA})`}toCmyk(){return{...lu(this.r,this.g,this.b)}}toCmykString(){const{c:e,m:i,y:r,k:s}=lu(this.r,this.g,this.b);return`cmyk(${e}, ${i}, ${r}, ${s})`}toName(){if(this.a===0)return"transparent";if(this.a<1)return!1;const e="#"+au(this.r,this.g,this.b,!1);for(const[i,r]of Object.entries(pa))if(e===r)return i;return!1}toString(e){const i=!!e;e=e??this.format;let r=!1;const s=this.a<1&&this.a>=0;return!i&&s&&(e.startsWith("hex")||e==="name")?e==="name"&&this.a===0?this.toName():this.toRgbString():(e==="rgb"&&(r=this.toRgbString()),e==="prgb"&&(r=this.toPercentageRgbString()),(e==="hex"||e==="hex6")&&(r=this.toHexString()),e==="hex3"&&(r=this.toHexString(!0)),e==="hex4"&&(r=this.toHex8String(!0)),e==="hex8"&&(r=this.toHex8String()),e==="name"&&(r=this.toName()),e==="hsl"&&(r=this.toHslString()),e==="hsv"&&(r=this.toHsvString()),e==="cmyk"&&(r=this.toCmykString()),r||this.toHexString())}toNumber(){return(Math.round(this.r)<<16)+(Math.round(this.g)<<8)+Math.round(this.b)}clone(){return new xe(this.toString())}lighten(e=10){const i=this.toHsl();return i.l+=e/100,i.l=ks(i.l),new xe(i)}brighten(e=10){const i=this.toRgb();return i.r=Math.max(0,Math.min(255,i.r-Math.round(255*-(e/100)))),i.g=Math.max(0,Math.min(255,i.g-Math.round(255*-(e/100)))),i.b=Math.max(0,Math.min(255,i.b-Math.round(255*-(e/100)))),new xe(i)}darken(e=10){const i=this.toHsl();return i.l-=e/100,i.l=ks(i.l),new xe(i)}tint(e=10){return this.mix("white",e)}shade(e=10){return this.mix("black",e)}desaturate(e=10){const i=this.toHsl();return i.s-=e/100,i.s=ks(i.s),new xe(i)}saturate(e=10){const i=this.toHsl();return i.s+=e/100,i.s=ks(i.s),new xe(i)}greyscale(){return this.desaturate(100)}spin(e){const i=this.toHsl(),r=(i.h+e)%360;return i.h=r<0?360+r:r,new xe(i)}mix(e,i=50){const r=this.toRgb(),s=new xe(e).toRgb(),n=i/100,o={r:(s.r-r.r)*n+r.r,g:(s.g-r.g)*n+r.g,b:(s.b-r.b)*n+r.b,a:(s.a-r.a)*n+r.a};return new xe(o)}analogous(e=6,i=30){const r=this.toHsl(),s=360/i,n=[this];for(r.h=(r.h-(s*e>>1)+720)%360;--e;)r.h=(r.h+s)%360,n.push(new xe(r));return n}complement(){const e=this.toHsl();return e.h=(e.h+180)%360,new xe(e)}monochromatic(e=6){const i=this.toHsv(),{h:r}=i,{s}=i;let{v:n}=i;const o=[],l=1/e;for(;e--;)o.push(new xe({h:r,s,v:n})),n=(n+l)%1;return o}splitcomplement(){const e=this.toHsl(),{h:i}=e;return[this,new xe({h:(i+72)%360,s:e.s,l:e.l}),new xe({h:(i+216)%360,s:e.s,l:e.l})]}onBackground(e){const i=this.toRgb(),r=new xe(e).toRgb(),s=i.a+r.a*(1-i.a);return new xe({r:(i.r*i.a+r.r*r.a*(1-i.a))/s,g:(i.g*i.a+r.g*r.a*(1-i.a))/s,b:(i.b*i.a+r.b*r.a*(1-i.a))/s,a:s})}triad(){return this.polyad(3)}tetrad(){return this.polyad(4)}polyad(e){const i=this.toHsl(),{h:r}=i,s=[this],n=360/e;for(let o=1;o<e;o++)s.push(new xe({h:(r+o*n)%360,s:i.s,l:i.l}));return s}equals(e){const i=new xe(e);return this.format==="cmyk"||i.format==="cmyk"?this.toCmykString()===i.toCmykString():this.toRgbString()===i.toRgbString()}}var cu="EyeDropper"in window,te=class extends q{constructor(){super(),this.formControlController=new Xt(this),this.isSafeValue=!1,this.localize=new ie(this),this.hasFocus=!1,this.isDraggingGridHandle=!1,this.isEmpty=!1,this.inputValue="",this.hue=0,this.saturation=100,this.brightness=100,this.alpha=100,this.value="",this.defaultValue="",this.label="",this.format="hex",this.inline=!1,this.size="medium",this.noFormatToggle=!1,this.name="",this.disabled=!1,this.hoist=!1,this.opacity=!1,this.uppercase=!1,this.swatches="",this.form="",this.required=!1,this.handleFocusIn=()=>{this.hasFocus=!0,this.emit("sl-focus")},this.handleFocusOut=()=>{this.hasFocus=!1,this.emit("sl-blur")},this.addEventListener("focusin",this.handleFocusIn),this.addEventListener("focusout",this.handleFocusOut)}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.input.updateComplete.then(()=>{this.formControlController.updateValidity()})}handleCopy(){this.input.select(),document.execCommand("copy"),this.previewButton.focus(),this.previewButton.classList.add("color-picker__preview-color--copied"),this.previewButton.addEventListener("animationend",()=>{this.previewButton.classList.remove("color-picker__preview-color--copied")})}handleFormatToggle(){const t=["hex","rgb","hsl","hsv"],e=(t.indexOf(this.format)+1)%t.length;this.format=t[e],this.setColor(this.value),this.emit("sl-change"),this.emit("sl-input")}handleAlphaDrag(t){const e=this.shadowRoot.querySelector(".color-picker__slider.color-picker__alpha"),i=e.querySelector(".color-picker__slider-handle"),{width:r}=e.getBoundingClientRect();let s=this.value,n=this.value;i.focus(),t.preventDefault(),Vr(e,{onMove:o=>{this.alpha=Ce(o/r*100,0,100),this.syncValues(),this.value!==n&&(n=this.value,this.emit("sl-input"))},onStop:()=>{this.value!==s&&(s=this.value,this.emit("sl-change"))},initialEvent:t})}handleHueDrag(t){const e=this.shadowRoot.querySelector(".color-picker__slider.color-picker__hue"),i=e.querySelector(".color-picker__slider-handle"),{width:r}=e.getBoundingClientRect();let s=this.value,n=this.value;i.focus(),t.preventDefault(),Vr(e,{onMove:o=>{this.hue=Ce(o/r*360,0,360),this.syncValues(),this.value!==n&&(n=this.value,this.emit("sl-input"))},onStop:()=>{this.value!==s&&(s=this.value,this.emit("sl-change"))},initialEvent:t})}handleGridDrag(t){const e=this.shadowRoot.querySelector(".color-picker__grid"),i=e.querySelector(".color-picker__grid-handle"),{width:r,height:s}=e.getBoundingClientRect();let n=this.value,o=this.value;i.focus(),t.preventDefault(),this.isDraggingGridHandle=!0,Vr(e,{onMove:(l,u)=>{this.saturation=Ce(l/r*100,0,100),this.brightness=Ce(100-u/s*100,0,100),this.syncValues(),this.value!==o&&(o=this.value,this.emit("sl-input"))},onStop:()=>{this.isDraggingGridHandle=!1,this.value!==n&&(n=this.value,this.emit("sl-change"))},initialEvent:t})}handleAlphaKeyDown(t){const e=t.shiftKey?10:1,i=this.value;t.key==="ArrowLeft"&&(t.preventDefault(),this.alpha=Ce(this.alpha-e,0,100),this.syncValues()),t.key==="ArrowRight"&&(t.preventDefault(),this.alpha=Ce(this.alpha+e,0,100),this.syncValues()),t.key==="Home"&&(t.preventDefault(),this.alpha=0,this.syncValues()),t.key==="End"&&(t.preventDefault(),this.alpha=100,this.syncValues()),this.value!==i&&(this.emit("sl-change"),this.emit("sl-input"))}handleHueKeyDown(t){const e=t.shiftKey?10:1,i=this.value;t.key==="ArrowLeft"&&(t.preventDefault(),this.hue=Ce(this.hue-e,0,360),this.syncValues()),t.key==="ArrowRight"&&(t.preventDefault(),this.hue=Ce(this.hue+e,0,360),this.syncValues()),t.key==="Home"&&(t.preventDefault(),this.hue=0,this.syncValues()),t.key==="End"&&(t.preventDefault(),this.hue=360,this.syncValues()),this.value!==i&&(this.emit("sl-change"),this.emit("sl-input"))}handleGridKeyDown(t){const e=t.shiftKey?10:1,i=this.value;t.key==="ArrowLeft"&&(t.preventDefault(),this.saturation=Ce(this.saturation-e,0,100),this.syncValues()),t.key==="ArrowRight"&&(t.preventDefault(),this.saturation=Ce(this.saturation+e,0,100),this.syncValues()),t.key==="ArrowUp"&&(t.preventDefault(),this.brightness=Ce(this.brightness+e,0,100),this.syncValues()),t.key==="ArrowDown"&&(t.preventDefault(),this.brightness=Ce(this.brightness-e,0,100),this.syncValues()),this.value!==i&&(this.emit("sl-change"),this.emit("sl-input"))}handleInputChange(t){const e=t.target,i=this.value;t.stopPropagation(),this.input.value?(this.setColor(e.value),e.value=this.value):this.value="",this.value!==i&&(this.emit("sl-change"),this.emit("sl-input"))}handleInputInput(t){this.formControlController.updateValidity(),t.stopPropagation()}handleInputKeyDown(t){if(t.key==="Enter"){const e=this.value;this.input.value?(this.setColor(this.input.value),this.input.value=this.value,this.value!==e&&(this.emit("sl-change"),this.emit("sl-input")),setTimeout(()=>this.input.select())):this.hue=0}}handleInputInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleTouchMove(t){t.preventDefault()}parseColor(t){const e=new xe(t);if(!e.isValid)return null;const i=e.toHsl(),r={h:i.h,s:i.s*100,l:i.l*100,a:i.a},s=e.toRgb(),n=e.toHexString(),o=e.toHex8String(),l=e.toHsv(),u={h:l.h,s:l.s*100,v:l.v*100,a:l.a};return{hsl:{h:r.h,s:r.s,l:r.l,string:this.setLetterCase(`hsl(${Math.round(r.h)}, ${Math.round(r.s)}%, ${Math.round(r.l)}%)`)},hsla:{h:r.h,s:r.s,l:r.l,a:r.a,string:this.setLetterCase(`hsla(${Math.round(r.h)}, ${Math.round(r.s)}%, ${Math.round(r.l)}%, ${r.a.toFixed(2).toString()})`)},hsv:{h:u.h,s:u.s,v:u.v,string:this.setLetterCase(`hsv(${Math.round(u.h)}, ${Math.round(u.s)}%, ${Math.round(u.v)}%)`)},hsva:{h:u.h,s:u.s,v:u.v,a:u.a,string:this.setLetterCase(`hsva(${Math.round(u.h)}, ${Math.round(u.s)}%, ${Math.round(u.v)}%, ${u.a.toFixed(2).toString()})`)},rgb:{r:s.r,g:s.g,b:s.b,string:this.setLetterCase(`rgb(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)})`)},rgba:{r:s.r,g:s.g,b:s.b,a:s.a,string:this.setLetterCase(`rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a.toFixed(2).toString()})`)},hex:this.setLetterCase(n),hexa:this.setLetterCase(o)}}setColor(t){const e=this.parseColor(t);return e===null?!1:(this.hue=e.hsva.h,this.saturation=e.hsva.s,this.brightness=e.hsva.v,this.alpha=this.opacity?e.hsva.a*100:100,this.syncValues(),!0)}setLetterCase(t){return typeof t!="string"?"":this.uppercase?t.toUpperCase():t.toLowerCase()}async syncValues(){const t=this.parseColor(`hsva(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha/100})`);t!==null&&(this.format==="hsl"?this.inputValue=this.opacity?t.hsla.string:t.hsl.string:this.format==="rgb"?this.inputValue=this.opacity?t.rgba.string:t.rgb.string:this.format==="hsv"?this.inputValue=this.opacity?t.hsva.string:t.hsv.string:this.inputValue=this.opacity?t.hexa:t.hex,this.isSafeValue=!0,this.value=this.inputValue,await this.updateComplete,this.isSafeValue=!1)}handleAfterHide(){this.previewButton.classList.remove("color-picker__preview-color--copied")}handleEyeDropper(){if(!cu)return;new EyeDropper().open().then(e=>{const i=this.value;this.setColor(e.sRGBHex),this.value!==i&&(this.emit("sl-change"),this.emit("sl-input"))}).catch(()=>{})}selectSwatch(t){const e=this.value;this.disabled||(this.setColor(t),this.value!==e&&(this.emit("sl-change"),this.emit("sl-input")))}getHexString(t,e,i,r=100){const s=new xe(`hsva(${t}, ${e}%, ${i}%, ${r/100})`);return s.isValid?s.toHex8String():""}stopNestedEventPropagation(t){t.stopImmediatePropagation()}handleFormatChange(){this.syncValues()}handleOpacityChange(){this.alpha=100}handleValueChange(t,e){if(this.isEmpty=!e,e||(this.hue=0,this.saturation=0,this.brightness=100,this.alpha=100),!this.isSafeValue){const i=this.parseColor(e);i!==null?(this.inputValue=this.value,this.hue=i.hsva.h,this.saturation=i.hsva.s,this.brightness=i.hsva.v,this.alpha=i.hsva.a*100,this.syncValues()):this.inputValue=t??""}}focus(t){this.inline?this.base.focus(t):this.trigger.focus(t)}blur(){var t;const e=this.inline?this.base:this.trigger;this.hasFocus&&(e.focus({preventScroll:!0}),e.blur()),(t=this.dropdown)!=null&&t.open&&this.dropdown.hide()}getFormattedValue(t="hex"){const e=this.parseColor(`hsva(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha/100})`);if(e===null)return"";switch(t){case"hex":return e.hex;case"hexa":return e.hexa;case"rgb":return e.rgb.string;case"rgba":return e.rgba.string;case"hsl":return e.hsl.string;case"hsla":return e.hsla.string;case"hsv":return e.hsv.string;case"hsva":return e.hsva.string;default:return""}}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return!this.inline&&!this.validity.valid?(this.dropdown.show(),this.addEventListener("sl-after-show",()=>this.input.reportValidity(),{once:!0}),this.disabled||this.formControlController.emitInvalidEvent(),!1):this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.saturation,e=100-this.brightness,i=Array.isArray(this.swatches)?this.swatches:this.swatches.split(";").filter(s=>s.trim()!==""),r=N`
      <div
        part="base"
        class=${j({"color-picker":!0,"color-picker--inline":this.inline,"color-picker--disabled":this.disabled,"color-picker--focused":this.hasFocus})}
        aria-disabled=${this.disabled?"true":"false"}
        aria-labelledby="label"
        tabindex=${this.inline?"0":"-1"}
      >
        ${this.inline?N`
              <sl-visually-hidden id="label">
                <slot name="label">${this.label}</slot>
              </sl-visually-hidden>
            `:null}

        <div
          part="grid"
          class="color-picker__grid"
          style=${He({backgroundColor:this.getHexString(this.hue,100,100)})}
          @pointerdown=${this.handleGridDrag}
          @touchmove=${this.handleTouchMove}
        >
          <span
            part="grid-handle"
            class=${j({"color-picker__grid-handle":!0,"color-picker__grid-handle--dragging":this.isDraggingGridHandle})}
            style=${He({top:`${e}%`,left:`${t}%`,backgroundColor:this.getHexString(this.hue,this.saturation,this.brightness,this.alpha)})}
            role="application"
            aria-label="HSV"
            tabindex=${F(this.disabled?void 0:"0")}
            @keydown=${this.handleGridKeyDown}
          ></span>
        </div>

        <div class="color-picker__controls">
          <div class="color-picker__sliders">
            <div
              part="slider hue-slider"
              class="color-picker__hue color-picker__slider"
              @pointerdown=${this.handleHueDrag}
              @touchmove=${this.handleTouchMove}
            >
              <span
                part="slider-handle hue-slider-handle"
                class="color-picker__slider-handle"
                style=${He({left:`${this.hue===0?0:100/(360/this.hue)}%`})}
                role="slider"
                aria-label="hue"
                aria-orientation="horizontal"
                aria-valuemin="0"
                aria-valuemax="360"
                aria-valuenow=${`${Math.round(this.hue)}`}
                tabindex=${F(this.disabled?void 0:"0")}
                @keydown=${this.handleHueKeyDown}
              ></span>
            </div>

            ${this.opacity?N`
                  <div
                    part="slider opacity-slider"
                    class="color-picker__alpha color-picker__slider color-picker__transparent-bg"
                    @pointerdown="${this.handleAlphaDrag}"
                    @touchmove=${this.handleTouchMove}
                  >
                    <div
                      class="color-picker__alpha-gradient"
                      style=${He({backgroundImage:`linear-gradient(
                          to right,
                          ${this.getHexString(this.hue,this.saturation,this.brightness,0)} 0%,
                          ${this.getHexString(this.hue,this.saturation,this.brightness,100)} 100%
                        )`})}
                    ></div>
                    <span
                      part="slider-handle opacity-slider-handle"
                      class="color-picker__slider-handle"
                      style=${He({left:`${this.alpha}%`})}
                      role="slider"
                      aria-label="alpha"
                      aria-orientation="horizontal"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow=${Math.round(this.alpha)}
                      tabindex=${F(this.disabled?void 0:"0")}
                      @keydown=${this.handleAlphaKeyDown}
                    ></span>
                  </div>
                `:""}
          </div>

          <button
            type="button"
            part="preview"
            class="color-picker__preview color-picker__transparent-bg"
            aria-label=${this.localize.term("copy")}
            style=${He({"--preview-color":this.getHexString(this.hue,this.saturation,this.brightness,this.alpha)})}
            @click=${this.handleCopy}
          ></button>
        </div>

        <div class="color-picker__user-input" aria-live="polite">
          <sl-input
            part="input"
            type="text"
            name=${this.name}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            value=${this.isEmpty?"":this.inputValue}
            ?required=${this.required}
            ?disabled=${this.disabled}
            aria-label=${this.localize.term("currentValue")}
            @keydown=${this.handleInputKeyDown}
            @sl-change=${this.handleInputChange}
            @sl-input=${this.handleInputInput}
            @sl-invalid=${this.handleInputInvalid}
            @sl-blur=${this.stopNestedEventPropagation}
            @sl-focus=${this.stopNestedEventPropagation}
          ></sl-input>

          <sl-button-group>
            ${this.noFormatToggle?"":N`
                  <sl-button
                    part="format-button"
                    aria-label=${this.localize.term("toggleColorFormat")}
                    exportparts="
                      base:format-button__base,
                      prefix:format-button__prefix,
                      label:format-button__label,
                      suffix:format-button__suffix,
                      caret:format-button__caret
                    "
                    @click=${this.handleFormatToggle}
                    @sl-blur=${this.stopNestedEventPropagation}
                    @sl-focus=${this.stopNestedEventPropagation}
                  >
                    ${this.setLetterCase(this.format)}
                  </sl-button>
                `}
            ${cu?N`
                  <sl-button
                    part="eye-dropper-button"
                    exportparts="
                      base:eye-dropper-button__base,
                      prefix:eye-dropper-button__prefix,
                      label:eye-dropper-button__label,
                      suffix:eye-dropper-button__suffix,
                      caret:eye-dropper-button__caret
                    "
                    @click=${this.handleEyeDropper}
                    @sl-blur=${this.stopNestedEventPropagation}
                    @sl-focus=${this.stopNestedEventPropagation}
                  >
                    <sl-icon
                      library="system"
                      name="eyedropper"
                      label=${this.localize.term("selectAColorFromTheScreen")}
                    ></sl-icon>
                  </sl-button>
                `:""}
          </sl-button-group>
        </div>

        ${i.length>0?N`
              <div part="swatches" class="color-picker__swatches">
                ${i.map(s=>{const n=this.parseColor(s);return n?N`
                    <div
                      part="swatch"
                      class="color-picker__swatch color-picker__transparent-bg"
                      tabindex=${F(this.disabled?void 0:"0")}
                      role="button"
                      aria-label=${s}
                      @click=${()=>this.selectSwatch(s)}
                      @keydown=${o=>!this.disabled&&o.key==="Enter"&&this.setColor(n.hexa)}
                    >
                      <div
                        class="color-picker__swatch-color"
                        style=${He({backgroundColor:n.hexa})}
                      ></div>
                    </div>
                  `:(console.error(`Unable to parse swatch color: "${s}"`,this),"")})}
              </div>
            `:""}
      </div>
    `;return this.inline?r:N`
      <sl-dropdown
        class="color-dropdown"
        aria-disabled=${this.disabled?"true":"false"}
        .containingElement=${this}
        ?disabled=${this.disabled}
        ?hoist=${this.hoist}
        @sl-after-hide=${this.handleAfterHide}
      >
        <button
          part="trigger"
          slot="trigger"
          class=${j({"color-dropdown__trigger":!0,"color-dropdown__trigger--disabled":this.disabled,"color-dropdown__trigger--small":this.size==="small","color-dropdown__trigger--medium":this.size==="medium","color-dropdown__trigger--large":this.size==="large","color-dropdown__trigger--empty":this.isEmpty,"color-dropdown__trigger--focused":this.hasFocus,"color-picker__transparent-bg":!0})}
          style=${He({color:this.getHexString(this.hue,this.saturation,this.brightness,this.alpha)})}
          type="button"
        >
          <sl-visually-hidden>
            <slot name="label">${this.label}</slot>
          </sl-visually-hidden>
        </button>
        ${r}
      </sl-dropdown>
    `}};te.styles=[H,mm];te.dependencies={"sl-button-group":Mi,"sl-button":le,"sl-dropdown":Me,"sl-icon":fe,"sl-input":Q,"sl-visually-hidden":Ra};m([R('[part~="base"]')],te.prototype,"base",2);m([R('[part~="input"]')],te.prototype,"input",2);m([R(".color-dropdown")],te.prototype,"dropdown",2);m([R('[part~="preview"]')],te.prototype,"previewButton",2);m([R('[part~="trigger"]')],te.prototype,"trigger",2);m([V()],te.prototype,"hasFocus",2);m([V()],te.prototype,"isDraggingGridHandle",2);m([V()],te.prototype,"isEmpty",2);m([V()],te.prototype,"inputValue",2);m([V()],te.prototype,"hue",2);m([V()],te.prototype,"saturation",2);m([V()],te.prototype,"brightness",2);m([V()],te.prototype,"alpha",2);m([k()],te.prototype,"value",2);m([ur()],te.prototype,"defaultValue",2);m([k()],te.prototype,"label",2);m([k()],te.prototype,"format",2);m([k({type:Boolean,reflect:!0})],te.prototype,"inline",2);m([k({reflect:!0})],te.prototype,"size",2);m([k({attribute:"no-format-toggle",type:Boolean})],te.prototype,"noFormatToggle",2);m([k()],te.prototype,"name",2);m([k({type:Boolean,reflect:!0})],te.prototype,"disabled",2);m([k({type:Boolean})],te.prototype,"hoist",2);m([k({type:Boolean})],te.prototype,"opacity",2);m([k({type:Boolean})],te.prototype,"uppercase",2);m([k()],te.prototype,"swatches",2);m([k({reflect:!0})],te.prototype,"form",2);m([k({type:Boolean,reflect:!0})],te.prototype,"required",2);m([is({passive:!1})],te.prototype,"handleTouchMove",1);m([M("format",{waitUntilFirstUpdate:!0})],te.prototype,"handleFormatChange",1);m([M("opacity",{waitUntilFirstUpdate:!0})],te.prototype,"handleOpacityChange",1);m([M("value")],te.prototype,"handleValueChange",1);te.define("sl-color-picker");var Om=U`
  :host {
    --border-color: var(--sl-color-neutral-200);
    --border-radius: var(--sl-border-radius-medium);
    --border-width: 1px;
    --padding: var(--sl-spacing-large);

    display: inline-block;
  }

  .card {
    display: flex;
    flex-direction: column;
    background-color: var(--sl-panel-background-color);
    box-shadow: var(--sl-shadow-x-small);
    border: solid var(--border-width) var(--border-color);
    border-radius: var(--border-radius);
  }

  .card__image {
    display: flex;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    margin: calc(-1 * var(--border-width));
    overflow: hidden;
  }

  .card__image::slotted(img) {
    display: block;
    width: 100%;
  }

  .card:not(.card--has-image) .card__image {
    display: none;
  }

  .card__header {
    display: block;
    border-bottom: solid var(--border-width) var(--border-color);
    padding: calc(var(--padding) / 2) var(--padding);
  }

  .card:not(.card--has-header) .card__header {
    display: none;
  }

  .card:not(.card--has-image) .card__header {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
  }

  .card__body {
    display: block;
    padding: var(--padding);
  }

  .card--has-footer .card__footer {
    display: block;
    border-top: solid var(--border-width) var(--border-color);
    padding: var(--padding);
  }

  .card:not(.card--has-footer) .card__footer {
    display: none;
  }
`,vd=class extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"footer","header","image")}render(){return N`
      <div
        part="base"
        class=${j({card:!0,"card--has-footer":this.hasSlotController.test("footer"),"card--has-image":this.hasSlotController.test("image"),"card--has-header":this.hasSlotController.test("header")})}
      >
        <slot name="image" part="image" class="card__image"></slot>
        <slot name="header" part="header" class="card__header"></slot>
        <slot part="body" class="card__body"></slot>
        <slot name="footer" part="footer" class="card__footer"></slot>
      </div>
    `}};vd.styles=[H,Om];vd.define("sl-card");var $m=class{constructor(t,e){this.timerId=0,this.activeInteractions=0,this.paused=!1,this.stopped=!0,this.pause=()=>{this.activeInteractions++||(this.paused=!0,this.host.requestUpdate())},this.resume=()=>{--this.activeInteractions||(this.paused=!1,this.host.requestUpdate())},t.addController(this),this.host=t,this.tickCallback=e}hostConnected(){this.host.addEventListener("mouseenter",this.pause),this.host.addEventListener("mouseleave",this.resume),this.host.addEventListener("focusin",this.pause),this.host.addEventListener("focusout",this.resume),this.host.addEventListener("touchstart",this.pause,{passive:!0}),this.host.addEventListener("touchend",this.resume)}hostDisconnected(){this.stop(),this.host.removeEventListener("mouseenter",this.pause),this.host.removeEventListener("mouseleave",this.resume),this.host.removeEventListener("focusin",this.pause),this.host.removeEventListener("focusout",this.resume),this.host.removeEventListener("touchstart",this.pause),this.host.removeEventListener("touchend",this.resume)}start(t){this.stop(),this.stopped=!1,this.timerId=window.setInterval(()=>{this.paused||this.tickCallback()},t)}stop(){clearInterval(this.timerId),this.stopped=!0,this.host.requestUpdate()}},Im=U`
  :host {
    --slide-gap: var(--sl-spacing-medium, 1rem);
    --aspect-ratio: 16 / 9;
    --scroll-hint: 0px;

    display: flex;
  }

  .carousel {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      '. slides .'
      '. pagination .';
    gap: var(--sl-spacing-medium);
    align-items: center;
    min-height: 100%;
    min-width: 100%;
    position: relative;
  }

  .carousel__pagination {
    grid-area: pagination;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--sl-spacing-small);
  }

  .carousel__slides {
    grid-area: slides;

    display: grid;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-items: center;
    overflow: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    aspect-ratio: calc(var(--aspect-ratio) * var(--slides-per-page));
    border-radius: var(--sl-border-radius-small);

    --slide-size: calc((100% - (var(--slides-per-page) - 1) * var(--slide-gap)) / var(--slides-per-page));
  }

  @media (prefers-reduced-motion) {
    :where(.carousel__slides) {
      scroll-behavior: auto;
    }
  }

  .carousel__slides--horizontal {
    grid-auto-flow: column;
    grid-auto-columns: var(--slide-size);
    grid-auto-rows: 100%;
    column-gap: var(--slide-gap);
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--scroll-hint);
    padding-inline: var(--scroll-hint);
    overflow-y: hidden;
  }

  .carousel__slides--vertical {
    grid-auto-flow: row;
    grid-auto-columns: 100%;
    grid-auto-rows: var(--slide-size);
    row-gap: var(--slide-gap);
    scroll-snap-type: y mandatory;
    scroll-padding-block: var(--scroll-hint);
    padding-block: var(--scroll-hint);
    overflow-x: hidden;
  }

  .carousel__slides--dragging {
  }

  :host([vertical]) ::slotted(sl-carousel-item) {
    height: 100%;
  }

  .carousel__slides::-webkit-scrollbar {
    display: none;
  }

  .carousel__navigation {
    grid-area: navigation;
    display: contents;
    font-size: var(--sl-font-size-x-large);
  }

  .carousel__navigation-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-small);
    font-size: inherit;
    color: var(--sl-color-neutral-600);
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-medium) color;
    appearance: none;
  }

  .carousel__navigation-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .carousel__navigation-button--disabled::part(base) {
    pointer-events: none;
  }

  .carousel__navigation-button--previous {
    grid-column: 1;
    grid-row: 1;
  }

  .carousel__navigation-button--next {
    grid-column: 3;
    grid-row: 1;
  }

  .carousel__pagination-item {
    display: block;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--sl-border-radius-circle);
    width: var(--sl-spacing-small);
    height: var(--sl-spacing-small);
    background-color: var(--sl-color-neutral-300);
    padding: 0;
    margin: 0;
  }

  .carousel__pagination-item--active {
    background-color: var(--sl-color-neutral-700);
    transform: scale(1.2);
  }

  /* Focus styles */
  .carousel__slides:focus-visible,
  .carousel__navigation-button:focus-visible,
  .carousel__pagination-item:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }
`;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function*Lm(t,e){if(t!==void 0){let i=0;for(const r of t)yield e(r,i++)}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function*Nm(t,e,i=1){const r=e===void 0?0:t;e??=t;for(let s=r;i>0?s<e:e<s;s+=i)yield s}var Se=class extends q{constructor(){super(...arguments),this.loop=!1,this.navigation=!1,this.pagination=!1,this.autoplay=!1,this.autoplayInterval=3e3,this.slidesPerPage=1,this.slidesPerMove=1,this.orientation="horizontal",this.mouseDragging=!1,this.activeSlide=0,this.scrolling=!1,this.dragging=!1,this.autoplayController=new $m(this,()=>this.next()),this.dragStartPosition=[-1,-1],this.localize=new ie(this),this.pendingSlideChange=!1,this.handleMouseDrag=t=>{this.dragging||(this.scrollContainer.style.setProperty("scroll-snap-type","none"),this.dragging=!0,this.dragStartPosition=[t.clientX,t.clientY]),this.scrollContainer.scrollBy({left:-t.movementX,top:-t.movementY,behavior:"instant"})},this.handleMouseDragEnd=()=>{const t=this.scrollContainer;document.removeEventListener("pointermove",this.handleMouseDrag,{capture:!0});const e=t.scrollLeft,i=t.scrollTop;t.style.removeProperty("scroll-snap-type"),t.style.setProperty("overflow","hidden");const r=t.scrollLeft,s=t.scrollTop;t.style.removeProperty("overflow"),t.style.setProperty("scroll-snap-type","none"),t.scrollTo({left:e,top:i,behavior:"instant"}),requestAnimationFrame(async()=>{(e!==r||i!==s)&&(t.scrollTo({left:r,top:s,behavior:na()?"auto":"smooth"}),await Ue(t,"scrollend")),t.style.removeProperty("scroll-snap-type"),this.dragging=!1,this.dragStartPosition=[-1,-1],this.handleScrollEnd()})},this.handleSlotChange=t=>{t.some(i=>[...i.addedNodes,...i.removedNodes].some(r=>this.isCarouselItem(r)&&!r.hasAttribute("data-clone")))&&this.initializeSlides(),this.requestUpdate()}}connectedCallback(){super.connectedCallback(),this.setAttribute("role","region"),this.setAttribute("aria-label",this.localize.term("carousel"))}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.mutationObserver)==null||t.disconnect()}firstUpdated(){this.initializeSlides(),this.mutationObserver=new MutationObserver(this.handleSlotChange),this.mutationObserver.observe(this,{childList:!0,subtree:!0})}willUpdate(t){(t.has("slidesPerMove")||t.has("slidesPerPage"))&&(this.slidesPerMove=Math.min(this.slidesPerMove,this.slidesPerPage))}getPageCount(){const t=this.getSlides().length,{slidesPerPage:e,slidesPerMove:i,loop:r}=this,s=r?t/i:(t-e)/i+1;return Math.ceil(s)}getCurrentPage(){return Math.ceil(this.activeSlide/this.slidesPerMove)}canScrollNext(){return this.loop||this.getCurrentPage()<this.getPageCount()-1}canScrollPrev(){return this.loop||this.getCurrentPage()>0}getSlides({excludeClones:t=!0}={}){return[...this.children].filter(e=>this.isCarouselItem(e)&&(!t||!e.hasAttribute("data-clone")))}handleClick(t){if(this.dragging&&this.dragStartPosition[0]>0&&this.dragStartPosition[1]>0){const e=Math.abs(this.dragStartPosition[0]-t.clientX),i=Math.abs(this.dragStartPosition[1]-t.clientY);Math.sqrt(e*e+i*i)>=10&&t.preventDefault()}}handleKeyDown(t){if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(t.key)){const e=t.target,i=this.localize.dir()==="rtl",r=e.closest('[part~="pagination-item"]')!==null,s=t.key==="ArrowDown"||!i&&t.key==="ArrowRight"||i&&t.key==="ArrowLeft",n=t.key==="ArrowUp"||!i&&t.key==="ArrowLeft"||i&&t.key==="ArrowRight";t.preventDefault(),n&&this.previous(),s&&this.next(),t.key==="Home"&&this.goToSlide(0),t.key==="End"&&this.goToSlide(this.getSlides().length-1),r&&this.updateComplete.then(()=>{var o;const l=(o=this.shadowRoot)==null?void 0:o.querySelector('[part~="pagination-item--active"]');l&&l.focus()})}}handleMouseDragStart(t){this.mouseDragging&&t.button===0&&(t.preventDefault(),document.addEventListener("pointermove",this.handleMouseDrag,{capture:!0,passive:!0}),document.addEventListener("pointerup",this.handleMouseDragEnd,{capture:!0,once:!0}))}handleScroll(){this.scrolling=!0,this.pendingSlideChange||this.synchronizeSlides()}synchronizeSlides(){const t=new IntersectionObserver(e=>{t.disconnect();for(const l of e){const u=l.target;u.toggleAttribute("inert",!l.isIntersecting),u.classList.toggle("--in-view",l.isIntersecting),u.setAttribute("aria-hidden",l.isIntersecting?"false":"true")}const i=e.find(l=>l.isIntersecting);if(!i)return;const r=this.getSlides({excludeClones:!1}),s=this.getSlides().length,n=r.indexOf(i.target),o=this.loop?n-this.slidesPerPage:n;if(this.activeSlide=(Math.ceil(o/this.slidesPerMove)*this.slidesPerMove+s)%s,!this.scrolling&&this.loop&&i.target.hasAttribute("data-clone")){const l=Number(i.target.getAttribute("data-clone"));this.goToSlide(l,"instant")}},{root:this.scrollContainer,threshold:.6});this.getSlides({excludeClones:!1}).forEach(e=>{t.observe(e)})}handleScrollEnd(){!this.scrolling||this.dragging||(this.scrolling=!1,this.pendingSlideChange=!1,this.synchronizeSlides())}isCarouselItem(t){return t instanceof Element&&t.tagName.toLowerCase()==="sl-carousel-item"}initializeSlides(){this.getSlides({excludeClones:!1}).forEach((t,e)=>{t.classList.remove("--in-view"),t.classList.remove("--is-active"),t.setAttribute("role","group"),t.setAttribute("aria-label",this.localize.term("slideNum",e+1)),this.pagination&&(t.setAttribute("id",`slide-${e+1}`),t.setAttribute("role","tabpanel"),t.removeAttribute("aria-label"),t.setAttribute("aria-labelledby",`tab-${e+1}`)),t.hasAttribute("data-clone")&&t.remove()}),this.updateSlidesSnap(),this.loop&&this.createClones(),this.goToSlide(this.activeSlide,"auto"),this.synchronizeSlides()}createClones(){const t=this.getSlides(),e=this.slidesPerPage,i=t.slice(-e),r=t.slice(0,e);i.reverse().forEach((s,n)=>{const o=s.cloneNode(!0);o.setAttribute("data-clone",String(t.length-n-1)),this.prepend(o)}),r.forEach((s,n)=>{const o=s.cloneNode(!0);o.setAttribute("data-clone",String(n)),this.append(o)})}handleSlideChange(){const t=this.getSlides();t.forEach((e,i)=>{e.classList.toggle("--is-active",i===this.activeSlide)}),this.hasUpdated&&this.emit("sl-slide-change",{detail:{index:this.activeSlide,slide:t[this.activeSlide]}})}updateSlidesSnap(){const t=this.getSlides(),e=this.slidesPerMove;t.forEach((i,r)=>{(r+e)%e===0?i.style.removeProperty("scroll-snap-align"):i.style.setProperty("scroll-snap-align","none")})}handleAutoplayChange(){this.autoplayController.stop(),this.autoplay&&this.autoplayController.start(this.autoplayInterval)}previous(t="smooth"){this.goToSlide(this.activeSlide-this.slidesPerMove,t)}next(t="smooth"){this.goToSlide(this.activeSlide+this.slidesPerMove,t)}goToSlide(t,e="smooth"){const{slidesPerPage:i,loop:r}=this,s=this.getSlides(),n=this.getSlides({excludeClones:!1});if(!s.length)return;const o=r?(t+s.length)%s.length:Ce(t,0,s.length-i);this.activeSlide=o;const l=this.localize.dir()==="rtl",u=Ce(t+(r?i:0)+(l?i-1:0),0,n.length-1),c=n[u];this.scrollToSlide(c,na()?"auto":e)}scrollToSlide(t,e="smooth"){this.pendingSlideChange=!0,window.requestAnimationFrame(()=>{if(!this.scrollContainer)return;const i=this.scrollContainer,r=i.getBoundingClientRect(),s=t.getBoundingClientRect(),n=s.left-r.left,o=s.top-r.top;n||o?(this.pendingSlideChange=!0,i.scrollTo({left:n+i.scrollLeft,top:o+i.scrollTop,behavior:e})):this.pendingSlideChange=!1})}render(){const{slidesPerMove:t,scrolling:e}=this,i=this.getPageCount(),r=this.getCurrentPage(),s=this.canScrollPrev(),n=this.canScrollNext(),o=this.localize.dir()==="ltr";return N`
      <div part="base" class="carousel">
        <div
          id="scroll-container"
          part="scroll-container"
          class="${j({carousel__slides:!0,"carousel__slides--horizontal":this.orientation==="horizontal","carousel__slides--vertical":this.orientation==="vertical","carousel__slides--dragging":this.dragging})}"
          style="--slides-per-page: ${this.slidesPerPage};"
          aria-busy="${e?"true":"false"}"
          aria-atomic="true"
          tabindex="0"
          @keydown=${this.handleKeyDown}
          @mousedown="${this.handleMouseDragStart}"
          @scroll="${this.handleScroll}"
          @scrollend=${this.handleScrollEnd}
          @click=${this.handleClick}
        >
          <slot></slot>
        </div>

        ${this.navigation?N`
              <div part="navigation" class="carousel__navigation">
                <button
                  part="navigation-button navigation-button--previous"
                  class="${j({"carousel__navigation-button":!0,"carousel__navigation-button--previous":!0,"carousel__navigation-button--disabled":!s})}"
                  aria-label="${this.localize.term("previousSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${s?"false":"true"}"
                  @click=${s?()=>this.previous():null}
                >
                  <slot name="previous-icon">
                    <sl-icon library="system" name="${o?"chevron-left":"chevron-right"}"></sl-icon>
                  </slot>
                </button>

                <button
                  part="navigation-button navigation-button--next"
                  class=${j({"carousel__navigation-button":!0,"carousel__navigation-button--next":!0,"carousel__navigation-button--disabled":!n})}
                  aria-label="${this.localize.term("nextSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${n?"false":"true"}"
                  @click=${n?()=>this.next():null}
                >
                  <slot name="next-icon">
                    <sl-icon library="system" name="${o?"chevron-right":"chevron-left"}"></sl-icon>
                  </slot>
                </button>
              </div>
            `:""}
        ${this.pagination?N`
              <div part="pagination" role="tablist" class="carousel__pagination">
                ${Lm(Nm(i),l=>{const u=l===r;return N`
                    <button
                      part="pagination-item ${u?"pagination-item--active":""}"
                      class="${j({"carousel__pagination-item":!0,"carousel__pagination-item--active":u})}"
                      role="tab"
                      id="tab-${l+1}"
                      aria-controls="slide-${l+1}"
                      aria-selected="${u?"true":"false"}"
                      aria-label="${u?this.localize.term("slideNum",l+1):this.localize.term("goToSlide",l+1,i)}"
                      tabindex=${u?"0":"-1"}
                      @click=${()=>this.goToSlide(l*t)}
                      @keydown=${this.handleKeyDown}
                    ></button>
                  `})}
              </div>
            `:""}
      </div>
    `}};Se.styles=[H,Im];Se.dependencies={"sl-icon":fe};m([k({type:Boolean,reflect:!0})],Se.prototype,"loop",2);m([k({type:Boolean,reflect:!0})],Se.prototype,"navigation",2);m([k({type:Boolean,reflect:!0})],Se.prototype,"pagination",2);m([k({type:Boolean,reflect:!0})],Se.prototype,"autoplay",2);m([k({type:Number,attribute:"autoplay-interval"})],Se.prototype,"autoplayInterval",2);m([k({type:Number,attribute:"slides-per-page"})],Se.prototype,"slidesPerPage",2);m([k({type:Number,attribute:"slides-per-move"})],Se.prototype,"slidesPerMove",2);m([k()],Se.prototype,"orientation",2);m([k({type:Boolean,reflect:!0,attribute:"mouse-dragging"})],Se.prototype,"mouseDragging",2);m([R(".carousel__slides")],Se.prototype,"scrollContainer",2);m([R(".carousel__pagination")],Se.prototype,"paginationContainer",2);m([V()],Se.prototype,"activeSlide",2);m([V()],Se.prototype,"scrolling",2);m([V()],Se.prototype,"dragging",2);m([is({passive:!0})],Se.prototype,"handleScroll",1);m([M("loop",{waitUntilFirstUpdate:!0}),M("slidesPerPage",{waitUntilFirstUpdate:!0})],Se.prototype,"initializeSlides",1);m([M("activeSlide")],Se.prototype,"handleSlideChange",1);m([M("slidesPerMove")],Se.prototype,"updateSlidesSnap",1);m([M("autoplay")],Se.prototype,"handleAutoplayChange",1);Se.define("sl-carousel");var Dm=(t,e)=>{let i=0;return function(...r){window.clearTimeout(i),i=window.setTimeout(()=>{t.call(this,...r)},e)}},du=(t,e,i)=>{const r=t[e];t[e]=function(...s){r.call(this,...s),i.call(this,r,...s)}};(()=>{if(typeof window>"u")return;if(!("onscrollend"in window)){const e=new Set,i=new WeakMap,r=n=>{for(const o of n.changedTouches)e.add(o.identifier)},s=n=>{for(const o of n.changedTouches)e.delete(o.identifier)};document.addEventListener("touchstart",r,!0),document.addEventListener("touchend",s,!0),document.addEventListener("touchcancel",s,!0),du(EventTarget.prototype,"addEventListener",function(n,o){if(o!=="scrollend")return;const l=Dm(()=>{e.size?l():this.dispatchEvent(new Event("scrollend"))},100);n.call(this,"scroll",l,{passive:!0}),i.set(this,l)}),du(EventTarget.prototype,"removeEventListener",function(n,o){if(o!=="scrollend")return;const l=i.get(this);l&&n.call(this,"scroll",l,{passive:!0})})}})();var Pm=U`
  :host {
    --aspect-ratio: inherit;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    max-height: 100%;
    aspect-ratio: var(--aspect-ratio);
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  ::slotted(img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`,wd=class extends q{connectedCallback(){super.connectedCallback()}render(){return N` <slot></slot> `}};wd.styles=[H,Pm];wd.define("sl-carousel-item");var Mm=U`
  :host {
    display: inline-flex;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    color: var(--sl-color-neutral-600);
    line-height: var(--sl-line-height-normal);
    white-space: nowrap;
  }

  .breadcrumb-item__label {
    display: inline-block;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    text-decoration: none;
    color: inherit;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: var(--sl-transition-fast) --color;
  }

  :host(:not(:last-of-type)) .breadcrumb-item__label {
    color: var(--sl-color-primary-600);
  }

  :host(:not(:last-of-type)) .breadcrumb-item__label:hover {
    color: var(--sl-color-primary-500);
  }

  :host(:not(:last-of-type)) .breadcrumb-item__label:active {
    color: var(--sl-color-primary-600);
  }

  .breadcrumb-item__label:focus {
    outline: none;
  }

  .breadcrumb-item__label:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .breadcrumb-item__prefix,
  .breadcrumb-item__suffix {
    display: none;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .breadcrumb-item--has-prefix .breadcrumb-item__prefix {
    display: inline-flex;
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .breadcrumb-item--has-suffix .breadcrumb-item__suffix {
    display: inline-flex;
    margin-inline-start: var(--sl-spacing-x-small);
  }

  :host(:last-of-type) .breadcrumb-item__separator {
    display: none;
  }

  .breadcrumb-item__separator {
    display: inline-flex;
    align-items: center;
    margin: 0 var(--sl-spacing-x-small);
    user-select: none;
    -webkit-user-select: none;
  }
`,ui=class extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"prefix","suffix"),this.renderType="button",this.rel="noreferrer noopener"}setRenderType(){const t=this.defaultSlot.assignedElements({flatten:!0}).filter(e=>e.tagName.toLowerCase()==="sl-dropdown").length>0;if(this.href){this.renderType="link";return}if(t){this.renderType="dropdown";return}this.renderType="button"}hrefChanged(){this.setRenderType()}handleSlotChange(){this.setRenderType()}render(){return N`
      <div
        part="base"
        class=${j({"breadcrumb-item":!0,"breadcrumb-item--has-prefix":this.hasSlotController.test("prefix"),"breadcrumb-item--has-suffix":this.hasSlotController.test("suffix")})}
      >
        <span part="prefix" class="breadcrumb-item__prefix">
          <slot name="prefix"></slot>
        </span>

        ${this.renderType==="link"?N`
              <a
                part="label"
                class="breadcrumb-item__label breadcrumb-item__label--link"
                href="${this.href}"
                target="${F(this.target?this.target:void 0)}"
                rel=${F(this.target?this.rel:void 0)}
              >
                <slot @slotchange=${this.handleSlotChange}></slot>
              </a>
            `:""}
        ${this.renderType==="button"?N`
              <button part="label" type="button" class="breadcrumb-item__label breadcrumb-item__label--button">
                <slot @slotchange=${this.handleSlotChange}></slot>
              </button>
            `:""}
        ${this.renderType==="dropdown"?N`
              <div part="label" class="breadcrumb-item__label breadcrumb-item__label--drop-down">
                <slot @slotchange=${this.handleSlotChange}></slot>
              </div>
            `:""}

        <span part="suffix" class="breadcrumb-item__suffix">
          <slot name="suffix"></slot>
        </span>

        <span part="separator" class="breadcrumb-item__separator" aria-hidden="true">
          <slot name="separator"></slot>
        </span>
      </div>
    `}};ui.styles=[H,Mm];m([R("slot:not([name])")],ui.prototype,"defaultSlot",2);m([V()],ui.prototype,"renderType",2);m([k()],ui.prototype,"href",2);m([k()],ui.prototype,"target",2);m([k()],ui.prototype,"rel",2);m([M("href",{waitUntilFirstUpdate:!0})],ui.prototype,"hrefChanged",1);ui.define("sl-breadcrumb-item");Mi.define("sl-button-group");var zm=U`
  :host {
    display: inline-block;

    --size: 3rem;
  }

  .avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: var(--size);
    height: var(--size);
    background-color: var(--sl-color-neutral-400);
    font-family: var(--sl-font-sans);
    font-size: calc(var(--size) * 0.5);
    font-weight: var(--sl-font-weight-normal);
    color: var(--sl-color-neutral-0);
    user-select: none;
    -webkit-user-select: none;
    vertical-align: middle;
  }

  .avatar--circle,
  .avatar--circle .avatar__image {
    border-radius: var(--sl-border-radius-circle);
  }

  .avatar--rounded,
  .avatar--rounded .avatar__image {
    border-radius: var(--sl-border-radius-medium);
  }

  .avatar--square {
    border-radius: 0;
  }

  .avatar__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .avatar__initials {
    line-height: 1;
    text-transform: uppercase;
  }

  .avatar__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    overflow: hidden;
  }
`,Ft=class extends q{constructor(){super(...arguments),this.hasError=!1,this.image="",this.label="",this.initials="",this.loading="eager",this.shape="circle"}handleImageChange(){this.hasError=!1}handleImageLoadError(){this.hasError=!0,this.emit("sl-error")}render(){const t=N`
      <img
        part="image"
        class="avatar__image"
        src="${this.image}"
        loading="${this.loading}"
        alt=""
        @error="${this.handleImageLoadError}"
      />
    `;let e=N``;return this.initials?e=N`<div part="initials" class="avatar__initials">${this.initials}</div>`:e=N`
        <div part="icon" class="avatar__icon" aria-hidden="true">
          <slot name="icon">
            <sl-icon name="person-fill" library="system"></sl-icon>
          </slot>
        </div>
      `,N`
      <div
        part="base"
        class=${j({avatar:!0,"avatar--circle":this.shape==="circle","avatar--rounded":this.shape==="rounded","avatar--square":this.shape==="square"})}
        role="img"
        aria-label=${this.label}
      >
        ${this.image&&!this.hasError?t:e}
      </div>
    `}};Ft.styles=[H,zm];Ft.dependencies={"sl-icon":fe};m([V()],Ft.prototype,"hasError",2);m([k()],Ft.prototype,"image",2);m([k()],Ft.prototype,"label",2);m([k()],Ft.prototype,"initials",2);m([k()],Ft.prototype,"loading",2);m([k({reflect:!0})],Ft.prototype,"shape",2);m([M("image")],Ft.prototype,"handleImageChange",1);Ft.define("sl-avatar");var Rm=U`
  .breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
`,mr=class extends q{constructor(){super(...arguments),this.localize=new ie(this),this.separatorDir=this.localize.dir(),this.label=""}getSeparator(){const e=this.separatorSlot.assignedElements({flatten:!0})[0].cloneNode(!0);return[e,...e.querySelectorAll("[id]")].forEach(i=>i.removeAttribute("id")),e.setAttribute("data-default",""),e.slot="separator",e}handleSlotChange(){const t=[...this.defaultSlot.assignedElements({flatten:!0})].filter(e=>e.tagName.toLowerCase()==="sl-breadcrumb-item");t.forEach((e,i)=>{const r=e.querySelector('[slot="separator"]');r===null?e.append(this.getSeparator()):r.hasAttribute("data-default")&&r.replaceWith(this.getSeparator()),i===t.length-1?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current")})}render(){return this.separatorDir!==this.localize.dir()&&(this.separatorDir=this.localize.dir(),this.updateComplete.then(()=>this.handleSlotChange())),N`
      <nav part="base" class="breadcrumb" aria-label=${this.label}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </nav>

      <span hidden aria-hidden="true">
        <slot name="separator">
          <sl-icon name=${this.localize.dir()==="rtl"?"chevron-left":"chevron-right"} library="system"></sl-icon>
        </slot>
      </span>
    `}};mr.styles=[H,Rm];mr.dependencies={"sl-icon":fe};m([R("slot")],mr.prototype,"defaultSlot",2);m([R('slot[name="separator"]')],mr.prototype,"separatorSlot",2);m([k()],mr.prototype,"label",2);mr.define("sl-breadcrumb");le.define("sl-button");var Bm=U`
  :host {
    --control-box-size: 3rem;
    --icon-size: calc(var(--control-box-size) * 0.625);

    display: inline-flex;
    position: relative;
    cursor: pointer;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  img[aria-hidden='true'] {
    display: none;
  }

  .animated-image__control-box {
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    top: calc(50% - var(--control-box-size) / 2);
    right: calc(50% - var(--control-box-size) / 2);
    width: var(--control-box-size);
    height: var(--control-box-size);
    font-size: var(--icon-size);
    background: none;
    border: solid 2px currentColor;
    background-color: rgb(0 0 0 /50%);
    border-radius: var(--sl-border-radius-circle);
    color: white;
    pointer-events: none;
    transition: var(--sl-transition-fast) opacity;
  }

  :host([play]:hover) .animated-image__control-box {
    opacity: 1;
  }

  :host([play]:not(:hover)) .animated-image__control-box {
    opacity: 0;
  }

  :host([play]) slot[name='play-icon'],
  :host(:not([play])) slot[name='pause-icon'] {
    display: none;
  }
`,At=class extends q{constructor(){super(...arguments),this.isLoaded=!1}handleClick(){this.play=!this.play}handleLoad(){const t=document.createElement("canvas"),{width:e,height:i}=this.animatedImage;t.width=e,t.height=i,t.getContext("2d").drawImage(this.animatedImage,0,0,e,i),this.frozenFrame=t.toDataURL("image/gif"),this.isLoaded||(this.emit("sl-load"),this.isLoaded=!0)}handleError(){this.emit("sl-error")}handlePlayChange(){this.play&&(this.animatedImage.src="",this.animatedImage.src=this.src)}handleSrcChange(){this.isLoaded=!1}render(){return N`
      <div class="animated-image">
        <img
          class="animated-image__animated"
          src=${this.src}
          alt=${this.alt}
          crossorigin="anonymous"
          aria-hidden=${this.play?"false":"true"}
          @click=${this.handleClick}
          @load=${this.handleLoad}
          @error=${this.handleError}
        />

        ${this.isLoaded?N`
              <img
                class="animated-image__frozen"
                src=${this.frozenFrame}
                alt=${this.alt}
                aria-hidden=${this.play?"true":"false"}
                @click=${this.handleClick}
              />

              <div part="control-box" class="animated-image__control-box">
                <slot name="play-icon"><sl-icon name="play-fill" library="system"></sl-icon></slot>
                <slot name="pause-icon"><sl-icon name="pause-fill" library="system"></sl-icon></slot>
              </div>
            `:""}
      </div>
    `}};At.styles=[H,Bm];At.dependencies={"sl-icon":fe};m([R(".animated-image__animated")],At.prototype,"animatedImage",2);m([V()],At.prototype,"frozenFrame",2);m([V()],At.prototype,"isLoaded",2);m([k()],At.prototype,"src",2);m([k()],At.prototype,"alt",2);m([k({type:Boolean,reflect:!0})],At.prototype,"play",2);m([M("play",{waitUntilFirstUpdate:!0})],At.prototype,"handlePlayChange",1);m([M("src")],At.prototype,"handleSrcChange",1);At.define("sl-animated-image");var Fm=U`
  :host {
    display: inline-flex;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: max(12px, 0.75em);
    font-weight: var(--sl-font-weight-semibold);
    letter-spacing: var(--sl-letter-spacing-normal);
    line-height: 1;
    border-radius: var(--sl-border-radius-small);
    border: solid 1px var(--sl-color-neutral-0);
    white-space: nowrap;
    padding: 0.35em 0.6em;
    user-select: none;
    -webkit-user-select: none;
    cursor: inherit;
  }

  /* Variant modifiers */
  .badge--primary {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--success {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--neutral {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--warning {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--danger {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /* Pill modifier */
  .badge--pill {
    border-radius: var(--sl-border-radius-pill);
  }

  /* Pulse modifier */
  .badge--pulse {
    animation: pulse 1.5s infinite;
  }

  .badge--pulse.badge--primary {
    --pulse-color: var(--sl-color-primary-600);
  }

  .badge--pulse.badge--success {
    --pulse-color: var(--sl-color-success-600);
  }

  .badge--pulse.badge--neutral {
    --pulse-color: var(--sl-color-neutral-600);
  }

  .badge--pulse.badge--warning {
    --pulse-color: var(--sl-color-warning-600);
  }

  .badge--pulse.badge--danger {
    --pulse-color: var(--sl-color-danger-600);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--pulse-color);
    }
    70% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }
`,cs=class extends q{constructor(){super(...arguments),this.variant="primary",this.pill=!1,this.pulse=!1}render(){return N`
      <span
        part="base"
        class=${j({badge:!0,"badge--primary":this.variant==="primary","badge--success":this.variant==="success","badge--neutral":this.variant==="neutral","badge--warning":this.variant==="warning","badge--danger":this.variant==="danger","badge--pill":this.pill,"badge--pulse":this.pulse})}
        role="status"
      >
        <slot></slot>
      </span>
    `}};cs.styles=[H,Fm];m([k({reflect:!0})],cs.prototype,"variant",2);m([k({type:Boolean,reflect:!0})],cs.prototype,"pill",2);m([k({type:Boolean,reflect:!0})],cs.prototype,"pulse",2);cs.define("sl-badge");var qm=U`
  :host {
    display: contents;

    /* For better DX, we'll reset the margin here so the base part can inherit it */
    margin: 0;
  }

  .alert {
    position: relative;
    display: flex;
    align-items: stretch;
    background-color: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-top-width: calc(var(--sl-panel-border-width) * 3);
    border-radius: var(--sl-border-radius-medium);
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-normal);
    line-height: 1.6;
    color: var(--sl-color-neutral-700);
    margin: inherit;
    overflow: hidden;
  }

  .alert:not(.alert--has-icon) .alert__icon,
  .alert:not(.alert--closable) .alert__close-button {
    display: none;
  }

  .alert__icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-large);
    padding-inline-start: var(--sl-spacing-large);
  }

  .alert--has-countdown {
    border-bottom: none;
  }

  .alert--primary {
    border-top-color: var(--sl-color-primary-600);
  }

  .alert--primary .alert__icon {
    color: var(--sl-color-primary-600);
  }

  .alert--success {
    border-top-color: var(--sl-color-success-600);
  }

  .alert--success .alert__icon {
    color: var(--sl-color-success-600);
  }

  .alert--neutral {
    border-top-color: var(--sl-color-neutral-600);
  }

  .alert--neutral .alert__icon {
    color: var(--sl-color-neutral-600);
  }

  .alert--warning {
    border-top-color: var(--sl-color-warning-600);
  }

  .alert--warning .alert__icon {
    color: var(--sl-color-warning-600);
  }

  .alert--danger {
    border-top-color: var(--sl-color-danger-600);
  }

  .alert--danger .alert__icon {
    color: var(--sl-color-danger-600);
  }

  .alert__message {
    flex: 1 1 auto;
    display: block;
    padding: var(--sl-spacing-large);
    overflow: hidden;
  }

  .alert__close-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
    margin-inline-end: var(--sl-spacing-medium);
    align-self: center;
  }

  .alert__countdown {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(var(--sl-panel-border-width) * 3);
    background-color: var(--sl-panel-border-color);
    display: flex;
  }

  .alert__countdown--ltr {
    justify-content: flex-end;
  }

  .alert__countdown .alert__countdown-elapsed {
    height: 100%;
    width: 0;
  }

  .alert--primary .alert__countdown-elapsed {
    background-color: var(--sl-color-primary-600);
  }

  .alert--success .alert__countdown-elapsed {
    background-color: var(--sl-color-success-600);
  }

  .alert--neutral .alert__countdown-elapsed {
    background-color: var(--sl-color-neutral-600);
  }

  .alert--warning .alert__countdown-elapsed {
    background-color: var(--sl-color-warning-600);
  }

  .alert--danger .alert__countdown-elapsed {
    background-color: var(--sl-color-danger-600);
  }

  .alert__timer {
    display: none;
  }
`,st=class gi extends q{constructor(){super(...arguments),this.hasSlotController=new Ve(this,"icon","suffix"),this.localize=new ie(this),this.open=!1,this.closable=!1,this.variant="primary",this.duration=1/0,this.remainingTime=this.duration}static get toastStack(){return this.currentToastStack||(this.currentToastStack=Object.assign(document.createElement("div"),{className:"sl-toast-stack"})),this.currentToastStack}firstUpdated(){this.base.hidden=!this.open}restartAutoHide(){this.handleCountdownChange(),clearTimeout(this.autoHideTimeout),clearInterval(this.remainingTimeInterval),this.open&&this.duration<1/0&&(this.autoHideTimeout=window.setTimeout(()=>this.hide(),this.duration),this.remainingTime=this.duration,this.remainingTimeInterval=window.setInterval(()=>{this.remainingTime-=100},100))}pauseAutoHide(){var e;(e=this.countdownAnimation)==null||e.pause(),clearTimeout(this.autoHideTimeout),clearInterval(this.remainingTimeInterval)}resumeAutoHide(){var e;this.duration<1/0&&(this.autoHideTimeout=window.setTimeout(()=>this.hide(),this.remainingTime),this.remainingTimeInterval=window.setInterval(()=>{this.remainingTime-=100},100),(e=this.countdownAnimation)==null||e.play())}handleCountdownChange(){if(this.open&&this.duration<1/0&&this.countdown){const{countdownElement:e}=this,i="100%",r="0";this.countdownAnimation=e.animate([{width:i},{width:r}],{duration:this.duration,easing:"linear"})}}handleCloseClick(){this.hide()}async handleOpenChange(){if(this.open){this.emit("sl-show"),this.duration<1/0&&this.restartAutoHide(),await Ae(this.base),this.base.hidden=!1;const{keyframes:e,options:i}=me(this,"alert.show",{dir:this.localize.dir()});await _e(this.base,e,i),this.emit("sl-after-show")}else{Ua(this),this.emit("sl-hide"),clearTimeout(this.autoHideTimeout),clearInterval(this.remainingTimeInterval),await Ae(this.base);const{keyframes:e,options:i}=me(this,"alert.hide",{dir:this.localize.dir()});await _e(this.base,e,i),this.base.hidden=!0,this.emit("sl-after-hide")}}handleDurationChange(){this.restartAutoHide()}async show(){if(!this.open)return this.open=!0,Ue(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,Ue(this,"sl-after-hide")}async toast(){return new Promise(e=>{this.handleCountdownChange(),gi.toastStack.parentElement===null&&document.body.append(gi.toastStack),gi.toastStack.appendChild(this),requestAnimationFrame(()=>{this.clientWidth,this.show()}),this.addEventListener("sl-after-hide",()=>{gi.toastStack.removeChild(this),e(),gi.toastStack.querySelector("sl-alert")===null&&gi.toastStack.remove()},{once:!0})})}render(){return N`
      <div
        part="base"
        class=${j({alert:!0,"alert--open":this.open,"alert--closable":this.closable,"alert--has-countdown":!!this.countdown,"alert--has-icon":this.hasSlotController.test("icon"),"alert--primary":this.variant==="primary","alert--success":this.variant==="success","alert--neutral":this.variant==="neutral","alert--warning":this.variant==="warning","alert--danger":this.variant==="danger"})}
        role="alert"
        aria-hidden=${this.open?"false":"true"}
        @mouseenter=${this.pauseAutoHide}
        @mouseleave=${this.resumeAutoHide}
      >
        <div part="icon" class="alert__icon">
          <slot name="icon"></slot>
        </div>

        <div part="message" class="alert__message" aria-live="polite">
          <slot></slot>
        </div>

        ${this.closable?N`
              <sl-icon-button
                part="close-button"
                exportparts="base:close-button__base"
                class="alert__close-button"
                name="x-lg"
                library="system"
                label=${this.localize.term("close")}
                @click=${this.handleCloseClick}
              ></sl-icon-button>
            `:""}

        <div role="timer" class="alert__timer">${this.remainingTime}</div>

        ${this.countdown?N`
              <div
                class=${j({alert__countdown:!0,"alert__countdown--ltr":this.countdown==="ltr"})}
              >
                <div class="alert__countdown-elapsed"></div>
              </div>
            `:""}
      </div>
    `}};st.styles=[H,qm];st.dependencies={"sl-icon-button":Te};m([R('[part~="base"]')],st.prototype,"base",2);m([R(".alert__countdown-elapsed")],st.prototype,"countdownElement",2);m([k({type:Boolean,reflect:!0})],st.prototype,"open",2);m([k({type:Boolean,reflect:!0})],st.prototype,"closable",2);m([k({reflect:!0})],st.prototype,"variant",2);m([k({type:Number})],st.prototype,"duration",2);m([k({type:String,reflect:!0})],st.prototype,"countdown",2);m([V()],st.prototype,"remainingTime",2);m([M("open",{waitUntilFirstUpdate:!0})],st.prototype,"handleOpenChange",1);m([M("duration")],st.prototype,"handleDurationChange",1);var Um=st;oe("alert.show",{keyframes:[{opacity:0,scale:.8},{opacity:1,scale:1}],options:{duration:250,easing:"ease"}});oe("alert.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.8}],options:{duration:250,easing:"ease"}});Um.define("sl-alert");const Vm=[{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)",transform:"translate3d(0, 0, 0)"},{offset:.2,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)",transform:"translate3d(0, 0, 0)"},{offset:.4,easing:"cubic-bezier(0.755, 0.05, 0.855, 0.06)",transform:"translate3d(0, -30px, 0) scaleY(1.1)"},{offset:.43,easing:"cubic-bezier(0.755, 0.05, 0.855, 0.06)",transform:"translate3d(0, -30px, 0) scaleY(1.1)"},{offset:.53,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)",transform:"translate3d(0, 0, 0)"},{offset:.7,easing:"cubic-bezier(0.755, 0.05, 0.855, 0.06)",transform:"translate3d(0, -15px, 0) scaleY(1.05)"},{offset:.8,"transition-timing-function":"cubic-bezier(0.215, 0.61, 0.355, 1)",transform:"translate3d(0, 0, 0) scaleY(0.95)"},{offset:.9,transform:"translate3d(0, -4px, 0) scaleY(1.02)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)",transform:"translate3d(0, 0, 0)"}],jm=[{offset:0,opacity:"1"},{offset:.25,opacity:"0"},{offset:.5,opacity:"1"},{offset:.75,opacity:"0"},{offset:1,opacity:"1"}],Hm=[{offset:0,transform:"translateX(0)"},{offset:.065,transform:"translateX(-6px) rotateY(-9deg)"},{offset:.185,transform:"translateX(5px) rotateY(7deg)"},{offset:.315,transform:"translateX(-3px) rotateY(-5deg)"},{offset:.435,transform:"translateX(2px) rotateY(3deg)"},{offset:.5,transform:"translateX(0)"}],Km=[{offset:0,transform:"scale(1)"},{offset:.14,transform:"scale(1.3)"},{offset:.28,transform:"scale(1)"},{offset:.42,transform:"scale(1.3)"},{offset:.7,transform:"scale(1)"}],Wm=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:.111,transform:"translate3d(0, 0, 0)"},{offset:.222,transform:"skewX(-12.5deg) skewY(-12.5deg)"},{offset:.33299999999999996,transform:"skewX(6.25deg) skewY(6.25deg)"},{offset:.444,transform:"skewX(-3.125deg) skewY(-3.125deg)"},{offset:.555,transform:"skewX(1.5625deg) skewY(1.5625deg)"},{offset:.6659999999999999,transform:"skewX(-0.78125deg) skewY(-0.78125deg)"},{offset:.777,transform:"skewX(0.390625deg) skewY(0.390625deg)"},{offset:.888,transform:"skewX(-0.1953125deg) skewY(-0.1953125deg)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Gm=[{offset:0,transform:"scale3d(1, 1, 1)"},{offset:.5,transform:"scale3d(1.05, 1.05, 1.05)"},{offset:1,transform:"scale3d(1, 1, 1)"}],Ym=[{offset:0,transform:"scale3d(1, 1, 1)"},{offset:.3,transform:"scale3d(1.25, 0.75, 1)"},{offset:.4,transform:"scale3d(0.75, 1.25, 1)"},{offset:.5,transform:"scale3d(1.15, 0.85, 1)"},{offset:.65,transform:"scale3d(0.95, 1.05, 1)"},{offset:.75,transform:"scale3d(1.05, 0.95, 1)"},{offset:1,transform:"scale3d(1, 1, 1)"}],Xm=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:.1,transform:"translate3d(-10px, 0, 0)"},{offset:.2,transform:"translate3d(10px, 0, 0)"},{offset:.3,transform:"translate3d(-10px, 0, 0)"},{offset:.4,transform:"translate3d(10px, 0, 0)"},{offset:.5,transform:"translate3d(-10px, 0, 0)"},{offset:.6,transform:"translate3d(10px, 0, 0)"},{offset:.7,transform:"translate3d(-10px, 0, 0)"},{offset:.8,transform:"translate3d(10px, 0, 0)"},{offset:.9,transform:"translate3d(-10px, 0, 0)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Jm=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:.1,transform:"translate3d(-10px, 0, 0)"},{offset:.2,transform:"translate3d(10px, 0, 0)"},{offset:.3,transform:"translate3d(-10px, 0, 0)"},{offset:.4,transform:"translate3d(10px, 0, 0)"},{offset:.5,transform:"translate3d(-10px, 0, 0)"},{offset:.6,transform:"translate3d(10px, 0, 0)"},{offset:.7,transform:"translate3d(-10px, 0, 0)"},{offset:.8,transform:"translate3d(10px, 0, 0)"},{offset:.9,transform:"translate3d(-10px, 0, 0)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Qm=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:.1,transform:"translate3d(0, -10px, 0)"},{offset:.2,transform:"translate3d(0, 10px, 0)"},{offset:.3,transform:"translate3d(0, -10px, 0)"},{offset:.4,transform:"translate3d(0, 10px, 0)"},{offset:.5,transform:"translate3d(0, -10px, 0)"},{offset:.6,transform:"translate3d(0, 10px, 0)"},{offset:.7,transform:"translate3d(0, -10px, 0)"},{offset:.8,transform:"translate3d(0, 10px, 0)"},{offset:.9,transform:"translate3d(0, -10px, 0)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Zm=[{offset:.2,transform:"rotate3d(0, 0, 1, 15deg)"},{offset:.4,transform:"rotate3d(0, 0, 1, -10deg)"},{offset:.6,transform:"rotate3d(0, 0, 1, 5deg)"},{offset:.8,transform:"rotate3d(0, 0, 1, -5deg)"},{offset:1,transform:"rotate3d(0, 0, 1, 0deg)"}],eb=[{offset:0,transform:"scale3d(1, 1, 1)"},{offset:.1,transform:"scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)"},{offset:.2,transform:"scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)"},{offset:.3,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"},{offset:.4,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"},{offset:.5,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"},{offset:.6,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"},{offset:.7,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"},{offset:.8,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"},{offset:.9,transform:"scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"},{offset:1,transform:"scale3d(1, 1, 1)"}],tb=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:.15,transform:"translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)"},{offset:.3,transform:"translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)"},{offset:.45,transform:"translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)"},{offset:.6,transform:"translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)"},{offset:.75,transform:"translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)"},{offset:1,transform:"translate3d(0, 0, 0)"}],ib=[{offset:0,transform:"translateY(-1200px) scale(0.7)",opacity:"0.7"},{offset:.8,transform:"translateY(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"scale(1)",opacity:"1"}],rb=[{offset:0,transform:"translateX(-2000px) scale(0.7)",opacity:"0.7"},{offset:.8,transform:"translateX(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"scale(1)",opacity:"1"}],sb=[{offset:0,transform:"translateX(2000px) scale(0.7)",opacity:"0.7"},{offset:.8,transform:"translateX(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"scale(1)",opacity:"1"}],nb=[{offset:0,transform:"translateY(1200px) scale(0.7)",opacity:"0.7"},{offset:.8,transform:"translateY(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"scale(1)",opacity:"1"}],ob=[{offset:0,transform:"scale(1)",opacity:"1"},{offset:.2,transform:"translateY(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"translateY(700px) scale(0.7)",opacity:"0.7"}],ab=[{offset:0,transform:"scale(1)",opacity:"1"},{offset:.2,transform:"translateX(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"translateX(-2000px) scale(0.7)",opacity:"0.7"}],lb=[{offset:0,transform:"scale(1)",opacity:"1"},{offset:.2,transform:"translateX(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"translateX(2000px) scale(0.7)",opacity:"0.7"}],ub=[{offset:0,transform:"scale(1)",opacity:"1"},{offset:.2,transform:"translateY(0px) scale(0.7)",opacity:"0.7"},{offset:1,transform:"translateY(-700px) scale(0.7)",opacity:"0.7"}],cb=[{offset:0,opacity:"0",transform:"scale3d(0.3, 0.3, 0.3)"},{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.2,transform:"scale3d(1.1, 1.1, 1.1)"},{offset:.2,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.4,transform:"scale3d(0.9, 0.9, 0.9)"},{offset:.4,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.6,opacity:"1",transform:"scale3d(1.03, 1.03, 1.03)"},{offset:.6,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.8,transform:"scale3d(0.97, 0.97, 0.97)"},{offset:.8,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:1,opacity:"1",transform:"scale3d(1, 1, 1)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"}],db=[{offset:0,opacity:"0",transform:"translate3d(0, -3000px, 0) scaleY(3)"},{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.6,opacity:"1",transform:"translate3d(0, 25px, 0) scaleY(0.9)"},{offset:.6,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.75,transform:"translate3d(0, -10px, 0) scaleY(0.95)"},{offset:.75,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.9,transform:"translate3d(0, 5px, 0) scaleY(0.985)"},{offset:.9,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:1,transform:"translate3d(0, 0, 0)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"}],hb=[{offset:0,opacity:"0",transform:"translate3d(-3000px, 0, 0) scaleX(3)"},{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.6,opacity:"1",transform:"translate3d(25px, 0, 0) scaleX(1)"},{offset:.6,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.75,transform:"translate3d(-10px, 0, 0) scaleX(0.98)"},{offset:.75,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.9,transform:"translate3d(5px, 0, 0) scaleX(0.995)"},{offset:.9,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:1,transform:"translate3d(0, 0, 0)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"}],fb=[{offset:0,opacity:"0",transform:"translate3d(3000px, 0, 0) scaleX(3)"},{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.6,opacity:"1",transform:"translate3d(-25px, 0, 0) scaleX(1)"},{offset:.6,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.75,transform:"translate3d(10px, 0, 0) scaleX(0.98)"},{offset:.75,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.9,transform:"translate3d(-5px, 0, 0) scaleX(0.995)"},{offset:.9,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:1,transform:"translate3d(0, 0, 0)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"}],pb=[{offset:0,opacity:"0",transform:"translate3d(0, 3000px, 0) scaleY(5)"},{offset:0,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.6,opacity:"1",transform:"translate3d(0, -20px, 0) scaleY(0.9)"},{offset:.6,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.75,transform:"translate3d(0, 10px, 0) scaleY(0.95)"},{offset:.75,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:.9,transform:"translate3d(0, -5px, 0) scaleY(0.985)"},{offset:.9,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"},{offset:1,transform:"translate3d(0, 0, 0)"},{offset:1,easing:"cubic-bezier(0.215, 0.61, 0.355, 1)"}],mb=[{offset:.2,transform:"scale3d(0.9, 0.9, 0.9)"},{offset:.5,opacity:"1",transform:"scale3d(1.1, 1.1, 1.1)"},{offset:.55,opacity:"1",transform:"scale3d(1.1, 1.1, 1.1)"},{offset:1,opacity:"0",transform:"scale3d(0.3, 0.3, 0.3)"}],bb=[{offset:.2,transform:"translate3d(0, 10px, 0) scaleY(0.985)"},{offset:.4,opacity:"1",transform:"translate3d(0, -20px, 0) scaleY(0.9)"},{offset:.45,opacity:"1",transform:"translate3d(0, -20px, 0) scaleY(0.9)"},{offset:1,opacity:"0",transform:"translate3d(0, 2000px, 0) scaleY(3)"}],gb=[{offset:.2,opacity:"1",transform:"translate3d(20px, 0, 0) scaleX(0.9)"},{offset:1,opacity:"0",transform:"translate3d(-2000px, 0, 0) scaleX(2)"}],yb=[{offset:.2,opacity:"1",transform:"translate3d(-20px, 0, 0) scaleX(0.9)"},{offset:1,opacity:"0",transform:"translate3d(2000px, 0, 0) scaleX(2)"}],vb=[{offset:.2,transform:"translate3d(0, -10px, 0) scaleY(0.985)"},{offset:.4,opacity:"1",transform:"translate3d(0, 20px, 0) scaleY(0.9)"},{offset:.45,opacity:"1",transform:"translate3d(0, 20px, 0) scaleY(0.9)"},{offset:1,opacity:"0",transform:"translate3d(0, -2000px, 0) scaleY(3)"}],wb=[{offset:0,opacity:"0"},{offset:1,opacity:"1"}],xb=[{offset:0,opacity:"0",transform:"translate3d(-100%, 100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],_b=[{offset:0,opacity:"0",transform:"translate3d(100%, 100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],kb=[{offset:0,opacity:"0",transform:"translate3d(0, -100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Sb=[{offset:0,opacity:"0",transform:"translate3d(0, -2000px, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Cb=[{offset:0,opacity:"0",transform:"translate3d(-100%, 0, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Ab=[{offset:0,opacity:"0",transform:"translate3d(-2000px, 0, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Eb=[{offset:0,opacity:"0",transform:"translate3d(100%, 0, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Tb=[{offset:0,opacity:"0",transform:"translate3d(2000px, 0, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Ob=[{offset:0,opacity:"0",transform:"translate3d(-100%, -100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],$b=[{offset:0,opacity:"0",transform:"translate3d(100%, -100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Ib=[{offset:0,opacity:"0",transform:"translate3d(0, 100%, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Lb=[{offset:0,opacity:"0",transform:"translate3d(0, 2000px, 0)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],Nb=[{offset:0,opacity:"1"},{offset:1,opacity:"0"}],Db=[{offset:0,opacity:"1",transform:"translate3d(0, 0, 0)"},{offset:1,opacity:"0",transform:"translate3d(-100%, 100%, 0)"}],Pb=[{offset:0,opacity:"1",transform:"translate3d(0, 0, 0)"},{offset:1,opacity:"0",transform:"translate3d(100%, 100%, 0)"}],Mb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(0, 100%, 0)"}],zb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(0, 2000px, 0)"}],Rb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(-100%, 0, 0)"}],Bb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(-2000px, 0, 0)"}],Fb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(100%, 0, 0)"}],qb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(2000px, 0, 0)"}],Ub=[{offset:0,opacity:"1",transform:"translate3d(0, 0, 0)"},{offset:1,opacity:"0",transform:"translate3d(-100%, -100%, 0)"}],Vb=[{offset:0,opacity:"1",transform:"translate3d(0, 0, 0)"},{offset:1,opacity:"0",transform:"translate3d(100%, -100%, 0)"}],jb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(0, -100%, 0)"}],Hb=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(0, -2000px, 0)"}],Kb=[{offset:0,transform:"perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 0) rotate3d(0, 1, 0, -360deg)",easing:"ease-out"},{offset:.4,transform:`perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 150px)
      rotate3d(0, 1, 0, -190deg)`,easing:"ease-out"},{offset:.5,transform:`perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 150px)
      rotate3d(0, 1, 0, -170deg)`,easing:"ease-in"},{offset:.8,transform:`perspective(400px) scale3d(0.95, 0.95, 0.95) translate3d(0, 0, 0)
      rotate3d(0, 1, 0, 0deg)`,easing:"ease-in"},{offset:1,transform:"perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 0) rotate3d(0, 1, 0, 0deg)",easing:"ease-in"}],Wb=[{offset:0,transform:"perspective(400px) rotate3d(1, 0, 0, 90deg)",easing:"ease-in",opacity:"0"},{offset:.4,transform:"perspective(400px) rotate3d(1, 0, 0, -20deg)",easing:"ease-in"},{offset:.6,transform:"perspective(400px) rotate3d(1, 0, 0, 10deg)",opacity:"1"},{offset:.8,transform:"perspective(400px) rotate3d(1, 0, 0, -5deg)"},{offset:1,transform:"perspective(400px)"}],Gb=[{offset:0,transform:"perspective(400px) rotate3d(0, 1, 0, 90deg)",easing:"ease-in",opacity:"0"},{offset:.4,transform:"perspective(400px) rotate3d(0, 1, 0, -20deg)",easing:"ease-in"},{offset:.6,transform:"perspective(400px) rotate3d(0, 1, 0, 10deg)",opacity:"1"},{offset:.8,transform:"perspective(400px) rotate3d(0, 1, 0, -5deg)"},{offset:1,transform:"perspective(400px)"}],Yb=[{offset:0,transform:"perspective(400px)"},{offset:.3,transform:"perspective(400px) rotate3d(1, 0, 0, -20deg)",opacity:"1"},{offset:1,transform:"perspective(400px) rotate3d(1, 0, 0, 90deg)",opacity:"0"}],Xb=[{offset:0,transform:"perspective(400px)"},{offset:.3,transform:"perspective(400px) rotate3d(0, 1, 0, -15deg)",opacity:"1"},{offset:1,transform:"perspective(400px) rotate3d(0, 1, 0, 90deg)",opacity:"0"}],Jb=[{offset:0,transform:"translate3d(-100%, 0, 0) skewX(30deg)",opacity:"0"},{offset:.6,transform:"skewX(-20deg)",opacity:"1"},{offset:.8,transform:"skewX(5deg)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Qb=[{offset:0,transform:"translate3d(100%, 0, 0) skewX(-30deg)",opacity:"0"},{offset:.6,transform:"skewX(20deg)",opacity:"1"},{offset:.8,transform:"skewX(-5deg)"},{offset:1,transform:"translate3d(0, 0, 0)"}],Zb=[{offset:0,opacity:"1"},{offset:1,transform:"translate3d(-100%, 0, 0) skewX(-30deg)",opacity:"0"}],eg=[{offset:0,opacity:"1"},{offset:1,transform:"translate3d(100%, 0, 0) skewX(30deg)",opacity:"0"}],tg=[{offset:0,transform:"rotate3d(0, 0, 1, -200deg)",opacity:"0"},{offset:1,transform:"translate3d(0, 0, 0)",opacity:"1"}],ig=[{offset:0,transform:"rotate3d(0, 0, 1, -45deg)",opacity:"0"},{offset:1,transform:"translate3d(0, 0, 0)",opacity:"1"}],rg=[{offset:0,transform:"rotate3d(0, 0, 1, 45deg)",opacity:"0"},{offset:1,transform:"translate3d(0, 0, 0)",opacity:"1"}],sg=[{offset:0,transform:"rotate3d(0, 0, 1, 45deg)",opacity:"0"},{offset:1,transform:"translate3d(0, 0, 0)",opacity:"1"}],ng=[{offset:0,transform:"rotate3d(0, 0, 1, -90deg)",opacity:"0"},{offset:1,transform:"translate3d(0, 0, 0)",opacity:"1"}],og=[{offset:0,opacity:"1"},{offset:1,transform:"rotate3d(0, 0, 1, 200deg)",opacity:"0"}],ag=[{offset:0,opacity:"1"},{offset:1,transform:"rotate3d(0, 0, 1, 45deg)",opacity:"0"}],lg=[{offset:0,opacity:"1"},{offset:1,transform:"rotate3d(0, 0, 1, -45deg)",opacity:"0"}],ug=[{offset:0,opacity:"1"},{offset:1,transform:"rotate3d(0, 0, 1, -45deg)",opacity:"0"}],cg=[{offset:0,opacity:"1"},{offset:1,transform:"rotate3d(0, 0, 1, 90deg)",opacity:"0"}],dg=[{offset:0,transform:"translate3d(0, -100%, 0)",visibility:"visible"},{offset:1,transform:"translate3d(0, 0, 0)"}],hg=[{offset:0,transform:"translate3d(-100%, 0, 0)",visibility:"visible"},{offset:1,transform:"translate3d(0, 0, 0)"}],fg=[{offset:0,transform:"translate3d(100%, 0, 0)",visibility:"visible"},{offset:1,transform:"translate3d(0, 0, 0)"}],pg=[{offset:0,transform:"translate3d(0, 100%, 0)",visibility:"visible"},{offset:1,transform:"translate3d(0, 0, 0)"}],mg=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:1,visibility:"hidden",transform:"translate3d(0, 100%, 0)"}],bg=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:1,visibility:"hidden",transform:"translate3d(-100%, 0, 0)"}],gg=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:1,visibility:"hidden",transform:"translate3d(100%, 0, 0)"}],yg=[{offset:0,transform:"translate3d(0, 0, 0)"},{offset:1,visibility:"hidden",transform:"translate3d(0, -100%, 0)"}],vg=[{offset:0,easing:"ease-in-out"},{offset:.2,transform:"rotate3d(0, 0, 1, 80deg)",easing:"ease-in-out"},{offset:.4,transform:"rotate3d(0, 0, 1, 60deg)",easing:"ease-in-out",opacity:"1"},{offset:.6,transform:"rotate3d(0, 0, 1, 80deg)",easing:"ease-in-out"},{offset:.8,transform:"rotate3d(0, 0, 1, 60deg)",easing:"ease-in-out",opacity:"1"},{offset:1,transform:"translate3d(0, 700px, 0)",opacity:"0"}],wg=[{offset:0,opacity:"0",transform:"scale(0.1) rotate(30deg)","transform-origin":"center bottom"},{offset:.5,transform:"rotate(-10deg)"},{offset:.7,transform:"rotate(3deg)"},{offset:1,opacity:"1",transform:"scale(1)"}],xg=[{offset:0,opacity:"0",transform:"translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg)"},{offset:1,opacity:"1",transform:"translate3d(0, 0, 0)"}],_g=[{offset:0,opacity:"1"},{offset:1,opacity:"0",transform:"translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg)"}],kg=[{offset:0,opacity:"0",transform:"scale3d(0.3, 0.3, 0.3)"},{offset:.5,opacity:"1"}],Sg=[{offset:0,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(0, -1000px, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:.6,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],Cg=[{offset:0,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:.6,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],Ag=[{offset:0,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(1000px, 0, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:.6,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(-10px, 0, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],Eg=[{offset:0,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(0, 1000px, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:.6,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(0, -60px, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],Tg=[{offset:0,opacity:"1"},{offset:.5,opacity:"0",transform:"scale3d(0.3, 0.3, 0.3)"},{offset:1,opacity:"0"}],Og=[{offset:.4,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(0, -60px, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:1,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(0, 2000px, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],$g=[{offset:.4,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(42px, 0, 0)"},{offset:1,opacity:"0",transform:"scale(0.1) translate3d(-2000px, 0, 0)"}],Ig=[{offset:.4,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(-42px, 0, 0)"},{offset:1,opacity:"0",transform:"scale(0.1) translate3d(2000px, 0, 0)"}],Lg=[{offset:.4,opacity:"1",transform:"scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0)",easing:"cubic-bezier(0.55, 0.055, 0.675, 0.19)"},{offset:1,opacity:"0",transform:"scale3d(0.1, 0.1, 0.1) translate3d(0, -2000px, 0)",easing:"cubic-bezier(0.175, 0.885, 0.32, 1)"}],xd={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",easeInSine:"cubic-bezier(0.47, 0, 0.745, 0.715)",easeOutSine:"cubic-bezier(0.39, 0.575, 0.565, 1)",easeInOutSine:"cubic-bezier(0.445, 0.05, 0.55, 0.95)",easeInQuad:"cubic-bezier(0.55, 0.085, 0.68, 0.53)",easeOutQuad:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",easeInOutQuad:"cubic-bezier(0.455, 0.03, 0.515, 0.955)",easeInCubic:"cubic-bezier(0.55, 0.055, 0.675, 0.19)",easeOutCubic:"cubic-bezier(0.215, 0.61, 0.355, 1)",easeInOutCubic:"cubic-bezier(0.645, 0.045, 0.355, 1)",easeInQuart:"cubic-bezier(0.895, 0.03, 0.685, 0.22)",easeOutQuart:"cubic-bezier(0.165, 0.84, 0.44, 1)",easeInOutQuart:"cubic-bezier(0.77, 0, 0.175, 1)",easeInQuint:"cubic-bezier(0.755, 0.05, 0.855, 0.06)",easeOutQuint:"cubic-bezier(0.23, 1, 0.32, 1)",easeInOutQuint:"cubic-bezier(0.86, 0, 0.07, 1)",easeInExpo:"cubic-bezier(0.95, 0.05, 0.795, 0.035)",easeOutExpo:"cubic-bezier(0.19, 1, 0.22, 1)",easeInOutExpo:"cubic-bezier(1, 0, 0, 1)",easeInCirc:"cubic-bezier(0.6, 0.04, 0.98, 0.335)",easeOutCirc:"cubic-bezier(0.075, 0.82, 0.165, 1)",easeInOutCirc:"cubic-bezier(0.785, 0.135, 0.15, 0.86)",easeInBack:"cubic-bezier(0.6, -0.28, 0.735, 0.045)",easeOutBack:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",easeInOutBack:"cubic-bezier(0.68, -0.55, 0.265, 1.55)"},Ng=Object.freeze(Object.defineProperty({__proto__:null,backInDown:ib,backInLeft:rb,backInRight:sb,backInUp:nb,backOutDown:ob,backOutLeft:ab,backOutRight:lb,backOutUp:ub,bounce:Vm,bounceIn:cb,bounceInDown:db,bounceInLeft:hb,bounceInRight:fb,bounceInUp:pb,bounceOut:mb,bounceOutDown:bb,bounceOutLeft:gb,bounceOutRight:yb,bounceOutUp:vb,easings:xd,fadeIn:wb,fadeInBottomLeft:xb,fadeInBottomRight:_b,fadeInDown:kb,fadeInDownBig:Sb,fadeInLeft:Cb,fadeInLeftBig:Ab,fadeInRight:Eb,fadeInRightBig:Tb,fadeInTopLeft:Ob,fadeInTopRight:$b,fadeInUp:Ib,fadeInUpBig:Lb,fadeOut:Nb,fadeOutBottomLeft:Db,fadeOutBottomRight:Pb,fadeOutDown:Mb,fadeOutDownBig:zb,fadeOutLeft:Rb,fadeOutLeftBig:Bb,fadeOutRight:Fb,fadeOutRightBig:qb,fadeOutTopLeft:Ub,fadeOutTopRight:Vb,fadeOutUp:jb,fadeOutUpBig:Hb,flash:jm,flip:Kb,flipInX:Wb,flipInY:Gb,flipOutX:Yb,flipOutY:Xb,headShake:Hm,heartBeat:Km,hinge:vg,jackInTheBox:wg,jello:Wm,lightSpeedInLeft:Jb,lightSpeedInRight:Qb,lightSpeedOutLeft:Zb,lightSpeedOutRight:eg,pulse:Gm,rollIn:xg,rollOut:_g,rotateIn:tg,rotateInDownLeft:ig,rotateInDownRight:rg,rotateInUpLeft:sg,rotateInUpRight:ng,rotateOut:og,rotateOutDownLeft:ag,rotateOutDownRight:lg,rotateOutUpLeft:ug,rotateOutUpRight:cg,rubberBand:Ym,shake:Xm,shakeX:Jm,shakeY:Qm,slideInDown:dg,slideInLeft:hg,slideInRight:fg,slideInUp:pg,slideOutDown:mg,slideOutLeft:bg,slideOutRight:gg,slideOutUp:yg,swing:Zm,tada:eb,wobble:tb,zoomIn:kg,zoomInDown:Sg,zoomInLeft:Cg,zoomInRight:Ag,zoomInUp:Eg,zoomOut:Tg,zoomOutDown:Og,zoomOutLeft:$g,zoomOutRight:Ig,zoomOutUp:Lg},Symbol.toStringTag,{value:"Module"}));var Dg=U`
  :host {
    display: contents;
  }
`,Ie=class extends q{constructor(){super(...arguments),this.hasStarted=!1,this.name="none",this.play=!1,this.delay=0,this.direction="normal",this.duration=1e3,this.easing="linear",this.endDelay=0,this.fill="auto",this.iterations=1/0,this.iterationStart=0,this.playbackRate=1,this.handleAnimationFinish=()=>{this.play=!1,this.hasStarted=!1,this.emit("sl-finish")},this.handleAnimationCancel=()=>{this.play=!1,this.hasStarted=!1,this.emit("sl-cancel")}}get currentTime(){var t,e;return(e=(t=this.animation)==null?void 0:t.currentTime)!=null?e:0}set currentTime(t){this.animation&&(this.animation.currentTime=t)}connectedCallback(){super.connectedCallback(),this.createAnimation()}disconnectedCallback(){super.disconnectedCallback(),this.destroyAnimation()}handleSlotChange(){this.destroyAnimation(),this.createAnimation()}async createAnimation(){var t,e;const i=(t=xd[this.easing])!=null?t:this.easing,r=(e=this.keyframes)!=null?e:Ng[this.name],n=(await this.defaultSlot).assignedElements()[0];return!n||!r?!1:(this.destroyAnimation(),this.animation=n.animate(r,{delay:this.delay,direction:this.direction,duration:this.duration,easing:i,endDelay:this.endDelay,fill:this.fill,iterationStart:this.iterationStart,iterations:this.iterations}),this.animation.playbackRate=this.playbackRate,this.animation.addEventListener("cancel",this.handleAnimationCancel),this.animation.addEventListener("finish",this.handleAnimationFinish),this.play?(this.hasStarted=!0,this.emit("sl-start")):this.animation.pause(),!0)}destroyAnimation(){this.animation&&(this.animation.cancel(),this.animation.removeEventListener("cancel",this.handleAnimationCancel),this.animation.removeEventListener("finish",this.handleAnimationFinish),this.hasStarted=!1)}handleAnimationChange(){this.hasUpdated&&this.createAnimation()}handlePlayChange(){return this.animation?(this.play&&!this.hasStarted&&(this.hasStarted=!0,this.emit("sl-start")),this.play?this.animation.play():this.animation.pause(),!0):!1}handlePlaybackRateChange(){this.animation&&(this.animation.playbackRate=this.playbackRate)}cancel(){var t;(t=this.animation)==null||t.cancel()}finish(){var t;(t=this.animation)==null||t.finish()}render(){return N` <slot @slotchange=${this.handleSlotChange}></slot> `}};Ie.styles=[H,Dg];m([t0("slot")],Ie.prototype,"defaultSlot",2);m([k()],Ie.prototype,"name",2);m([k({type:Boolean,reflect:!0})],Ie.prototype,"play",2);m([k({type:Number})],Ie.prototype,"delay",2);m([k()],Ie.prototype,"direction",2);m([k({type:Number})],Ie.prototype,"duration",2);m([k()],Ie.prototype,"easing",2);m([k({attribute:"end-delay",type:Number})],Ie.prototype,"endDelay",2);m([k()],Ie.prototype,"fill",2);m([k({type:Number})],Ie.prototype,"iterations",2);m([k({attribute:"iteration-start",type:Number})],Ie.prototype,"iterationStart",2);m([k({attribute:!1})],Ie.prototype,"keyframes",2);m([k({attribute:"playback-rate",type:Number})],Ie.prototype,"playbackRate",2);m([M(["name","delay","direction","duration","easing","endDelay","fill","iterations","iterationsStart","keyframes"])],Ie.prototype,"handleAnimationChange",1);m([M("play")],Ie.prototype,"handlePlayChange",1);m([M("playbackRate")],Ie.prototype,"handlePlaybackRateChange",1);Ie.define("sl-animation");function Ri(t,e,i){if(typeof t!="function"||!t.prototype)throw new TypeError("First argument must be a constructor function");if(typeof e!="string")throw new TypeError("Second argument must be a string");if(Object.prototype.hasOwnProperty.call(t.prototype,e)){console.warn(`${t.name}.prototype.${e} already defined — skipping.`);return}const r=Object.assign({writable:!0,configurable:!0,enumerable:!1},i);Object.defineProperty(t.prototype,e,r)}Ri(String,"separate",{value:function(e=" "){return this.replace(/([a-z])([A-Z])/g,`$1${e}$2`)}});Ri(String,"normalizeWords",{value:function(e=/[^a-z0-9]+/gi){if(!(e instanceof RegExp))throw new TypeError("separator must be a RegExp");return this.toLowerCase().replaceAll(e," ").trim()}});Ri(String,"toTitleCase",{value:function(){return this.split(/\s+/).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")}});Ri(String,"toCamelCase",{value:function(){return this.split(/\s+/).map((e,i)=>i===0?e:e.charAt(0).toUpperCase()+e.slice(1)).join("")}});Ri(Object,"except",{value:function(...e){return Object.fromEntries(Object.entries(this).filter(([i])=>!e.includes(i)))}});Ri(Array,"remove",{value:function(e){const i=this.indexOf(e);return i>-1&&this.splice(i,1),this}});Ri(Function,"debounce",{value:function(e){let i=null;const r=this;return function(){const s=this,n=arguments,o=function(){i=null,r.apply(s,n)};clearTimeout(i),i=setTimeout(o,e)}}});const Va=Symbol.for("yaml.alias"),ma=Symbol.for("yaml.document"),ti=Symbol.for("yaml.map"),_d=Symbol.for("yaml.pair"),Dt=Symbol.for("yaml.scalar"),br=Symbol.for("yaml.seq"),at=Symbol.for("yaml.node.type"),ci=t=>!!t&&typeof t=="object"&&t[at]===Va,Bi=t=>!!t&&typeof t=="object"&&t[at]===ma,gr=t=>!!t&&typeof t=="object"&&t[at]===ti,be=t=>!!t&&typeof t=="object"&&t[at]===_d,he=t=>!!t&&typeof t=="object"&&t[at]===Dt,yr=t=>!!t&&typeof t=="object"&&t[at]===br;function ye(t){if(t&&typeof t=="object")switch(t[at]){case ti:case br:return!0}return!1}function ve(t){if(t&&typeof t=="object")switch(t[at]){case Va:case ti:case Dt:case br:return!0}return!1}const kd=t=>(he(t)||ye(t))&&!!t.anchor,Ke=Symbol("break visit"),Sd=Symbol("skip children"),Lt=Symbol("remove node");function Fi(t,e){const i=Cd(e);Bi(t)?Gi(null,t.contents,i,Object.freeze([t]))===Lt&&(t.contents=null):Gi(null,t,i,Object.freeze([]))}Fi.BREAK=Ke;Fi.SKIP=Sd;Fi.REMOVE=Lt;function Gi(t,e,i,r){const s=Ad(t,e,i,r);if(ve(s)||be(s))return Ed(t,r,s),Gi(t,s,i,r);if(typeof s!="symbol"){if(ye(e)){r=Object.freeze(r.concat(e));for(let n=0;n<e.items.length;++n){const o=Gi(n,e.items[n],i,r);if(typeof o=="number")n=o-1;else{if(o===Ke)return Ke;o===Lt&&(e.items.splice(n,1),n-=1)}}}else if(be(e)){r=Object.freeze(r.concat(e));const n=Gi("key",e.key,i,r);if(n===Ke)return Ke;n===Lt&&(e.key=null);const o=Gi("value",e.value,i,r);if(o===Ke)return Ke;o===Lt&&(e.value=null)}}return s}async function _n(t,e){const i=Cd(e);Bi(t)?await Yi(null,t.contents,i,Object.freeze([t]))===Lt&&(t.contents=null):await Yi(null,t,i,Object.freeze([]))}_n.BREAK=Ke;_n.SKIP=Sd;_n.REMOVE=Lt;async function Yi(t,e,i,r){const s=await Ad(t,e,i,r);if(ve(s)||be(s))return Ed(t,r,s),Yi(t,s,i,r);if(typeof s!="symbol"){if(ye(e)){r=Object.freeze(r.concat(e));for(let n=0;n<e.items.length;++n){const o=await Yi(n,e.items[n],i,r);if(typeof o=="number")n=o-1;else{if(o===Ke)return Ke;o===Lt&&(e.items.splice(n,1),n-=1)}}}else if(be(e)){r=Object.freeze(r.concat(e));const n=await Yi("key",e.key,i,r);if(n===Ke)return Ke;n===Lt&&(e.key=null);const o=await Yi("value",e.value,i,r);if(o===Ke)return Ke;o===Lt&&(e.value=null)}}return s}function Cd(t){return typeof t=="object"&&(t.Collection||t.Node||t.Value)?Object.assign({Alias:t.Node,Map:t.Node,Scalar:t.Node,Seq:t.Node},t.Value&&{Map:t.Value,Scalar:t.Value,Seq:t.Value},t.Collection&&{Map:t.Collection,Seq:t.Collection},t):t}function Ad(t,e,i,r){if(typeof i=="function")return i(t,e,r);if(gr(e))return i.Map?.(t,e,r);if(yr(e))return i.Seq?.(t,e,r);if(be(e))return i.Pair?.(t,e,r);if(he(e))return i.Scalar?.(t,e,r);if(ci(e))return i.Alias?.(t,e,r)}function Ed(t,e,i){const r=e[e.length-1];if(ye(r))r.items[t]=i;else if(be(r))t==="key"?r.key=i:r.value=i;else if(Bi(r))r.contents=i;else{const s=ci(r)?"alias":"scalar";throw new Error(`Cannot replace node with ${s} parent`)}}const Pg={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Mg=t=>t.replace(/[!,[\]{}]/g,e=>Pg[e]);class qe{constructor(e,i){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},qe.defaultYaml,e),this.tags=Object.assign({},qe.defaultTags,i)}clone(){const e=new qe(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){const e=new qe(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:qe.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},qe.defaultTags);break}return e}add(e,i){this.atNextDocument&&(this.yaml={explicit:qe.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},qe.defaultTags),this.atNextDocument=!1);const r=e.trim().split(/[ \t]+/),s=r.shift();switch(s){case"%TAG":{if(r.length!==2&&(i(0,"%TAG directive should contain exactly two parts"),r.length<2))return!1;const[n,o]=r;return this.tags[n]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,r.length!==1)return i(0,"%YAML directive should contain exactly one part"),!1;const[n]=r;if(n==="1.1"||n==="1.2")return this.yaml.version=n,!0;{const o=/^\d+\.\d+$/.test(n);return i(6,`Unsupported YAML version ${n}`,o),!1}}default:return i(0,`Unknown directive ${s}`,!0),!1}}tagName(e,i){if(e==="!")return"!";if(e[0]!=="!")return i(`Not a valid tag: ${e}`),null;if(e[1]==="<"){const o=e.slice(2,-1);return o==="!"||o==="!!"?(i(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&i("Verbatim tags must end with a >"),o)}const[,r,s]=e.match(/^(.*!)([^!]*)$/s);s||i(`The ${e} tag has no suffix`);const n=this.tags[r];if(n)try{return n+decodeURIComponent(s)}catch(o){return i(String(o)),null}return r==="!"?e:(i(`Could not resolve tag: ${e}`),null)}tagString(e){for(const[i,r]of Object.entries(this.tags))if(e.startsWith(r))return i+Mg(e.substring(r.length));return e[0]==="!"?e:`!<${e}>`}toString(e){const i=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],r=Object.entries(this.tags);let s;if(e&&r.length>0&&ve(e.contents)){const n={};Fi(e.contents,(o,l)=>{ve(l)&&l.tag&&(n[l.tag]=!0)}),s=Object.keys(n)}else s=[];for(const[n,o]of r)n==="!!"&&o==="tag:yaml.org,2002:"||(!e||s.some(l=>l.startsWith(o)))&&i.push(`%TAG ${n} ${o}`);return i.join(`
`)}}qe.defaultYaml={explicit:!1,version:"1.2"};qe.defaultTags={"!!":"tag:yaml.org,2002:"};function Td(t){if(/[\x00-\x19\s,[\]{}]/.test(t)){const i=`Anchor must not contain whitespace or control characters: ${JSON.stringify(t)}`;throw new Error(i)}return!0}function Od(t){const e=new Set;return Fi(t,{Value(i,r){r.anchor&&e.add(r.anchor)}}),e}function $d(t,e){for(let i=1;;++i){const r=`${t}${i}`;if(!e.has(r))return r}}function zg(t,e){const i=[],r=new Map;let s=null;return{onAnchor:n=>{i.push(n),s??(s=Od(t));const o=$d(e,s);return s.add(o),o},setAnchors:()=>{for(const n of i){const o=r.get(n);if(typeof o=="object"&&o.anchor&&(he(o.node)||ye(o.node)))o.node.anchor=o.anchor;else{const l=new Error("Failed to resolve repeated object (this should not happen)");throw l.source=n,l}}},sourceObjects:r}}function Xi(t,e,i,r){if(r&&typeof r=="object")if(Array.isArray(r))for(let s=0,n=r.length;s<n;++s){const o=r[s],l=Xi(t,r,String(s),o);l===void 0?delete r[s]:l!==o&&(r[s]=l)}else if(r instanceof Map)for(const s of Array.from(r.keys())){const n=r.get(s),o=Xi(t,r,s,n);o===void 0?r.delete(s):o!==n&&r.set(s,o)}else if(r instanceof Set)for(const s of Array.from(r)){const n=Xi(t,r,s,s);n===void 0?r.delete(s):n!==s&&(r.delete(s),r.add(n))}else for(const[s,n]of Object.entries(r)){const o=Xi(t,r,s,n);o===void 0?delete r[s]:o!==n&&(r[s]=o)}return t.call(e,i,r)}function ot(t,e,i){if(Array.isArray(t))return t.map((r,s)=>ot(r,String(s),i));if(t&&typeof t.toJSON=="function"){if(!i||!kd(t))return t.toJSON(e,i);const r={aliasCount:0,count:1,res:void 0};i.anchors.set(t,r),i.onCreate=n=>{r.res=n,delete i.onCreate};const s=t.toJSON(e,i);return i.onCreate&&i.onCreate(s),s}return typeof t=="bigint"&&!i?.keep?Number(t):t}class ja{constructor(e){Object.defineProperty(this,at,{value:e})}clone(){const e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:i,maxAliasCount:r,onAnchor:s,reviver:n}={}){if(!Bi(e))throw new TypeError("A document argument is required");const o={anchors:new Map,doc:e,keep:!0,mapAsMap:i===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},l=ot(this,"",o);if(typeof s=="function")for(const{count:u,res:c}of o.anchors.values())s(c,u);return typeof n=="function"?Xi(n,{"":l},"",l):l}}class kn extends ja{constructor(e){super(Va),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,i){let r;i?.aliasResolveCache?r=i.aliasResolveCache:(r=[],Fi(e,{Node:(n,o)=>{(ci(o)||kd(o))&&r.push(o)}}),i&&(i.aliasResolveCache=r));let s;for(const n of r){if(n===this)break;n.anchor===this.source&&(s=n)}return s}toJSON(e,i){if(!i)return{source:this.source};const{anchors:r,doc:s,maxAliasCount:n}=i,o=this.resolve(s,i);if(!o){const u=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(u)}let l=r.get(o);if(l||(ot(o,null,i),l=r.get(o)),l?.res===void 0){const u="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(u)}if(n>=0&&(l.count+=1,l.aliasCount===0&&(l.aliasCount=Hs(s,o,r)),l.count*l.aliasCount>n)){const u="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(u)}return l.res}toString(e,i,r){const s=`*${this.source}`;if(e){if(Td(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){const n=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(n)}if(e.implicitKey)return`${s} `}return s}}function Hs(t,e,i){if(ci(e)){const r=e.resolve(t),s=i&&r&&i.get(r);return s?s.count*s.aliasCount:0}else if(ye(e)){let r=0;for(const s of e.items){const n=Hs(t,s,i);n>r&&(r=n)}return r}else if(be(e)){const r=Hs(t,e.key,i),s=Hs(t,e.value,i);return Math.max(r,s)}return 1}const Id=t=>!t||typeof t!="function"&&typeof t!="object";class Y extends ja{constructor(e){super(Dt),this.value=e}toJSON(e,i){return i?.keep?this.value:ot(this.value,e,i)}toString(){return String(this.value)}}Y.BLOCK_FOLDED="BLOCK_FOLDED";Y.BLOCK_LITERAL="BLOCK_LITERAL";Y.PLAIN="PLAIN";Y.QUOTE_DOUBLE="QUOTE_DOUBLE";Y.QUOTE_SINGLE="QUOTE_SINGLE";const Rg="tag:yaml.org,2002:";function Bg(t,e,i){if(e){const r=i.filter(n=>n.tag===e),s=r.find(n=>!n.format)??r[0];if(!s)throw new Error(`Tag ${e} not found`);return s}return i.find(r=>r.identify?.(t)&&!r.format)}function Jr(t,e,i){if(Bi(t)&&(t=t.contents),ve(t))return t;if(be(t)){const f=i.schema[ti].createNode?.(i.schema,null,i);return f.items.push(t),f}(t instanceof String||t instanceof Number||t instanceof Boolean||typeof BigInt<"u"&&t instanceof BigInt)&&(t=t.valueOf());const{aliasDuplicateObjects:r,onAnchor:s,onTagObj:n,schema:o,sourceObjects:l}=i;let u;if(r&&t&&typeof t=="object"){if(u=l.get(t),u)return u.anchor??(u.anchor=s(t)),new kn(u.anchor);u={anchor:null,node:null},l.set(t,u)}e?.startsWith("!!")&&(e=Rg+e.slice(2));let c=Bg(t,e,o.tags);if(!c){if(t&&typeof t.toJSON=="function"&&(t=t.toJSON()),!t||typeof t!="object"){const f=new Y(t);return u&&(u.node=f),f}c=t instanceof Map?o[ti]:Symbol.iterator in Object(t)?o[br]:o[ti]}n&&(n(c),delete i.onTagObj);const h=c?.createNode?c.createNode(i.schema,t,i):typeof c?.nodeClass?.from=="function"?c.nodeClass.from(i.schema,t,i):new Y(t);return e?h.tag=e:c.default||(h.tag=c.tag),u&&(u.node=h),h}function on(t,e,i){let r=i;for(let s=e.length-1;s>=0;--s){const n=e[s];if(typeof n=="number"&&Number.isInteger(n)&&n>=0){const o=[];o[n]=r,r=o}else r=new Map([[n,r]])}return Jr(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:t,sourceObjects:new Map})}const Dr=t=>t==null||typeof t=="object"&&!!t[Symbol.iterator]().next().done;class Ld extends ja{constructor(e,i){super(e),Object.defineProperty(this,"schema",{value:i,configurable:!0,enumerable:!1,writable:!0})}clone(e){const i=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(i.schema=e),i.items=i.items.map(r=>ve(r)||be(r)?r.clone(e):r),this.range&&(i.range=this.range.slice()),i}addIn(e,i){if(Dr(e))this.add(i);else{const[r,...s]=e,n=this.get(r,!0);if(ye(n))n.addIn(s,i);else if(n===void 0&&this.schema)this.set(r,on(this.schema,s,i));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${s}`)}}deleteIn(e){const[i,...r]=e;if(r.length===0)return this.delete(i);const s=this.get(i,!0);if(ye(s))return s.deleteIn(r);throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}getIn(e,i){const[r,...s]=e,n=this.get(r,!0);return s.length===0?!i&&he(n)?n.value:n:ye(n)?n.getIn(s,i):void 0}hasAllNullValues(e){return this.items.every(i=>{if(!be(i))return!1;const r=i.value;return r==null||e&&he(r)&&r.value==null&&!r.commentBefore&&!r.comment&&!r.tag})}hasIn(e){const[i,...r]=e;if(r.length===0)return this.has(i);const s=this.get(i,!0);return ye(s)?s.hasIn(r):!1}setIn(e,i){const[r,...s]=e;if(s.length===0)this.set(r,i);else{const n=this.get(r,!0);if(ye(n))n.setIn(s,i);else if(n===void 0&&this.schema)this.set(r,on(this.schema,s,i));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${s}`)}}}const Fg=t=>t.replace(/^(?!$)(?: $)?/gm,"#");function Wt(t,e){return/^\n+$/.test(t)?t.substring(1):e?t.replace(/^(?! *$)/gm,e):t}const xi=(t,e,i)=>t.endsWith(`
`)?Wt(i,e):i.includes(`
`)?`
`+Wt(i,e):(t.endsWith(" ")?"":" ")+i,Nd="flow",ba="block",Ks="quoted";function Sn(t,e,i="flow",{indentAtStart:r,lineWidth:s=80,minContentWidth:n=20,onFold:o,onOverflow:l}={}){if(!s||s<0)return t;s<n&&(n=0);const u=Math.max(1+n,1+s-e.length);if(t.length<=u)return t;const c=[],h={};let f=s-e.length;typeof r=="number"&&(r>s-Math.max(2,n)?c.push(0):f=s-r);let a,d,p=!1,b=-1,w=-1,g=-1;i===ba&&(b=hu(t,b,e.length),b!==-1&&(f=b+u));for(let _;_=t[b+=1];){if(i===Ks&&_==="\\"){switch(w=b,t[b+1]){case"x":b+=3;break;case"u":b+=5;break;case"U":b+=9;break;default:b+=1}g=b}if(_===`
`)i===ba&&(b=hu(t,b,e.length)),f=b+e.length+u,a=void 0;else{if(_===" "&&d&&d!==" "&&d!==`
`&&d!=="	"){const v=t[b+1];v&&v!==" "&&v!==`
`&&v!=="	"&&(a=b)}if(b>=f)if(a)c.push(a),f=a+u,a=void 0;else if(i===Ks){for(;d===" "||d==="	";)d=_,_=t[b+=1],p=!0;const v=b>g+1?b-2:w-1;if(h[v])return t;c.push(v),h[v]=!0,f=v+u,a=void 0}else p=!0}d=_}if(p&&l&&l(),c.length===0)return t;o&&o();let x=t.slice(0,c[0]);for(let _=0;_<c.length;++_){const v=c[_],y=c[_+1]||t.length;v===0?x=`
${e}${t.slice(0,y)}`:(i===Ks&&h[v]&&(x+=`${t[v]}\\`),x+=`
${e}${t.slice(v+1,y)}`)}return x}function hu(t,e,i){let r=e,s=e+1,n=t[s];for(;n===" "||n==="	";)if(e<s+i)n=t[++e];else{do n=t[++e];while(n&&n!==`
`);r=e,s=e+1,n=t[s]}return r}const Cn=(t,e)=>({indentAtStart:e?t.indent.length:t.indentAtStart,lineWidth:t.options.lineWidth,minContentWidth:t.options.minContentWidth}),An=t=>/^(%|---|\.\.\.)/m.test(t);function qg(t,e,i){if(!e||e<0)return!1;const r=e-i,s=t.length;if(s<=r)return!1;for(let n=0,o=0;n<s;++n)if(t[n]===`
`){if(n-o>r)return!0;if(o=n+1,s-o<=r)return!1}return!0}function Hr(t,e){const i=JSON.stringify(t);if(e.options.doubleQuotedAsJSON)return i;const{implicitKey:r}=e,s=e.options.doubleQuotedMinMultiLineLength,n=e.indent||(An(t)?"  ":"");let o="",l=0;for(let u=0,c=i[u];c;c=i[++u])if(c===" "&&i[u+1]==="\\"&&i[u+2]==="n"&&(o+=i.slice(l,u)+"\\ ",u+=1,l=u,c="\\"),c==="\\")switch(i[u+1]){case"u":{o+=i.slice(l,u);const h=i.substr(u+2,4);switch(h){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:h.substr(0,2)==="00"?o+="\\x"+h.substr(2):o+=i.substr(u,6)}u+=5,l=u+1}break;case"n":if(r||i[u+2]==='"'||i.length<s)u+=1;else{for(o+=i.slice(l,u)+`

`;i[u+2]==="\\"&&i[u+3]==="n"&&i[u+4]!=='"';)o+=`
`,u+=2;o+=n,i[u+2]===" "&&(o+="\\"),u+=1,l=u+1}break;default:u+=1}return o=l?o+i.slice(l):i,r?o:Sn(o,n,Ks,Cn(e,!1))}function ga(t,e){if(e.options.singleQuote===!1||e.implicitKey&&t.includes(`
`)||/[ \t]\n|\n[ \t]/.test(t))return Hr(t,e);const i=e.indent||(An(t)?"  ":""),r="'"+t.replace(/'/g,"''").replace(/\n+/g,`$&
${i}`)+"'";return e.implicitKey?r:Sn(r,i,Nd,Cn(e,!1))}function Ji(t,e){const{singleQuote:i}=e.options;let r;if(i===!1)r=Hr;else{const s=t.includes('"'),n=t.includes("'");s&&!n?r=ga:n&&!s?r=Hr:r=i?ga:Hr}return r(t,e)}let ya;try{ya=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{ya=/\n+(?!\n|$)/g}function Ws({comment:t,type:e,value:i},r,s,n){const{blockQuote:o,commentString:l,lineWidth:u}=r.options;if(!o||/\n[\t ]+$/.test(i))return Ji(i,r);const c=r.indent||(r.forceBlockIndent||An(i)?"  ":""),h=o==="literal"?!0:o==="folded"||e===Y.BLOCK_FOLDED?!1:e===Y.BLOCK_LITERAL?!0:!qg(i,u,c.length);if(!i)return h?`|
`:`>
`;let f,a;for(a=i.length;a>0;--a){const y=i[a-1];if(y!==`
`&&y!=="	"&&y!==" ")break}let d=i.substring(a);const p=d.indexOf(`
`);p===-1?f="-":i===d||p!==d.length-1?(f="+",n&&n()):f="",d&&(i=i.slice(0,-d.length),d[d.length-1]===`
`&&(d=d.slice(0,-1)),d=d.replace(ya,`$&${c}`));let b=!1,w,g=-1;for(w=0;w<i.length;++w){const y=i[w];if(y===" ")b=!0;else if(y===`
`)g=w;else break}let x=i.substring(0,g<w?g+1:w);x&&(i=i.substring(x.length),x=x.replace(/\n+/g,`$&${c}`));let v=(b?c?"2":"1":"")+f;if(t&&(v+=" "+l(t.replace(/ ?[\r\n]+/g," ")),s&&s()),!h){const y=i.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${c}`);let S=!1;const C=Cn(r,!0);o!=="folded"&&e!==Y.BLOCK_FOLDED&&(C.onOverflow=()=>{S=!0});const A=Sn(`${x}${y}${d}`,c,ba,C);if(!S)return`>${v}
${c}${A}`}return i=i.replace(/\n+/g,`$&${c}`),`|${v}
${c}${x}${i}${d}`}function Ug(t,e,i,r){const{type:s,value:n}=t,{actualString:o,implicitKey:l,indent:u,indentStep:c,inFlow:h}=e;if(l&&n.includes(`
`)||h&&/[[\]{},]/.test(n))return Ji(n,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(n))return l||h||!n.includes(`
`)?Ji(n,e):Ws(t,e,i,r);if(!l&&!h&&s!==Y.PLAIN&&n.includes(`
`))return Ws(t,e,i,r);if(An(n)){if(u==="")return e.forceBlockIndent=!0,Ws(t,e,i,r);if(l&&u===c)return Ji(n,e)}const f=n.replace(/\n+/g,`$&
${u}`);if(o){const a=b=>b.default&&b.tag!=="tag:yaml.org,2002:str"&&b.test?.test(f),{compat:d,tags:p}=e.doc.schema;if(p.some(a)||d?.some(a))return Ji(n,e)}return l?f:Sn(f,u,Nd,Cn(e,!1))}function ds(t,e,i,r){const{implicitKey:s,inFlow:n}=e,o=typeof t.value=="string"?t:Object.assign({},t,{value:String(t.value)});let{type:l}=t;l!==Y.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(l=Y.QUOTE_DOUBLE);const u=h=>{switch(h){case Y.BLOCK_FOLDED:case Y.BLOCK_LITERAL:return s||n?Ji(o.value,e):Ws(o,e,i,r);case Y.QUOTE_DOUBLE:return Hr(o.value,e);case Y.QUOTE_SINGLE:return ga(o.value,e);case Y.PLAIN:return Ug(o,e,i,r);default:return null}};let c=u(l);if(c===null){const{defaultKeyType:h,defaultStringType:f}=e.options,a=s&&h||f;if(c=u(a),c===null)throw new Error(`Unsupported default string type ${a}`)}return c}function Dd(t,e){const i=Object.assign({blockQuote:!0,commentString:Fg,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trueStr:"true",verifyAliasOrder:!0},t.schema.toStringOptions,e);let r;switch(i.collectionStyle){case"block":r=!1;break;case"flow":r=!0;break;default:r=null}return{anchors:new Set,doc:t,flowCollectionPadding:i.flowCollectionPadding?" ":"",indent:"",indentStep:typeof i.indent=="number"?" ".repeat(i.indent):"  ",inFlow:r,options:i}}function Vg(t,e){if(e.tag){const s=t.filter(n=>n.tag===e.tag);if(s.length>0)return s.find(n=>n.format===e.format)??s[0]}let i,r;if(he(e)){r=e.value;let s=t.filter(n=>n.identify?.(r));if(s.length>1){const n=s.filter(o=>o.test);n.length>0&&(s=n)}i=s.find(n=>n.format===e.format)??s.find(n=>!n.format)}else r=e,i=t.find(s=>s.nodeClass&&r instanceof s.nodeClass);if(!i){const s=r?.constructor?.name??(r===null?"null":typeof r);throw new Error(`Tag not resolved for ${s} value`)}return i}function jg(t,e,{anchors:i,doc:r}){if(!r.directives)return"";const s=[],n=(he(t)||ye(t))&&t.anchor;n&&Td(n)&&(i.add(n),s.push(`&${n}`));const o=t.tag??(e.default?null:e.tag);return o&&s.push(r.directives.tagString(o)),s.join(" ")}function nr(t,e,i,r){if(be(t))return t.toString(e,i,r);if(ci(t)){if(e.doc.directives)return t.toString(e);if(e.resolvedAliases?.has(t))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(t):e.resolvedAliases=new Set([t]),t=t.resolve(e.doc)}let s;const n=ve(t)?t:e.doc.createNode(t,{onTagObj:u=>s=u});s??(s=Vg(e.doc.schema.tags,n));const o=jg(n,s,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);const l=typeof s.stringify=="function"?s.stringify(n,e,i,r):he(n)?ds(n,e,i,r):n.toString(e,i,r);return o?he(n)||l[0]==="{"||l[0]==="["?`${o} ${l}`:`${o}
${e.indent}${l}`:l}function Hg({key:t,value:e},i,r,s){const{allNullValues:n,doc:o,indent:l,indentStep:u,options:{commentString:c,indentSeq:h,simpleKeys:f}}=i;let a=ve(t)&&t.comment||null;if(f){if(a)throw new Error("With simple keys, key nodes cannot have comments");if(ye(t)||!ve(t)&&typeof t=="object"){const C="With simple keys, collection cannot be used as a key value";throw new Error(C)}}let d=!f&&(!t||a&&e==null&&!i.inFlow||ye(t)||(he(t)?t.type===Y.BLOCK_FOLDED||t.type===Y.BLOCK_LITERAL:typeof t=="object"));i=Object.assign({},i,{allNullValues:!1,implicitKey:!d&&(f||!n),indent:l+u});let p=!1,b=!1,w=nr(t,i,()=>p=!0,()=>b=!0);if(!d&&!i.inFlow&&w.length>1024){if(f)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");d=!0}if(i.inFlow){if(n||e==null)return p&&r&&r(),w===""?"?":d?`? ${w}`:w}else if(n&&!f||e==null&&d)return w=`? ${w}`,a&&!p?w+=xi(w,i.indent,c(a)):b&&s&&s(),w;p&&(a=null),d?(a&&(w+=xi(w,i.indent,c(a))),w=`? ${w}
${l}:`):(w=`${w}:`,a&&(w+=xi(w,i.indent,c(a))));let g,x,_;ve(e)?(g=!!e.spaceBefore,x=e.commentBefore,_=e.comment):(g=!1,x=null,_=null,e&&typeof e=="object"&&(e=o.createNode(e))),i.implicitKey=!1,!d&&!a&&he(e)&&(i.indentAtStart=w.length+1),b=!1,!h&&u.length>=2&&!i.inFlow&&!d&&yr(e)&&!e.flow&&!e.tag&&!e.anchor&&(i.indent=i.indent.substring(2));let v=!1;const y=nr(e,i,()=>v=!0,()=>b=!0);let S=" ";if(a||g||x){if(S=g?`
`:"",x){const C=c(x);S+=`
${Wt(C,i.indent)}`}y===""&&!i.inFlow?S===`
`&&_&&(S=`

`):S+=`
${i.indent}`}else if(!d&&ye(e)){const C=y[0],A=y.indexOf(`
`),T=A!==-1,$=i.inFlow??e.flow??e.items.length===0;if(T||!$){let E=!1;if(T&&(C==="&"||C==="!")){let O=y.indexOf(" ");C==="&"&&O!==-1&&O<A&&y[O+1]==="!"&&(O=y.indexOf(" ",O+1)),(O===-1||A<O)&&(E=!0)}E||(S=`
${i.indent}`)}}else(y===""||y[0]===`
`)&&(S="");return w+=S+y,i.inFlow?v&&r&&r():_&&!v?w+=xi(w,i.indent,c(_)):b&&s&&s(),w}function Pd(t,e){(t==="debug"||t==="warn")&&console.warn(e)}const As="<<",Gt={identify:t=>t===As||typeof t=="symbol"&&t.description===As,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new Y(Symbol(As)),{addToJSMap:Md}),stringify:()=>As},Kg=(t,e)=>(Gt.identify(e)||he(e)&&(!e.type||e.type===Y.PLAIN)&&Gt.identify(e.value))&&t?.doc.schema.tags.some(i=>i.tag===Gt.tag&&i.default);function Md(t,e,i){if(i=t&&ci(i)?i.resolve(t.doc):i,yr(i))for(const r of i.items)oo(t,e,r);else if(Array.isArray(i))for(const r of i)oo(t,e,r);else oo(t,e,i)}function oo(t,e,i){const r=t&&ci(i)?i.resolve(t.doc):i;if(!gr(r))throw new Error("Merge sources must be maps or map aliases");const s=r.toJSON(null,t,Map);for(const[n,o]of s)e instanceof Map?e.has(n)||e.set(n,o):e instanceof Set?e.add(n):Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function zd(t,e,{key:i,value:r}){if(ve(i)&&i.addToJSMap)i.addToJSMap(t,e,r);else if(Kg(t,i))Md(t,e,r);else{const s=ot(i,"",t);if(e instanceof Map)e.set(s,ot(r,s,t));else if(e instanceof Set)e.add(s);else{const n=Wg(i,s,t),o=ot(r,n,t);n in e?Object.defineProperty(e,n,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[n]=o}}return e}function Wg(t,e,i){if(e===null)return"";if(typeof e!="object")return String(e);if(ve(t)&&i?.doc){const r=Dd(i.doc,{});r.anchors=new Set;for(const n of i.anchors.keys())r.anchors.add(n.anchor);r.inFlow=!0,r.inStringifyKey=!0;const s=t.toString(r);if(!i.mapKeyWarned){let n=JSON.stringify(s);n.length>40&&(n=n.substring(0,36)+'..."'),Pd(i.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${n}. Set mapAsMap: true to use object keys.`),i.mapKeyWarned=!0}return s}return JSON.stringify(e)}function Ha(t,e,i){const r=Jr(t,void 0,i),s=Jr(e,void 0,i);return new ze(r,s)}class ze{constructor(e,i=null){Object.defineProperty(this,at,{value:_d}),this.key=e,this.value=i}clone(e){let{key:i,value:r}=this;return ve(i)&&(i=i.clone(e)),ve(r)&&(r=r.clone(e)),new ze(i,r)}toJSON(e,i){const r=i?.mapAsMap?new Map:{};return zd(i,r,this)}toString(e,i,r){return e?.doc?Hg(this,e,i,r):JSON.stringify(this)}}function Rd(t,e,i){return(e.inFlow??t.flow?Yg:Gg)(t,e,i)}function Gg({comment:t,items:e},i,{blockItemPrefix:r,flowChars:s,itemIndent:n,onChompKeep:o,onComment:l}){const{indent:u,options:{commentString:c}}=i,h=Object.assign({},i,{indent:n,type:null});let f=!1;const a=[];for(let p=0;p<e.length;++p){const b=e[p];let w=null;if(ve(b))!f&&b.spaceBefore&&a.push(""),an(i,a,b.commentBefore,f),b.comment&&(w=b.comment);else if(be(b)){const x=ve(b.key)?b.key:null;x&&(!f&&x.spaceBefore&&a.push(""),an(i,a,x.commentBefore,f))}f=!1;let g=nr(b,h,()=>w=null,()=>f=!0);w&&(g+=xi(g,n,c(w))),f&&w&&(f=!1),a.push(r+g)}let d;if(a.length===0)d=s.start+s.end;else{d=a[0];for(let p=1;p<a.length;++p){const b=a[p];d+=b?`
${u}${b}`:`
`}}return t?(d+=`
`+Wt(c(t),u),l&&l()):f&&o&&o(),d}function Yg({items:t},e,{flowChars:i,itemIndent:r}){const{indent:s,indentStep:n,flowCollectionPadding:o,options:{commentString:l}}=e;r+=n;const u=Object.assign({},e,{indent:r,inFlow:!0,type:null});let c=!1,h=0;const f=[];for(let p=0;p<t.length;++p){const b=t[p];let w=null;if(ve(b))b.spaceBefore&&f.push(""),an(e,f,b.commentBefore,!1),b.comment&&(w=b.comment);else if(be(b)){const x=ve(b.key)?b.key:null;x&&(x.spaceBefore&&f.push(""),an(e,f,x.commentBefore,!1),x.comment&&(c=!0));const _=ve(b.value)?b.value:null;_?(_.comment&&(w=_.comment),_.commentBefore&&(c=!0)):b.value==null&&x?.comment&&(w=x.comment)}w&&(c=!0);let g=nr(b,u,()=>w=null);p<t.length-1&&(g+=","),w&&(g+=xi(g,r,l(w))),!c&&(f.length>h||g.includes(`
`))&&(c=!0),f.push(g),h=f.length}const{start:a,end:d}=i;if(f.length===0)return a+d;if(!c){const p=f.reduce((b,w)=>b+w.length+2,2);c=e.options.lineWidth>0&&p>e.options.lineWidth}if(c){let p=a;for(const b of f)p+=b?`
${n}${s}${b}`:`
`;return`${p}
${s}${d}`}else return`${a}${o}${f.join(" ")}${o}${d}`}function an({indent:t,options:{commentString:e}},i,r,s){if(r&&s&&(r=r.replace(/^\n+/,"")),r){const n=Wt(e(r),t);i.push(n.trimStart())}}function _i(t,e){const i=he(e)?e.value:e;for(const r of t)if(be(r)&&(r.key===e||r.key===i||he(r.key)&&r.key.value===i))return r}class Xe extends Ld{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ti,e),this.items=[]}static from(e,i,r){const{keepUndefined:s,replacer:n}=r,o=new this(e),l=(u,c)=>{if(typeof n=="function")c=n.call(i,u,c);else if(Array.isArray(n)&&!n.includes(u))return;(c!==void 0||s)&&o.items.push(Ha(u,c,r))};if(i instanceof Map)for(const[u,c]of i)l(u,c);else if(i&&typeof i=="object")for(const u of Object.keys(i))l(u,i[u]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,i){let r;be(e)?r=e:!e||typeof e!="object"||!("key"in e)?r=new ze(e,e?.value):r=new ze(e.key,e.value);const s=_i(this.items,r.key),n=this.schema?.sortMapEntries;if(s){if(!i)throw new Error(`Key ${r.key} already set`);he(s.value)&&Id(r.value)?s.value.value=r.value:s.value=r.value}else if(n){const o=this.items.findIndex(l=>n(r,l)<0);o===-1?this.items.push(r):this.items.splice(o,0,r)}else this.items.push(r)}delete(e){const i=_i(this.items,e);return i?this.items.splice(this.items.indexOf(i),1).length>0:!1}get(e,i){const s=_i(this.items,e)?.value;return(!i&&he(s)?s.value:s)??void 0}has(e){return!!_i(this.items,e)}set(e,i){this.add(new ze(e,i),!0)}toJSON(e,i,r){const s=r?new r:i?.mapAsMap?new Map:{};i?.onCreate&&i.onCreate(s);for(const n of this.items)zd(i,s,n);return s}toString(e,i,r){if(!e)return JSON.stringify(this);for(const s of this.items)if(!be(s))throw new Error(`Map items must all be pairs; found ${JSON.stringify(s)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),Rd(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:r,onComment:i})}}const vr={collection:"map",default:!0,nodeClass:Xe,tag:"tag:yaml.org,2002:map",resolve(t,e){return gr(t)||e("Expected a mapping for this tag"),t},createNode:(t,e,i)=>Xe.from(t,e,i)};class oi extends Ld{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(br,e),this.items=[]}add(e){this.items.push(e)}delete(e){const i=Es(e);return typeof i!="number"?!1:this.items.splice(i,1).length>0}get(e,i){const r=Es(e);if(typeof r!="number")return;const s=this.items[r];return!i&&he(s)?s.value:s}has(e){const i=Es(e);return typeof i=="number"&&i<this.items.length}set(e,i){const r=Es(e);if(typeof r!="number")throw new Error(`Expected a valid index, not ${e}.`);const s=this.items[r];he(s)&&Id(i)?s.value=i:this.items[r]=i}toJSON(e,i){const r=[];i?.onCreate&&i.onCreate(r);let s=0;for(const n of this.items)r.push(ot(n,String(s++),i));return r}toString(e,i,r){return e?Rd(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:r,onComment:i}):JSON.stringify(this)}static from(e,i,r){const{replacer:s}=r,n=new this(e);if(i&&Symbol.iterator in Object(i)){let o=0;for(let l of i){if(typeof s=="function"){const u=i instanceof Set?l:String(o++);l=s.call(i,u,l)}n.items.push(Jr(l,void 0,r))}}return n}}function Es(t){let e=he(t)?t.value:t;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}const wr={collection:"seq",default:!0,nodeClass:oi,tag:"tag:yaml.org,2002:seq",resolve(t,e){return yr(t)||e("Expected a sequence for this tag"),t},createNode:(t,e,i)=>oi.from(t,e,i)},En={identify:t=>typeof t=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:t=>t,stringify(t,e,i,r){return e=Object.assign({actualString:!0},e),ds(t,e,i,r)}},Tn={identify:t=>t==null,createNode:()=>new Y(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new Y(null),stringify:({source:t},e)=>typeof t=="string"&&Tn.test.test(t)?t:e.options.nullStr},Ka={identify:t=>typeof t=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:t=>new Y(t[0]==="t"||t[0]==="T"),stringify({source:t,value:e},i){if(t&&Ka.test.test(t)){const r=t[0]==="t"||t[0]==="T";if(e===r)return t}return e?i.options.trueStr:i.options.falseStr}};function Et({format:t,minFractionDigits:e,tag:i,value:r}){if(typeof r=="bigint")return String(r);const s=typeof r=="number"?r:Number(r);if(!isFinite(s))return isNaN(s)?".nan":s<0?"-.inf":".inf";let n=Object.is(r,-0)?"-0":JSON.stringify(r);if(!t&&e&&(!i||i==="tag:yaml.org,2002:float")&&/^\d/.test(n)){let o=n.indexOf(".");o<0&&(o=n.length,n+=".");let l=e-(n.length-o-1);for(;l-- >0;)n+="0"}return n}const Bd={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:t=>t.slice(-3).toLowerCase()==="nan"?NaN:t[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Et},Fd={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:t=>parseFloat(t),stringify(t){const e=Number(t.value);return isFinite(e)?e.toExponential():Et(t)}},qd={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(t){const e=new Y(parseFloat(t)),i=t.indexOf(".");return i!==-1&&t[t.length-1]==="0"&&(e.minFractionDigits=t.length-i-1),e},stringify:Et},On=t=>typeof t=="bigint"||Number.isInteger(t),Wa=(t,e,i,{intAsBigInt:r})=>r?BigInt(t):parseInt(t.substring(e),i);function Ud(t,e,i){const{value:r}=t;return On(r)&&r>=0?i+r.toString(e):Et(t)}const Vd={identify:t=>On(t)&&t>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(t,e,i)=>Wa(t,2,8,i),stringify:t=>Ud(t,8,"0o")},jd={identify:On,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(t,e,i)=>Wa(t,0,10,i),stringify:Et},Hd={identify:t=>On(t)&&t>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(t,e,i)=>Wa(t,2,16,i),stringify:t=>Ud(t,16,"0x")},Xg=[vr,wr,En,Tn,Ka,Vd,jd,Hd,Bd,Fd,qd];function fu(t){return typeof t=="bigint"||Number.isInteger(t)}const Ts=({value:t})=>JSON.stringify(t),Jg=[{identify:t=>typeof t=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:t=>t,stringify:Ts},{identify:t=>t==null,createNode:()=>new Y(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:Ts},{identify:t=>typeof t=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:t=>t==="true",stringify:Ts},{identify:fu,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(t,e,{intAsBigInt:i})=>i?BigInt(t):parseInt(t,10),stringify:({value:t})=>fu(t)?t.toString():JSON.stringify(t)},{identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:t=>parseFloat(t),stringify:Ts}],Qg={default:!0,tag:"",test:/^/,resolve(t,e){return e(`Unresolved plain scalar ${JSON.stringify(t)}`),t}},Zg=[vr,wr].concat(Jg,Qg),Ga={identify:t=>t instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(t,e){if(typeof atob=="function"){const i=atob(t.replace(/[\n\r]/g,"")),r=new Uint8Array(i.length);for(let s=0;s<i.length;++s)r[s]=i.charCodeAt(s);return r}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),t},stringify({comment:t,type:e,value:i},r,s,n){if(!i)return"";const o=i;let l;if(typeof btoa=="function"){let u="";for(let c=0;c<o.length;++c)u+=String.fromCharCode(o[c]);l=btoa(u)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Y.BLOCK_LITERAL),e!==Y.QUOTE_DOUBLE){const u=Math.max(r.options.lineWidth-r.indent.length,r.options.minContentWidth),c=Math.ceil(l.length/u),h=new Array(c);for(let f=0,a=0;f<c;++f,a+=u)h[f]=l.substr(a,u);l=h.join(e===Y.BLOCK_LITERAL?`
`:" ")}return ds({comment:t,type:e,value:l},r,s,n)}};function Kd(t,e){if(yr(t))for(let i=0;i<t.items.length;++i){let r=t.items[i];if(!be(r)){if(gr(r)){r.items.length>1&&e("Each pair must have its own sequence indicator");const s=r.items[0]||new ze(new Y(null));if(r.commentBefore&&(s.key.commentBefore=s.key.commentBefore?`${r.commentBefore}
${s.key.commentBefore}`:r.commentBefore),r.comment){const n=s.value??s.key;n.comment=n.comment?`${r.comment}
${n.comment}`:r.comment}r=s}t.items[i]=be(r)?r:new ze(r)}}else e("Expected a sequence for this tag");return t}function Wd(t,e,i){const{replacer:r}=i,s=new oi(t);s.tag="tag:yaml.org,2002:pairs";let n=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof r=="function"&&(o=r.call(e,String(n++),o));let l,u;if(Array.isArray(o))if(o.length===2)l=o[0],u=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){const c=Object.keys(o);if(c.length===1)l=c[0],u=o[l];else throw new TypeError(`Expected tuple with one key, not ${c.length} keys`)}else l=o;s.items.push(Ha(l,u,i))}return s}const Ya={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:Kd,createNode:Wd};class er extends oi{constructor(){super(),this.add=Xe.prototype.add.bind(this),this.delete=Xe.prototype.delete.bind(this),this.get=Xe.prototype.get.bind(this),this.has=Xe.prototype.has.bind(this),this.set=Xe.prototype.set.bind(this),this.tag=er.tag}toJSON(e,i){if(!i)return super.toJSON(e);const r=new Map;i?.onCreate&&i.onCreate(r);for(const s of this.items){let n,o;if(be(s)?(n=ot(s.key,"",i),o=ot(s.value,n,i)):n=ot(s,"",i),r.has(n))throw new Error("Ordered maps must not include duplicate keys");r.set(n,o)}return r}static from(e,i,r){const s=Wd(e,i,r),n=new this;return n.items=s.items,n}}er.tag="tag:yaml.org,2002:omap";const Xa={collection:"seq",identify:t=>t instanceof Map,nodeClass:er,default:!1,tag:"tag:yaml.org,2002:omap",resolve(t,e){const i=Kd(t,e),r=[];for(const{key:s}of i.items)he(s)&&(r.includes(s.value)?e(`Ordered maps must not include duplicate keys: ${s.value}`):r.push(s.value));return Object.assign(new er,i)},createNode:(t,e,i)=>er.from(t,e,i)};function Gd({value:t,source:e},i){return e&&(t?Yd:Xd).test.test(e)?e:t?i.options.trueStr:i.options.falseStr}const Yd={identify:t=>t===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new Y(!0),stringify:Gd},Xd={identify:t=>t===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new Y(!1),stringify:Gd},e1={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:t=>t.slice(-3).toLowerCase()==="nan"?NaN:t[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Et},t1={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:t=>parseFloat(t.replace(/_/g,"")),stringify(t){const e=Number(t.value);return isFinite(e)?e.toExponential():Et(t)}},i1={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(t){const e=new Y(parseFloat(t.replace(/_/g,""))),i=t.indexOf(".");if(i!==-1){const r=t.substring(i+1).replace(/_/g,"");r[r.length-1]==="0"&&(e.minFractionDigits=r.length)}return e},stringify:Et},hs=t=>typeof t=="bigint"||Number.isInteger(t);function $n(t,e,i,{intAsBigInt:r}){const s=t[0];if((s==="-"||s==="+")&&(e+=1),t=t.substring(e).replace(/_/g,""),r){switch(i){case 2:t=`0b${t}`;break;case 8:t=`0o${t}`;break;case 16:t=`0x${t}`;break}const o=BigInt(t);return s==="-"?BigInt(-1)*o:o}const n=parseInt(t,i);return s==="-"?-1*n:n}function Ja(t,e,i){const{value:r}=t;if(hs(r)){const s=r.toString(e);return r<0?"-"+i+s.substr(1):i+s}return Et(t)}const r1={identify:hs,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(t,e,i)=>$n(t,2,2,i),stringify:t=>Ja(t,2,"0b")},s1={identify:hs,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(t,e,i)=>$n(t,1,8,i),stringify:t=>Ja(t,8,"0")},n1={identify:hs,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(t,e,i)=>$n(t,0,10,i),stringify:Et},o1={identify:hs,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(t,e,i)=>$n(t,2,16,i),stringify:t=>Ja(t,16,"0x")};class tr extends Xe{constructor(e){super(e),this.tag=tr.tag}add(e){let i;be(e)?i=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?i=new ze(e.key,null):i=new ze(e,null),_i(this.items,i.key)||this.items.push(i)}get(e,i){const r=_i(this.items,e);return!i&&be(r)?he(r.key)?r.key.value:r.key:r}set(e,i){if(typeof i!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof i}`);const r=_i(this.items,e);r&&!i?this.items.splice(this.items.indexOf(r),1):!r&&i&&this.items.push(new ze(e))}toJSON(e,i){return super.toJSON(e,i,Set)}toString(e,i,r){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),i,r);throw new Error("Set items must all have null values")}static from(e,i,r){const{replacer:s}=r,n=new this(e);if(i&&Symbol.iterator in Object(i))for(let o of i)typeof s=="function"&&(o=s.call(i,o,o)),n.items.push(Ha(o,null,r));return n}}tr.tag="tag:yaml.org,2002:set";const Qa={collection:"map",identify:t=>t instanceof Set,nodeClass:tr,default:!1,tag:"tag:yaml.org,2002:set",createNode:(t,e,i)=>tr.from(t,e,i),resolve(t,e){if(gr(t)){if(t.hasAllNullValues(!0))return Object.assign(new tr,t);e("Set items must all have null values")}else e("Expected a mapping for this tag");return t}};function Za(t,e){const i=t[0],r=i==="-"||i==="+"?t.substring(1):t,s=o=>e?BigInt(o):Number(o),n=r.replace(/_/g,"").split(":").reduce((o,l)=>o*s(60)+s(l),s(0));return i==="-"?s(-1)*n:n}function Jd(t){let{value:e}=t,i=o=>o;if(typeof e=="bigint")i=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return Et(t);let r="";e<0&&(r="-",e*=i(-1));const s=i(60),n=[e%s];return e<60?n.unshift(0):(e=(e-n[0])/s,n.unshift(e%s),e>=60&&(e=(e-n[0])/s,n.unshift(e))),r+n.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}const Qd={identify:t=>typeof t=="bigint"||Number.isInteger(t),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(t,e,{intAsBigInt:i})=>Za(t,i),stringify:Jd},Zd={identify:t=>typeof t=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:t=>Za(t,!1),stringify:Jd},In={identify:t=>t instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(t){const e=t.match(In.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");const[,i,r,s,n,o,l]=e.map(Number),u=e[7]?Number((e[7]+"00").substr(1,3)):0;let c=Date.UTC(i,r-1,s,n||0,o||0,l||0,u);const h=e[8];if(h&&h!=="Z"){let f=Za(h,!1);Math.abs(f)<30&&(f*=60),c-=6e4*f}return new Date(c)},stringify:({value:t})=>t?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""},pu=[vr,wr,En,Tn,Yd,Xd,r1,s1,n1,o1,e1,t1,i1,Ga,Gt,Xa,Ya,Qa,Qd,Zd,In],mu=new Map([["core",Xg],["failsafe",[vr,wr,En]],["json",Zg],["yaml11",pu],["yaml-1.1",pu]]),bu={binary:Ga,bool:Ka,float:qd,floatExp:Fd,floatNaN:Bd,floatTime:Zd,int:jd,intHex:Hd,intOct:Vd,intTime:Qd,map:vr,merge:Gt,null:Tn,omap:Xa,pairs:Ya,seq:wr,set:Qa,timestamp:In},a1={"tag:yaml.org,2002:binary":Ga,"tag:yaml.org,2002:merge":Gt,"tag:yaml.org,2002:omap":Xa,"tag:yaml.org,2002:pairs":Ya,"tag:yaml.org,2002:set":Qa,"tag:yaml.org,2002:timestamp":In};function ao(t,e,i){const r=mu.get(e);if(r&&!t)return i&&!r.includes(Gt)?r.concat(Gt):r.slice();let s=r;if(!s)if(Array.isArray(t))s=[];else{const n=Array.from(mu.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${n} or define customTags array`)}if(Array.isArray(t))for(const n of t)s=s.concat(n);else typeof t=="function"&&(s=t(s.slice()));return i&&(s=s.concat(Gt)),s.reduce((n,o)=>{const l=typeof o=="string"?bu[o]:o;if(!l){const u=JSON.stringify(o),c=Object.keys(bu).map(h=>JSON.stringify(h)).join(", ");throw new Error(`Unknown custom tag ${u}; use one of ${c}`)}return n.includes(l)||n.push(l),n},[])}const l1=(t,e)=>t.key<e.key?-1:t.key>e.key?1:0;class Ln{constructor({compat:e,customTags:i,merge:r,resolveKnownTags:s,schema:n,sortMapEntries:o,toStringDefaults:l}){this.compat=Array.isArray(e)?ao(e,"compat"):e?ao(null,e):null,this.name=typeof n=="string"&&n||"core",this.knownTags=s?a1:{},this.tags=ao(i,this.name,r),this.toStringOptions=l??null,Object.defineProperty(this,ti,{value:vr}),Object.defineProperty(this,Dt,{value:En}),Object.defineProperty(this,br,{value:wr}),this.sortMapEntries=typeof o=="function"?o:o===!0?l1:null}clone(){const e=Object.create(Ln.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}}function u1(t,e){const i=[];let r=e.directives===!0;if(e.directives!==!1&&t.directives){const u=t.directives.toString(t);u?(i.push(u),r=!0):t.directives.docStart&&(r=!0)}r&&i.push("---");const s=Dd(t,e),{commentString:n}=s.options;if(t.commentBefore){i.length!==1&&i.unshift("");const u=n(t.commentBefore);i.unshift(Wt(u,""))}let o=!1,l=null;if(t.contents){if(ve(t.contents)){if(t.contents.spaceBefore&&r&&i.push(""),t.contents.commentBefore){const h=n(t.contents.commentBefore);i.push(Wt(h,""))}s.forceBlockIndent=!!t.comment,l=t.contents.comment}const u=l?void 0:()=>o=!0;let c=nr(t.contents,s,()=>l=null,u);l&&(c+=xi(c,"",n(l))),(c[0]==="|"||c[0]===">")&&i[i.length-1]==="---"?i[i.length-1]=`--- ${c}`:i.push(c)}else i.push(nr(t.contents,s));if(t.directives?.docEnd)if(t.comment){const u=n(t.comment);u.includes(`
`)?(i.push("..."),i.push(Wt(u,""))):i.push(`... ${u}`)}else i.push("...");else{let u=t.comment;u&&o&&(u=u.replace(/^\n+/,"")),u&&((!o||l)&&i[i.length-1]!==""&&i.push(""),i.push(Wt(n(u),"")))}return i.join(`
`)+`
`}let Nn=class eh{constructor(e,i,r){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,at,{value:ma});let s=null;typeof i=="function"||Array.isArray(i)?s=i:r===void 0&&i&&(r=i,i=void 0);const n=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},r);this.options=n;let{version:o}=n;r?._directives?(this.directives=r._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new qe({version:o}),this.setSchema(o,r),this.contents=e===void 0?null:this.createNode(e,s,r)}clone(){const e=Object.create(eh.prototype,{[at]:{value:ma}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=ve(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){Vi(this.contents)&&this.contents.add(e)}addIn(e,i){Vi(this.contents)&&this.contents.addIn(e,i)}createAlias(e,i){if(!e.anchor){const r=Od(this);e.anchor=!i||r.has(i)?$d(i||"a",r):i}return new kn(e.anchor)}createNode(e,i,r){let s;if(typeof i=="function")e=i.call({"":e},"",e),s=i;else if(Array.isArray(i)){const w=x=>typeof x=="number"||x instanceof String||x instanceof Number,g=i.filter(w).map(String);g.length>0&&(i=i.concat(g)),s=i}else r===void 0&&i&&(r=i,i=void 0);const{aliasDuplicateObjects:n,anchorPrefix:o,flow:l,keepUndefined:u,onTagObj:c,tag:h}=r??{},{onAnchor:f,setAnchors:a,sourceObjects:d}=zg(this,o||"a"),p={aliasDuplicateObjects:n??!0,keepUndefined:u??!1,onAnchor:f,onTagObj:c,replacer:s,schema:this.schema,sourceObjects:d},b=Jr(e,h,p);return l&&ye(b)&&(b.flow=!0),a(),b}createPair(e,i,r={}){const s=this.createNode(e,null,r),n=this.createNode(i,null,r);return new ze(s,n)}delete(e){return Vi(this.contents)?this.contents.delete(e):!1}deleteIn(e){return Dr(e)?this.contents==null?!1:(this.contents=null,!0):Vi(this.contents)?this.contents.deleteIn(e):!1}get(e,i){return ye(this.contents)?this.contents.get(e,i):void 0}getIn(e,i){return Dr(e)?!i&&he(this.contents)?this.contents.value:this.contents:ye(this.contents)?this.contents.getIn(e,i):void 0}has(e){return ye(this.contents)?this.contents.has(e):!1}hasIn(e){return Dr(e)?this.contents!==void 0:ye(this.contents)?this.contents.hasIn(e):!1}set(e,i){this.contents==null?this.contents=on(this.schema,[e],i):Vi(this.contents)&&this.contents.set(e,i)}setIn(e,i){Dr(e)?this.contents=i:this.contents==null?this.contents=on(this.schema,Array.from(e),i):Vi(this.contents)&&this.contents.setIn(e,i)}setSchema(e,i={}){typeof e=="number"&&(e=String(e));let r;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new qe({version:"1.1"}),r={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new qe({version:e}),r={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,r=null;break;default:{const s=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${s}`)}}if(i.schema instanceof Object)this.schema=i.schema;else if(r)this.schema=new Ln(Object.assign(r,i));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:i,mapAsMap:r,maxAliasCount:s,onAnchor:n,reviver:o}={}){const l={anchors:new Map,doc:this,keep:!e,mapAsMap:r===!0,mapKeyWarned:!1,maxAliasCount:typeof s=="number"?s:100},u=ot(this.contents,i??"",l);if(typeof n=="function")for(const{count:c,res:h}of l.anchors.values())n(h,c);return typeof o=="function"?Xi(o,{"":u},"",u):u}toJSON(e,i){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:i})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){const i=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${i}`)}return u1(this,e)}};function Vi(t){if(ye(t))return!0;throw new Error("Expected a YAML collection as document contents")}class el extends Error{constructor(e,i,r,s){super(),this.name=e,this.code=r,this.message=s,this.pos=i}}class ki extends el{constructor(e,i,r){super("YAMLParseError",e,i,r)}}class th extends el{constructor(e,i,r){super("YAMLWarning",e,i,r)}}const ln=(t,e)=>i=>{if(i.pos[0]===-1)return;i.linePos=i.pos.map(l=>e.linePos(l));const{line:r,col:s}=i.linePos[0];i.message+=` at line ${r}, column ${s}`;let n=s-1,o=t.substring(e.lineStarts[r-1],e.lineStarts[r]).replace(/[\n\r]+$/,"");if(n>=60&&o.length>80){const l=Math.min(n-39,o.length-79);o="…"+o.substring(l),n-=l-1}if(o.length>80&&(o=o.substring(0,79)+"…"),r>1&&/^ *$/.test(o.substring(0,n))){let l=t.substring(e.lineStarts[r-2],e.lineStarts[r-1]);l.length>80&&(l=l.substring(0,79)+`…
`),o=l+o}if(/[^ ]/.test(o)){let l=1;const u=i.linePos[1];u?.line===r&&u.col>s&&(l=Math.max(1,Math.min(u.col-s,80-n)));const c=" ".repeat(n)+"^".repeat(l);i.message+=`:

${o}
${c}
`}};function or(t,{flow:e,indicator:i,next:r,offset:s,onError:n,parentIndent:o,startOnNewline:l}){let u=!1,c=l,h=l,f="",a="",d=!1,p=!1,b=null,w=null,g=null,x=null,_=null,v=null,y=null;for(const A of t)switch(p&&(A.type!=="space"&&A.type!=="newline"&&A.type!=="comma"&&n(A.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),p=!1),b&&(c&&A.type!=="comment"&&A.type!=="newline"&&n(b,"TAB_AS_INDENT","Tabs are not allowed as indentation"),b=null),A.type){case"space":!e&&(i!=="doc-start"||r?.type!=="flow-collection")&&A.source.includes("	")&&(b=A),h=!0;break;case"comment":{h||n(A,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");const T=A.source.substring(1)||" ";f?f+=a+T:f=T,a="",c=!1;break}case"newline":c?f?f+=A.source:(!v||i!=="seq-item-ind")&&(u=!0):a+=A.source,c=!0,d=!0,(w||g)&&(x=A),h=!0;break;case"anchor":w&&n(A,"MULTIPLE_ANCHORS","A node can have at most one anchor"),A.source.endsWith(":")&&n(A.offset+A.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),w=A,y??(y=A.offset),c=!1,h=!1,p=!0;break;case"tag":{g&&n(A,"MULTIPLE_TAGS","A node can have at most one tag"),g=A,y??(y=A.offset),c=!1,h=!1,p=!0;break}case i:(w||g)&&n(A,"BAD_PROP_ORDER",`Anchors and tags must be after the ${A.source} indicator`),v&&n(A,"UNEXPECTED_TOKEN",`Unexpected ${A.source} in ${e??"collection"}`),v=A,c=i==="seq-item-ind"||i==="explicit-key-ind",h=!1;break;case"comma":if(e){_&&n(A,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),_=A,c=!1,h=!1;break}default:n(A,"UNEXPECTED_TOKEN",`Unexpected ${A.type} token`),c=!1,h=!1}const S=t[t.length-1],C=S?S.offset+S.source.length:s;return p&&r&&r.type!=="space"&&r.type!=="newline"&&r.type!=="comma"&&(r.type!=="scalar"||r.source!=="")&&n(r.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),b&&(c&&b.indent<=o||r?.type==="block-map"||r?.type==="block-seq")&&n(b,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:_,found:v,spaceBefore:u,comment:f,hasNewline:d,anchor:w,tag:g,newlineAfterProp:x,end:C,start:y??C}}function Qr(t){if(!t)return null;switch(t.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(t.source.includes(`
`))return!0;if(t.end){for(const e of t.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(const e of t.items){for(const i of e.start)if(i.type==="newline")return!0;if(e.sep){for(const i of e.sep)if(i.type==="newline")return!0}if(Qr(e.key)||Qr(e.value))return!0}return!1;default:return!0}}function va(t,e,i){if(e?.type==="flow-collection"){const r=e.end[0];r.indent===t&&(r.source==="]"||r.source==="}")&&Qr(e)&&i(r,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}function ih(t,e,i){const{uniqueKeys:r}=t.options;if(r===!1)return!1;const s=typeof r=="function"?r:(n,o)=>n===o||he(n)&&he(o)&&n.value===o.value;return e.some(n=>s(n.key,i))}const gu="All mapping items must start at the same column";function c1({composeNode:t,composeEmptyNode:e},i,r,s,n){const o=n?.nodeClass??Xe,l=new o(i.schema);i.atRoot&&(i.atRoot=!1);let u=r.offset,c=null;for(const h of r.items){const{start:f,key:a,sep:d,value:p}=h,b=or(f,{indicator:"explicit-key-ind",next:a??d?.[0],offset:u,onError:s,parentIndent:r.indent,startOnNewline:!0}),w=!b.found;if(w){if(a&&(a.type==="block-seq"?s(u,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in a&&a.indent!==r.indent&&s(u,"BAD_INDENT",gu)),!b.anchor&&!b.tag&&!d){c=b.end,b.comment&&(l.comment?l.comment+=`
`+b.comment:l.comment=b.comment);continue}(b.newlineAfterProp||Qr(a))&&s(a??f[f.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else b.found?.indent!==r.indent&&s(u,"BAD_INDENT",gu);i.atKey=!0;const g=b.end,x=a?t(i,a,b,s):e(i,g,f,null,b,s);i.schema.compat&&va(r.indent,a,s),i.atKey=!1,ih(i,l.items,x)&&s(g,"DUPLICATE_KEY","Map keys must be unique");const _=or(d??[],{indicator:"map-value-ind",next:p,offset:x.range[2],onError:s,parentIndent:r.indent,startOnNewline:!a||a.type==="block-scalar"});if(u=_.end,_.found){w&&(p?.type==="block-map"&&!_.hasNewline&&s(u,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),i.options.strict&&b.start<_.found.offset-1024&&s(x.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));const v=p?t(i,p,_,s):e(i,u,d,null,_,s);i.schema.compat&&va(r.indent,p,s),u=v.range[2];const y=new ze(x,v);i.options.keepSourceTokens&&(y.srcToken=h),l.items.push(y)}else{w&&s(x.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),_.comment&&(x.comment?x.comment+=`
`+_.comment:x.comment=_.comment);const v=new ze(x);i.options.keepSourceTokens&&(v.srcToken=h),l.items.push(v)}}return c&&c<u&&s(c,"IMPOSSIBLE","Map comment with trailing content"),l.range=[r.offset,u,c??u],l}function d1({composeNode:t,composeEmptyNode:e},i,r,s,n){const o=n?.nodeClass??oi,l=new o(i.schema);i.atRoot&&(i.atRoot=!1),i.atKey&&(i.atKey=!1);let u=r.offset,c=null;for(const{start:h,value:f}of r.items){const a=or(h,{indicator:"seq-item-ind",next:f,offset:u,onError:s,parentIndent:r.indent,startOnNewline:!0});if(!a.found)if(a.anchor||a.tag||f)f?.type==="block-seq"?s(a.end,"BAD_INDENT","All sequence items must start at the same column"):s(u,"MISSING_CHAR","Sequence item without - indicator");else{c=a.end,a.comment&&(l.comment=a.comment);continue}const d=f?t(i,f,a,s):e(i,a.end,h,null,a,s);i.schema.compat&&va(r.indent,f,s),u=d.range[2],l.items.push(d)}return l.range=[r.offset,u,c??u],l}function fs(t,e,i,r){let s="";if(t){let n=!1,o="";for(const l of t){const{source:u,type:c}=l;switch(c){case"space":n=!0;break;case"comment":{i&&!n&&r(l,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");const h=u.substring(1)||" ";s?s+=o+h:s=h,o="";break}case"newline":s&&(o+=u),n=!0;break;default:r(l,"UNEXPECTED_TOKEN",`Unexpected ${c} at node end`)}e+=u.length}}return{comment:s,offset:e}}const lo="Block collections are not allowed within flow collections",uo=t=>t&&(t.type==="block-map"||t.type==="block-seq");function h1({composeNode:t,composeEmptyNode:e},i,r,s,n){const o=r.start.source==="{",l=o?"flow map":"flow sequence",u=n?.nodeClass??(o?Xe:oi),c=new u(i.schema);c.flow=!0;const h=i.atRoot;h&&(i.atRoot=!1),i.atKey&&(i.atKey=!1);let f=r.offset+r.start.source.length;for(let w=0;w<r.items.length;++w){const g=r.items[w],{start:x,key:_,sep:v,value:y}=g,S=or(x,{flow:l,indicator:"explicit-key-ind",next:_??v?.[0],offset:f,onError:s,parentIndent:r.indent,startOnNewline:!1});if(!S.found){if(!S.anchor&&!S.tag&&!v&&!y){w===0&&S.comma?s(S.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${l}`):w<r.items.length-1&&s(S.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${l}`),S.comment&&(c.comment?c.comment+=`
`+S.comment:c.comment=S.comment),f=S.end;continue}!o&&i.options.strict&&Qr(_)&&s(_,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(w===0)S.comma&&s(S.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${l}`);else if(S.comma||s(S.start,"MISSING_CHAR",`Missing , between ${l} items`),S.comment){let C="";e:for(const A of x)switch(A.type){case"comma":case"space":break;case"comment":C=A.source.substring(1);break e;default:break e}if(C){let A=c.items[c.items.length-1];be(A)&&(A=A.value??A.key),A.comment?A.comment+=`
`+C:A.comment=C,S.comment=S.comment.substring(C.length+1)}}if(!o&&!v&&!S.found){const C=y?t(i,y,S,s):e(i,S.end,v,null,S,s);c.items.push(C),f=C.range[2],uo(y)&&s(C.range,"BLOCK_IN_FLOW",lo)}else{i.atKey=!0;const C=S.end,A=_?t(i,_,S,s):e(i,C,x,null,S,s);uo(_)&&s(A.range,"BLOCK_IN_FLOW",lo),i.atKey=!1;const T=or(v??[],{flow:l,indicator:"map-value-ind",next:y,offset:A.range[2],onError:s,parentIndent:r.indent,startOnNewline:!1});if(T.found){if(!o&&!S.found&&i.options.strict){if(v)for(const O of v){if(O===T.found)break;if(O.type==="newline"){s(O,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}S.start<T.found.offset-1024&&s(T.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else y&&("source"in y&&y.source?.[0]===":"?s(y,"MISSING_CHAR",`Missing space after : in ${l}`):s(T.start,"MISSING_CHAR",`Missing , or : between ${l} items`));const $=y?t(i,y,T,s):T.found?e(i,T.end,v,null,T,s):null;$?uo(y)&&s($.range,"BLOCK_IN_FLOW",lo):T.comment&&(A.comment?A.comment+=`
`+T.comment:A.comment=T.comment);const E=new ze(A,$);if(i.options.keepSourceTokens&&(E.srcToken=g),o){const O=c;ih(i,O.items,A)&&s(C,"DUPLICATE_KEY","Map keys must be unique"),O.items.push(E)}else{const O=new Xe(i.schema);O.flow=!0,O.items.push(E);const D=($??A).range;O.range=[A.range[0],D[1],D[2]],c.items.push(O)}f=$?$.range[2]:T.end}}const a=o?"}":"]",[d,...p]=r.end;let b=f;if(d?.source===a)b=d.offset+d.source.length;else{const w=l[0].toUpperCase()+l.substring(1),g=h?`${w} must end with a ${a}`:`${w} in block collection must be sufficiently indented and end with a ${a}`;s(f,h?"MISSING_CHAR":"BAD_INDENT",g),d&&d.source.length!==1&&p.unshift(d)}if(p.length>0){const w=fs(p,b,i.options.strict,s);w.comment&&(c.comment?c.comment+=`
`+w.comment:c.comment=w.comment),c.range=[r.offset,b,w.offset]}else c.range=[r.offset,b,b];return c}function co(t,e,i,r,s,n){const o=i.type==="block-map"?c1(t,e,i,r,n):i.type==="block-seq"?d1(t,e,i,r,n):h1(t,e,i,r,n),l=o.constructor;return s==="!"||s===l.tagName?(o.tag=l.tagName,o):(s&&(o.tag=s),o)}function f1(t,e,i,r,s){const n=r.tag,o=n?e.directives.tagName(n.source,a=>s(n,"TAG_RESOLVE_FAILED",a)):null;if(i.type==="block-seq"){const{anchor:a,newlineAfterProp:d}=r,p=a&&n?a.offset>n.offset?a:n:a??n;p&&(!d||d.offset<p.offset)&&s(p,"MISSING_CHAR","Missing newline after block sequence props")}const l=i.type==="block-map"?"map":i.type==="block-seq"?"seq":i.start.source==="{"?"map":"seq";if(!n||!o||o==="!"||o===Xe.tagName&&l==="map"||o===oi.tagName&&l==="seq")return co(t,e,i,s,o);let u=e.schema.tags.find(a=>a.tag===o&&a.collection===l);if(!u){const a=e.schema.knownTags[o];if(a?.collection===l)e.schema.tags.push(Object.assign({},a,{default:!1})),u=a;else return a?s(n,"BAD_COLLECTION_TYPE",`${a.tag} used for ${l} collection, but expects ${a.collection??"scalar"}`,!0):s(n,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),co(t,e,i,s,o)}const c=co(t,e,i,s,o,u),h=u.resolve?.(c,a=>s(n,"TAG_RESOLVE_FAILED",a),e.options)??c,f=ve(h)?h:new Y(h);return f.range=c.range,f.tag=o,u?.format&&(f.format=u.format),f}function rh(t,e,i){const r=e.offset,s=p1(e,t.options.strict,i);if(!s)return{value:"",type:null,comment:"",range:[r,r,r]};const n=s.mode===">"?Y.BLOCK_FOLDED:Y.BLOCK_LITERAL,o=e.source?m1(e.source):[];let l=o.length;for(let b=o.length-1;b>=0;--b){const w=o[b][1];if(w===""||w==="\r")l=b;else break}if(l===0){const b=s.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"";let w=r+s.length;return e.source&&(w+=e.source.length),{value:b,type:n,comment:s.comment,range:[r,w,w]}}let u=e.indent+s.indent,c=e.offset+s.length,h=0;for(let b=0;b<l;++b){const[w,g]=o[b];if(g===""||g==="\r")s.indent===0&&w.length>u&&(u=w.length);else{w.length<u&&i(c+w.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),s.indent===0&&(u=w.length),h=b,u===0&&!t.atRoot&&i(c,"BAD_INDENT","Block scalar values in collections must be indented");break}c+=w.length+g.length+1}for(let b=o.length-1;b>=l;--b)o[b][0].length>u&&(l=b+1);let f="",a="",d=!1;for(let b=0;b<h;++b)f+=o[b][0].slice(u)+`
`;for(let b=h;b<l;++b){let[w,g]=o[b];c+=w.length+g.length+1;const x=g[g.length-1]==="\r";if(x&&(g=g.slice(0,-1)),g&&w.length<u){const v=`Block scalar lines must not be less indented than their ${s.indent?"explicit indentation indicator":"first line"}`;i(c-g.length-(x?2:1),"BAD_INDENT",v),w=""}n===Y.BLOCK_LITERAL?(f+=a+w.slice(u)+g,a=`
`):w.length>u||g[0]==="	"?(a===" "?a=`
`:!d&&a===`
`&&(a=`

`),f+=a+w.slice(u)+g,a=`
`,d=!0):g===""?a===`
`?f+=`
`:a=`
`:(f+=a+g,a=" ",d=!1)}switch(s.chomp){case"-":break;case"+":for(let b=l;b<o.length;++b)f+=`
`+o[b][0].slice(u);f[f.length-1]!==`
`&&(f+=`
`);break;default:f+=`
`}const p=r+s.length+e.source.length;return{value:f,type:n,comment:s.comment,range:[r,p,p]}}function p1({offset:t,props:e},i,r){if(e[0].type!=="block-scalar-header")return r(e[0],"IMPOSSIBLE","Block scalar header not found"),null;const{source:s}=e[0],n=s[0];let o=0,l="",u=-1;for(let a=1;a<s.length;++a){const d=s[a];if(!l&&(d==="-"||d==="+"))l=d;else{const p=Number(d);!o&&p?o=p:u===-1&&(u=t+a)}}u!==-1&&r(u,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${s}`);let c=!1,h="",f=s.length;for(let a=1;a<e.length;++a){const d=e[a];switch(d.type){case"space":c=!0;case"newline":f+=d.source.length;break;case"comment":i&&!c&&r(d,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),f+=d.source.length,h=d.source.substring(1);break;case"error":r(d,"UNEXPECTED_TOKEN",d.message),f+=d.source.length;break;default:{const p=`Unexpected token in block scalar header: ${d.type}`;r(d,"UNEXPECTED_TOKEN",p);const b=d.source;b&&typeof b=="string"&&(f+=b.length)}}}return{mode:n,indent:o,chomp:l,comment:h,length:f}}function m1(t){const e=t.split(/\n( *)/),i=e[0],r=i.match(/^( *)/),n=[r?.[1]?[r[1],i.slice(r[1].length)]:["",i]];for(let o=1;o<e.length;o+=2)n.push([e[o],e[o+1]]);return n}function sh(t,e,i){const{offset:r,type:s,source:n,end:o}=t;let l,u;const c=(a,d,p)=>i(r+a,d,p);switch(s){case"scalar":l=Y.PLAIN,u=b1(n,c);break;case"single-quoted-scalar":l=Y.QUOTE_SINGLE,u=g1(n,c);break;case"double-quoted-scalar":l=Y.QUOTE_DOUBLE,u=y1(n,c);break;default:return i(t,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${s}`),{value:"",type:null,comment:"",range:[r,r+n.length,r+n.length]}}const h=r+n.length,f=fs(o,h,e,i);return{value:u,type:l,comment:f.comment,range:[r,h,f.offset]}}function b1(t,e){let i="";switch(t[0]){case"	":i="a tab character";break;case",":i="flow indicator character ,";break;case"%":i="directive indicator character %";break;case"|":case">":{i=`block scalar indicator ${t[0]}`;break}case"@":case"`":{i=`reserved character ${t[0]}`;break}}return i&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${i}`),nh(t)}function g1(t,e){return(t[t.length-1]!=="'"||t.length===1)&&e(t.length,"MISSING_CHAR","Missing closing 'quote"),nh(t.slice(1,-1)).replace(/''/g,"'")}function nh(t){let e,i;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),i=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,i=/[ \t]*(.*?)[ \t]*\r?\n/sy}let r=e.exec(t);if(!r)return t;let s=r[1],n=" ",o=e.lastIndex;for(i.lastIndex=o;r=i.exec(t);)r[1]===""?n===`
`?s+=n:n=`
`:(s+=n+r[1],n=" "),o=i.lastIndex;const l=/[ \t]*(.*)/sy;return l.lastIndex=o,r=l.exec(t),s+n+(r?.[1]??"")}function y1(t,e){let i="";for(let r=1;r<t.length-1;++r){const s=t[r];if(!(s==="\r"&&t[r+1]===`
`))if(s===`
`){const{fold:n,offset:o}=v1(t,r);i+=n,r=o}else if(s==="\\"){let n=t[++r];const o=w1[n];if(o)i+=o;else if(n===`
`)for(n=t[r+1];n===" "||n==="	";)n=t[++r+1];else if(n==="\r"&&t[r+1]===`
`)for(n=t[++r+1];n===" "||n==="	";)n=t[++r+1];else if(n==="x"||n==="u"||n==="U"){const l={x:2,u:4,U:8}[n];i+=x1(t,r+1,l,e),r+=l}else{const l=t.substr(r-1,2);e(r-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${l}`),i+=l}}else if(s===" "||s==="	"){const n=r;let o=t[r+1];for(;o===" "||o==="	";)o=t[++r+1];o!==`
`&&!(o==="\r"&&t[r+2]===`
`)&&(i+=r>n?t.slice(n,r+1):s)}else i+=s}return(t[t.length-1]!=='"'||t.length===1)&&e(t.length,"MISSING_CHAR",'Missing closing "quote'),i}function v1(t,e){let i="",r=t[e+1];for(;(r===" "||r==="	"||r===`
`||r==="\r")&&!(r==="\r"&&t[e+2]!==`
`);)r===`
`&&(i+=`
`),e+=1,r=t[e+1];return i||(i=" "),{fold:i,offset:e}}const w1={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"",_:" ",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function x1(t,e,i,r){const s=t.substr(e,i),o=s.length===i&&/^[0-9a-fA-F]+$/.test(s)?parseInt(s,16):NaN;if(isNaN(o)){const l=t.substr(e-2,i+2);return r(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${l}`),l}return String.fromCodePoint(o)}function oh(t,e,i,r){const{value:s,type:n,comment:o,range:l}=e.type==="block-scalar"?rh(t,e,r):sh(e,t.options.strict,r),u=i?t.directives.tagName(i.source,f=>r(i,"TAG_RESOLVE_FAILED",f)):null;let c;t.options.stringKeys&&t.atKey?c=t.schema[Dt]:u?c=_1(t.schema,s,u,i,r):e.type==="scalar"?c=k1(t,s,e,r):c=t.schema[Dt];let h;try{const f=c.resolve(s,a=>r(i??e,"TAG_RESOLVE_FAILED",a),t.options);h=he(f)?f:new Y(f)}catch(f){const a=f instanceof Error?f.message:String(f);r(i??e,"TAG_RESOLVE_FAILED",a),h=new Y(s)}return h.range=l,h.source=s,n&&(h.type=n),u&&(h.tag=u),c.format&&(h.format=c.format),o&&(h.comment=o),h}function _1(t,e,i,r,s){if(i==="!")return t[Dt];const n=[];for(const l of t.tags)if(!l.collection&&l.tag===i)if(l.default&&l.test)n.push(l);else return l;for(const l of n)if(l.test?.test(e))return l;const o=t.knownTags[i];return o&&!o.collection?(t.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(s(r,"TAG_RESOLVE_FAILED",`Unresolved tag: ${i}`,i!=="tag:yaml.org,2002:str"),t[Dt])}function k1({atKey:t,directives:e,schema:i},r,s,n){const o=i.tags.find(l=>(l.default===!0||t&&l.default==="key")&&l.test?.test(r))||i[Dt];if(i.compat){const l=i.compat.find(u=>u.default&&u.test?.test(r))??i[Dt];if(o.tag!==l.tag){const u=e.tagString(o.tag),c=e.tagString(l.tag),h=`Value may be parsed as either ${u} or ${c}`;n(s,"TAG_RESOLVE_FAILED",h,!0)}}return o}function S1(t,e,i){if(e){i??(i=e.length);for(let r=i-1;r>=0;--r){let s=e[r];switch(s.type){case"space":case"comment":case"newline":t-=s.source.length;continue}for(s=e[++r];s?.type==="space";)t+=s.source.length,s=e[++r];break}}return t}const C1={composeNode:ah,composeEmptyNode:tl};function ah(t,e,i,r){const s=t.atKey,{spaceBefore:n,comment:o,anchor:l,tag:u}=i;let c,h=!0;switch(e.type){case"alias":c=A1(t,e,r),(l||u)&&r(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":c=oh(t,e,u,r),l&&(c.anchor=l.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":c=f1(C1,t,e,i,r),l&&(c.anchor=l.source.substring(1));break;default:{const f=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;r(e,"UNEXPECTED_TOKEN",f),c=tl(t,e.offset,void 0,null,i,r),h=!1}}return l&&c.anchor===""&&r(l,"BAD_ALIAS","Anchor cannot be an empty string"),s&&t.options.stringKeys&&(!he(c)||typeof c.value!="string"||c.tag&&c.tag!=="tag:yaml.org,2002:str")&&r(u??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),n&&(c.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?c.comment=o:c.commentBefore=o),t.options.keepSourceTokens&&h&&(c.srcToken=e),c}function tl(t,e,i,r,{spaceBefore:s,comment:n,anchor:o,tag:l,end:u},c){const h={type:"scalar",offset:S1(e,i,r),indent:-1,source:""},f=oh(t,h,l,c);return o&&(f.anchor=o.source.substring(1),f.anchor===""&&c(o,"BAD_ALIAS","Anchor cannot be an empty string")),s&&(f.spaceBefore=!0),n&&(f.comment=n,f.range[2]=u),f}function A1({options:t},{offset:e,source:i,end:r},s){const n=new kn(i.substring(1));n.source===""&&s(e,"BAD_ALIAS","Alias cannot be an empty string"),n.source.endsWith(":")&&s(e+i.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);const o=e+i.length,l=fs(r,o,t.strict,s);return n.range=[e,o,l.offset],l.comment&&(n.comment=l.comment),n}function E1(t,e,{offset:i,start:r,value:s,end:n},o){const l=Object.assign({_directives:e},t),u=new Nn(void 0,l),c={atKey:!1,atRoot:!0,directives:u.directives,options:u.options,schema:u.schema},h=or(r,{indicator:"doc-start",next:s??n?.[0],offset:i,onError:o,parentIndent:0,startOnNewline:!0});h.found&&(u.directives.docStart=!0,s&&(s.type==="block-map"||s.type==="block-seq")&&!h.hasNewline&&o(h.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),u.contents=s?ah(c,s,h,o):tl(c,h.end,r,null,h,o);const f=u.contents.range[2],a=fs(n,f,!1,o);return a.comment&&(u.comment=a.comment),u.range=[i,f,a.offset],u}function Lr(t){if(typeof t=="number")return[t,t+1];if(Array.isArray(t))return t.length===2?t:[t[0],t[1]];const{offset:e,source:i}=t;return[e,e+(typeof i=="string"?i.length:1)]}function yu(t){let e="",i=!1,r=!1;for(let s=0;s<t.length;++s){const n=t[s];switch(n[0]){case"#":e+=(e===""?"":r?`

`:`
`)+(n.substring(1)||" "),i=!0,r=!1;break;case"%":t[s+1]?.[0]!=="#"&&(s+=1),i=!1;break;default:i||(r=!0),i=!1}}return{comment:e,afterEmptyLine:r}}class il{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(i,r,s,n)=>{const o=Lr(i);n?this.warnings.push(new th(o,r,s)):this.errors.push(new ki(o,r,s))},this.directives=new qe({version:e.version||"1.2"}),this.options=e}decorate(e,i){const{comment:r,afterEmptyLine:s}=yu(this.prelude);if(r){const n=e.contents;if(i)e.comment=e.comment?`${e.comment}
${r}`:r;else if(s||e.directives.docStart||!n)e.commentBefore=r;else if(ye(n)&&!n.flow&&n.items.length>0){let o=n.items[0];be(o)&&(o=o.key);const l=o.commentBefore;o.commentBefore=l?`${r}
${l}`:r}else{const o=n.commentBefore;n.commentBefore=o?`${r}
${o}`:r}}i?(Array.prototype.push.apply(e.errors,this.errors),Array.prototype.push.apply(e.warnings,this.warnings)):(e.errors=this.errors,e.warnings=this.warnings),this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:yu(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,i=!1,r=-1){for(const s of e)yield*this.next(s);yield*this.end(i,r)}*next(e){switch(e.type){case"directive":this.directives.add(e.source,(i,r,s)=>{const n=Lr(e);n[0]+=i,this.onError(n,"BAD_DIRECTIVE",r,s)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{const i=E1(this.options,this.directives,e,this.onError);this.atDirectives&&!i.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(i,!1),this.doc&&(yield this.doc),this.doc=i,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{const i=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,r=new ki(Lr(e),"UNEXPECTED_TOKEN",i);this.atDirectives||!this.doc?this.errors.push(r):this.doc.errors.push(r);break}case"doc-end":{if(!this.doc){const r="Unexpected doc-end without preceding document";this.errors.push(new ki(Lr(e),"UNEXPECTED_TOKEN",r));break}this.doc.directives.docEnd=!0;const i=fs(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),i.comment){const r=this.doc.comment;this.doc.comment=r?`${r}
${i.comment}`:i.comment}this.doc.range[2]=i.offset;break}default:this.errors.push(new ki(Lr(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,i=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){const r=Object.assign({_directives:this.directives},this.options),s=new Nn(void 0,r);this.atDirectives&&this.onError(i,"MISSING_CHAR","Missing directives-end indicator line"),s.range=[0,i,i],this.decorate(s,!1),yield s}}}function T1(t,e=!0,i){if(t){const r=(s,n,o)=>{const l=typeof s=="number"?s:Array.isArray(s)?s[0]:s.offset;if(i)i(l,n,o);else throw new ki([l,l+1],n,o)};switch(t.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return sh(t,e,r);case"block-scalar":return rh({options:{strict:e}},t,r)}}return null}function O1(t,e){const{implicitKey:i=!1,indent:r,inFlow:s=!1,offset:n=-1,type:o="PLAIN"}=e,l=ds({type:o,value:t},{implicitKey:i,indent:r>0?" ".repeat(r):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}}),u=e.end??[{type:"newline",offset:-1,indent:r,source:`
`}];switch(l[0]){case"|":case">":{const c=l.indexOf(`
`),h=l.substring(0,c),f=l.substring(c+1)+`
`,a=[{type:"block-scalar-header",offset:n,indent:r,source:h}];return lh(a,u)||a.push({type:"newline",offset:-1,indent:r,source:`
`}),{type:"block-scalar",offset:n,indent:r,props:a,source:f}}case'"':return{type:"double-quoted-scalar",offset:n,indent:r,source:l,end:u};case"'":return{type:"single-quoted-scalar",offset:n,indent:r,source:l,end:u};default:return{type:"scalar",offset:n,indent:r,source:l,end:u}}}function $1(t,e,i={}){let{afterKey:r=!1,implicitKey:s=!1,inFlow:n=!1,type:o}=i,l="indent"in t?t.indent:null;if(r&&typeof l=="number"&&(l+=2),!o)switch(t.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{const c=t.props[0];if(c.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=c.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}const u=ds({type:o,value:e},{implicitKey:s||l===null,indent:l!==null&&l>0?" ".repeat(l):"",inFlow:n,options:{blockQuote:!0,lineWidth:-1}});switch(u[0]){case"|":case">":I1(t,u);break;case'"':ho(t,u,"double-quoted-scalar");break;case"'":ho(t,u,"single-quoted-scalar");break;default:ho(t,u,"scalar")}}function I1(t,e){const i=e.indexOf(`
`),r=e.substring(0,i),s=e.substring(i+1)+`
`;if(t.type==="block-scalar"){const n=t.props[0];if(n.type!=="block-scalar-header")throw new Error("Invalid block scalar header");n.source=r,t.source=s}else{const{offset:n}=t,o="indent"in t?t.indent:-1,l=[{type:"block-scalar-header",offset:n,indent:o,source:r}];lh(l,"end"in t?t.end:void 0)||l.push({type:"newline",offset:-1,indent:o,source:`
`});for(const u of Object.keys(t))u!=="type"&&u!=="offset"&&delete t[u];Object.assign(t,{type:"block-scalar",indent:o,props:l,source:s})}}function lh(t,e){if(e)for(const i of e)switch(i.type){case"space":case"comment":t.push(i);break;case"newline":return t.push(i),!0}return!1}function ho(t,e,i){switch(t.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":t.type=i,t.source=e;break;case"block-scalar":{const r=t.props.slice(1);let s=e.length;t.props[0].type==="block-scalar-header"&&(s-=t.props[0].source.length);for(const n of r)n.offset+=s;delete t.props,Object.assign(t,{type:i,source:e,end:r});break}case"block-map":case"block-seq":{const s={type:"newline",offset:t.offset+e.length,indent:t.indent,source:`
`};delete t.items,Object.assign(t,{type:i,source:e,end:[s]});break}default:{const r="indent"in t?t.indent:-1,s="end"in t&&Array.isArray(t.end)?t.end.filter(n=>n.type==="space"||n.type==="comment"||n.type==="newline"):[];for(const n of Object.keys(t))n!=="type"&&n!=="offset"&&delete t[n];Object.assign(t,{type:i,indent:r,source:e,end:s})}}}const L1=t=>"type"in t?un(t):Gs(t);function un(t){switch(t.type){case"block-scalar":{let e="";for(const i of t.props)e+=un(i);return e+t.source}case"block-map":case"block-seq":{let e="";for(const i of t.items)e+=Gs(i);return e}case"flow-collection":{let e=t.start.source;for(const i of t.items)e+=Gs(i);for(const i of t.end)e+=i.source;return e}case"document":{let e=Gs(t);if(t.end)for(const i of t.end)e+=i.source;return e}default:{let e=t.source;if("end"in t&&t.end)for(const i of t.end)e+=i.source;return e}}}function Gs({start:t,key:e,sep:i,value:r}){let s="";for(const n of t)s+=n.source;if(e&&(s+=un(e)),i)for(const n of i)s+=n.source;return r&&(s+=un(r)),s}const wa=Symbol("break visit"),N1=Symbol("skip children"),uh=Symbol("remove item");function Li(t,e){"type"in t&&t.type==="document"&&(t={start:t.start,value:t.value}),ch(Object.freeze([]),t,e)}Li.BREAK=wa;Li.SKIP=N1;Li.REMOVE=uh;Li.itemAtPath=(t,e)=>{let i=t;for(const[r,s]of e){const n=i?.[r];if(n&&"items"in n)i=n.items[s];else return}return i};Li.parentCollection=(t,e)=>{const i=Li.itemAtPath(t,e.slice(0,-1)),r=e[e.length-1][0],s=i?.[r];if(s&&"items"in s)return s;throw new Error("Parent collection not found")};function ch(t,e,i){let r=i(e,t);if(typeof r=="symbol")return r;for(const s of["key","value"]){const n=e[s];if(n&&"items"in n){for(let o=0;o<n.items.length;++o){const l=ch(Object.freeze(t.concat([[s,o]])),n.items[o],i);if(typeof l=="number")o=l-1;else{if(l===wa)return wa;l===uh&&(n.items.splice(o,1),o-=1)}}typeof r=="function"&&s==="key"&&(r=r(e,t))}}return typeof r=="function"?r(e,t):r}const Dn="\uFEFF",Pn="",Mn="",Zr="",D1=t=>!!t&&"items"in t,P1=t=>!!t&&(t.type==="scalar"||t.type==="single-quoted-scalar"||t.type==="double-quoted-scalar"||t.type==="block-scalar");function M1(t){switch(t){case Dn:return"<BOM>";case Pn:return"<DOC>";case Mn:return"<FLOW_END>";case Zr:return"<SCALAR>";default:return JSON.stringify(t)}}function dh(t){switch(t){case Dn:return"byte-order-mark";case Pn:return"doc-mode";case Mn:return"flow-error-end";case Zr:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(t[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}const z1=Object.freeze(Object.defineProperty({__proto__:null,BOM:Dn,DOCUMENT:Pn,FLOW_END:Mn,SCALAR:Zr,createScalarToken:O1,isCollection:D1,isScalar:P1,prettyToken:M1,resolveAsScalar:T1,setScalarValue:$1,stringify:L1,tokenType:dh,visit:Li},Symbol.toStringTag,{value:"Module"}));function ht(t){switch(t){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}const vu=new Set("0123456789ABCDEFabcdef"),R1=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),Os=new Set(",[]{}"),B1=new Set(` ,[]{}
\r	`),fo=t=>!t||B1.has(t);class hh{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,i=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!i;let r=this.next??"stream";for(;r&&(i||this.hasChars(1));)r=yield*this.parseNext(r)}atLineEnd(){let e=this.pos,i=this.buffer[e];for(;i===" "||i==="	";)i=this.buffer[++e];return!i||i==="#"||i===`
`?!0:i==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let i=this.buffer[e];if(this.indentNext>0){let r=0;for(;i===" ";)i=this.buffer[++r+e];if(i==="\r"){const s=this.buffer[r+e+1];if(s===`
`||!s&&!this.atEnd)return e+r+1}return i===`
`||r>=this.indentNext||!i&&!this.atEnd?e+r:-1}if(i==="-"||i==="."){const r=this.buffer.substr(e,3);if((r==="---"||r==="...")&&ht(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===Dn&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let i=e.length,r=e.indexOf("#");for(;r!==-1;){const n=e[r-1];if(n===" "||n==="	"){i=r-1;break}else r=e.indexOf("#",r+1)}for(;;){const n=e[i-1];if(n===" "||n==="	")i-=1;else break}const s=(yield*this.pushCount(i))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-s),this.pushNewline(),"stream"}if(this.atLineEnd()){const i=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-i),yield*this.pushNewline(),"stream"}return yield Pn,yield*this.parseLineStart()}*parseLineStart(){const e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");const i=this.peek(3);if((i==="---"||i==="...")&&ht(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,i==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ht(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){const[e,i]=this.peek(2);if(!i&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ht(i)){const r=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=r,yield*this.parseBlockStart()}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);const e=this.getLine();if(e===null)return this.setNext("doc");let i=yield*this.pushIndicators();switch(e[i]){case"#":yield*this.pushCount(e.length-i);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(fo),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return i+=yield*this.parseBlockScalarHeader(),i+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-i),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,i,r=-1;do e=yield*this.pushNewline(),e>0?(i=yield*this.pushSpaces(!1),this.indentValue=r=i):i=0,i+=yield*this.pushSpaces(!0);while(e+i>0);const s=this.getLine();if(s===null)return this.setNext("flow");if((r!==-1&&r<this.indentNext&&s[0]!=="#"||r===0&&(s.startsWith("---")||s.startsWith("..."))&&ht(s[3]))&&!(r===this.indentNext-1&&this.flowLevel===1&&(s[0]==="]"||s[0]==="}")))return this.flowLevel=0,yield Mn,yield*this.parseLineStart();let n=0;for(;s[n]===",";)n+=yield*this.pushCount(1),n+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(n+=yield*this.pushIndicators(),s[n]){case void 0:return"flow";case"#":return yield*this.pushCount(s.length-n),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(fo),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{const o=this.charAt(1);if(this.flowKey||ht(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){const e=this.charAt(0);let i=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;i!==-1&&this.buffer[i+1]==="'";)i=this.buffer.indexOf("'",i+2);else for(;i!==-1;){let n=0;for(;this.buffer[i-1-n]==="\\";)n+=1;if(n%2===0)break;i=this.buffer.indexOf('"',i+1)}const r=this.buffer.substring(0,i);let s=r.indexOf(`
`,this.pos);if(s!==-1){for(;s!==-1;){const n=this.continueScalar(s+1);if(n===-1)break;s=r.indexOf(`
`,n)}s!==-1&&(i=s-(r[s-1]==="\r"?2:1))}if(i===-1){if(!this.atEnd)return this.setNext("quoted-scalar");i=this.buffer.length}return yield*this.pushToIndex(i+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){const i=this.buffer[++e];if(i==="+")this.blockScalarKeep=!0;else if(i>"0"&&i<="9")this.blockScalarIndent=Number(i)-1;else if(i!=="-")break}return yield*this.pushUntil(i=>ht(i)||i==="#")}*parseBlockScalar(){let e=this.pos-1,i=0,r;e:for(let n=this.pos;r=this.buffer[n];++n)switch(r){case" ":i+=1;break;case`
`:e=n,i=0;break;case"\r":{const o=this.buffer[n+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!r&&!this.atEnd)return this.setNext("block-scalar");if(i>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=i:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{const n=this.continueScalar(e+1);if(n===-1)break;e=this.buffer.indexOf(`
`,n)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let s=e+1;for(r=this.buffer[s];r===" ";)r=this.buffer[++s];if(r==="	"){for(;r==="	"||r===" "||r==="\r"||r===`
`;)r=this.buffer[++s];e=s-1}else if(!this.blockScalarKeep)do{let n=e-1,o=this.buffer[n];o==="\r"&&(o=this.buffer[--n]);const l=n;for(;o===" ";)o=this.buffer[--n];if(o===`
`&&n>=this.pos&&n+1+i>l)e=n;else break}while(!0);return yield Zr,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){const e=this.flowLevel>0;let i=this.pos-1,r=this.pos-1,s;for(;s=this.buffer[++r];)if(s===":"){const n=this.buffer[r+1];if(ht(n)||e&&Os.has(n))break;i=r}else if(ht(s)){let n=this.buffer[r+1];if(s==="\r"&&(n===`
`?(r+=1,s=`
`,n=this.buffer[r+1]):i=r),n==="#"||e&&Os.has(n))break;if(s===`
`){const o=this.continueScalar(r+1);if(o===-1)break;r=Math.max(r,o-2)}}else{if(e&&Os.has(s))break;i=r}return!s&&!this.atEnd?this.setNext("plain-scalar"):(yield Zr,yield*this.pushToIndex(i+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,i){const r=this.buffer.slice(this.pos,e);return r?(yield r,this.pos+=r.length,r.length):(i&&(yield""),0)}*pushIndicators(){switch(this.charAt(0)){case"!":return(yield*this.pushTag())+(yield*this.pushSpaces(!0))+(yield*this.pushIndicators());case"&":return(yield*this.pushUntil(fo))+(yield*this.pushSpaces(!0))+(yield*this.pushIndicators());case"-":case"?":case":":{const e=this.flowLevel>0,i=this.charAt(1);if(ht(i)||e&&Os.has(i))return e?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,(yield*this.pushCount(1))+(yield*this.pushSpaces(!0))+(yield*this.pushIndicators())}}return 0}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,i=this.buffer[e];for(;!ht(i)&&i!==">";)i=this.buffer[++e];return yield*this.pushToIndex(i===">"?e+1:e,!1)}else{let e=this.pos+1,i=this.buffer[e];for(;i;)if(R1.has(i))i=this.buffer[++e];else if(i==="%"&&vu.has(this.buffer[e+1])&&vu.has(this.buffer[e+2]))i=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){const e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let i=this.pos-1,r;do r=this.buffer[++i];while(r===" "||e&&r==="	");const s=i-this.pos;return s>0&&(yield this.buffer.substr(this.pos,s),this.pos=i),s}*pushUntil(e){let i=this.pos,r=this.buffer[i];for(;!e(r);)r=this.buffer[++i];return yield*this.pushToIndex(i,!1)}}class fh{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let i=0,r=this.lineStarts.length;for(;i<r;){const n=i+r>>1;this.lineStarts[n]<e?i=n+1:r=n}if(this.lineStarts[i]===e)return{line:i+1,col:1};if(i===0)return{line:0,col:e};const s=this.lineStarts[i-1];return{line:i,col:e-s+1}}}}function Qt(t,e){for(let i=0;i<t.length;++i)if(t[i].type===e)return!0;return!1}function wu(t){for(let e=0;e<t.length;++e)switch(t[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function ph(t){switch(t?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function $s(t){switch(t.type){case"document":return t.start;case"block-map":{const e=t.items[t.items.length-1];return e.sep??e.start}case"block-seq":return t.items[t.items.length-1].start;default:return[]}}function ji(t){if(t.length===0)return[];let e=t.length;e:for(;--e>=0;)switch(t[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;t[++e]?.type==="space";);return t.splice(e,t.length)}function xu(t){if(t.start.type==="flow-seq-start")for(const e of t.items)e.sep&&!e.value&&!Qt(e.start,"explicit-key-ind")&&!Qt(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,ph(e.value)?e.value.end?Array.prototype.push.apply(e.value.end,e.sep):e.value.end=e.sep:Array.prototype.push.apply(e.start,e.sep),delete e.sep)}let rl=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new hh,this.onNewLine=e}*parse(e,i=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(const r of this.lexer.lex(e,i))yield*this.next(r);i||(yield*this.end())}*next(e){if(this.source=e,this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}const i=dh(e);if(i)if(i==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=i,yield*this.step(),i){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{const r=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:r,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){const e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){const i=e??this.stack.pop();if(!i)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield i;else{const r=this.peek(1);switch(i.type==="block-scalar"?i.indent="indent"in r?r.indent:0:i.type==="flow-collection"&&r.type==="document"&&(i.indent=0),i.type==="flow-collection"&&xu(i),r.type){case"document":r.value=i;break;case"block-scalar":r.props.push(i);break;case"block-map":{const s=r.items[r.items.length-1];if(s.value){r.items.push({start:[],key:i,sep:[]}),this.onKeyLine=!0;return}else if(s.sep)s.value=i;else{Object.assign(s,{key:i,sep:[]}),this.onKeyLine=!s.explicitKey;return}break}case"block-seq":{const s=r.items[r.items.length-1];s.value?r.items.push({start:[],value:i}):s.value=i;break}case"flow-collection":{const s=r.items[r.items.length-1];!s||s.value?r.items.push({start:[],key:i,sep:[]}):s.sep?s.value=i:Object.assign(s,{key:i,sep:[]});return}default:yield*this.pop(),yield*this.pop(i)}if((r.type==="document"||r.type==="block-map"||r.type==="block-seq")&&(i.type==="block-map"||i.type==="block-seq")){const s=i.items[i.items.length-1];s&&!s.sep&&!s.value&&s.start.length>0&&wu(s.start)===-1&&(i.indent===0||s.start.every(n=>n.type!=="comment"||n.indent<i.indent))&&(r.type==="document"?r.end=s.start:r.items.push({start:s.start}),i.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{const e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{wu(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}const i=this.startBlockValue(e);i?this.stack.push(i):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){const i=$s(this.peek(2)),r=ji(i);let s;e.end?(s=e.end,s.push(this.sourceToken),delete e.end):s=[this.sourceToken];const n={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:r,key:e,sep:s}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=n}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let i=this.source.indexOf(`
`)+1;for(;i!==0;)this.onNewLine(this.offset+i),i=this.source.indexOf(`
`,i)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){const i=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,i.value){const r="end"in i.value?i.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else i.sep?i.sep.push(this.sourceToken):i.start.push(this.sourceToken);return;case"space":case"comment":if(i.value)e.items.push({start:[this.sourceToken]});else if(i.sep)i.sep.push(this.sourceToken);else{if(this.atIndentedComment(i.start,e.indent)){const s=e.items[e.items.length-2]?.value?.end;if(Array.isArray(s)){Array.prototype.push.apply(s,i.start),s.push(this.sourceToken),e.items.pop();return}}i.start.push(this.sourceToken)}return}if(this.indent>=e.indent){const r=!this.onKeyLine&&this.indent===e.indent,s=r&&(i.sep||i.explicitKey)&&this.type!=="seq-item-ind";let n=[];if(s&&i.sep&&!i.value){const o=[];for(let l=0;l<i.sep.length;++l){const u=i.sep[l];switch(u.type){case"newline":o.push(l);break;case"space":break;case"comment":u.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(n=i.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":s||i.value?(n.push(this.sourceToken),e.items.push({start:n}),this.onKeyLine=!0):i.sep?i.sep.push(this.sourceToken):i.start.push(this.sourceToken);return;case"explicit-key-ind":!i.sep&&!i.explicitKey?(i.start.push(this.sourceToken),i.explicitKey=!0):s||i.value?(n.push(this.sourceToken),e.items.push({start:n,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(i.explicitKey)if(i.sep)if(i.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Qt(i.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:n,key:null,sep:[this.sourceToken]}]});else if(ph(i.key)&&!Qt(i.sep,"newline")){const o=ji(i.start),l=i.key,u=i.sep;u.push(this.sourceToken),delete i.key,delete i.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:l,sep:u}]})}else n.length>0?i.sep=i.sep.concat(n,this.sourceToken):i.sep.push(this.sourceToken);else if(Qt(i.start,"newline"))Object.assign(i,{key:null,sep:[this.sourceToken]});else{const o=ji(i.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else i.sep?i.value||s?e.items.push({start:n,key:null,sep:[this.sourceToken]}):Qt(i.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):i.sep.push(this.sourceToken):Object.assign(i,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{const o=this.flowScalar(this.type);s||i.value?(e.items.push({start:n,key:o,sep:[]}),this.onKeyLine=!0):i.sep?this.stack.push(o):(Object.assign(i,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{const o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!i.explicitKey&&i.sep&&!Qt(i.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else r&&e.items.push({start:n});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){const i=e.items[e.items.length-1];switch(this.type){case"newline":if(i.value){const r="end"in i.value?i.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else i.start.push(this.sourceToken);return;case"space":case"comment":if(i.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(i.start,e.indent)){const s=e.items[e.items.length-2]?.value?.end;if(Array.isArray(s)){Array.prototype.push.apply(s,i.start),s.push(this.sourceToken),e.items.pop();return}}i.start.push(this.sourceToken)}return;case"anchor":case"tag":if(i.value||this.indent<=e.indent)break;i.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;i.value||Qt(i.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):i.start.push(this.sourceToken);return}if(this.indent>e.indent){const r=this.startBlockValue(e);if(r){this.stack.push(r);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){const i=e.items[e.items.length-1];if(this.type==="flow-error-end"){let r;do yield*this.pop(),r=this.peek(1);while(r?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!i||i.sep?e.items.push({start:[this.sourceToken]}):i.start.push(this.sourceToken);return;case"map-value-ind":!i||i.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):i.sep?i.sep.push(this.sourceToken):Object.assign(i,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!i||i.value?e.items.push({start:[this.sourceToken]}):i.sep?i.sep.push(this.sourceToken):i.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{const s=this.flowScalar(this.type);!i||i.value?e.items.push({start:[],key:s,sep:[]}):i.sep?this.stack.push(s):Object.assign(i,{key:s,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}const r=this.startBlockValue(e);r?this.stack.push(r):(yield*this.pop(),yield*this.step())}else{const r=this.peek(2);if(r.type==="block-map"&&(this.type==="map-value-ind"&&r.indent===e.indent||this.type==="newline"&&!r.items[r.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&r.type!=="flow-collection"){const s=$s(r),n=ji(s);xu(e);const o=e.end.splice(1,e.end.length);o.push(this.sourceToken);const l={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:n,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=l}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let i=this.source.indexOf(`
`)+1;for(;i!==0;)this.onNewLine(this.offset+i),i=this.source.indexOf(`
`,i)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;const i=$s(e),r=ji(i);return r.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;const i=$s(e),r=ji(i);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,i){return this.type!=="comment"||this.indent<=i?!1:e.every(r=>r.type==="newline"||r.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;case"space":case"comment":default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};function mh(t){const e=t.prettyErrors!==!1;return{lineCounter:t.lineCounter||e&&new fh||null,prettyErrors:e}}function F1(t,e={}){const{lineCounter:i,prettyErrors:r}=mh(e),s=new rl(i?.addNewLine),n=new il(e),o=Array.from(n.compose(s.parse(t)));if(r&&i)for(const l of o)l.errors.forEach(ln(t,i)),l.warnings.forEach(ln(t,i));return o.length>0?o:Object.assign([],{empty:!0},n.streamInfo())}function bh(t,e={}){const{lineCounter:i,prettyErrors:r}=mh(e),s=new rl(i?.addNewLine),n=new il(e);let o=null;for(const l of n.compose(s.parse(t),!0,t.length))if(!o)o=l;else if(o.options.logLevel!=="silent"){o.errors.push(new ki(l.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return r&&i&&(o.errors.forEach(ln(t,i)),o.warnings.forEach(ln(t,i))),o}function q1(t,e,i){let r;typeof e=="function"?r=e:i===void 0&&e&&typeof e=="object"&&(i=e);const s=bh(t,i);if(!s)return null;if(s.warnings.forEach(n=>Pd(s.options.logLevel,n)),s.errors.length>0){if(s.options.logLevel!=="silent")throw s.errors[0];s.errors=[]}return s.toJS(Object.assign({reviver:r},i))}function U1(t,e,i){let r=null;if(typeof e=="function"||Array.isArray(e)?r=e:i===void 0&&e&&(i=e),typeof i=="string"&&(i=i.length),typeof i=="number"){const s=Math.round(i);i=s<1?void 0:s>8?{indent:8}:{indent:s}}if(t===void 0){const{keepUndefined:s}=i??e??{};if(!s)return}return Bi(t)&&!r?t.toString(i):new Nn(t,r,i).toString(i)}const cn=Object.freeze(Object.defineProperty({__proto__:null,Alias:kn,CST:z1,Composer:il,Document:Nn,Lexer:hh,LineCounter:fh,Pair:ze,Parser:rl,Scalar:Y,Schema:Ln,YAMLError:el,YAMLMap:Xe,YAMLParseError:ki,YAMLSeq:oi,YAMLWarning:th,isAlias:ci,isCollection:ye,isDocument:Bi,isMap:gr,isNode:ve,isPair:be,isScalar:he,isSeq:yr,parse:q1,parseAllDocuments:F1,parseDocument:bh,stringify:U1,visit:Fi,visitAsync:_n},Symbol.toStringTag,{value:"Module"}));function gh(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function V1(t,e){}async function j1(t,e,i){}async function H1(t){const e=localStorage.getItem(t);return e?JSON.parse(e):null}async function K1(t,e){localStorage.setItem(t,JSON.stringify(e))}async function ps(t){return await window.backend.App.ReadFile(t)}async function xr(t,e){return await window.backend.App.WriteFile(t,e)}async function W1(t){return await window.backend.App.ReadBinaryFile(t)}async function sl(t,e){return await window.backend.App.WriteBinaryFile(t,e)}async function zn(t){return await window.backend.App.ReadDirectory(t)}async function G1(t){return await window.backend.App.GetStats(t)}async function Y1(t){return await window.backend.App.CreateDirectory(t)}async function X1(){return(await window.backend.App.GetConfig()).RunTests}const J1=1;class nl{static async load(e,i={}){const r=`locales/${e}.yml`,s=await ps(r);return new nl(e,s,i)}static get totalKeys(){return this.schema?Object.values(this.schema).flatMap(e=>Object.values(e)).length:null}constructor(e,i="",r={}){this.id=e,this.data=cn.parse(i)||{},this.addMissingKeys(),this.text=this.stringify(),this.label=r?.label||"New Locale",this.created=r?.created||new Date,this.updated=r?.updated||void 0,this.schemaVersion=r?.schemaVersion||J1,this.contributors=r?.contributors||""}addMissingKeys(){const e=Object.entries(this.constructor.schema);for(const[i,r]of e){this.data[i]||={};for(const s in r)this.data[i][s]||=null}}stringify(){return cn.stringify(this.data,null,{nullStr:""})}resolve(e,i,r){const n=this.data[e]?.[i];return n?gh(n.replace(/%\{(\d+)}/g,(o,l)=>r[l])):null}get fields(){const e=localize("edit-locales-modal");return[{id:"id",label:e`Locale ID`},{id:"label",label:e`Label`},{id:"contributors",placeholder:e`Your name here`,label:e`Contributors`},{id:"text",label:e`Text`,type:"code",syntax:"yaml"}]}get metadata(){return{label:this.label,created:this.created,updated:this.updated,percentComplete:this.percentCompleted,schemaVersion:this.schemaVersion,contributors:this.contributors}}get percentComplete(){const e=this.completedCount/this.constructor.totalKeys;return`${Math.floor(e*100)}%`}get completedCount(){return Object.values(this.data).flatMap(e=>Object.values(e)).length}get name(){return`${this.label} (${this.id}.yml)`}async save(){const e=`locales/${this.id}.yml`;await xr(e,this.raw)}}const Q1=NL_ARGS.includes("--localize"),yh=sy();Z1();async function Z1(){const e=await ps("locales/locales.json"),i=JSON.parse(e),s=(await zn("locales")).filter(n=>n.type==="FILE"&&n.entry.endsWith(".yml")).map(n=>n.entry.slice(0,-4));return await Promise.all(Object.entries(i).filter(([n])=>s.includes(n)).map(([n,o])=>nl.load(n,o)))}function ey(t,e){return t[0]+e.map((i,r)=>`${i}${t[r+1]}`).join("")}function ty(t,e){return t[0]+e.map((i,r)=>`%{${r}}${t[r+1]}`).join("")}const iy=(async function(){const e=await yh,i=JSON.stringify(e,null,2),r="locales/schema.json";console.log("Writing localization schema to ",r),await Y1("locales").catch(()=>{}),await xr(r,i)}).debounce(1e3);async function ry(t,e){const i=await yh,r=i[t]||={};r[e]||=0,r[e]+=1,iy()}async function sy(){try{const e=await ps("locales/schema.json");return JSON.parse(e)}catch(t){return console.error(t),{}}}window.localize=function(t){return function(e,...i){const r=ty(e,i);return Q1&&ry(t,r),ey(e,i)}};async function ny(t){const e=await ps(t);return JSON.parse(e)}async function vh(t){try{return(await G1(t)).isFile}catch(e){if(e.code==="NE_FS_NOPATHE")return!1;throw e}}async function ol(t){const e=await fetch(t);if(!e.ok)throw new Error(`Failed to load file ${t}, ${e.status}`);return await e.text()}function oy(t){let e=2166136261;for(let i=0;i<t.length;i++)e^=t.charCodeAt(i),e=e*16777619>>>0;return(e>>>0).toString(16)}const xa=new Map;let Nr=null;function ay(){return Nr||(Nr=document.createElement("style"),document.head.appendChild(Nr),Nr)}function ly(){const t=ay();t.textContent=[...xa.values()].map(e=>`@font-face {
            font-family: "${e.name}";
            src: url("${e.path}") format("${e.format}");
            font-display: swap;
        }`).join(`
`)}function uy(t){return t.endsWith(".woff2")?"woff2":t.endsWith(".woff")?"woff":"truetype"}function wh(t,e){if(xa.has(t))return;const i=uy(e);xa.set(t,{name:t,path:e,format:i}),ly()}function Ci(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0);const r=i.getImageData(0,0,t.width,t.height);return{canvas:e,ctx:i,imageData:r}}function Rn(t,e){const i=document.createElement("canvas");i.width=t,i.height=e;const r=i.getContext("2d");return{canvas:i,ctx:r}}function xh(t){return new Promise((e,i)=>{const r=new Image;r.onload=()=>e(r),r.onerror=i,r.src=t})}function cy(t){return new Promise((e,i)=>{const r=new Image;r.onload=()=>{e({width:r.naturalWidth,height:r.naturalHeight})},r.onerror=i,r.src=t})}function Is(t){return Math.min(255,t)}function Ls(t){return Math.max(0,t)}function dy(t){return Math.min(255,Math.max(0,t))}function po(t,e){return t<128?t*e>>7:255-((255-t)*(255-e)>>7)}function hy(t,e){t/=255,e/=255;let i;if(e<.5)i=t-(1-2*e)*t*(1-t);else{const r=t<=.25?((16*t-12)*t+4)*t:Math.sqrt(t);i=t+(2*e-1)*(r-t)}return Math.round(i*255)}const fy={add:(t,e)=>Is(t+e),subtract:(t,e)=>Ls(t-e),stamp:(t,e)=>dy(t-2*e+256),difference:(t,e)=>Math.abs(t-e),negation:(t,e)=>255-Math.abs(255-t-e),multiply:(t,e)=>t*e/255,darken:(t,e)=>Math.min(t,e),lighten:(t,e)=>Math.max(t,e),colorDodge:(t,e)=>e===255?255:Is(t*255/(255-e)),colorBurn:(t,e)=>e===0?0:Ls(255-(255-t)*255/e),screen:(t,e)=>255-(255-t)*(255-e)/255,overlay:(t,e)=>po(t,e),hardLight:(t,e)=>e<128?t*e>>7:255-((255-t)*(255-e)>>7),softLight:(t,e)=>hy(t,e),reflect:(t,e)=>e===255?255:Is(t*t/(255-e)),glow:(t,e)=>t===255?255:Is(e*e/(255-t)),freeze:(t,e)=>e===0?0:Ls(255-(255-t)*(255-t)/e),heat:(t,e)=>t===0?0:Ls(255-(255-e)*(255-e)/t),and:(t,e)=>t&e,or:(t,e)=>t|e,xor:(t,e)=>t^e,shadow:(t,e)=>e*t*t/65025,symmetricOverlay:(t,e)=>po(t,e)+po(e,t)>>1},py=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;class lt{constructor(e,i,r,s=255){this._r=this._clamp(e),this._g=this._clamp(i),this._b=this._clamp(r),this._a=this._clamp(s)}_clamp(e){if(!Number.isFinite(e))throw new Error("Color component must be a finite number");return Math.round(Math.max(0,Math.min(255,e)))}get r(){return this._r}get g(){return this._g}get b(){return this._b}get a(){return this._a}static fromHex(e){const i=e.match(py);if(!i)throw new Error("Invalid hex color format");const r=parseInt(i[1],16),s=parseInt(i[2],16),n=parseInt(i[3],16),o=i[4]?parseInt(i[4],16):255;return new lt(r,s,n,o)}}lt.black=new lt(0,0,0);lt.red=new lt(255,0,0);lt.green=new lt(0,255,0);lt.blue=new lt(0,0,255);window.Color=lt;const my=500;class by{localPath="cache/images";cache=new Map;objectUrlMap=new Map;constructor(e){this.cachePath=`${e}/${this.localPath}`}has(e){const i=`${this.cachePath}/${e}`;return this.cache.has(i)}get(e){const i=`${this.cachePath}/${e}`;return this.cache.get(i)}async preload(){const e=await zn(this.cachePath);for(const{type:i,entry:r}of e){if(i!=="FILE")continue;const s=`${this.localPath}/${r}`,n=`${this.cachePath}/${r}`;await xh(s),this.cache.set(n,s)}}reset(){this.cache.clear(),this.objectUrlMap.forEach(e=>URL.revokeObjectURL(e)),this.objectUrlMap.clear()}async saveBlobToDisk(e,i,r){const s=await e.arrayBuffer(),n=new Uint8Array(s);await sl(r,n),this.cache.set(r,i)}async save(e,i,r,s){const n=`${this.cachePath}/${e}`,o=`${this.localPath}/${e}`,l=await new Promise(c=>{i.toBlob(c,r,s)}),u=URL.createObjectURL(l);return this.objectUrlMap.set(u,o),this.cache.set(n,u),this.saveBlobToDisk(l,o,n).then(()=>{setTimeout(()=>URL.revokeObjectURL(u),my)}),u}}const Ys=new by(NL_DATAPATH),mo=new Map;function gy(t){return(t instanceof Pt?t:new Pt("source",[t])).execute()}class Pt{static register(e,i=0){if(mo.has(e.name))throw new Error(`Already registered operation ${e.name}`);return mo.set(e.name,{fn:e,numImageArgs:i}),function(){return new Pt(e.name,arguments)}}constructor(e,i){this.name=e,this.args=i}makeFilename(e){const i=oy(JSON.stringify(this)),r=e.split("/").pop();return`img-${i}.${r}`}async execute(){const e=mo.get(this.name);if(!e)throw new Error(`Unknown operation ${this.name}`);const i=[];for(let s=0;s<this.args.length;s++){const n=this.args[s],o=s<e.numImageArgs?gy(n):n;i.push(o)}const r=await Promise.all(i);return await e.fn(...r)}async publish(e="image/png",i=.92){const r=this.makeFilename(e);if(Ys.has(r))return Ys.get(r);console.debug("%cCache miss %s","color:grey",r);const s=await this.execute();return await Ys.save(r,s,e,i)}}Pt.register(function(e){return xh(e)});function yy(t,e,i){const r=fy[i];if(!r)throw new Error(`Blend mode not supported: ${i}`);const s=new ImageData(t.width,t.height),n=t.data,o=e.data,l=s.data;for(let u=0;u<n.length;u+=4)l[u]=r(n[u],o[u]),l[u+1]=r(n[u+1],o[u+1]),l[u+2]=r(n[u+2],o[u+2]),l[u+3]=Math.max(n[u+3],o[u+3]);return s}function _h(t,e,i){const{width:r,height:s}=t;if(e.width!==r||e.height!==s)throw new Error("Images must have the same size");const{canvas:n,ctx:o}=Rn(r,s);o.globalCompositeOperation="source-over",o.drawImage(t,0,0);const l=o.getImageData(0,0,r,s),{imageData:u}=Ci(e),c=yy(l,u,i);return o.putImageData(c,0,0),n}function kh(t,e,i,r,s,n){if(t.width!==e.width||t.height!==e.height)throw new Error("Images must have the same size");const{width:o,height:l}=t,{canvas:u,ctx:c}=Rn(o,l);c.drawImage(t,0,0),c.save();const h=c.createLinearGradient(i*o,r*l,s*o,n*l);return h.addColorStop(0,"rgba(0,0,0,1)"),h.addColorStop(1,"rgba(0,0,0,0)"),c.globalCompositeOperation="destination-in",c.fillStyle=h,c.fillRect(0,0,o,l),c.globalCompositeOperation="destination-over",c.drawImage(e,0,0),c.restore(),u}function Sh(t,e,i){const{width:r,height:s}=t;if(e.width!==r||e.height!==s||i.width!==r||i.height!==s)throw new Error("Images must have the same size");const{imageData:n}=Ci(t),{imageData:o}=Ci(e),{imageData:l}=Ci(i),u=n.data,c=o.data,h=l.data;for(let d=0;d<u.length;d+=4){const p=h[d],b=255-p;u[d]=(u[d]*p+c[d]*b)/255,u[d+1]=(u[d+1]*p+c[d+1]*b)/255,u[d+2]=(u[d+2]*p+c[d+2]*b)/255}const{canvas:f,ctx:a}=Rn(r,s);return a.putImageData(n,0,0),f}function vy(t,e){const{width:i,height:r}=t;if(e.width!==i||e.height!==r)throw new Error("Images must have the same size");const{canvas:s,ctx:n,imageData:o}=Ci(t),{imageData:l}=Ci(e),u=o.data,c=l.data;for(let h=0;h<u.length;h+=4){const f=u[h+3];u[h+3]=Math.round(f*(c[h]/255))}return n.putImageData(o,0,0),s}function wy(t,e){const i=lt.fromHex(e),{width:r,height:s}=t,{canvas:n,ctx:o}=Rn(r,s),{imageData:l}=Ci(t),u=l.data,c=o.createImageData(r,s),h=c.data;for(let f=0;f<h.length;f+=4)h[f]=i.r,h[f+1]=i.g,h[f+2]=i.b,h[f+3]=Math.round(i.a*(u[f]/255));return o.putImageData(c,0,0),n}const xy=Pt.register(_h,2),_y=Pt.register(kh,2),ky=Pt.register(Sh,3),Sy=Pt.register(vy,2),Cy=Pt.register(wy,1);function Ay(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function Ey(t){if(Object.prototype.hasOwnProperty.call(t,"__esModule"))return t;var e=t.default;if(typeof e=="function"){var i=function r(){var s=!1;try{s=this instanceof r}catch{}return s?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};i.prototype=e.prototype}else i={};return Object.defineProperty(i,"__esModule",{value:!0}),Object.keys(t).forEach(function(r){var s=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(i,r,s.get?s:{enumerable:!0,get:function(){return t[r]}})}),i}var ft={},pt={},bo={},mt={},Ns={},_u;function Ty(){return _u||(_u=1,Object.defineProperty(Ns,"__esModule",{value:!0}),Ns.default=new Uint16Array('ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map(function(t){return t.charCodeAt(0)}))),Ns}var Ds={},ku;function Oy(){return ku||(ku=1,Object.defineProperty(Ds,"__esModule",{value:!0}),Ds.default=new Uint16Array("Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map(function(t){return t.charCodeAt(0)}))),Ds}var go={},Su;function Cu(){return Su||(Su=1,(function(t){var e;Object.defineProperty(t,"__esModule",{value:!0}),t.replaceCodePoint=t.fromCodePoint=void 0;var i=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]);t.fromCodePoint=(e=String.fromCodePoint)!==null&&e!==void 0?e:function(n){var o="";return n>65535&&(n-=65536,o+=String.fromCharCode(n>>>10&1023|55296),n=56320|n&1023),o+=String.fromCharCode(n),o};function r(n){var o;return n>=55296&&n<=57343||n>1114111?65533:(o=i.get(n))!==null&&o!==void 0?o:n}t.replaceCodePoint=r;function s(n){return(0,t.fromCodePoint)(r(n))}t.default=s})(go)),go}var Au;function dn(){return Au||(Au=1,(function(t){var e=mt&&mt.__createBinding||(Object.create?(function(E,O,D,z){z===void 0&&(z=D);var I=Object.getOwnPropertyDescriptor(O,D);(!I||("get"in I?!O.__esModule:I.writable||I.configurable))&&(I={enumerable:!0,get:function(){return O[D]}}),Object.defineProperty(E,z,I)}):(function(E,O,D,z){z===void 0&&(z=D),E[z]=O[D]})),i=mt&&mt.__setModuleDefault||(Object.create?(function(E,O){Object.defineProperty(E,"default",{enumerable:!0,value:O})}):function(E,O){E.default=O}),r=mt&&mt.__importStar||function(E){if(E&&E.__esModule)return E;var O={};if(E!=null)for(var D in E)D!=="default"&&Object.prototype.hasOwnProperty.call(E,D)&&e(O,E,D);return i(O,E),O},s=mt&&mt.__importDefault||function(E){return E&&E.__esModule?E:{default:E}};Object.defineProperty(t,"__esModule",{value:!0}),t.decodeXML=t.decodeHTMLStrict=t.decodeHTMLAttribute=t.decodeHTML=t.determineBranch=t.EntityDecoder=t.DecodingMode=t.BinTrieFlags=t.fromCodePoint=t.replaceCodePoint=t.decodeCodePoint=t.xmlDecodeTree=t.htmlDecodeTree=void 0;var n=s(Ty());t.htmlDecodeTree=n.default;var o=s(Oy());t.xmlDecodeTree=o.default;var l=r(Cu());t.decodeCodePoint=l.default;var u=Cu();Object.defineProperty(t,"replaceCodePoint",{enumerable:!0,get:function(){return u.replaceCodePoint}}),Object.defineProperty(t,"fromCodePoint",{enumerable:!0,get:function(){return u.fromCodePoint}});var c;(function(E){E[E.NUM=35]="NUM",E[E.SEMI=59]="SEMI",E[E.EQUALS=61]="EQUALS",E[E.ZERO=48]="ZERO",E[E.NINE=57]="NINE",E[E.LOWER_A=97]="LOWER_A",E[E.LOWER_F=102]="LOWER_F",E[E.LOWER_X=120]="LOWER_X",E[E.LOWER_Z=122]="LOWER_Z",E[E.UPPER_A=65]="UPPER_A",E[E.UPPER_F=70]="UPPER_F",E[E.UPPER_Z=90]="UPPER_Z"})(c||(c={}));var h=32,f;(function(E){E[E.VALUE_LENGTH=49152]="VALUE_LENGTH",E[E.BRANCH_LENGTH=16256]="BRANCH_LENGTH",E[E.JUMP_TABLE=127]="JUMP_TABLE"})(f=t.BinTrieFlags||(t.BinTrieFlags={}));function a(E){return E>=c.ZERO&&E<=c.NINE}function d(E){return E>=c.UPPER_A&&E<=c.UPPER_F||E>=c.LOWER_A&&E<=c.LOWER_F}function p(E){return E>=c.UPPER_A&&E<=c.UPPER_Z||E>=c.LOWER_A&&E<=c.LOWER_Z||a(E)}function b(E){return E===c.EQUALS||p(E)}var w;(function(E){E[E.EntityStart=0]="EntityStart",E[E.NumericStart=1]="NumericStart",E[E.NumericDecimal=2]="NumericDecimal",E[E.NumericHex=3]="NumericHex",E[E.NamedEntity=4]="NamedEntity"})(w||(w={}));var g;(function(E){E[E.Legacy=0]="Legacy",E[E.Strict=1]="Strict",E[E.Attribute=2]="Attribute"})(g=t.DecodingMode||(t.DecodingMode={}));var x=(function(){function E(O,D,z){this.decodeTree=O,this.emitCodePoint=D,this.errors=z,this.state=w.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=g.Strict}return E.prototype.startEntity=function(O){this.decodeMode=O,this.state=w.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1},E.prototype.write=function(O,D){switch(this.state){case w.EntityStart:return O.charCodeAt(D)===c.NUM?(this.state=w.NumericStart,this.consumed+=1,this.stateNumericStart(O,D+1)):(this.state=w.NamedEntity,this.stateNamedEntity(O,D));case w.NumericStart:return this.stateNumericStart(O,D);case w.NumericDecimal:return this.stateNumericDecimal(O,D);case w.NumericHex:return this.stateNumericHex(O,D);case w.NamedEntity:return this.stateNamedEntity(O,D)}},E.prototype.stateNumericStart=function(O,D){return D>=O.length?-1:(O.charCodeAt(D)|h)===c.LOWER_X?(this.state=w.NumericHex,this.consumed+=1,this.stateNumericHex(O,D+1)):(this.state=w.NumericDecimal,this.stateNumericDecimal(O,D))},E.prototype.addToNumericResult=function(O,D,z,I){if(D!==z){var K=z-D;this.result=this.result*Math.pow(I,K)+parseInt(O.substr(D,K),I),this.consumed+=K}},E.prototype.stateNumericHex=function(O,D){for(var z=D;D<O.length;){var I=O.charCodeAt(D);if(a(I)||d(I))D+=1;else return this.addToNumericResult(O,z,D,16),this.emitNumericEntity(I,3)}return this.addToNumericResult(O,z,D,16),-1},E.prototype.stateNumericDecimal=function(O,D){for(var z=D;D<O.length;){var I=O.charCodeAt(D);if(a(I))D+=1;else return this.addToNumericResult(O,z,D,10),this.emitNumericEntity(I,2)}return this.addToNumericResult(O,z,D,10),-1},E.prototype.emitNumericEntity=function(O,D){var z;if(this.consumed<=D)return(z=this.errors)===null||z===void 0||z.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(O===c.SEMI)this.consumed+=1;else if(this.decodeMode===g.Strict)return 0;return this.emitCodePoint((0,l.replaceCodePoint)(this.result),this.consumed),this.errors&&(O!==c.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed},E.prototype.stateNamedEntity=function(O,D){for(var z=this.decodeTree,I=z[this.treeIndex],K=(I&f.VALUE_LENGTH)>>14;D<O.length;D++,this.excess++){var G=O.charCodeAt(D);if(this.treeIndex=v(z,I,this.treeIndex+Math.max(1,K),G),this.treeIndex<0)return this.result===0||this.decodeMode===g.Attribute&&(K===0||b(G))?0:this.emitNotTerminatedNamedEntity();if(I=z[this.treeIndex],K=(I&f.VALUE_LENGTH)>>14,K!==0){if(G===c.SEMI)return this.emitNamedEntityData(this.treeIndex,K,this.consumed+this.excess);this.decodeMode!==g.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1},E.prototype.emitNotTerminatedNamedEntity=function(){var O,D=this,z=D.result,I=D.decodeTree,K=(I[z]&f.VALUE_LENGTH)>>14;return this.emitNamedEntityData(z,K,this.consumed),(O=this.errors)===null||O===void 0||O.missingSemicolonAfterCharacterReference(),this.consumed},E.prototype.emitNamedEntityData=function(O,D,z){var I=this.decodeTree;return this.emitCodePoint(D===1?I[O]&~f.VALUE_LENGTH:I[O+1],z),D===3&&this.emitCodePoint(I[O+2],z),z},E.prototype.end=function(){var O;switch(this.state){case w.NamedEntity:return this.result!==0&&(this.decodeMode!==g.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case w.NumericDecimal:return this.emitNumericEntity(0,2);case w.NumericHex:return this.emitNumericEntity(0,3);case w.NumericStart:return(O=this.errors)===null||O===void 0||O.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case w.EntityStart:return 0}},E})();t.EntityDecoder=x;function _(E){var O="",D=new x(E,function(z){return O+=(0,l.fromCodePoint)(z)});return function(I,K){for(var G=0,Z=0;(Z=I.indexOf("&",Z))>=0;){O+=I.slice(G,Z),D.startEntity(K);var se=D.write(I,Z+1);if(se<0){G=Z+D.end();break}G=Z+se,Z=se===0?G+1:G}var ge=O+I.slice(G);return O="",ge}}function v(E,O,D,z){var I=(O&f.BRANCH_LENGTH)>>7,K=O&f.JUMP_TABLE;if(I===0)return K!==0&&z===K?D:-1;if(K){var G=z-K;return G<0||G>=I?-1:E[D+G]-1}for(var Z=D,se=Z+I-1;Z<=se;){var ge=Z+se>>>1,Tt=E[ge];if(Tt<z)Z=ge+1;else if(Tt>z)se=ge-1;else return E[ge+I]}return-1}t.determineBranch=v;var y=_(n.default),S=_(o.default);function C(E,O){return O===void 0&&(O=g.Legacy),y(E,O)}t.decodeHTML=C;function A(E){return y(E,g.Attribute)}t.decodeHTMLAttribute=A;function T(E){return y(E,g.Strict)}t.decodeHTMLStrict=T;function $(E){return S(E,g.Strict)}t.decodeXML=$})(mt)),mt}var Eu;function Ch(){return Eu||(Eu=1,(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.QuoteType=void 0;var e=dn(),i;(function(a){a[a.Tab=9]="Tab",a[a.NewLine=10]="NewLine",a[a.FormFeed=12]="FormFeed",a[a.CarriageReturn=13]="CarriageReturn",a[a.Space=32]="Space",a[a.ExclamationMark=33]="ExclamationMark",a[a.Number=35]="Number",a[a.Amp=38]="Amp",a[a.SingleQuote=39]="SingleQuote",a[a.DoubleQuote=34]="DoubleQuote",a[a.Dash=45]="Dash",a[a.Slash=47]="Slash",a[a.Zero=48]="Zero",a[a.Nine=57]="Nine",a[a.Semi=59]="Semi",a[a.Lt=60]="Lt",a[a.Eq=61]="Eq",a[a.Gt=62]="Gt",a[a.Questionmark=63]="Questionmark",a[a.UpperA=65]="UpperA",a[a.LowerA=97]="LowerA",a[a.UpperF=70]="UpperF",a[a.LowerF=102]="LowerF",a[a.UpperZ=90]="UpperZ",a[a.LowerZ=122]="LowerZ",a[a.LowerX=120]="LowerX",a[a.OpeningSquareBracket=91]="OpeningSquareBracket"})(i||(i={}));var r;(function(a){a[a.Text=1]="Text",a[a.BeforeTagName=2]="BeforeTagName",a[a.InTagName=3]="InTagName",a[a.InSelfClosingTag=4]="InSelfClosingTag",a[a.BeforeClosingTagName=5]="BeforeClosingTagName",a[a.InClosingTagName=6]="InClosingTagName",a[a.AfterClosingTagName=7]="AfterClosingTagName",a[a.BeforeAttributeName=8]="BeforeAttributeName",a[a.InAttributeName=9]="InAttributeName",a[a.AfterAttributeName=10]="AfterAttributeName",a[a.BeforeAttributeValue=11]="BeforeAttributeValue",a[a.InAttributeValueDq=12]="InAttributeValueDq",a[a.InAttributeValueSq=13]="InAttributeValueSq",a[a.InAttributeValueNq=14]="InAttributeValueNq",a[a.BeforeDeclaration=15]="BeforeDeclaration",a[a.InDeclaration=16]="InDeclaration",a[a.InProcessingInstruction=17]="InProcessingInstruction",a[a.BeforeComment=18]="BeforeComment",a[a.CDATASequence=19]="CDATASequence",a[a.InSpecialComment=20]="InSpecialComment",a[a.InCommentLike=21]="InCommentLike",a[a.BeforeSpecialS=22]="BeforeSpecialS",a[a.SpecialStartSequence=23]="SpecialStartSequence",a[a.InSpecialTag=24]="InSpecialTag",a[a.BeforeEntity=25]="BeforeEntity",a[a.BeforeNumericEntity=26]="BeforeNumericEntity",a[a.InNamedEntity=27]="InNamedEntity",a[a.InNumericEntity=28]="InNumericEntity",a[a.InHexEntity=29]="InHexEntity"})(r||(r={}));function s(a){return a===i.Space||a===i.NewLine||a===i.Tab||a===i.FormFeed||a===i.CarriageReturn}function n(a){return a===i.Slash||a===i.Gt||s(a)}function o(a){return a>=i.Zero&&a<=i.Nine}function l(a){return a>=i.LowerA&&a<=i.LowerZ||a>=i.UpperA&&a<=i.UpperZ}function u(a){return a>=i.UpperA&&a<=i.UpperF||a>=i.LowerA&&a<=i.LowerF}var c;(function(a){a[a.NoValue=0]="NoValue",a[a.Unquoted=1]="Unquoted",a[a.Single=2]="Single",a[a.Double=3]="Double"})(c=t.QuoteType||(t.QuoteType={}));var h={Cdata:new Uint8Array([67,68,65,84,65,91]),CdataEnd:new Uint8Array([93,93,62]),CommentEnd:new Uint8Array([45,45,62]),ScriptEnd:new Uint8Array([60,47,115,99,114,105,112,116]),StyleEnd:new Uint8Array([60,47,115,116,121,108,101]),TitleEnd:new Uint8Array([60,47,116,105,116,108,101])},f=(function(){function a(d,p){var b=d.xmlMode,w=b===void 0?!1:b,g=d.decodeEntities,x=g===void 0?!0:g;this.cbs=p,this.state=r.Text,this.buffer="",this.sectionStart=0,this.index=0,this.baseState=r.Text,this.isSpecial=!1,this.running=!0,this.offset=0,this.currentSequence=void 0,this.sequenceIndex=0,this.trieIndex=0,this.trieCurrent=0,this.entityResult=0,this.entityExcess=0,this.xmlMode=w,this.decodeEntities=x,this.entityTrie=w?e.xmlDecodeTree:e.htmlDecodeTree}return a.prototype.reset=function(){this.state=r.Text,this.buffer="",this.sectionStart=0,this.index=0,this.baseState=r.Text,this.currentSequence=void 0,this.running=!0,this.offset=0},a.prototype.write=function(d){this.offset+=this.buffer.length,this.buffer=d,this.parse()},a.prototype.end=function(){this.running&&this.finish()},a.prototype.pause=function(){this.running=!1},a.prototype.resume=function(){this.running=!0,this.index<this.buffer.length+this.offset&&this.parse()},a.prototype.getIndex=function(){return this.index},a.prototype.getSectionStart=function(){return this.sectionStart},a.prototype.stateText=function(d){d===i.Lt||!this.decodeEntities&&this.fastForwardTo(i.Lt)?(this.index>this.sectionStart&&this.cbs.ontext(this.sectionStart,this.index),this.state=r.BeforeTagName,this.sectionStart=this.index):this.decodeEntities&&d===i.Amp&&(this.state=r.BeforeEntity)},a.prototype.stateSpecialStartSequence=function(d){var p=this.sequenceIndex===this.currentSequence.length,b=p?n(d):(d|32)===this.currentSequence[this.sequenceIndex];if(!b)this.isSpecial=!1;else if(!p){this.sequenceIndex++;return}this.sequenceIndex=0,this.state=r.InTagName,this.stateInTagName(d)},a.prototype.stateInSpecialTag=function(d){if(this.sequenceIndex===this.currentSequence.length){if(d===i.Gt||s(d)){var p=this.index-this.currentSequence.length;if(this.sectionStart<p){var b=this.index;this.index=p,this.cbs.ontext(this.sectionStart,p),this.index=b}this.isSpecial=!1,this.sectionStart=p+2,this.stateInClosingTagName(d);return}this.sequenceIndex=0}(d|32)===this.currentSequence[this.sequenceIndex]?this.sequenceIndex+=1:this.sequenceIndex===0?this.currentSequence===h.TitleEnd?this.decodeEntities&&d===i.Amp&&(this.state=r.BeforeEntity):this.fastForwardTo(i.Lt)&&(this.sequenceIndex=1):this.sequenceIndex=+(d===i.Lt)},a.prototype.stateCDATASequence=function(d){d===h.Cdata[this.sequenceIndex]?++this.sequenceIndex===h.Cdata.length&&(this.state=r.InCommentLike,this.currentSequence=h.CdataEnd,this.sequenceIndex=0,this.sectionStart=this.index+1):(this.sequenceIndex=0,this.state=r.InDeclaration,this.stateInDeclaration(d))},a.prototype.fastForwardTo=function(d){for(;++this.index<this.buffer.length+this.offset;)if(this.buffer.charCodeAt(this.index-this.offset)===d)return!0;return this.index=this.buffer.length+this.offset-1,!1},a.prototype.stateInCommentLike=function(d){d===this.currentSequence[this.sequenceIndex]?++this.sequenceIndex===this.currentSequence.length&&(this.currentSequence===h.CdataEnd?this.cbs.oncdata(this.sectionStart,this.index,2):this.cbs.oncomment(this.sectionStart,this.index,2),this.sequenceIndex=0,this.sectionStart=this.index+1,this.state=r.Text):this.sequenceIndex===0?this.fastForwardTo(this.currentSequence[0])&&(this.sequenceIndex=1):d!==this.currentSequence[this.sequenceIndex-1]&&(this.sequenceIndex=0)},a.prototype.isTagStartChar=function(d){return this.xmlMode?!n(d):l(d)},a.prototype.startSpecial=function(d,p){this.isSpecial=!0,this.currentSequence=d,this.sequenceIndex=p,this.state=r.SpecialStartSequence},a.prototype.stateBeforeTagName=function(d){if(d===i.ExclamationMark)this.state=r.BeforeDeclaration,this.sectionStart=this.index+1;else if(d===i.Questionmark)this.state=r.InProcessingInstruction,this.sectionStart=this.index+1;else if(this.isTagStartChar(d)){var p=d|32;this.sectionStart=this.index,!this.xmlMode&&p===h.TitleEnd[2]?this.startSpecial(h.TitleEnd,3):this.state=!this.xmlMode&&p===h.ScriptEnd[2]?r.BeforeSpecialS:r.InTagName}else d===i.Slash?this.state=r.BeforeClosingTagName:(this.state=r.Text,this.stateText(d))},a.prototype.stateInTagName=function(d){n(d)&&(this.cbs.onopentagname(this.sectionStart,this.index),this.sectionStart=-1,this.state=r.BeforeAttributeName,this.stateBeforeAttributeName(d))},a.prototype.stateBeforeClosingTagName=function(d){s(d)||(d===i.Gt?this.state=r.Text:(this.state=this.isTagStartChar(d)?r.InClosingTagName:r.InSpecialComment,this.sectionStart=this.index))},a.prototype.stateInClosingTagName=function(d){(d===i.Gt||s(d))&&(this.cbs.onclosetag(this.sectionStart,this.index),this.sectionStart=-1,this.state=r.AfterClosingTagName,this.stateAfterClosingTagName(d))},a.prototype.stateAfterClosingTagName=function(d){(d===i.Gt||this.fastForwardTo(i.Gt))&&(this.state=r.Text,this.baseState=r.Text,this.sectionStart=this.index+1)},a.prototype.stateBeforeAttributeName=function(d){d===i.Gt?(this.cbs.onopentagend(this.index),this.isSpecial?(this.state=r.InSpecialTag,this.sequenceIndex=0):this.state=r.Text,this.baseState=this.state,this.sectionStart=this.index+1):d===i.Slash?this.state=r.InSelfClosingTag:s(d)||(this.state=r.InAttributeName,this.sectionStart=this.index)},a.prototype.stateInSelfClosingTag=function(d){d===i.Gt?(this.cbs.onselfclosingtag(this.index),this.state=r.Text,this.baseState=r.Text,this.sectionStart=this.index+1,this.isSpecial=!1):s(d)||(this.state=r.BeforeAttributeName,this.stateBeforeAttributeName(d))},a.prototype.stateInAttributeName=function(d){(d===i.Eq||n(d))&&(this.cbs.onattribname(this.sectionStart,this.index),this.sectionStart=-1,this.state=r.AfterAttributeName,this.stateAfterAttributeName(d))},a.prototype.stateAfterAttributeName=function(d){d===i.Eq?this.state=r.BeforeAttributeValue:d===i.Slash||d===i.Gt?(this.cbs.onattribend(c.NoValue,this.index),this.state=r.BeforeAttributeName,this.stateBeforeAttributeName(d)):s(d)||(this.cbs.onattribend(c.NoValue,this.index),this.state=r.InAttributeName,this.sectionStart=this.index)},a.prototype.stateBeforeAttributeValue=function(d){d===i.DoubleQuote?(this.state=r.InAttributeValueDq,this.sectionStart=this.index+1):d===i.SingleQuote?(this.state=r.InAttributeValueSq,this.sectionStart=this.index+1):s(d)||(this.sectionStart=this.index,this.state=r.InAttributeValueNq,this.stateInAttributeValueNoQuotes(d))},a.prototype.handleInAttributeValue=function(d,p){d===p||!this.decodeEntities&&this.fastForwardTo(p)?(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(p===i.DoubleQuote?c.Double:c.Single,this.index),this.state=r.BeforeAttributeName):this.decodeEntities&&d===i.Amp&&(this.baseState=this.state,this.state=r.BeforeEntity)},a.prototype.stateInAttributeValueDoubleQuotes=function(d){this.handleInAttributeValue(d,i.DoubleQuote)},a.prototype.stateInAttributeValueSingleQuotes=function(d){this.handleInAttributeValue(d,i.SingleQuote)},a.prototype.stateInAttributeValueNoQuotes=function(d){s(d)||d===i.Gt?(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(c.Unquoted,this.index),this.state=r.BeforeAttributeName,this.stateBeforeAttributeName(d)):this.decodeEntities&&d===i.Amp&&(this.baseState=this.state,this.state=r.BeforeEntity)},a.prototype.stateBeforeDeclaration=function(d){d===i.OpeningSquareBracket?(this.state=r.CDATASequence,this.sequenceIndex=0):this.state=d===i.Dash?r.BeforeComment:r.InDeclaration},a.prototype.stateInDeclaration=function(d){(d===i.Gt||this.fastForwardTo(i.Gt))&&(this.cbs.ondeclaration(this.sectionStart,this.index),this.state=r.Text,this.sectionStart=this.index+1)},a.prototype.stateInProcessingInstruction=function(d){(d===i.Gt||this.fastForwardTo(i.Gt))&&(this.cbs.onprocessinginstruction(this.sectionStart,this.index),this.state=r.Text,this.sectionStart=this.index+1)},a.prototype.stateBeforeComment=function(d){d===i.Dash?(this.state=r.InCommentLike,this.currentSequence=h.CommentEnd,this.sequenceIndex=2,this.sectionStart=this.index+1):this.state=r.InDeclaration},a.prototype.stateInSpecialComment=function(d){(d===i.Gt||this.fastForwardTo(i.Gt))&&(this.cbs.oncomment(this.sectionStart,this.index,0),this.state=r.Text,this.sectionStart=this.index+1)},a.prototype.stateBeforeSpecialS=function(d){var p=d|32;p===h.ScriptEnd[3]?this.startSpecial(h.ScriptEnd,4):p===h.StyleEnd[3]?this.startSpecial(h.StyleEnd,4):(this.state=r.InTagName,this.stateInTagName(d))},a.prototype.stateBeforeEntity=function(d){this.entityExcess=1,this.entityResult=0,d===i.Number?this.state=r.BeforeNumericEntity:d===i.Amp||(this.trieIndex=0,this.trieCurrent=this.entityTrie[0],this.state=r.InNamedEntity,this.stateInNamedEntity(d))},a.prototype.stateInNamedEntity=function(d){if(this.entityExcess+=1,this.trieIndex=(0,e.determineBranch)(this.entityTrie,this.trieCurrent,this.trieIndex+1,d),this.trieIndex<0){this.emitNamedEntity(),this.index--;return}this.trieCurrent=this.entityTrie[this.trieIndex];var p=this.trieCurrent&e.BinTrieFlags.VALUE_LENGTH;if(p){var b=(p>>14)-1;if(!this.allowLegacyEntity()&&d!==i.Semi)this.trieIndex+=b;else{var w=this.index-this.entityExcess+1;w>this.sectionStart&&this.emitPartial(this.sectionStart,w),this.entityResult=this.trieIndex,this.trieIndex+=b,this.entityExcess=0,this.sectionStart=this.index+1,b===0&&this.emitNamedEntity()}}},a.prototype.emitNamedEntity=function(){if(this.state=this.baseState,this.entityResult!==0){var d=(this.entityTrie[this.entityResult]&e.BinTrieFlags.VALUE_LENGTH)>>14;switch(d){case 1:{this.emitCodePoint(this.entityTrie[this.entityResult]&~e.BinTrieFlags.VALUE_LENGTH);break}case 2:{this.emitCodePoint(this.entityTrie[this.entityResult+1]);break}case 3:this.emitCodePoint(this.entityTrie[this.entityResult+1]),this.emitCodePoint(this.entityTrie[this.entityResult+2])}}},a.prototype.stateBeforeNumericEntity=function(d){(d|32)===i.LowerX?(this.entityExcess++,this.state=r.InHexEntity):(this.state=r.InNumericEntity,this.stateInNumericEntity(d))},a.prototype.emitNumericEntity=function(d){var p=this.index-this.entityExcess-1,b=p+2+ +(this.state===r.InHexEntity);b!==this.index&&(p>this.sectionStart&&this.emitPartial(this.sectionStart,p),this.sectionStart=this.index+Number(d),this.emitCodePoint((0,e.replaceCodePoint)(this.entityResult))),this.state=this.baseState},a.prototype.stateInNumericEntity=function(d){d===i.Semi?this.emitNumericEntity(!0):o(d)?(this.entityResult=this.entityResult*10+(d-i.Zero),this.entityExcess++):(this.allowLegacyEntity()?this.emitNumericEntity(!1):this.state=this.baseState,this.index--)},a.prototype.stateInHexEntity=function(d){d===i.Semi?this.emitNumericEntity(!0):o(d)?(this.entityResult=this.entityResult*16+(d-i.Zero),this.entityExcess++):u(d)?(this.entityResult=this.entityResult*16+((d|32)-i.LowerA+10),this.entityExcess++):(this.allowLegacyEntity()?this.emitNumericEntity(!1):this.state=this.baseState,this.index--)},a.prototype.allowLegacyEntity=function(){return!this.xmlMode&&(this.baseState===r.Text||this.baseState===r.InSpecialTag)},a.prototype.cleanup=function(){this.running&&this.sectionStart!==this.index&&(this.state===r.Text||this.state===r.InSpecialTag&&this.sequenceIndex===0?(this.cbs.ontext(this.sectionStart,this.index),this.sectionStart=this.index):(this.state===r.InAttributeValueDq||this.state===r.InAttributeValueSq||this.state===r.InAttributeValueNq)&&(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=this.index))},a.prototype.shouldContinue=function(){return this.index<this.buffer.length+this.offset&&this.running},a.prototype.parse=function(){for(;this.shouldContinue();){var d=this.buffer.charCodeAt(this.index-this.offset);switch(this.state){case r.Text:{this.stateText(d);break}case r.SpecialStartSequence:{this.stateSpecialStartSequence(d);break}case r.InSpecialTag:{this.stateInSpecialTag(d);break}case r.CDATASequence:{this.stateCDATASequence(d);break}case r.InAttributeValueDq:{this.stateInAttributeValueDoubleQuotes(d);break}case r.InAttributeName:{this.stateInAttributeName(d);break}case r.InCommentLike:{this.stateInCommentLike(d);break}case r.InSpecialComment:{this.stateInSpecialComment(d);break}case r.BeforeAttributeName:{this.stateBeforeAttributeName(d);break}case r.InTagName:{this.stateInTagName(d);break}case r.InClosingTagName:{this.stateInClosingTagName(d);break}case r.BeforeTagName:{this.stateBeforeTagName(d);break}case r.AfterAttributeName:{this.stateAfterAttributeName(d);break}case r.InAttributeValueSq:{this.stateInAttributeValueSingleQuotes(d);break}case r.BeforeAttributeValue:{this.stateBeforeAttributeValue(d);break}case r.BeforeClosingTagName:{this.stateBeforeClosingTagName(d);break}case r.AfterClosingTagName:{this.stateAfterClosingTagName(d);break}case r.BeforeSpecialS:{this.stateBeforeSpecialS(d);break}case r.InAttributeValueNq:{this.stateInAttributeValueNoQuotes(d);break}case r.InSelfClosingTag:{this.stateInSelfClosingTag(d);break}case r.InDeclaration:{this.stateInDeclaration(d);break}case r.BeforeDeclaration:{this.stateBeforeDeclaration(d);break}case r.BeforeComment:{this.stateBeforeComment(d);break}case r.InProcessingInstruction:{this.stateInProcessingInstruction(d);break}case r.InNamedEntity:{this.stateInNamedEntity(d);break}case r.BeforeEntity:{this.stateBeforeEntity(d);break}case r.InHexEntity:{this.stateInHexEntity(d);break}case r.InNumericEntity:{this.stateInNumericEntity(d);break}default:this.stateBeforeNumericEntity(d)}this.index++}this.cleanup()},a.prototype.finish=function(){this.state===r.InNamedEntity&&this.emitNamedEntity(),this.sectionStart<this.index&&this.handleTrailingData(),this.cbs.onend()},a.prototype.handleTrailingData=function(){var d=this.buffer.length+this.offset;this.state===r.InCommentLike?this.currentSequence===h.CdataEnd?this.cbs.oncdata(this.sectionStart,d,0):this.cbs.oncomment(this.sectionStart,d,0):this.state===r.InNumericEntity&&this.allowLegacyEntity()?this.emitNumericEntity(!1):this.state===r.InHexEntity&&this.allowLegacyEntity()?this.emitNumericEntity(!1):this.state===r.InTagName||this.state===r.BeforeAttributeName||this.state===r.BeforeAttributeValue||this.state===r.AfterAttributeName||this.state===r.InAttributeName||this.state===r.InAttributeValueSq||this.state===r.InAttributeValueDq||this.state===r.InAttributeValueNq||this.state===r.InClosingTagName||this.cbs.ontext(this.sectionStart,d)},a.prototype.emitPartial=function(d,p){this.baseState!==r.Text&&this.baseState!==r.InSpecialTag?this.cbs.onattribdata(d,p):this.cbs.ontext(d,p)},a.prototype.emitCodePoint=function(d){this.baseState!==r.Text&&this.baseState!==r.InSpecialTag?this.cbs.onattribentity(d):this.cbs.ontextentity(d)},a})();t.default=f})(bo)),bo}var Tu;function Ou(){if(Tu)return pt;Tu=1;var t=pt&&pt.__createBinding||(Object.create?(function(w,g,x,_){_===void 0&&(_=x);var v=Object.getOwnPropertyDescriptor(g,x);(!v||("get"in v?!g.__esModule:v.writable||v.configurable))&&(v={enumerable:!0,get:function(){return g[x]}}),Object.defineProperty(w,_,v)}):(function(w,g,x,_){_===void 0&&(_=x),w[_]=g[x]})),e=pt&&pt.__setModuleDefault||(Object.create?(function(w,g){Object.defineProperty(w,"default",{enumerable:!0,value:g})}):function(w,g){w.default=g}),i=pt&&pt.__importStar||function(w){if(w&&w.__esModule)return w;var g={};if(w!=null)for(var x in w)x!=="default"&&Object.prototype.hasOwnProperty.call(w,x)&&t(g,w,x);return e(g,w),g};Object.defineProperty(pt,"__esModule",{value:!0}),pt.Parser=void 0;var r=i(Ch()),s=dn(),n=new Set(["input","option","optgroup","select","button","datalist","textarea"]),o=new Set(["p"]),l=new Set(["thead","tbody"]),u=new Set(["dd","dt"]),c=new Set(["rt","rp"]),h=new Map([["tr",new Set(["tr","th","td"])],["th",new Set(["th"])],["td",new Set(["thead","th","td"])],["body",new Set(["head","link","script"])],["li",new Set(["li"])],["p",o],["h1",o],["h2",o],["h3",o],["h4",o],["h5",o],["h6",o],["select",n],["input",n],["output",n],["button",n],["datalist",n],["textarea",n],["option",new Set(["option"])],["optgroup",new Set(["optgroup","option"])],["dd",u],["dt",u],["address",o],["article",o],["aside",o],["blockquote",o],["details",o],["div",o],["dl",o],["fieldset",o],["figcaption",o],["figure",o],["footer",o],["form",o],["header",o],["hr",o],["main",o],["nav",o],["ol",o],["pre",o],["section",o],["table",o],["ul",o],["rt",c],["rp",c],["tbody",l],["tfoot",l]]),f=new Set(["area","base","basefont","br","col","command","embed","frame","hr","img","input","isindex","keygen","link","meta","param","source","track","wbr"]),a=new Set(["math","svg"]),d=new Set(["mi","mo","mn","ms","mtext","annotation-xml","foreignobject","desc","title"]),p=/\s|\//,b=(function(){function w(g,x){x===void 0&&(x={});var _,v,y,S,C;this.options=x,this.startIndex=0,this.endIndex=0,this.openTagStart=0,this.tagname="",this.attribname="",this.attribvalue="",this.attribs=null,this.stack=[],this.foreignContext=[],this.buffers=[],this.bufferOffset=0,this.writeIndex=0,this.ended=!1,this.cbs=g??{},this.lowerCaseTagNames=(_=x.lowerCaseTags)!==null&&_!==void 0?_:!x.xmlMode,this.lowerCaseAttributeNames=(v=x.lowerCaseAttributeNames)!==null&&v!==void 0?v:!x.xmlMode,this.tokenizer=new((y=x.Tokenizer)!==null&&y!==void 0?y:r.default)(this.options,this),(C=(S=this.cbs).onparserinit)===null||C===void 0||C.call(S,this)}return w.prototype.ontext=function(g,x){var _,v,y=this.getSlice(g,x);this.endIndex=x-1,(v=(_=this.cbs).ontext)===null||v===void 0||v.call(_,y),this.startIndex=x},w.prototype.ontextentity=function(g){var x,_,v=this.tokenizer.getSectionStart();this.endIndex=v-1,(_=(x=this.cbs).ontext)===null||_===void 0||_.call(x,(0,s.fromCodePoint)(g)),this.startIndex=v},w.prototype.isVoidElement=function(g){return!this.options.xmlMode&&f.has(g)},w.prototype.onopentagname=function(g,x){this.endIndex=x;var _=this.getSlice(g,x);this.lowerCaseTagNames&&(_=_.toLowerCase()),this.emitOpenTag(_)},w.prototype.emitOpenTag=function(g){var x,_,v,y;this.openTagStart=this.startIndex,this.tagname=g;var S=!this.options.xmlMode&&h.get(g);if(S)for(;this.stack.length>0&&S.has(this.stack[this.stack.length-1]);){var C=this.stack.pop();(_=(x=this.cbs).onclosetag)===null||_===void 0||_.call(x,C,!0)}this.isVoidElement(g)||(this.stack.push(g),a.has(g)?this.foreignContext.push(!0):d.has(g)&&this.foreignContext.push(!1)),(y=(v=this.cbs).onopentagname)===null||y===void 0||y.call(v,g),this.cbs.onopentag&&(this.attribs={})},w.prototype.endOpenTag=function(g){var x,_;this.startIndex=this.openTagStart,this.attribs&&((_=(x=this.cbs).onopentag)===null||_===void 0||_.call(x,this.tagname,this.attribs,g),this.attribs=null),this.cbs.onclosetag&&this.isVoidElement(this.tagname)&&this.cbs.onclosetag(this.tagname,!0),this.tagname=""},w.prototype.onopentagend=function(g){this.endIndex=g,this.endOpenTag(!1),this.startIndex=g+1},w.prototype.onclosetag=function(g,x){var _,v,y,S,C,A;this.endIndex=x;var T=this.getSlice(g,x);if(this.lowerCaseTagNames&&(T=T.toLowerCase()),(a.has(T)||d.has(T))&&this.foreignContext.pop(),this.isVoidElement(T))!this.options.xmlMode&&T==="br"&&((v=(_=this.cbs).onopentagname)===null||v===void 0||v.call(_,"br"),(S=(y=this.cbs).onopentag)===null||S===void 0||S.call(y,"br",{},!0),(A=(C=this.cbs).onclosetag)===null||A===void 0||A.call(C,"br",!1));else{var $=this.stack.lastIndexOf(T);if($!==-1)if(this.cbs.onclosetag)for(var E=this.stack.length-$;E--;)this.cbs.onclosetag(this.stack.pop(),E!==0);else this.stack.length=$;else!this.options.xmlMode&&T==="p"&&(this.emitOpenTag("p"),this.closeCurrentTag(!0))}this.startIndex=x+1},w.prototype.onselfclosingtag=function(g){this.endIndex=g,this.options.xmlMode||this.options.recognizeSelfClosing||this.foreignContext[this.foreignContext.length-1]?(this.closeCurrentTag(!1),this.startIndex=g+1):this.onopentagend(g)},w.prototype.closeCurrentTag=function(g){var x,_,v=this.tagname;this.endOpenTag(g),this.stack[this.stack.length-1]===v&&((_=(x=this.cbs).onclosetag)===null||_===void 0||_.call(x,v,!g),this.stack.pop())},w.prototype.onattribname=function(g,x){this.startIndex=g;var _=this.getSlice(g,x);this.attribname=this.lowerCaseAttributeNames?_.toLowerCase():_},w.prototype.onattribdata=function(g,x){this.attribvalue+=this.getSlice(g,x)},w.prototype.onattribentity=function(g){this.attribvalue+=(0,s.fromCodePoint)(g)},w.prototype.onattribend=function(g,x){var _,v;this.endIndex=x,(v=(_=this.cbs).onattribute)===null||v===void 0||v.call(_,this.attribname,this.attribvalue,g===r.QuoteType.Double?'"':g===r.QuoteType.Single?"'":g===r.QuoteType.NoValue?void 0:null),this.attribs&&!Object.prototype.hasOwnProperty.call(this.attribs,this.attribname)&&(this.attribs[this.attribname]=this.attribvalue),this.attribvalue=""},w.prototype.getInstructionName=function(g){var x=g.search(p),_=x<0?g:g.substr(0,x);return this.lowerCaseTagNames&&(_=_.toLowerCase()),_},w.prototype.ondeclaration=function(g,x){this.endIndex=x;var _=this.getSlice(g,x);if(this.cbs.onprocessinginstruction){var v=this.getInstructionName(_);this.cbs.onprocessinginstruction("!".concat(v),"!".concat(_))}this.startIndex=x+1},w.prototype.onprocessinginstruction=function(g,x){this.endIndex=x;var _=this.getSlice(g,x);if(this.cbs.onprocessinginstruction){var v=this.getInstructionName(_);this.cbs.onprocessinginstruction("?".concat(v),"?".concat(_))}this.startIndex=x+1},w.prototype.oncomment=function(g,x,_){var v,y,S,C;this.endIndex=x,(y=(v=this.cbs).oncomment)===null||y===void 0||y.call(v,this.getSlice(g,x-_)),(C=(S=this.cbs).oncommentend)===null||C===void 0||C.call(S),this.startIndex=x+1},w.prototype.oncdata=function(g,x,_){var v,y,S,C,A,T,$,E,O,D;this.endIndex=x;var z=this.getSlice(g,x-_);this.options.xmlMode||this.options.recognizeCDATA?((y=(v=this.cbs).oncdatastart)===null||y===void 0||y.call(v),(C=(S=this.cbs).ontext)===null||C===void 0||C.call(S,z),(T=(A=this.cbs).oncdataend)===null||T===void 0||T.call(A)):((E=($=this.cbs).oncomment)===null||E===void 0||E.call($,"[CDATA[".concat(z,"]]")),(D=(O=this.cbs).oncommentend)===null||D===void 0||D.call(O)),this.startIndex=x+1},w.prototype.onend=function(){var g,x;if(this.cbs.onclosetag){this.endIndex=this.startIndex;for(var _=this.stack.length;_>0;this.cbs.onclosetag(this.stack[--_],!0));}(x=(g=this.cbs).onend)===null||x===void 0||x.call(g)},w.prototype.reset=function(){var g,x,_,v;(x=(g=this.cbs).onreset)===null||x===void 0||x.call(g),this.tokenizer.reset(),this.tagname="",this.attribname="",this.attribs=null,this.stack.length=0,this.startIndex=0,this.endIndex=0,(v=(_=this.cbs).onparserinit)===null||v===void 0||v.call(_,this),this.buffers.length=0,this.bufferOffset=0,this.writeIndex=0,this.ended=!1},w.prototype.parseComplete=function(g){this.reset(),this.end(g)},w.prototype.getSlice=function(g,x){for(;g-this.bufferOffset>=this.buffers[0].length;)this.shiftBuffer();for(var _=this.buffers[0].slice(g-this.bufferOffset,x-this.bufferOffset);x-this.bufferOffset>this.buffers[0].length;)this.shiftBuffer(),_+=this.buffers[0].slice(0,x-this.bufferOffset);return _},w.prototype.shiftBuffer=function(){this.bufferOffset+=this.buffers[0].length,this.writeIndex--,this.buffers.shift()},w.prototype.write=function(g){var x,_;if(this.ended){(_=(x=this.cbs).onerror)===null||_===void 0||_.call(x,new Error(".write() after done!"));return}this.buffers.push(g),this.tokenizer.running&&(this.tokenizer.write(g),this.writeIndex++)},w.prototype.end=function(g){var x,_;if(this.ended){(_=(x=this.cbs).onerror)===null||_===void 0||_.call(x,new Error(".end() after done!"));return}g&&this.write(g),this.ended=!0,this.tokenizer.end()},w.prototype.pause=function(){this.tokenizer.pause()},w.prototype.resume=function(){for(this.tokenizer.resume();this.tokenizer.running&&this.writeIndex<this.buffers.length;)this.tokenizer.write(this.buffers[this.writeIndex++]);this.ended&&this.tokenizer.end()},w.prototype.parseChunk=function(g){this.write(g)},w.prototype.done=function(g){this.end(g)},w})();return pt.Parser=b,pt}var pi={},yo={},$u;function ms(){return $u||($u=1,(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.Doctype=t.CDATA=t.Tag=t.Style=t.Script=t.Comment=t.Directive=t.Text=t.Root=t.isTag=t.ElementType=void 0;var e;(function(r){r.Root="root",r.Text="text",r.Directive="directive",r.Comment="comment",r.Script="script",r.Style="style",r.Tag="tag",r.CDATA="cdata",r.Doctype="doctype"})(e=t.ElementType||(t.ElementType={}));function i(r){return r.type===e.Tag||r.type===e.Script||r.type===e.Style}t.isTag=i,t.Root=e.Root,t.Text=e.Text,t.Directive=e.Directive,t.Comment=e.Comment,t.Script=e.Script,t.Style=e.Style,t.Tag=e.Tag,t.CDATA=e.CDATA,t.Doctype=e.Doctype})(yo)),yo}var J={},Iu;function Lu(){if(Iu)return J;Iu=1;var t=J&&J.__extends||(function(){var y=function(S,C){return y=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(A,T){A.__proto__=T}||function(A,T){for(var $ in T)Object.prototype.hasOwnProperty.call(T,$)&&(A[$]=T[$])},y(S,C)};return function(S,C){if(typeof C!="function"&&C!==null)throw new TypeError("Class extends value "+String(C)+" is not a constructor or null");y(S,C);function A(){this.constructor=S}S.prototype=C===null?Object.create(C):(A.prototype=C.prototype,new A)}})(),e=J&&J.__assign||function(){return e=Object.assign||function(y){for(var S,C=1,A=arguments.length;C<A;C++){S=arguments[C];for(var T in S)Object.prototype.hasOwnProperty.call(S,T)&&(y[T]=S[T])}return y},e.apply(this,arguments)};Object.defineProperty(J,"__esModule",{value:!0}),J.cloneNode=J.hasChildren=J.isDocument=J.isDirective=J.isComment=J.isText=J.isCDATA=J.isTag=J.Element=J.Document=J.CDATA=J.NodeWithChildren=J.ProcessingInstruction=J.Comment=J.Text=J.DataNode=J.Node=void 0;var i=ms(),r=(function(){function y(){this.parent=null,this.prev=null,this.next=null,this.startIndex=null,this.endIndex=null}return Object.defineProperty(y.prototype,"parentNode",{get:function(){return this.parent},set:function(S){this.parent=S},enumerable:!1,configurable:!0}),Object.defineProperty(y.prototype,"previousSibling",{get:function(){return this.prev},set:function(S){this.prev=S},enumerable:!1,configurable:!0}),Object.defineProperty(y.prototype,"nextSibling",{get:function(){return this.next},set:function(S){this.next=S},enumerable:!1,configurable:!0}),y.prototype.cloneNode=function(S){return S===void 0&&(S=!1),_(this,S)},y})();J.Node=r;var s=(function(y){t(S,y);function S(C){var A=y.call(this)||this;return A.data=C,A}return Object.defineProperty(S.prototype,"nodeValue",{get:function(){return this.data},set:function(C){this.data=C},enumerable:!1,configurable:!0}),S})(r);J.DataNode=s;var n=(function(y){t(S,y);function S(){var C=y!==null&&y.apply(this,arguments)||this;return C.type=i.ElementType.Text,C}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 3},enumerable:!1,configurable:!0}),S})(s);J.Text=n;var o=(function(y){t(S,y);function S(){var C=y!==null&&y.apply(this,arguments)||this;return C.type=i.ElementType.Comment,C}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 8},enumerable:!1,configurable:!0}),S})(s);J.Comment=o;var l=(function(y){t(S,y);function S(C,A){var T=y.call(this,A)||this;return T.name=C,T.type=i.ElementType.Directive,T}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 1},enumerable:!1,configurable:!0}),S})(s);J.ProcessingInstruction=l;var u=(function(y){t(S,y);function S(C){var A=y.call(this)||this;return A.children=C,A}return Object.defineProperty(S.prototype,"firstChild",{get:function(){var C;return(C=this.children[0])!==null&&C!==void 0?C:null},enumerable:!1,configurable:!0}),Object.defineProperty(S.prototype,"lastChild",{get:function(){return this.children.length>0?this.children[this.children.length-1]:null},enumerable:!1,configurable:!0}),Object.defineProperty(S.prototype,"childNodes",{get:function(){return this.children},set:function(C){this.children=C},enumerable:!1,configurable:!0}),S})(r);J.NodeWithChildren=u;var c=(function(y){t(S,y);function S(){var C=y!==null&&y.apply(this,arguments)||this;return C.type=i.ElementType.CDATA,C}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 4},enumerable:!1,configurable:!0}),S})(u);J.CDATA=c;var h=(function(y){t(S,y);function S(){var C=y!==null&&y.apply(this,arguments)||this;return C.type=i.ElementType.Root,C}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 9},enumerable:!1,configurable:!0}),S})(u);J.Document=h;var f=(function(y){t(S,y);function S(C,A,T,$){T===void 0&&(T=[]),$===void 0&&($=C==="script"?i.ElementType.Script:C==="style"?i.ElementType.Style:i.ElementType.Tag);var E=y.call(this,T)||this;return E.name=C,E.attribs=A,E.type=$,E}return Object.defineProperty(S.prototype,"nodeType",{get:function(){return 1},enumerable:!1,configurable:!0}),Object.defineProperty(S.prototype,"tagName",{get:function(){return this.name},set:function(C){this.name=C},enumerable:!1,configurable:!0}),Object.defineProperty(S.prototype,"attributes",{get:function(){var C=this;return Object.keys(this.attribs).map(function(A){var T,$;return{name:A,value:C.attribs[A],namespace:(T=C["x-attribsNamespace"])===null||T===void 0?void 0:T[A],prefix:($=C["x-attribsPrefix"])===null||$===void 0?void 0:$[A]}})},enumerable:!1,configurable:!0}),S})(u);J.Element=f;function a(y){return(0,i.isTag)(y)}J.isTag=a;function d(y){return y.type===i.ElementType.CDATA}J.isCDATA=d;function p(y){return y.type===i.ElementType.Text}J.isText=p;function b(y){return y.type===i.ElementType.Comment}J.isComment=b;function w(y){return y.type===i.ElementType.Directive}J.isDirective=w;function g(y){return y.type===i.ElementType.Root}J.isDocument=g;function x(y){return Object.prototype.hasOwnProperty.call(y,"children")}J.hasChildren=x;function _(y,S){S===void 0&&(S=!1);var C;if(p(y))C=new n(y.data);else if(b(y))C=new o(y.data);else if(a(y)){var A=S?v(y.children):[],T=new f(y.name,e({},y.attribs),A);A.forEach(function(D){return D.parent=T}),y.namespace!=null&&(T.namespace=y.namespace),y["x-attribsNamespace"]&&(T["x-attribsNamespace"]=e({},y["x-attribsNamespace"])),y["x-attribsPrefix"]&&(T["x-attribsPrefix"]=e({},y["x-attribsPrefix"])),C=T}else if(d(y)){var A=S?v(y.children):[],$=new c(A);A.forEach(function(z){return z.parent=$}),C=$}else if(g(y)){var A=S?v(y.children):[],E=new h(A);A.forEach(function(z){return z.parent=E}),y["x-mode"]&&(E["x-mode"]=y["x-mode"]),C=E}else if(w(y)){var O=new l(y.name,y.data);y["x-name"]!=null&&(O["x-name"]=y["x-name"],O["x-publicId"]=y["x-publicId"],O["x-systemId"]=y["x-systemId"]),C=O}else throw new Error("Not implemented yet: ".concat(y.type));return C.startIndex=y.startIndex,C.endIndex=y.endIndex,y.sourceCodeLocation!=null&&(C.sourceCodeLocation=y.sourceCodeLocation),C}J.cloneNode=_;function v(y){for(var S=y.map(function(A){return _(A,!0)}),C=1;C<S.length;C++)S[C].prev=S[C-1],S[C-1].next=S[C];return S}return J}var Nu;function ai(){return Nu||(Nu=1,(function(t){var e=pi&&pi.__createBinding||(Object.create?(function(l,u,c,h){h===void 0&&(h=c);var f=Object.getOwnPropertyDescriptor(u,c);(!f||("get"in f?!u.__esModule:f.writable||f.configurable))&&(f={enumerable:!0,get:function(){return u[c]}}),Object.defineProperty(l,h,f)}):(function(l,u,c,h){h===void 0&&(h=c),l[h]=u[c]})),i=pi&&pi.__exportStar||function(l,u){for(var c in l)c!=="default"&&!Object.prototype.hasOwnProperty.call(u,c)&&e(u,l,c)};Object.defineProperty(t,"__esModule",{value:!0}),t.DomHandler=void 0;var r=ms(),s=Lu();i(Lu(),t);var n={withStartIndices:!1,withEndIndices:!1,xmlMode:!1},o=(function(){function l(u,c,h){this.dom=[],this.root=new s.Document(this.dom),this.done=!1,this.tagStack=[this.root],this.lastNode=null,this.parser=null,typeof c=="function"&&(h=c,c=n),typeof u=="object"&&(c=u,u=void 0),this.callback=u??null,this.options=c??n,this.elementCB=h??null}return l.prototype.onparserinit=function(u){this.parser=u},l.prototype.onreset=function(){this.dom=[],this.root=new s.Document(this.dom),this.done=!1,this.tagStack=[this.root],this.lastNode=null,this.parser=null},l.prototype.onend=function(){this.done||(this.done=!0,this.parser=null,this.handleCallback(null))},l.prototype.onerror=function(u){this.handleCallback(u)},l.prototype.onclosetag=function(){this.lastNode=null;var u=this.tagStack.pop();this.options.withEndIndices&&(u.endIndex=this.parser.endIndex),this.elementCB&&this.elementCB(u)},l.prototype.onopentag=function(u,c){var h=this.options.xmlMode?r.ElementType.Tag:void 0,f=new s.Element(u,c,void 0,h);this.addNode(f),this.tagStack.push(f)},l.prototype.ontext=function(u){var c=this.lastNode;if(c&&c.type===r.ElementType.Text)c.data+=u,this.options.withEndIndices&&(c.endIndex=this.parser.endIndex);else{var h=new s.Text(u);this.addNode(h),this.lastNode=h}},l.prototype.oncomment=function(u){if(this.lastNode&&this.lastNode.type===r.ElementType.Comment){this.lastNode.data+=u;return}var c=new s.Comment(u);this.addNode(c),this.lastNode=c},l.prototype.oncommentend=function(){this.lastNode=null},l.prototype.oncdatastart=function(){var u=new s.Text(""),c=new s.CDATA([u]);this.addNode(c),u.parent=c,this.lastNode=u},l.prototype.oncdataend=function(){this.lastNode=null},l.prototype.onprocessinginstruction=function(u,c){var h=new s.ProcessingInstruction(u,c);this.addNode(h)},l.prototype.handleCallback=function(u){if(typeof this.callback=="function")this.callback(u,this.dom);else if(u)throw u},l.prototype.addNode=function(u){var c=this.tagStack[this.tagStack.length-1],h=c.children[c.children.length-1];this.options.withStartIndices&&(u.startIndex=this.parser.startIndex),this.options.withEndIndices&&(u.endIndex=this.parser.endIndex),c.children.push(u),h&&(u.prev=h,h.next=u),u.parent=c,this.lastNode=null},l})();t.DomHandler=o,t.default=o})(pi)),pi}var mi={},Ot={},je={},vo={},Ut={},Ps={},Du;function $y(){if(Du)return Ps;Du=1,Object.defineProperty(Ps,"__esModule",{value:!0});function t(e){for(var i=1;i<e.length;i++)e[i][0]+=e[i-1][0]+1;return e}return Ps.default=new Map(t([[9,"&Tab;"],[0,"&NewLine;"],[22,"&excl;"],[0,"&quot;"],[0,"&num;"],[0,"&dollar;"],[0,"&percnt;"],[0,"&amp;"],[0,"&apos;"],[0,"&lpar;"],[0,"&rpar;"],[0,"&ast;"],[0,"&plus;"],[0,"&comma;"],[1,"&period;"],[0,"&sol;"],[10,"&colon;"],[0,"&semi;"],[0,{v:"&lt;",n:8402,o:"&nvlt;"}],[0,{v:"&equals;",n:8421,o:"&bne;"}],[0,{v:"&gt;",n:8402,o:"&nvgt;"}],[0,"&quest;"],[0,"&commat;"],[26,"&lbrack;"],[0,"&bsol;"],[0,"&rbrack;"],[0,"&Hat;"],[0,"&lowbar;"],[0,"&DiacriticalGrave;"],[5,{n:106,o:"&fjlig;"}],[20,"&lbrace;"],[0,"&verbar;"],[0,"&rbrace;"],[34,"&nbsp;"],[0,"&iexcl;"],[0,"&cent;"],[0,"&pound;"],[0,"&curren;"],[0,"&yen;"],[0,"&brvbar;"],[0,"&sect;"],[0,"&die;"],[0,"&copy;"],[0,"&ordf;"],[0,"&laquo;"],[0,"&not;"],[0,"&shy;"],[0,"&circledR;"],[0,"&macr;"],[0,"&deg;"],[0,"&PlusMinus;"],[0,"&sup2;"],[0,"&sup3;"],[0,"&acute;"],[0,"&micro;"],[0,"&para;"],[0,"&centerdot;"],[0,"&cedil;"],[0,"&sup1;"],[0,"&ordm;"],[0,"&raquo;"],[0,"&frac14;"],[0,"&frac12;"],[0,"&frac34;"],[0,"&iquest;"],[0,"&Agrave;"],[0,"&Aacute;"],[0,"&Acirc;"],[0,"&Atilde;"],[0,"&Auml;"],[0,"&angst;"],[0,"&AElig;"],[0,"&Ccedil;"],[0,"&Egrave;"],[0,"&Eacute;"],[0,"&Ecirc;"],[0,"&Euml;"],[0,"&Igrave;"],[0,"&Iacute;"],[0,"&Icirc;"],[0,"&Iuml;"],[0,"&ETH;"],[0,"&Ntilde;"],[0,"&Ograve;"],[0,"&Oacute;"],[0,"&Ocirc;"],[0,"&Otilde;"],[0,"&Ouml;"],[0,"&times;"],[0,"&Oslash;"],[0,"&Ugrave;"],[0,"&Uacute;"],[0,"&Ucirc;"],[0,"&Uuml;"],[0,"&Yacute;"],[0,"&THORN;"],[0,"&szlig;"],[0,"&agrave;"],[0,"&aacute;"],[0,"&acirc;"],[0,"&atilde;"],[0,"&auml;"],[0,"&aring;"],[0,"&aelig;"],[0,"&ccedil;"],[0,"&egrave;"],[0,"&eacute;"],[0,"&ecirc;"],[0,"&euml;"],[0,"&igrave;"],[0,"&iacute;"],[0,"&icirc;"],[0,"&iuml;"],[0,"&eth;"],[0,"&ntilde;"],[0,"&ograve;"],[0,"&oacute;"],[0,"&ocirc;"],[0,"&otilde;"],[0,"&ouml;"],[0,"&div;"],[0,"&oslash;"],[0,"&ugrave;"],[0,"&uacute;"],[0,"&ucirc;"],[0,"&uuml;"],[0,"&yacute;"],[0,"&thorn;"],[0,"&yuml;"],[0,"&Amacr;"],[0,"&amacr;"],[0,"&Abreve;"],[0,"&abreve;"],[0,"&Aogon;"],[0,"&aogon;"],[0,"&Cacute;"],[0,"&cacute;"],[0,"&Ccirc;"],[0,"&ccirc;"],[0,"&Cdot;"],[0,"&cdot;"],[0,"&Ccaron;"],[0,"&ccaron;"],[0,"&Dcaron;"],[0,"&dcaron;"],[0,"&Dstrok;"],[0,"&dstrok;"],[0,"&Emacr;"],[0,"&emacr;"],[2,"&Edot;"],[0,"&edot;"],[0,"&Eogon;"],[0,"&eogon;"],[0,"&Ecaron;"],[0,"&ecaron;"],[0,"&Gcirc;"],[0,"&gcirc;"],[0,"&Gbreve;"],[0,"&gbreve;"],[0,"&Gdot;"],[0,"&gdot;"],[0,"&Gcedil;"],[1,"&Hcirc;"],[0,"&hcirc;"],[0,"&Hstrok;"],[0,"&hstrok;"],[0,"&Itilde;"],[0,"&itilde;"],[0,"&Imacr;"],[0,"&imacr;"],[2,"&Iogon;"],[0,"&iogon;"],[0,"&Idot;"],[0,"&imath;"],[0,"&IJlig;"],[0,"&ijlig;"],[0,"&Jcirc;"],[0,"&jcirc;"],[0,"&Kcedil;"],[0,"&kcedil;"],[0,"&kgreen;"],[0,"&Lacute;"],[0,"&lacute;"],[0,"&Lcedil;"],[0,"&lcedil;"],[0,"&Lcaron;"],[0,"&lcaron;"],[0,"&Lmidot;"],[0,"&lmidot;"],[0,"&Lstrok;"],[0,"&lstrok;"],[0,"&Nacute;"],[0,"&nacute;"],[0,"&Ncedil;"],[0,"&ncedil;"],[0,"&Ncaron;"],[0,"&ncaron;"],[0,"&napos;"],[0,"&ENG;"],[0,"&eng;"],[0,"&Omacr;"],[0,"&omacr;"],[2,"&Odblac;"],[0,"&odblac;"],[0,"&OElig;"],[0,"&oelig;"],[0,"&Racute;"],[0,"&racute;"],[0,"&Rcedil;"],[0,"&rcedil;"],[0,"&Rcaron;"],[0,"&rcaron;"],[0,"&Sacute;"],[0,"&sacute;"],[0,"&Scirc;"],[0,"&scirc;"],[0,"&Scedil;"],[0,"&scedil;"],[0,"&Scaron;"],[0,"&scaron;"],[0,"&Tcedil;"],[0,"&tcedil;"],[0,"&Tcaron;"],[0,"&tcaron;"],[0,"&Tstrok;"],[0,"&tstrok;"],[0,"&Utilde;"],[0,"&utilde;"],[0,"&Umacr;"],[0,"&umacr;"],[0,"&Ubreve;"],[0,"&ubreve;"],[0,"&Uring;"],[0,"&uring;"],[0,"&Udblac;"],[0,"&udblac;"],[0,"&Uogon;"],[0,"&uogon;"],[0,"&Wcirc;"],[0,"&wcirc;"],[0,"&Ycirc;"],[0,"&ycirc;"],[0,"&Yuml;"],[0,"&Zacute;"],[0,"&zacute;"],[0,"&Zdot;"],[0,"&zdot;"],[0,"&Zcaron;"],[0,"&zcaron;"],[19,"&fnof;"],[34,"&imped;"],[63,"&gacute;"],[65,"&jmath;"],[142,"&circ;"],[0,"&caron;"],[16,"&breve;"],[0,"&DiacriticalDot;"],[0,"&ring;"],[0,"&ogon;"],[0,"&DiacriticalTilde;"],[0,"&dblac;"],[51,"&DownBreve;"],[127,"&Alpha;"],[0,"&Beta;"],[0,"&Gamma;"],[0,"&Delta;"],[0,"&Epsilon;"],[0,"&Zeta;"],[0,"&Eta;"],[0,"&Theta;"],[0,"&Iota;"],[0,"&Kappa;"],[0,"&Lambda;"],[0,"&Mu;"],[0,"&Nu;"],[0,"&Xi;"],[0,"&Omicron;"],[0,"&Pi;"],[0,"&Rho;"],[1,"&Sigma;"],[0,"&Tau;"],[0,"&Upsilon;"],[0,"&Phi;"],[0,"&Chi;"],[0,"&Psi;"],[0,"&ohm;"],[7,"&alpha;"],[0,"&beta;"],[0,"&gamma;"],[0,"&delta;"],[0,"&epsi;"],[0,"&zeta;"],[0,"&eta;"],[0,"&theta;"],[0,"&iota;"],[0,"&kappa;"],[0,"&lambda;"],[0,"&mu;"],[0,"&nu;"],[0,"&xi;"],[0,"&omicron;"],[0,"&pi;"],[0,"&rho;"],[0,"&sigmaf;"],[0,"&sigma;"],[0,"&tau;"],[0,"&upsi;"],[0,"&phi;"],[0,"&chi;"],[0,"&psi;"],[0,"&omega;"],[7,"&thetasym;"],[0,"&Upsi;"],[2,"&phiv;"],[0,"&piv;"],[5,"&Gammad;"],[0,"&digamma;"],[18,"&kappav;"],[0,"&rhov;"],[3,"&epsiv;"],[0,"&backepsilon;"],[10,"&IOcy;"],[0,"&DJcy;"],[0,"&GJcy;"],[0,"&Jukcy;"],[0,"&DScy;"],[0,"&Iukcy;"],[0,"&YIcy;"],[0,"&Jsercy;"],[0,"&LJcy;"],[0,"&NJcy;"],[0,"&TSHcy;"],[0,"&KJcy;"],[1,"&Ubrcy;"],[0,"&DZcy;"],[0,"&Acy;"],[0,"&Bcy;"],[0,"&Vcy;"],[0,"&Gcy;"],[0,"&Dcy;"],[0,"&IEcy;"],[0,"&ZHcy;"],[0,"&Zcy;"],[0,"&Icy;"],[0,"&Jcy;"],[0,"&Kcy;"],[0,"&Lcy;"],[0,"&Mcy;"],[0,"&Ncy;"],[0,"&Ocy;"],[0,"&Pcy;"],[0,"&Rcy;"],[0,"&Scy;"],[0,"&Tcy;"],[0,"&Ucy;"],[0,"&Fcy;"],[0,"&KHcy;"],[0,"&TScy;"],[0,"&CHcy;"],[0,"&SHcy;"],[0,"&SHCHcy;"],[0,"&HARDcy;"],[0,"&Ycy;"],[0,"&SOFTcy;"],[0,"&Ecy;"],[0,"&YUcy;"],[0,"&YAcy;"],[0,"&acy;"],[0,"&bcy;"],[0,"&vcy;"],[0,"&gcy;"],[0,"&dcy;"],[0,"&iecy;"],[0,"&zhcy;"],[0,"&zcy;"],[0,"&icy;"],[0,"&jcy;"],[0,"&kcy;"],[0,"&lcy;"],[0,"&mcy;"],[0,"&ncy;"],[0,"&ocy;"],[0,"&pcy;"],[0,"&rcy;"],[0,"&scy;"],[0,"&tcy;"],[0,"&ucy;"],[0,"&fcy;"],[0,"&khcy;"],[0,"&tscy;"],[0,"&chcy;"],[0,"&shcy;"],[0,"&shchcy;"],[0,"&hardcy;"],[0,"&ycy;"],[0,"&softcy;"],[0,"&ecy;"],[0,"&yucy;"],[0,"&yacy;"],[1,"&iocy;"],[0,"&djcy;"],[0,"&gjcy;"],[0,"&jukcy;"],[0,"&dscy;"],[0,"&iukcy;"],[0,"&yicy;"],[0,"&jsercy;"],[0,"&ljcy;"],[0,"&njcy;"],[0,"&tshcy;"],[0,"&kjcy;"],[1,"&ubrcy;"],[0,"&dzcy;"],[7074,"&ensp;"],[0,"&emsp;"],[0,"&emsp13;"],[0,"&emsp14;"],[1,"&numsp;"],[0,"&puncsp;"],[0,"&ThinSpace;"],[0,"&hairsp;"],[0,"&NegativeMediumSpace;"],[0,"&zwnj;"],[0,"&zwj;"],[0,"&lrm;"],[0,"&rlm;"],[0,"&dash;"],[2,"&ndash;"],[0,"&mdash;"],[0,"&horbar;"],[0,"&Verbar;"],[1,"&lsquo;"],[0,"&CloseCurlyQuote;"],[0,"&lsquor;"],[1,"&ldquo;"],[0,"&CloseCurlyDoubleQuote;"],[0,"&bdquo;"],[1,"&dagger;"],[0,"&Dagger;"],[0,"&bull;"],[2,"&nldr;"],[0,"&hellip;"],[9,"&permil;"],[0,"&pertenk;"],[0,"&prime;"],[0,"&Prime;"],[0,"&tprime;"],[0,"&backprime;"],[3,"&lsaquo;"],[0,"&rsaquo;"],[3,"&oline;"],[2,"&caret;"],[1,"&hybull;"],[0,"&frasl;"],[10,"&bsemi;"],[7,"&qprime;"],[7,{v:"&MediumSpace;",n:8202,o:"&ThickSpace;"}],[0,"&NoBreak;"],[0,"&af;"],[0,"&InvisibleTimes;"],[0,"&ic;"],[72,"&euro;"],[46,"&tdot;"],[0,"&DotDot;"],[37,"&complexes;"],[2,"&incare;"],[4,"&gscr;"],[0,"&hamilt;"],[0,"&Hfr;"],[0,"&Hopf;"],[0,"&planckh;"],[0,"&hbar;"],[0,"&imagline;"],[0,"&Ifr;"],[0,"&lagran;"],[0,"&ell;"],[1,"&naturals;"],[0,"&numero;"],[0,"&copysr;"],[0,"&weierp;"],[0,"&Popf;"],[0,"&Qopf;"],[0,"&realine;"],[0,"&real;"],[0,"&reals;"],[0,"&rx;"],[3,"&trade;"],[1,"&integers;"],[2,"&mho;"],[0,"&zeetrf;"],[0,"&iiota;"],[2,"&bernou;"],[0,"&Cayleys;"],[1,"&escr;"],[0,"&Escr;"],[0,"&Fouriertrf;"],[1,"&Mellintrf;"],[0,"&order;"],[0,"&alefsym;"],[0,"&beth;"],[0,"&gimel;"],[0,"&daleth;"],[12,"&CapitalDifferentialD;"],[0,"&dd;"],[0,"&ee;"],[0,"&ii;"],[10,"&frac13;"],[0,"&frac23;"],[0,"&frac15;"],[0,"&frac25;"],[0,"&frac35;"],[0,"&frac45;"],[0,"&frac16;"],[0,"&frac56;"],[0,"&frac18;"],[0,"&frac38;"],[0,"&frac58;"],[0,"&frac78;"],[49,"&larr;"],[0,"&ShortUpArrow;"],[0,"&rarr;"],[0,"&darr;"],[0,"&harr;"],[0,"&updownarrow;"],[0,"&nwarr;"],[0,"&nearr;"],[0,"&LowerRightArrow;"],[0,"&LowerLeftArrow;"],[0,"&nlarr;"],[0,"&nrarr;"],[1,{v:"&rarrw;",n:824,o:"&nrarrw;"}],[0,"&Larr;"],[0,"&Uarr;"],[0,"&Rarr;"],[0,"&Darr;"],[0,"&larrtl;"],[0,"&rarrtl;"],[0,"&LeftTeeArrow;"],[0,"&mapstoup;"],[0,"&map;"],[0,"&DownTeeArrow;"],[1,"&hookleftarrow;"],[0,"&hookrightarrow;"],[0,"&larrlp;"],[0,"&looparrowright;"],[0,"&harrw;"],[0,"&nharr;"],[1,"&lsh;"],[0,"&rsh;"],[0,"&ldsh;"],[0,"&rdsh;"],[1,"&crarr;"],[0,"&cularr;"],[0,"&curarr;"],[2,"&circlearrowleft;"],[0,"&circlearrowright;"],[0,"&leftharpoonup;"],[0,"&DownLeftVector;"],[0,"&RightUpVector;"],[0,"&LeftUpVector;"],[0,"&rharu;"],[0,"&DownRightVector;"],[0,"&dharr;"],[0,"&dharl;"],[0,"&RightArrowLeftArrow;"],[0,"&udarr;"],[0,"&LeftArrowRightArrow;"],[0,"&leftleftarrows;"],[0,"&upuparrows;"],[0,"&rightrightarrows;"],[0,"&ddarr;"],[0,"&leftrightharpoons;"],[0,"&Equilibrium;"],[0,"&nlArr;"],[0,"&nhArr;"],[0,"&nrArr;"],[0,"&DoubleLeftArrow;"],[0,"&DoubleUpArrow;"],[0,"&DoubleRightArrow;"],[0,"&dArr;"],[0,"&DoubleLeftRightArrow;"],[0,"&DoubleUpDownArrow;"],[0,"&nwArr;"],[0,"&neArr;"],[0,"&seArr;"],[0,"&swArr;"],[0,"&lAarr;"],[0,"&rAarr;"],[1,"&zigrarr;"],[6,"&larrb;"],[0,"&rarrb;"],[15,"&DownArrowUpArrow;"],[7,"&loarr;"],[0,"&roarr;"],[0,"&hoarr;"],[0,"&forall;"],[0,"&comp;"],[0,{v:"&part;",n:824,o:"&npart;"}],[0,"&exist;"],[0,"&nexist;"],[0,"&empty;"],[1,"&Del;"],[0,"&Element;"],[0,"&NotElement;"],[1,"&ni;"],[0,"&notni;"],[2,"&prod;"],[0,"&coprod;"],[0,"&sum;"],[0,"&minus;"],[0,"&MinusPlus;"],[0,"&dotplus;"],[1,"&Backslash;"],[0,"&lowast;"],[0,"&compfn;"],[1,"&radic;"],[2,"&prop;"],[0,"&infin;"],[0,"&angrt;"],[0,{v:"&ang;",n:8402,o:"&nang;"}],[0,"&angmsd;"],[0,"&angsph;"],[0,"&mid;"],[0,"&nmid;"],[0,"&DoubleVerticalBar;"],[0,"&NotDoubleVerticalBar;"],[0,"&and;"],[0,"&or;"],[0,{v:"&cap;",n:65024,o:"&caps;"}],[0,{v:"&cup;",n:65024,o:"&cups;"}],[0,"&int;"],[0,"&Int;"],[0,"&iiint;"],[0,"&conint;"],[0,"&Conint;"],[0,"&Cconint;"],[0,"&cwint;"],[0,"&ClockwiseContourIntegral;"],[0,"&awconint;"],[0,"&there4;"],[0,"&becaus;"],[0,"&ratio;"],[0,"&Colon;"],[0,"&dotminus;"],[1,"&mDDot;"],[0,"&homtht;"],[0,{v:"&sim;",n:8402,o:"&nvsim;"}],[0,{v:"&backsim;",n:817,o:"&race;"}],[0,{v:"&ac;",n:819,o:"&acE;"}],[0,"&acd;"],[0,"&VerticalTilde;"],[0,"&NotTilde;"],[0,{v:"&eqsim;",n:824,o:"&nesim;"}],[0,"&sime;"],[0,"&NotTildeEqual;"],[0,"&cong;"],[0,"&simne;"],[0,"&ncong;"],[0,"&ap;"],[0,"&nap;"],[0,"&ape;"],[0,{v:"&apid;",n:824,o:"&napid;"}],[0,"&backcong;"],[0,{v:"&asympeq;",n:8402,o:"&nvap;"}],[0,{v:"&bump;",n:824,o:"&nbump;"}],[0,{v:"&bumpe;",n:824,o:"&nbumpe;"}],[0,{v:"&doteq;",n:824,o:"&nedot;"}],[0,"&doteqdot;"],[0,"&efDot;"],[0,"&erDot;"],[0,"&Assign;"],[0,"&ecolon;"],[0,"&ecir;"],[0,"&circeq;"],[1,"&wedgeq;"],[0,"&veeeq;"],[1,"&triangleq;"],[2,"&equest;"],[0,"&ne;"],[0,{v:"&Congruent;",n:8421,o:"&bnequiv;"}],[0,"&nequiv;"],[1,{v:"&le;",n:8402,o:"&nvle;"}],[0,{v:"&ge;",n:8402,o:"&nvge;"}],[0,{v:"&lE;",n:824,o:"&nlE;"}],[0,{v:"&gE;",n:824,o:"&ngE;"}],[0,{v:"&lnE;",n:65024,o:"&lvertneqq;"}],[0,{v:"&gnE;",n:65024,o:"&gvertneqq;"}],[0,{v:"&ll;",n:new Map(t([[824,"&nLtv;"],[7577,"&nLt;"]]))}],[0,{v:"&gg;",n:new Map(t([[824,"&nGtv;"],[7577,"&nGt;"]]))}],[0,"&between;"],[0,"&NotCupCap;"],[0,"&nless;"],[0,"&ngt;"],[0,"&nle;"],[0,"&nge;"],[0,"&lesssim;"],[0,"&GreaterTilde;"],[0,"&nlsim;"],[0,"&ngsim;"],[0,"&LessGreater;"],[0,"&gl;"],[0,"&NotLessGreater;"],[0,"&NotGreaterLess;"],[0,"&pr;"],[0,"&sc;"],[0,"&prcue;"],[0,"&sccue;"],[0,"&PrecedesTilde;"],[0,{v:"&scsim;",n:824,o:"&NotSucceedsTilde;"}],[0,"&NotPrecedes;"],[0,"&NotSucceeds;"],[0,{v:"&sub;",n:8402,o:"&NotSubset;"}],[0,{v:"&sup;",n:8402,o:"&NotSuperset;"}],[0,"&nsub;"],[0,"&nsup;"],[0,"&sube;"],[0,"&supe;"],[0,"&NotSubsetEqual;"],[0,"&NotSupersetEqual;"],[0,{v:"&subne;",n:65024,o:"&varsubsetneq;"}],[0,{v:"&supne;",n:65024,o:"&varsupsetneq;"}],[1,"&cupdot;"],[0,"&UnionPlus;"],[0,{v:"&sqsub;",n:824,o:"&NotSquareSubset;"}],[0,{v:"&sqsup;",n:824,o:"&NotSquareSuperset;"}],[0,"&sqsube;"],[0,"&sqsupe;"],[0,{v:"&sqcap;",n:65024,o:"&sqcaps;"}],[0,{v:"&sqcup;",n:65024,o:"&sqcups;"}],[0,"&CirclePlus;"],[0,"&CircleMinus;"],[0,"&CircleTimes;"],[0,"&osol;"],[0,"&CircleDot;"],[0,"&circledcirc;"],[0,"&circledast;"],[1,"&circleddash;"],[0,"&boxplus;"],[0,"&boxminus;"],[0,"&boxtimes;"],[0,"&dotsquare;"],[0,"&RightTee;"],[0,"&dashv;"],[0,"&DownTee;"],[0,"&bot;"],[1,"&models;"],[0,"&DoubleRightTee;"],[0,"&Vdash;"],[0,"&Vvdash;"],[0,"&VDash;"],[0,"&nvdash;"],[0,"&nvDash;"],[0,"&nVdash;"],[0,"&nVDash;"],[0,"&prurel;"],[1,"&LeftTriangle;"],[0,"&RightTriangle;"],[0,{v:"&LeftTriangleEqual;",n:8402,o:"&nvltrie;"}],[0,{v:"&RightTriangleEqual;",n:8402,o:"&nvrtrie;"}],[0,"&origof;"],[0,"&imof;"],[0,"&multimap;"],[0,"&hercon;"],[0,"&intcal;"],[0,"&veebar;"],[1,"&barvee;"],[0,"&angrtvb;"],[0,"&lrtri;"],[0,"&bigwedge;"],[0,"&bigvee;"],[0,"&bigcap;"],[0,"&bigcup;"],[0,"&diam;"],[0,"&sdot;"],[0,"&sstarf;"],[0,"&divideontimes;"],[0,"&bowtie;"],[0,"&ltimes;"],[0,"&rtimes;"],[0,"&leftthreetimes;"],[0,"&rightthreetimes;"],[0,"&backsimeq;"],[0,"&curlyvee;"],[0,"&curlywedge;"],[0,"&Sub;"],[0,"&Sup;"],[0,"&Cap;"],[0,"&Cup;"],[0,"&fork;"],[0,"&epar;"],[0,"&lessdot;"],[0,"&gtdot;"],[0,{v:"&Ll;",n:824,o:"&nLl;"}],[0,{v:"&Gg;",n:824,o:"&nGg;"}],[0,{v:"&leg;",n:65024,o:"&lesg;"}],[0,{v:"&gel;",n:65024,o:"&gesl;"}],[2,"&cuepr;"],[0,"&cuesc;"],[0,"&NotPrecedesSlantEqual;"],[0,"&NotSucceedsSlantEqual;"],[0,"&NotSquareSubsetEqual;"],[0,"&NotSquareSupersetEqual;"],[2,"&lnsim;"],[0,"&gnsim;"],[0,"&precnsim;"],[0,"&scnsim;"],[0,"&nltri;"],[0,"&NotRightTriangle;"],[0,"&nltrie;"],[0,"&NotRightTriangleEqual;"],[0,"&vellip;"],[0,"&ctdot;"],[0,"&utdot;"],[0,"&dtdot;"],[0,"&disin;"],[0,"&isinsv;"],[0,"&isins;"],[0,{v:"&isindot;",n:824,o:"&notindot;"}],[0,"&notinvc;"],[0,"&notinvb;"],[1,{v:"&isinE;",n:824,o:"&notinE;"}],[0,"&nisd;"],[0,"&xnis;"],[0,"&nis;"],[0,"&notnivc;"],[0,"&notnivb;"],[6,"&barwed;"],[0,"&Barwed;"],[1,"&lceil;"],[0,"&rceil;"],[0,"&LeftFloor;"],[0,"&rfloor;"],[0,"&drcrop;"],[0,"&dlcrop;"],[0,"&urcrop;"],[0,"&ulcrop;"],[0,"&bnot;"],[1,"&profline;"],[0,"&profsurf;"],[1,"&telrec;"],[0,"&target;"],[5,"&ulcorn;"],[0,"&urcorn;"],[0,"&dlcorn;"],[0,"&drcorn;"],[2,"&frown;"],[0,"&smile;"],[9,"&cylcty;"],[0,"&profalar;"],[7,"&topbot;"],[6,"&ovbar;"],[1,"&solbar;"],[60,"&angzarr;"],[51,"&lmoustache;"],[0,"&rmoustache;"],[2,"&OverBracket;"],[0,"&bbrk;"],[0,"&bbrktbrk;"],[37,"&OverParenthesis;"],[0,"&UnderParenthesis;"],[0,"&OverBrace;"],[0,"&UnderBrace;"],[2,"&trpezium;"],[4,"&elinters;"],[59,"&blank;"],[164,"&circledS;"],[55,"&boxh;"],[1,"&boxv;"],[9,"&boxdr;"],[3,"&boxdl;"],[3,"&boxur;"],[3,"&boxul;"],[3,"&boxvr;"],[7,"&boxvl;"],[7,"&boxhd;"],[7,"&boxhu;"],[7,"&boxvh;"],[19,"&boxH;"],[0,"&boxV;"],[0,"&boxdR;"],[0,"&boxDr;"],[0,"&boxDR;"],[0,"&boxdL;"],[0,"&boxDl;"],[0,"&boxDL;"],[0,"&boxuR;"],[0,"&boxUr;"],[0,"&boxUR;"],[0,"&boxuL;"],[0,"&boxUl;"],[0,"&boxUL;"],[0,"&boxvR;"],[0,"&boxVr;"],[0,"&boxVR;"],[0,"&boxvL;"],[0,"&boxVl;"],[0,"&boxVL;"],[0,"&boxHd;"],[0,"&boxhD;"],[0,"&boxHD;"],[0,"&boxHu;"],[0,"&boxhU;"],[0,"&boxHU;"],[0,"&boxvH;"],[0,"&boxVh;"],[0,"&boxVH;"],[19,"&uhblk;"],[3,"&lhblk;"],[3,"&block;"],[8,"&blk14;"],[0,"&blk12;"],[0,"&blk34;"],[13,"&square;"],[8,"&blacksquare;"],[0,"&EmptyVerySmallSquare;"],[1,"&rect;"],[0,"&marker;"],[2,"&fltns;"],[1,"&bigtriangleup;"],[0,"&blacktriangle;"],[0,"&triangle;"],[2,"&blacktriangleright;"],[0,"&rtri;"],[3,"&bigtriangledown;"],[0,"&blacktriangledown;"],[0,"&dtri;"],[2,"&blacktriangleleft;"],[0,"&ltri;"],[6,"&loz;"],[0,"&cir;"],[32,"&tridot;"],[2,"&bigcirc;"],[8,"&ultri;"],[0,"&urtri;"],[0,"&lltri;"],[0,"&EmptySmallSquare;"],[0,"&FilledSmallSquare;"],[8,"&bigstar;"],[0,"&star;"],[7,"&phone;"],[49,"&female;"],[1,"&male;"],[29,"&spades;"],[2,"&clubs;"],[1,"&hearts;"],[0,"&diamondsuit;"],[3,"&sung;"],[2,"&flat;"],[0,"&natural;"],[0,"&sharp;"],[163,"&check;"],[3,"&cross;"],[8,"&malt;"],[21,"&sext;"],[33,"&VerticalSeparator;"],[25,"&lbbrk;"],[0,"&rbbrk;"],[84,"&bsolhsub;"],[0,"&suphsol;"],[28,"&LeftDoubleBracket;"],[0,"&RightDoubleBracket;"],[0,"&lang;"],[0,"&rang;"],[0,"&Lang;"],[0,"&Rang;"],[0,"&loang;"],[0,"&roang;"],[7,"&longleftarrow;"],[0,"&longrightarrow;"],[0,"&longleftrightarrow;"],[0,"&DoubleLongLeftArrow;"],[0,"&DoubleLongRightArrow;"],[0,"&DoubleLongLeftRightArrow;"],[1,"&longmapsto;"],[2,"&dzigrarr;"],[258,"&nvlArr;"],[0,"&nvrArr;"],[0,"&nvHarr;"],[0,"&Map;"],[6,"&lbarr;"],[0,"&bkarow;"],[0,"&lBarr;"],[0,"&dbkarow;"],[0,"&drbkarow;"],[0,"&DDotrahd;"],[0,"&UpArrowBar;"],[0,"&DownArrowBar;"],[2,"&Rarrtl;"],[2,"&latail;"],[0,"&ratail;"],[0,"&lAtail;"],[0,"&rAtail;"],[0,"&larrfs;"],[0,"&rarrfs;"],[0,"&larrbfs;"],[0,"&rarrbfs;"],[2,"&nwarhk;"],[0,"&nearhk;"],[0,"&hksearow;"],[0,"&hkswarow;"],[0,"&nwnear;"],[0,"&nesear;"],[0,"&seswar;"],[0,"&swnwar;"],[8,{v:"&rarrc;",n:824,o:"&nrarrc;"}],[1,"&cudarrr;"],[0,"&ldca;"],[0,"&rdca;"],[0,"&cudarrl;"],[0,"&larrpl;"],[2,"&curarrm;"],[0,"&cularrp;"],[7,"&rarrpl;"],[2,"&harrcir;"],[0,"&Uarrocir;"],[0,"&lurdshar;"],[0,"&ldrushar;"],[2,"&LeftRightVector;"],[0,"&RightUpDownVector;"],[0,"&DownLeftRightVector;"],[0,"&LeftUpDownVector;"],[0,"&LeftVectorBar;"],[0,"&RightVectorBar;"],[0,"&RightUpVectorBar;"],[0,"&RightDownVectorBar;"],[0,"&DownLeftVectorBar;"],[0,"&DownRightVectorBar;"],[0,"&LeftUpVectorBar;"],[0,"&LeftDownVectorBar;"],[0,"&LeftTeeVector;"],[0,"&RightTeeVector;"],[0,"&RightUpTeeVector;"],[0,"&RightDownTeeVector;"],[0,"&DownLeftTeeVector;"],[0,"&DownRightTeeVector;"],[0,"&LeftUpTeeVector;"],[0,"&LeftDownTeeVector;"],[0,"&lHar;"],[0,"&uHar;"],[0,"&rHar;"],[0,"&dHar;"],[0,"&luruhar;"],[0,"&ldrdhar;"],[0,"&ruluhar;"],[0,"&rdldhar;"],[0,"&lharul;"],[0,"&llhard;"],[0,"&rharul;"],[0,"&lrhard;"],[0,"&udhar;"],[0,"&duhar;"],[0,"&RoundImplies;"],[0,"&erarr;"],[0,"&simrarr;"],[0,"&larrsim;"],[0,"&rarrsim;"],[0,"&rarrap;"],[0,"&ltlarr;"],[1,"&gtrarr;"],[0,"&subrarr;"],[1,"&suplarr;"],[0,"&lfisht;"],[0,"&rfisht;"],[0,"&ufisht;"],[0,"&dfisht;"],[5,"&lopar;"],[0,"&ropar;"],[4,"&lbrke;"],[0,"&rbrke;"],[0,"&lbrkslu;"],[0,"&rbrksld;"],[0,"&lbrksld;"],[0,"&rbrkslu;"],[0,"&langd;"],[0,"&rangd;"],[0,"&lparlt;"],[0,"&rpargt;"],[0,"&gtlPar;"],[0,"&ltrPar;"],[3,"&vzigzag;"],[1,"&vangrt;"],[0,"&angrtvbd;"],[6,"&ange;"],[0,"&range;"],[0,"&dwangle;"],[0,"&uwangle;"],[0,"&angmsdaa;"],[0,"&angmsdab;"],[0,"&angmsdac;"],[0,"&angmsdad;"],[0,"&angmsdae;"],[0,"&angmsdaf;"],[0,"&angmsdag;"],[0,"&angmsdah;"],[0,"&bemptyv;"],[0,"&demptyv;"],[0,"&cemptyv;"],[0,"&raemptyv;"],[0,"&laemptyv;"],[0,"&ohbar;"],[0,"&omid;"],[0,"&opar;"],[1,"&operp;"],[1,"&olcross;"],[0,"&odsold;"],[1,"&olcir;"],[0,"&ofcir;"],[0,"&olt;"],[0,"&ogt;"],[0,"&cirscir;"],[0,"&cirE;"],[0,"&solb;"],[0,"&bsolb;"],[3,"&boxbox;"],[3,"&trisb;"],[0,"&rtriltri;"],[0,{v:"&LeftTriangleBar;",n:824,o:"&NotLeftTriangleBar;"}],[0,{v:"&RightTriangleBar;",n:824,o:"&NotRightTriangleBar;"}],[11,"&iinfin;"],[0,"&infintie;"],[0,"&nvinfin;"],[4,"&eparsl;"],[0,"&smeparsl;"],[0,"&eqvparsl;"],[5,"&blacklozenge;"],[8,"&RuleDelayed;"],[1,"&dsol;"],[9,"&bigodot;"],[0,"&bigoplus;"],[0,"&bigotimes;"],[1,"&biguplus;"],[1,"&bigsqcup;"],[5,"&iiiint;"],[0,"&fpartint;"],[2,"&cirfnint;"],[0,"&awint;"],[0,"&rppolint;"],[0,"&scpolint;"],[0,"&npolint;"],[0,"&pointint;"],[0,"&quatint;"],[0,"&intlarhk;"],[10,"&pluscir;"],[0,"&plusacir;"],[0,"&simplus;"],[0,"&plusdu;"],[0,"&plussim;"],[0,"&plustwo;"],[1,"&mcomma;"],[0,"&minusdu;"],[2,"&loplus;"],[0,"&roplus;"],[0,"&Cross;"],[0,"&timesd;"],[0,"&timesbar;"],[1,"&smashp;"],[0,"&lotimes;"],[0,"&rotimes;"],[0,"&otimesas;"],[0,"&Otimes;"],[0,"&odiv;"],[0,"&triplus;"],[0,"&triminus;"],[0,"&tritime;"],[0,"&intprod;"],[2,"&amalg;"],[0,"&capdot;"],[1,"&ncup;"],[0,"&ncap;"],[0,"&capand;"],[0,"&cupor;"],[0,"&cupcap;"],[0,"&capcup;"],[0,"&cupbrcap;"],[0,"&capbrcup;"],[0,"&cupcup;"],[0,"&capcap;"],[0,"&ccups;"],[0,"&ccaps;"],[2,"&ccupssm;"],[2,"&And;"],[0,"&Or;"],[0,"&andand;"],[0,"&oror;"],[0,"&orslope;"],[0,"&andslope;"],[1,"&andv;"],[0,"&orv;"],[0,"&andd;"],[0,"&ord;"],[1,"&wedbar;"],[6,"&sdote;"],[3,"&simdot;"],[2,{v:"&congdot;",n:824,o:"&ncongdot;"}],[0,"&easter;"],[0,"&apacir;"],[0,{v:"&apE;",n:824,o:"&napE;"}],[0,"&eplus;"],[0,"&pluse;"],[0,"&Esim;"],[0,"&Colone;"],[0,"&Equal;"],[1,"&ddotseq;"],[0,"&equivDD;"],[0,"&ltcir;"],[0,"&gtcir;"],[0,"&ltquest;"],[0,"&gtquest;"],[0,{v:"&leqslant;",n:824,o:"&nleqslant;"}],[0,{v:"&geqslant;",n:824,o:"&ngeqslant;"}],[0,"&lesdot;"],[0,"&gesdot;"],[0,"&lesdoto;"],[0,"&gesdoto;"],[0,"&lesdotor;"],[0,"&gesdotol;"],[0,"&lap;"],[0,"&gap;"],[0,"&lne;"],[0,"&gne;"],[0,"&lnap;"],[0,"&gnap;"],[0,"&lEg;"],[0,"&gEl;"],[0,"&lsime;"],[0,"&gsime;"],[0,"&lsimg;"],[0,"&gsiml;"],[0,"&lgE;"],[0,"&glE;"],[0,"&lesges;"],[0,"&gesles;"],[0,"&els;"],[0,"&egs;"],[0,"&elsdot;"],[0,"&egsdot;"],[0,"&el;"],[0,"&eg;"],[2,"&siml;"],[0,"&simg;"],[0,"&simlE;"],[0,"&simgE;"],[0,{v:"&LessLess;",n:824,o:"&NotNestedLessLess;"}],[0,{v:"&GreaterGreater;",n:824,o:"&NotNestedGreaterGreater;"}],[1,"&glj;"],[0,"&gla;"],[0,"&ltcc;"],[0,"&gtcc;"],[0,"&lescc;"],[0,"&gescc;"],[0,"&smt;"],[0,"&lat;"],[0,{v:"&smte;",n:65024,o:"&smtes;"}],[0,{v:"&late;",n:65024,o:"&lates;"}],[0,"&bumpE;"],[0,{v:"&PrecedesEqual;",n:824,o:"&NotPrecedesEqual;"}],[0,{v:"&sce;",n:824,o:"&NotSucceedsEqual;"}],[2,"&prE;"],[0,"&scE;"],[0,"&precneqq;"],[0,"&scnE;"],[0,"&prap;"],[0,"&scap;"],[0,"&precnapprox;"],[0,"&scnap;"],[0,"&Pr;"],[0,"&Sc;"],[0,"&subdot;"],[0,"&supdot;"],[0,"&subplus;"],[0,"&supplus;"],[0,"&submult;"],[0,"&supmult;"],[0,"&subedot;"],[0,"&supedot;"],[0,{v:"&subE;",n:824,o:"&nsubE;"}],[0,{v:"&supE;",n:824,o:"&nsupE;"}],[0,"&subsim;"],[0,"&supsim;"],[2,{v:"&subnE;",n:65024,o:"&varsubsetneqq;"}],[0,{v:"&supnE;",n:65024,o:"&varsupsetneqq;"}],[2,"&csub;"],[0,"&csup;"],[0,"&csube;"],[0,"&csupe;"],[0,"&subsup;"],[0,"&supsub;"],[0,"&subsub;"],[0,"&supsup;"],[0,"&suphsub;"],[0,"&supdsub;"],[0,"&forkv;"],[0,"&topfork;"],[0,"&mlcp;"],[8,"&Dashv;"],[1,"&Vdashl;"],[0,"&Barv;"],[0,"&vBar;"],[0,"&vBarv;"],[1,"&Vbar;"],[0,"&Not;"],[0,"&bNot;"],[0,"&rnmid;"],[0,"&cirmid;"],[0,"&midcir;"],[0,"&topcir;"],[0,"&nhpar;"],[0,"&parsim;"],[9,{v:"&parsl;",n:8421,o:"&nparsl;"}],[44343,{n:new Map(t([[56476,"&Ascr;"],[1,"&Cscr;"],[0,"&Dscr;"],[2,"&Gscr;"],[2,"&Jscr;"],[0,"&Kscr;"],[2,"&Nscr;"],[0,"&Oscr;"],[0,"&Pscr;"],[0,"&Qscr;"],[1,"&Sscr;"],[0,"&Tscr;"],[0,"&Uscr;"],[0,"&Vscr;"],[0,"&Wscr;"],[0,"&Xscr;"],[0,"&Yscr;"],[0,"&Zscr;"],[0,"&ascr;"],[0,"&bscr;"],[0,"&cscr;"],[0,"&dscr;"],[1,"&fscr;"],[1,"&hscr;"],[0,"&iscr;"],[0,"&jscr;"],[0,"&kscr;"],[0,"&lscr;"],[0,"&mscr;"],[0,"&nscr;"],[1,"&pscr;"],[0,"&qscr;"],[0,"&rscr;"],[0,"&sscr;"],[0,"&tscr;"],[0,"&uscr;"],[0,"&vscr;"],[0,"&wscr;"],[0,"&xscr;"],[0,"&yscr;"],[0,"&zscr;"],[52,"&Afr;"],[0,"&Bfr;"],[1,"&Dfr;"],[0,"&Efr;"],[0,"&Ffr;"],[0,"&Gfr;"],[2,"&Jfr;"],[0,"&Kfr;"],[0,"&Lfr;"],[0,"&Mfr;"],[0,"&Nfr;"],[0,"&Ofr;"],[0,"&Pfr;"],[0,"&Qfr;"],[1,"&Sfr;"],[0,"&Tfr;"],[0,"&Ufr;"],[0,"&Vfr;"],[0,"&Wfr;"],[0,"&Xfr;"],[0,"&Yfr;"],[1,"&afr;"],[0,"&bfr;"],[0,"&cfr;"],[0,"&dfr;"],[0,"&efr;"],[0,"&ffr;"],[0,"&gfr;"],[0,"&hfr;"],[0,"&ifr;"],[0,"&jfr;"],[0,"&kfr;"],[0,"&lfr;"],[0,"&mfr;"],[0,"&nfr;"],[0,"&ofr;"],[0,"&pfr;"],[0,"&qfr;"],[0,"&rfr;"],[0,"&sfr;"],[0,"&tfr;"],[0,"&ufr;"],[0,"&vfr;"],[0,"&wfr;"],[0,"&xfr;"],[0,"&yfr;"],[0,"&zfr;"],[0,"&Aopf;"],[0,"&Bopf;"],[1,"&Dopf;"],[0,"&Eopf;"],[0,"&Fopf;"],[0,"&Gopf;"],[1,"&Iopf;"],[0,"&Jopf;"],[0,"&Kopf;"],[0,"&Lopf;"],[0,"&Mopf;"],[1,"&Oopf;"],[3,"&Sopf;"],[0,"&Topf;"],[0,"&Uopf;"],[0,"&Vopf;"],[0,"&Wopf;"],[0,"&Xopf;"],[0,"&Yopf;"],[1,"&aopf;"],[0,"&bopf;"],[0,"&copf;"],[0,"&dopf;"],[0,"&eopf;"],[0,"&fopf;"],[0,"&gopf;"],[0,"&hopf;"],[0,"&iopf;"],[0,"&jopf;"],[0,"&kopf;"],[0,"&lopf;"],[0,"&mopf;"],[0,"&nopf;"],[0,"&oopf;"],[0,"&popf;"],[0,"&qopf;"],[0,"&ropf;"],[0,"&sopf;"],[0,"&topf;"],[0,"&uopf;"],[0,"&vopf;"],[0,"&wopf;"],[0,"&xopf;"],[0,"&yopf;"],[0,"&zopf;"]]))}],[8906,"&fflig;"],[0,"&filig;"],[0,"&fllig;"],[0,"&ffilig;"],[0,"&ffllig;"]])),Ps}var wo={},Pu;function _a(){return Pu||(Pu=1,(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.escapeText=t.escapeAttribute=t.escapeUTF8=t.escape=t.encodeXML=t.getCodePoint=t.xmlReplacer=void 0,t.xmlReplacer=/["&'<>$\x80-\uFFFF]/g;var e=new Map([[34,"&quot;"],[38,"&amp;"],[39,"&apos;"],[60,"&lt;"],[62,"&gt;"]]);t.getCodePoint=String.prototype.codePointAt!=null?function(s,n){return s.codePointAt(n)}:function(s,n){return(s.charCodeAt(n)&64512)===55296?(s.charCodeAt(n)-55296)*1024+s.charCodeAt(n+1)-56320+65536:s.charCodeAt(n)};function i(s){for(var n="",o=0,l;(l=t.xmlReplacer.exec(s))!==null;){var u=l.index,c=s.charCodeAt(u),h=e.get(c);h!==void 0?(n+=s.substring(o,u)+h,o=u+1):(n+="".concat(s.substring(o,u),"&#x").concat((0,t.getCodePoint)(s,u).toString(16),";"),o=t.xmlReplacer.lastIndex+=+((c&64512)===55296))}return n+s.substr(o)}t.encodeXML=i,t.escape=i;function r(s,n){return function(l){for(var u,c=0,h="";u=s.exec(l);)c!==u.index&&(h+=l.substring(c,u.index)),h+=n.get(u[0].charCodeAt(0)),c=u.index+1;return h+l.substring(c)}}t.escapeUTF8=r(/[&<>'"]/g,e),t.escapeAttribute=r(/["&\u00A0]/g,new Map([[34,"&quot;"],[38,"&amp;"],[160,"&nbsp;"]])),t.escapeText=r(/[&<>\u00A0]/g,new Map([[38,"&amp;"],[60,"&lt;"],[62,"&gt;"],[160,"&nbsp;"]]))})(wo)),wo}var Mu;function zu(){if(Mu)return Ut;Mu=1;var t=Ut&&Ut.__importDefault||function(l){return l&&l.__esModule?l:{default:l}};Object.defineProperty(Ut,"__esModule",{value:!0}),Ut.encodeNonAsciiHTML=Ut.encodeHTML=void 0;var e=t($y()),i=_a(),r=/[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;function s(l){return o(r,l)}Ut.encodeHTML=s;function n(l){return o(i.xmlReplacer,l)}Ut.encodeNonAsciiHTML=n;function o(l,u){for(var c="",h=0,f;(f=l.exec(u))!==null;){var a=f.index;c+=u.substring(h,a);var d=u.charCodeAt(a),p=e.default.get(d);if(typeof p=="object"){if(a+1<u.length){var b=u.charCodeAt(a+1),w=typeof p.n=="number"?p.n===b?p.o:void 0:p.n.get(b);if(w!==void 0){c+=w,h=l.lastIndex+=1;continue}}p=p.v}if(p!==void 0)c+=p,h=a+1;else{var g=(0,i.getCodePoint)(u,a);c+="&#x".concat(g.toString(16),";"),h=l.lastIndex+=+(g!==d)}}return c+u.substr(h)}return Ut}var Ru;function Iy(){return Ru||(Ru=1,(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.decodeXMLStrict=t.decodeHTML5Strict=t.decodeHTML4Strict=t.decodeHTML5=t.decodeHTML4=t.decodeHTMLAttribute=t.decodeHTMLStrict=t.decodeHTML=t.decodeXML=t.DecodingMode=t.EntityDecoder=t.encodeHTML5=t.encodeHTML4=t.encodeNonAsciiHTML=t.encodeHTML=t.escapeText=t.escapeAttribute=t.escapeUTF8=t.escape=t.encodeXML=t.encode=t.decodeStrict=t.decode=t.EncodingMode=t.EntityLevel=void 0;var e=dn(),i=zu(),r=_a(),s;(function(a){a[a.XML=0]="XML",a[a.HTML=1]="HTML"})(s=t.EntityLevel||(t.EntityLevel={}));var n;(function(a){a[a.UTF8=0]="UTF8",a[a.ASCII=1]="ASCII",a[a.Extensive=2]="Extensive",a[a.Attribute=3]="Attribute",a[a.Text=4]="Text"})(n=t.EncodingMode||(t.EncodingMode={}));function o(a,d){d===void 0&&(d=s.XML);var p=typeof d=="number"?d:d.level;if(p===s.HTML){var b=typeof d=="object"?d.mode:void 0;return(0,e.decodeHTML)(a,b)}return(0,e.decodeXML)(a)}t.decode=o;function l(a,d){var p;d===void 0&&(d=s.XML);var b=typeof d=="number"?{level:d}:d;return(p=b.mode)!==null&&p!==void 0||(b.mode=e.DecodingMode.Strict),o(a,b)}t.decodeStrict=l;function u(a,d){d===void 0&&(d=s.XML);var p=typeof d=="number"?{level:d}:d;return p.mode===n.UTF8?(0,r.escapeUTF8)(a):p.mode===n.Attribute?(0,r.escapeAttribute)(a):p.mode===n.Text?(0,r.escapeText)(a):p.level===s.HTML?p.mode===n.ASCII?(0,i.encodeNonAsciiHTML)(a):(0,i.encodeHTML)(a):(0,r.encodeXML)(a)}t.encode=u;var c=_a();Object.defineProperty(t,"encodeXML",{enumerable:!0,get:function(){return c.encodeXML}}),Object.defineProperty(t,"escape",{enumerable:!0,get:function(){return c.escape}}),Object.defineProperty(t,"escapeUTF8",{enumerable:!0,get:function(){return c.escapeUTF8}}),Object.defineProperty(t,"escapeAttribute",{enumerable:!0,get:function(){return c.escapeAttribute}}),Object.defineProperty(t,"escapeText",{enumerable:!0,get:function(){return c.escapeText}});var h=zu();Object.defineProperty(t,"encodeHTML",{enumerable:!0,get:function(){return h.encodeHTML}}),Object.defineProperty(t,"encodeNonAsciiHTML",{enumerable:!0,get:function(){return h.encodeNonAsciiHTML}}),Object.defineProperty(t,"encodeHTML4",{enumerable:!0,get:function(){return h.encodeHTML}}),Object.defineProperty(t,"encodeHTML5",{enumerable:!0,get:function(){return h.encodeHTML}});var f=dn();Object.defineProperty(t,"EntityDecoder",{enumerable:!0,get:function(){return f.EntityDecoder}}),Object.defineProperty(t,"DecodingMode",{enumerable:!0,get:function(){return f.DecodingMode}}),Object.defineProperty(t,"decodeXML",{enumerable:!0,get:function(){return f.decodeXML}}),Object.defineProperty(t,"decodeHTML",{enumerable:!0,get:function(){return f.decodeHTML}}),Object.defineProperty(t,"decodeHTMLStrict",{enumerable:!0,get:function(){return f.decodeHTMLStrict}}),Object.defineProperty(t,"decodeHTMLAttribute",{enumerable:!0,get:function(){return f.decodeHTMLAttribute}}),Object.defineProperty(t,"decodeHTML4",{enumerable:!0,get:function(){return f.decodeHTML}}),Object.defineProperty(t,"decodeHTML5",{enumerable:!0,get:function(){return f.decodeHTML}}),Object.defineProperty(t,"decodeHTML4Strict",{enumerable:!0,get:function(){return f.decodeHTMLStrict}}),Object.defineProperty(t,"decodeHTML5Strict",{enumerable:!0,get:function(){return f.decodeHTMLStrict}}),Object.defineProperty(t,"decodeXMLStrict",{enumerable:!0,get:function(){return f.decodeXML}})})(vo)),vo}var bi={},Bu;function Ly(){return Bu||(Bu=1,Object.defineProperty(bi,"__esModule",{value:!0}),bi.attributeNames=bi.elementNames=void 0,bi.elementNames=new Map(["altGlyph","altGlyphDef","altGlyphItem","animateColor","animateMotion","animateTransform","clipPath","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","foreignObject","glyphRef","linearGradient","radialGradient","textPath"].map(function(t){return[t.toLowerCase(),t]})),bi.attributeNames=new Map(["definitionURL","attributeName","attributeType","baseFrequency","baseProfile","calcMode","clipPathUnits","diffuseConstant","edgeMode","filterUnits","glyphRef","gradientTransform","gradientUnits","kernelMatrix","kernelUnitLength","keyPoints","keySplines","keyTimes","lengthAdjust","limitingConeAngle","markerHeight","markerUnits","markerWidth","maskContentUnits","maskUnits","numOctaves","pathLength","patternContentUnits","patternTransform","patternUnits","pointsAtX","pointsAtY","pointsAtZ","preserveAlpha","preserveAspectRatio","primitiveUnits","refX","refY","repeatCount","repeatDur","requiredExtensions","requiredFeatures","specularConstant","specularExponent","spreadMethod","startOffset","stdDeviation","stitchTiles","surfaceScale","systemLanguage","tableValues","targetX","targetY","textLength","viewBox","viewTarget","xChannelSelector","yChannelSelector","zoomAndPan"].map(function(t){return[t.toLowerCase(),t]}))),bi}var Fu;function Ny(){if(Fu)return je;Fu=1;var t=je&&je.__assign||function(){return t=Object.assign||function(v){for(var y,S=1,C=arguments.length;S<C;S++){y=arguments[S];for(var A in y)Object.prototype.hasOwnProperty.call(y,A)&&(v[A]=y[A])}return v},t.apply(this,arguments)},e=je&&je.__createBinding||(Object.create?(function(v,y,S,C){C===void 0&&(C=S);var A=Object.getOwnPropertyDescriptor(y,S);(!A||("get"in A?!y.__esModule:A.writable||A.configurable))&&(A={enumerable:!0,get:function(){return y[S]}}),Object.defineProperty(v,C,A)}):(function(v,y,S,C){C===void 0&&(C=S),v[C]=y[S]})),i=je&&je.__setModuleDefault||(Object.create?(function(v,y){Object.defineProperty(v,"default",{enumerable:!0,value:y})}):function(v,y){v.default=y}),r=je&&je.__importStar||function(v){if(v&&v.__esModule)return v;var y={};if(v!=null)for(var S in v)S!=="default"&&Object.prototype.hasOwnProperty.call(v,S)&&e(y,v,S);return i(y,v),y};Object.defineProperty(je,"__esModule",{value:!0}),je.render=void 0;var s=r(ms()),n=Iy(),o=Ly(),l=new Set(["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"]);function u(v){return v.replace(/"/g,"&quot;")}function c(v,y){var S;if(v){var C=((S=y.encodeEntities)!==null&&S!==void 0?S:y.decodeEntities)===!1?u:y.xmlMode||y.encodeEntities!=="utf8"?n.encodeXML:n.escapeAttribute;return Object.keys(v).map(function(A){var T,$,E=(T=v[A])!==null&&T!==void 0?T:"";return y.xmlMode==="foreign"&&(A=($=o.attributeNames.get(A))!==null&&$!==void 0?$:A),!y.emptyAttrs&&!y.xmlMode&&E===""?A:"".concat(A,'="').concat(C(E),'"')}).join(" ")}}var h=new Set(["area","base","basefont","br","col","command","embed","frame","hr","img","input","isindex","keygen","link","meta","param","source","track","wbr"]);function f(v,y){y===void 0&&(y={});for(var S=("length"in v)?v:[v],C="",A=0;A<S.length;A++)C+=a(S[A],y);return C}je.render=f,je.default=f;function a(v,y){switch(v.type){case s.Root:return f(v.children,y);case s.Doctype:case s.Directive:return w(v);case s.Comment:return _(v);case s.CDATA:return x(v);case s.Script:case s.Style:case s.Tag:return b(v,y);case s.Text:return g(v,y)}}var d=new Set(["mi","mo","mn","ms","mtext","annotation-xml","foreignObject","desc","title"]),p=new Set(["svg","math"]);function b(v,y){var S;y.xmlMode==="foreign"&&(v.name=(S=o.elementNames.get(v.name))!==null&&S!==void 0?S:v.name,v.parent&&d.has(v.parent.name)&&(y=t(t({},y),{xmlMode:!1}))),!y.xmlMode&&p.has(v.name)&&(y=t(t({},y),{xmlMode:"foreign"}));var C="<".concat(v.name),A=c(v.attribs,y);return A&&(C+=" ".concat(A)),v.children.length===0&&(y.xmlMode?y.selfClosingTags!==!1:y.selfClosingTags&&h.has(v.name))?(y.xmlMode||(C+=" "),C+="/>"):(C+=">",v.children.length>0&&(C+=f(v.children,y)),(y.xmlMode||!h.has(v.name))&&(C+="</".concat(v.name,">"))),C}function w(v){return"<".concat(v.data,">")}function g(v,y){var S,C=v.data||"";return((S=y.encodeEntities)!==null&&S!==void 0?S:y.decodeEntities)!==!1&&!(!y.xmlMode&&v.parent&&l.has(v.parent.name))&&(C=y.xmlMode||y.encodeEntities!=="utf8"?(0,n.encodeXML)(C):(0,n.escapeText)(C)),C}function x(v){return"<![CDATA[".concat(v.children[0].data,"]]>")}function _(v){return"<!--".concat(v.data,"-->")}return je}var qu;function Ah(){if(qu)return Ot;qu=1;var t=Ot&&Ot.__importDefault||function(c){return c&&c.__esModule?c:{default:c}};Object.defineProperty(Ot,"__esModule",{value:!0}),Ot.getOuterHTML=s,Ot.getInnerHTML=n,Ot.getText=o,Ot.textContent=l,Ot.innerText=u;var e=ai(),i=t(Ny()),r=ms();function s(c,h){return(0,i.default)(c,h)}function n(c,h){return(0,e.hasChildren)(c)?c.children.map(function(f){return s(f,h)}).join(""):""}function o(c){return Array.isArray(c)?c.map(o).join(""):(0,e.isTag)(c)?c.name==="br"?`
`:o(c.children):(0,e.isCDATA)(c)?o(c.children):(0,e.isText)(c)?c.data:""}function l(c){return Array.isArray(c)?c.map(l).join(""):(0,e.hasChildren)(c)&&!(0,e.isComment)(c)?l(c.children):(0,e.isText)(c)?c.data:""}function u(c){return Array.isArray(c)?c.map(u).join(""):(0,e.hasChildren)(c)&&(c.type===r.ElementType.Tag||(0,e.isCDATA)(c))?u(c.children):(0,e.isText)(c)?c.data:""}return Ot}var bt={},Uu;function Dy(){if(Uu)return bt;Uu=1,Object.defineProperty(bt,"__esModule",{value:!0}),bt.getChildren=e,bt.getParent=i,bt.getSiblings=r,bt.getAttributeValue=s,bt.hasAttrib=n,bt.getName=o,bt.nextElementSibling=l,bt.prevElementSibling=u;var t=ai();function e(c){return(0,t.hasChildren)(c)?c.children:[]}function i(c){return c.parent||null}function r(c){var h,f,a=i(c);if(a!=null)return e(a);for(var d=[c],p=c.prev,b=c.next;p!=null;)d.unshift(p),h=p,p=h.prev;for(;b!=null;)d.push(b),f=b,b=f.next;return d}function s(c,h){var f;return(f=c.attribs)===null||f===void 0?void 0:f[h]}function n(c,h){return c.attribs!=null&&Object.prototype.hasOwnProperty.call(c.attribs,h)&&c.attribs[h]!=null}function o(c){return c.name}function l(c){for(var h,f=c.next;f!==null&&!(0,t.isTag)(f);)h=f,f=h.next;return f}function u(c){for(var h,f=c.prev;f!==null&&!(0,t.isTag)(f);)h=f,f=h.prev;return f}return bt}var Vt={},Vu;function Py(){if(Vu)return Vt;Vu=1,Object.defineProperty(Vt,"__esModule",{value:!0}),Vt.removeElement=t,Vt.replaceElement=e,Vt.appendChild=i,Vt.append=r,Vt.prependChild=s,Vt.prepend=n;function t(o){if(o.prev&&(o.prev.next=o.next),o.next&&(o.next.prev=o.prev),o.parent){var l=o.parent.children,u=l.lastIndexOf(o);u>=0&&l.splice(u,1)}o.next=null,o.prev=null,o.parent=null}function e(o,l){var u=l.prev=o.prev;u&&(u.next=l);var c=l.next=o.next;c&&(c.prev=l);var h=l.parent=o.parent;if(h){var f=h.children;f[f.lastIndexOf(o)]=l,o.parent=null}}function i(o,l){if(t(l),l.next=null,l.parent=o,o.children.push(l)>1){var u=o.children[o.children.length-2];u.next=l,l.prev=u}else l.prev=null}function r(o,l){t(l);var u=o.parent,c=o.next;if(l.next=c,l.prev=o,o.next=l,l.parent=u,c){if(c.prev=l,u){var h=u.children;h.splice(h.lastIndexOf(c),0,l)}}else u&&u.children.push(l)}function s(o,l){if(t(l),l.parent=o,l.prev=null,o.children.unshift(l)!==1){var u=o.children[1];u.prev=l,l.next=u}else l.next=null}function n(o,l){t(l);var u=o.parent;if(u){var c=u.children;c.splice(c.indexOf(o),0,l)}o.prev&&(o.prev.next=l),l.parent=u,l.prev=o.prev,l.next=o,o.prev=l}return Vt}var jt={},ju;function Eh(){if(ju)return jt;ju=1,Object.defineProperty(jt,"__esModule",{value:!0}),jt.filter=e,jt.find=i,jt.findOneChild=r,jt.findOne=s,jt.existsOne=n,jt.findAll=o;var t=ai();function e(l,u,c,h){return c===void 0&&(c=!0),h===void 0&&(h=1/0),i(l,Array.isArray(u)?u:[u],c,h)}function i(l,u,c,h){for(var f=[],a=[Array.isArray(u)?u:[u]],d=[0];;){if(d[0]>=a[0].length){if(d.length===1)return f;a.shift(),d.shift();continue}var p=a[0][d[0]++];if(l(p)&&(f.push(p),--h<=0))return f;c&&(0,t.hasChildren)(p)&&p.children.length>0&&(d.unshift(0),a.unshift(p.children))}}function r(l,u){return u.find(l)}function s(l,u,c){c===void 0&&(c=!0);for(var h=Array.isArray(u)?u:[u],f=0;f<h.length;f++){var a=h[f];if((0,t.isTag)(a)&&l(a))return a;if(c&&(0,t.hasChildren)(a)&&a.children.length>0){var d=s(l,a.children,!0);if(d)return d}}return null}function n(l,u){return(Array.isArray(u)?u:[u]).some(function(c){return(0,t.isTag)(c)&&l(c)||(0,t.hasChildren)(c)&&n(l,c.children)})}function o(l,u){for(var c=[],h=[Array.isArray(u)?u:[u]],f=[0];;){if(f[0]>=h[0].length){if(h.length===1)return c;h.shift(),f.shift();continue}var a=h[0][f[0]++];(0,t.isTag)(a)&&l(a)&&c.push(a),(0,t.hasChildren)(a)&&a.children.length>0&&(f.unshift(0),h.unshift(a.children))}}return jt}var Ht={},Hu;function Th(){if(Hu)return Ht;Hu=1,Object.defineProperty(Ht,"__esModule",{value:!0}),Ht.testElement=o,Ht.getElements=l,Ht.getElementById=u,Ht.getElementsByTagName=c,Ht.getElementsByClassName=h,Ht.getElementsByTagType=f;var t=ai(),e=Eh(),i={tag_name:function(a){return typeof a=="function"?function(d){return(0,t.isTag)(d)&&a(d.name)}:a==="*"?t.isTag:function(d){return(0,t.isTag)(d)&&d.name===a}},tag_type:function(a){return typeof a=="function"?function(d){return a(d.type)}:function(d){return d.type===a}},tag_contains:function(a){return typeof a=="function"?function(d){return(0,t.isText)(d)&&a(d.data)}:function(d){return(0,t.isText)(d)&&d.data===a}}};function r(a,d){return typeof d=="function"?function(p){return(0,t.isTag)(p)&&d(p.attribs[a])}:function(p){return(0,t.isTag)(p)&&p.attribs[a]===d}}function s(a,d){return function(p){return a(p)||d(p)}}function n(a){var d=Object.keys(a).map(function(p){var b=a[p];return Object.prototype.hasOwnProperty.call(i,p)?i[p](b):r(p,b)});return d.length===0?null:d.reduce(s)}function o(a,d){var p=n(a);return p?p(d):!0}function l(a,d,p,b){b===void 0&&(b=1/0);var w=n(a);return w?(0,e.filter)(w,d,p,b):[]}function u(a,d,p){return p===void 0&&(p=!0),Array.isArray(d)||(d=[d]),(0,e.findOne)(r("id",a),d,p)}function c(a,d,p,b){return p===void 0&&(p=!0),b===void 0&&(b=1/0),(0,e.filter)(i.tag_name(a),d,p,b)}function h(a,d,p,b){return p===void 0&&(p=!0),b===void 0&&(b=1/0),(0,e.filter)(r("class",a),d,p,b)}function f(a,d,p,b){return p===void 0&&(p=!0),b===void 0&&(b=1/0),(0,e.filter)(i.tag_type(a),d,p,b)}return Ht}var Jt={},Ku;function My(){if(Ku)return Jt;Ku=1,Object.defineProperty(Jt,"__esModule",{value:!0}),Jt.DocumentPosition=void 0,Jt.removeSubsets=e,Jt.compareDocumentPosition=r,Jt.uniqueSort=s;var t=ai();function e(n){for(var o=n.length;--o>=0;){var l=n[o];if(o>0&&n.lastIndexOf(l,o-1)>=0){n.splice(o,1);continue}for(var u=l.parent;u;u=u.parent)if(n.includes(u)){n.splice(o,1);break}}return n}var i;(function(n){n[n.DISCONNECTED=1]="DISCONNECTED",n[n.PRECEDING=2]="PRECEDING",n[n.FOLLOWING=4]="FOLLOWING",n[n.CONTAINS=8]="CONTAINS",n[n.CONTAINED_BY=16]="CONTAINED_BY"})(i||(Jt.DocumentPosition=i={}));function r(n,o){var l=[],u=[];if(n===o)return 0;for(var c=(0,t.hasChildren)(n)?n:n.parent;c;)l.unshift(c),c=c.parent;for(c=(0,t.hasChildren)(o)?o:o.parent;c;)u.unshift(c),c=c.parent;for(var h=Math.min(l.length,u.length),f=0;f<h&&l[f]===u[f];)f++;if(f===0)return i.DISCONNECTED;var a=l[f-1],d=a.children,p=l[f],b=u[f];return d.indexOf(p)>d.indexOf(b)?a===o?i.FOLLOWING|i.CONTAINED_BY:i.FOLLOWING:a===n?i.PRECEDING|i.CONTAINS:i.PRECEDING}function s(n){return n=n.filter(function(o,l,u){return!u.includes(o,l+1)}),n.sort(function(o,l){var u=r(o,l);return u&i.PRECEDING?-1:u&i.FOLLOWING?1:0}),n}return Jt}var Ms={},Wu;function zy(){if(Wu)return Ms;Wu=1,Object.defineProperty(Ms,"__esModule",{value:!0}),Ms.getFeed=i;var t=Ah(),e=Th();function i(a){var d=u(f,a);return d?d.name==="feed"?r(d):s(d):null}function r(a){var d,p=a.children,b={type:"atom",items:(0,e.getElementsByTagName)("entry",p).map(function(x){var _,v=x.children,y={media:l(v)};h(y,"id","id",v),h(y,"title","title",v);var S=(_=u("link",v))===null||_===void 0?void 0:_.attribs.href;S&&(y.link=S);var C=c("summary",v)||c("content",v);C&&(y.description=C);var A=c("updated",v);return A&&(y.pubDate=new Date(A)),y})};h(b,"id","id",p),h(b,"title","title",p);var w=(d=u("link",p))===null||d===void 0?void 0:d.attribs.href;w&&(b.link=w),h(b,"description","subtitle",p);var g=c("updated",p);return g&&(b.updated=new Date(g)),h(b,"author","email",p,!0),b}function s(a){var d,p,b=(p=(d=u("channel",a.children))===null||d===void 0?void 0:d.children)!==null&&p!==void 0?p:[],w={type:a.name.substr(0,3),id:"",items:(0,e.getElementsByTagName)("item",a.children).map(function(x){var _=x.children,v={media:l(_)};h(v,"id","guid",_),h(v,"title","title",_),h(v,"link","link",_),h(v,"description","description",_);var y=c("pubDate",_)||c("dc:date",_);return y&&(v.pubDate=new Date(y)),v})};h(w,"title","title",b),h(w,"link","link",b),h(w,"description","description",b);var g=c("lastBuildDate",b);return g&&(w.updated=new Date(g)),h(w,"author","managingEditor",b,!0),w}var n=["url","type","lang"],o=["fileSize","bitrate","framerate","samplingrate","channels","duration","height","width"];function l(a){return(0,e.getElementsByTagName)("media:content",a).map(function(d){for(var p=d.attribs,b={medium:p.medium,isDefault:!!p.isDefault},w=0,g=n;w<g.length;w++){var x=g[w];p[x]&&(b[x]=p[x])}for(var _=0,v=o;_<v.length;_++){var x=v[_];p[x]&&(b[x]=parseInt(p[x],10))}return p.expression&&(b.expression=p.expression),b})}function u(a,d){return(0,e.getElementsByTagName)(a,d,!0,1)[0]}function c(a,d,p){return p===void 0&&(p=!1),(0,t.textContent)((0,e.getElementsByTagName)(a,d,p,1)).trim()}function h(a,d,p,b,w){w===void 0&&(w=!1);var g=c(p,b,w);g&&(a[d]=g)}function f(a){return a==="rss"||a==="feed"||a==="rdf:RDF"}return Ms}var Gu;function xo(){return Gu||(Gu=1,(function(t){var e=mi&&mi.__createBinding||(Object.create?(function(s,n,o,l){l===void 0&&(l=o);var u=Object.getOwnPropertyDescriptor(n,o);(!u||("get"in u?!n.__esModule:u.writable||u.configurable))&&(u={enumerable:!0,get:function(){return n[o]}}),Object.defineProperty(s,l,u)}):(function(s,n,o,l){l===void 0&&(l=o),s[l]=n[o]})),i=mi&&mi.__exportStar||function(s,n){for(var o in s)o!=="default"&&!Object.prototype.hasOwnProperty.call(n,o)&&e(n,s,o)};Object.defineProperty(t,"__esModule",{value:!0}),t.hasChildren=t.isDocument=t.isComment=t.isText=t.isCDATA=t.isTag=void 0,i(Ah(),t),i(Dy(),t),i(Py(),t),i(Eh(),t),i(Th(),t),i(My(),t),i(zy(),t);var r=ai();Object.defineProperty(t,"isTag",{enumerable:!0,get:function(){return r.isTag}}),Object.defineProperty(t,"isCDATA",{enumerable:!0,get:function(){return r.isCDATA}}),Object.defineProperty(t,"isText",{enumerable:!0,get:function(){return r.isText}}),Object.defineProperty(t,"isComment",{enumerable:!0,get:function(){return r.isComment}}),Object.defineProperty(t,"isDocument",{enumerable:!0,get:function(){return r.isDocument}}),Object.defineProperty(t,"hasChildren",{enumerable:!0,get:function(){return r.hasChildren}})})(mi)),mi}var Yu;function Ry(){return Yu||(Yu=1,(function(t){var e=ft&&ft.__createBinding||(Object.create?(function(g,x,_,v){v===void 0&&(v=_);var y=Object.getOwnPropertyDescriptor(x,_);(!y||("get"in y?!x.__esModule:y.writable||y.configurable))&&(y={enumerable:!0,get:function(){return x[_]}}),Object.defineProperty(g,v,y)}):(function(g,x,_,v){v===void 0&&(v=_),g[v]=x[_]})),i=ft&&ft.__setModuleDefault||(Object.create?(function(g,x){Object.defineProperty(g,"default",{enumerable:!0,value:x})}):function(g,x){g.default=x}),r=ft&&ft.__importStar||function(g){if(g&&g.__esModule)return g;var x={};if(g!=null)for(var _ in g)_!=="default"&&Object.prototype.hasOwnProperty.call(g,_)&&e(x,g,_);return i(x,g),x},s=ft&&ft.__importDefault||function(g){return g&&g.__esModule?g:{default:g}};Object.defineProperty(t,"__esModule",{value:!0}),t.DomUtils=t.parseFeed=t.getFeed=t.ElementType=t.Tokenizer=t.createDomStream=t.parseDOM=t.parseDocument=t.DefaultHandler=t.DomHandler=t.Parser=void 0;var n=Ou(),o=Ou();Object.defineProperty(t,"Parser",{enumerable:!0,get:function(){return o.Parser}});var l=ai(),u=ai();Object.defineProperty(t,"DomHandler",{enumerable:!0,get:function(){return u.DomHandler}}),Object.defineProperty(t,"DefaultHandler",{enumerable:!0,get:function(){return u.DomHandler}});function c(g,x){var _=new l.DomHandler(void 0,x);return new n.Parser(_,x).end(g),_.root}t.parseDocument=c;function h(g,x){return c(g,x).children}t.parseDOM=h;function f(g,x,_){var v=new l.DomHandler(g,x,_);return new n.Parser(v,x)}t.createDomStream=f;var a=Ch();Object.defineProperty(t,"Tokenizer",{enumerable:!0,get:function(){return s(a).default}}),t.ElementType=r(ms());var d=xo(),p=xo();Object.defineProperty(t,"getFeed",{enumerable:!0,get:function(){return p.getFeed}});var b={xmlMode:!0};function w(g,x){return x===void 0&&(x=b),(0,d.getFeed)(h(g,x))}t.parseFeed=w,t.DomUtils=r(xo())})(ft)),ft}var _o,Xu;function By(){return Xu||(Xu=1,_o=t=>{if(typeof t!="string")throw new TypeError("Expected a string");return t.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&").replace(/-/g,"\\x2d")}),_o}var zs={},Ju;function Fy(){if(Ju)return zs;Ju=1,Object.defineProperty(zs,"__esModule",{value:!0});/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */function t(i){return Object.prototype.toString.call(i)==="[object Object]"}function e(i){var r,s;return t(i)===!1?!1:(r=i.constructor,r===void 0?!0:(s=r.prototype,!(t(s)===!1||s.hasOwnProperty("isPrototypeOf")===!1)))}return zs.isPlainObject=e,zs}var ko,Qu;function qy(){if(Qu)return ko;Qu=1;var t=function(x){return e(x)&&!i(x)};function e(g){return!!g&&typeof g=="object"}function i(g){var x=Object.prototype.toString.call(g);return x==="[object RegExp]"||x==="[object Date]"||n(g)}var r=typeof Symbol=="function"&&Symbol.for,s=r?Symbol.for("react.element"):60103;function n(g){return g.$$typeof===s}function o(g){return Array.isArray(g)?[]:{}}function l(g,x){return x.clone!==!1&&x.isMergeableObject(g)?b(o(g),g,x):g}function u(g,x,_){return g.concat(x).map(function(v){return l(v,_)})}function c(g,x){if(!x.customMerge)return b;var _=x.customMerge(g);return typeof _=="function"?_:b}function h(g){return Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(g).filter(function(x){return Object.propertyIsEnumerable.call(g,x)}):[]}function f(g){return Object.keys(g).concat(h(g))}function a(g,x){try{return x in g}catch{return!1}}function d(g,x){return a(g,x)&&!(Object.hasOwnProperty.call(g,x)&&Object.propertyIsEnumerable.call(g,x))}function p(g,x,_){var v={};return _.isMergeableObject(g)&&f(g).forEach(function(y){v[y]=l(g[y],_)}),f(x).forEach(function(y){d(g,y)||(a(g,y)&&_.isMergeableObject(x[y])?v[y]=c(y,_)(g[y],x[y],_):v[y]=l(x[y],_))}),v}function b(g,x,_){_=_||{},_.arrayMerge=_.arrayMerge||u,_.isMergeableObject=_.isMergeableObject||t,_.cloneUnlessOtherwiseSpecified=l;var v=Array.isArray(x),y=Array.isArray(g),S=v===y;return S?v?_.arrayMerge(g,x,_):p(g,x,_):l(x,_)}b.all=function(x,_){if(!Array.isArray(x))throw new Error("first argument should be an array");return x.reduce(function(v,y){return b(v,y,_)},{})};var w=b;return ko=w,ko}var Xs={exports:{}},Uy=Xs.exports,Zu;function Vy(){return Zu||(Zu=1,(function(t){(function(e,i){t.exports?t.exports=i():e.parseSrcset=i()})(Uy,function(){return function(e){function i(v){return v===" "||v==="	"||v===`
`||v==="\f"||v==="\r"}function r(v){var y,S=v.exec(e.substring(w));if(S)return y=S[0],w+=y.length,y}for(var s=e.length,n=/^[ \t\n\r\u000c]+/,o=/^[, \t\n\r\u000c]+/,l=/^[^ \t\n\r\u000c]+/,u=/[,]+$/,c=/^\d+$/,h=/^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/,f,a,d,p,b,w=0,g=[];;){if(r(o),w>=s)return g;f=r(l),a=[],f.slice(-1)===","?(f=f.replace(u,""),_()):x()}function x(){for(r(n),d="",p="in descriptor";;){if(b=e.charAt(w),p==="in descriptor")if(i(b))d&&(a.push(d),d="",p="after descriptor");else if(b===","){w+=1,d&&a.push(d),_();return}else if(b==="(")d=d+b,p="in parens";else if(b===""){d&&a.push(d),_();return}else d=d+b;else if(p==="in parens")if(b===")")d=d+b,p="in descriptor";else if(b===""){a.push(d),_();return}else d=d+b;else if(p==="after descriptor"&&!i(b))if(b===""){_();return}else p="in descriptor",w-=1;w+=1}}function _(){var v=!1,y,S,C,A,T={},$,E,O,D,z;for(A=0;A<a.length;A++)$=a[A],E=$[$.length-1],O=$.substring(0,$.length-1),D=parseInt(O,10),z=parseFloat(O),c.test(O)&&E==="w"?((y||S)&&(v=!0),D===0?v=!0:y=D):h.test(O)&&E==="x"?((y||S||C)&&(v=!0),z<0?v=!0:S=z):c.test(O)&&E==="h"?((C||S)&&(v=!0),D===0?v=!0:C=D):v=!0;v?console&&console.log&&console.log("Invalid srcset descriptor found in '"+e+"' at '"+$+"'."):(T.url=f,y&&(T.w=y),S&&(T.d=S),C&&(T.h=C),g.push(T))}}})})(Xs)),Xs.exports}var Rs={exports:{}},ec;function jy(){if(ec)return Rs.exports;ec=1;var t=String,e=function(){return{isColorSupported:!1,reset:t,bold:t,dim:t,italic:t,underline:t,inverse:t,hidden:t,strikethrough:t,black:t,red:t,green:t,yellow:t,blue:t,magenta:t,cyan:t,white:t,gray:t,bgBlack:t,bgRed:t,bgGreen:t,bgYellow:t,bgBlue:t,bgMagenta:t,bgCyan:t,bgWhite:t,blackBright:t,redBright:t,greenBright:t,yellowBright:t,blueBright:t,magentaBright:t,cyanBright:t,whiteBright:t,bgBlackBright:t,bgRedBright:t,bgGreenBright:t,bgYellowBright:t,bgBlueBright:t,bgMagentaBright:t,bgCyanBright:t,bgWhiteBright:t}};return Rs.exports=e(),Rs.exports.createColors=e,Rs.exports}const Hy={},Ky=Object.freeze(Object.defineProperty({__proto__:null,default:Hy},Symbol.toStringTag,{value:"Module"})),yt=Ey(Ky);var So,tc;function al(){if(tc)return So;tc=1;let t=jy(),e=yt;class i extends Error{constructor(s,n,o,l,u,c){super(s),this.name="CssSyntaxError",this.reason=s,u&&(this.file=u),l&&(this.source=l),c&&(this.plugin=c),typeof n<"u"&&typeof o<"u"&&(typeof n=="number"?(this.line=n,this.column=o):(this.line=n.line,this.column=n.column,this.endLine=o.line,this.endColumn=o.column)),this.setMessage(),Error.captureStackTrace&&Error.captureStackTrace(this,i)}setMessage(){this.message=this.plugin?this.plugin+": ":"",this.message+=this.file?this.file:"<css input>",typeof this.line<"u"&&(this.message+=":"+this.line+":"+this.column),this.message+=": "+this.reason}showSourceCode(s){if(!this.source)return"";let n=this.source;s==null&&(s=t.isColorSupported);let o=d=>d,l=d=>d,u=d=>d;if(s){let{bold:d,gray:p,red:b}=t.createColors(!0);l=w=>d(b(w)),o=w=>p(w),e&&(u=w=>e(w))}let c=n.split(/\r?\n/),h=Math.max(this.line-3,0),f=Math.min(this.line+2,c.length),a=String(f).length;return c.slice(h,f).map((d,p)=>{let b=h+1+p,w=" "+(" "+b).slice(-a)+" | ";if(b===this.line){if(d.length>160){let x=20,_=Math.max(0,this.column-x),v=Math.max(this.column+x,this.endColumn+x),y=d.slice(_,v),S=o(w.replace(/\d/g," "))+d.slice(0,Math.min(this.column-1,x-1)).replace(/[^\t]/g," ");return l(">")+o(w)+u(y)+`
 `+S+l("^")}let g=o(w.replace(/\d/g," "))+d.slice(0,this.column-1).replace(/[^\t]/g," ");return l(">")+o(w)+u(d)+`
 `+g+l("^")}return" "+o(w)+u(d)}).join(`
`)}toString(){let s=this.showSourceCode();return s&&(s=`

`+s+`
`),this.name+": "+this.message+s}}return So=i,i.default=i,So}var Co,ic;function Oh(){if(ic)return Co;ic=1;const t={after:`
`,beforeClose:`
`,beforeComment:`
`,beforeDecl:`
`,beforeOpen:" ",beforeRule:`
`,colon:": ",commentLeft:" ",commentRight:" ",emptyBody:"",indent:"    ",semicolon:!1};function e(r){return r[0].toUpperCase()+r.slice(1)}class i{constructor(s){this.builder=s}atrule(s,n){let o="@"+s.name,l=s.params?this.rawValue(s,"params"):"";if(typeof s.raws.afterName<"u"?o+=s.raws.afterName:l&&(o+=" "),s.nodes)this.block(s,o+l);else{let u=(s.raws.between||"")+(n?";":"");this.builder(o+l+u,s)}}beforeAfter(s,n){let o;s.type==="decl"?o=this.raw(s,null,"beforeDecl"):s.type==="comment"?o=this.raw(s,null,"beforeComment"):n==="before"?o=this.raw(s,null,"beforeRule"):o=this.raw(s,null,"beforeClose");let l=s.parent,u=0;for(;l&&l.type!=="root";)u+=1,l=l.parent;if(o.includes(`
`)){let c=this.raw(s,null,"indent");if(c.length)for(let h=0;h<u;h++)o+=c}return o}block(s,n){let o=this.raw(s,"between","beforeOpen");this.builder(n+o+"{",s,"start");let l;s.nodes&&s.nodes.length?(this.body(s),l=this.raw(s,"after")):l=this.raw(s,"after","emptyBody"),l&&this.builder(l),this.builder("}",s,"end")}body(s){let n=s.nodes.length-1;for(;n>0&&s.nodes[n].type==="comment";)n-=1;let o=this.raw(s,"semicolon");for(let l=0;l<s.nodes.length;l++){let u=s.nodes[l],c=this.raw(u,"before");c&&this.builder(c),this.stringify(u,n!==l||o)}}comment(s){let n=this.raw(s,"left","commentLeft"),o=this.raw(s,"right","commentRight");this.builder("/*"+n+s.text+o+"*/",s)}decl(s,n){let o=this.raw(s,"between","colon"),l=s.prop+o+this.rawValue(s,"value");s.important&&(l+=s.raws.important||" !important"),n&&(l+=";"),this.builder(l,s)}document(s){this.body(s)}raw(s,n,o){let l;if(o||(o=n),n&&(l=s.raws[n],typeof l<"u"))return l;let u=s.parent;if(o==="before"&&(!u||u.type==="root"&&u.first===s||u&&u.type==="document"))return"";if(!u)return t[o];let c=s.root();if(c.rawCache||(c.rawCache={}),typeof c.rawCache[o]<"u")return c.rawCache[o];if(o==="before"||o==="after")return this.beforeAfter(s,o);{let h="raw"+e(o);this[h]?l=this[h](c,s):c.walk(f=>{if(l=f.raws[n],typeof l<"u")return!1})}return typeof l>"u"&&(l=t[o]),c.rawCache[o]=l,l}rawBeforeClose(s){let n;return s.walk(o=>{if(o.nodes&&o.nodes.length>0&&typeof o.raws.after<"u")return n=o.raws.after,n.includes(`
`)&&(n=n.replace(/[^\n]+$/,"")),!1}),n&&(n=n.replace(/\S/g,"")),n}rawBeforeComment(s,n){let o;return s.walkComments(l=>{if(typeof l.raws.before<"u")return o=l.raws.before,o.includes(`
`)&&(o=o.replace(/[^\n]+$/,"")),!1}),typeof o>"u"?o=this.raw(n,null,"beforeDecl"):o&&(o=o.replace(/\S/g,"")),o}rawBeforeDecl(s,n){let o;return s.walkDecls(l=>{if(typeof l.raws.before<"u")return o=l.raws.before,o.includes(`
`)&&(o=o.replace(/[^\n]+$/,"")),!1}),typeof o>"u"?o=this.raw(n,null,"beforeRule"):o&&(o=o.replace(/\S/g,"")),o}rawBeforeOpen(s){let n;return s.walk(o=>{if(o.type!=="decl"&&(n=o.raws.between,typeof n<"u"))return!1}),n}rawBeforeRule(s){let n;return s.walk(o=>{if(o.nodes&&(o.parent!==s||s.first!==o)&&typeof o.raws.before<"u")return n=o.raws.before,n.includes(`
`)&&(n=n.replace(/[^\n]+$/,"")),!1}),n&&(n=n.replace(/\S/g,"")),n}rawColon(s){let n;return s.walkDecls(o=>{if(typeof o.raws.between<"u")return n=o.raws.between.replace(/[^\s:]/g,""),!1}),n}rawEmptyBody(s){let n;return s.walk(o=>{if(o.nodes&&o.nodes.length===0&&(n=o.raws.after,typeof n<"u"))return!1}),n}rawIndent(s){if(s.raws.indent)return s.raws.indent;let n;return s.walk(o=>{let l=o.parent;if(l&&l!==s&&l.parent&&l.parent===s&&typeof o.raws.before<"u"){let u=o.raws.before.split(`
`);return n=u[u.length-1],n=n.replace(/\S/g,""),!1}}),n}rawSemicolon(s){let n;return s.walk(o=>{if(o.nodes&&o.nodes.length&&o.last.type==="decl"&&(n=o.raws.semicolon,typeof n<"u"))return!1}),n}rawValue(s,n){let o=s[n],l=s.raws[n];return l&&l.value===o?l.raw:o}root(s){this.body(s),s.raws.after&&this.builder(s.raws.after)}rule(s){this.block(s,this.rawValue(s,"selector")),s.raws.ownSemicolon&&this.builder(s.raws.ownSemicolon,s,"end")}stringify(s,n){if(!this[s.type])throw new Error("Unknown AST node type "+s.type+". Maybe you need to change PostCSS stringifier.");this[s.type](s,n)}}return Co=i,i.default=i,Co}var Ao,rc;function Bn(){if(rc)return Ao;rc=1;let t=Oh();function e(i,r){new t(r).stringify(i)}return Ao=e,e.default=e,Ao}var Bs={},sc;function ll(){return sc||(sc=1,Bs.isClean=Symbol("isClean"),Bs.my=Symbol("my")),Bs}var Eo,nc;function Fn(){if(nc)return Eo;nc=1;let t=al(),e=Oh(),i=Bn(),{isClean:r,my:s}=ll();function n(u,c){let h=new u.constructor;for(let f in u){if(!Object.prototype.hasOwnProperty.call(u,f)||f==="proxyCache")continue;let a=u[f],d=typeof a;f==="parent"&&d==="object"?c&&(h[f]=c):f==="source"?h[f]=a:Array.isArray(a)?h[f]=a.map(p=>n(p,h)):(d==="object"&&a!==null&&(a=n(a)),h[f]=a)}return h}function o(u,c){if(c&&typeof c.offset<"u")return c.offset;let h=1,f=1,a=0;for(let d=0;d<u.length;d++){if(f===c.line&&h===c.column){a=d;break}u[d]===`
`?(h=1,f+=1):h+=1}return a}class l{get proxyOf(){return this}constructor(c={}){this.raws={},this[r]=!1,this[s]=!0;for(let h in c)if(h==="nodes"){this.nodes=[];for(let f of c[h])typeof f.clone=="function"?this.append(f.clone()):this.append(f)}else this[h]=c[h]}addToError(c){if(c.postcssNode=this,c.stack&&this.source&&/\n\s{4}at /.test(c.stack)){let h=this.source;c.stack=c.stack.replace(/\n\s{4}at /,`$&${h.input.from}:${h.start.line}:${h.start.column}$&`)}return c}after(c){return this.parent.insertAfter(this,c),this}assign(c={}){for(let h in c)this[h]=c[h];return this}before(c){return this.parent.insertBefore(this,c),this}cleanRaws(c){delete this.raws.before,delete this.raws.after,c||delete this.raws.between}clone(c={}){let h=n(this);for(let f in c)h[f]=c[f];return h}cloneAfter(c={}){let h=this.clone(c);return this.parent.insertAfter(this,h),h}cloneBefore(c={}){let h=this.clone(c);return this.parent.insertBefore(this,h),h}error(c,h={}){if(this.source){let{end:f,start:a}=this.rangeBy(h);return this.source.input.error(c,{column:a.column,line:a.line},{column:f.column,line:f.line},h)}return new t(c)}getProxyProcessor(){return{get(c,h){return h==="proxyOf"?c:h==="root"?()=>c.root().toProxy():c[h]},set(c,h,f){return c[h]===f||(c[h]=f,(h==="prop"||h==="value"||h==="name"||h==="params"||h==="important"||h==="text")&&c.markDirty()),!0}}}markClean(){this[r]=!0}markDirty(){if(this[r]){this[r]=!1;let c=this;for(;c=c.parent;)c[r]=!1}}next(){if(!this.parent)return;let c=this.parent.index(this);return this.parent.nodes[c+1]}positionBy(c={}){let h=this.source.start;if(c.index)h=this.positionInside(c.index);else if(c.word){let f="document"in this.source.input?this.source.input.document:this.source.input.css,d=f.slice(o(f,this.source.start),o(f,this.source.end)).indexOf(c.word);d!==-1&&(h=this.positionInside(d))}return h}positionInside(c){let h=this.source.start.column,f=this.source.start.line,a="document"in this.source.input?this.source.input.document:this.source.input.css,d=o(a,this.source.start),p=d+c;for(let b=d;b<p;b++)a[b]===`
`?(h=1,f+=1):h+=1;return{column:h,line:f,offset:p}}prev(){if(!this.parent)return;let c=this.parent.index(this);return this.parent.nodes[c-1]}rangeBy(c={}){let h="document"in this.source.input?this.source.input.document:this.source.input.css,f={column:this.source.start.column,line:this.source.start.line,offset:o(h,this.source.start)},a=this.source.end?{column:this.source.end.column+1,line:this.source.end.line,offset:typeof this.source.end.offset=="number"?this.source.end.offset:o(h,this.source.end)+1}:{column:f.column+1,line:f.line,offset:f.offset+1};if(c.word){let p=h.slice(o(h,this.source.start),o(h,this.source.end)).indexOf(c.word);p!==-1&&(f=this.positionInside(p),a=this.positionInside(p+c.word.length))}else c.start?f={column:c.start.column,line:c.start.line,offset:o(h,c.start)}:c.index&&(f=this.positionInside(c.index)),c.end?a={column:c.end.column,line:c.end.line,offset:o(h,c.end)}:typeof c.endIndex=="number"?a=this.positionInside(c.endIndex):c.index&&(a=this.positionInside(c.index+1));return(a.line<f.line||a.line===f.line&&a.column<=f.column)&&(a={column:f.column+1,line:f.line,offset:f.offset+1}),{end:a,start:f}}raw(c,h){return new e().raw(this,c,h)}remove(){return this.parent&&this.parent.removeChild(this),this.parent=void 0,this}replaceWith(...c){if(this.parent){let h=this,f=!1;for(let a of c)a===this?f=!0:f?(this.parent.insertAfter(h,a),h=a):this.parent.insertBefore(h,a);f||this.remove()}return this}root(){let c=this;for(;c.parent&&c.parent.type!=="document";)c=c.parent;return c}toJSON(c,h){let f={},a=h==null;h=h||new Map;let d=0;for(let p in this){if(!Object.prototype.hasOwnProperty.call(this,p)||p==="parent"||p==="proxyCache")continue;let b=this[p];if(Array.isArray(b))f[p]=b.map(w=>typeof w=="object"&&w.toJSON?w.toJSON(null,h):w);else if(typeof b=="object"&&b.toJSON)f[p]=b.toJSON(null,h);else if(p==="source"){if(b==null)continue;let w=h.get(b.input);w==null&&(w=d,h.set(b.input,d),d++),f[p]={end:b.end,inputId:w,start:b.start}}else f[p]=b}return a&&(f.inputs=[...h.keys()].map(p=>p.toJSON())),f}toProxy(){return this.proxyCache||(this.proxyCache=new Proxy(this,this.getProxyProcessor())),this.proxyCache}toString(c=i){c.stringify&&(c=c.stringify);let h="";return c(this,f=>{h+=f}),h}warn(c,h,f={}){let a={node:this};for(let d in f)a[d]=f[d];return c.warn(h,a)}}return Eo=l,l.default=l,Eo}var To,oc;function qn(){if(oc)return To;oc=1;let t=Fn();class e extends t{constructor(r){super(r),this.type="comment"}}return To=e,e.default=e,To}var Oo,ac;function Un(){if(ac)return Oo;ac=1;let t=Fn();class e extends t{get variable(){return this.prop.startsWith("--")||this.prop[0]==="$"}constructor(r){r&&typeof r.value<"u"&&typeof r.value!="string"&&(r={...r,value:String(r.value)}),super(r),this.type="decl"}}return Oo=e,e.default=e,Oo}var $o,lc;function qi(){if(lc)return $o;lc=1;let t=qn(),e=Un(),i=Fn(),{isClean:r,my:s}=ll(),n,o,l,u;function c(a){return a.map(d=>(d.nodes&&(d.nodes=c(d.nodes)),delete d.source,d))}function h(a){if(a[r]=!1,a.proxyOf.nodes)for(let d of a.proxyOf.nodes)h(d)}class f extends i{get first(){if(this.proxyOf.nodes)return this.proxyOf.nodes[0]}get last(){if(this.proxyOf.nodes)return this.proxyOf.nodes[this.proxyOf.nodes.length-1]}append(...d){for(let p of d){let b=this.normalize(p,this.last);for(let w of b)this.proxyOf.nodes.push(w)}return this.markDirty(),this}cleanRaws(d){if(super.cleanRaws(d),this.nodes)for(let p of this.nodes)p.cleanRaws(d)}each(d){if(!this.proxyOf.nodes)return;let p=this.getIterator(),b,w;for(;this.indexes[p]<this.proxyOf.nodes.length&&(b=this.indexes[p],w=d(this.proxyOf.nodes[b],b),w!==!1);)this.indexes[p]+=1;return delete this.indexes[p],w}every(d){return this.nodes.every(d)}getIterator(){this.lastEach||(this.lastEach=0),this.indexes||(this.indexes={}),this.lastEach+=1;let d=this.lastEach;return this.indexes[d]=0,d}getProxyProcessor(){return{get(d,p){return p==="proxyOf"?d:d[p]?p==="each"||typeof p=="string"&&p.startsWith("walk")?(...b)=>d[p](...b.map(w=>typeof w=="function"?(g,x)=>w(g.toProxy(),x):w)):p==="every"||p==="some"?b=>d[p]((w,...g)=>b(w.toProxy(),...g)):p==="root"?()=>d.root().toProxy():p==="nodes"?d.nodes.map(b=>b.toProxy()):p==="first"||p==="last"?d[p].toProxy():d[p]:d[p]},set(d,p,b){return d[p]===b||(d[p]=b,(p==="name"||p==="params"||p==="selector")&&d.markDirty()),!0}}}index(d){return typeof d=="number"?d:(d.proxyOf&&(d=d.proxyOf),this.proxyOf.nodes.indexOf(d))}insertAfter(d,p){let b=this.index(d),w=this.normalize(p,this.proxyOf.nodes[b]).reverse();b=this.index(d);for(let x of w)this.proxyOf.nodes.splice(b+1,0,x);let g;for(let x in this.indexes)g=this.indexes[x],b<g&&(this.indexes[x]=g+w.length);return this.markDirty(),this}insertBefore(d,p){let b=this.index(d),w=b===0?"prepend":!1,g=this.normalize(p,this.proxyOf.nodes[b],w).reverse();b=this.index(d);for(let _ of g)this.proxyOf.nodes.splice(b,0,_);let x;for(let _ in this.indexes)x=this.indexes[_],b<=x&&(this.indexes[_]=x+g.length);return this.markDirty(),this}normalize(d,p){if(typeof d=="string")d=c(o(d).nodes);else if(typeof d>"u")d=[];else if(Array.isArray(d)){d=d.slice(0);for(let w of d)w.parent&&w.parent.removeChild(w,"ignore")}else if(d.type==="root"&&this.type!=="document"){d=d.nodes.slice(0);for(let w of d)w.parent&&w.parent.removeChild(w,"ignore")}else if(d.type)d=[d];else if(d.prop){if(typeof d.value>"u")throw new Error("Value field is missed in node creation");typeof d.value!="string"&&(d.value=String(d.value)),d=[new e(d)]}else if(d.selector||d.selectors)d=[new u(d)];else if(d.name)d=[new n(d)];else if(d.text)d=[new t(d)];else throw new Error("Unknown node type in node creation");return d.map(w=>(w[s]||f.rebuild(w),w=w.proxyOf,w.parent&&w.parent.removeChild(w),w[r]&&h(w),w.raws||(w.raws={}),typeof w.raws.before>"u"&&p&&typeof p.raws.before<"u"&&(w.raws.before=p.raws.before.replace(/\S/g,"")),w.parent=this.proxyOf,w))}prepend(...d){d=d.reverse();for(let p of d){let b=this.normalize(p,this.first,"prepend").reverse();for(let w of b)this.proxyOf.nodes.unshift(w);for(let w in this.indexes)this.indexes[w]=this.indexes[w]+b.length}return this.markDirty(),this}push(d){return d.parent=this,this.proxyOf.nodes.push(d),this}removeAll(){for(let d of this.proxyOf.nodes)d.parent=void 0;return this.proxyOf.nodes=[],this.markDirty(),this}removeChild(d){d=this.index(d),this.proxyOf.nodes[d].parent=void 0,this.proxyOf.nodes.splice(d,1);let p;for(let b in this.indexes)p=this.indexes[b],p>=d&&(this.indexes[b]=p-1);return this.markDirty(),this}replaceValues(d,p,b){return b||(b=p,p={}),this.walkDecls(w=>{p.props&&!p.props.includes(w.prop)||p.fast&&!w.value.includes(p.fast)||(w.value=w.value.replace(d,b))}),this.markDirty(),this}some(d){return this.nodes.some(d)}walk(d){return this.each((p,b)=>{let w;try{w=d(p,b)}catch(g){throw p.addToError(g)}return w!==!1&&p.walk&&(w=p.walk(d)),w})}walkAtRules(d,p){return p?d instanceof RegExp?this.walk((b,w)=>{if(b.type==="atrule"&&d.test(b.name))return p(b,w)}):this.walk((b,w)=>{if(b.type==="atrule"&&b.name===d)return p(b,w)}):(p=d,this.walk((b,w)=>{if(b.type==="atrule")return p(b,w)}))}walkComments(d){return this.walk((p,b)=>{if(p.type==="comment")return d(p,b)})}walkDecls(d,p){return p?d instanceof RegExp?this.walk((b,w)=>{if(b.type==="decl"&&d.test(b.prop))return p(b,w)}):this.walk((b,w)=>{if(b.type==="decl"&&b.prop===d)return p(b,w)}):(p=d,this.walk((b,w)=>{if(b.type==="decl")return p(b,w)}))}walkRules(d,p){return p?d instanceof RegExp?this.walk((b,w)=>{if(b.type==="rule"&&d.test(b.selector))return p(b,w)}):this.walk((b,w)=>{if(b.type==="rule"&&b.selector===d)return p(b,w)}):(p=d,this.walk((b,w)=>{if(b.type==="rule")return p(b,w)}))}}return f.registerParse=a=>{o=a},f.registerRule=a=>{u=a},f.registerAtRule=a=>{n=a},f.registerRoot=a=>{l=a},$o=f,f.default=f,f.rebuild=a=>{a.type==="atrule"?Object.setPrototypeOf(a,n.prototype):a.type==="rule"?Object.setPrototypeOf(a,u.prototype):a.type==="decl"?Object.setPrototypeOf(a,e.prototype):a.type==="comment"?Object.setPrototypeOf(a,t.prototype):a.type==="root"&&Object.setPrototypeOf(a,l.prototype),a[s]=!0,a.nodes&&a.nodes.forEach(d=>{f.rebuild(d)})},$o}var Io,uc;function ul(){if(uc)return Io;uc=1;let t=qi();class e extends t{constructor(r){super(r),this.type="atrule"}append(...r){return this.proxyOf.nodes||(this.nodes=[]),super.append(...r)}prepend(...r){return this.proxyOf.nodes||(this.nodes=[]),super.prepend(...r)}}return Io=e,e.default=e,t.registerAtRule(e),Io}var Lo,cc;function cl(){if(cc)return Lo;cc=1;let t=qi(),e,i;class r extends t{constructor(n){super({type:"document",...n}),this.nodes||(this.nodes=[])}toResult(n={}){return new e(new i,this,n).stringify()}}return r.registerLazyResult=s=>{e=s},r.registerProcessor=s=>{i=s},Lo=r,r.default=r,Lo}var No,dc;function Wy(){if(dc)return No;dc=1;let t="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";return No={nanoid:(r=21)=>{let s="",n=r|0;for(;n--;)s+=t[Math.random()*64|0];return s},customAlphabet:(r,s=21)=>(n=s)=>{let o="",l=n|0;for(;l--;)o+=r[Math.random()*r.length|0];return o}},No}var Do,hc;function $h(){if(hc)return Do;hc=1;let{existsSync:t,readFileSync:e}=yt,{dirname:i,join:r}=yt,{SourceMapConsumer:s,SourceMapGenerator:n}=yt;function o(u){return Buffer?Buffer.from(u,"base64").toString():window.atob(u)}class l{constructor(c,h){if(h.map===!1)return;this.loadAnnotation(c),this.inline=this.startWith(this.annotation,"data:");let f=h.map?h.map.prev:void 0,a=this.loadMap(h.from,f);!this.mapFile&&h.from&&(this.mapFile=h.from),this.mapFile&&(this.root=i(this.mapFile)),a&&(this.text=a)}consumer(){return this.consumerCache||(this.consumerCache=new s(this.text)),this.consumerCache}decodeInline(c){let h=/^data:application\/json;charset=utf-?8;base64,/,f=/^data:application\/json;base64,/,a=/^data:application\/json;charset=utf-?8,/,d=/^data:application\/json,/,p=c.match(a)||c.match(d);if(p)return decodeURIComponent(c.substr(p[0].length));let b=c.match(h)||c.match(f);if(b)return o(c.substr(b[0].length));let w=c.match(/data:application\/json;([^,]+),/)[1];throw new Error("Unsupported source map encoding "+w)}getAnnotationURL(c){return c.replace(/^\/\*\s*# sourceMappingURL=/,"").trim()}isMap(c){return typeof c!="object"?!1:typeof c.mappings=="string"||typeof c._mappings=="string"||Array.isArray(c.sections)}loadAnnotation(c){let h=c.match(/\/\*\s*# sourceMappingURL=/g);if(!h)return;let f=c.lastIndexOf(h.pop()),a=c.indexOf("*/",f);f>-1&&a>-1&&(this.annotation=this.getAnnotationURL(c.substring(f,a)))}loadFile(c){if(this.root=i(c),t(c))return this.mapFile=c,e(c,"utf-8").toString().trim()}loadMap(c,h){if(h===!1)return!1;if(h){if(typeof h=="string")return h;if(typeof h=="function"){let f=h(c);if(f){let a=this.loadFile(f);if(!a)throw new Error("Unable to load previous source map: "+f.toString());return a}}else{if(h instanceof s)return n.fromSourceMap(h).toString();if(h instanceof n)return h.toString();if(this.isMap(h))return JSON.stringify(h);throw new Error("Unsupported previous source map format: "+h.toString())}}else{if(this.inline)return this.decodeInline(this.annotation);if(this.annotation){let f=this.annotation;return c&&(f=r(i(c),f)),this.loadFile(f)}}}startWith(c,h){return c?c.substr(0,h.length)===h:!1}withContent(){return!!(this.consumer().sourcesContent&&this.consumer().sourcesContent.length>0)}}return Do=l,l.default=l,Do}var Po,fc;function Vn(){if(fc)return Po;fc=1;let{nanoid:t}=Wy(),{isAbsolute:e,resolve:i}=yt,{SourceMapConsumer:r,SourceMapGenerator:s}=yt,{fileURLToPath:n,pathToFileURL:o}=yt,l=al(),u=$h(),c=yt,h=Symbol("lineToIndexCache"),f=!!(r&&s),a=!!(i&&e);function d(b){if(b[h])return b[h];let w=b.css.split(`
`),g=new Array(w.length),x=0;for(let _=0,v=w.length;_<v;_++)g[_]=x,x+=w[_].length+1;return b[h]=g,g}class p{get from(){return this.file||this.id}constructor(w,g={}){if(w===null||typeof w>"u"||typeof w=="object"&&!w.toString)throw new Error(`PostCSS received ${w} instead of CSS string`);if(this.css=w.toString(),this.css[0]==="\uFEFF"||this.css[0]==="￾"?(this.hasBOM=!0,this.css=this.css.slice(1)):this.hasBOM=!1,this.document=this.css,g.document&&(this.document=g.document.toString()),g.from&&(!a||/^\w+:\/\//.test(g.from)||e(g.from)?this.file=g.from:this.file=i(g.from)),a&&f){let x=new u(this.css,g);if(x.text){this.map=x;let _=x.consumer().file;!this.file&&_&&(this.file=this.mapResolve(_))}}this.file||(this.id="<input css "+t(6)+">"),this.map&&(this.map.file=this.from)}error(w,g,x,_={}){let v,y,S,C,A;if(g&&typeof g=="object"){let $=g,E=x;if(typeof $.offset=="number"){C=$.offset;let O=this.fromOffset(C);g=O.line,x=O.col}else g=$.line,x=$.column,C=this.fromLineAndColumn(g,x);if(typeof E.offset=="number"){S=E.offset;let O=this.fromOffset(S);y=O.line,v=O.col}else y=E.line,v=E.column,S=this.fromLineAndColumn(E.line,E.column)}else if(x)C=this.fromLineAndColumn(g,x);else{C=g;let $=this.fromOffset(C);g=$.line,x=$.col}let T=this.origin(g,x,y,v);return T?A=new l(w,T.endLine===void 0?T.line:{column:T.column,line:T.line},T.endLine===void 0?T.column:{column:T.endColumn,line:T.endLine},T.source,T.file,_.plugin):A=new l(w,y===void 0?g:{column:x,line:g},y===void 0?x:{column:v,line:y},this.css,this.file,_.plugin),A.input={column:x,endColumn:v,endLine:y,endOffset:S,line:g,offset:C,source:this.css},this.file&&(o&&(A.input.url=o(this.file).toString()),A.input.file=this.file),A}fromLineAndColumn(w,g){return d(this)[w-1]+g-1}fromOffset(w){let g=d(this),x=g[g.length-1],_=0;if(w>=x)_=g.length-1;else{let v=g.length-2,y;for(;_<v;)if(y=_+(v-_>>1),w<g[y])v=y-1;else if(w>=g[y+1])_=y+1;else{_=y;break}}return{col:w-g[_]+1,line:_+1}}mapResolve(w){return/^\w+:\/\//.test(w)?w:i(this.map.consumer().sourceRoot||this.map.root||".",w)}origin(w,g,x,_){if(!this.map)return!1;let v=this.map.consumer(),y=v.originalPositionFor({column:g,line:w});if(!y.source)return!1;let S;typeof x=="number"&&(S=v.originalPositionFor({column:_,line:x}));let C;e(y.source)?C=o(y.source):C=new URL(y.source,this.map.consumer().sourceRoot||o(this.map.mapFile));let A={column:y.column,endColumn:S&&S.column,endLine:S&&S.line,line:y.line,url:C.toString()};if(C.protocol==="file:")if(n)A.file=n(C);else throw new Error("file: protocol is not available in this PostCSS build");let T=v.sourceContentFor(y.source);return T&&(A.source=T),A}toJSON(){let w={};for(let g of["hasBOM","css","file","id"])this[g]!=null&&(w[g]=this[g]);return this.map&&(w.map={...this.map},w.map.consumerCache&&(w.map.consumerCache=void 0)),w}}return Po=p,p.default=p,c&&c.registerInput&&c.registerInput(p),Po}var Mo,pc;function bs(){if(pc)return Mo;pc=1;let t=qi(),e,i;class r extends t{constructor(n){super(n),this.type="root",this.nodes||(this.nodes=[])}normalize(n,o,l){let u=super.normalize(n);if(o){if(l==="prepend")this.nodes.length>1?o.raws.before=this.nodes[1].raws.before:delete o.raws.before;else if(this.first!==o)for(let c of u)c.raws.before=o.raws.before}return u}removeChild(n,o){let l=this.index(n);return!o&&l===0&&this.nodes.length>1&&(this.nodes[1].raws.before=this.nodes[l].raws.before),super.removeChild(n)}toResult(n={}){return new e(new i,this,n).stringify()}}return r.registerLazyResult=s=>{e=s},r.registerProcessor=s=>{i=s},Mo=r,r.default=r,t.registerRoot(r),Mo}var zo,mc;function Ih(){if(mc)return zo;mc=1;let t={comma(e){return t.split(e,[","],!0)},space(e){let i=[" ",`
`,"	"];return t.split(e,i)},split(e,i,r){let s=[],n="",o=!1,l=0,u=!1,c="",h=!1;for(let f of e)h?h=!1:f==="\\"?h=!0:u?f===c&&(u=!1):f==='"'||f==="'"?(u=!0,c=f):f==="("?l+=1:f===")"?l>0&&(l-=1):l===0&&i.includes(f)&&(o=!0),o?(n!==""&&s.push(n.trim()),n="",o=!1):n+=f;return(r||n!=="")&&s.push(n.trim()),s}};return zo=t,t.default=t,zo}var Ro,bc;function dl(){if(bc)return Ro;bc=1;let t=qi(),e=Ih();class i extends t{get selectors(){return e.comma(this.selector)}set selectors(s){let n=this.selector?this.selector.match(/,\s*/):null,o=n?n[0]:","+this.raw("between","beforeOpen");this.selector=s.join(o)}constructor(s){super(s),this.type="rule",this.nodes||(this.nodes=[])}}return Ro=i,i.default=i,t.registerRule(i),Ro}var Bo,gc;function Gy(){if(gc)return Bo;gc=1;let t=ul(),e=qn(),i=Un(),r=Vn(),s=$h(),n=bs(),o=dl();function l(u,c){if(Array.isArray(u))return u.map(a=>l(a));let{inputs:h,...f}=u;if(h){c=[];for(let a of h){let d={...a,__proto__:r.prototype};d.map&&(d.map={...d.map,__proto__:s.prototype}),c.push(d)}}if(f.nodes&&(f.nodes=u.nodes.map(a=>l(a,c))),f.source){let{inputId:a,...d}=f.source;f.source=d,a!=null&&(f.source.input=c[a])}if(f.type==="root")return new n(f);if(f.type==="decl")return new i(f);if(f.type==="rule")return new o(f);if(f.type==="comment")return new e(f);if(f.type==="atrule")return new t(f);throw new Error("Unknown node type: "+u.type)}return Bo=l,l.default=l,Bo}var Fo,yc;function Lh(){if(yc)return Fo;yc=1;let{dirname:t,relative:e,resolve:i,sep:r}=yt,{SourceMapConsumer:s,SourceMapGenerator:n}=yt,{pathToFileURL:o}=yt,l=Vn(),u=!!(s&&n),c=!!(t&&i&&e&&r);class h{constructor(a,d,p,b){this.stringify=a,this.mapOpts=p.map||{},this.root=d,this.opts=p,this.css=b,this.originalCSS=b,this.usesFileUrls=!this.mapOpts.from&&this.mapOpts.absolute,this.memoizedFileURLs=new Map,this.memoizedPaths=new Map,this.memoizedURLs=new Map}addAnnotation(){let a;this.isInline()?a="data:application/json;base64,"+this.toBase64(this.map.toString()):typeof this.mapOpts.annotation=="string"?a=this.mapOpts.annotation:typeof this.mapOpts.annotation=="function"?a=this.mapOpts.annotation(this.opts.to,this.root):a=this.outputFile()+".map";let d=`
`;this.css.includes(`\r
`)&&(d=`\r
`),this.css+=d+"/*# sourceMappingURL="+a+" */"}applyPrevMaps(){for(let a of this.previous()){let d=this.toUrl(this.path(a.file)),p=a.root||t(a.file),b;this.mapOpts.sourcesContent===!1?(b=new s(a.text),b.sourcesContent&&(b.sourcesContent=null)):b=a.consumer(),this.map.applySourceMap(b,d,this.toUrl(this.path(p)))}}clearAnnotation(){if(this.mapOpts.annotation!==!1)if(this.root){let a;for(let d=this.root.nodes.length-1;d>=0;d--)a=this.root.nodes[d],a.type==="comment"&&a.text.startsWith("# sourceMappingURL=")&&this.root.removeChild(d)}else this.css&&(this.css=this.css.replace(/\n*\/\*#[\S\s]*?\*\/$/gm,""))}generate(){if(this.clearAnnotation(),c&&u&&this.isMap())return this.generateMap();{let a="";return this.stringify(this.root,d=>{a+=d}),[a]}}generateMap(){if(this.root)this.generateString();else if(this.previous().length===1){let a=this.previous()[0].consumer();a.file=this.outputFile(),this.map=n.fromSourceMap(a,{ignoreInvalidMapping:!0})}else this.map=new n({file:this.outputFile(),ignoreInvalidMapping:!0}),this.map.addMapping({generated:{column:0,line:1},original:{column:0,line:1},source:this.opts.from?this.toUrl(this.path(this.opts.from)):"<no source>"});return this.isSourcesContent()&&this.setSourcesContent(),this.root&&this.previous().length>0&&this.applyPrevMaps(),this.isAnnotation()&&this.addAnnotation(),this.isInline()?[this.css]:[this.css,this.map]}generateString(){this.css="",this.map=new n({file:this.outputFile(),ignoreInvalidMapping:!0});let a=1,d=1,p="<no source>",b={generated:{column:0,line:0},original:{column:0,line:0},source:""},w,g;this.stringify(this.root,(x,_,v)=>{if(this.css+=x,_&&v!=="end"&&(b.generated.line=a,b.generated.column=d-1,_.source&&_.source.start?(b.source=this.sourcePath(_),b.original.line=_.source.start.line,b.original.column=_.source.start.column-1,this.map.addMapping(b)):(b.source=p,b.original.line=1,b.original.column=0,this.map.addMapping(b))),g=x.match(/\n/g),g?(a+=g.length,w=x.lastIndexOf(`
`),d=x.length-w):d+=x.length,_&&v!=="start"){let y=_.parent||{raws:{}};(!(_.type==="decl"||_.type==="atrule"&&!_.nodes)||_!==y.last||y.raws.semicolon)&&(_.source&&_.source.end?(b.source=this.sourcePath(_),b.original.line=_.source.end.line,b.original.column=_.source.end.column-1,b.generated.line=a,b.generated.column=d-2,this.map.addMapping(b)):(b.source=p,b.original.line=1,b.original.column=0,b.generated.line=a,b.generated.column=d-1,this.map.addMapping(b)))}})}isAnnotation(){return this.isInline()?!0:typeof this.mapOpts.annotation<"u"?this.mapOpts.annotation:this.previous().length?this.previous().some(a=>a.annotation):!0}isInline(){if(typeof this.mapOpts.inline<"u")return this.mapOpts.inline;let a=this.mapOpts.annotation;return typeof a<"u"&&a!==!0?!1:this.previous().length?this.previous().some(d=>d.inline):!0}isMap(){return typeof this.opts.map<"u"?!!this.opts.map:this.previous().length>0}isSourcesContent(){return typeof this.mapOpts.sourcesContent<"u"?this.mapOpts.sourcesContent:this.previous().length?this.previous().some(a=>a.withContent()):!0}outputFile(){return this.opts.to?this.path(this.opts.to):this.opts.from?this.path(this.opts.from):"to.css"}path(a){if(this.mapOpts.absolute||a.charCodeAt(0)===60||/^\w+:\/\//.test(a))return a;let d=this.memoizedPaths.get(a);if(d)return d;let p=this.opts.to?t(this.opts.to):".";typeof this.mapOpts.annotation=="string"&&(p=t(i(p,this.mapOpts.annotation)));let b=e(p,a);return this.memoizedPaths.set(a,b),b}previous(){if(!this.previousMaps)if(this.previousMaps=[],this.root)this.root.walk(a=>{if(a.source&&a.source.input.map){let d=a.source.input.map;this.previousMaps.includes(d)||this.previousMaps.push(d)}});else{let a=new l(this.originalCSS,this.opts);a.map&&this.previousMaps.push(a.map)}return this.previousMaps}setSourcesContent(){let a={};if(this.root)this.root.walk(d=>{if(d.source){let p=d.source.input.from;if(p&&!a[p]){a[p]=!0;let b=this.usesFileUrls?this.toFileUrl(p):this.toUrl(this.path(p));this.map.setSourceContent(b,d.source.input.css)}}});else if(this.css){let d=this.opts.from?this.toUrl(this.path(this.opts.from)):"<no source>";this.map.setSourceContent(d,this.css)}}sourcePath(a){return this.mapOpts.from?this.toUrl(this.mapOpts.from):this.usesFileUrls?this.toFileUrl(a.source.input.from):this.toUrl(this.path(a.source.input.from))}toBase64(a){return Buffer?Buffer.from(a).toString("base64"):window.btoa(unescape(encodeURIComponent(a)))}toFileUrl(a){let d=this.memoizedFileURLs.get(a);if(d)return d;if(o){let p=o(a).toString();return this.memoizedFileURLs.set(a,p),p}else throw new Error("`map.absolute` option is not available in this PostCSS build")}toUrl(a){let d=this.memoizedURLs.get(a);if(d)return d;r==="\\"&&(a=a.replace(/\\/g,"/"));let p=encodeURI(a).replace(/[#?]/g,encodeURIComponent);return this.memoizedURLs.set(a,p),p}}return Fo=h,Fo}var qo,vc;function Yy(){if(vc)return qo;vc=1;const t=39,e=34,i=92,r=47,s=10,n=32,o=12,l=9,u=13,c=91,h=93,f=40,a=41,d=123,p=125,b=59,w=42,g=58,x=64,_=/[\t\n\f\r "#'()/;[\\\]{}]/g,v=/[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g,y=/.[\r\n"'(/\\]/,S=/[\da-f]/i;return qo=function(A,T={}){let $=A.css.valueOf(),E=T.ignoreErrors,O,D,z,I,K,G,Z,se,ge,Tt,kr=$.length,W=0,ct=[],di=[];function gs(){return W}function Sr(L){throw A.error("Unclosed "+L,W)}function Kn(){return di.length===0&&W>=kr}function Wn(L){if(di.length)return di.pop();if(W>=kr)return;let B=L?L.ignoreUnclosed:!1;switch(O=$.charCodeAt(W),O){case s:case n:case l:case u:case o:{I=W;do I+=1,O=$.charCodeAt(I);while(O===n||O===s||O===l||O===u||O===o);G=["space",$.slice(W,I)],W=I-1;break}case c:case h:case d:case p:case g:case b:case a:{let P=String.fromCharCode(O);G=[P,P,W];break}case f:{if(Tt=ct.length?ct.pop()[1]:"",ge=$.charCodeAt(W+1),Tt==="url"&&ge!==t&&ge!==e&&ge!==n&&ge!==s&&ge!==l&&ge!==o&&ge!==u){I=W;do{if(Z=!1,I=$.indexOf(")",I+1),I===-1)if(E||B){I=W;break}else Sr("bracket");for(se=I;$.charCodeAt(se-1)===i;)se-=1,Z=!Z}while(Z);G=["brackets",$.slice(W,I+1),W,I],W=I}else I=$.indexOf(")",W+1),D=$.slice(W,I+1),I===-1||y.test(D)?G=["(","(",W]:(G=["brackets",D,W,I],W=I);break}case t:case e:{K=O===t?"'":'"',I=W;do{if(Z=!1,I=$.indexOf(K,I+1),I===-1)if(E||B){I=W+1;break}else Sr("string");for(se=I;$.charCodeAt(se-1)===i;)se-=1,Z=!Z}while(Z);G=["string",$.slice(W,I+1),W,I],W=I;break}case x:{_.lastIndex=W+1,_.test($),_.lastIndex===0?I=$.length-1:I=_.lastIndex-2,G=["at-word",$.slice(W,I+1),W,I],W=I;break}case i:{for(I=W,z=!0;$.charCodeAt(I+1)===i;)I+=1,z=!z;if(O=$.charCodeAt(I+1),z&&O!==r&&O!==n&&O!==s&&O!==l&&O!==u&&O!==o&&(I+=1,S.test($.charAt(I)))){for(;S.test($.charAt(I+1));)I+=1;$.charCodeAt(I+1)===n&&(I+=1)}G=["word",$.slice(W,I+1),W,I],W=I;break}default:{O===r&&$.charCodeAt(W+1)===w?(I=$.indexOf("*/",W+2)+1,I===0&&(E||B?I=$.length:Sr("comment")),G=["comment",$.slice(W,I+1),W,I],W=I):(v.lastIndex=W+1,v.test($),v.lastIndex===0?I=$.length-1:I=v.lastIndex-2,G=["word",$.slice(W,I+1),W,I],ct.push(G),W=I);break}}return W++,G}function ys(L){di.push(L)}return{back:ys,endOfFile:Kn,nextToken:Wn,position:gs}},qo}var Uo,wc;function Xy(){if(wc)return Uo;wc=1;let t=ul(),e=qn(),i=Un(),r=bs(),s=dl(),n=Yy();const o={empty:!0,space:!0};function l(c){for(let h=c.length-1;h>=0;h--){let f=c[h],a=f[3]||f[2];if(a)return a}}class u{constructor(h){this.input=h,this.root=new r,this.current=this.root,this.spaces="",this.semicolon=!1,this.createTokenizer(),this.root.source={input:h,start:{column:1,line:1,offset:0}}}atrule(h){let f=new t;f.name=h[1].slice(1),f.name===""&&this.unnamedAtrule(f,h),this.init(f,h[2]);let a,d,p,b=!1,w=!1,g=[],x=[];for(;!this.tokenizer.endOfFile();){if(h=this.tokenizer.nextToken(),a=h[0],a==="("||a==="["?x.push(a==="("?")":"]"):a==="{"&&x.length>0?x.push("}"):a===x[x.length-1]&&x.pop(),x.length===0)if(a===";"){f.source.end=this.getPosition(h[2]),f.source.end.offset++,this.semicolon=!0;break}else if(a==="{"){w=!0;break}else if(a==="}"){if(g.length>0){for(p=g.length-1,d=g[p];d&&d[0]==="space";)d=g[--p];d&&(f.source.end=this.getPosition(d[3]||d[2]),f.source.end.offset++)}this.end(h);break}else g.push(h);else g.push(h);if(this.tokenizer.endOfFile()){b=!0;break}}f.raws.between=this.spacesAndCommentsFromEnd(g),g.length?(f.raws.afterName=this.spacesAndCommentsFromStart(g),this.raw(f,"params",g),b&&(h=g[g.length-1],f.source.end=this.getPosition(h[3]||h[2]),f.source.end.offset++,this.spaces=f.raws.between,f.raws.between="")):(f.raws.afterName="",f.params=""),w&&(f.nodes=[],this.current=f)}checkMissedSemicolon(h){let f=this.colon(h);if(f===!1)return;let a=0,d;for(let p=f-1;p>=0&&(d=h[p],!(d[0]!=="space"&&(a+=1,a===2)));p--);throw this.input.error("Missed semicolon",d[0]==="word"?d[3]+1:d[2])}colon(h){let f=0,a,d,p;for(let[b,w]of h.entries()){if(d=w,p=d[0],p==="("&&(f+=1),p===")"&&(f-=1),f===0&&p===":")if(!a)this.doubleColon(d);else{if(a[0]==="word"&&a[1]==="progid")continue;return b}a=d}return!1}comment(h){let f=new e;this.init(f,h[2]),f.source.end=this.getPosition(h[3]||h[2]),f.source.end.offset++;let a=h[1].slice(2,-2);if(/^\s*$/.test(a))f.text="",f.raws.left=a,f.raws.right="";else{let d=a.match(/^(\s*)([^]*\S)(\s*)$/);f.text=d[2],f.raws.left=d[1],f.raws.right=d[3]}}createTokenizer(){this.tokenizer=n(this.input)}decl(h,f){let a=new i;this.init(a,h[0][2]);let d=h[h.length-1];for(d[0]===";"&&(this.semicolon=!0,h.pop()),a.source.end=this.getPosition(d[3]||d[2]||l(h)),a.source.end.offset++;h[0][0]!=="word";)h.length===1&&this.unknownWord(h),a.raws.before+=h.shift()[1];for(a.source.start=this.getPosition(h[0][2]),a.prop="";h.length;){let x=h[0][0];if(x===":"||x==="space"||x==="comment")break;a.prop+=h.shift()[1]}a.raws.between="";let p;for(;h.length;)if(p=h.shift(),p[0]===":"){a.raws.between+=p[1];break}else p[0]==="word"&&/\w/.test(p[1])&&this.unknownWord([p]),a.raws.between+=p[1];(a.prop[0]==="_"||a.prop[0]==="*")&&(a.raws.before+=a.prop[0],a.prop=a.prop.slice(1));let b=[],w;for(;h.length&&(w=h[0][0],!(w!=="space"&&w!=="comment"));)b.push(h.shift());this.precheckMissedSemicolon(h);for(let x=h.length-1;x>=0;x--){if(p=h[x],p[1].toLowerCase()==="!important"){a.important=!0;let _=this.stringFrom(h,x);_=this.spacesFromEnd(h)+_,_!==" !important"&&(a.raws.important=_);break}else if(p[1].toLowerCase()==="important"){let _=h.slice(0),v="";for(let y=x;y>0;y--){let S=_[y][0];if(v.trim().startsWith("!")&&S!=="space")break;v=_.pop()[1]+v}v.trim().startsWith("!")&&(a.important=!0,a.raws.important=v,h=_)}if(p[0]!=="space"&&p[0]!=="comment")break}h.some(x=>x[0]!=="space"&&x[0]!=="comment")&&(a.raws.between+=b.map(x=>x[1]).join(""),b=[]),this.raw(a,"value",b.concat(h),f),a.value.includes(":")&&!f&&this.checkMissedSemicolon(h)}doubleColon(h){throw this.input.error("Double colon",{offset:h[2]},{offset:h[2]+h[1].length})}emptyRule(h){let f=new s;this.init(f,h[2]),f.selector="",f.raws.between="",this.current=f}end(h){this.current.nodes&&this.current.nodes.length&&(this.current.raws.semicolon=this.semicolon),this.semicolon=!1,this.current.raws.after=(this.current.raws.after||"")+this.spaces,this.spaces="",this.current.parent?(this.current.source.end=this.getPosition(h[2]),this.current.source.end.offset++,this.current=this.current.parent):this.unexpectedClose(h)}endFile(){this.current.parent&&this.unclosedBlock(),this.current.nodes&&this.current.nodes.length&&(this.current.raws.semicolon=this.semicolon),this.current.raws.after=(this.current.raws.after||"")+this.spaces,this.root.source.end=this.getPosition(this.tokenizer.position())}freeSemicolon(h){if(this.spaces+=h[1],this.current.nodes){let f=this.current.nodes[this.current.nodes.length-1];f&&f.type==="rule"&&!f.raws.ownSemicolon&&(f.raws.ownSemicolon=this.spaces,this.spaces="",f.source.end=this.getPosition(h[2]),f.source.end.offset+=f.raws.ownSemicolon.length)}}getPosition(h){let f=this.input.fromOffset(h);return{column:f.col,line:f.line,offset:h}}init(h,f){this.current.push(h),h.source={input:this.input,start:this.getPosition(f)},h.raws.before=this.spaces,this.spaces="",h.type!=="comment"&&(this.semicolon=!1)}other(h){let f=!1,a=null,d=!1,p=null,b=[],w=h[1].startsWith("--"),g=[],x=h;for(;x;){if(a=x[0],g.push(x),a==="("||a==="[")p||(p=x),b.push(a==="("?")":"]");else if(w&&d&&a==="{")p||(p=x),b.push("}");else if(b.length===0)if(a===";")if(d){this.decl(g,w);return}else break;else if(a==="{"){this.rule(g);return}else if(a==="}"){this.tokenizer.back(g.pop()),f=!0;break}else a===":"&&(d=!0);else a===b[b.length-1]&&(b.pop(),b.length===0&&(p=null));x=this.tokenizer.nextToken()}if(this.tokenizer.endOfFile()&&(f=!0),b.length>0&&this.unclosedBracket(p),f&&d){if(!w)for(;g.length&&(x=g[g.length-1][0],!(x!=="space"&&x!=="comment"));)this.tokenizer.back(g.pop());this.decl(g,w)}else this.unknownWord(g)}parse(){let h;for(;!this.tokenizer.endOfFile();)switch(h=this.tokenizer.nextToken(),h[0]){case"space":this.spaces+=h[1];break;case";":this.freeSemicolon(h);break;case"}":this.end(h);break;case"comment":this.comment(h);break;case"at-word":this.atrule(h);break;case"{":this.emptyRule(h);break;default:this.other(h);break}this.endFile()}precheckMissedSemicolon(){}raw(h,f,a,d){let p,b,w=a.length,g="",x=!0,_,v;for(let y=0;y<w;y+=1)p=a[y],b=p[0],b==="space"&&y===w-1&&!d?x=!1:b==="comment"?(v=a[y-1]?a[y-1][0]:"empty",_=a[y+1]?a[y+1][0]:"empty",!o[v]&&!o[_]?g.slice(-1)===","?x=!1:g+=p[1]:x=!1):g+=p[1];if(!x){let y=a.reduce((S,C)=>S+C[1],"");h.raws[f]={raw:y,value:g}}h[f]=g}rule(h){h.pop();let f=new s;this.init(f,h[0][2]),f.raws.between=this.spacesAndCommentsFromEnd(h),this.raw(f,"selector",h),this.current=f}spacesAndCommentsFromEnd(h){let f,a="";for(;h.length&&(f=h[h.length-1][0],!(f!=="space"&&f!=="comment"));)a=h.pop()[1]+a;return a}spacesAndCommentsFromStart(h){let f,a="";for(;h.length&&(f=h[0][0],!(f!=="space"&&f!=="comment"));)a+=h.shift()[1];return a}spacesFromEnd(h){let f,a="";for(;h.length&&(f=h[h.length-1][0],f==="space");)a=h.pop()[1]+a;return a}stringFrom(h,f){let a="";for(let d=f;d<h.length;d++)a+=h[d][1];return h.splice(f,h.length-f),a}unclosedBlock(){let h=this.current.source.start;throw this.input.error("Unclosed block",h.line,h.column)}unclosedBracket(h){throw this.input.error("Unclosed bracket",{offset:h[2]},{offset:h[2]+1})}unexpectedClose(h){throw this.input.error("Unexpected }",{offset:h[2]},{offset:h[2]+1})}unknownWord(h){throw this.input.error("Unknown word "+h[0][1],{offset:h[0][2]},{offset:h[0][2]+h[0][1].length})}unnamedAtrule(h,f){throw this.input.error("At-rule without name",{offset:f[2]},{offset:f[2]+f[1].length})}}return Uo=u,Uo}var Vo,xc;function hl(){if(xc)return Vo;xc=1;let t=qi(),e=Vn(),i=Xy();function r(s,n){let o=new e(s,n),l=new i(o);try{l.parse()}catch(u){throw u}return l.root}return Vo=r,r.default=r,t.registerParse(r),Vo}var jo,_c;function Nh(){if(_c)return jo;_c=1;class t{constructor(i,r={}){if(this.type="warning",this.text=i,r.node&&r.node.source){let s=r.node.rangeBy(r);this.line=s.start.line,this.column=s.start.column,this.endLine=s.end.line,this.endColumn=s.end.column}for(let s in r)this[s]=r[s]}toString(){return this.node?this.node.error(this.text,{index:this.index,plugin:this.plugin,word:this.word}).message:this.plugin?this.plugin+": "+this.text:this.text}}return jo=t,t.default=t,jo}var Ho,kc;function fl(){if(kc)return Ho;kc=1;let t=Nh();class e{get content(){return this.css}constructor(r,s,n){this.processor=r,this.messages=[],this.root=s,this.opts=n,this.css="",this.map=void 0}toString(){return this.css}warn(r,s={}){s.plugin||this.lastPlugin&&this.lastPlugin.postcssPlugin&&(s.plugin=this.lastPlugin.postcssPlugin);let n=new t(r,s);return this.messages.push(n),n}warnings(){return this.messages.filter(r=>r.type==="warning")}}return Ho=e,e.default=e,Ho}var Ko,Sc;function Dh(){if(Sc)return Ko;Sc=1;let t=qi(),e=cl(),i=Lh(),r=hl(),s=fl(),n=bs(),o=Bn(),{isClean:l,my:u}=ll();const c={atrule:"AtRule",comment:"Comment",decl:"Declaration",document:"Document",root:"Root",rule:"Rule"},h={AtRule:!0,AtRuleExit:!0,Comment:!0,CommentExit:!0,Declaration:!0,DeclarationExit:!0,Document:!0,DocumentExit:!0,Once:!0,OnceExit:!0,postcssPlugin:!0,prepare:!0,Root:!0,RootExit:!0,Rule:!0,RuleExit:!0},f={Once:!0,postcssPlugin:!0,prepare:!0},a=0;function d(_){return typeof _=="object"&&typeof _.then=="function"}function p(_){let v=!1,y=c[_.type];return _.type==="decl"?v=_.prop.toLowerCase():_.type==="atrule"&&(v=_.name.toLowerCase()),v&&_.append?[y,y+"-"+v,a,y+"Exit",y+"Exit-"+v]:v?[y,y+"-"+v,y+"Exit",y+"Exit-"+v]:_.append?[y,a,y+"Exit"]:[y,y+"Exit"]}function b(_){let v;return _.type==="document"?v=["Document",a,"DocumentExit"]:_.type==="root"?v=["Root",a,"RootExit"]:v=p(_),{eventIndex:0,events:v,iterator:0,node:_,visitorIndex:0,visitors:[]}}function w(_){return _[l]=!1,_.nodes&&_.nodes.forEach(v=>w(v)),_}let g={};class x{get content(){return this.stringify().content}get css(){return this.stringify().css}get map(){return this.stringify().map}get messages(){return this.sync().messages}get opts(){return this.result.opts}get processor(){return this.result.processor}get root(){return this.sync().root}get[Symbol.toStringTag](){return"LazyResult"}constructor(v,y,S){this.stringified=!1,this.processed=!1;let C;if(typeof y=="object"&&y!==null&&(y.type==="root"||y.type==="document"))C=w(y);else if(y instanceof x||y instanceof s)C=w(y.root),y.map&&(typeof S.map>"u"&&(S.map={}),S.map.inline||(S.map.inline=!1),S.map.prev=y.map);else{let A=r;S.syntax&&(A=S.syntax.parse),S.parser&&(A=S.parser),A.parse&&(A=A.parse);try{C=A(y,S)}catch(T){this.processed=!0,this.error=T}C&&!C[u]&&t.rebuild(C)}this.result=new s(v,C,S),this.helpers={...g,postcss:g,result:this.result},this.plugins=this.processor.plugins.map(A=>typeof A=="object"&&A.prepare?{...A,...A.prepare(this.result)}:A)}async(){return this.error?Promise.reject(this.error):this.processed?Promise.resolve(this.result):(this.processing||(this.processing=this.runAsync()),this.processing)}catch(v){return this.async().catch(v)}finally(v){return this.async().then(v,v)}getAsyncError(){throw new Error("Use process(css).then(cb) to work with async plugins")}handleError(v,y){let S=this.result.lastPlugin;try{y&&y.addToError(v),this.error=v,v.name==="CssSyntaxError"&&!v.plugin?(v.plugin=S.postcssPlugin,v.setMessage()):S.postcssVersion}catch(C){console&&console.error&&console.error(C)}return v}prepareVisitors(){this.listeners={};let v=(y,S,C)=>{this.listeners[S]||(this.listeners[S]=[]),this.listeners[S].push([y,C])};for(let y of this.plugins)if(typeof y=="object")for(let S in y){if(!h[S]&&/^[A-Z]/.test(S))throw new Error(`Unknown event ${S} in ${y.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`);if(!f[S])if(typeof y[S]=="object")for(let C in y[S])C==="*"?v(y,S,y[S][C]):v(y,S+"-"+C.toLowerCase(),y[S][C]);else typeof y[S]=="function"&&v(y,S,y[S])}this.hasListener=Object.keys(this.listeners).length>0}async runAsync(){this.plugin=0;for(let v=0;v<this.plugins.length;v++){let y=this.plugins[v],S=this.runOnRoot(y);if(d(S))try{await S}catch(C){throw this.handleError(C)}}if(this.prepareVisitors(),this.hasListener){let v=this.result.root;for(;!v[l];){v[l]=!0;let y=[b(v)];for(;y.length>0;){let S=this.visitTick(y);if(d(S))try{await S}catch(C){let A=y[y.length-1].node;throw this.handleError(C,A)}}}if(this.listeners.OnceExit)for(let[y,S]of this.listeners.OnceExit){this.result.lastPlugin=y;try{if(v.type==="document"){let C=v.nodes.map(A=>S(A,this.helpers));await Promise.all(C)}else await S(v,this.helpers)}catch(C){throw this.handleError(C)}}}return this.processed=!0,this.stringify()}runOnRoot(v){this.result.lastPlugin=v;try{if(typeof v=="object"&&v.Once){if(this.result.root.type==="document"){let y=this.result.root.nodes.map(S=>v.Once(S,this.helpers));return d(y[0])?Promise.all(y):y}return v.Once(this.result.root,this.helpers)}else if(typeof v=="function")return v(this.result.root,this.result)}catch(y){throw this.handleError(y)}}stringify(){if(this.error)throw this.error;if(this.stringified)return this.result;this.stringified=!0,this.sync();let v=this.result.opts,y=o;v.syntax&&(y=v.syntax.stringify),v.stringifier&&(y=v.stringifier),y.stringify&&(y=y.stringify);let C=new i(y,this.result.root,this.result.opts).generate();return this.result.css=C[0],this.result.map=C[1],this.result}sync(){if(this.error)throw this.error;if(this.processed)return this.result;if(this.processed=!0,this.processing)throw this.getAsyncError();for(let v of this.plugins){let y=this.runOnRoot(v);if(d(y))throw this.getAsyncError()}if(this.prepareVisitors(),this.hasListener){let v=this.result.root;for(;!v[l];)v[l]=!0,this.walkSync(v);if(this.listeners.OnceExit)if(v.type==="document")for(let y of v.nodes)this.visitSync(this.listeners.OnceExit,y);else this.visitSync(this.listeners.OnceExit,v)}return this.result}then(v,y){return this.async().then(v,y)}toString(){return this.css}visitSync(v,y){for(let[S,C]of v){this.result.lastPlugin=S;let A;try{A=C(y,this.helpers)}catch(T){throw this.handleError(T,y.proxyOf)}if(y.type!=="root"&&y.type!=="document"&&!y.parent)return!0;if(d(A))throw this.getAsyncError()}}visitTick(v){let y=v[v.length-1],{node:S,visitors:C}=y;if(S.type!=="root"&&S.type!=="document"&&!S.parent){v.pop();return}if(C.length>0&&y.visitorIndex<C.length){let[T,$]=C[y.visitorIndex];y.visitorIndex+=1,y.visitorIndex===C.length&&(y.visitors=[],y.visitorIndex=0),this.result.lastPlugin=T;try{return $(S.toProxy(),this.helpers)}catch(E){throw this.handleError(E,S)}}if(y.iterator!==0){let T=y.iterator,$;for(;$=S.nodes[S.indexes[T]];)if(S.indexes[T]+=1,!$[l]){$[l]=!0,v.push(b($));return}y.iterator=0,delete S.indexes[T]}let A=y.events;for(;y.eventIndex<A.length;){let T=A[y.eventIndex];if(y.eventIndex+=1,T===a){S.nodes&&S.nodes.length&&(S[l]=!0,y.iterator=S.getIterator());return}else if(this.listeners[T]){y.visitors=this.listeners[T];return}}v.pop()}walkSync(v){v[l]=!0;let y=p(v);for(let S of y)if(S===a)v.nodes&&v.each(C=>{C[l]||this.walkSync(C)});else{let C=this.listeners[S];if(C&&this.visitSync(C,v.toProxy()))return}}warnings(){return this.sync().warnings()}}return x.registerPostcss=_=>{g=_},Ko=x,x.default=x,n.registerLazyResult(x),e.registerLazyResult(x),Ko}var Wo,Cc;function Jy(){if(Cc)return Wo;Cc=1;let t=Lh(),e=hl();const i=fl();let r=Bn();class s{get content(){return this.result.css}get css(){return this.result.css}get map(){return this.result.map}get messages(){return[]}get opts(){return this.result.opts}get processor(){return this.result.processor}get root(){if(this._root)return this._root;let o,l=e;try{o=l(this._css,this._opts)}catch(u){this.error=u}if(this.error)throw this.error;return this._root=o,o}get[Symbol.toStringTag](){return"NoWorkResult"}constructor(o,l,u){l=l.toString(),this.stringified=!1,this._processor=o,this._css=l,this._opts=u,this._map=void 0;let c,h=r;this.result=new i(this._processor,c,this._opts),this.result.css=l;let f=this;Object.defineProperty(this.result,"root",{get(){return f.root}});let a=new t(h,c,this._opts,l);if(a.isMap()){let[d,p]=a.generate();d&&(this.result.css=d),p&&(this.result.map=p)}else a.clearAnnotation(),this.result.css=a.css}async(){return this.error?Promise.reject(this.error):Promise.resolve(this.result)}catch(o){return this.async().catch(o)}finally(o){return this.async().then(o,o)}sync(){if(this.error)throw this.error;return this.result}then(o,l){return this.async().then(o,l)}toString(){return this._css}warnings(){return[]}}return Wo=s,s.default=s,Wo}var Go,Ac;function Qy(){if(Ac)return Go;Ac=1;let t=cl(),e=Dh(),i=Jy(),r=bs();class s{constructor(o=[]){this.version="8.5.6",this.plugins=this.normalize(o)}normalize(o){let l=[];for(let u of o)if(u.postcss===!0?u=u():u.postcss&&(u=u.postcss),typeof u=="object"&&Array.isArray(u.plugins))l=l.concat(u.plugins);else if(typeof u=="object"&&u.postcssPlugin)l.push(u);else if(typeof u=="function")l.push(u);else if(!(typeof u=="object"&&(u.parse||u.stringify)))throw new Error(u+" is not a PostCSS plugin");return l}process(o,l={}){return!this.plugins.length&&!l.parser&&!l.stringifier&&!l.syntax?new i(this,o,l):new e(this,o,l)}use(o){return this.plugins=this.plugins.concat(this.normalize([o])),this}}return Go=s,s.default=s,r.registerProcessor(s),t.registerProcessor(s),Go}var Yo,Ec;function Zy(){if(Ec)return Yo;Ec=1;var t={};let e=ul(),i=qn(),r=qi(),s=al(),n=Un(),o=cl(),l=Gy(),u=Vn(),c=Dh(),h=Ih(),f=Fn(),a=hl(),d=Qy(),p=fl(),b=bs(),w=dl(),g=Bn(),x=Nh();function _(...v){return v.length===1&&Array.isArray(v[0])&&(v=v[0]),new d(v)}return _.plugin=function(y,S){let C=!1;function A(...$){console&&console.warn&&!C&&(C=!0,console.warn(y+`: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`),t.LANG&&t.LANG.startsWith("cn")&&console.warn(y+`: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`));let E=S(...$);return E.postcssPlugin=y,E.postcssVersion=new d().version,E}let T;return Object.defineProperty(A,"postcss",{get(){return T||(T=A()),T}}),A.process=function($,E,O){return _([A(O)]).process($,E)},A},_.stringify=g,_.parse=a,_.fromJSON=l,_.list=h,_.comment=v=>new i(v),_.atRule=v=>new e(v),_.decl=v=>new n(v),_.rule=v=>new w(v),_.root=v=>new b(v),_.document=v=>new o(v),_.CssSyntaxError=s,_.Declaration=n,_.Container=r,_.Processor=d,_.Document=o,_.Comment=i,_.Warning=x,_.AtRule=e,_.Result=p,_.Input=u,_.Rule=w,_.Root=b,_.Node=f,c.registerPostcss(_),Yo=_,_.default=_,Yo}var Xo,Tc;function ev(){if(Tc)return Xo;Tc=1;const t=Ry(),e=By(),{isPlainObject:i}=Fy(),r=qy(),s=Vy(),{parse:n}=Zy(),o=["img","audio","video","picture","svg","object","map","iframe","embed"],l=["script","style"];function u(w,g){w&&Object.keys(w).forEach(function(x){g(w[x],x)})}function c(w,g){return{}.hasOwnProperty.call(w,g)}function h(w,g){const x=[];return u(w,function(_){g(_)&&x.push(_)}),x}function f(w){for(const g in w)if(c(w,g))return!1;return!0}function a(w){return w.map(function(g){if(!g.url)throw new Error("URL missing");return g.url+(g.w?` ${g.w}w`:"")+(g.h?` ${g.h}h`:"")+(g.d?` ${g.d}x`:"")}).join(", ")}Xo=p;const d=/^[^\0\t\n\f\r /<=>]+$/;function p(w,g,x){if(w==null)return"";typeof w=="number"&&(w=w.toString());let _="",v="";function y(L,B){const P=this;this.tag=L,this.attribs=B||{},this.tagPosition=_.length,this.text="",this.openingTagLength=0,this.mediaChildren=[],this.updateParentNodeText=function(){if(K.length){const X=K[K.length-1];X.text+=P.text}},this.updateParentNodeMediaChildren=function(){K.length&&o.includes(this.tag)&&K[K.length-1].mediaChildren.push(this.tag)}}g=Object.assign({},p.defaults,g),g.parser=Object.assign({},b,g.parser);const S=function(L){return g.allowedTags===!1||(g.allowedTags||[]).indexOf(L)>-1};l.forEach(function(L){S(L)&&!g.allowVulnerableTags&&console.warn(`

⚠️ Your \`allowedTags\` option includes, \`${L}\`, which is inherently
vulnerable to XSS attacks. Please remove it from \`allowedTags\`.
Or, to disable this warning, add the \`allowVulnerableTags\` option
and ensure you are accounting for this risk.

`)});const C=g.nonTextTags||["script","style","textarea","option"];let A,T;g.allowedAttributes&&(A={},T={},u(g.allowedAttributes,function(L,B){A[B]=[];const P=[];L.forEach(function(X){typeof X=="string"&&X.indexOf("*")>=0?P.push(e(X).replace(/\\\*/g,".*")):A[B].push(X)}),P.length&&(T[B]=new RegExp("^("+P.join("|")+")$"))}));const $={},E={},O={};u(g.allowedClasses,function(L,B){if(A&&(c(A,B)||(A[B]=[]),A[B].push("class")),$[B]=L,Array.isArray(L)){const P=[];$[B]=[],O[B]=[],L.forEach(function(X){typeof X=="string"&&X.indexOf("*")>=0?P.push(e(X).replace(/\\\*/g,".*")):X instanceof RegExp?O[B].push(X):$[B].push(X)}),P.length&&(E[B]=new RegExp("^("+P.join("|")+")$"))}});const D={};let z;u(g.transformTags,function(L,B){let P;typeof L=="function"?P=L:typeof L=="string"&&(P=p.simpleTransform(L)),B==="*"?z=P:D[B]=P});let I,K,G,Z,se,ge,Tt=!1;W();const kr=new t.Parser({onopentag:function(L,B){if(g.onOpenTag&&g.onOpenTag(L,B),g.enforceHtmlBoundary&&L==="html"&&W(),se){ge++;return}const P=new y(L,B);K.push(P);let X=!1;const Le=!!P.text;let Fe;if(c(D,L)&&(Fe=D[L](L,B),P.attribs=B=Fe.attribs,Fe.text!==void 0&&(P.innerText=Fe.text),L!==Fe.tagName&&(P.name=L=Fe.tagName,Z[I]=Fe.tagName)),z&&(Fe=z(L,B),P.attribs=B=Fe.attribs,L!==Fe.tagName&&(P.name=L=Fe.tagName,Z[I]=Fe.tagName)),(!S(L)||g.disallowedTagsMode==="recursiveEscape"&&!f(G)||g.nestingLimit!=null&&I>=g.nestingLimit)&&(X=!0,G[I]=!0,(g.disallowedTagsMode==="discard"||g.disallowedTagsMode==="completelyDiscard")&&C.indexOf(L)!==-1&&(se=!0,ge=1)),I++,X){if(g.disallowedTagsMode==="discard"||g.disallowedTagsMode==="completelyDiscard"){if(P.innerText&&!Le){const de=ct(P.innerText);g.textFilter?_+=g.textFilter(de,L):_+=de,Tt=!0}return}v=_,_=""}_+="<"+L,L==="script"&&(g.allowedScriptHostnames||g.allowedScriptDomains)&&(P.innerText=""),X&&(g.disallowedTagsMode==="escape"||g.disallowedTagsMode==="recursiveEscape")&&g.preserveEscapedAttributes?u(B,function(de,ne){_+=" "+ne+'="'+ct(de||"",!0)+'"'}):(!A||c(A,L)||A["*"])&&u(B,function(de,ne){if(!d.test(ne)){delete P.attribs[ne];return}if(de===""&&!g.allowedEmptyAttributes.includes(ne)&&(g.nonBooleanAttributes.includes(ne)||g.nonBooleanAttributes.includes("*"))){delete P.attribs[ne];return}let Gn=!1;if(!A||c(A,L)&&A[L].indexOf(ne)!==-1||A["*"]&&A["*"].indexOf(ne)!==-1||c(T,L)&&T[L].test(ne)||T["*"]&&T["*"].test(ne))Gn=!0;else if(A&&A[L]){for(const ue of A[L])if(i(ue)&&ue.name&&ue.name===ne){Gn=!0;let ce="";if(ue.multiple===!0){const hi=de.split(" ");for(const qt of hi)ue.values.indexOf(qt)!==-1&&(ce===""?ce=qt:ce+=" "+qt)}else ue.values.indexOf(de)>=0&&(ce=de);de=ce}}if(Gn){if(g.allowedSchemesAppliedToAttributes.indexOf(ne)!==-1&&di(L,de)){delete P.attribs[ne];return}if(L==="script"&&ne==="src"){let ue=!0;try{const ce=gs(de);if(g.allowedScriptHostnames||g.allowedScriptDomains){const hi=(g.allowedScriptHostnames||[]).find(function(dt){return dt===ce.url.hostname}),qt=(g.allowedScriptDomains||[]).find(function(dt){return ce.url.hostname===dt||ce.url.hostname.endsWith(`.${dt}`)});ue=hi||qt}}catch{ue=!1}if(!ue){delete P.attribs[ne];return}}if(L==="iframe"&&ne==="src"){let ue=!0;try{const ce=gs(de);if(ce.isRelativeUrl)ue=c(g,"allowIframeRelativeUrls")?g.allowIframeRelativeUrls:!g.allowedIframeHostnames&&!g.allowedIframeDomains;else if(g.allowedIframeHostnames||g.allowedIframeDomains){const hi=(g.allowedIframeHostnames||[]).find(function(dt){return dt===ce.url.hostname}),qt=(g.allowedIframeDomains||[]).find(function(dt){return ce.url.hostname===dt||ce.url.hostname.endsWith(`.${dt}`)});ue=hi||qt}}catch{ue=!1}if(!ue){delete P.attribs[ne];return}}if(ne==="srcset")try{let ue=s(de);if(ue.forEach(function(ce){di("srcset",ce.url)&&(ce.evil=!0)}),ue=h(ue,function(ce){return!ce.evil}),ue.length)de=a(h(ue,function(ce){return!ce.evil})),P.attribs[ne]=de;else{delete P.attribs[ne];return}}catch{delete P.attribs[ne];return}if(ne==="class"){const ue=$[L],ce=$["*"],hi=E[L],qt=O[L],dt=O["*"],tf=E["*"],El=[hi,tf].concat(qt,dt).filter(function(rf){return rf});if(ue&&ce?de=ys(de,r(ue,ce),El):de=ys(de,ue||ce,El),!de.length){delete P.attribs[ne];return}}if(ne==="style"){if(g.parseStyleAttributes)try{const ue=n(L+" {"+de+"}",{map:!1}),ce=Sr(ue,g.allowedStyles);if(de=Kn(ce),de.length===0){delete P.attribs[ne];return}}catch{typeof window<"u"&&console.warn('Failed to parse "'+L+" {"+de+`}", If you're running this in a browser, we recommend to disable style parsing: options.parseStyleAttributes: false, since this only works in a node environment due to a postcss dependency, More info: https://github.com/apostrophecms/sanitize-html/issues/547`),delete P.attribs[ne];return}else if(g.allowedStyles)throw new Error("allowedStyles option cannot be used together with parseStyleAttributes: false.")}_+=" "+ne,de&&de.length?_+='="'+ct(de,!0)+'"':g.allowedEmptyAttributes.includes(ne)&&(_+='=""')}else delete P.attribs[ne]}),g.selfClosing.indexOf(L)!==-1?_+=" />":(_+=">",P.innerText&&!Le&&!g.textFilter&&(_+=ct(P.innerText),Tt=!0)),X&&(_=v+ct(_),v=""),P.openingTagLength=_.length-P.tagPosition},ontext:function(L){if(se)return;const B=K[K.length-1];let P;if(B&&(P=B.tag,L=B.innerText!==void 0?B.innerText:L),g.disallowedTagsMode==="completelyDiscard"&&!S(P))L="";else if((g.disallowedTagsMode==="discard"||g.disallowedTagsMode==="completelyDiscard")&&(P==="script"||P==="style"))_+=L;else if(!Tt){const X=ct(L,!1);g.textFilter?_+=g.textFilter(X,P):_+=X}if(K.length){const X=K[K.length-1];X.text+=L}},onclosetag:function(L,B){if(g.onCloseTag&&g.onCloseTag(L,B),se)if(ge--,!ge)se=!1;else return;const P=K.pop();if(!P)return;if(P.tag!==L){K.push(P);return}se=g.enforceHtmlBoundary?L==="html":!1,I--;const X=G[I];if(X){if(delete G[I],g.disallowedTagsMode==="discard"||g.disallowedTagsMode==="completelyDiscard"){P.updateParentNodeText();return}v=_,_=""}if(Z[I]&&(L=Z[I],delete Z[I]),g.exclusiveFilter){const Le=g.exclusiveFilter(P);if(Le==="excludeTag"){X&&(_=v,v=""),_=_.substring(0,P.tagPosition)+_.substring(P.tagPosition+P.openingTagLength);return}else if(Le){_=_.substring(0,P.tagPosition);return}}if(P.updateParentNodeMediaChildren(),P.updateParentNodeText(),g.selfClosing.indexOf(L)!==-1||B&&!S(L)&&["escape","recursiveEscape"].indexOf(g.disallowedTagsMode)>=0){X&&(_=v,v="");return}_+="</"+L+">",X&&(_=v+ct(_),v=""),Tt=!1}},g.parser);return kr.write(w),kr.end(),_;function W(){_="",I=0,K=[],G={},Z={},se=!1,ge=0}function ct(L,B){return typeof L!="string"&&(L=L+""),g.parser.decodeEntities&&(L=L.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),B&&(L=L.replace(/"/g,"&quot;"))),L=L.replace(/&(?![a-zA-Z0-9#]{1,20};)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),B&&(L=L.replace(/"/g,"&quot;")),L}function di(L,B){for(B=B.replace(/[\x00-\x20]+/g,"");;){const Le=B.indexOf("<!--");if(Le===-1)break;const Fe=B.indexOf("-->",Le+4);if(Fe===-1)break;B=B.substring(0,Le)+B.substring(Fe+3)}const P=B.match(/^([a-zA-Z][a-zA-Z0-9.\-+]*):/);if(!P)return B.match(/^[/\\]{2}/)?!g.allowProtocolRelative:!1;const X=P[1].toLowerCase();return c(g.allowedSchemesByTag,L)?g.allowedSchemesByTag[L].indexOf(X)===-1:!g.allowedSchemes||g.allowedSchemes.indexOf(X)===-1}function gs(L){if(L=L.replace(/^(\w+:)?\s*[\\/]\s*[\\/]/,"$1//"),L.startsWith("relative:"))throw new Error("relative: exploit attempt");let B="relative://relative-site";for(let Le=0;Le<100;Le++)B+=`/${Le}`;const P=new URL(L,B);return{isRelativeUrl:P&&P.hostname==="relative-site"&&P.protocol==="relative:",url:P}}function Sr(L,B){if(!B)return L;const P=L.nodes[0];let X;return B[P.selector]&&B["*"]?X=r(B[P.selector],B["*"]):X=B[P.selector]||B["*"],X&&(L.nodes[0].nodes=P.nodes.reduce(Wn(X),[])),L}function Kn(L){return L.nodes[0].nodes.reduce(function(B,P){return B.push(`${P.prop}:${P.value}${P.important?" !important":""}`),B},[]).join(";")}function Wn(L){return function(B,P){return c(L,P.prop)&&L[P.prop].some(function(Le){return Le.test(P.value)})&&B.push(P),B}}function ys(L,B,P){return B?(L=L.split(/\s+/),L.filter(function(X){return B.indexOf(X)!==-1||P.some(function(Le){return Le.test(X)})}).join(" ")):L}}const b={decodeEntities:!0};return p.defaults={allowedTags:["address","article","aside","footer","header","h1","h2","h3","h4","h5","h6","hgroup","main","nav","section","blockquote","dd","div","dl","dt","figcaption","figure","hr","li","menu","ol","p","pre","ul","a","abbr","b","bdi","bdo","br","cite","code","data","dfn","em","i","kbd","mark","q","rb","rp","rt","rtc","ruby","s","samp","small","span","strong","sub","sup","time","u","var","wbr","caption","col","colgroup","table","tbody","td","tfoot","th","thead","tr"],nonBooleanAttributes:["abbr","accept","accept-charset","accesskey","action","allow","alt","as","autocapitalize","autocomplete","blocking","charset","cite","class","color","cols","colspan","content","contenteditable","coords","crossorigin","data","datetime","decoding","dir","dirname","download","draggable","enctype","enterkeyhint","fetchpriority","for","form","formaction","formenctype","formmethod","formtarget","headers","height","hidden","high","href","hreflang","http-equiv","id","imagesizes","imagesrcset","inputmode","integrity","is","itemid","itemprop","itemref","itemtype","kind","label","lang","list","loading","low","max","maxlength","media","method","min","minlength","name","nonce","optimum","pattern","ping","placeholder","popover","popovertarget","popovertargetaction","poster","preload","referrerpolicy","rel","rows","rowspan","sandbox","scope","shape","size","sizes","slot","span","spellcheck","src","srcdoc","srclang","srcset","start","step","style","tabindex","target","title","translate","type","usemap","value","width","wrap","onauxclick","onafterprint","onbeforematch","onbeforeprint","onbeforeunload","onbeforetoggle","onblur","oncancel","oncanplay","oncanplaythrough","onchange","onclick","onclose","oncontextlost","oncontextmenu","oncontextrestored","oncopy","oncuechange","oncut","ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onformdata","onhashchange","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onlanguagechange","onload","onloadeddata","onloadedmetadata","onloadstart","onmessage","onmessageerror","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onoffline","ononline","onpagehide","onpageshow","onpaste","onpause","onplay","onplaying","onpopstate","onprogress","onratechange","onreset","onresize","onrejectionhandled","onscroll","onscrollend","onsecuritypolicyviolation","onseeked","onseeking","onselect","onslotchange","onstalled","onstorage","onsubmit","onsuspend","ontimeupdate","ontoggle","onunhandledrejection","onunload","onvolumechange","onwaiting","onwheel"],disallowedTagsMode:"discard",allowedAttributes:{a:["href","name","target"],img:["src","srcset","alt","title","width","height","loading"]},allowedEmptyAttributes:["alt"],selfClosing:["img","br","hr","area","base","basefont","input","link","meta"],allowedSchemes:["http","https","ftp","mailto","tel"],allowedSchemesByTag:{},allowedSchemesAppliedToAttributes:["href","src","cite"],allowProtocolRelative:!0,enforceHtmlBoundary:!1,parseStyleAttributes:!0,preserveEscapedAttributes:!1},p.simpleTransform=function(w,g,x){return x=x===void 0?!0:x,g=g||{},function(_,v){let y;if(x)for(y in g)v[y]=g[y];else v=g;return{tagName:w,attribs:v}}},Xo}var tv=ev();const iv=Ay(tv);let pl=class{constructor(e,i=null,r=null){this.sifter=e,i&&(this.remainingStr=r.slice(i[0].length).trimLeft())}apply(e){e.push(this)}};class Si extends Error{constructor(){super("Method not implemented."),this.name="NotImplementedError"}}let ml=class extends Error{constructor(e,i){super(`${e} "${i}"`),this.name="SearchSyntaxError"}};class rv extends Error{constructor(e,i){super(`Provided search string has length ${e.length}, which exceeds the maximum allowed length of ${i}`),this.name="SearchLengthError"}}class sv extends Error{constructor(e){super(`No default parser configured, failed to parse "${e.value}"`),this.name="NoDefaultParserError"}}class nv extends Error{constructor(e,i,r){const s=r.name,n=i[e].name;super(`Key "${e}" for ${s} was already registered for ${n}`),this.name="KeyConflictError"}}class ov extends Error{constructor(e){super(`Extension "${e}" already registered`),this.name="ExtensionCollisionError"}}class av extends pl{static match(e,i){throw new Si}static parse(e,i,r){return new this(e,i,r)}equals(e){throw new Si}greaterThan(e){throw new Si}lessThan(e){throw new Si}}function lv(t){return typeof t=="number"?t.toString():t}class jn extends av{static match(e,i){return i.match(/^"((?:[^"\\]|\\.)*)"/)||i.match(/^([^\s)]+)/)}static parse(e,i,r){return new this(e,i,r)}constructor(e,i,r){super(e,i,r),this.value=i[1].toLowerCase()}includes(e){return e.toLowerCase().includes(this.value)}equals(e){return lv(e).toLowerCase()===this.value}greaterThan(e){throw new SearchSyntaxError("String expressions do not support the greater than operator")}lessThan(e){throw new SearchSyntaxError("String expressions do not support the less than operator")}}class Ph extends pl{static match(e,i){throw new Si}static parse(e,i,r){throw new Si}testValue(e,i){throw new Si}}class bl extends Ph{static match(e,i){return i.match(/^:/)}static parse(e,i,r){return new bl(e,i,r)}testValue(e,i){return i.includes?i.includes(e):i.equals(e)}}class Ui extends pl{static parse(e,i,r){return new this(e,i,r)}getParsers(e,i){if(i.parsers)return i.parsers;const r=this.constructor.getParsersToTry(i),s=e.toLowerCase()[0];return[...r.hasOwnProperty(s)?[r[s]]:[],...r.default||[]]}parseString(e,i,r,s){return this.sifter.parseString(this.sifter,new s(this.sifter),e.parse(this.sifter,i,r))}parseNext(e,i={}){const r=i.DefaultOperator||bl;for(const s of this.getParsers(e,i)){const n=s.match(this.sifter,e,i);if(n)return s===jn?this.parseString(s,n,e,r):s.parse(this.sifter,n,e)}}}class gl extends Ui{static match(e,i){return i.match(/^\s*\)/)}static parse(e,i,r){return new gl(e,i,r)}apply(){this.endGroup=!0}}function uv(t,e,i){const r=i[1].toLowerCase(),s=t.getKeywordClass(r);if(!s)return;const n=e.slice(i[0].length);return s.supportedOperators.some(o=>o.match(t,n))}class Mh extends Ui{static match(e,i){const r=i.match(/^\s*(\w+)/);if(!(!r||!uv(e,i,r)))return r}static parse(e,i,r){const s=i[1].toLowerCase();return e.getKeywordClass(s).parse(e,i,r)}}class zh extends Ui{static match(e,i){return i.match(/^\s*\(/)}static parse(e,i,r){const s=r.slice(i[0].length);return Ai.parse(e,s,{nested:!0})}}class yl extends Ph{static match(e,i){return i.match(/^=/)}static parse(e,i,r){return new yl(e,i,r)}testValue(e,i){return i.equals(e)}}class Hn extends Ui{static getParsersToTry(){return{default:[jn]}}static match(e,i){return i.match(/^\s*!/)}static parse(e,i,r){return new Hn(e,i,r)}constructor(e,i,r){super(e,i,r);const s={DefaultOperator:yl};this.filter=this.parseNext(this.remainingStr,s),this.remainingStr=this.filter.remainingStr}test(e){return this.filter.test(e)}}class vl extends Ui{static getParsersToTry(){return{"(":zh,"!":Hn,default:[Mh,jn]}}static match(e,i){return i.match(/^\s*-/)}static parse(e,i,r){return new vl(e,i,r)}constructor(e,i,r){if(super(e,i,r),this.filter=this.parseNext(this.remainingStr),!this.filter)throw new ml('Expected "-" to be followed by a filter.',r);this.remainingStr=this.filter.remainingStr}test(e){return!this.filter.test(e)}}class cv extends Ui{static match(e,i){return i.match(/^\s*or\s/i)}parseFirstGroup(e){return e.length>1?new Ai(this.sifter,[...e],"",{mode:"AND"}):e.pop()}parseSecondGroup(){const e=Ai.parse(this.sifter,this.remainingStr);return this.remainingStr=e.remainingStr,e.filters.length>1?e:e.filters[0]}apply(e){if(e.length===0)throw new ml("Invalid OR syntax at",this.remainingStr);const i=this.parseFirstGroup(e),r=this.parseSecondGroup(),s=new Ai(this.sifter,[i,r],r.remainingStr,{mode:"OR"});e.splice(0,e.length,s)}}class Ai extends Ui{static getParsersToTry({nested:e}){return{"-":vl,"!":Hn,"(":zh,o:cv,...e&&{")":gl},default:[Mh,jn]}}static parse(e,i,r={}){const s=new Ai(e,[],i.trim(),{mode:"AND"});return s.parseFilters(r),s}constructor(e,i,r,s){super(e),this.filters=i,this.remainingStr=r,this.options=s}parseFilters(e){for(;this.remainingStr.length;){const i=this.parseNext(this.remainingStr,e);if(!i||(i.apply(this.filters),this.remainingStr===i.remainingStr)||(this.remainingStr=i.remainingStr.trimLeft(),i.endGroup))break}}test(e){if(this.options.mode==="AND")return this.filters.every(i=>i.test(e));if(this.options.mode==="OR")return this.filters.some(i=>i.test(e));throw new Error("Unknown filter group mode "+this.options.mode)}}const dv={queryMaxLength:1024};class hv{constructor(e={}){this.keywords={},this.AdapterClass=null,this.config={...dv,...e}}compile(e){if(e.length>this.config.queryMaxLength)throw new rv(e,this.config.queryMaxLength);const i=Ai.parse(this,e),r=i.remainingStr;if(r.length)throw new ml("Failed to parse",r);return i.filters.length>1?i:i.filters[0]}filter(e,i){const r=this.compile(i);return e.filter(s=>{const n=this.AdapterClass?new this.AdapterClass(this,s):s;return r.test(n)})}getKeywordClass(e){return this.keywords[e]}addKeywords(e){for(let i of e)this.registerKeyword(i)}extend(e,...i){if(this.hasOwnProperty(e.name))throw new ov(e.name);this[e.name]=new e(...i)}registerKeyword(e){for(const i of e.keys){if(this.keywords.hasOwnProperty(i))throw new nv(i,this.keywords,e);this.keywords[i]=e}}parseString(e,i,r){throw new sv(r)}setBaseStringParser(e){this.parseString=e}setInputAdapter(e){this.AdapterClass=e}}const fv=new hv,pv=10,mv=200;class bv{#e={};#t=!1;#r=[];#i;constructor(e){this.gameId=e,this.#i=this.load()}get key(){return`appConfig-${this.gameId}`}async load(){try{const e=await H1(this.key);this.#e=JSON.parse(e)||{}}catch(e){console.warn("App config not found",e),this.#e={}}Array.isArray(this.#e.recentFiles)||(this.#e.recentFiles=[]),this.queueSave()}async set(e,i){await this.#i,this.#e[e]=i,this.queueSave()}get(e,i=null){return e in this.#e?this.#e[e]:i}get recentFiles(){return this.#e?.recentFiles?.slice()||[]}async addRecentFile(e){await this.#i,this.#e.recentFiles=[e,...this.#e.recentFiles.filter(i=>i!==e)].slice(0,pv);for(const i of this.#r)i(this.#e.recentFiles);this.queueSave()}onRecentFilesChanged(e){this.#r.push(e)}queueSave(){this.#t||(this.#t=!0,setTimeout(async()=>{this.#t=!1,await this.save()},mv))}async save(){const e=JSON.stringify(this.#e);await K1(this.key,e)}}class Rh{type="BaseAdapter";canEncode(e){throw new Error("canEncode() must be implemented by subclass")}canDecode(e){throw new Error("canDecode() must be implemented by subclass")}async encode(e,i){throw new Error("encode() must be implemented by subclass")}async decode(e,i){throw new Error("decode() must be implemented by subclass")}}function gv(t){return new Promise((e,i)=>{const r=new FileReader;r.onload=()=>e(r.result),r.onerror=()=>i(new Error('"Failed to read blob')),r.readAsDataURL(t)})}class Bh extends Rh{nodeType="ObjectURL";canEncode(e){return typeof e=="string"&&e.startsWith("blob:")}canDecode(e){return e.__type===this.nodeType||/^(data:)+(image\/\w+);base64,/.test(e)}async encode(e){const r=await(await fetch(e)).blob(),s=await gv(r);return{__type:this.nodeType,data:s}}async decode(e){const i=await fetch(e.data||e);return URL.createObjectURL(await i.blob())}}class yv extends Bh{canDecode(e){return e.__type===this.nodeType}async encode(e){const r=await(await fetch(e)).blob(),s=await r.arrayBuffer();return{__type:this.nodeType,mime:r.type,binary:s}}async decode(e){const i=new Uint8Array(e.binary),r=new Blob([i],{type:e.mime});return URL.createObjectURL(r)}}const Fh=new Set,qh=new Set;function Uh(t){Fh.add(new t)}function Vh(t){qh.add(new t)}function vv(){return[...Fh]}function wv(){return[...qh]}Uh(Bh);Vh(yv);class wl{static matches(e){return!1}static async save(e,i,r={}){const n=await new this().serialize(i,r);await xr(e,n)}static async load(e){const i=new this,r=await ps(e);return await i.deserialize(r)}constructor(e=null){this.adapters=e||vv()}async encode(e){throw new Error("Not implemented")}async decode(e){throw new Error("Not implemented")}async serialize(e,i={}){const r=await this.encodeNode(e);return this.encode(r,i)}async deserialize(e){const i=await this.decode(e);return this.decodeNode(i)}async encodeObject(e){const i={};for(const[r,s]of Object.entries(e))i[r]=await this.encodeNode(s);return i}async encodeNode(e){for(const i of this.adapters)if(i.canEncode(e))return i.encode(e,this);return Array.isArray(e)?Promise.all(e.map(i=>this.encodeNode(i))):e&&typeof e=="object"?await this.encodeObject(e):e}async decodeObject(e){const i={};for(const[r,s]of Object.entries(e))i[r]=await this.decodeNode(s);return i}async decodeNode(e){if(!e)return e;const i=this.adapters.find(r=>r.canDecode(e));return i?await i.decode(e,this):Array.isArray(e)?Promise.all(e.map(r=>this.decodeNode(r))):e&&typeof e=="object"?await this.decodeObject(e):e}}class xv extends wl{static matches(){return!0}async encode(e,i={}){return JSON.stringify(e,null,i.whitespace)}async decode(e){return JSON.parse(e)}}class _v extends wl{static matches(e){return/\.yml$/i.test(e)}async encode(e){return cn.stringify(e)}async decode(e){return cn.parse(e)}}var Fs={},Jo,Oc;function kv(){if(Oc)return Jo;Oc=1;var t=4294967296-1,e=17179869184-1;function i(o,l,u){for(var c=0,h=0,f=u.length;h<f;h++)c=u.charCodeAt(h),c<128?o.setUint8(l++,c):c<2048?(o.setUint8(l++,192|c>>6),o.setUint8(l++,128|c&63)):c<55296||c>=57344?(o.setUint8(l++,224|c>>12),o.setUint8(l++,128|c>>6&63),o.setUint8(l++,128|c&63)):(h++,c=65536+((c&1023)<<10|u.charCodeAt(h)&1023),o.setUint8(l++,240|c>>18),o.setUint8(l++,128|c>>12&63),o.setUint8(l++,128|c>>6&63),o.setUint8(l++,128|c&63))}function r(o){for(var l=0,u=0,c=0,h=o.length;c<h;c++)l=o.charCodeAt(c),l<128?u+=1:l<2048?u+=2:l<55296||l>=57344?u+=3:(c++,u+=4);return u}function s(o,l,u){var c=typeof u,h=0,f=0,a=0,d=0,p=0,b=0;if(c==="string"){if(p=r(u),p<32)o.push(p|160),b=1;else if(p<256)o.push(217,p),b=2;else if(p<65536)o.push(218,p>>8,p),b=3;else if(p<4294967296)o.push(219,p>>24,p>>16,p>>8,p),b=5;else throw new Error("String too long");return l.push({_str:u,_length:p,_offset:o.length}),b+p}if(c==="number")return Math.floor(u)!==u||!isFinite(u)?(o.push(203),l.push({_float:u,_length:8,_offset:o.length}),9):u>=0?u<128?(o.push(u),1):u<256?(o.push(204,u),2):u<65536?(o.push(205,u>>8,u),3):u<4294967296?(o.push(206,u>>24,u>>16,u>>8,u),5):(a=u/Math.pow(2,32)>>0,d=u>>>0,o.push(207,a>>24,a>>16,a>>8,a,d>>24,d>>16,d>>8,d),9):u>=-32?(o.push(u),1):u>=-128?(o.push(208,u),2):u>=-32768?(o.push(209,u>>8,u),3):u>=-2147483648?(o.push(210,u>>24,u>>16,u>>8,u),5):(a=Math.floor(u/Math.pow(2,32)),d=u>>>0,o.push(211,a>>24,a>>16,a>>8,a,d>>24,d>>16,d>>8,d),9);if(c==="object"){if(u===null)return o.push(192),1;if(Array.isArray(u)){if(p=u.length,p<16)o.push(p|144),b=1;else if(p<65536)o.push(220,p>>8,p),b=3;else if(p<4294967296)o.push(221,p>>24,p>>16,p>>8,p),b=5;else throw new Error("Array too large");for(h=0;h<p;h++)b+=s(o,l,u[h]);return b}if(u instanceof Date){var w=u.getTime(),g=Math.floor(w/1e3),x=(w-g*1e3)*1e6;return g>=0&&x>=0&&g<=e?x===0&&g<=t?(o.push(214,255,g>>24,g>>16,g>>8,g),6):(a=g/4294967296,d=g&4294967295,o.push(215,255,x>>22,x>>14,x>>6,a,d>>24,d>>16,d>>8,d),10):(a=Math.floor(g/4294967296),d=g>>>0,o.push(199,12,255,x>>24,x>>16,x>>8,x,a>>24,a>>16,a>>8,a,d>>24,d>>16,d>>8,d),15)}if(u instanceof ArrayBuffer){if(p=u.byteLength,p<256)o.push(196,p),b=2;else if(p<65536)o.push(197,p>>8,p),b=3;else if(p<4294967296)o.push(198,p>>24,p>>16,p>>8,p),b=5;else throw new Error("Buffer too large");return l.push({_bin:u,_length:p,_offset:o.length}),b+p}if(typeof u.toJSON=="function")return s(o,l,u.toJSON());var _=[],v="",y=Object.keys(u);for(h=0,f=y.length;h<f;h++)v=y[h],u[v]!==void 0&&typeof u[v]!="function"&&_.push(v);if(p=_.length,p<16)o.push(p|128),b=1;else if(p<65536)o.push(222,p>>8,p),b=3;else if(p<4294967296)o.push(223,p>>24,p>>16,p>>8,p),b=5;else throw new Error("Object too large");for(h=0;h<p;h++)v=_[h],b+=s(o,l,v),b+=s(o,l,u[v]);return b}if(c==="boolean")return o.push(u?195:194),1;if(c==="undefined")return o.push(192),1;if(typeof u.toJSON=="function")return s(o,l,u.toJSON());throw new Error("Could not encode")}function n(o){var l=[],u=[],c=s(l,u,o),h=new ArrayBuffer(c),f=new DataView(h),a=0,d=0,p=-1;u.length>0&&(p=u[0]._offset);for(var b,w=0,g=0,x=0,_=l.length;x<_;x++)if(f.setUint8(d+x,l[x]),x+1===p){if(b=u[a],w=b._length,g=d+p,b._bin)for(var v=new Uint8Array(b._bin),y=0;y<w;y++)f.setUint8(g+y,v[y]);else b._str?i(f,g,b._str):b._float!==void 0&&f.setFloat64(g,b._float);a++,d+=w,u[a]&&(p=u[a]._offset)}return h}return Jo=n,Jo}var Qo,$c;function Sv(){if($c)return Qo;$c=1;function t(r){if(this._offset=0,r instanceof ArrayBuffer)this._buffer=r,this._view=new DataView(this._buffer);else if(ArrayBuffer.isView(r))this._buffer=r.buffer,this._view=new DataView(this._buffer,r.byteOffset,r.byteLength);else throw new Error("Invalid argument")}function e(r,s,n){for(var o="",l=0,u=s,c=s+n;u<c;u++){var h=r.getUint8(u);if((h&128)===0){o+=String.fromCharCode(h);continue}if((h&224)===192){o+=String.fromCharCode((h&31)<<6|r.getUint8(++u)&63);continue}if((h&240)===224){o+=String.fromCharCode((h&15)<<12|(r.getUint8(++u)&63)<<6|(r.getUint8(++u)&63)<<0);continue}if((h&248)===240){l=(h&7)<<18|(r.getUint8(++u)&63)<<12|(r.getUint8(++u)&63)<<6|(r.getUint8(++u)&63)<<0,l>=65536?(l-=65536,o+=String.fromCharCode((l>>>10)+55296,(l&1023)+56320)):o+=String.fromCharCode(l);continue}throw new Error("Invalid byte "+h.toString(16))}return o}t.prototype._array=function(r){for(var s=new Array(r),n=0;n<r;n++)s[n]=this._parse();return s},t.prototype._map=function(r){for(var s="",n={},o=0;o<r;o++)s=this._parse(),n[s]=this._parse();return n},t.prototype._str=function(r){var s=e(this._view,this._offset,r);return this._offset+=r,s},t.prototype._bin=function(r){var s=this._buffer.slice(this._offset,this._offset+r);return this._offset+=r,s},t.prototype._parse=function(){var r=this._view.getUint8(this._offset++),s,n=0,o=0,l=0,u=0;if(r<192)return r<128?r:r<144?this._map(r&15):r<160?this._array(r&15):this._str(r&31);if(r>223)return(255-r+1)*-1;switch(r){case 192:return null;case 194:return!1;case 195:return!0;case 196:return n=this._view.getUint8(this._offset),this._offset+=1,this._bin(n);case 197:return n=this._view.getUint16(this._offset),this._offset+=2,this._bin(n);case 198:return n=this._view.getUint32(this._offset),this._offset+=4,this._bin(n);case 199:if(n=this._view.getUint8(this._offset),o=this._view.getInt8(this._offset+1),this._offset+=2,o===-1){var c=this._view.getUint32(this._offset);return l=this._view.getInt32(this._offset+4),u=this._view.getUint32(this._offset+8),this._offset+=12,new Date((l*4294967296+u)*1e3+c/1e6)}return[o,this._bin(n)];case 200:return n=this._view.getUint16(this._offset),o=this._view.getInt8(this._offset+2),this._offset+=3,[o,this._bin(n)];case 201:return n=this._view.getUint32(this._offset),o=this._view.getInt8(this._offset+4),this._offset+=5,[o,this._bin(n)];case 202:return s=this._view.getFloat32(this._offset),this._offset+=4,s;case 203:return s=this._view.getFloat64(this._offset),this._offset+=8,s;case 204:return s=this._view.getUint8(this._offset),this._offset+=1,s;case 205:return s=this._view.getUint16(this._offset),this._offset+=2,s;case 206:return s=this._view.getUint32(this._offset),this._offset+=4,s;case 207:return l=this._view.getUint32(this._offset)*Math.pow(2,32),u=this._view.getUint32(this._offset+4),this._offset+=8,l+u;case 208:return s=this._view.getInt8(this._offset),this._offset+=1,s;case 209:return s=this._view.getInt16(this._offset),this._offset+=2,s;case 210:return s=this._view.getInt32(this._offset),this._offset+=4,s;case 211:return l=this._view.getInt32(this._offset)*Math.pow(2,32),u=this._view.getUint32(this._offset+4),this._offset+=8,l+u;case 212:if(o=this._view.getInt8(this._offset),this._offset+=1,o===0){this._offset+=1;return}return[o,this._bin(1)];case 213:return o=this._view.getInt8(this._offset),this._offset+=1,[o,this._bin(2)];case 214:return o=this._view.getInt8(this._offset),this._offset+=1,o===-1?(s=this._view.getUint32(this._offset),this._offset+=4,new Date(s*1e3)):[o,this._bin(4)];case 215:if(o=this._view.getInt8(this._offset),this._offset+=1,o===0)return l=this._view.getInt32(this._offset)*Math.pow(2,32),u=this._view.getUint32(this._offset+4),this._offset+=8,new Date(l+u);if(o===-1){l=this._view.getUint32(this._offset),u=this._view.getUint32(this._offset+4),this._offset+=8;var h=(l&3)*4294967296+u;return new Date(h*1e3+(l>>>2)/1e6)}return[o,this._bin(8)];case 216:return o=this._view.getInt8(this._offset),this._offset+=1,[o,this._bin(16)];case 217:return n=this._view.getUint8(this._offset),this._offset+=1,this._str(n);case 218:return n=this._view.getUint16(this._offset),this._offset+=2,this._str(n);case 219:return n=this._view.getUint32(this._offset),this._offset+=4,this._str(n);case 220:return n=this._view.getUint16(this._offset),this._offset+=2,this._array(n);case 221:return n=this._view.getUint32(this._offset),this._offset+=4,this._array(n);case 222:return n=this._view.getUint16(this._offset),this._offset+=2,this._map(n);case 223:return n=this._view.getUint32(this._offset),this._offset+=4,this._map(n)}throw new Error("Could not parse")};function i(r){var s=new t(r),n=s._parse();if(s._offset!==r.byteLength)throw new Error(r.byteLength-s._offset+" trailing bytes");return n}return Qo=i,Qo}var Ic;function Cv(){return Ic||(Ic=1,Fs.encode=kv(),Fs.decode=Sv()),Fs}var Lc=Cv();class Av extends wl{static async save(e,i,r={}){const n=await new this().serialize(i,r);await sl(e,n)}static async load(e){const i=new this,r=await W1(e);return await i.deserialize(r)}constructor(e){super(e||wv())}}class Ev extends Av{static matches(e){return/\.msgpack$/i.test(e)}async encode(e){const i=Lc.encode(e);return new Uint8Array(i,0,Math.min(i.byteLength,10*1024*1024))}async decode(e){return Lc.decode(e)}}const xl=[];function jh(t){return t?(Array.isArray(t)?t:[t]).map(i=>i.split(".")):null}function Tv(t){return function(){xl.remove(t)}}function _l(t,e,i){const r=jh(e),s={obj:t,paths:r,callback:i};return xl.push(s),Tv(s)}function Ov(t,e){return t.length!==e.length?!1:t.every((i,r)=>i===e[r])}function $v(t,e){return t.length<e.length?!1:e.every((i,r)=>i===t[r])}function Nc(t){return t.map(e=>e.join("."))}function Iv(t,e,i){if(!e)return{paths:null};if(!t)return{paths:Nc(e)};const r=e.filter(s=>t.some(n=>Ov(n,s)||i&&$v(n,s)));return r.length?{paths:Nc(r)}:null}window.changed=function(e,i){const r=jh(i);xl.forEach(s=>{if(s.obj!==e)return;const n=Iv(s.paths,r,s.deep);n&&s.callback(n)})};function Dc(t){return t?.nodeType===Node.TEXT_NODE}function Zo(t){return t?.nodeType===Node.ELEMENT_NODE}let Js=null;function Qi(t){t&&t.nodeType===1&&Js.add(t)}function Lv(t,e){for(const{name:i,value:r}of e.attributes)t.getAttribute(i)!==r&&(t.setAttribute(i,r),Qi(t));for(const{name:i}of Array.from(t.attributes))e.hasAttribute(i)||(t.removeAttribute(i),Qi(t))}function Nv(t,e,i){if(!e&&i){t.appendChild(i.cloneNode(!0)),Qi(t);return}if(e&&!i){t.removeChild(e),Qi(t);return}if(e.nodeType!==i.nodeType||Zo(e)&&e.tagName!==i.tagName){t.replaceChild(i.cloneNode(!0),e),Qi(t);return}if(Dc(e)&&Dc(i)){e.textContent!==i.textContent&&(e.textContent=i.textContent,Qi(e));return}Zo(e)&&Zo(i)&&(Lv(e,i),Hh(e,i))}function Hh(t,e){const i=Array.from(t.childNodes),r=Array.from(e.childNodes),s=Math.max(i.length,r.length);for(let n=0;n<s;n++)Nv(t,i[n],r[n])}function Dv(t,e){if(!e){t.textContent="";return}const i=document.createElement("template");i.innerHTML=e,Js=new Set,Hh(t,i.content);for(const r of Js)r.dispatchEvent(new CustomEvent("dom-morphed",{bubbles:!1}));Js=null}const Pv=500,Mv=document.querySelector(".status-container"),ar=[];class zv{constructor(e,i){this.text=e,this.timeout=i>0?setTimeout(()=>this.remove(),i*1e3):null}remove(){this.removing=!0,changed(ar),setTimeout(()=>ar.remove(this),Pv)}}function Rv(t,e=5){const i=new zv(t,e);return ar.push(i),changed(ar),i}_l(ar,"",()=>{Dv(Mv,ar.map(t=>`<div class="status-message ${t.removing?"removing":""}">
            ${t.text}
        </div>`))});const Pc=new Map;function _r(t,e){if(Pc.has(t))throw new Error(`Action ${t} already registered.`);Pc.set(t,e)}async function ka(t,e){const i=[".",t.path,e].join("/");if(!await vh(i))return"";const r=await ol(i);return i.endsWith(".json")?JSON.parse(r):r}async function ea(t,e){return{css:await ka(t,`${e}.css`),html:await ka(t,`${e}.html`)}}async function Bv(){const t=await zn("templates");for(const e of t){const i=await ka(e,"template.json");if(i&&(i.folder=e,Object.assign(i,await ea(e,"template")),i.form=await ea(e,"form"),i.options=await ea(e,"options"),!i.css||!i.html||!i.form.html)){console.warn("Incomplete template found at",e.path);continue}}}class Kr{constructor(e=0,i=0,r=0,s=0){this.width=e,this.height=i,this.xOffset=r,this.yOffset=s}static load(e){return new Kr(e.cropWidth||e.width||1,e.cropHeight||e.height||1,e.xOffset||0,e.yOffset||0)}clamp(e,i,r){const s=e-(r?this.width:1),n=i-(r?this.height:1);this.xOffset=Math.max(0,Math.min(this.xOffset,s)),this.yOffset=Math.max(0,Math.min(this.yOffset,n));const o=e-this.xOffset,l=i-this.yOffset;this.width=Math.min(Math.max(this.width,1),o),this.height=Math.min(Math.max(this.height,1),l)}save(){return{cropWidth:this.width,cropHeight:this.height,xOffset:this.xOffset,yOffset:this.yOffset}}clone(){return new this.constructor(this.width,this.height,this.xOffset,this.yOffset)}}class Fv{constructor(e=null,i="",r=0,s=0,n){this.imageUrl=e,this.filename=i,this.width=r,this.height=s,this.crop=n||new Kr}static async fromFile(e){const i=URL.createObjectURL(e),{width:r,height:s}=await cy(i),n=new Kr(r,s);return new this(i,e.name,r,s,n)}static async load(e){return new this(e.imageUrl,e.filename||"",e.width||0,e.height||0,Kr.load(e))}async save(){return{imageUrl:this.imageUrl,filename:this.filename,width:this.width,height:this.height,...this.crop.save()}}clone(){const e=new this.constructor(this.imageUrl,this.filename,this.width,this.height,this.crop.clone());return e.scale=this.scale,e}applyCoordinateSpace(e,i){e<this.width&&(this.scale=this.width/e),i<this.height&&(this.scale=Math.max(this.scale,this.height/i)),this.width=Math.round(this.width*10/this.scale)/10,this.height=Math.round(this.height*10/this.scale)/10,this.crop.width=Math.round(this.crop.width*10/this.scale)/10,this.crop.height=Math.round(this.crop.height*10/this.scale)/10,this.crop.xOffset=Math.round(this.crop.xOffset*10/this.scale)/10,this.crop.yOffset=Math.round(this.crop.yOffset*10/this.scale)/10}removeCoordinateSpace(){this.scale&&(this.width=Math.round(this.width*this.scale),this.height=Math.round(this.height*this.scale),this.crop.width=Math.round(this.crop.width*this.scale),this.crop.height=Math.round(this.crop.height*this.scale),this.crop.xOffset=Math.round(this.crop.xOffset*this.scale),this.crop.yOffset=Math.round(this.crop.yOffset*this.scale),delete this.scale)}}function qv(t){return Object.hasOwn(t,"default")?t.default:t.type==="checkboxlist"?{}:t.type==="select"?t.options?.[0]?.id||null:t.type==="multiselect"?[]:t.type==="image"?new Fv:""}function Uv(t,e={}){for(const i of t)e[i.id]=qv(i);return e}const gt=localize("set-manager"),Kh=[Ev,_v,xv],Vv=[],jv=[];let Ei={cards:[]},ii=null,Hi=null,Wh=null;async function Gh(t,e){await Kh.find(r=>r.matches(t)).save(t,e)}async function Hv(t){return await Kh.find(i=>i.matches(t)).load(t)}async function Yh(){const t=ii?ii.split(/[\\\/]/).pop():`${Ei.title||gt`My Set`}.json`,e=j1(gt`Save set to file`,t,[{name:gt`JSON Files`,extensions:["json"]},{name:gt`Packed Files`,extensions:["msgpack"]},{name:gt`YAML Files`,extensions:["yml"]},{name:gt`All files`,extensions:["*"]}]);e&&(console.info("Saving set to:",e),ii=e,await Gh(e,Ei))}async function Kv(){if(!ii)return await Yh();const t=Rv(gt`Saving...`,-1);console.info("Saving set to:",ii),await Gh(ii,Ei),t.text=gt`Saved.`,setTimeout(()=>t.remove(),1e3)}function Xh(t){const e=Sl();Ei=t||e.newSet(),e.autoNumberCards(Ei);for(const i of jv)i(Ei)}function Jh(){ii=null,Xh()}async function Wv(t){if(t=t||await V1(gt`Open a set`,[{name:gt`JSON Files`,extensions:["json"]},{name:gt`All files`,extensions:["*"]}]),!t)return;console.info("%cOpening set:","color:gold",t);const e=Sl(),i=await Hv(t);ii=t,Xh(e.loadSet(i)),await Yv().addRecentFile(t)}function Qh(){return Ei}async function kl(t){Hi?.front&&Hi.front.dispose(),Hi?.back&&Hi.back.dispose(),Hi=null,Vv.forEach(e=>e(Hi))}_r("add-face",t=>{Wh[t]={},kl()});_r("change-template",(t,e)=>{Wh[t].template=e,kl()});_r("open-set",Wv);_r("new-set",()=>{Jh(),kl()});_r("save-set",Kv);_r("save-set-as",Yh);const Zh=[];let Pr=null,ef=null;async function Gv(t){const e=Zh.find(s=>s.id===t);if(!e)throw new Error("Could not find game:",t);const i=[e.path,"main.js"].join("/"),{default:r}=await of(async()=>{const{default:s}=await import("/"+i);return{default:s}},[]);return Pr=new r(e.path),await Pr.init(),Pr.setupSearch(fv),Jh(),ef=new bv(t),Pr}function Sl(){return Pr}function Yv(){return ef}async function Xv(){const t=await zn("games");for(const e of t){console.debug("%cReading game:","color:gold",e.path);const i=[".",e.path,"game.json"].join("/");if(!await vh(i)){console.debug("No game.json found at",i);continue}const r=await ny(i);r.path=e.path,Zh.push(r)}}class Jv{#e=[];constructor(e,i){this.card=e,this.modulePath=i,this.name=i.split("/").pop()}dispose(){this.#e.forEach(e=>e())}watch(e,i,r){const s=_l(e,i,r);return this.#e.push(s),{remove(){const n=this.#e.indexOf(s);this.#e.splice(n,1),s()}}}resolvePath(e){return["modules",this.modulePath,e].join("/")}resolveAsset(e){return["modules",this.modulePath,"assets",e].join("/")}async loadFile(e){return await ol(this.resolvePath(e))}maskColor(e,i){return Cy(e,i)}maskImage(e,i){return Sy(e,i)}combineBlend(e,i,r="symmetricOverlay"){return xy(e,i,r)}linearBlend(e,i,r,s,n,o){return _y(e,i,r,s,n,o)}maskedBlend(e,i,r){return ky(e,i,r)}async loadFont(e,i){await wh(e,this.resolveAsset(i))}getActiveSet(){return Qh()}getActiveGame(){return Sl()}sanitize(e,i){return iv(e,i)}escapeHTML(e){return gh(e)}objectToStyle(e){return Object.entries(e).map(([i,r])=>`${i.separate("-").toLowerCase()}: ${r}`).join("; ")}requestRender;async init(e){}get fields(){return[]}get options(){return[]}async styles(){return[]}bind(e,i){}render(e){}renderNamed(e){}}const Qv=document.querySelector(".modal-container");function Zv(t){customElements.define(t.id,t)}function e2(){Qv.style.display="none"}class t2{constructor(e){this.gamePath=e,this.name=e.split("/").pop()}resolvePath(e){return[this.gamePath,e].join("/")}resolveAsset(e){return[this.gamePath,"assets",e].join("/")}async loadFile(e){return await ol(this.resolvePath(e))}async loadFont(e,i){await wh(e,this.resolveAsset(i))}get defaultTemplateId(){}get columns(){return[]}newCard(){return{front:{},notes:"",tags:[]}}newSet(){return{cards:[],info:{}}}loadSet(e){return e}getActiveSet(){return Qh()}addSerializerAdapter(e,i=!1){(i?Vh:Uh)(e(Rh))}setupSearch(e){}initializeFields(e,i={}){return Uv(e,i)}registerModal(e){Zv(e)}}async function Cl(t,e){const r=await(await new Promise(s=>{t.toBlob(s,"image/png")})).arrayBuffer();await sl(e,r)}function Ti(t){return new Promise((e,i)=>{const r=new Image;r.onload=()=>e(r),r.onerror=i,r.src=t})}async function Al(t,e=10){const i=[];for(let s=0;s<e;s++){const n=Date.now();await t();const o=Date.now();i.push(o-n)}return{avg:i.reduce((s,n)=>s+n,0)/i.length,times:i}}const lr=10,i2=["add","subtract","stamp","difference","negation","multiply","darken","lighten","colorDodge","colorBurn","screen","overlay","hardLight","softLight","reflect","glow","freeze","heat","and","or","xor","shadow","symmetricOverlay"];function r2(){describe("combineBlend",()=>{let t,e;const i={};beforeAll(async()=>{const r="/tests/fixtures/photo.jpg",s="/tests/fixtures/gradient.png";t=await Ti(r),e=await Ti(s)}),it("should combine photo and gradient for each mode",async()=>{let r;for(const s of i2){const{avg:n}=await Al(async()=>{r=await _h(t,e,s)},lr);i[s]=`${n.toFixed(2)} ms (avg over ${lr} runs)`,await Cl(r,`tests/output/${s}.png`),expect(r).toBeInstanceOf(HTMLCanvasElement)}console.log("Blend benchmark results:",i)}),afterAll(async()=>{await xr("tests/output/combineBlend_benchmark.json",JSON.stringify(i,null,2))})})}const s2=[{name:"vertical",x1:0,y1:0,x2:0,y2:1},{name:"horizontal",x1:0,y1:0,x2:1,y2:0},{name:"diagonal1",x1:0,y1:0,x2:1,y2:1},{name:"diagonal2",x1:1,y1:0,x2:0,y2:1}];function n2(){describe("linearBlend",()=>{let t,e;const i={};beforeAll(async()=>{const r="/tests/fixtures/photo.jpg",s="/tests/fixtures/gradient.png";t=await Ti(r),e=await Ti(s)}),it("should blend photo and gradient at various angles",async()=>{let r;for(const{name:s,x1:n,y1:o,x2:l,y2:u}of s2){const{avg:c}=await Al(async()=>{r=kh(t,e,n,o,l,u)},lr);i[s]=`${c.toFixed(2)} ms (avg over ${lr} runs)`,await Cl(r,`tests/output/linearBlend_${s}.png`),expect(r).toBeInstanceOf(HTMLCanvasElement)}console.log("Linear blend benchmark results:",i)}),afterAll(async()=>{await xr("tests/output/linearBlend_benchmark.json",JSON.stringify(i,null,2))})})}function o2(){describe("maskBlend",()=>{let t,e,i;const r={};beforeAll(async()=>{const s="/tests/fixtures/photo.jpg",n="/tests/fixtures/gradient.png",o="/tests/fixtures/softmask.png";t=await Ti(s),e=await Ti(n),i=await Ti(o)}),it("should blend two images based on a mask",async()=>{let s;const{avg:n}=await Al(async()=>{s=Sh(t,e,i),expect(s).toBeInstanceOf(HTMLCanvasElement)},lr);await Cl(s,"tests/output/maskBlend.png"),r.maskBlend=`${n.toFixed(2)} ms (avg over ${lr} runs)`,console.log("Mask blend benchmark results:",r)}),afterAll(async()=>{await xr("tests/output/maskBlend_benchmark.json",JSON.stringify(r,null,2))})})}function a2(t){return new Promise((e,i)=>{const r=new FileReader;r.onload=()=>{const s=r.result;e(s.split(",")[1])},r.onerror=()=>i("Failed FileReader"),r.readAsDataURL(t)})}function l2(t){return t.arrayBuffer().then(e=>{const i=new Uint8Array(e),r=32768;let s="";for(let n=0;n<i.length;n+=r){const o=i.subarray(n,n+r);let l="";for(let u=0;u<o.length;u++)l+=String.fromCharCode(o[u]);s+=l}return btoa(s)})}function u2(t){const{length:i}=t;for(let r=0;r<i;r+=65536){const s=t.subarray(r,r+65536);crypto.getRandomValues(s)}}function Mc(){return performance.memory?performance.memory.usedJSHeapSize:null}async function zc(t,e,i){const r={},s=Mc(),n=performance.now();let o;try{o=await e(i)}catch(c){throw console.error(`${t} encoding failed`,c),c}const l=performance.now(),u=Mc();return r.timeMs=l-n,r.memoryDelta=u!==null&&s!==null?u-s:null,r.base64Length=o.length,r}function c2(){describe("Blob Base64 Encoding Performance",()=>{[{label:"Small (50 KB)",size:51200},{label:"Medium (2 MB)",size:2097152},{label:"Large (20 MB)",size:20971520}].forEach(e=>{it(`compares encoding methods for ${e.label}`,async()=>{const i=new Uint8Array(e.size);u2(i);const r=new Blob([i],{type:"application/octet-stream"}),s=await zc("FileReader",a2,r),n=await zc("Chunked",l2,r);console.log(`=== ${e.label} ===`),console.log("FileReader: "+JSON.stringify(s)),console.log("Chunked: "+JSON.stringify(n)),expect(s.base64Length).toBeGreaterThan(0),expect(n.base64Length).toBeGreaterThan(0),expect(Math.abs(s.base64Length-n.base64Length)).toBeLessThan(e.size*.001)})})})}const Mr="https://cdn.jsdelivr.net/npm/jasmine-core@4.6.0/lib/jasmine-core",d2=[`${Mr}/jasmine.js`,`${Mr}/jasmine-html.js`,`${Mr}/boot0.js`,`${Mr}/boot1.js`],h2=`${Mr}/jasmine.css`;function f2(t){return new Promise((e,i)=>{const r=document.createElement("script");r.src=t,r.onload=e,r.onerror=()=>i(new Error(`Failed to load Jasmine script: ${t}`)),document.head.appendChild(r)})}function p2(t){return new Promise((e,i)=>{const r=document.createElement("link");r.rel="stylesheet",r.href=t,r.onload=e,r.onerror=()=>i(new Error("Failed to load Jasmine CSS")),document.head.appendChild(r)})}async function m2(){await p2(h2);for(const t of d2)await f2(t);return document.querySelectorAll("nav, template").forEach(t=>t.remove()),document.body.style.userSelect="auto",!0}async function b2(){r2(),n2(),o2(),c2()}class g2 extends HTMLElement{#e={};#t=[];constructor(){super(),this.watch=this.watch.bind(this)}disconnectedCallback(){for(const e in this.#e)this.#e[e]?.();for(const{eventName:e,callback:i}of this.#t)this.removeEventListener(e,i)}on(e,i){this.addEventListener(e,i),this.#t.push({eventName:e,callback:i})}handleEvents(e,i){this.on(e,r=>{const s=`${e}Action`,n=r.target.dataset?.[s],o=i[n];o&&o.call(this,r)})}watch(e,i,r,s){this.#e[e]?.();const n=_l(i,r,s);return this.#e[e]=n,{remove:()=>{delete this.#e[e],n()}}}}class y2 extends g2{static id="base-modal";title="";#e={};connectedCallback(){this.setAttribute("data-form-provider",""),this.render(),this.bind()}bind(){this.handleEvents("click",this.onClickHandlers)}get onClickHandlers(){return{close:this.close}}get model(){return this.#e}get data(){return this.#e}set data(e){this.#e=e}get fields(){return[]}close(){e2()}renderBody(){return""}renderActions(){return null}render(){const e=this.renderActions();this.innerHTML=`<div class="modal">
                <div class="modal-title-bar">
                    <div>${this.title}</div>
                    <div class="close-modal">
                        <sl-icon name="x-lg" data-click-action="close"></sl-icon>
                    </div>
                </div>
                <div class="modal-body">${this.renderBody()}</div>
                ${e&&`<div class="modal-actions">${e}</div>`}
            </div>`}}v2();w2();function v2(){ia("/shoelace")}function w2(){window.CardMagicianModule=Jv,window.CardMagicianGame=t2,window.Modal=y2}function x2(){const t=document.createElement("cm-title-bar");document.body.prepend(t),document.querySelector("main").innerHTML=`<cm-display-card></cm-display-card>
         <cm-set-view></cm-set-view>
         <cm-card-form></cm-card-form>`}async function _2(){if(await X1()){await m2(),await b2();return}await Xv(),await Gv("magic"),await Bv(),await Ys.preload(),x2()}_2();
