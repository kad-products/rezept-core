import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./RzLink-DOB7efEQ.js";import{A as i,f as a,g as o,h as s,k as c,m as l,p as u,t as d}from"./dist-BUKxH0Hq.js";var f,p,m=e((()=>{f=`_rz-pop-menu_8a4sq_1`,p={"rz-pop-menu":`_rz-pop-menu_8a4sq_1`,rzPopMenu:f}}));function h({items:e,userPermissions:t}){let n=e.filter(e=>!(e.requiredPermission&&!t?.includes(e.requiredPermission)));return n.length===0?null:(0,g.jsxs)(s,{children:[(0,g.jsx)(o,{className:p.rzPopMenu,asChild:!0,children:(0,g.jsx)(`button`,{type:`button`,"aria-label":`Menu Label`,children:(0,g.jsx)(c,{})})}),(0,g.jsx)(l,{children:(0,g.jsx)(a,{children:n.map(e=>{let{key:n,...i}=e;return(0,g.jsx)(u,{asChild:!0,children:(0,g.jsx)(r,{userPermissions:t,...i})},e.href)})})})]})}var g,_=e((()=>{i(),d(),n(),m(),g=t(),h.__docgenInfo={description:``,methods:[],displayName:`RzPopMenu`,props:{items:{required:!0,tsType:{name:`Array`,elements:[{name:`RzLinkType`}],raw:`RzLinkType[]`},description:``},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})),v,y,b,x,S,C,w;e((()=>{_(),v={component:h,parameters:{layout:`centered`}},y=[{href:`/recipes/1`,label:`View`,requiredPermission:`__controls:read`},{href:`/recipes/1/edit`,label:`Edit`,requiredPermission:`recipes:update`},{href:`/recipes/1/delete`,label:`Delete`,requiredPermission:`recipes:delete`}],b={args:{items:y,userPermissions:[`__controls:read`,`recipes:update`,`recipes:delete`]}},x={args:{items:y,userPermissions:[`__controls:read`]}},S={args:{items:y,userPermissions:[]}},C={args:{items:[{href:`/recipes/1`,label:`View Recipe`,requiredPermission:`__controls:read`}],userPermissions:[`__controls:read`]}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    items: allItems,
    userPermissions: ['__controls:read', 'recipes:update', 'recipes:delete']
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    items: allItems,
    userPermissions: ['__controls:read']
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    items: allItems,
    userPermissions: []
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      href: '/recipes/1',
      label: 'View Recipe',
      requiredPermission: '__controls:read' as const
    }],
    userPermissions: ['__controls:read']
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`PartialPermissions`,`AllHidden`,`SingleItem`]}))();export{S as AllHidden,b as Default,x as PartialPermissions,C as SingleItem,w as __namedExportsOrder,v as default};