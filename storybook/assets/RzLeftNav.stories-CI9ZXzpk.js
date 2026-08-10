import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./RzLink-Z0E7Coq9.js";var i,a;function o(){return(o=e((()=>{i=`_rz-left-nav_hpyba_1`,a={"rz-left-nav":`_rz-left-nav_hpyba_1`,rzLeftNav:i}})))()}function s({navItems:e,userPermissions:t}){return(0,c.jsx)(`nav`,{className:a.rzLeftNav,children:(0,c.jsx)(`ul`,{children:e.map(e=>(0,c.jsx)(`li`,{children:(0,c.jsx)(r,{userPermissions:t,...e},e.href)},e.href))})})}var c;function l(){return(l=e((()=>{n(),o(),c=t(),s.__docgenInfo={description:``,methods:[],displayName:`RzLeftNav`,props:{navItems:{required:!0,tsType:{name:`Array`,elements:[{name:`RzLinkType`}],raw:`RzLinkType[]`},description:``},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})))()}var u,d,f,p,m,h;function g(){return(g=e((()=>{l(),u={component:s},d=[{href:`/recipes`,label:`Recipes`,requiredPermission:`recipes:read`},{href:`/ingredients`,label:`Ingredients`,requiredPermission:`ingredients:read`},{href:`/seasons`,label:`Seasons`,requiredPermission:`seasons:read`},{href:`/profile`,label:`Profile`,requiredPermission:`profile:read`},{href:`/admin/users`,label:`Users`,requiredPermission:`users:read`}],f={args:{navItems:d,userPermissions:[`recipes:read`,`ingredients:read`,`seasons:read`,`profile:read`,`users:read`]}},p={args:{navItems:d,userPermissions:[`recipes:read`,`ingredients:read`,`seasons:read`,`profile:read`]}},m={args:{navItems:d,userPermissions:[]}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    navItems: allNavItems,
    userPermissions: ['recipes:read', 'ingredients:read', 'seasons:read', 'profile:read', 'users:read']
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    navItems: allNavItems,
    userPermissions: ['recipes:read', 'ingredients:read', 'seasons:read', 'profile:read']
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    navItems: allNavItems,
    userPermissions: []
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`PartialPermissions`,`Empty`]})))()}g();export{f as Default,m as Empty,p as PartialPermissions,h as __namedExportsOrder,u as default};