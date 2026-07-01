import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./RzLink-Dhnvj9EE.js";function i({title:e,body:t,actions:n,userPermissions:i}){return(0,a.jsxs)(`div`,{className:`rz-card`,children:[(0,a.jsx)(`div`,{className:`rz-card-title`,children:e}),t&&(0,a.jsx)(`div`,{className:`rz-card-body`,children:t}),(0,a.jsx)(`div`,{className:`rz-card-actions`,children:n.map(e=>(0,a.jsx)(r,{permissions:i,...e},e.href))})]})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`RzCard`,props:{title:{required:!0,tsType:{name:`string`},description:``},body:{required:!1,tsType:{name:`union`,raw:`string | React.ReactNode`,elements:[{name:`string`},{name:`ReactReactNode`,raw:`React.ReactNode`}]},description:``},actions:{required:!0,tsType:{name:`Array`,elements:[{name:`RzLinkType`}],raw:`RzLinkType[]`},description:``},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})),s,c,l,u;e((()=>{o(),s={component:i},c={args:{title:`Summer Pasta`,actions:[{href:`#`,label:`View`,requiredPermission:`__controls:read`}]}},l={args:{title:`Summer Pasta`,body:`A light and fresh pasta dish with seasonal vegetables.`,actions:[{href:`#`,label:`View`,requiredPermission:`__controls:read`}]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    actions: [{
      href: '#',
      label: 'View',
      requiredPermission: '__controls:read'
    }]
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    body: 'A light and fresh pasta dish with seasonal vegetables.',
    actions: [{
      href: '#',
      label: 'View',
      requiredPermission: '__controls:read'
    }]
  }
}`,...l.parameters?.docs?.source}}},u=[`Default`,`WithBody`]}))();export{c as Default,l as WithBody,u as __namedExportsOrder,s as default};