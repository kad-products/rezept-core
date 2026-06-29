import{j as e}from"./jsx-runtime-u17CrQMm.js";import{R as d}from"./RzLink-BpQG8Ire.js";function n({title:i,body:s,actions:o}){return e.jsxs("div",{className:"rz-card",children:[e.jsx("div",{className:"rz-card-title",children:i}),s&&e.jsx("div",{className:"rz-card-body",children:s}),e.jsx("div",{className:"rz-card-actions",children:o.map(t=>e.jsx(d,{...t},t.href))})]})}n.__docgenInfo={description:"",methods:[],displayName:"RzCard",props:{title:{required:!0,tsType:{name:"string"},description:""},body:{required:!1,tsType:{name:"union",raw:"string | React.ReactNode",elements:[{name:"string"},{name:"ReactReactNode",raw:"React.ReactNode"}]},description:""},actions:{required:!0,tsType:{name:"Array",elements:[{name:"RzLinkType"}],raw:"RzLinkType[]"},description:""}}};const l={component:n},r={args:{title:"Summer Pasta",actions:[{href:"#",label:"View",requiredPermission:"__controls:read"}]}},a={args:{title:"Summer Pasta",body:"A light and fresh pasta dish with seasonal vegetables.",actions:[{href:"#",label:"View",requiredPermission:"__controls:read"}]}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    actions: [{
      href: '#',
      label: 'View',
      requiredPermission: '__controls:read'
    }]
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    body: 'A light and fresh pasta dish with seasonal vegetables.',
    actions: [{
      href: '#',
      label: 'View',
      requiredPermission: '__controls:read'
    }]
  }
}`,...a.parameters?.docs?.source}}};const p=["Default","WithBody"];export{r as Default,a as WithBody,p as __namedExportsOrder,l as default};
